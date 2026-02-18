import {Await, useLoaderData, Link} from 'react-router';
import type {Route} from './+types/_index';
import {Suspense, useState, useEffect, useCallback, useRef} from 'react';
import type {
  FeaturedCollectionFragment,
  RecommendedProductsQuery,
} from 'storefrontapi.generated';
import {ProductItem} from '~/components/product/ProductItem';
import {Button} from '~/components/ui/Button';
import {AnimatePresence} from 'framer-motion';
import {
  FadeUp,
  FadeIn,
  SlideIn,
  ScaleIn,
  StaggerContainer,
  StaggerItem,
  HeroContent,
  HeroItem,
  HeroImage,
  HoverScale,
  HoverLift,
  motion,
} from '~/components/ui/Animations';

/**
 * Resend-style dark section card — subtle near-black card with
 * faint border and a soft top-edge gradient shine.
 */
function SectionCard({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative rounded-[20px] border border-white/[0.08] overflow-hidden ${className}`}
      style={{background: 'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)'}}
    >
      {/* Top-edge gradient shine */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 50%, transparent 100%)'}}
      />
      {children}
    </div>
  );
}

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

  // Fetch store reviews from Judge.me (non-blocking)
  const storeReviews = fetchStoreReviews(context.env).catch((error: Error) => {
    console.error('Failed to fetch store reviews:', error);
    return null;
  });

  return {
    recommendedProducts,
    storeReviews,
  };
}

/**
 * Fetch recent store reviews for testimonials section
 */
async function fetchStoreReviews(env: {
  PUBLIC_JUDGEME_SHOP_DOMAIN?: string;
  PUBLIC_STORE_DOMAIN?: string;
  JUDGEME_PUBLIC_TOKEN?: string;
}) {
  const shopDomain = env.PUBLIC_JUDGEME_SHOP_DOMAIN || env.PUBLIC_STORE_DOMAIN;

  if (!env.JUDGEME_PUBLIC_TOKEN || !shopDomain) {
    return null;
  }

  const params = new URLSearchParams({
    shop_domain: shopDomain,
    api_token: env.JUDGEME_PUBLIC_TOKEN,
    per_page: '6',
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
      <PromoCarousel />
      <ProductShowcase />
      <FeaturedProducts products={data.recommendedProducts} />
      <BrandStory />
      <CustomerReviewsSection reviews={data.storeReviews} />
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
    <section className="relative bg-black overflow-hidden -mt-24">
      {/* Background lighting effect — soft top glow like Resend */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: 'radial-gradient(ellipse 70% 40% at 50% 0%, rgba(180,180,180,0.15) 0%, rgba(80,80,80,0.06) 30%, transparent 70%)',
        }}
      />
      <div className="container-wide relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[60vh] pt-32 pb-12 lg:pt-28 lg:pb-8">
          {/* Left Column - Content */}
          <HeroContent className="order-2 lg:order-1 text-center lg:text-left w-full">

            {/* Main Heading */}
            <HeroItem>
              <h1
                className="text-white mb-6"
                style={{
                  fontFamily: "'Charter', 'Georgia', 'Times New Roman', serif",
                  fontSize: 'clamp(48px, 5vw, 64px)',
                  fontWeight: 400,
                  lineHeight: 1.1,
                  letterSpacing: '-0.64px',
                  fontFeatureSettings: '"ss01", "ss04", "ss11"',
                }}
              >
                Honor Every{' '}
                <span
                  className="block"
                  style={{
                    background: 'linear-gradient(90deg, #7C3AED 0%, #C026D3 50%, #FF2D92 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Milestone
                </span>
              </h1>
            </HeroItem>

            {/* Subheading */}
            <HeroItem>
              <p className="text-lg lg:text-xl text-white/60 leading-relaxed lg:max-w-[32rem]">
                Celebrate recovery journeys with hand-crafted tokens in every color.
                Each piece tells a story of strength, hope, and transformation.
              </p>
            </HeroItem>

            {/* CTA Buttons */}
            <HeroItem>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mt-10">
                <Link to={collection ? `/collections/${collection.handle}` : '/collections'}>
                  <motion.div
                    whileHover={{scale: 1.02}}
                    whileTap={{scale: 0.98}}
                    transition={{duration: 0.2}}
                  >
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full sm:w-auto !px-10"
                    >
                      Shop Collection
                    </Button>
                  </motion.div>
                </Link>
                <Link to="/about">
                    <Button
                      variant="secondary"
                      size="lg"
                      className="w-full sm:w-auto"
                      as="span"
                    >
                      Our Story
                    </Button>
                </Link>
              </div>
            </HeroItem>
          </HeroContent>

          {/* Right Column - Hero Video */}
          <HeroImage className="order-1 lg:order-2 relative flex items-center justify-center w-full">
            <div className="relative w-full max-w-[24rem] sm:max-w-[28rem] lg:max-w-[32rem] rounded-2xl overflow-hidden shadow-2xl shadow-white/5">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-auto object-cover aspect-[4/5]"
              >
                <source
                  src="https://cdn.shopify.com/videos/c/o/v/6bc264ca226f46458ac8959dfaa7c8f0.mp4"
                  type="video/mp4"
                />
              </video>
            </div>
          </HeroImage>
        </div>
      </div>
    </section>
  );
}

/**
 * Promo Carousel - Full-width animated promo banner that cycles through offers
 */
const PROMOS = [
  {
    icon: <ShippingIcon />,
    headline: 'Free Shipping',
    subtext: 'On every order over $50 — no code needed',
    accent: '#FFFF93',
    gradient: 'radial-gradient(ellipse at 50% 0%, rgba(255,255,147,0.12) 0%, transparent 70%)',
  },
  {
    icon: <PercentIcon />,
    headline: 'WELCOME15',
    subtext: '15% off your first order — use code at checkout',
    accent: '#93FFDB',
    gradient: 'radial-gradient(ellipse at 50% 0%, rgba(147,255,219,0.12) 0%, transparent 70%)',
  },
  {
    icon: <QualityIcon />,
    headline: 'Premium Quality',
    subtext: 'Hand-cast solid bronze — built to last a lifetime',
    accent: '#B8764F',
    gradient: 'radial-gradient(ellipse at 50% 0%, rgba(184,118,79,0.15) 0%, transparent 70%)',
  },
  {
    icon: <GiftIcon />,
    headline: 'Gift Wrapping',
    subtext: 'Complimentary premium gift box with every token',
    accent: '#FF93C9',
    gradient: 'radial-gradient(ellipse at 50% 0%, rgba(255,147,201,0.12) 0%, transparent 70%)',
  },
];

function PromoCarousel() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const pausedRef = useRef(false);

  const goTo = useCallback((index: number) => {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  }, [current]);

  // Auto-advance with setInterval — uses a ref for pause so the timer never resets
  useEffect(() => {
    const timer = setInterval(() => {
      if (pausedRef.current) return;
      setDirection(1);
      setCurrent((prev) => (prev + 1) % PROMOS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const promo = PROMOS[current];

  const slideVariants = {
    enter: (d: number) => ({
      x: d > 0 ? 80 : -80,
      opacity: 0,
      scale: 0.95,
      filter: 'blur(8px)',
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
    },
    exit: (d: number) => ({
      x: d > 0 ? -80 : 80,
      opacity: 0,
      scale: 0.95,
      filter: 'blur(8px)',
    }),
  };

  return (
    <section
      className="relative bg-black overflow-hidden"
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
    >
      {/* Animated background glow that changes color per promo */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{background: promo.gradient}}
        transition={{duration: 0.8}}
      />

      {/* Subtle horizontal line accents */}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)'}}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-px"
        style={{background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)'}}
      />

      <div className="relative py-10 md:py-14">
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', minHeight: '80px'}}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94]}}
              style={{display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.75rem', width: '100%'}}
            >
              {/* Icon with glow ring */}
              <motion.div
                style={{position: 'relative'}}
                animate={{scale: [1, 1.05, 1]}}
                transition={{duration: 3, repeat: Infinity, ease: 'easeInOut'}}
              >
                <div
                  style={{position: 'absolute', inset: 0, borderRadius: '9999px', filter: 'blur(16px)', opacity: 0.3, background: promo.accent}}
                />
                <div
                  style={{
                    position: 'relative',
                    width: '3rem',
                    height: '3rem',
                    borderRadius: '9999px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid',
                    color: promo.accent,
                    borderColor: `${promo.accent}33`,
                    background: `${promo.accent}0D`,
                  }}
                >
                  {promo.icon}
                </div>
              </motion.div>

              {/* Headline */}
              <h3
                style={{
                  fontFamily: 'var(--font-display, serif)',
                  fontWeight: 700,
                  letterSpacing: '0.025em',
                  fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
                  color: promo.accent,
                  textShadow: `0 0 30px ${promo.accent}40`,
                  whiteSpace: 'nowrap',
                }}
              >
                {promo.headline}
              </h3>

              {/* Subtext */}
              <p style={{color: 'rgba(255,255,255,0.5)', fontSize: '1rem', maxWidth: '28rem', lineHeight: 1.5, whiteSpace: 'normal', width: '100%'}}>
                {promo.subtext}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dot indicators */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {PROMOS.map((_, i) => (
            <motion.button
              key={i}
              onClick={() => goTo(i)}
              className="relative"
              aria-label={`Go to promo ${i + 1}`}
            >
              <motion.div
                className="w-2 h-2 rounded-full"
                animate={{
                  background: i === current ? promo.accent : 'rgba(255,255,255,0.15)',
                  scale: i === current ? 1.3 : 1,
                }}
                transition={{duration: 0.3}}
              />
              {/* Active dot glow */}
              {i === current && (
                <motion.div
                  className="absolute inset-0 rounded-full blur-sm"
                  style={{background: promo.accent}}
                  layoutId="promoDotGlow"
                  transition={{duration: 0.3}}
                />
              )}
            </motion.button>
          ))}
        </div>

        {/* Progress bar */}
        <div className="mt-4 mx-auto" style={{maxWidth: '120px'}}>
          <div className="h-[2px] rounded-full bg-white/[0.06] overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{background: promo.accent}}
              key={`progress-${current}`}
              initial={{width: '0%'}}
              animate={{width: '100%'}}
              transition={{
                duration: 4.5,
                ease: 'linear',
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Product Showcase - Featured token with side feature cards
 */
function ProductShowcase() {
  return (
    <section className="py-20 md:py-28 bg-black">
      <div className="container-standard">
        <SectionCard className="px-6 py-16 md:px-12 md:py-20">
          {/* Section Header */}
          <div style={{textAlign: 'center', maxWidth: '42rem', marginLeft: 'auto', marginRight: 'auto', marginBottom: '4rem'}}>
            <span
              style={{
                display: 'inline-block',
                color: '#B8764F',
                fontSize: '0.75rem',
                textTransform: 'uppercase' as const,
                letterSpacing: '0.25em',
                fontWeight: 600,
                marginBottom: '1rem',
              }}
            >
              Featured Token
            </span>
            <h2
              className="font-display"
              style={{fontSize: 'clamp(1.875rem, 4vw, 3rem)', fontWeight: 700, color: '#fff', lineHeight: 1.1, marginBottom: '1.5rem'}}
            >
              The Sunflower Token
            </h2>
            <p style={{fontSize: '1.125rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.5)', maxWidth: '36rem', marginLeft: 'auto', marginRight: 'auto'}}>
              A symbol of hope and new beginnings. Each sunflower token is hand-cast in
              solid bronze, featuring intricate details that capture the flower's natural beauty.
            </p>
          </div>

          {/* Product Display */}
          <div className="grid lg:grid-cols-[1fr_auto_1fr] gap-8 lg:gap-12 items-center">
            {/* Left Features */}
            <div className="hidden lg:flex flex-col gap-4">
              <FeatureCard
                icon={<DiamondIcon />}
                title="Solid Bronze"
                description="Each token is hand-cast in premium bronze for lasting quality."
                align="right"
              />
              <FeatureCard
                icon={<ShieldCheckIcon />}
                title="Intricate Detail"
                description="Every petal and detail is carefully crafted to perfection."
                align="right"
              />
            </div>

            {/* Center Token */}
            <ScaleIn>
              <div className="relative flex justify-center">
                <div className="relative w-full max-w-[22rem] md:max-w-[26rem]">
                  {/* Warm glow */}
                  <div
                    className="absolute top-8 left-1/2 -translate-x-1/2 w-[28rem] h-[28rem] rounded-full pointer-events-none"
                    style={{background: 'radial-gradient(circle, rgba(184,118,79,0.15) 0%, rgba(184,118,79,0.05) 40%, transparent 70%)'}}
                  />
                  <motion.img
                    src="https://cdn.shopify.com/s/files/1/0752/2733/2779/files/sunflower-token-final-webp.webp?v=1769842039"
                    alt="Sunflower Recovery Token"
                    className="relative w-full h-auto object-contain drop-shadow-2xl"
                    whileHover={{scale: 1.03, rotate: 2}}
                    transition={{duration: 0.5}}
                  />
                </div>
              </div>
            </ScaleIn>

            {/* Right Features */}
            <div className="hidden lg:flex flex-col gap-4">
              <FeatureCard
                icon={<HeartIcon />}
                title="Symbol of Hope"
                description="The sunflower represents new beginnings and growth."
              />
              <FeatureCard
                icon={<SparklesIcon />}
                title="Gift Ready"
                description="Arrives in a premium gift box, perfect for gifting."
              />
            </div>
          </div>

          {/* CTA */}
          <div className="flex justify-center mt-12">
            <Link to="/products/sunflower-token">
              <motion.div
                whileHover={{scale: 1.02}}
                whileTap={{scale: 0.98}}
                transition={{duration: 0.2}}
                className="inline-block"
              >
                <Button variant="primary" size="lg">
                  View Token Details
                </Button>
              </motion.div>
            </Link>
          </div>
        </SectionCard>
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
    <HoverLift lift={-6}>
      <motion.div
        className={`bg-white/[0.03] rounded-xl p-6 border border-white/[0.08] ${
          align === 'right' ? 'lg:text-right' : 'lg:text-left'
        }`}
        whileHover={{
          borderColor: 'rgba(255,255,255,0.15)',
        }}
        transition={{duration: 0.3}}
      >
        <div className={`flex items-center gap-3 mb-3 ${
          align === 'right' ? 'lg:flex-row-reverse' : ''
        }`}>
          <motion.div
            className="w-10 h-10 rounded-lg bg-white/[0.05] flex items-center justify-center flex-shrink-0"
            style={{color: '#B8764F'}}
            whileHover={{scale: 1.1, rotate: 5}}
            transition={{duration: 0.2}}
          >
            {icon}
          </motion.div>
          <h3 className="font-display text-base font-bold text-white">
            {title}
          </h3>
        </div>
        <p className="text-body-sm text-white/50 leading-relaxed">
          {description}
        </p>
      </motion.div>
    </HoverLift>
  );
}

/**
 * Featured Products Grid with Category Cards
 */
function FeaturedProducts({
  products,
}: {
  products: Promise<RecommendedProductsQuery | null>;
}) {
  return (
    <section className="py-20 md:py-28 bg-black border-t border-white/[0.06]">
      <div className="container-standard">
        {/* Section Header */}
        <FadeUp className="mb-12 md:mb-16">
          <div className="text-center">
            <span className="inline-block text-accent text-caption uppercase tracking-[0.25em] font-semibold mb-4">
              Shop Tokens
            </span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4 text-center">
            Find Your Perfect Token
          </h2>
          <div className="max-w-[36rem] mx-auto">
            <p className="text-body-lg text-white/60 text-center">
              Choose from our hand-crafted collection, available in classic bronze
              or vibrant color-printed finishes.
            </p>
          </div>
        </FadeUp>

        {/* Category Cards */}
        <StaggerContainer className="grid md:grid-cols-2 gap-6 lg:gap-8 mb-16" staggerDelay={0.15}>
          {/* Bronze Tokens Card */}
          <StaggerItem>
            <HoverScale scale={1.02}>
              <Link
                to="/collections/bronze-tokens"
                className="group relative rounded-2xl overflow-hidden aspect-[16/9] md:aspect-[4/3] lg:aspect-[16/9] block border border-white/[0.08]"
              >
                {/* Background image placeholder - replace with actual collection image */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#0A0A0A] via-[#111111] to-[#0A0A0A]">
                  {/* Decorative token silhouette */}
                  <motion.div
                    className="absolute top-1/2 right-8 lg:right-16 -translate-y-1/2 w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-full bg-gradient-to-br from-[#FFFF93] to-[#CCCC60] opacity-30 blur-sm"
                    animate={{scale: [1, 1.05, 1]}}
                    transition={{duration: 4, repeat: Infinity}}
                  />
                  <div className="absolute top-1/2 right-10 lg:right-20 -translate-y-1/2 w-28 h-28 md:w-36 md:h-36 lg:w-44 lg:h-44 rounded-full border-4 border-[#FFFF93]/40" />
                </div>

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

                {/* Content */}
                <div className="relative h-full flex flex-col justify-center p-6 md:p-8 lg:p-10">
                  <div className="flex items-center gap-2 mb-2">
                    <BronzeIcon />
                    <span className="text-[#FFFF93] text-caption uppercase tracking-[0.2em] font-semibold">
                      Classic Collection
                    </span>
                  </div>
                  <h3 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">
                    Bronze Tokens
                  </h3>
                  <p className="text-white/70 text-body-sm md:text-body max-w-[20rem] mb-4">
                    Timeless, hand-cast bronze with an antique patina that deepens over time.
                  </p>
                  <motion.span
                    className="inline-flex items-center gap-2 text-[#FFFF93] font-semibold"
                    whileHover={{x: 5}}
                    transition={{duration: 0.2}}
                  >
                    Explore Bronze
                    <ArrowRightIcon />
                  </motion.span>
                </div>

                {/* Hover effect */}
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/[0.03] transition-colors duration-300" />
              </Link>
            </HoverScale>
          </StaggerItem>

          {/* Color Printed Tokens Card */}
          <StaggerItem>
            <HoverScale scale={1.02}>
              <Link
                to="/collections/color-tokens"
                className="group relative rounded-2xl overflow-hidden aspect-[16/9] md:aspect-[4/3] lg:aspect-[16/9] block border border-white/[0.08]"
              >
                {/* Colorful background */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#667eea] via-[#764ba2] to-[#f093fb]">
                  {/* Decorative elements */}
                  <motion.div
                    className="absolute top-1/2 right-8 lg:right-16 -translate-y-1/2 w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-full bg-white/20 blur-sm"
                    animate={{scale: [1, 1.05, 1]}}
                    transition={{duration: 4, repeat: Infinity, delay: 0.5}}
                  />
                  <div className="absolute top-1/2 right-10 lg:right-20 -translate-y-1/2 w-28 h-28 md:w-36 md:h-36 lg:w-44 lg:h-44 rounded-full border-4 border-white/30" />
                  {/* Floating color dots */}
                  <motion.div
                    className="absolute top-6 right-20 w-4 h-4 rounded-full bg-yellow-300/60"
                    animate={{y: [-5, 5, -5]}}
                    transition={{duration: 3, repeat: Infinity}}
                  />
                  <motion.div
                    className="absolute bottom-8 right-32 w-3 h-3 rounded-full bg-cyan-300/60"
                    animate={{y: [5, -5, 5]}}
                    transition={{duration: 3.5, repeat: Infinity}}
                  />
                  <motion.div
                    className="absolute top-1/3 right-8 w-2 h-2 rounded-full bg-pink-300/80"
                    animate={{y: [-3, 3, -3]}}
                    transition={{duration: 2.5, repeat: Infinity}}
                  />
                </div>

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />

                {/* Content */}
                <div className="relative h-full flex flex-col justify-center p-6 md:p-8 lg:p-10">
                  <div className="flex items-center gap-2 mb-2">
                    <ColorPaletteIcon />
                    <span className="text-pink-200 text-caption uppercase tracking-[0.2em] font-semibold">
                      Vibrant Collection
                    </span>
                  </div>
                  <h3 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">
                    Color Printed
                  </h3>
                  <p className="text-white/70 text-body-sm md:text-body max-w-[20rem] mb-4">
                    Bold, vibrant designs with full-color artwork that makes a statement.
                  </p>
                  <motion.span
                    className="inline-flex items-center gap-2 text-pink-200 font-semibold"
                    whileHover={{x: 5}}
                    transition={{duration: 0.2}}
                  >
                    Explore Colors
                    <ArrowRightIcon />
                  </motion.span>
                </div>

                {/* Hover effect */}
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
              </Link>
            </HoverScale>
          </StaggerItem>
        </StaggerContainer>

        {/* Featured Products Header */}
        <FadeUp className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <h3 className="font-display text-xl md:text-2xl font-bold text-white">
              Popular Tokens
            </h3>
            <p className="text-white/50 text-body-sm mt-1">
              Our most loved designs, hand-picked for you
            </p>
          </div>
          <Link to="/collections" className="hidden md:block">
            <motion.div
              whileHover={{scale: 1.02}}
              whileTap={{scale: 0.98}}
            >
              <Button variant="secondary" size="md">
                View All Tokens
              </Button>
            </motion.div>
          </Link>
        </FadeUp>

        {/* Products Grid */}
        <Suspense fallback={<ProductsGridSkeleton />}>
          <Await resolve={products}>
            {(response) => (
              <StaggerContainer className="products-grid" staggerDelay={0.1}>
                {response
                  ? response.products.nodes.map((product) => (
                      <StaggerItem key={product.id}>
                        <HoverLift lift={-8}>
                          <ProductItem
                            product={product}
                            loading="lazy"
                          />
                        </HoverLift>
                      </StaggerItem>
                    ))
                  : null}
              </StaggerContainer>
            )}
          </Await>
        </Suspense>

        {/* Mobile CTA */}
        <FadeUp className="text-center mt-10 md:hidden">
          <Link to="/collections">
            <Button variant="secondary" size="md">
              View All Tokens
            </Button>
          </Link>
        </FadeUp>
      </div>
    </section>
  );
}

/**
 * Category Card Icons
 */
function BronzeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#FFFF93]">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function ColorPaletteIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-200">
      <circle cx="13.5" cy="6.5" r="2.5" />
      <circle cx="19" cy="13" r="2.5" />
      <circle cx="16" cy="19" r="2.5" />
      <circle cx="8" cy="19" r="2.5" />
      <circle cx="5" cy="13" r="2.5" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

/**
 * Brand Story Section - Emotional connection
 */
function BrandStory() {
  return (
    <section className="py-20 md:py-28 bg-black text-white">
      <div className="container-standard">
        <SectionCard className="px-6 py-16 md:px-12 md:py-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image */}
          <SlideIn direction="left" className="relative">
            <div className="relative rounded-2xl overflow-hidden border border-white/[0.08]">
              <motion.img
                src="https://cdn.shopify.com/s/files/1/0752/2733/2779/files/recovery-rise-up-final.webp?v=1769872854"
                alt="Recovery journey"
                className="w-full h-auto object-cover"
                whileHover={{scale: 1.03}}
                transition={{duration: 0.6}}
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary/50 to-transparent" />
            </div>

            {/* Floating stat card */}
            <motion.div
              className="absolute -bottom-6 -right-6 md:right-8 bg-[#111] border border-white/[0.1] rounded-xl p-6 max-w-[200px]"
              initial={{opacity: 0, y: 30, scale: 0.9}}
              whileInView={{opacity: 1, y: 0, scale: 1}}
              viewport={{once: true}}
              transition={{delay: 0.4, duration: 0.5}}
            >
              <motion.div
                className="text-4xl font-display font-bold text-accent mb-1"
                initial={{opacity: 0}}
                whileInView={{opacity: 1}}
                viewport={{once: true}}
                transition={{delay: 0.6}}
              >
                10K+
              </motion.div>
              <p className="text-sm text-white/50">Milestones celebrated</p>
            </motion.div>
          </SlideIn>

          {/* Content */}
          <SlideIn direction="right">
            <span className="inline-block text-accent text-caption uppercase tracking-[0.25em] font-semibold mb-4">
              Our Mission
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6">
              Every Journey Deserves to Be Celebrated
            </h2>
            <p className="text-lg text-white/60 leading-relaxed mb-6">
              Recovery is one of the most courageous journeys a person can take.
              We believe every step forward—whether it's 24 hours or 25 years—deserves
              to be honored with something meaningful and lasting.
            </p>
            <p className="text-lg text-white/60 leading-relaxed mb-8">
              Our hand-crafted bronze tokens serve as tangible reminders of strength,
              hope, and the incredible resilience of the human spirit.
            </p>

            <StaggerContainer className="flex flex-wrap gap-8 mt-10" staggerDelay={0.1}>
              <StaggerItem>
                <div>
                  <div className="text-3xl font-display font-bold text-accent">100%</div>
                  <p className="text-sm text-white/60">Hand-crafted</p>
                </div>
              </StaggerItem>
              <StaggerItem>
                <div>
                  <div className="text-3xl font-display font-bold text-accent">5★</div>
                  <p className="text-sm text-white/60">Customer rating</p>
                </div>
              </StaggerItem>
              <StaggerItem>
                <div>
                  <div className="text-3xl font-display font-bold text-accent">USA</div>
                  <p className="text-sm text-white/60">Made with care</p>
                </div>
              </StaggerItem>
            </StaggerContainer>
          </SlideIn>
        </div>
        </SectionCard>
      </div>
    </section>
  );
}

/**
 * Testimonials Section - Original style with hardcoded testimonials
 * Falls back to animated 5-star widget when Judge.me has no reviews
 */
interface StoreReviewsData {
  reviews: Array<{
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
  total: number;
}

function CustomerReviewsSection({
  reviews,
}: {
  reviews: Promise<StoreReviewsData | null>;
}) {
  // Hardcoded testimonials for the original style
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
    <section className="py-20 md:py-28 bg-black">
      <div className="container-standard">
        <SectionCard className="px-6 py-16 md:px-12 md:py-20">
          {/* Section Header */}
          <FadeUp className="text-center mb-16">
            <span className="inline-block text-accent text-caption uppercase tracking-[0.25em] font-semibold mb-4">
              Testimonials
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white leading-tight">
              Stories That Inspire
            </h2>
          </FadeUp>

          {/* Testimonials Grid */}
          <StaggerContainer className="grid md:grid-cols-3 gap-8" staggerDelay={0.15}>
            {testimonials.map((testimonial, index) => (
              <StaggerItem key={index}>
                <HoverLift lift={-8}>
                  <motion.div
                    className="bg-white/[0.03] rounded-2xl p-8 border border-white/[0.06] relative h-full"
                    whileHover={{
                      borderColor: 'rgba(255,255,255,0.12)',
                    }}
                    transition={{duration: 0.3}}
                  >
                    {/* Quote icon */}
                    <motion.div
                      className="absolute -top-4 left-8 w-8 h-8 bg-white/[0.08] border border-white/[0.1] rounded-full flex items-center justify-center"
                      initial={{scale: 0, rotate: -180}}
                      whileInView={{scale: 1, rotate: 0}}
                      viewport={{once: true}}
                      transition={{delay: 0.2 + index * 0.1, type: 'spring', stiffness: 200}}
                    >
                      <QuoteIcon />
                    </motion.div>

                    <p className="text-body text-white/60 leading-relaxed mb-6 pt-2">
                      "{testimonial.quote}"
                    </p>

                    <div className="flex items-center gap-4">
                      <motion.div
                        className="w-12 h-12 rounded-full bg-white/[0.08] border border-white/[0.1] flex items-center justify-center text-white font-display font-bold"
                        whileHover={{scale: 1.1}}
                        transition={{duration: 0.2}}
                      >
                        {testimonial.avatar}
                      </motion.div>
                      <div>
                        <div className="font-display font-bold text-white">
                          {testimonial.author}
                        </div>
                        <div className="text-caption text-accent">
                          {testimonial.milestone}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </HoverLift>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </SectionCard>
      </div>
    </section>
  );
}

/**
 * Animated 5-Star Widget - For empty state (preserved for future use)
 */
function AnimatedStarWidget() {
  return (
    <motion.div
      className="inline-block relative mb-10"
      initial={{scale: 0.8, opacity: 0}}
      animate={{scale: 1, opacity: 1}}
      transition={{delay: 0.2, type: 'spring', stiffness: 200}}
    >
      <div className="absolute -inset-8 bg-yellow-400/15 blur-3xl rounded-full pointer-events-none" />
      <div className="relative bg-white rounded-3xl px-12 py-10 shadow-xl border border-black/5">
        <div className="flex justify-center gap-2.5 mb-5">
          {[1, 2, 3, 4, 5].map((n) => (
            <motion.div
              key={n}
              initial={{scale: 0, rotate: -180}}
              animate={{scale: 1, rotate: 0}}
              transition={{delay: 0.3 + n * 0.1, type: 'spring', stiffness: 200}}
            >
              <StarIcon className="w-10 h-10 text-yellow-400 fill-yellow-400 drop-shadow-sm" />
            </motion.div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-4">
          <span className="text-4xl font-display font-bold text-primary">5.0</span>
          <div className="text-left">
            <p className="text-sm font-semibold text-primary">Perfect Rating</p>
            <p className="text-xs text-secondary">Expected quality</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Star Icon Component
 */
function StarIcon({className = ''}: {className?: string}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

/**
 * Verified Icon Component
 */
function VerifiedIcon({className = ''}: {className?: string}) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2">
      <path d="M9 12l2 2 4-4" />
      <circle cx="12" cy="12" r="10" />
    </svg>
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
    <section className="py-20 md:py-24 bg-black">
      <div className="container-standard">
        <ScaleIn>
          <SectionCard className="p-10 md:p-16 text-center relative">
            {/* Background decoration */}
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/[0.04] rounded-full blur-[100px]"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.04, 0.08, 0.04],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            <FadeUp className="relative z-10 max-w-[42rem] mx-auto px-4">
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
                Ready to Celebrate Your Milestone?
              </h2>
              <p className="text-lg text-white/50">
                Every journey is worth celebrating. Find the perfect token to honor
                your progress or gift to someone special.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
                <Link to={collection ? `/collections/${collection.handle}` : '/collections'}>
                  <motion.div
                    whileHover={{scale: 1.05}}
                    whileTap={{scale: 0.98}}
                    transition={{duration: 0.2}}
                  >
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full sm:w-auto !px-12"
                    >
                      Shop Now
                    </Button>
                  </motion.div>
                </Link>
                <Link to="/contact">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="w-full sm:w-auto"
                    as="span"
                  >
                    Contact Us
                  </Button>
                </Link>
              </div>
            </FadeUp>
          </SectionCard>
        </ScaleIn>
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
        <motion.div
          key={i}
          className="animate-pulse"
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          transition={{delay: i * 0.1}}
        >
          <div className="aspect-[4/5] bg-white/[0.05] rounded-lg" />
          <div className="p-4 space-y-3">
            <div className="h-5 bg-white/[0.05] rounded w-3/4" />
            <div className="h-5 bg-white/[0.05] rounded w-1/3" />
          </div>
        </motion.div>
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

function PercentIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="5" x2="5" y2="19" />
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
  );
}

function GiftIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M12 8v13" />
      <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
      <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 4.8 0 0 1 12 8a4.8 4.8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
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
