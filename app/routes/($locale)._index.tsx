import {Await, useLoaderData, Link} from 'react-router';
import type {Route} from './+types/_index';
import {Suspense} from 'react';
import type {
  FeaturedCollectionFragment,
  RecommendedProductsQuery,
} from 'storefrontapi.generated';
import {ProductItem} from '~/components/product/ProductItem';
import {Button} from '~/components/ui';

export const meta: Route.MetaFunction = () => {
  return [{title: 'Hydrogen | Home'}];
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
async function loadCriticalData({context}: Route.LoaderArgs) {
  const [{collections}] = await Promise.all([
    context.storefront.query(FEATURED_COLLECTION_QUERY),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {
    featuredCollection: collections.nodes[0],
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  const recommendedProducts = context.storefront
    .query(RECOMMENDED_PRODUCTS_QUERY)
    .catch((error: Error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });

  return {
    recommendedProducts,
  };
}

/**
 * Homepage - Design System
 * 
 * Following Recovery Token Store design system layout patterns
 * @see .cursor/skills/design-system/SKILL.md
 * @see prd.md Section 3
 */

export default function Homepage() {
  const data = useLoaderData<typeof loader>();
  return (
    <div>
      <HeroSection collection={data.featuredCollection} />
      <ProductShowcase />
      <FeaturedCollectionGrid products={data.recommendedProducts} />
      <RecommendedProducts products={data.recommendedProducts} />
      <CollectionBrowse collection={data.featuredCollection} />
    </div>
  );
}

/**
 * Hero Section - Two-column layout with feature badges
 * Inspired by modern e-commerce landing page design
 */
function HeroSection({
  collection,
}: {
  collection: FeaturedCollectionFragment;
}) {
  const heroImageUrl = 'https://cdn.shopify.com/s/files/1/0752/2733/2779/files/mandala-token-final.webp?v=1769842039';
  
  return (
    <section className="relative w-full" style={{margin: 0}}>
      <div className="grid lg:grid-cols-2 min-h-[500px] lg:min-h-[600px]">
        {/* Left Column - Content */}
        <div className="bg-surface flex flex-col justify-center p-8 md:p-10 lg:p-12 xl:p-16 order-2 lg:order-1">
          <div style={{maxWidth: '540px', width: '100%'}}>
            {/* Main Heading */}
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-primary leading-[1.1] tracking-tight uppercase mb-4">
              Celebrate Every Milestone with Meaning
            </h1>
            
            {/* Subheading */}
            <p className="text-base md:text-lg text-secondary leading-relaxed" style={{maxWidth: '420px'}}>
              Hand-crafted bronze tokens that honor recovery journeys, mark sobriety milestones, and celebrate personal transformation.
            </p>
            
            {/* CTA Button - Black button with white text */}
            <div className="mt-8">
              <Link to={collection ? `/collections/${collection.handle}` : '/collections'}>
                <Button 
                  variant="primary" 
                  size="lg"
                  className="!bg-black !text-white !border-black hover:!bg-black/90"
                >
                  Shop Now
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Feature Badges */}
          <div className="flex flex-wrap gap-4 mt-12 lg:mt-16">
            <FeatureBadge 
              icon={<TruckIcon />}
              title="Free Shipping"
              description="Instant help from knowledgeable representatives available."
            />
            <FeatureBadge 
              icon={<ShieldIcon />}
              title="Secure Checkout"
              description="Enjoy a safe and smooth purchasing experience every time."
            />
          </div>
        </div>
        
        {/* Right Column - Image */}
        <div className="relative overflow-hidden order-1 lg:order-2 min-h-[350px] lg:min-h-full">
          <img
            src={heroImageUrl}
            alt="Mandala Token"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}

/**
 * Feature Badge Component
 */
function FeatureBadge({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-lg p-5 shadow-sm max-w-[220px]">
      <div className="text-primary mb-3">
        {icon}
      </div>
      <h3 className="font-display text-sm font-bold text-primary uppercase tracking-wide mb-2">
        {title}
      </h3>
      <p className="text-body-sm text-secondary leading-relaxed">
        {description}
      </p>
    </div>
  );
}

/**
 * Icon Components
 */
function TruckIcon() {
  return (
    <svg 
      width="28" 
      height="28" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M1 3h15v13H1z" />
      <path d="M16 8h4l3 3v5h-7V8z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg 
      width="28" 
      height="28" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

/**
 * Product Showcase Section
 * Features a centered product image with highlight cards arranged around it
 */
function ProductShowcase() {
  return (
    <section className="py-16 md:py-24 bg-surface">
      <div className="container-standard">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <span className="text-caption text-secondary uppercase tracking-[0.2em] block mb-4">
            Best Product
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-primary uppercase tracking-tight mb-4">
            The Recovery Token
          </h2>
          <p className="text-base md:text-lg text-secondary leading-relaxed mx-auto text-center sm:text-center md:text-center lg:text-center" style={{maxWidth: '640px', textAlign: 'center', marginLeft: 'auto', marginRight: 'auto'}}>
            Designed for meaningful connections, this hand-crafted bronze token represents hope, recovery, and the journey toward a brighter future.
          </p>
        </div>
        
        {/* Feature Cards + Product Image Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-center">
          {/* Left Column - Feature Cards */}
          <div className="flex flex-col gap-6 order-2 lg:order-1">
            <ShowcaseCard
              icon={<DiamondIcon />}
              title="Premium Bronze"
              description="Hand-cast from solid bronze with an antique finish that develops character over time."
            />
            <ShowcaseCard
              icon={<WaterDropIcon />}
              title="Weather Resistant"
              description="Durable material ensures your token remains beautiful through years of handling."
            />
          </div>
          
          {/* Center Column - Product Image */}
          <div className="relative order-1 lg:order-2 flex justify-center">
            <div className="relative w-full aspect-square" style={{maxWidth: '450px'}}>
              <img
                src="https://cdn.shopify.com/s/files/1/0752/2733/2779/files/sunflower-token-final-webp.webp?v=1769842039"
                alt="Recovery Token - Sunflower Design"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
          </div>
          
          {/* Right Column - Feature Cards */}
          <div className="flex flex-col gap-6 order-3">
            <ShowcaseCard
              icon={<HeartIcon />}
              title="Meaningful Gift"
              description="A tangible symbol of support that shows someone you believe in their journey."
            />
            <ShowcaseCard
              icon={<PencilIcon />}
              title="Custom Engraving"
              description="Personalize with names, dates, or messages that make it uniquely theirs."
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Showcase Card Component - Feature highlight with icon
 */
function ShowcaseCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-xl p-6 border border-black/5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] text-center">
      <div className="text-primary mb-4 flex justify-center">
        {icon}
      </div>
      <h3 className="font-display text-base font-bold text-primary uppercase tracking-wide mb-2">
        {title}
      </h3>
      <p className="text-body-sm text-secondary leading-relaxed">
        {description}
      </p>
    </div>
  );
}

/**
 * Showcase Icons
 */
function DiamondIcon() {
  return (
    <svg 
      width="28" 
      height="28" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41l-7.59-7.59a2.41 2.41 0 0 0-3.41 0Z" />
    </svg>
  );
}

function WaterDropIcon() {
  return (
    <svg 
      width="28" 
      height="28" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg 
      width="28" 
      height="28" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg 
      width="28" 
      height="28" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}

/**
 * Featured Collection Grid - Nexura-style layout
 * Left: Large image with overlay card
 * Right: Product grid with header
 */
function FeaturedCollectionGrid({
  products,
}: {
  products: Promise<RecommendedProductsQuery | null>;
}) {
  const lifestyleImageUrl = 'https://cdn.shopify.com/s/files/1/0752/2733/2779/files/recovery-rise-up-final.webp?v=1769872854';
  
  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="container-standard">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <span className="text-caption text-secondary uppercase tracking-[0.2em] block mb-4">
            Milestone Collection
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-primary uppercase tracking-tight mb-4">
            Browse Recovery Tokens
          </h2>
          <p className="text-base md:text-lg text-secondary leading-relaxed mx-auto text-center sm:text-center md:text-center lg:text-center" style={{maxWidth: '640px', textAlign: 'center', marginLeft: 'auto', marginRight: 'auto'}}>
            Shop our meaningful token collection, featuring hand-crafted designs, customizable options, and exceptional quality for every milestone.
          </p>
        </div>

        {/* Main Grid: Image Left, Products Right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Lifestyle Image with Overlay Card */}
          <div className="relative min-h-[500px] lg:min-h-[600px] rounded-lg overflow-hidden">
            <img
              src={lifestyleImageUrl}
              alt="Recovery Token Collection"
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Overlay Card */}
            <div className="absolute bottom-6 left-6 right-6 md:right-auto md:max-w-[320px]">
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <h3 className="font-display text-xl md:text-2xl font-bold text-primary uppercase tracking-tight mb-3">
                  Mark Your Journey
                </h3>
                <p className="text-sm text-secondary leading-relaxed mb-4">
                  Celebrate every step of recovery with our hand-crafted bronze tokens. 
                  Each token represents hope, strength, and the courage to keep going.
                </p>
                <Link to="/collections">
                  <Button variant="secondary" size="sm">
                    Explore
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column - 2x2 Product Grid */}
          <div>
            <Suspense fallback={<ProductGridSkeleton2x2 />}>
              <Await resolve={products}>
                {(response) => (
                  <div className="grid grid-cols-2 gap-4">
                    {response
                      ? response.products.nodes.slice(0, 4).map((product) => (
                          <ProductItem
                            key={product.id}
                            product={product}
                            loading="lazy"
                          />
                        ))
                      : null}
                  </div>
                )}
              </Await>
            </Suspense>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * 2x2 Product Grid Skeleton
 */
function ProductGridSkeleton2x2() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {Array.from({length: 4}).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[4/5] bg-surface rounded-md" />
          <div className="p-3 space-y-2">
            <div className="h-5 bg-surface rounded w-3/4" />
            <div className="h-5 bg-surface rounded w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

function RecommendedProducts({
  products,
}: {
  products: Promise<RecommendedProductsQuery | null>;
}) {
  return (
    <section className="py-16 md:py-24 bg-surface">
      <div className="container-standard">
        {/* Section Heading - Styled like screenshot */}
        <div className="text-center space-y-4 mb-12">
          <span className="text-caption text-secondary uppercase tracking-[0.2em]">
            Popular Tokens
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary uppercase tracking-tight">
            Bestselling Recovery Tokens
          </h2>
        </div>
        
        {/* Products Grid - Design System Pattern */}
        <Suspense fallback={<ProductsGridSkeleton />}>
          <Await resolve={products}>
            {(response) => (
              <div className="products-grid">
                {response
                  ? response.products.nodes.map((product) => (
                      <ProductItem
                        key={product.id}
                        product={product}
                        loading="lazy"
                      />
                    ))
                  : null}
              </div>
            )}
          </Await>
        </Suspense>
      </div>
    </section>
  );
}

/**
 * Loading Skeleton - Matches design system product grid
 */
function ProductsGridSkeleton() {
  return (
    <div className="products-grid">
      {Array.from({length: 8}).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[4/5] bg-surface rounded-md" />
          <div className="p-4 space-y-2">
            <div className="h-6 bg-surface rounded w-3/4" />
            <div className="h-6 bg-surface rounded w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Collection Browse Section - CTA to explore collections
 */
function CollectionBrowse({
  collection,
}: {
  collection: FeaturedCollectionFragment;
}) {
  return (
    <section className="py-16 md:py-20 bg-surface border-t border-black/5">
      <div className="container-standard">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          {/* Left - Text Content */}
          <div>
            <span className="text-caption text-secondary uppercase tracking-[0.2em] block mb-3">
              Token Collection
            </span>
            <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-primary uppercase tracking-tight mb-3">
              Browse Token Collection
            </h2>
            <p 
              className="text-base text-secondary leading-relaxed"
              style={{maxWidth: '540px', wordBreak: 'normal', whiteSpace: 'normal'}}
            >
              Shop our meaningful token collection, featuring hand-crafted designs, 
              customizable options, and exceptional quality for every milestone.
            </p>
          </div>
          
          {/* Right - CTA Button */}
          <div className="flex-shrink-0">
            <Link to={collection ? `/collections/${collection.handle}` : '/collections'}>
              <Button variant="secondary" size="md">
                Show More
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

const FEATURED_COLLECTION_QUERY = `#graphql
  fragment FeaturedCollection on Collection {
    id
    title
    description
    image {
      id
      url
      altText
      width
      height
    }
    handle
  }
  query FeaturedCollection($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 1, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...FeaturedCollection
      }
    }
  }
` as const;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
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
  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 4, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
` as const;
