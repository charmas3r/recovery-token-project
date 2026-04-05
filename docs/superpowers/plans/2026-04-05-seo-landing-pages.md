# SEO Landing Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build 60 SEO landing pages (15 commercial, 15 milestone, 30 glossary detail) targeting 250+ recovery token keywords, each funneling visitors to the shop.

**Architecture:** Three template tiers (Commercial, Milestone, Glossary Detail) consume page data from a single `app/data/seo-pages.ts` file. Two dynamic route files handle all 60 pages. Shared sub-components handle product cards, FAQ accordions, breadcrumbs, and internal linking. Products are fetched live from Storefront API; content is hardcoded for CMS migration later.

**Tech Stack:** React Router v7, TypeScript, Tailwind v4, Radix UI (via existing Accordion), Shopify Storefront API (GraphQL), Sanity CMS (glossary terms), existing `buildMeta()` + `JsonLd` helpers.

**Spec:** `docs/superpowers/specs/2026-04-05-seo-landing-pages-design.md`

---

## File Structure

### New Files

```
app/
  data/
    seo-pages.ts                              # SEOPage type definitions + Map<string, SEOPage> with all 60 pages
  graphql/
    seo-queries.ts                            # GraphQL queries: COLLECTION_WITH_PRODUCTS_QUERY, PRODUCTS_BY_HANDLES_QUERY
  components/
    seo/
      CommercialLandingTemplate.tsx            # Template for /sobriety-coins, /aa-coins, etc.
      MilestoneLandingTemplate.tsx             # Template for /1-year-sobriety-coin, etc.
      GlossaryDetailTemplate.tsx              # Template for /resources/glossary/{term}
      SEOProductCard.tsx                       # Product card with live Storefront API data
      SEOFaqAccordion.tsx                      # FAQ accordion + FAQPage JSON-LD schema
      SEORelatedPages.tsx                      # Grid of internal link cards
      SEOTrustBar.tsx                          # Trust indicators bar
      SEOMilestoneNav.tsx                      # Prev/next milestone navigation
  routes/
    ($locale).$seoPage.tsx                    # Dynamic route for commercial + milestone pages
    ($locale).resources.glossary.$term.tsx     # Glossary detail route
```

### Modified Files

```
app/routes/
  ($locale).resources.glossary.tsx              # Grid → directory (terms link out to detail pages)
  ($locale).sitemap.custom.$page[.xml].tsx    # Auto-generate entries from seo-pages.ts
app/root.tsx                                  # Add Organization JSON-LD schema
```

---

## Task 1: Data Types & GraphQL Queries

**Files:**
- Create: `app/data/seo-pages.ts` (types only, no page data yet)
- Create: `app/graphql/seo-queries.ts`

This task defines the TypeScript types and GraphQL queries that everything else builds on.

- [ ] **Step 1: Create `app/data/seo-pages.ts` with type definitions**

```typescript
/**
 * SEO Landing Pages — Type Definitions & Data Store
 *
 * All page content lives here as a Map<string, SEOPage>.
 * CMS migration: replace getSEOPage() with a Sanity/CMS fetch.
 */

export type SEOPageType = 'commercial' | 'milestone' | 'glossary';

export type SchemaType = 'breadcrumb' | 'faq' | 'definedTerm' | 'webPage';

export interface FAQItem {
  question: string;
  answer: string;
}

export interface ContentSection {
  type: 'text' | 'productShowcase' | 'comparison' | 'testimonial' | 'cta';
  heading?: string;
  body: string;
  productHandles?: string[];
  collectionHandle?: string;
}

export interface SEOPage {
  slug: string;
  type: SEOPageType;
  title: string;
  metaTitle: string;
  metaDescription: string;
  canonicalPath: string;

  eyebrow: string;
  heroDescription: string;
  sections: ContentSection[];
  faq: FAQItem[];

  primaryCTA: {
    label: string;
    href: string;
  };
  featuredCollectionHandle?: string;
  featuredProductHandles?: string[];
  relatedPageSlugs: string[];

  milestone?: {
    duration: string;
    significance: string;
    traditionalColor?: string;
    nextMilestoneSlug?: string;
    prevMilestoneSlug?: string;
  };

  glossary?: {
    definition: string;
    extendedContent: string;
    category: string;
    relatedTermSlugs: string[];
    productLink?: string;
  };

  schema: SchemaType[];
}

// --- Data Store ---

const SEO_PAGES = new Map<string, SEOPage>();

export function getSEOPage(slug: string): SEOPage | undefined {
  return SEO_PAGES.get(slug);
}

export function getAllSEOPages(): SEOPage[] {
  return Array.from(SEO_PAGES.values());
}

export function getSEOPagesByType(type: SEOPageType): SEOPage[] {
  return getAllSEOPages().filter((p) => p.type === type);
}

/**
 * Register a page in the data store.
 * Called at module level by page data files.
 */
export function registerSEOPage(page: SEOPage): void {
  SEO_PAGES.set(page.slug, page);
}
```

- [ ] **Step 2: Create `app/graphql/seo-queries.ts` with Storefront API queries**

These queries match the existing `PRODUCT_ITEM_FRAGMENT` pattern from `app/routes/($locale).collections.$handle.tsx` but are self-contained for SEO pages.

```typescript
/**
 * GraphQL queries for SEO landing pages.
 *
 * Fetches products by handle and collections with products
 * for product showcases on landing pages.
 */

export const SEO_PRODUCT_FRAGMENT = `#graphql
  fragment SEOMoneyProduct on MoneyV2 {
    amount
    currencyCode
  }
  fragment SEOProduct on Product {
    id
    handle
    title
    featuredImage {
      id
      altText
      url
      width
      height
    }
    priceRange {
      minVariantPrice {
        ...SEOMoneyProduct
      }
      maxVariantPrice {
        ...SEOMoneyProduct
      }
    }
  }
` as const;

export const COLLECTION_WITH_PRODUCTS_QUERY = `#graphql
  ${SEO_PRODUCT_FRAGMENT}
  query SEOCollectionWithProducts(
    $handle: String!
    $first: Int!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      products(first: $first) {
        nodes {
          ...SEOProduct
        }
      }
    }
  }
` as const;

export const PRODUCTS_BY_HANDLES_QUERY = `#graphql
  ${SEO_PRODUCT_FRAGMENT}
  query SEOProductsByHandles(
    $first: Int!
    $query: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    products(first: $first, query: $query) {
      nodes {
        ...SEOProduct
      }
    }
  }
` as const;
```

- [ ] **Step 3: Run typecheck to verify**

Run: `npx tsc --noEmit`
Expected: No errors related to the new files.

- [ ] **Step 4: Commit**

```bash
git add app/data/seo-pages.ts app/graphql/seo-queries.ts
git commit -m "feat(seo): add SEO page type definitions and GraphQL queries"
```

---

## Task 2: Shared Sub-components

**Files:**
- Create: `app/components/seo/SEOProductCard.tsx`
- Create: `app/components/seo/SEOFaqAccordion.tsx`
- Create: `app/components/seo/SEORelatedPages.tsx`
- Create: `app/components/seo/SEOTrustBar.tsx`
- Create: `app/components/seo/SEOMilestoneNav.tsx`

These components are used by all three templates. Build them before the templates.

- [ ] **Step 1: Create `app/components/seo/SEOProductCard.tsx`**

This wraps the product data in a dark-theme card with a "Shop Now" link. It does NOT reuse `ProductItem` because SEO pages need a simpler card without variant URL logic, and with an explicit "Shop Now" CTA button.

```typescript
/**
 * SEOProductCard — Product card for SEO landing pages
 *
 * Renders a product with image, title, price, and "Shop Now" link.
 * Uses live Storefront API data passed from the route loader.
 */

import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';

interface SEOProductCardProps {
  product: {
    id: string;
    handle: string;
    title: string;
    featuredImage?: {
      id?: string;
      altText?: string | null;
      url: string;
      width?: number;
      height?: number;
    } | null;
    priceRange: {
      minVariantPrice: {
        amount: string;
        currencyCode: string;
      };
    };
  };
  loading?: 'eager' | 'lazy';
}

export function SEOProductCard({product, loading}: SEOProductCardProps) {
  return (
    <Link
      to={`/products/${product.handle}`}
      prefetch="intent"
      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded-2xl"
    >
      <div
        className="rounded-2xl overflow-hidden border border-white/[0.08] transition-all duration-300 hover:border-white/[0.15] hover:-translate-y-1"
        style={{
          background:
            'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)',
        }}
      >
        {product.featuredImage && (
          <div className="aspect-[4/5] relative overflow-hidden bg-black/40">
            <Image
              alt={product.featuredImage.altText || product.title}
              aspectRatio="4/5"
              data={product.featuredImage}
              loading={loading}
              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </div>
        )}
        <div className="p-5">
          <h3 className="text-base md:text-lg font-display font-bold uppercase tracking-tight line-clamp-2 mb-2 text-white group-hover:text-white/80 transition-colors">
            {product.title}
          </h3>
          <p className="text-lg md:text-xl font-bold text-white/90 mb-3">
            <Money data={product.priceRange.minVariantPrice} />
          </p>
          <span className="inline-block text-accent text-sm font-semibold group-hover:underline">
            Shop Now &rarr;
          </span>
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Create `app/components/seo/SEOFaqAccordion.tsx`**

Wraps the existing `Accordion` + `AccordionItem` components and emits `FAQPage` JSON-LD.

```typescript
/**
 * SEOFaqAccordion — FAQ section with FAQPage schema
 *
 * Renders an accessible accordion from FAQItem[] data
 * and emits FAQPage JSON-LD for rich snippets.
 */

import {Accordion, AccordionItem} from '~/components/ui/Accordion';
import {JsonLd} from '~/components/seo/JsonLd';
import type {FAQItem} from '~/data/seo-pages';

interface SEOFaqAccordionProps {
  items: FAQItem[];
  className?: string;
}

