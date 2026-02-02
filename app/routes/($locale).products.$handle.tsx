import {Await, useLoaderData} from 'react-router';
import type {Route} from './+types/products.$handle';
import {Suspense} from 'react';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {ProductPrice} from '~/components/product/ProductPrice';
import {ProductForm} from '~/components/product/ProductForm';
import {ProductGallery} from '~/components/product/ProductGallery';
import {TrustBadges} from '~/components/product/TrustBadges';
import {RelatedProducts} from '~/components/product/RelatedProducts';
import {Breadcrumbs} from '~/components/ui/Breadcrumbs';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {RatingBadge} from '~/components/reviews/RatingBadge';
import {JsonLd} from '~/components/seo/JsonLd';
import {getJudgeMeClient} from '~/lib/judgeme.server';
import {extractProductId} from '~/lib/judgeme';
import type {RelatedProductsQuery} from 'storefrontapi.generated';

export const meta: Route.MetaFunction = ({data}) => {
  const product = data?.product;
  const reviewsSummary = data?.reviewsSummary;

  if (!product) {
    return [{title: 'Product Not Found'}];
  }

  return [
    {title: `${product.title} | Recovery Token Store`},
    {name: 'description', content: product.description},
    {
      tagName: 'link',
      rel: 'canonical',
      href: `https://recoverytoken.store/products/${product.handle}`,
    },

    // OpenGraph
    {property: 'og:type', content: 'product'},
    {property: 'og:title', content: product.title},
    {property: 'og:description', content: product.description},
    {
      property: 'og:image',
      content: product.selectedOrFirstAvailableVariant?.image?.url,
    },
    {
      property: 'og:url',
      content: `https://recoverytoken.store/products/${product.handle}`,
    },

    // Twitter Card
    {name: 'twitter:card', content: 'summary_large_image'},
    {name: 'twitter:title', content: product.title},
    {name: 'twitter:description', content: product.description},
    {
      name: 'twitter:image',
      content: product.selectedOrFirstAvailableVariant?.image?.url,
    },

    // Product-specific meta
    {
      property: 'product:price:amount',
      content: product.selectedOrFirstAvailableVariant?.price.amount,
    },
    {
      property: 'product:price:currency',
      content: product.selectedOrFirstAvailableVariant?.price.currencyCode,
    },
  ];
};

export async function loader(args: Route.LoaderArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront, env} = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  // Fetch product and reviews summary in parallel
  const [{product}, reviewsSummary] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    }),
    // Fetch reviews summary for rating badge and SEO (non-blocking failure)
    env.JUDGEME_PUBLIC_TOKEN 
      ? fetchReviewsSummary(context, handle).catch((error) => {
          console.error('Failed to fetch reviews summary:', error);
          return null;
        })
      : Promise.resolve(null),
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  // The API handle might be localized, so redirect to the localized handle
  redirectIfHandleIsLocalized(request, {handle, data: product});

  return {
    product,
    reviewsSummary,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context, params}: Route.LoaderArgs) {
  const {env} = context;
  const hasJudgeme = !!env.JUDGEME_PUBLIC_TOKEN;

  // Fetch related products (deferred - doesn't block initial render)
  const relatedProducts = context.storefront
    .query(RELATED_PRODUCTS_QUERY)
    .catch((error: Error) => {
      console.error('Failed to fetch related products:', error);
      return null;
    });

  // Fetch product reviews (deferred - doesn't block initial render)
  const productReviews = hasJudgeme && params.handle
    ? fetchProductReviews(context, params.handle).catch((error: Error) => {
        console.error('Failed to fetch product reviews:', error);
        return null;
      })
    : Promise.resolve(null);

  return {hasJudgeme, relatedProducts, productReviews};
}

/**
 * Fetch product reviews from Judge.me API
 */
