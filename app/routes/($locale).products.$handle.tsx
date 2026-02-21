import {Await, useLoaderData, useFetcher, useSearchParams} from 'react-router';
import type {Route} from './+types/products.$handle';
import {Suspense, useState, useEffect, useMemo} from 'react';
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
import {CUSTOMER_METAFIELDS_QUERY} from '~/graphql/customer-account/CustomerMetafieldsQuery';
import {parseRecoveryCircle} from '~/lib/recoveryCircle';
import {parseWishlist, isInWishlist as checkIsInWishlist} from '~/lib/wishlist';
import {Heart, PenLine} from 'lucide-react';
import {motion} from 'framer-motion';
import {WriteReviewModal} from '~/components/reviews/WriteReviewModal';
import {ProductDetails} from '~/components/product/ProductDetails';
import {buildMeta} from '~/lib/meta';

export const meta: Route.MetaFunction = ({data}) => {
  const product = data?.product;

  if (!product) {
    return [{title: 'Product Not Found'}];
  }

  return buildMeta({
    title: `${product.title} | Coin-plugz`,
    description: product.description,
    ogImage: product.selectedOrFirstAvailableVariant?.image?.url || undefined,
    ogType: 'product',
    url: `/products/${product.handle}`,
    extra: [
      {
        tagName: 'link',
        rel: 'canonical',
        href: `/products/${product.handle}`,
      },
      {
        property: 'product:price:amount',
        content: product.selectedOrFirstAvailableVariant?.price.amount,
      },
      {
        property: 'product:price:currency',
        content: product.selectedOrFirstAvailableVariant?.price.currencyCode,
      },
    ],
  });
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

  // Fetch account data for logged-in users (deferred, non-blocking)
  const recoveryCircleData = fetchAccountData(context, params.handle ?? '').catch(() => null);

  return {hasJudgeme, relatedProducts, productReviews, recoveryCircleData};
}

/**
 * Fetch account data for logged-in users (recovery circle + wishlist)
 * Non-blocking - errors are caught in loadDeferredData
 */
async function fetchAccountData(context: Route.LoaderArgs['context'], productHandle: string) {
  const {customerAccount} = context;

  try {
    const isLoggedIn = await customerAccount.isLoggedIn();
    if (!isLoggedIn) {
      return {circle: [], isLoggedIn: false, isWishlisted: false};
    }

    const {data: metafieldsData} = await customerAccount.query(
      CUSTOMER_METAFIELDS_QUERY,
      {variables: {language: customerAccount.i18n.language}},
    );

    const metafields = metafieldsData?.customer?.metafields ?? [];
    const circleRaw = metafields?.find((m: any) => m?.key === 'recovery_circle')?.value ?? '[]';
    const circle = parseRecoveryCircle(circleRaw);

    const wishlistRaw = metafields?.find((m: any) => m?.key === 'wishlist')?.value ?? null;
    const wishlist = parseWishlist(wishlistRaw);
    const isWishlisted = checkIsInWishlist(wishlist, productHandle);

    return {circle, isLoggedIn: true, isWishlisted};
  } catch {
    return {circle: [], isLoggedIn: false, isWishlisted: false};
  }
}

/**
 * Fetch product reviews from Judge.me API
 */
