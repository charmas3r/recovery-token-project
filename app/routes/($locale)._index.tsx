import {Await, useLoaderData, Link} from 'react-router';
import type {Route} from './+types/_index';
import {Suspense} from 'react';
import type {
  FeaturedCollectionFragment,
  RecommendedProductsQuery,
} from 'storefrontapi.generated';
import {ProductItem} from '~/components/product/ProductItem';
import {Button} from '~/components/ui/Button';

export const meta: Route.MetaFunction = () => {
  return [{title: 'Recovery Token Store | Meaningful Milestone Tokens'}];
};

export async function loader(args: Route.LoaderArgs) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return {...deferredData, ...criticalData};
}

async function loadCriticalData({context}: Route.LoaderArgs) {
  const [{collections}] = await Promise.all([
    context.storefront.query(FEATURED_COLLECTION_QUERY),
  ]);

  return {
    featuredCollection: collections.nodes[0],
  };
}

function loadDeferredData({context}: Route.LoaderArgs) {
  const recommendedProducts = context.storefront
    .query(RECOMMENDED_PRODUCTS_QUERY)
    .catch((error: Error) => {
      console.error(error);
      return null;
    });

  return {
    recommendedProducts,
  };
}

/**
 * Homepage - World-Class Landing Page
 * Clean, impactful design with strong visual hierarchy
 */
export default function Homepage() {
  const data = useLoaderData<typeof loader>();
  return (
    <div className="overflow-x-hidden">
      <HeroSection collection={data.featuredCollection} />
      <TrustBar />
      <ProductShowcase />
      <FeaturedProducts products={data.recommendedProducts} />
      <BrandStory />
      <TestimonialsSection />
      <FinalCTA collection={data.featuredCollection} />
    </div>
  );
}

/**
 * Hero Section - Full-width immersive hero with elegant typography
 */