async function fetchProductReviews(context: Route.LoaderArgs['context'], handle: string) {
  const {storefront, env} = context;
  const shopDomain = env.PUBLIC_JUDGEME_SHOP_DOMAIN || env.PUBLIC_STORE_DOMAIN;

  if (!env.JUDGEME_PUBLIC_TOKEN || !shopDomain) {
    return null;
  }

  try {
    // Get product ID
    const {product} = await storefront.query(
      `#graphql
        query ProductId($handle: String!) {
          product(handle: $handle) {
            id
          }
        }
      `,
      {variables: {handle}}
    );

    if (!product?.id) {
      return null;
    }

    const productId = extractProductId(product.id);

    const params = new URLSearchParams({
      shop_domain: shopDomain,
      api_token: env.JUDGEME_PUBLIC_TOKEN,
      external_id: productId,
      per_page: '10',
      page: '1',
    });

    const response = await fetch(
      `https://judge.me/api/v1/reviews?${params}`
    );

    if (!response.ok) {
      throw new Error(`Judge.me API error: ${response.status}`);
    }

    const data = (await response.json()) as {
      reviews?: Array<{
        id: string;
        title: string;
        body: string;
        rating: number;
        created_at: string;
        reviewer: {
          name: string;
          verified: boolean;
        };
      }>;
      total?: number;
    };

    return {
      reviews: data.reviews || [],
      total: data.total || 0,
    };
  } catch (error) {
    console.error('Judge.me API error:', error);
    return null;
  }
}

/**
 * Fetch reviews summary from Judge.me
 * Non-blocking - errors are caught in loadDeferredData
 */
async function fetchReviewsSummary(context: Route.LoaderArgs['context'], handle: string) {
  const {storefront, env} = context;

  // Check if Judge.me is configured
  if (!env.JUDGEME_PUBLIC_TOKEN) {
    console.warn('Judge.me not configured - skipping reviews');
    return null;
  }

  try {
    // Get product ID
    const {product} = await storefront.query(
      `#graphql
        query ProductId($handle: String!) {
          product(handle: $handle) {
            id
          }
        }
      `,
      {variables: {handle}}
    );

    if (!product?.id) {
      return null;
    }

    // Fetch reviews from Judge.me
    const judgeme = getJudgeMeClient(env);
    const productId = extractProductId(product.id);
    const summary = await judgeme.getRatingSummary(productId);

    return summary;
  } catch (error) {
    // Log but don't throw - reviews are non-critical
    console.error('Judge.me API error:', error);
    return null;
  }
}

export default function Product() {
  const {product, reviewsSummary, hasJudgeme, relatedProducts, productReviews} = useLoaderData<typeof loader>();

  // Optimistically selects a variant with given available variant information
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  // Sets the search param to the selected variant without navigation
  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  // Get the product options array
  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const {title, descriptionHtml, description, vendor, images} = product;
  const productId = extractProductId(product.id);

  // Build breadcrumb items
  const breadcrumbItems = [
    {label: 'Shop', href: '/collections'},
    {label: title},
  ];

  // Build product schema with reviews
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: title,
    description,
    image: selectedVariant?.image?.url,
    sku: selectedVariant?.sku,
    brand: {
      '@type': 'Brand',
      name: vendor || 'Recovery Token Store',
    },
    offers: {
      '@type': 'Offer',
      price: selectedVariant?.price.amount,
      priceCurrency: selectedVariant?.price.currencyCode,
      availability: selectedVariant?.availableForSale
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: `https://recoverytoken.store/products/${product.handle}`,
    },
    aggregateRating: reviewsSummary && reviewsSummary.reviewCount > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: reviewsSummary.rating,
      reviewCount: reviewsSummary.reviewCount,
      bestRating: 5,
      worstRating: 1,
    } : undefined,
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <JsonLd data={productSchema} />

      {/* Main Product Section */}
      <section className="py-8 md:py-12 bg-white">
        <div className="container-standard">
          {/* Breadcrumbs */}
          <Breadcrumbs items={breadcrumbItems} className="mb-8" />

          {/* Two-Column Layout */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
            {/* Left Column - Gallery */}
            <div>
              <ProductGallery 
                images={images?.nodes || []}
                selectedImage={selectedVariant?.image}
              />
            </div>

            {/* Right Column - Product Info */}
            <div className="lg:sticky lg:top-24 lg:self-start space-y-6">
              {/* Eyebrow + Rating - Top of page for immediate visibility */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-accent text-caption uppercase tracking-[0.25em] font-semibold">
                  Recovery Token
                </span>
                <RatingBadge
                  rating={reviewsSummary?.rating ?? 0}
                  reviewCount={reviewsSummary?.reviewCount ?? 0}
                />
              </div>

              {/* Product Title */}
              <h1 className="font-display text-3xl md:text-4xl font-bold text-primary leading-tight">
                {title}
              </h1>

              {/* Price */}
              <ProductPrice
                price={selectedVariant?.price}
                compareAtPrice={selectedVariant?.compareAtPrice}
              />

              {/* Variant Selector & Add to Cart */}
              <ProductForm
                productOptions={productOptions}
                selectedVariant={selectedVariant}
                productTitle={title}
              />

              {/* Trust Badges */}
              <TrustBadges className="pt-4 border-t border-black/5" />

              {/* Description */}
              <div className="pt-6 border-t border-black/5">
                <h2 className="font-display text-lg font-bold text-primary mb-4">
                  About This Token
                </h2>
                <div 
                  className="text-body text-secondary leading-relaxed prose prose-sm"
                  dangerouslySetInnerHTML={{__html: descriptionHtml}} 
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-16 md:py-20 bg-surface">
        <div className="container-standard">
          <div className="text-center mb-12">
            <span className="inline-block text-accent text-caption uppercase tracking-[0.25em] font-semibold mb-4">
              Testimonials
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary">
              Customer Reviews
            </h2>
          </div>
          <Suspense fallback={<ProductReviewsSkeleton />}>
            <Await resolve={productReviews}>
              {(resolvedReviews) => {
                if (!resolvedReviews || resolvedReviews.reviews.length === 0) {
                  return <ProductEmptyReviewsState productTitle={title} />;
                }
                return <ProductReviewsGrid reviews={resolvedReviews.reviews} />;
              }}
            </Await>
          </Suspense>
        </div>
      </section>

      {/* Related Products Section */}
      <Suspense fallback={null}>
        <Await resolve={relatedProducts}>
          {(resolvedProducts: RelatedProductsQuery | null) => 
            resolvedProducts && (
              <RelatedProducts 
                products={resolvedProducts.products.nodes}
                currentProductId={product.id}
              />
            )
          }
        </Await>
      </Suspense>

      {/* Analytics */}
      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </>
  );
}