async function fetchProductReviews(context: Route.LoaderArgs['context'], handle: string) {
  const {storefront, env} = context;
  const shopDomain = env.PUBLIC_JUDGEME_SHOP_DOMAIN || env.PUBLIC_STORE_DOMAIN;

  // GET /reviews requires the private token (public token lacks permissions)
  if (!env.JUDGEME_PRIVATE_TOKEN || !shopDomain) {
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

    const externalId = Number(extractProductId(product.id));

    // Fetch all reviews for the shop, then filter by product external ID.
    // The GET /reviews endpoint only filters by Judge.me internal product_id,
    // not Shopify external_id, so we filter client-side.
    const params = new URLSearchParams({
      shop_domain: shopDomain,
      api_token: env.JUDGEME_PRIVATE_TOKEN,
      per_page: '50',
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
        id: number;
        title: string;
        body: string;
        rating: number;
        created_at: string;
        product_external_id: number;
        published: boolean;
        hidden: boolean;
        curated: string;
        reviewer: {
          name: string;
          verified?: string;
        };
      }>;
    };

    // Filter to only published reviews for this specific product
    const productReviews = (data.reviews || [])
      .filter(
        (r) =>
          r.product_external_id === externalId &&
          r.published &&
          !r.hidden &&
          r.curated !== 'spam',
      )
      .map((r) => ({
        id: String(r.id),
        title: r.title,
        body: r.body,
        rating: r.rating,
        created_at: r.created_at,
        reviewer: {
          name: r.reviewer.name,
          verified: r.reviewer.verified === 'buyer' || r.reviewer.verified === 'confirmed-buyer',
        },
      }));

    return {
      reviews: productReviews,
      total: productReviews.length,
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

    // If widget parsing returned 0 reviews, try REST API as fallback
    if (summary.reviewCount === 0) {
      try {
        const summaries = await judgeme.getShopReviewsSummaries();
        const numericId = Number(productId);
        const restSummary = summaries.get(numericId);
        if (restSummary && restSummary.reviewCount > 0) {
          return restSummary;
        }
      } catch {
        // Fall through to widget result
      }
    }

    return summary;
  } catch (error) {
    // Log but don't throw - reviews are non-critical
    console.error('Judge.me API error:', error);
    return null;
  }
}

/**
 * Normalize a string for comparison (lowercase, replace spaces with hyphens)
 */
function normalizeForComparison(str: string): string {
  return str.toLowerCase().trim().replace(/\s+/g, '-');
}

/**
 * Check if an altText contains a matching option tag
 * Supports formats like: "color:bronze", "Color:Bronze", "color:full-spectrum", "color:full spectrum"
 */
function altTextMatchesOption(altText: string, optionName: string, optionValue: string): boolean {
  const normalizedAltText = altText.toLowerCase();
  const normalizedOptionName = normalizeForComparison(optionName);
  const normalizedOptionValue = normalizeForComparison(optionValue);
  const optionValueLower = optionValue.toLowerCase().trim();

  // Build regex pattern: optionName:optionValue (with flexible spacing and separators)
  // Matches: "color:bronze", "color: bronze", "color:full-spectrum", "color:full spectrum"
  const patterns = [
    // Match with hyphenated value: "color:full-spectrum"
    new RegExp(`${normalizedOptionName}\\s*:\\s*${normalizedOptionValue}(?:\\s|,|$)`, 'i'),
    // Match with spaces in value: "color:full spectrum"
    new RegExp(`${normalizedOptionName}\\s*:\\s*${optionValueLower}(?:\\s|,|$)`, 'i'),
  ];

  return patterns.some(pattern => pattern.test(normalizedAltText));
}

/**
 * Get images for the selected variant based on variant options
 * Groups images by:
 * 1. Direct variant image assignment
 * 2. AltText tags (e.g., "color:bronze", "size:large", "customization:years-only")
 *
 * AltText format: "optionName:optionValue" (case-insensitive, spaces or hyphens)
 * Examples: "color:bronze", "Color:Full Spectrum", "color:full-spectrum"
 */
function getVariantImages(
  allImages: Array<{id?: string; url: string; altText?: string | null; width?: number; height?: number}>,
  variants: Array<{
    image?: {id: string} | null;
    selectedOptions: Array<{name: string; value: string}>;
  }>,
  selectedVariant: {selectedOptions: Array<{name: string; value: string}>} | null
) {
  if (!variants || variants.length === 0 || !selectedVariant || !selectedVariant.selectedOptions.length) {
    return allImages;
  }

  // If no images have option-specific altText tags, skip filtering entirely.
  // This handles products that haven't been set up with per-variant image tagging.
  const hasTaggedImages = allImages.some(img =>
    img.altText && selectedVariant.selectedOptions.some(opt =>
      img.altText!.toLowerCase().includes(normalizeForComparison(opt.name) + ':')
    )
  );
  if (!hasTaggedImages) {
    return allImages;
  }

  // Build a set of image IDs directly assigned to variants with matching options
  const matchingImageIds = new Set<string>();

  // Check each variant to see if it matches the selected variant's options
  for (const variant of variants) {
    // Check if this variant matches all selected options
    const allOptionsMatch = selectedVariant.selectedOptions.every(selectedOpt => {
      const variantOpt = variant.selectedOptions.find(
        vo => normalizeForComparison(vo.name) === normalizeForComparison(selectedOpt.name)
      );
      return variantOpt && normalizeForComparison(variantOpt.value) === normalizeForComparison(selectedOpt.value);
    });

    if (allOptionsMatch && variant.image?.id) {
      matchingImageIds.add(variant.image.id);
    }
  }

  // Filter images by:
  // 1. Direct variant assignment (image ID matches)
  // 2. AltText tags matching ANY of the selected variant's options
  const filteredImages = allImages.filter(img => {
    // Check if image is directly assigned to a matching variant
    if (img.id && matchingImageIds.has(img.id)) {
      return true;
    }

    // Check altText for option tags
    if (img.altText) {
      // Image matches if its altText contains ANY of the selected variant's option tags
      // This allows tagging images with just "color:bronze" without needing all options
      return selectedVariant.selectedOptions.some(opt =>
        altTextMatchesOption(img.altText!, opt.name, opt.value)
      );
    }

    return false;
  });

  // If filtering results in empty array, return all images as fallback
  return filteredImages.length > 0 ? filteredImages : allImages;
}

export default function Product() {
  const {product, reviewsSummary, hasJudgeme, relatedProducts, productReviews, recoveryCircleData} = useLoaderData<typeof loader>();

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

  // Review modal state
  const [searchParams] = useSearchParams();
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  // Auto-open review modal when ?writeReview=true is in URL
  useEffect(() => {
    if (searchParams.get('writeReview') === 'true') {
      setReviewModalOpen(true);
    }
  }, [searchParams]);

  const {title, descriptionHtml, description, vendor, images, variants} = product;

  // Filter images to show only those for the selected variant's options
  const variantImages = getVariantImages(
    images?.nodes || [],
    variants?.nodes || [],
    selectedVariant
  );
  const productId = extractProductId(product.id);

  // Build breadcrumb items
  const breadcrumbItems = [
    {label: 'Shop', href: '/collections/all'},
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
      name: vendor || 'Coin-plugz',
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
      <section className="py-8 md:py-12">
        <div className="container-standard">
          {/* Breadcrumbs */}
          <Breadcrumbs items={breadcrumbItems} className="mb-8" />

          {/* Two-Column Layout */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
            {/* Left Column - Gallery + Description */}
            <div>
              <ProductGallery
                images={variantImages}
                selectedImage={selectedVariant?.image}
              />

              {/* Product Details - Desktop only (below gallery on left side) */}
              <div className="hidden lg:block mt-8 pt-6 border-t border-white/[0.08]">
                <ProductDetails
                  descriptionHtml={descriptionHtml}
                  productTitle={title}
                />
              </div>
            </div>

            {/* Right Column - Product Info */}
            <div className="lg:sticky lg:top-24 lg:self-start space-y-6">
              {/* Eyebrow */}
              <span className="inline-block text-accent text-caption uppercase tracking-[0.25em] font-semibold">
                Recovery Token
              </span>

              {/* Product Title */}
              <h1 className="font-display text-3xl md:text-4xl font-bold text-white leading-tight">
                {title}
              </h1>

              {/* Star Rating - Below title for visibility */}
              <RatingBadge
                rating={reviewsSummary?.rating ?? 0}
                reviewCount={reviewsSummary?.reviewCount ?? 0}
              />

              {/* Price + Wishlist */}
              <div className="flex items-center justify-between">
                <ProductPrice
                  price={selectedVariant?.price}
                  compareAtPrice={selectedVariant?.compareAtPrice}
                />
                <Suspense fallback={null}>
                  <Await resolve={recoveryCircleData}>
                    {(resolvedData) =>
                      resolvedData?.isLoggedIn ? (
                        <WishlistButton
                          productHandle={product.handle}
                          isWishlisted={resolvedData.isWishlisted}
                        />
                      ) : null
                    }
                  </Await>
                </Suspense>
              </div>

              {/* Variant Selector & Add to Cart */}
              <Suspense
                fallback={
                  <ProductForm
                    productOptions={productOptions}
                    selectedVariant={selectedVariant}
                    productTitle={title}
                  />
                }
              >
                <Await resolve={recoveryCircleData}>
                  {(resolvedCircleData) => (
                    <ProductForm
                      productOptions={productOptions}
                      selectedVariant={selectedVariant}
                      productTitle={title}
                      recoveryCircle={resolvedCircleData?.circle ?? []}
                      isLoggedIn={resolvedCircleData?.isLoggedIn ?? false}
                    />
                  )}
                </Await>
              </Suspense>

              {/* Trust Badges */}
              <TrustBadges className="pt-4 border-t border-white/[0.08]" />

              {/* Product Details - Mobile only (in right column below trust badges) */}
              <div className="lg:hidden pt-6 border-t border-white/[0.08]">
                <ProductDetails
                  descriptionHtml={descriptionHtml}
                  productTitle={title}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <Suspense fallback={
        <section className="py-20 md:py-28 bg-black overflow-hidden">
          <ProductReviewsSkeleton />
        </section>
      }>
        <Await resolve={productReviews}>
          {(resolvedReviews) => {
            const hasReviews = resolvedReviews && resolvedReviews.reviews.length > 0;
            const actualCount = hasReviews ? resolvedReviews.reviews.length : 0;
            return (
              <ProductReviewsSection
                hasReviews={!!hasReviews}
                reviews={hasReviews ? resolvedReviews.reviews : []}
                rating={reviewsSummary?.rating ?? 0}
                reviewCount={actualCount || (reviewsSummary?.reviewCount ?? 0)}
                productTitle={title}
                onWriteReview={() => setReviewModalOpen(true)}
              />
            );
          }}
        </Await>
      </Suspense>

      {/* Gradient transition to Related Products */}
      <div className="mt-12 h-24 md:h-32" style={{background: 'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.03) 50%, rgba(255,255,255,0.05) 100%)'}} />

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

      {/* Gradient transition out of Related Products */}
      <div className="h-24 md:h-32" style={{background: 'linear-gradient(to bottom, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.03) 50%, transparent 100%)'}} />

      {/* Write Review Modal */}
      <WriteReviewModal
        open={reviewModalOpen}
        onOpenChange={setReviewModalOpen}
        productId={productId}
        productHandle={product.handle}
        productTitle={title}
      />

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
 * WishlistButton - Heart toggle for saving products
 */
function WishlistButton({
  productHandle,
  isWishlisted,
}: {
  productHandle: string;
  isWishlisted: boolean;
}) {
  const fetcher = useFetcher();
  const [optimisticState, setOptimisticState] = useState(isWishlisted);

  // Determine display state: use optimistic state, but sync when fetcher completes
  const isSaved =
    fetcher.state === 'idle' ? isWishlisted : optimisticState;

  const handleClick = () => {
    const nextState = !isSaved;
    setOptimisticState(nextState);
    fetcher.submit(
      {
        formAction: nextState ? 'add' : 'remove',
        productHandle,
      },
      {method: 'POST', action: '/account/wishlist'},
    );
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`p-2 rounded-full transition-all duration-200 ${
        isSaved
          ? 'text-accent hover:text-accent/80'
          : 'text-white/50 hover:text-accent'
      }`}
      aria-label={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
    >
      <Heart
        className="w-6 h-6"
        fill={isSaved ? 'currentColor' : 'none'}
        strokeWidth={isSaved ? 0 : 2}
      />
    </button>
  );
}

/**
 * Reviews Skeleton - Loading state for product reviews
 */
function ProductReviewsSkeleton() {
  return (
    <div className="relative overflow-hidden">
      <div className="flex gap-6 px-6">
        {Array.from({length: 4}).map((_, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-[340px] md:w-[420px] rounded-2xl p-7 md:p-8 border border-white/[0.08]"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
              animation: `pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
              animationDelay: `${i * 150}ms`,
            }}
          >
            {/* Stars skeleton */}
            <div className="flex gap-1.5 mb-5">
              {Array.from({length: 5}).map((_, j) => (
                <div
                  key={j}
                  className="w-5 h-5 bg-gradient-to-br from-white/10 to-white/5 rounded-sm"
                  style={{
                    clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                  }}
                />
              ))}
            </div>
            {/* Text skeleton */}
            <div className="space-y-2.5 mb-6">
              <div className="h-3.5 bg-gradient-to-r from-white/5 via-white/10 to-white/5 rounded-md w-full" />
              <div className="h-3.5 bg-gradient-to-r from-white/10 via-white/5 to-white/10 rounded-md w-11/12" />
              <div className="h-3.5 bg-gradient-to-r from-white/5 via-white/10 to-white/5 rounded-md w-4/5" />
            </div>
            {/* Author skeleton */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/10 to-white/5" />
              <div className="flex-1">
                <div className="h-4 bg-gradient-to-r from-white/10 to-white/5 rounded w-24 mb-2" />
                <div className="h-3 bg-gradient-to-r from-white/5 to-white/10 rounded w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Empty Reviews State - Beautiful placeholder when no reviews exist
 */
function ProductEmptyReviewsState({productTitle, onWriteReview}: {productTitle: string; onWriteReview?: () => void}) {
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
          background: 'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)',
          borderRadius: '1.5rem',
          padding: '2rem 2.5rem',
          border: '1px solid rgba(255,255,255,0.08)'
        }}>
          <div style={{display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem'}}>
            {[1, 2, 3, 4, 5].map((n) => (
              <svg key={n} viewBox="0 0 24 24" style={{width: '2.5rem', height: '2.5rem', color: '#facc15', fill: '#facc15'}}>
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem'}}>
            <span style={{fontSize: '2.25rem', fontWeight: 'bold', color: '#FFFFFF'}}>5.0</span>
            <div style={{textAlign: 'left'}}>
              <p style={{fontSize: '0.875rem', fontWeight: '600', color: '#FFFFFF', margin: 0}}>Perfect Rating</p>
              <p style={{fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', margin: 0}}>Expected quality</p>
            </div>
          </div>
        </div>
      </div>

      {/* Heading */}
      <h3 style={{
        fontSize: 'clamp(1.5rem, 4vw, 1.875rem)',
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: '1rem',
        textAlign: 'center'
      }}>
        Be the First to Share Your Story
      </h3>
      
      {/* Description */}
      <p style={{
        fontSize: '1.125rem',
        color: 'rgba(255,255,255,0.5)',
        marginBottom: '2rem',
        maxWidth: '32rem',
        marginLeft: 'auto',
        marginRight: 'auto',
        textAlign: 'center',
        lineHeight: 1.6
      }}>
        No reviews yet for <span style={{fontWeight: '600', color: '#FFFFFF'}}>{productTitle}</span>. 
        Your experience matters—help others find meaning in their recovery journey.
      </p>
      
      {/* Feature badges */}
      <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1.5rem', fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)'}}>
        <span style={{display: 'inline-flex', alignItems: 'center', gap: '0.5rem'}}>
          <svg viewBox="0 0 24 24" style={{width: '1.25rem', height: '1.25rem', color: '#FFFF93'}} fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="10" />
          </svg>
          Verified buyers
        </span>
        <span style={{display: 'inline-flex', alignItems: 'center', gap: '0.5rem'}}>
          <svg viewBox="0 0 24 24" style={{width: '1.25rem', height: '1.25rem', color: '#FFFF93'}} fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          Authentic stories
        </span>
        <span style={{display: 'inline-flex', alignItems: 'center', gap: '0.5rem'}}>
          <svg viewBox="0 0 24 24" style={{width: '1.25rem', height: '1.25rem', color: '#FFFF93'}} fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
          Community support
        </span>
      </div>

      {/* Write the First Review CTA */}
      {onWriteReview && (
        <button
          type="button"
          onClick={onWriteReview}
          style={{
            marginTop: '2rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.75rem',
            backgroundColor: '#FFFF93',
            color: '#000000',
            borderRadius: '9999px',
            fontSize: '0.9375rem',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#a0683f'; e.currentTarget.style.color = '#000000'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#FFFF93'; e.currentTarget.style.color = '#000000'; }}
        >
          Write the First Review
        </button>
      )}
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
          className="rounded-2xl p-6 border border-white/[0.08] hover:border-white/[0.15] hover:-translate-y-1 transition-all duration-300"
          style={{
            background: 'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)',
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
                      : 'text-white/20 fill-white/20'
                  }`}
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
            {/* Date */}
            {review.created_at && (
              <span className="text-xs text-white/40">
                {formatDate(review.created_at)}
              </span>
            )}
          </div>

          {/* Review title */}
          {review.title && (
            <h4 className="font-display font-bold text-white text-lg mb-2 line-clamp-1">
              {review.title}
            </h4>
          )}

          {/* Review body */}
          <p className="text-body-sm text-white/50 leading-relaxed mb-5 line-clamp-4 min-h-[5rem]">
            "{review.body}"
          </p>

          {/* Reviewer info */}
          <div className="flex items-center gap-3 pt-4 border-t border-white/[0.08]">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center text-white font-display font-bold text-sm">
              {review.reviewer.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-white truncate">
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
                <div className="text-xs text-white/40">Customer</div>
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

/**
 * Reviews Section — conditionally renders empty state or reviews with rating header
 */
function ProductReviewsSection({
  hasReviews,
  reviews,
  rating,
  reviewCount,
  productTitle,
  onWriteReview,
}: {
  hasReviews: boolean;
  reviews: ProductReview[];
  rating: number;
  reviewCount: number;
  productTitle: string;
  onWriteReview: () => void;
}) {
  const [showAllReviews, setShowAllReviews] = useState(false);

  if (!hasReviews) {
    // Empty state
    return (
      <section className="py-20 md:py-28 bg-black overflow-hidden">
        <div style={{textAlign: 'center', maxWidth: '42rem', marginLeft: 'auto', marginRight: 'auto', padding: '0 1.5rem'}}>
          <span
            className="inline-block text-caption uppercase tracking-[0.25em] font-semibold mb-4"
            style={{color: '#00F260'}}
          >
            Testimonials
          </span>
          <h2
            className="font-display"
            style={{fontSize: 'clamp(1.875rem, 4vw, 3rem)', fontWeight: 700, color: '#fff', lineHeight: 1.1, marginBottom: '1.5rem'}}
          >
            Be the First to Share Your Story
          </h2>
          <p style={{fontSize: '1.125rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.5)', maxWidth: '32rem', marginLeft: 'auto', marginRight: 'auto'}}>
            No reviews yet for <span style={{fontWeight: 600, color: '#FFFFFF'}}>{productTitle}</span>.
            Your experience matters—help others find meaning in their recovery journey.
          </p>

          {/* Feature badges */}
          <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1.5rem', fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', marginTop: '1.5rem'}}>
            <span style={{display: 'inline-flex', alignItems: 'center', gap: '0.5rem'}}>
              <svg viewBox="0 0 24 24" style={{width: '1.25rem', height: '1.25rem', color: '#00F260'}} fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="10" />
              </svg>
              Verified buyers
            </span>
            <span style={{display: 'inline-flex', alignItems: 'center', gap: '0.5rem'}}>
              <svg viewBox="0 0 24 24" style={{width: '1.25rem', height: '1.25rem', color: '#00F260'}} fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Authentic stories
            </span>
            <span style={{display: 'inline-flex', alignItems: 'center', gap: '0.5rem'}}>
              <svg viewBox="0 0 24 24" style={{width: '1.25rem', height: '1.25rem', color: '#00F260'}} fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
              Community support
            </span>
          </div>

          <button
            type="button"
            onClick={onWriteReview}
            style={{
              marginTop: '2rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.75rem',
              backgroundColor: '#00F260',
              color: '#000000',
              borderRadius: '9999px',
              fontSize: '0.9375rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
          >
            Write the First Review
          </button>
        </div>
      </section>
    );
  }

  // Has reviews — show rating header + carousel/list
  return (
    <section className="py-20 md:py-28 bg-black overflow-hidden">
      {/* Rating header with splatter accents */}
      <div style={{textAlign: 'center', position: 'relative', marginBottom: '3.5rem', padding: '0 1.5rem'}}>
        {/* Splatter blobs — neon green + purple */}
        <div style={{
          position: 'absolute',
          top: '-40px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '400px',
          height: '300px',
          pointerEvents: 'none',
          zIndex: 0,
        }}>
          {/* Green splatter */}
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '20px',
            width: '180px',
            height: '180px',
            background: 'radial-gradient(ellipse at 40% 50%, rgba(0,242,96,0.15) 0%, rgba(0,242,96,0.05) 40%, transparent 70%)',
            borderRadius: '60% 40% 50% 50%',
            filter: 'blur(30px)',
            transform: 'rotate(-15deg)',
          }} />
          {/* Purple splatter */}
          <div style={{
            position: 'absolute',
            top: '0',
            right: '20px',
            width: '160px',
            height: '160px',
            background: 'radial-gradient(ellipse at 60% 50%, rgba(168,85,247,0.15) 0%, rgba(168,85,247,0.05) 40%, transparent 70%)',
            borderRadius: '40% 60% 50% 50%',
            filter: 'blur(30px)',
            transform: 'rotate(20deg)',
          }} />
          {/* Small green speck */}
          <div style={{
            position: 'absolute',
            bottom: '40px',
            right: '60px',
            width: '60px',
            height: '60px',
            background: 'radial-gradient(circle, rgba(0,242,96,0.2) 0%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(15px)',
          }} />
          {/* Small purple speck */}
          <div style={{
            position: 'absolute',
            bottom: '60px',
            left: '40px',
            width: '80px',
            height: '80px',
            background: 'radial-gradient(circle, rgba(168,85,247,0.18) 0%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(18px)',
          }} />
        </div>

        {/* Content */}
        <div style={{position: 'relative', zIndex: 1}}>
          <div style={{marginBottom: '1.5rem'}}>
            <span
              className="text-caption uppercase tracking-[0.25em] font-semibold"
              style={{color: '#00F260'}}
            >
              Ratings & Reviews
            </span>
          </div>

          {/* Enlarged rating display — right below eyebrow */}
          <div style={{display: 'inline-block', position: 'relative', marginBottom: '2.5rem'}}>
            <div style={{
              position: 'relative',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
              borderRadius: '1.5rem',
              padding: '1.5rem 2.5rem',
              border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <div style={{display: 'flex', justifyContent: 'center', gap: '0.375rem', marginBottom: '0.75rem'}}>
                {[1, 2, 3, 4, 5].map((n) => {
                  const filled = n <= Math.round(rating);
                  return (
                    <svg key={n} viewBox="0 0 24 24" style={{
                      width: '2rem',
                      height: '2rem',
                      color: filled ? '#00F260' : 'rgba(255,255,255,0.15)',
                      fill: filled ? '#00F260' : 'rgba(255,255,255,0.15)',
                      filter: filled ? 'drop-shadow(0 0 6px rgba(0,242,96,0.4))' : 'none',
                    }}>
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  );
                })}
              </div>
              <div style={{display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '0.5rem'}}>
                <span style={{
                  fontSize: '3rem',
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #00F260 0%, #A855F7 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  lineHeight: 1,
                }}>
                  {rating.toFixed(1)}
                </span>
                <span style={{fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)'}}>
                  / 5.0
                </span>
              </div>
              <p style={{fontSize: '0.8125rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.25rem'}}>
                Based on {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
              </p>
            </div>
          </div>

          <h2
            className="font-display"
            style={{fontSize: 'clamp(1.875rem, 4vw, 3rem)', fontWeight: 700, color: '#fff', lineHeight: 1.1, marginBottom: '1rem'}}
          >
            What Our Customers Are Saying
          </h2>
          <p style={{fontSize: '1.125rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.5)', maxWidth: '36rem', marginLeft: 'auto', marginRight: 'auto', marginBottom: '2rem'}}>
            Honest reviews from verified buyers who carry their tokens every day.
          </p>

          {/* Action buttons */}
          <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.75rem'}}>
            <button
              type="button"
              onClick={() => setShowAllReviews(!showAllReviews)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.75rem',
                backgroundColor: showAllReviews ? 'transparent' : '#00F260',
                color: showAllReviews ? '#00F260' : '#000000',
                borderRadius: '9999px',
                fontSize: '0.9375rem',
                fontWeight: 600,
                border: showAllReviews ? '1px solid rgba(0,242,96,0.3)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {showAllReviews ? 'Back to Carousel' : `See All ${reviewCount} ${reviewCount === 1 ? 'Review' : 'Reviews'}`}
            </button>
            <button
              type="button"
              onClick={onWriteReview}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.75rem',
                color: '#A855F7',
                borderRadius: '9999px',
                fontSize: '0.9375rem',
                fontWeight: 600,
                border: '1px solid rgba(168,85,247,0.3)',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#A855F7'; e.currentTarget.style.color = '#000'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#A855F7'; }}
            >
              <PenLine style={{width: '1rem', height: '1rem'}} />
              Write a Review
            </button>
          </div>
        </div>
      </div>

      {/* Carousel or scrollable list */}
      {showAllReviews ? (
        <ProductReviewsList reviews={reviews} />
      ) : (
        <ProductReviewsCarousel reviews={reviews} />
      )}
    </section>
  );
}

/**
 * Reviews List — scrollable grid view of all reviews
 */
function ProductReviewsList({reviews}: {reviews: ProductReview[]}) {
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
    <div className="container-standard">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map((review, index) => (
          <motion.div
            key={review.id}
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{delay: index * 0.05, duration: 0.4}}
            className="rounded-2xl p-7 md:p-8 border border-white/[0.08] hover:border-white/[0.15] transition-colors"
            style={{background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)'}}
          >
            {/* Header: stars + date */}
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
              <div className="flex gap-0.5">
                {Array.from({length: 5}).map((_, i) => (
                  <svg
                    key={i}
                    viewBox="0 0 24 24"
                    className={`w-5 h-5 ${
                      i < review.rating
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-white/20 fill-white/20'
                    }`}
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              {review.created_at && (
                <span style={{fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)'}}>
                  {formatDate(review.created_at)}
                </span>
              )}
            </div>

            {/* Title */}
            {review.title && (
              <h4 className="font-display font-bold text-white text-lg mb-2 line-clamp-1">
                {review.title}
              </h4>
            )}

            {/* Body */}
            <p style={{fontSize: '0.9375rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem'}}>
              "{review.body}"
            </p>

            {/* Reviewer */}
            <div className="flex items-center gap-3 pt-4 border-t border-white/[0.08]">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-display font-bold text-sm"
                style={{background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)'}}
              >
                {review.reviewer.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-display font-bold text-white text-sm">
                  {review.reviewer.name}
                </div>
                <div className="text-xs" style={{color: '#00F260'}}>
                  {review.reviewer.verified ? 'Verified Buyer' : 'Customer'}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/**
 * Reviews Carousel — full-width animated marquee matching the landing page
 */
function ProductReviewsCarousel({reviews}: {reviews: ProductReview[]}) {
  // Repeat enough times so the marquee fills the viewport and loops seamlessly.
  // We need at least ~6 visible cards to look like a real stream.
  const repeatCount = Math.max(2, Math.ceil(8 / reviews.length));
  const looped = useMemo(
    () => Array.from({length: repeatCount}, () => reviews).flat(),
    [reviews, repeatCount],
  );
  // The marquee translates by 50% (half the total width) to loop, so we need
  // an even number of repetitions. Double the looped array for the x: 0→-50% trick.
  const marqueeItems = useMemo(() => [...looped, ...looped], [looped]);

  // Match landing page pace (~6s per card visible width)
  const duration = looped.length * 6;

  return (
    <div className="relative">
      {/* Left fade */}
      <div
        className="absolute left-0 top-0 bottom-0 w-24 md:w-40 z-10 pointer-events-none"
        style={{background: 'linear-gradient(to right, #000 0%, transparent 100%)'}}
      />
      {/* Right fade */}
      <div
        className="absolute right-0 top-0 bottom-0 w-24 md:w-40 z-10 pointer-events-none"
        style={{background: 'linear-gradient(to left, #000 0%, transparent 100%)'}}
      />

      <motion.div
        className="flex gap-6"
        animate={{x: ['0%', '-50%']}}
        transition={{
          x: {duration, repeat: Infinity, ease: 'linear'},
        }}
        style={{width: 'max-content'}}
      >
        {marqueeItems.map((review, index) => (
          <div
            key={`${review.id}-${index}`}
            className="flex-shrink-0 w-[340px] md:w-[420px]"
          >
            <div
              className="h-full rounded-2xl p-7 md:p-8 border border-white/[0.08] flex flex-col justify-between"
              style={{background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)'}}
            >
              {/* Star rating */}
              <div>
                <div className="flex gap-0.5 mb-4">
                  {Array.from({length: 5}).map((_, i) => (
                    <svg
                      key={i}
                      viewBox="0 0 24 24"
                      className={`w-5 h-5 ${
                        i < review.rating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-white/20 fill-white/20'
                      }`}
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>

                {/* Review body */}
                <p style={{fontSize: '0.9375rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem'}}>
                  "{review.body}"
                </p>
              </div>

              {/* Reviewer info */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-display font-bold text-sm"
                  style={{background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)'}}
                >
                  {review.reviewer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-display font-bold text-white text-sm">
                    {review.reviewer.name}
                  </div>
                  <div className="text-xs" style={{color: '#00F260'}}>
                    {review.reviewer.verified ? 'Verified Buyer' : 'Customer'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </motion.div>
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
    images(first: 20) {
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
    variants(first: 50) {
      nodes {
        ...ProductVariant
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