export function SEOFaqAccordion({items, className = ''}: SEOFaqAccordionProps) {
  if (items.length === 0) return null;

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <section className={className}>
      <JsonLd data={faqSchema} />
      <h2
        className="font-display text-subsection text-white mb-8"
        style={{textAlign: 'center'}}
      >
        Frequently Asked Questions
      </h2>
      <Accordion type="single" className="max-w-3xl mx-auto">
        {items.map((item) => (
          <AccordionItem
            key={item.question}
            id={item.question.replace(/\s+/g, '-').toLowerCase()}
            trigger={item.question}
          >
            {item.answer}
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
```

- [ ] **Step 3: Create `app/components/seo/SEORelatedPages.tsx`**

Grid of internal link cards to other SEO pages.

```typescript
/**
 * SEORelatedPages — Internal link card grid
 *
 * Renders related SEO page links as dark-theme cards
 * for internal link authority distribution.
 */

import {Link} from 'react-router';
import {getSEOPage} from '~/data/seo-pages';

interface SEORelatedPagesProps {
  slugs: string[];
  className?: string;
}

export function SEORelatedPages({slugs, className = ''}: SEORelatedPagesProps) {
  const pages = slugs
    .map((slug) => getSEOPage(slug))
    .filter(Boolean);

  if (pages.length === 0) return null;

  return (
    <section className={className}>
      <h2
        className="font-display text-subsection text-white mb-8"
        style={{textAlign: 'center'}}
      >
        Related Pages
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {pages.map((page) => (
          <Link
            key={page!.slug}
            to={`/${page!.canonicalPath}`}
            prefetch="intent"
            className="group block rounded-2xl border border-white/[0.08] hover:border-white/[0.15] p-6 transition-all duration-300 hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            style={{
              background:
                'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)',
            }}
          >
            <span className="inline-block text-accent text-caption uppercase tracking-[0.25em] font-semibold mb-2">
              {page!.eyebrow}
            </span>
            <h3 className="text-white font-bold text-lg mb-2 group-hover:text-accent transition-colors">
              {page!.title}
            </h3>
            <p className="text-white/50 text-sm line-clamp-2">
              {page!.heroDescription}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Create `app/components/seo/SEOTrustBar.tsx`**

Horizontal trust indicators bar, matching the homepage style.

```typescript
/**
 * SEOTrustBar — Trust indicators bar
 *
 * Displays key trust signals: handcrafted, free shipping, satisfaction guarantee.
 */

import {Shield, Truck, Star} from 'lucide-react';

interface SEOTrustBarProps {
  className?: string;
}

export function SEOTrustBar({className = ''}: SEOTrustBarProps) {
  const items = [
    {icon: Star, label: 'Handcrafted Quality'},
    {icon: Truck, label: 'Free Shipping'},
    {icon: Shield, label: 'Satisfaction Guaranteed'},
  ];

  return (
    <div
      className={`flex flex-wrap items-center justify-center gap-8 py-6 border-y border-white/[0.08] ${className}`}
    >
      {items.map(({icon: Icon, label}) => (
        <div key={label} className="flex items-center gap-2 text-white/50">
          <Icon className="w-5 h-5 text-accent" />
          <span className="text-sm font-medium">{label}</span>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Create `app/components/seo/SEOMilestoneNav.tsx`**

Prev/next milestone navigation for milestone pages.

```typescript
/**
 * SEOMilestoneNav — Prev/next milestone navigation
 *
 * Creates a linked chain through all milestone pages.
 */

import {Link} from 'react-router';
import {ChevronLeft, ChevronRight} from 'lucide-react';
import {getSEOPage} from '~/data/seo-pages';

interface SEOMilestoneNavProps {
  prevSlug?: string;
  nextSlug?: string;
  className?: string;
}

export function SEOMilestoneNav({
  prevSlug,
  nextSlug,
  className = '',
}: SEOMilestoneNavProps) {
  const prev = prevSlug ? getSEOPage(prevSlug) : undefined;
  const next = nextSlug ? getSEOPage(nextSlug) : undefined;

  if (!prev && !next) return null;

  return (
    <nav
      aria-label="Milestone navigation"
      className={`flex items-center justify-between gap-4 py-8 border-t border-white/[0.08] ${className}`}
    >
      {prev ? (
        <Link
          to={`/${prev.canonicalPath}`}
          prefetch="intent"
          className="flex items-center gap-2 text-white/50 hover:text-accent transition-colors group"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <div>
            <span className="text-xs uppercase tracking-wider block">
              Previous
            </span>
            <span className="text-white font-medium">{prev.title}</span>
          </div>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link
          to={`/${next.canonicalPath}`}
          prefetch="intent"
          className="flex items-center gap-2 text-white/50 hover:text-accent transition-colors text-right group"
        >
          <div>
            <span className="text-xs uppercase tracking-wider block">
              Next
            </span>
            <span className="text-white font-medium">{next.title}</span>
          </div>
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      ) : (
        <div />
      )}
    </nav>
  );
}
```

- [ ] **Step 6: Run typecheck**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 7: Commit**

```bash
git add app/components/seo/
git commit -m "feat(seo): add shared sub-components for SEO landing pages"
```

---

## Task 3: Commercial Landing Template

**Files:**
- Create: `app/components/seo/CommercialLandingTemplate.tsx`

- [ ] **Step 1: Create the template**

```typescript
/**
 * CommercialLandingTemplate — Template for high-volume commercial SEO pages
 *
 * Used by: /sobriety-coins, /aa-coins, /recovery-gifts, etc.
 * Layout: Hero → Trust Bar → Content Sections → FAQ → Related Pages → Final CTA
 */

import {Link} from 'react-router';
import {Breadcrumbs} from '~/components/ui/Breadcrumbs';
import {JsonLd} from '~/components/seo/JsonLd';
import {Button} from '~/components/ui/Button';
import {SEOProductCard} from '~/components/seo/SEOProductCard';
import {SEOFaqAccordion} from '~/components/seo/SEOFaqAccordion';
import {SEORelatedPages} from '~/components/seo/SEORelatedPages';
import {SEOTrustBar} from '~/components/seo/SEOTrustBar';
import type {SEOPage} from '~/data/seo-pages';

interface CommercialLandingTemplateProps {
  page: SEOPage;
  products: Array<{
    id: string;
    handle: string;
    title: string;
    featuredImage?: {
      id?: string;
      altText?: string | null;
      url: string;
      width?: number;
      height?: number;
    } | null;
    priceRange: {
      minVariantPrice: {amount: string; currencyCode: string};
    };
  }>;
}

export function CommercialLandingTemplate({
  page,
  products,
}: CommercialLandingTemplateProps) {
  const breadcrumbItems = [{label: page.title}];

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://coinplugz.com/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: page.title,
        item: `https://coinplugz.com/${page.canonicalPath}`,
      },
    ],
  };

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.title,
    description: page.metaDescription,
    url: `https://coinplugz.com/${page.canonicalPath}`,
  };

  return (
    <div className="min-h-screen">
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={webPageSchema} />

      {/* Hero */}
      <section className="container-standard pt-12 pb-8">
        <Breadcrumbs items={breadcrumbItems} className="mb-8" />
        <div
          style={{
            textAlign: 'center',
            maxWidth: '42rem',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              color: '#B8764F',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.25em',
              fontWeight: 600,
              marginBottom: '1rem',
            }}
          >
            {page.eyebrow}
          </span>
          <h1
            style={{
              fontFamily: 'var(--font-display, serif)',
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 700,
              color: '#FFFFFF',
              lineHeight: 1.1,
              marginBottom: '1rem',
            }}
          >
            {page.title}
          </h1>
          <p
            style={{
              fontSize: '1.125rem',
              lineHeight: 1.6,
              color: 'rgba(255,255,255,0.5)',
              maxWidth: '36rem',
              marginLeft: 'auto',
              marginRight: 'auto',
              marginBottom: '2rem',
            }}
          >
            {page.heroDescription}
          </p>
          <Link to={page.primaryCTA.href} prefetch="intent">
            <Button
              variant="primary"
              size="lg"
              className="!bg-accent !text-white"
            >
              {page.primaryCTA.label}
            </Button>
          </Link>
        </div>
      </section>

      {/* Trust Bar */}
      <div className="container-standard">
        <SEOTrustBar />
      </div>

      {/* Content Sections */}
      <div className="container-standard py-16 space-y-16">
        {page.sections.map((section, index) => {
          if (section.type === 'text') {
            return (
              <section key={index}>
                {section.heading && (
                  <h2 className="font-display text-subsection text-white mb-4">
                    {section.heading}
                  </h2>
                )}
                <div className="text-white/50 leading-relaxed max-w-3xl space-y-4">
                  {section.body.split('\n\n').map((paragraph, pIdx) => (
                    <p key={pIdx}>{paragraph}</p>
                  ))}
                </div>
              </section>
            );
          }

          if (section.type === 'productShowcase' && products.length > 0) {
            return (
              <section key={index}>
                {section.heading && (
                  <h2 className="font-display text-subsection text-white mb-8">
                    {section.heading}
                  </h2>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {products.slice(0, 4).map((product, pIdx) => (
                    <SEOProductCard
                      key={product.id}
                      product={product}
                      loading={pIdx < 2 ? 'eager' : 'lazy'}
                    />
                  ))}
                </div>
              </section>
            );
          }

          return null;
        })}
      </div>

      {/* FAQ */}
      {page.faq.length > 0 && (
        <div className="container-standard pb-16">
          <SEOFaqAccordion items={page.faq} />
        </div>
      )}

      {/* Related Pages */}
      {page.relatedPageSlugs.length > 0 && (
        <div className="container-standard pb-16">
          <SEORelatedPages slugs={page.relatedPageSlugs} />
        </div>
      )}

      {/* Final CTA */}
      <section className="container-standard pb-20">
        <div
          className="rounded-2xl border border-white/[0.08] p-12"
          style={{
            background:
              'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)',
            textAlign: 'center',
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-display, serif)',
              fontSize: '1.875rem',
              fontWeight: 700,
              color: '#FFFFFF',
              marginBottom: '1rem',
            }}
          >
            Ready to Shop?
          </h2>
          <p
            style={{
              color: 'rgba(255,255,255,0.5)',
              marginBottom: '2rem',
              maxWidth: '28rem',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            Browse our handcrafted collection of premium recovery tokens.
          </p>
          <Link to={page.primaryCTA.href} prefetch="intent">
            <Button
              variant="primary"
              size="lg"
              className="!bg-accent !text-white"
            >
              {page.primaryCTA.label}
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Run typecheck**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add app/components/seo/CommercialLandingTemplate.tsx
git commit -m "feat(seo): add CommercialLandingTemplate"
```

---

## Task 4: Milestone Landing Template

**Files:**
- Create: `app/components/seo/MilestoneLandingTemplate.tsx`

- [ ] **Step 1: Create the template**

```typescript
/**
 * MilestoneLandingTemplate — Template for milestone-specific SEO pages
 *
 * Used by: /1-year-sobriety-coin, /90-day-sobriety-coin, etc.
 * Layout: Hero → Significance → Products → Content → Milestone Nav → FAQ → Related → CTA
 */

import {Link} from 'react-router';
import {Breadcrumbs} from '~/components/ui/Breadcrumbs';
import {JsonLd} from '~/components/seo/JsonLd';
import {Button} from '~/components/ui/Button';
import {SEOProductCard} from '~/components/seo/SEOProductCard';
import {SEOFaqAccordion} from '~/components/seo/SEOFaqAccordion';
import {SEORelatedPages} from '~/components/seo/SEORelatedPages';
import {SEOMilestoneNav} from '~/components/seo/SEOMilestoneNav';
import type {SEOPage} from '~/data/seo-pages';

interface MilestoneLandingTemplateProps {
  page: SEOPage;
  products: Array<{
    id: string;
    handle: string;
    title: string;
    featuredImage?: {
      id?: string;
      altText?: string | null;
      url: string;
      width?: number;
      height?: number;
    } | null;
    priceRange: {
      minVariantPrice: {amount: string; currencyCode: string};
    };
  }>;
}

export function MilestoneLandingTemplate({
  page,
  products,
}: MilestoneLandingTemplateProps) {
  const milestone = page.milestone!;

  const breadcrumbItems = [
    {label: 'Sobriety Milestones', href: '/sobriety-coins'},
    {label: page.title},
  ];

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://coinplugz.com/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Sobriety Milestones',
        item: 'https://coinplugz.com/sobriety-coins',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: page.title,
        item: `https://coinplugz.com/${page.canonicalPath}`,
      },
    ],
  };

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.title,
    description: page.metaDescription,
    url: `https://coinplugz.com/${page.canonicalPath}`,
  };

  return (
    <div className="min-h-screen">
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={webPageSchema} />

      {/* Hero */}
      <section className="container-standard pt-12 pb-8">
        <Breadcrumbs items={breadcrumbItems} className="mb-8" />
        <div
          style={{
            textAlign: 'center',
            maxWidth: '42rem',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              color: '#B8764F',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.25em',
              fontWeight: 600,
              marginBottom: '1rem',
            }}
          >
            {page.eyebrow}
          </span>
          <h1
            style={{
              fontFamily: 'var(--font-display, serif)',
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 700,
              color: '#FFFFFF',
              lineHeight: 1.1,
              marginBottom: '1rem',
            }}
          >
            {page.title}
          </h1>
          <p
            style={{
              fontSize: '1.125rem',
              lineHeight: 1.6,
              color: 'rgba(255,255,255,0.5)',
              maxWidth: '36rem',
              marginLeft: 'auto',
              marginRight: 'auto',
              marginBottom: '1rem',
            }}
          >
            {page.heroDescription}
          </p>
          {milestone.traditionalColor && (
            <span className="inline-block rounded-full bg-white/[0.05] border border-white/[0.08] px-4 py-1.5 text-sm text-white/60 mb-4">
              Traditional Color: {milestone.traditionalColor}
            </span>
          )}
          <div style={{marginTop: '1.5rem'}}>
            <Link to={page.primaryCTA.href} prefetch="intent">
              <Button
                variant="primary"
                size="lg"
                className="!bg-accent !text-white"
              >
                {page.primaryCTA.label}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Milestone Significance */}
      <section className="container-standard py-12">
        <div
          className="rounded-2xl border border-white/[0.08] p-8 md:p-12 max-w-3xl mx-auto"
          style={{
            background:
              'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)',
          }}
        >
          <h2 className="font-display text-subsection text-white mb-4">
            What {milestone.duration} Means
          </h2>
          <p className="text-white/50 leading-relaxed text-lg">
            {milestone.significance}
          </p>
        </div>
      </section>

      {/* Featured Products */}
      {products.length > 0 && (
        <section className="container-standard py-12">
          <h2
            className="font-display text-subsection text-white mb-8"
            style={{textAlign: 'center'}}
          >
            {milestone.duration} Recovery Tokens
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 4).map((product, idx) => (
              <SEOProductCard
                key={product.id}
                product={product}
                loading={idx < 2 ? 'eager' : 'lazy'}
              />
            ))}
          </div>
        </section>
      )}

      {/* Content Sections */}
      {page.sections.length > 0 && (
        <div className="container-standard py-12 space-y-12">
          {page.sections.map((section, index) => {
            if (section.type === 'text') {
              return (
                <section key={index}>
                  {section.heading && (
                    <h2 className="font-display text-subsection text-white mb-4">
                      {section.heading}
                    </h2>
                  )}
                  <div className="text-white/50 leading-relaxed max-w-3xl space-y-4">
                    {section.body.split('\n\n').map((paragraph, pIdx) => (
                      <p key={pIdx}>{paragraph}</p>
                    ))}
                  </div>
                </section>
              );
            }
            return null;
          })}
        </div>
      )}

      {/* Milestone Navigation */}
      <div className="container-standard">
        <SEOMilestoneNav
          prevSlug={milestone.prevMilestoneSlug}
          nextSlug={milestone.nextMilestoneSlug}
        />
      </div>

      {/* FAQ */}
      {page.faq.length > 0 && (
        <div className="container-standard py-16">
          <SEOFaqAccordion items={page.faq} />
        </div>
      )}

      {/* Related Pages */}
      {page.relatedPageSlugs.length > 0 && (
        <div className="container-standard pb-16">
          <SEORelatedPages slugs={page.relatedPageSlugs} />
        </div>
      )}

      {/* Final CTA */}
      <section className="container-standard pb-20">
        <div
          className="rounded-2xl border border-white/[0.08] p-12"
          style={{
            background:
              'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)',
            textAlign: 'center',
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-display, serif)',
              fontSize: '1.875rem',
              fontWeight: 700,
              color: '#FFFFFF',
              marginBottom: '1rem',
            }}
          >
            Celebrate {milestone.duration} of Recovery
          </h2>
          <p
            style={{
              color: 'rgba(255,255,255,0.5)',
              marginBottom: '2rem',
              maxWidth: '28rem',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            Find the perfect token to mark this incredible milestone.
          </p>
          <Link to={page.primaryCTA.href} prefetch="intent">
            <Button
              variant="primary"
              size="lg"
              className="!bg-accent !text-white"
            >
              {page.primaryCTA.label}
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Run typecheck**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add app/components/seo/MilestoneLandingTemplate.tsx
git commit -m "feat(seo): add MilestoneLandingTemplate"
```

---

## Task 5: Glossary Detail Template

**Files:**
- Create: `app/components/seo/GlossaryDetailTemplate.tsx`

- [ ] **Step 1: Create the template**

```typescript
/**
 * GlossaryDetailTemplate — Template for individual glossary term pages
 *
 * Used by: /resources/glossary/sobriety-coin, etc.
 * Layout: Breadcrumb → Definition → Extended Content → Products → Related Terms → Back link
 */

import {Link} from 'react-router';
import {Breadcrumbs} from '~/components/ui/Breadcrumbs';
import {JsonLd} from '~/components/seo/JsonLd';
import {Button} from '~/components/ui/Button';
import {SEOProductCard} from '~/components/seo/SEOProductCard';
import {SEOFaqAccordion} from '~/components/seo/SEOFaqAccordion';
import {getSEOPage} from '~/data/seo-pages';
import type {SEOPage} from '~/data/seo-pages';
import type {GlossaryTerm} from '~/data/glossary-terms';

interface GlossaryDetailTemplateProps {
  page: SEOPage;
  sanityTerm: GlossaryTerm;
  products: Array<{
    id: string;
    handle: string;
    title: string;
    featuredImage?: {
      id?: string;
      altText?: string | null;
      url: string;
      width?: number;
      height?: number;
    } | null;
    priceRange: {
      minVariantPrice: {amount: string; currencyCode: string};
    };
  }>;
}

export function GlossaryDetailTemplate({
  page,
  sanityTerm,
  products,
}: GlossaryDetailTemplateProps) {
  const glossary = page.glossary!;

  const breadcrumbItems = [
    {label: 'Resources', href: '/resources'},
    {label: 'Glossary', href: '/resources/glossary'},
    {label: sanityTerm.name},
  ];

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://coinplugz.com/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Resources',
        item: 'https://coinplugz.com/resources',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Glossary',
        item: 'https://coinplugz.com/resources/glossary',
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: sanityTerm.name,
        item: `https://coinplugz.com/${page.canonicalPath}`,
      },
    ],
  };

  const definedTermSchema = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    name: sanityTerm.name,
    description: sanityTerm.definition,
    inDefinedTermSet: 'https://coinplugz.com/resources/glossary',
  };

  // Build related term links from glossary slugs
  const relatedTermPages = glossary.relatedTermSlugs
    .map((slug) => getSEOPage(`resources/glossary/${slug}`))
    .filter(Boolean);

  return (
    <div className="min-h-screen">
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={definedTermSchema} />

      {/* Header */}
      <section className="container-standard pt-12 pb-8">
        <Breadcrumbs items={breadcrumbItems} className="mb-8" />
        <div style={{maxWidth: '42rem'}}>
          <span
            style={{
              display: 'inline-block',
              color: '#B8764F',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.25em',
              fontWeight: 600,
              marginBottom: '1rem',
            }}
          >
            {glossary.category}
          </span>
          <h1
            style={{
              fontFamily: 'var(--font-display, serif)',
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 700,
              color: '#FFFFFF',
              lineHeight: 1.1,
              marginBottom: '1.5rem',
            }}
          >
            {sanityTerm.name}
          </h1>
          <p className="text-lg text-white/60 leading-relaxed border-l-2 border-accent pl-4">
            {sanityTerm.definition}
          </p>
        </div>
      </section>

      {/* Extended Content */}
      <section className="container-standard py-12">
        <div className="text-white/50 leading-relaxed max-w-3xl space-y-4">
          {glossary.extendedContent.split('\n\n').map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>
      </section>

      {/* Related Products */}
      {products.length > 0 && (
        <section className="container-standard py-12">
          <h2 className="font-display text-subsection text-white mb-8">
            Shop {sanityTerm.name}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
            {products.slice(0, 2).map((product, idx) => (
              <SEOProductCard
                key={product.id}
                product={product}
                loading={idx === 0 ? 'eager' : 'lazy'}
              />
            ))}
          </div>
          {page.primaryCTA && (
            <div className="mt-8">
              <Link to={page.primaryCTA.href} prefetch="intent">
                <Button variant="secondary" className="!border-white/30 !text-white">
                  {page.primaryCTA.label} &rarr;
                </Button>
              </Link>
            </div>
          )}
        </section>
      )}

      {/* FAQ */}
      {page.faq.length > 0 && (
        <div className="container-standard py-12">
          <SEOFaqAccordion items={page.faq} />
        </div>
      )}

      {/* Related Terms */}
      {relatedTermPages.length > 0 && (
        <section className="container-standard py-12">
          <h2 className="font-display text-subsection text-white mb-8">
            Related Terms
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedTermPages.map((relPage) => (
              <Link
                key={relPage!.slug}
                to={`/${relPage!.canonicalPath}`}
                prefetch="intent"
                className="group block rounded-2xl border border-white/[0.08] hover:border-white/[0.15] p-6 transition-all duration-300 hover:-translate-y-1"
                style={{
                  background:
                    'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)',
                }}
              >
                <h3 className="text-white font-bold mb-2 group-hover:text-accent transition-colors">
                  {relPage!.title}
                </h3>
                <p className="text-white/50 text-sm line-clamp-2">
                  {relPage!.heroDescription}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Back to Glossary */}
      <div className="container-standard pb-20">
        <Link
          to="/resources/glossary"
          className="inline-flex items-center gap-2 text-white/50 hover:text-accent transition-colors"
        >
          &larr; Back to Glossary
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Run typecheck**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add app/components/seo/GlossaryDetailTemplate.tsx
git commit -m "feat(seo): add GlossaryDetailTemplate"
```

---

## Task 6: Dynamic Routes

**Files:**
- Create: `app/routes/($locale).$seoPage.tsx`
- Create: `app/routes/($locale).resources.glossary.$term.tsx`

- [ ] **Step 1: Create `app/routes/($locale).$seoPage.tsx`**

This single route handles all 30 commercial + milestone pages with flat URLs.

```typescript
/**
 * SEO Landing Page — Dynamic Route
 *
 * Handles all commercial and milestone SEO pages with flat URLs.
 * Static routes (about, cart, etc.) take priority over this dynamic segment.
 * Unknown slugs return 404.
 */

import {useLoaderData} from 'react-router';
import type {Route} from './+types/$seoPage';
import {getSEOPage} from '~/data/seo-pages';
import {buildMeta} from '~/lib/meta';
import {
  COLLECTION_WITH_PRODUCTS_QUERY,
  PRODUCTS_BY_HANDLES_QUERY,
} from '~/graphql/seo-queries';
import {CommercialLandingTemplate} from '~/components/seo/CommercialLandingTemplate';
import {MilestoneLandingTemplate} from '~/components/seo/MilestoneLandingTemplate';

export const meta: Route.MetaFunction = ({data}) => {
  if (!data?.page) return buildMeta({title: 'Not Found — Coinplugz'});
  return buildMeta({
    title: data.page.metaTitle,
    description: data.page.metaDescription,
  });
};

export async function loader({params, context}: Route.LoaderArgs) {
  const slug = params.seoPage;
  if (!slug) throw new Response('Not Found', {status: 404});

  const page = getSEOPage(slug);
  if (!page || page.type === 'glossary') {
    throw new Response('Not Found', {status: 404});
  }

  // Fetch products — prefer collection, fall back to individual handles
  let products: Array<Record<string, unknown>> = [];

  if (page.featuredCollectionHandle) {
    const {collection} = await context.storefront.query(
      COLLECTION_WITH_PRODUCTS_QUERY,
      {
        variables: {handle: page.featuredCollectionHandle, first: 4},
        cache: context.storefront.CacheLong(),
      },
    );
    products = collection?.products?.nodes ?? [];
  } else if (page.featuredProductHandles && page.featuredProductHandles.length > 0) {
    // Build a query string for product search by handles
    const queryStr = page.featuredProductHandles
      .map((h) => `handle:${h}`)
      .join(' OR ');
    const {products: result} = await context.storefront.query(
      PRODUCTS_BY_HANDLES_QUERY,
      {
        variables: {first: page.featuredProductHandles.length, query: queryStr},
        cache: context.storefront.CacheLong(),
      },
    );
    products = result?.nodes ?? [];
  }

  return {page, products};
}

export default function SEOLandingPage() {
  const {page, products} = useLoaderData<typeof loader>();

  if (page.type === 'milestone') {
    return <MilestoneLandingTemplate page={page} products={products as any} />;
  }

  return <CommercialLandingTemplate page={page} products={products as any} />;
}
```

- [ ] **Step 2: Create `app/routes/($locale).resources.glossary.$term.tsx`**

```typescript
/**
 * Glossary Detail Page — Dynamic Route
 *
 * Individual glossary term pages at /resources/glossary/{term}.
 * Fetches base term from Sanity + extended content from seo-pages.ts.
 */

import {useLoaderData} from 'react-router';
import type {Route} from './+types/resources.glossary.$term';
import {getSEOPage} from '~/data/seo-pages';
import {buildMeta} from '~/lib/meta';
import {getAllGlossaryTerms} from '~/lib/sanity.queries';
import {COLLECTION_WITH_PRODUCTS_QUERY} from '~/graphql/seo-queries';
import {GlossaryDetailTemplate} from '~/components/seo/GlossaryDetailTemplate';

export const meta: Route.MetaFunction = ({data}) => {
  if (!data?.page) return buildMeta({title: 'Not Found — Coinplugz'});
  return buildMeta({
    title: data.page.metaTitle,
    description: data.page.metaDescription,
  });
};

export async function loader({params, context}: Route.LoaderArgs) {
  const termSlug = params.term;
  if (!termSlug) throw new Response('Not Found', {status: 404});

  const page = getSEOPage(`resources/glossary/${termSlug}`);
  if (!page || page.type !== 'glossary') {
    throw new Response('Not Found', {status: 404});
  }

  // Fetch base term from Sanity
  const allTerms = await getAllGlossaryTerms();
  const sanityTerm = allTerms.find((t) => t.slug === termSlug);
  if (!sanityTerm) {
    throw new Response('Term not found', {status: 404});
  }

  // Fetch related products if linked
  let products: Array<Record<string, unknown>> = [];
  if (page.glossary?.productLink) {
    const {collection} = await context.storefront.query(
      COLLECTION_WITH_PRODUCTS_QUERY,
      {
        variables: {handle: page.glossary.productLink, first: 2},
        cache: context.storefront.CacheLong(),
      },
    );
    products = collection?.products?.nodes ?? [];
  }

  return {page, sanityTerm, products};
}

export default function GlossaryDetailPage() {
  const {page, sanityTerm, products} = useLoaderData<typeof loader>();

  return (
    <GlossaryDetailTemplate
      page={page}
      sanityTerm={sanityTerm as any}
      products={products as any}
    />
  );
}
```

- [ ] **Step 3: Run typecheck**

Run: `npx tsc --noEmit`
Expected: May have type warnings for the `as any` casts on product data. These are acceptable because the GraphQL response types are generated and the template props use a manual interface. If strict type errors block compilation, add explicit type assertions in the loader return.

- [ ] **Step 4: Commit**

```bash
git add app/routes/\(\$locale\).\$seoPage.tsx app/routes/\(\$locale\).resources.glossary.\$term.tsx
git commit -m "feat(seo): add dynamic routes for SEO landing pages"
```

---

## Task 7: Seed Page Data — First 3 Commercial Pages

**Files:**
- Modify: `app/data/seo-pages.ts` (add page entries)

Start with the 3 highest-volume commercial pages to validate the end-to-end flow before populating all 60.

- [ ] **Step 1: Add the first 3 commercial page entries to `app/data/seo-pages.ts`**

Append below the `registerSEOPage` function:

```typescript
// ============================================================
// COMMERCIAL LANDING PAGES
// ============================================================

registerSEOPage({
  slug: 'sobriety-coins',
  type: 'commercial',
  title: 'Sobriety Coins',
  metaTitle: 'Sobriety Coins — Premium Recovery Tokens | Coinplugz',
  metaDescription:
    'Shop handcrafted sobriety coins and recovery tokens. Premium quality chips celebrating every milestone from 24 hours to 25+ years. Free shipping.',
  canonicalPath: 'sobriety-coins',
  eyebrow: 'Recovery Tokens',
  heroDescription:
    'Handcrafted sobriety coins that honor every step of your recovery journey. From your first 24 hours to decades of strength, each token is a tangible reminder of how far you\'ve come.',
  primaryCTA: {label: 'Shop All Coins', href: '/collections/all'},
  featuredCollectionHandle: 'all',
  relatedPageSlugs: [
    'aa-coins',
    'na-coins',
    'recovery-medallions',
    'recovery-gifts',
    '1-year-sobriety-coin',
  ],
  sections: [
    {
      type: 'text',
      heading: 'What Are Sobriety Coins?',
      body: 'Sobriety coins — also known as recovery tokens, chips, or medallions — are physical tokens that mark milestones in the recovery journey. Rooted in the traditions of Alcoholics Anonymous and other 12-step programs, these coins serve as a powerful, tangible reminder of commitment and progress.\n\nEach coin represents a specific milestone: 24 hours, 30 days, 90 days, 6 months, 1 year, and beyond. Carrying a sobriety coin is a daily affirmation — a small but mighty symbol that recovery is real, one day at a time.',
    },
    {
      type: 'productShowcase',
      heading: 'Featured Sobriety Coins',
      body: '',
    },
    {
      type: 'text',
      heading: 'Why Sobriety Coins Matter',
      body: 'The tradition of sobriety coins dates back to the 1940s, and their significance has only grown. A coin in your pocket is a constant companion — something to reach for in moments of temptation, something to hold during moments of gratitude.\n\nAt Coinplugz, we believe every milestone deserves to be celebrated with something beautiful. Our coins are handcrafted with premium materials, designed to be treasured for a lifetime.',
    },
  ],
  faq: [
    {
      question: 'What is a sobriety coin?',
      answer:
        'A sobriety coin (also called a recovery token, chip, or medallion) is a physical token given to mark milestones in recovery from addiction. They originated in Alcoholics Anonymous in the 1940s and are now used across many recovery programs.',
    },
    {
      question: 'What milestones do sobriety coins celebrate?',
      answer:
        'Common milestones include 24 hours, 1 week, 30 days, 60 days, 90 days, 6 months, 9 months, and then yearly anniversaries from 1 year onward. Some programs also recognize 18 months.',
    },
    {
      question: 'Do I have to be in AA to carry a sobriety coin?',
      answer:
        'No. While sobriety coins originated in AA, anyone in recovery can carry one. They are meaningful for anyone who wants a tangible reminder of their commitment to sobriety, regardless of program affiliation.',
    },
    {
      question: 'What are sobriety coins made of?',
      answer:
        'Sobriety coins are typically made from bronze, nickel, brass, or aluminum. Premium medallions may be gold or silver plated. At Coinplugz, we use high-quality materials and handcrafted processes for lasting durability.',
    },
  ],
  schema: ['breadcrumb', 'faq', 'webPage'],
});

registerSEOPage({
  slug: 'aa-coins',
  type: 'commercial',
  title: 'AA Coins & Medallions',
  metaTitle: 'AA Coins & Medallions — Alcoholics Anonymous Chips | Coinplugz',
  metaDescription:
    'Shop AA coins, chips, and medallions for every milestone. Premium Alcoholics Anonymous recovery tokens handcrafted to celebrate your sobriety journey.',
  canonicalPath: 'aa-coins',
  eyebrow: 'Alcoholics Anonymous',
  heroDescription:
    'Premium AA coins and medallions crafted to honor your sobriety milestones. From the first 24-hour chip to multi-decade anniversaries, celebrate your AA journey with tokens as meaningful as your recovery.',
  primaryCTA: {label: 'Shop AA Coins', href: '/collections/all'},
  featuredCollectionHandle: 'all',
  relatedPageSlugs: [
    'sobriety-coins',
    'na-coins',
    'aa-chip-colors',
    'sponsor-gifts',
    '1-year-sobriety-coin',
    '90-day-sobriety-coin',
  ],
  sections: [
    {
      type: 'text',
      heading: 'The Tradition of AA Coins',
      body: 'AA coins have been a cornerstone of Alcoholics Anonymous since the 1940s. These small but powerful tokens are presented at meetings to recognize members who reach sobriety milestones — a tradition that transforms an abstract achievement into something you can hold in your hand.\n\nWhether you call them AA chips, AA medallions, or AA tokens, they all carry the same weight: proof that recovery is possible, one day at a time.',
    },
    {
      type: 'productShowcase',
      heading: 'Shop AA Coins',
      body: '',
    },
    {
      type: 'text',
      heading: 'AA Chips vs. AA Medallions',
      body: 'In AA tradition, "chips" typically refer to the simpler, lightweight tokens given at meetings — often made of plastic or aluminum. "Medallions" are the premium, collectible versions — made from bronze, brass, or plated metals, often carried daily as a personal talisman.\n\nAt Coinplugz, all our AA coins are medallion-quality: handcrafted, weighty, and built to last a lifetime.',
    },
  ],
  faq: [
    {
      question: 'What are AA chips?',
      answer:
        'AA chips are small tokens given at Alcoholics Anonymous meetings to mark sobriety milestones. They come in different colors representing different time periods, from 24 hours to multiple years.',
    },
    {
      question: 'What is the difference between AA chips and AA medallions?',
      answer:
        'AA chips are typically simpler tokens (sometimes plastic or aluminum) given at meetings. AA medallions are premium, collectible versions made from higher-quality metals like bronze or gold-plated brass. Both celebrate the same milestones.',
    },
    {
      question: 'What does "To Thine Own Self Be True" mean on AA coins?',
      answer:
        'This inscription, from Shakespeare\'s Hamlet, appears on many AA medallions. In the context of recovery, it means staying honest with yourself about your journey — a core principle of the AA program.',
    },
  ],
  schema: ['breadcrumb', 'faq', 'webPage'],
});

registerSEOPage({
  slug: 'recovery-gifts',
  type: 'commercial',
  title: 'Recovery Gifts',
  metaTitle: 'Recovery Gifts — Meaningful Sobriety Gifts | Coinplugz',
  metaDescription:
    'Find meaningful recovery gifts for someone celebrating sobriety. Handcrafted tokens, personalized coins, and milestone gifts that honor their journey.',
  canonicalPath: 'recovery-gifts',
  eyebrow: 'Gift Guide',
  heroDescription:
    'Looking for a meaningful gift for someone in recovery? Our handcrafted recovery tokens make a lasting, personal gift that celebrates their strength and commitment to sobriety.',
  primaryCTA: {label: 'Shop Recovery Gifts', href: '/collections/all'},
  featuredCollectionHandle: 'all',
  relatedPageSlugs: [
    'sobriety-gifts-for-women',
    'sobriety-gifts-for-men',
    'sponsor-gifts',
    'custom-sobriety-coins',
    '1-year-sobriety-coin',
  ],
  sections: [
    {
      type: 'text',
      heading: 'Why Recovery Tokens Make the Best Gifts',
      body: 'A recovery gift should honor the journey without trivializing it. Recovery tokens are one of the few gifts that truly understand the weight of what sobriety means — they\'re rooted in decades of tradition, carried daily as a personal talisman, and designed to last a lifetime.\n\nWhether you\'re a sponsor celebrating a sponsee\'s milestone, a family member honoring a loved one, or a friend showing support, a recovery token says "I see your strength, and I\'m proud of you."',
    },
    {
      type: 'productShowcase',
      heading: 'Popular Recovery Gifts',
      body: '',
    },
    {
      type: 'text',
      heading: 'Gift Ideas by Occasion',
      body: 'For sobriety anniversaries: Choose a milestone-specific coin matching their clean time — 30 days, 1 year, 5 years, and beyond.\n\nFor sponsors or sponsees: A personalized engraved coin with a meaningful date or message creates a one-of-a-kind keepsake.\n\nFor holidays and birthdays: Recovery tokens make thoughtful gifts that go beyond generic presents — they acknowledge the most important gift of all: sobriety.',
    },
  ],
  faq: [
    {
      question: 'What is a good gift for someone in recovery?',
      answer:
        'A recovery token or sobriety coin is one of the most meaningful gifts. It\'s personal, rooted in recovery tradition, and serves as a daily reminder of their strength. You can choose a milestone-specific coin or a custom engraved token.',
    },
    {
      question: 'Is it appropriate to give a sobriety gift?',
      answer:
        'Yes. Acknowledging someone\'s recovery milestone with a thoughtful gift shows support and respect for their journey. Sobriety coins have a long tradition as celebration gifts in the recovery community.',
    },
    {
      question: 'Can I engrave a personal message on a recovery token?',
      answer:
        'Yes! At Coinplugz, we offer custom engraving so you can add a sobriety date, name, or personal message to make the gift truly unique.',
    },
  ],
  schema: ['breadcrumb', 'faq', 'webPage'],
});
```

- [ ] **Step 2: Run the dev server and test**

Run: `npm run dev`

Navigate to `http://localhost:3000/sobriety-coins` — verify the page renders with the commercial template, hero, trust bar, product cards (from the `all` collection), FAQ accordion, and related page links.

Navigate to `http://localhost:3000/aa-coins` �� verify similar rendering.

Navigate to `http://localhost:3000/recovery-gifts` — verify similar rendering.

Navigate to `http://localhost:3000/some-nonexistent-slug` — verify 404.

Navigate to `http://localhost:3000/about` — verify existing route still works (not captured by `$seoPage`).

- [ ] **Step 3: Commit**

```bash
git add app/data/seo-pages.ts
git commit -m "feat(seo): seed first 3 commercial landing pages"
```

---

## Task 8: Seed Page Data — First 3 Milestone Pages

**Files:**
- Modify: `app/data/seo-pages.ts` (add milestone entries)

- [ ] **Step 1: Add 3 milestone page entries to `app/data/seo-pages.ts`**

Append to the file:

```typescript
// ============================================================
// MILESTONE LANDING PAGES
// ============================================================

registerSEOPage({
  slug: '24-hour-chip',
  type: 'milestone',
  title: '24 Hour Sobriety Chip',
  metaTitle: '24 Hour Sobriety Chip — The First Step | Coinplugz',
  metaDescription:
    'The 24 hour chip marks the most important day — day one. Shop premium 24-hour sobriety coins and desire chips that honor the courage to begin.',
  canonicalPath: '24-hour-chip',
  eyebrow: '24 Hour Milestone',
  heroDescription:
    'The most important chip you\'ll ever receive. The 24-hour coin marks the beginning — the courageous decision to start. Also known as the desire chip or surrender chip, this token represents the bravest step in recovery.',
  primaryCTA: {label: 'Shop 24 Hour Chips', href: '/collections/all'},
  featuredCollectionHandle: 'all',
  relatedPageSlugs: [
    'sobriety-coins',
    'aa-coins',
    'aa-chip-colors',
    'early-recovery-chips',
  ],
  sections: [
    {
      type: 'text',
      heading: 'What Is a 24 Hour Chip?',
      body: 'The 24-hour chip — sometimes called the desire chip or surrender chip — is given to anyone who has a desire to stop drinking or using. In AA, it\'s traditionally a white chip, and picking it up at a meeting is a public declaration: "I want to change."\n\nIt\'s the most given chip in recovery, and the most meaningful. Every long-term recovery story started with this single, brave step.',
    },
    {
      type: 'text',
      heading: 'How to Celebrate 24 Hours',
      body: 'Twenty-four hours may seem small, but it\'s everything. Many people in long-term recovery say the first day was the hardest — and the most transformative.\n\nCelebrate by picking up a chip at a meeting. Carry it with you as a daily reminder. Give one to someone taking their first step. That small coin carries immense power.',
    },
  ],
  faq: [
    {
      question: 'What does a 24 hour chip mean?',
      answer:
        'A 24-hour chip (also called a desire chip) signifies the decision to begin recovery. It represents 24 hours of sobriety and the courage to take the first step.',
    },
    {
      question: 'What color is the 24 hour chip in AA?',
      answer:
        'In AA tradition, the 24-hour chip is typically white, symbolizing a fresh start and new beginnings.',
    },
    {
      question: 'Who gives you a 24 hour chip?',
      answer:
        'The 24-hour chip is typically picked up voluntarily at an AA or NA meeting. Anyone with a desire to stop drinking or using can ask for one — no prior sobriety time is required.',
    },
  ],
  milestone: {
    duration: '24 Hours',
    significance:
      'The first 24 hours of sobriety is the hardest and the bravest. It\'s the moment you decide that today will be different. This chip represents not just a day without substances, but the birth of a new way of living. Every recovery journey — no matter how many years — started right here.',
    traditionalColor: 'White',
    nextMilestoneSlug: 'early-recovery-chips',
  },
  schema: ['breadcrumb', 'faq', 'webPage'],
});

registerSEOPage({
  slug: '1-year-sobriety-coin',
  type: 'milestone',
  title: '1 Year Sobriety Coin',
  metaTitle: '1 Year Sobriety Coin — Celebrate 365 Days | Coinplugz',
  metaDescription:
    'Celebrate 1 year of sobriety with a premium recovery coin. Shop handcrafted one-year AA medallions and anniversary tokens. Free shipping.',
  canonicalPath: '1-year-sobriety-coin',
  eyebrow: '1 Year Milestone',
  heroDescription:
    'One full year. 365 days of choosing recovery, growth, and transformation. The 1-year sobriety coin is one of the most celebrated milestones in recovery — and one of the most meaningful gifts you can give.',
  primaryCTA: {label: 'Shop 1 Year Coins', href: '/collections/all'},
  featuredCollectionHandle: 'all',
  relatedPageSlugs: [
    'sobriety-coins',
    'recovery-gifts',
    'custom-sobriety-coins',
    'aa-coins',
  ],
  sections: [
    {
      type: 'text',
      heading: 'The Significance of 1 Year Sober',
      body: 'Reaching one year of sobriety is a monumental achievement. It means you\'ve navigated every season, every holiday, every trigger — and you\'re still here, still choosing recovery.\n\nIn AA tradition, the one-year medallion is presented at a meeting with special recognition. It\'s a moment of deep pride — not just for the recipient, but for everyone who supported them along the way.',
    },
    {
      type: 'text',
      heading: 'Gift Ideas for a 1 Year Anniversary',
      body: 'A 1-year sobriety coin makes the perfect anniversary gift. Consider adding a personal engraving with the sobriety date or an encouraging message.\n\nFor sponsors: presenting a premium medallion to your sponsee is a powerful tradition. For family members: a beautifully crafted coin says "I noticed, and I\'m proud."',
    },
  ],
  faq: [
    {
      question: 'What color is the 1 year sobriety coin?',
      answer:
        'In AA tradition, the 1-year coin is typically bronze. This is the first "annual" medallion and marks the transition from monthly milestones to yearly celebrations.',
    },
    {
      question: 'How do you celebrate 1 year of sobriety?',
      answer:
        'Common celebrations include picking up a medallion at an AA meeting, having dinner with sober friends and sponsors, sharing your story at a meeting, and reflecting on how far you\'ve come. Many people also receive a sobriety coin as a gift from a loved one.',
    },
    {
      question: 'Is 1 year sober a big deal?',
      answer:
        'Absolutely. One year of sobriety is one of the most celebrated milestones in recovery. It represents a full cycle of navigating life\'s challenges without substances and building a strong foundation for long-term recovery.',
    },
  ],
  milestone: {
    duration: '1 Year',
    significance:
      'One year of sobriety is a triumph that deserves the highest celebration. You\'ve walked through 365 days of challenges, growth, and transformation. You\'ve proven — to yourself and to everyone watching — that a new way of living is not just possible, but beautiful. This coin represents an entire year of daily choices, each one a victory.',
    traditionalColor: 'Bronze',
    prevMilestoneSlug: '9-month-sobriety-coin',
    nextMilestoneSlug: '2-year-sobriety-coin',
  },
  schema: ['breadcrumb', 'faq', 'webPage'],
});

registerSEOPage({
  slug: '90-day-sobriety-coin',
  type: 'milestone',
  title: '90 Day Sobriety Coin',
  metaTitle: '90 Day Sobriety Coin — 3 Months of Recovery | Coinplugz',
  metaDescription:
    'Celebrate 90 days sober with a premium recovery coin. The 90-day chip marks a major milestone in early recovery. Free shipping on all orders.',
  canonicalPath: '90-day-sobriety-coin',
  eyebrow: '90 Day Milestone',
  heroDescription:
    'Three months. A full quarter-year of recovery. The 90-day sobriety coin marks one of the most critical milestones in early recovery — the point where new habits begin to solidify and the path forward becomes clearer.',
  primaryCTA: {label: 'Shop 90 Day Coins', href: '/collections/all'},
  featuredCollectionHandle: 'all',
  relatedPageSlugs: [
    'sobriety-coins',
    'aa-coins',
    '30-day-sobriety-coin',
    '6-month-sobriety-coin',
  ],
  sections: [
    {
      type: 'text',
      heading: 'Why 90 Days Matters',
      body: 'In recovery circles, 90 days is often considered the first truly significant milestone. Research suggests it takes roughly 90 days for the brain to begin resetting from the effects of substance use. Many treatment programs are built around a 90-day model for this reason.\n\nThe 90-day chip is more than a token — it\'s evidence that the initial storm of early recovery can be weathered.',
    },
    {
      type: 'text',
      heading: 'The 90-Day Chip Tradition',
      body: 'In AA, the 90-day chip is traditionally green — symbolizing growth and renewal. It\'s a turning point: by 90 days, many people have established a home group, found a sponsor, and begun working the steps.\n\nReaching 90 days often sparks a shift from "surviving" to "living" in recovery.',
    },
  ],
  faq: [
    {
      question: 'What color is the 90 day chip in AA?',
      answer:
        'The 90-day chip in AA is traditionally green, symbolizing growth, renewal, and new life.',
    },
    {
      question: 'Why is 90 days important in recovery?',
      answer:
        'Research suggests it takes about 90 days for the brain to begin significant healing from substance use. The 90-day mark is also when new habits start to solidify, making it a critical milestone in building a foundation for long-term recovery.',
    },
  ],
  milestone: {
    duration: '90 Days',
    significance:
      'Ninety days marks a turning point in recovery. The hardest days are behind you, and the brain is beginning to heal. At three months sober, you\'re not just abstaining — you\'re building a new life. This coin represents the moment recovery shifts from survival to growth.',
    traditionalColor: 'Green',
    prevMilestoneSlug: '60-day-sobriety-coin',
    nextMilestoneSlug: '6-month-sobriety-coin',
  },
  schema: ['breadcrumb', 'faq', 'webPage'],
});
```

- [ ] **Step 2: Test in dev server**

Run: `npm run dev`

Navigate to `http://localhost:3000/1-year-sobriety-coin` — verify milestone template renders with significance section, color badge, milestone nav (prev/next), products, FAQ.

Navigate to `http://localhost:3000/24-hour-chip` — verify rendering with no "previous" milestone link.

Navigate to `http://localhost:3000/90-day-sobriety-coin` — verify prev/next links work.

- [ ] **Step 3: Commit**

```bash
git add app/data/seo-pages.ts
git commit -m "feat(seo): seed first 3 milestone landing pages"
```

---

## Task 9: Seed Page Data — First 3 Glossary Detail Pages

**Files:**
- Modify: `app/data/seo-pages.ts` (add glossary entries)

- [ ] **Step 1: Add 3 glossary detail page entries**

Append to `app/data/seo-pages.ts`:

```typescript
// ============================================================
// GLOSSARY DETAIL PAGES
// ============================================================

registerSEOPage({
  slug: 'resources/glossary/sobriety-coin',
  type: 'glossary',
  title: 'Sobriety Coin',
  metaTitle: 'What Is a Sobriety Coin? — Definition & History | Coinplugz',
  metaDescription:
    'Learn what a sobriety coin is, its history in AA, and why recovery tokens matter. Comprehensive guide to sobriety coins, chips, and medallions.',
  canonicalPath: 'resources/glossary/sobriety-coin',
  eyebrow: 'Tokens & Coins',
  heroDescription:
    'A sobriety coin is a physical token marking milestones in recovery from addiction, originating in Alcoholics Anonymous.',
  primaryCTA: {label: 'Shop Sobriety Coins', href: '/collections/all'},
  relatedPageSlugs: ['sobriety-coins', 'aa-coins'],
  sections: [],
  faq: [
    {
      question: 'Where can I get a sobriety coin?',
      answer:
        'Sobriety coins can be received at AA or NA meetings, or purchased from specialty retailers like Coinplugz for personal milestones or as gifts.',
    },
  ],
  glossary: {
    definition:
      'A physical token given to mark milestones in recovery from addiction.',
    extendedContent:
      'Sobriety coins — also known as recovery tokens, medallions, or chips — are small coins awarded to individuals who reach specific milestones in their recovery journey. The tradition began in Alcoholics Anonymous in the 1940s and has since spread to Narcotics Anonymous, Celebrate Recovery, and many other programs.\n\nThe most iconic sobriety coin features the Serenity Prayer on one side and the AA triangle (representing Unity, Service, and Recovery) on the other. The inscription "To Thine Own Self Be True" appears on many AA medallions as a reminder to stay honest in recovery.\n\nSobriety coins come in various materials — from simple aluminum meeting chips to premium bronze, silver, and gold-plated medallions. Many people carry their coin daily as a tangible reminder of their commitment to sobriety.',
    category: 'Tokens & Coins',
    relatedTermSlugs: ['aa-chip', 'clean-time', 'medallion'],
    productLink: 'all',
  },
  schema: ['breadcrumb', 'definedTerm'],
});

registerSEOPage({
  slug: 'resources/glossary/aa-chip',
  type: 'glossary',
  title: 'AA Chip',
  metaTitle: 'What Is an AA Chip? — Colors, Meaning & Tradition | Coinplugz',
  metaDescription:
    'Learn what AA chips are, what the colors mean, and how they\'re used in Alcoholics Anonymous meetings to celebrate sobriety milestones.',
  canonicalPath: 'resources/glossary/aa-chip',
  eyebrow: 'Tokens & Coins',
  heroDescription:
    'An AA chip is a token given at Alcoholics Anonymous meetings to mark sobriety milestones, with different colors representing different time periods.',
  primaryCTA: {label: 'Shop AA Chips', href: '/collections/all'},
  relatedPageSlugs: ['aa-coins', 'aa-chip-colors'],
  sections: [],
  faq: [
    {
      question: 'What are the AA chip colors in order?',
      answer:
        'Common AA chip colors: White (24 hours/desire), Red (30 days), Gold (60 days), Green (90 days), Purple (6 months), Dark Blue (9 months), Bronze (1 year and annual milestones).',
    },
  ],
  glossary: {
    definition:
      'A token given at Alcoholics Anonymous meetings to celebrate sobriety milestones.',
    extendedContent:
      'AA chips are one of the most recognizable symbols of recovery. The chip system was introduced in the 1940s as a way to make sobriety milestones tangible and celebrate progress in front of the community.\n\nDifferent colors represent different time periods. While colors can vary by region and meeting, the most common system is: White for 24 hours (also called the desire or surrender chip), Red for 30 days, Gold for 60 days, Green for 90 days, Purple for 6 months, Dark Blue for 9 months, and Bronze for annual milestones starting at 1 year.\n\nAt meetings, picking up a chip is a moment of community celebration. The person receiving the chip often shares briefly about their journey, and the group responds with applause and encouragement.',
    category: 'Tokens & Coins',
    relatedTermSlugs: ['sobriety-coin', 'clean-time', 'medallion'],
    productLink: 'all',
  },
  schema: ['breadcrumb', 'definedTerm'],
});

registerSEOPage({
  slug: 'resources/glossary/clean-time',
  type: 'glossary',
  title: 'Clean Time',
  metaTitle: 'What Is Clean Time? — Definition & Meaning | Coinplugz',
  metaDescription:
    'Learn what clean time means in recovery, how it\'s calculated, and why celebrating clean time milestones matters for long-term sobriety.',
  canonicalPath: 'resources/glossary/clean-time',
  eyebrow: 'Recovery Basics',
  heroDescription:
    'Clean time refers to the continuous period someone has been free from substance use, measured from their sobriety date.',
  primaryCTA: {label: 'Shop Milestone Coins', href: '/collections/all'},
  relatedPageSlugs: ['sobriety-coins', '1-year-sobriety-coin'],
  sections: [],
  faq: [],
  glossary: {
    definition:
      'The continuous period of time someone has been free from substance use.',
    extendedContent:
      'Clean time is one of the most important concepts in recovery. It represents the unbroken period since a person last used drugs or alcohol, measured from their "sobriety date" — the last day they used.\n\nIn Narcotics Anonymous (NA), the term "clean time" is preferred over "sober time," reflecting the program\'s focus on all substances, not just alcohol. In AA, the equivalent term is "sobriety" or "sober time."\n\nCelebrating clean time milestones is a core tradition in 12-step programs. Milestones are typically marked at 24 hours, 30 days, 60 days, 90 days, 6 months, 9 months, 1 year, and annually thereafter. Each milestone is often commemorated with a coin, chip, or key tag.\n\nClean time is not a competition — it\'s a personal measure of progress. Whether someone has 24 hours or 24 years, their clean time is equally valuable.',
    category: 'Recovery Basics',
    relatedTermSlugs: ['sobriety-coin', 'aa-chip'],
    productLink: 'all',
  },
  schema: ['breadcrumb', 'definedTerm'],
});
```

- [ ] **Step 2: Test in dev server**

Run: `npm run dev`

Navigate to `http://localhost:3000/resources/glossary/sobriety-coin` — verify glossary detail template renders with definition, extended content, related products, related terms, back-to-glossary link.

Navigate to `http://localhost:3000/resources/glossary/aa-chip` — verify.

Navigate to `http://localhost:3000/resources/glossary/nonexistent` — verify 404.

**Note:** These pages require the Sanity glossary term to exist with a matching slug. If the Sanity terms have different slugs, adjust the `slug` values accordingly. Check the dev console for 404 errors from the Sanity fetch.

- [ ] **Step 3: Commit**

```bash
git add app/data/seo-pages.ts
git commit -m "feat(seo): seed first 3 glossary detail pages"
```

---

## Task 10: Update Glossary Index to Link Out

**Files:**
- Modify: `app/components/resources/GlossaryTermCard.tsx`

The existing glossary page at `app/routes/($locale).resources.glossary.tsx` shows term definitions inline via `GlossaryTermCard`. Update the card component so each term links to its detail page.

- [ ] **Step 1: Read the current GlossaryTermCard component**

Read `app/components/resources/GlossaryTermCard.tsx` to understand what it renders and where to add the link.

- [ ] **Step 2: Update GlossaryTermCard to link to detail page**

The card should wrap its content in a `<Link to={/resources/glossary/${term.slug}}>` if a detail page exists for that term (check via `getSEOPage`). For terms without a detail page, keep the existing inline behavior.

In `app/components/resources/GlossaryTermCard.tsx`, add:

```typescript
import {Link} from 'react-router';
import {getSEOPage} from '~/data/seo-pages';
```

Then wrap the card content: if `getSEOPage(`resources/glossary/${term.slug}`)` returns a page, render the card as a `<Link>` with a "Read more" arrow. Otherwise, render the existing inline card.

- [ ] **Step 3: Test in dev server**

Navigate to `http://localhost:3000/resources/glossary` — verify that terms with detail pages (sobriety-coin, aa-chip, clean-time) now show as clickable links. Other terms should still show definitions inline.

- [ ] **Step 4: Commit**

```bash
git add app/components/resources/GlossaryTermCard.tsx
git commit -m "feat(seo): link glossary terms to detail pages"
```

---

## Task 11: Update Sitemap

**Files:**
- Modify: `app/routes/($locale).sitemap.custom.$page[.xml].tsx`

- [ ] **Step 1: Update the sitemap to auto-generate SEO page entries**

Replace the `STATIC_PAGES` array approach with one that includes all SEO pages:

In the import section, add:

```typescript
import {getAllSEOPages} from '~/data/seo-pages';
```

After the existing `STATIC_PAGES` array, add a function to generate the combined entries:

```typescript
function getAllSitemapEntries() {
  const seoPages = getAllSEOPages();
  const seoEntries = seoPages.map((page) => ({
    url: `/${page.canonicalPath}`,
    changeFreq: 'weekly' as const,
    priority: page.type === 'commercial' ? 0.8 : page.type === 'milestone' ? 0.7 : 0.6,
  }));

  return [...STATIC_PAGES, ...seoEntries];
}
```

Then in the `loader`, replace `STATIC_PAGES.map(...)` with `getAllSitemapEntries().map(...)`.

- [ ] **Step 2: Test the sitemap**

Navigate to `http://localhost:3000/sitemap/custom/1.xml` — verify that the new SEO pages appear alongside the existing static pages.

- [ ] **Step 3: Commit**

```bash
git add app/routes/\(\$locale\).sitemap.custom.\$page\[.xml\].tsx
git commit -m "feat(seo): auto-generate sitemap entries from SEO pages data"
```

---

## Task 12: Add Organization Schema to Root Layout

**Files:**
- Modify: `app/root.tsx`

- [ ] **Step 1: Add Organization JSON-LD to the App component**

In `app/root.tsx`, import `JsonLd`:

```typescript
import {JsonLd} from '~/components/seo/JsonLd';
```

Inside the `App` component's return, add the Organization schema just inside the `<Analytics.Provider>`:

```tsx
<Analytics.Provider cart={data.cart} shop={data.shop} consent={data.consent}>
  <JsonLd
    data={{
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Coinplugz',
      url: 'https://coinplugz.com',
      description:
        'Premium hand-crafted recovery tokens celebrating sobriety milestones.',
      logo: 'https://cdn.shopify.com/s/files/1/0980/8330/7822/files/og-image.webp?v=1773774508',
    }}
  />
  <PageLayout {...data}>
    <Outlet />
  </PageLayout>
  {/* ... */}
</Analytics.Provider>
```

- [ ] **Step 2: Test**

Navigate to any page and inspect the HTML source — verify the Organization JSON-LD is present.

- [ ] **Step 3: Commit**

```bash
git add app/root.tsx
git commit -m "feat(seo): add Organization schema to root layout"
```

---

## Task 13: Populate Remaining Commercial Pages (12 pages)

**Files:**
- Modify: `app/data/seo-pages.ts`

Add the remaining 12 commercial landing pages. Each follows the same `registerSEOPage()` pattern as Task 7. The pages to add:

1. `na-coins` — NA Coins & Key Tags
2. `recovery-medallions` — Recovery Medallions
3. `sobriety-gifts-for-women` — Sobriety Gifts for Women
4. `sobriety-gifts-for-men` — Sobriety Gifts for Men
5. `sponsor-gifts` — Sponsor & Sponsee Gifts
6. `custom-sobriety-coins` — Custom & Personalized Sobriety Coins
7. `bronze-sobriety-coins` — Bronze Sobriety Coins
8. `gold-silver-medallions` — Gold & Silver Medallions
9. `serenity-prayer-coins` — Serenity Prayer Coins
10. `aa-chip-colors` — AA Chip Colors & Meanings
11. `sobriety-coin-holders` — Sobriety Coin Holders & Keychains
12. `celebrate-recovery-coins` — Celebrate Recovery Coins

- [ ] **Step 1: Add all 12 page entries**

Each entry needs: `slug`, `type: 'commercial'`, `title`, `metaTitle`, `metaDescription` (155 chars max), `canonicalPath`, `eyebrow`, `heroDescription`, `primaryCTA`, `featuredCollectionHandle`, `relatedPageSlugs` (3-6 internal links), `sections` (2-3 text sections + 1 productShowcase), `faq` (2-4 items), `schema`.

Follow the exact same pattern as the entries in Task 7 for structure. Write unique, keyword-rich content for each page.

**Key content notes for specific pages:**
- `aa-chip-colors`: This is the highest-traffic informational page. Include a complete color guide (White=24hr, Red=30 days, Gold=60 days, Green=90 days, Purple=6 months, Dark Blue=9 months, Bronze=1 year). FAQ should cover "What are AA chip colors in order?" and "Do AA chip colors vary by region?"
- `custom-sobriety-coins`: Link `primaryCTA` to `/custom-token` (the custom token builder on the current branch).
- `na-coins`: Mention that NA uses key tags in addition to coins. Different color system from AA.
- `sponsor-gifts`: Target both sponsor→sponsee and sponsee→sponsor gift scenarios.

- [ ] **Step 2: Test a sampling in dev server**

Verify at least `/aa-chip-colors`, `/custom-sobriety-coins`, and `/na-coins` render correctly.

- [ ] **Step 3: Commit**

```bash
git add app/data/seo-pages.ts
git commit -m "feat(seo): add remaining 12 commercial landing pages"
```

---

## Task 14: Populate Remaining Milestone Pages (12 pages)

**Files:**
- Modify: `app/data/seo-pages.ts`

Add the remaining 12 milestone pages. Each needs the `milestone` field with `duration`, `significance`, `traditionalColor`, `prevMilestoneSlug`, and `nextMilestoneSlug` forming a complete chain.

Pages to add:
1. `30-day-sobriety-coin` (Red, prev: `early-recovery-chips`, next: `60-day-sobriety-coin`)
2. `60-day-sobriety-coin` (Gold, prev: `30-day-sobriety-coin`, next: `90-day-sobriety-coin`)
3. `6-month-sobriety-coin` (Purple, prev: `90-day-sobriety-coin`, next: `9-month-sobriety-coin`)
4. `9-month-sobriety-coin` (Dark Blue, prev: `6-month-sobriety-coin`, next: `1-year-sobriety-coin`)
5. `2-year-sobriety-coin` (Bronze, prev: `1-year-sobriety-coin`, next: `5-year-sobriety-coin`)
6. `5-year-sobriety-coin` (Bronze, prev: `2-year-sobriety-coin`, next: `10-year-sobriety-coin`)
7. `10-year-sobriety-coin` (Bronze, prev: `5-year-sobriety-coin`, next: `15-year-sobriety-coin`)
8. `15-year-sobriety-coin` (Bronze, prev: `10-year-sobriety-coin`, next: `20-year-sobriety-coin`)
9. `20-year-sobriety-coin` (Bronze, prev: `15-year-sobriety-coin`, next: `25-year-sobriety-coin`)
10. `25-year-sobriety-coin` (Bronze, prev: `20-year-sobriety-coin`, next: `long-term-sobriety-coins`)
11. `long-term-sobriety-coins` (Bronze, prev: `25-year-sobriety-coin`)
12. `early-recovery-chips` (Mixed, prev: `24-hour-chip`, next: `30-day-sobriety-coin`)

- [ ] **Step 1: Add all 12 entries**

Follow the milestone pattern from Task 8. Each entry needs unique emotional content for the `significance` field and 2-3 FAQ items relevant to that specific milestone.

**Key content notes:**
- `early-recovery-chips`: Covers 1 week + other early milestones not given individual pages. Eyebrow: "Early Recovery".
- `long-term-sobriety-coins`: Covers 30, 35, 40, and 50 year milestones. Eyebrow: "Long-Term Recovery".
- Ensure the prev/next chain is complete and forms a cycle through all 15 milestone pages.

- [ ] **Step 2: Test the milestone chain**

Navigate through the chain: start at `/24-hour-chip`, click "Next" through to `/long-term-sobriety-coins`, verifying each page renders and the prev/next links work.

- [ ] **Step 3: Commit**

```bash
git add app/data/seo-pages.ts
git commit -m "feat(seo): add remaining 12 milestone landing pages"
```

---

## Task 15: Populate Glossary Detail Pages (27 remaining)

**Files:**
- Modify: `app/data/seo-pages.ts`

Add entries for all remaining glossary terms from Sanity. The exact slugs must match the Sanity term slugs.

- [ ] **Step 1: Get the full list of Sanity term slugs**

Check the Sanity glossary data to get all 30 term slugs. You can do this by looking at the glossary index page in dev, or by checking the Sanity query response.

Run the dev server and check browser console or add a temporary `console.log` in the glossary loader.

- [ ] **Step 2: Add glossary entries for all remaining terms**

For each term, create a `registerSEOPage()` call with:
- `slug`: `resources/glossary/{sanity-slug}`
- `type: 'glossary'`
- `title`, `metaTitle`, `metaDescription` — unique per term
- `eyebrow` — matching the term's category
- `heroDescription` — short version of the definition
- `glossary.definition` — the short definition (can mirror Sanity)
- `glossary.extendedContent` — 2-3 paragraphs of rich content
- `glossary.category` — one of the 5 categories
- `glossary.relatedTermSlugs` — 2-3 related term slugs
- `glossary.productLink` — collection handle if relevant

- [ ] **Step 3: Test a sample**

Verify 3-4 glossary detail pages render correctly and link back to the glossary index.

- [ ] **Step 4: Commit**

```bash
git add app/data/seo-pages.ts
git commit -m "feat(seo): add remaining glossary detail pages"
```

---

## Task 16: Final Integration Test & Cleanup

**Files:** All new/modified files

- [ ] **Step 1: Run typecheck**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 2: Run linter**

Run: `npm run lint`
Expected: No errors in new files.

- [ ] **Step 3: Run build**

Run: `npm run build`
Expected: Successful production build.

- [ ] **Step 4: Full page test in dev**

Test the following pages and verify they render correctly:

**Commercial pages:**
- `/sobriety-coins` — hero, trust bar, products, FAQ, related pages, CTA
- `/aa-coins` — same layout check
- `/aa-chip-colors` — content-heavy page renders correctly
- `/custom-sobriety-coins` — CTA links to `/custom-token`

**Milestone pages:**
- `/24-hour-chip` — no "previous" link, has "next"
- `/1-year-sobriety-coin` — prev/next both present
- `/long-term-sobriety-coins` — has "previous", no "next"

**Glossary pages:**
- `/resources/glossary/sobriety-coin` — definition, extended content, products, related terms
- `/resources/glossary` — terms link out to detail pages

**Existing routes not broken:**
- `/` — homepage renders
- `/about` — about page renders
- `/collections/all` — collection page renders
- `/cart` — cart page renders
- `/nonexistent-page` — returns 404

**Sitemap:**
- `/sitemap/custom/1.xml` — contains all 60 SEO pages

**Schema validation:**
- View source on `/sobriety-coins` �� verify BreadcrumbList, FAQPage, WebPage JSON-LD
- View source on `/1-year-sobriety-coin` — verify same schemas
- View source on `/resources/glossary/sobriety-coin` — verify BreadcrumbList, DefinedTerm JSON-LD
- View source on any page — verify Organization JSON-LD in root

- [ ] **Step 5: Commit any fixes**

```bash
git add -A
git commit -m "fix(seo): integration test fixes"
```

- [ ] **Step 6: Final commit with all pages verified**

```bash
git add -A
git commit -m "feat(seo): complete SEO landing pages — 60 pages, 250+ keywords"
```
