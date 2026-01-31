import {redirect, useLoaderData} from 'react-router';
import type {Route} from './+types/products.$handle';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {ProductPrice} from '~/components/product/ProductPrice';
import {ProductImage} from '~/components/product/ProductImage';
import {ProductForm} from '~/components/product/ProductForm';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {RatingBadge} from '~/components/reviews/RatingBadge';
import {ReviewsWidget} from '~/components/reviews/ReviewsWidget';
import {ReviewsFallback} from '~/components/reviews/ReviewsFallback';
import {JsonLd} from '~/components/seo/JsonLd';
import {getJudgeMeClient} from '~/lib/judgeme.server';
import {extractProductId} from '~/lib/judgeme';
import {ErrorBoundary} from 'react-error-boundary';

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
  const {storefront} = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  // The API handle might be localized, so redirect to the localized handle
  redirectIfHandleIsLocalized(request, {handle, data: product});

  return {
    product,
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

  // Fetch reviews summary for rating badge and SEO (only if configured)
  const reviewsSummary = hasJudgeme 
    ? fetchReviewsSummary(context, params.handle!).catch(
        (error) => {
          console.error('Failed to fetch reviews summary:', error);
          return null; // Non-blocking - continue without reviews
        }
      )
    : Promise.resolve(null);

  return {reviewsSummary, hasJudgeme};
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
  const {product, reviewsSummary, hasJudgeme} = useLoaderData<typeof loader>();

  // Optimistically selects a variant with given available variant information
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  // Sets the search param to the selected variant without navigation
  // only when no search params are set in the url
  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  // Get the product options array
  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const {title, descriptionHtml} = product;
  const productId = extractProductId(product.id);

  // Build product schema with reviews
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: selectedVariant?.image?.url,
    sku: selectedVariant?.sku,
    brand: {
      '@type': 'Brand',
      name: product.vendor || 'Recovery Token Store',
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
    <div className="product">
      {/* JSON-LD Structured Data */}
      <JsonLd data={productSchema} />

      <ProductImage image={selectedVariant?.image} />
      <div className="product-main">
        <h1>{title}</h1>

        {/* Rating Badge */}
        {reviewsSummary && reviewsSummary.reviewCount > 0 && (
          <RatingBadge
            rating={reviewsSummary.rating}
            reviewCount={reviewsSummary.reviewCount}
            className="mb-4"
          />
        )}

        <ProductPrice
          price={selectedVariant?.price}
          compareAtPrice={selectedVariant?.compareAtPrice}
        />
        <br />
        <ProductForm
          productOptions={productOptions}
          selectedVariant={selectedVariant}
        />
        <br />
        <br />
        <p>
          <strong>Description</strong>
        </p>
        <br />
        <div dangerouslySetInnerHTML={{__html: descriptionHtml}} />
        <br />
        <br />

        {/* Reviews Section - Only show if Judge.me is configured */}
        {hasJudgeme && (
          <div className="product-reviews">
            <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
            <ErrorBoundary FallbackComponent={ReviewsFallback}>
              <ReviewsWidget
                productId={productId}
                shopDomain={PUBLIC_JUDGEME_SHOP_DOMAIN}
              />
            </ErrorBoundary>
          </div>
        )}
      </div>
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