/**
 * Reviews Skeleton - Loading state for product reviews
 */
function ProductReviewsSkeleton() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({length: 3}).map((_, i) => (
        <div 
          key={i} 
          className="bg-white rounded-2xl p-6 shadow-sm border border-black/5"
          style={{
            animation: `pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
            animationDelay: `${i * 150}ms`,
          }}
        >
          {/* Stars skeleton - star shapes */}
          <div className="flex gap-1.5 mb-5">
            {Array.from({length: 5}).map((_, j) => (
              <div 
                key={j} 
                className="w-5 h-5 bg-gradient-to-br from-gray-200 to-gray-100 rounded-sm"
                style={{
                  clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                }}
              />
            ))}
          </div>
          {/* Title skeleton */}
          <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg w-2/3 mb-4" />
          {/* Text skeleton */}
          <div className="space-y-2.5 mb-6">
            <div className="h-3.5 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-md w-full" />
            <div className="h-3.5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-md w-11/12" />
            <div className="h-3.5 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-md w-4/5" />
          </div>
          {/* Author skeleton */}
          <div className="flex items-center gap-3 pt-5 border-t border-gray-100">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-gray-200 to-gray-100" />
            <div className="flex-1">
              <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-100 rounded w-24 mb-2" />
              <div className="h-3 bg-gradient-to-r from-gray-100 to-gray-200 rounded w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Empty Reviews State - Beautiful placeholder when no reviews exist
 */
function ProductEmptyReviewsState({productTitle}: {productTitle: string}) {
  return (
    <div style={{padding: '3rem 1rem', textAlign: 'center', width: '100%'}}>
      {/* Stars Card */}
      <div style={{display: 'inline-block', position: 'relative', marginBottom: '2.5rem'}}>
        <div style={{
          position: 'absolute',
          inset: '-2rem',
          background: 'rgba(250, 204, 21, 0.15)',
          filter: 'blur(48px)',
          borderRadius: '9999px',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'relative',
          background: 'white',
          borderRadius: '1.5rem',
          padding: '2rem 2.5rem',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
          border: '1px solid rgba(0,0,0,0.05)'
        }}>
          <div style={{display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem'}}>
            {[1, 2, 3, 4, 5].map((n) => (
              <svg key={n} viewBox="0 0 24 24" style={{width: '2.5rem', height: '2.5rem', color: '#facc15', fill: '#facc15'}}>
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem'}}>
            <span style={{fontSize: '2.25rem', fontWeight: 'bold', color: '#1A202C'}}>5.0</span>
            <div style={{textAlign: 'left'}}>
              <p style={{fontSize: '0.875rem', fontWeight: '600', color: '#1A202C', margin: 0}}>Perfect Rating</p>
              <p style={{fontSize: '0.75rem', color: '#4A5568', margin: 0}}>Expected quality</p>
            </div>
          </div>
        </div>
      </div>

      {/* Heading */}
      <h3 style={{
        fontSize: 'clamp(1.5rem, 4vw, 1.875rem)',
        fontWeight: 'bold',
        color: '#1A202C',
        marginBottom: '1rem',
        textAlign: 'center'
      }}>
        Be the First to Share Your Story
      </h3>
      
      {/* Description */}
      <p style={{
        fontSize: '1.125rem',
        color: '#4A5568',
        marginBottom: '2rem',
        maxWidth: '32rem',
        marginLeft: 'auto',
        marginRight: 'auto',
        textAlign: 'center',
        lineHeight: 1.6
      }}>
        No reviews yet for <span style={{fontWeight: '600', color: '#1A202C'}}>{productTitle}</span>. 
        Your experience matters—help others find meaning in their recovery journey.
      </p>
      
      {/* Feature badges */}
      <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1.5rem', fontSize: '0.875rem', color: '#4A5568'}}>
        <span style={{display: 'inline-flex', alignItems: 'center', gap: '0.5rem'}}>
          <svg viewBox="0 0 24 24" style={{width: '1.25rem', height: '1.25rem', color: '#B8764F'}} fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="10" />
          </svg>
          Verified buyers
        </span>
        <span style={{display: 'inline-flex', alignItems: 'center', gap: '0.5rem'}}>
          <svg viewBox="0 0 24 24" style={{width: '1.25rem', height: '1.25rem', color: '#B8764F'}} fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          Authentic stories
        </span>
        <span style={{display: 'inline-flex', alignItems: 'center', gap: '0.5rem'}}>
          <svg viewBox="0 0 24 24" style={{width: '1.25rem', height: '1.25rem', color: '#B8764F'}} fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
          Community support
        </span>
      </div>
    </div>
  );
}

/**
 * Reviews Grid - Displays actual product reviews
 */
interface ProductReview {
  id: string;
  title: string;
  body: string;
  rating: number;
  created_at: string;
  reviewer: {
    name: string;
    verified: boolean;
  };
}

function ProductReviewsGrid({reviews}: {reviews: ProductReview[]}) {
  // Format date helper
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {reviews.map((review, index) => (
        <div 
          key={review.id}
          className="bg-white rounded-2xl p-6 shadow-sm border border-black/5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
          style={{
            animation: 'fadeInUp 0.5s ease-out forwards',
            animationDelay: `${index * 100}ms`,
            opacity: 0,
          }}
        >
          {/* Header with rating and date */}
          <div className="flex items-center justify-between mb-4">
            {/* Star rating */}
            <div className="flex gap-0.5">
              {Array.from({length: 5}).map((_, i) => (
                <svg
                  key={i}
                  viewBox="0 0 24 24"
                  className={`w-5 h-5 ${
                    i < review.rating
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-200 fill-gray-200'
                  }`}
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
            {/* Date */}
            {review.created_at && (
              <span className="text-xs text-secondary/60">
                {formatDate(review.created_at)}
              </span>
            )}
          </div>
          
          {/* Review title */}
          {review.title && (
            <h4 className="font-display font-bold text-primary text-lg mb-2 line-clamp-1">
              {review.title}
            </h4>
          )}
          
          {/* Review body */}
          <p className="text-body-sm text-secondary leading-relaxed mb-5 line-clamp-4 min-h-[5rem]">
            "{review.body}"
          </p>
          
          {/* Reviewer info */}
          <div className="flex items-center gap-3 pt-4 border-t border-black/5">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-display font-bold text-sm shadow-sm">
              {review.reviewer.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-primary truncate">
                {review.reviewer.name}
              </div>
              {review.reviewer.verified ? (
                <div className="flex items-center gap-1.5 text-xs text-accent font-medium">
                  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 flex-shrink-0" stroke="currentColor" strokeWidth="2.5">
                    <path d="M9 12l2 2 4-4" />
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                  Verified Buyer
                </div>
              ) : (
                <div className="text-xs text-secondary/60">Customer</div>
              )}
            </div>
          </div>
        </div>
      ))}
      
      {/* CSS Animation */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// Environment variable for Judge.me shop domain
const PUBLIC_JUDGEME_SHOP_DOMAIN = 'recovery-token-store.myshopify.com';

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
` as const;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    encodedVariantExistence
    encodedVariantAvailability
    images(first: 10) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
` as const;

const RELATED_PRODUCTS_QUERY = `#graphql
  fragment RelatedProduct on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      id
      url
      altText
      width
      height
    }
  }
  query RelatedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 8, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RelatedProduct
      }
    }
  }
` as const;