function HeroSection({
  collection,
}: {
  collection: FeaturedCollectionFragment;
}) {
  return (
    <section className="relative bg-primary overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-surface-dark opacity-95" />
      
      <div className="container-wide relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[60vh] py-12 lg:py-8">
          {/* Left Column - Content */}
          <div className="order-2 lg:order-1 text-center lg:text-left w-full">
            {/* Eyebrow */}
            <span className="inline-block text-accent text-caption uppercase tracking-[0.25em] font-semibold mb-6">
              Hand-Crafted Bronze Tokens
            </span>
            
            {/* Main Heading */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-[4.5rem] font-bold text-white leading-[1.05] tracking-tight mb-6">
              Honor Every
              <span className="block text-accent">Milestone</span>
            </h1>
            
            {/* Subheading */}
            <p className="text-lg lg:text-xl text-white/80 leading-relaxed lg:max-w-[32rem]">
              Celebrate recovery journeys with hand-crafted bronze tokens. 
              Each piece tells a story of strength, hope, and transformation.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mt-10">
              <Link to={collection ? `/collections/${collection.handle}` : '/collections'}>
                <Button 
                  variant="primary" 
                  size="lg"
                  className="w-full sm:w-auto !bg-accent !text-white !border-accent hover:!bg-accent/90 !px-10"
                >
                  Shop Collection
                </Button>
              </Link>
              <Link to="/pages/about">
                <button 
                  className="w-full sm:w-auto px-8 py-3 text-base font-semibold rounded-lg border-2 border-white/40 text-white bg-transparent hover:bg-white/10 hover:border-white/60 transition-all duration-200"
                >
                  Our Story
                </button>
              </Link>
            </div>
          </div>
          
          {/* Right Column - Hero Image */}
          <div className="order-1 lg:order-2 relative flex items-center justify-center w-full">
            <div className="relative w-full max-w-[24rem] sm:max-w-[28rem] lg:max-w-[32rem]">
              {/* Glow effect behind image */}
              <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-full scale-75" />
              
              <img
                src="https://cdn.shopify.com/s/files/1/0752/2733/2779/files/mandala-token-final.webp?v=1769842039"
                alt="Recovery Token - Hand-crafted bronze milestone token"
                className="relative w-full h-auto object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" className="w-full h-auto">
          <path 
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" 
            fill="#F7FAFC"
          />
        </svg>
      </div>
    </section>
  );
}

/**
 * Trust Bar - Social proof and key benefits
 */
function TrustBar() {
  const features = [
    {
      icon: <ShippingIcon />,
      title: 'Free Shipping',
      description: 'On orders over $50',
    },
    {
      icon: <QualityIcon />,
      title: 'Premium Quality',
      description: 'Hand-cast bronze',
    },
    {
      icon: <SecureIcon />,
      title: 'Secure Checkout',
      description: '256-bit encryption',
    },
    {
      icon: <SupportIcon />,
      title: '5-Star Support',
      description: 'We\'re here to help',
    },
  ];

  return (
    <section className="bg-surface py-10 md:py-12 border-b border-black/5">
      <div className="container-standard">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
          {features.map((feature) => (
            <div key={feature.title} className="flex items-center gap-4">
              <div className="flex-shrink-0 w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                {feature.icon}
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-primary">
                  {feature.title}
                </h3>
                <p className="text-sm text-secondary">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Product Showcase - Featured product with feature highlights
 */
function ProductShowcase() {
  return (
    <section className="py-20 md:py-28 bg-surface">
      <div className="container-standard">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-accent text-caption uppercase tracking-[0.25em] font-semibold mb-4">
            Featured Token
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-primary leading-tight mb-6">
            The Sunflower Token
          </h2>
          <p className="text-body-lg text-secondary max-w-[42rem] mx-auto">
            A symbol of hope and new beginnings. Each sunflower token is hand-cast in 
            solid bronze, featuring intricate details that capture the flower's natural beauty.
          </p>
        </div>
        
        {/* Product + Features Layout */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Features */}
          <div className="lg:col-span-3 space-y-6 order-2 lg:order-1">
            <FeatureCard
              icon={<DiamondIcon />}
              title="Solid Bronze"
              description="Hand-cast from premium bronze alloy with an antique finish that develops unique patina over time."
              align="right"
            />
            <FeatureCard
              icon={<ShieldCheckIcon />}
              title="Built to Last"
              description="Designed to withstand daily handling while maintaining its beauty for years to come."
              align="right"
            />
          </div>
          
          {/* Center Product Image */}
          <div className="lg:col-span-6 order-1 lg:order-2">
            <div className="relative mx-auto max-w-md lg:max-w-full">
              {/* Subtle background circle */}
              <div className="absolute inset-4 bg-white rounded-full shadow-inner" />
              <img
                src="https://cdn.shopify.com/s/files/1/0752/2733/2779/files/sunflower-token-final-webp.webp?v=1769842039"
                alt="Sunflower Recovery Token"
                className="relative w-full h-auto object-contain"
              />
            </div>
          </div>
          
          {/* Right Features */}
          <div className="lg:col-span-3 space-y-6 order-3">
            <FeatureCard
              icon={<HeartIcon />}
              title="Meaningful Gift"
              description="A tangible symbol of support that shows someone you believe in their journey."
              align="left"
            />
            <FeatureCard
              icon={<SparklesIcon />}
              title="Custom Options"
              description="Personalize with names, dates, or special messages to make it uniquely theirs."
              align="left"
            />
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link to="/products/sunflower-token">
            <Button variant="primary" size="lg">
              View Token Details
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

/**
 * Feature Card with configurable alignment
 */
function FeatureCard({
  icon,
  title,
  description,
  align = 'left',
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  align?: 'left' | 'right';
}) {
  return (
    <div className={`bg-white rounded-xl p-6 shadow-sm border border-black/5 ${
      align === 'right' ? 'lg:text-right' : 'lg:text-left'
    }`}>
      <div className={`flex items-center gap-3 mb-3 ${
        align === 'right' ? 'lg:flex-row-reverse' : ''
      }`}>
        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent flex-shrink-0">
          {icon}
        </div>
        <h3 className="font-display text-base font-bold text-primary">
          {title}
        </h3>
      </div>
      <p className="text-body-sm text-secondary leading-relaxed">
        {description}
      </p>
    </div>
  );
}

/**
 * Featured Products Grid
 */
function FeaturedProducts({
  products,
}: {
  products: Promise<RecommendedProductsQuery | null>;
}) {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="container-standard">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <span className="inline-block text-accent text-caption uppercase tracking-[0.25em] font-semibold mb-4">
              Shop Tokens
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary leading-tight">
              Popular Recovery Tokens
            </h2>
          </div>
          <Link to="/collections" className="hidden md:block">
            <Button variant="secondary" size="md">
              View All Tokens
            </Button>
          </Link>
        </div>
        
        {/* Products Grid */}
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

        {/* Mobile CTA */}
        <div className="text-center mt-10 md:hidden">
          <Link to="/collections">
            <Button variant="secondary" size="md">
              View All Tokens
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

/**
 * Brand Story Section - Emotional connection
 */
function BrandStory() {
  return (
    <section className="py-20 md:py-28 bg-primary text-white relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>
      
      <div className="container-standard relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://cdn.shopify.com/s/files/1/0752/2733/2779/files/recovery-rise-up-final.webp?v=1769872854"
                alt="Recovery journey"
                className="w-full h-auto object-cover"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary/50 to-transparent" />
            </div>
            
            {/* Floating stat card */}
            <div className="absolute -bottom-6 -right-6 md:right-8 bg-white rounded-xl p-6 shadow-xl max-w-[200px]">
              <div className="text-4xl font-display font-bold text-accent mb-1">10K+</div>
              <p className="text-sm text-secondary">Milestones celebrated</p>
            </div>
          </div>
          
          {/* Content */}
          <div>
            <span className="inline-block text-accent text-caption uppercase tracking-[0.25em] font-semibold mb-4">
              Our Mission
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6">
              Every Journey Deserves to Be Celebrated
            </h2>
            <p className="text-lg text-white/80 leading-relaxed mb-6">
              Recovery is one of the most courageous journeys a person can take. 
              We believe every step forward—whether it's 24 hours or 25 years—deserves 
              to be honored with something meaningful and lasting.
            </p>
            <p className="text-lg text-white/80 leading-relaxed mb-8">
              Our hand-crafted bronze tokens serve as tangible reminders of strength, 
              hope, and the incredible resilience of the human spirit.
            </p>
            
            <div className="flex flex-wrap gap-8">
              <div>
                <div className="text-3xl font-display font-bold text-accent">100%</div>
                <p className="text-sm text-white/60">Hand-crafted</p>
              </div>
              <div>
                <div className="text-3xl font-display font-bold text-accent">5★</div>
                <p className="text-sm text-white/60">Customer rating</p>
              </div>
              <div>
                <div className="text-3xl font-display font-bold text-accent">USA</div>
                <p className="text-sm text-white/60">Made with care</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Testimonials Section
 */
function TestimonialsSection() {
  const testimonials = [
    {
      quote: "This token means everything to me. I carry it every day as a reminder of how far I've come.",
      author: "Michael R.",
      milestone: "3 Years Sober",
      avatar: "M",
    },
    {
      quote: "I gave this to my son for his 1-year milestone. He teared up immediately. Worth every penny.",
      author: "Sandra K.",
      milestone: "Gift Giver",
      avatar: "S",
    },
    {
      quote: "The craftsmanship is incredible. You can feel the weight and quality the moment you hold it.",
      author: "James T.",
      milestone: "5 Years Sober",
      avatar: "J",
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-surface">
      <div className="container-standard">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-accent text-caption uppercase tracking-[0.25em] font-semibold mb-4">
            Testimonials
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary leading-tight">
            Stories That Inspire
          </h2>
        </div>
        
        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl p-8 shadow-sm border border-black/5 relative"
            >
              {/* Quote icon */}
              <div className="absolute -top-4 left-8 w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                <QuoteIcon />
              </div>
              
              <p className="text-body text-secondary leading-relaxed mb-6 pt-2">
                "{testimonial.quote}"
              </p>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-display font-bold">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-display font-bold text-primary">
                    {testimonial.author}
                  </div>
                  <div className="text-caption text-accent">
                    {testimonial.milestone}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Final CTA Section
 */
function FinalCTA({
  collection,
}: {
  collection: FeaturedCollectionFragment;
}) {
  return (
    <section className="py-20 md:py-24 bg-white">
      <div className="container-standard">
        <div className="bg-gradient-to-br from-primary to-surface-dark rounded-3xl p-10 md:p-16 text-center relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 max-w-[42rem] mx-auto px-4">
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
              Ready to Celebrate Your Milestone?
            </h2>
            <p className="text-lg text-white/80">
              Every journey is worth celebrating. Find the perfect token to honor 
              your progress or gift to someone special.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
              <Link to={collection ? `/collections/${collection.handle}` : '/collections'}>
                <Button 
                  variant="primary" 
                  size="lg"
                  className="w-full sm:w-auto !bg-accent !text-white !border-accent hover:!bg-accent/90 !px-12"
                >
                  Shop Now
                </Button>
              </Link>
              <Link to="/pages/contact">
                <button 
                  className="w-full sm:w-auto px-8 py-3 text-base font-semibold rounded-lg border-2 border-white/40 text-white bg-transparent hover:bg-white/10 hover:border-white/60 transition-all duration-200"
                >
                  Contact Us
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Loading Skeleton
 */
function ProductsGridSkeleton() {
  return (
    <div className="products-grid">
      {Array.from({length: 4}).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[4/5] bg-surface rounded-lg" />
          <div className="p-4 space-y-3">
            <div className="h-5 bg-surface rounded w-3/4" />
            <div className="h-5 bg-surface rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ==========================================
 * Icon Components
 * ========================================== */

function ShippingIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 3h15v13H1z" />
      <path d="M16 8h4l3 3v5h-7V8z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

function QualityIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="6" />
      <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
    </svg>
  );
}

function SecureIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function SupportIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
    </svg>
  );
}

function DiamondIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41l-7.59-7.59a2.41 2.41 0 0 0-3.41 0Z" />
    </svg>
  );
}

function ShieldCheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

function SparklesIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}

function QuoteIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
      <path d="M11.192 15.757c0-.88-.23-1.618-.69-2.217-.326-.412-.768-.683-1.327-.812-.55-.128-1.07-.137-1.54-.028-.16-.95.1-1.956.76-3.022.66-1.065 1.515-1.867 2.558-2.403L9.373 5c-.8.396-1.56.898-2.26 1.505-.71.607-1.34 1.305-1.9 2.094s-.98 1.68-1.25 2.69-.346 2.04-.217 3.1c.168 1.4.62 2.52 1.356 3.35.735.84 1.652 1.26 2.748 1.26.965 0 1.766-.29 2.4-.878.628-.576.94-1.365.94-2.368l.002.003zm9.124 0c0-.88-.23-1.618-.69-2.217-.326-.42-.77-.692-1.327-.817-.56-.124-1.074-.13-1.54-.022-.16-.94.09-1.95.75-3.02.66-1.06 1.514-1.86 2.557-2.4L18.49 5c-.8.396-1.555.898-2.26 1.505-.708.607-1.34 1.305-1.894 2.094-.556.79-.97 1.68-1.24 2.69-.273 1-.345 2.04-.217 3.1.168 1.4.62 2.52 1.356 3.35.735.84 1.652 1.26 2.748 1.26.965 0 1.766-.29 2.4-.878.628-.576.94-1.365.94-2.368l-.007.006z" />
    </svg>
  );
}

/* ==========================================
 * GraphQL Queries
 * ========================================== */

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
