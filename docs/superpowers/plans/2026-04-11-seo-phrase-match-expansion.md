# SEO Phrase-Match Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship 15 new phrase-match SEO landing pages (10 Tier A generic + 5 Tier B custom-intent) that target uncovered exact-phrase queries and prominently surface the `/custom-token` flagship flow — a differentiator currently invisible on existing SEO templates.

**Architecture:** Add two new SEO templates (`GenericSEOLandingTemplate`, `CustomIntentLandingTemplate`) and one shared feature block component (`CustomTokenFeatureBlock`). Extend the `SEOPage` interface with an optional `template` discriminator and the routing switch in `($locale)._index.tsx` to dispatch to the new templates. All 15 pages register through the existing `registerSEOPage()` mechanism. Zero modifications to existing templates or page data.

**Tech Stack:** React Router v7, TypeScript, Tailwind v4, Shopify Hydrogen 2025.x, Shopify Storefront API (GraphQL). No unit test runner — verification via `npm run typecheck`, `npm run lint`, and dev-server browser checks.

**Spec:** `docs/superpowers/specs/2026-04-11-seo-phrase-match-expansion-design.md`

> **⚠️ Execution order note:** Task 3 (routing switch) depends on Tasks 4 and 6 (the two new templates). Execute in this order: **1 → 2 → 4 → 6 → 3 → 5 → 7 → 8 → 9 → 10 → 11 → 12 → 13.** Tasks 4 and 6 are independent of each other and may run in parallel if using subagent-driven execution.

---

## File Structure

### New Files (3)

```
app/components/seo/
  CustomTokenFeatureBlock.tsx        # Shared full-width custom-token feature card (~120 lines)
  GenericSEOLandingTemplate.tsx      # Tier A template: product-forward with mid-page CustomTokenFeatureBlock (~280 lines)
  CustomIntentLandingTemplate.tsx    # Tier B template: custom-token-forward with products secondary (~260 lines)
```

### Modified Files (2)

```
app/data/seo-pages.ts                # Add `template` + `customTokenBlock` to SEOPage interface + 15 new registerSEOPage() calls
app/routes/($locale)._index.tsx      # Extend the template switch near line 394 to dispatch to the two new templates
```

### Untouched (verified zero-regression targets)

```
app/components/seo/CommercialLandingTemplate.tsx
app/components/seo/MilestoneLandingTemplate.tsx
app/components/seo/GlossaryDetailTemplate.tsx
app/routes/($locale).sitemap.custom.$page[.xml].tsx   # Auto-picks up new pages
All 30+ existing registerSEOPage() entries in app/data/seo-pages.ts
```

---

## Copy Authoring Note

Per spec §10, the plan provides **full prose for the two pilot pages** (`/milestone-tokens` in Task 5, `/custom-recovery-token` in Task 7) to establish the tone and structure. The remaining 13 pages provide complete metadata (slug, titles, meta, eyebrow, hero description, FAQ questions, section headings, angles, related slugs) and point the implementer at the pilots as concrete exemplars. Each page's body prose (~600-800 words distinct) is drafted at implementation time following the pilot patterns and the spec's per-page angle table (§6.1/6.2).

**Do not copy-paste prose between pages in the same phrase family** (e.g., `aa-sobriety-coins`, `aa-sobriety-tokens`, `aa-sober-chips`). Google will deduplicate. The per-page angles are the de-duplication defense.

---

## Branch Setup (Task 0)

Before Task 1, the implementer should create a dedicated branch off the current `feat/seo-canonicals-breadcrumbs` branch (which already contains the spec doc):

```bash
git checkout -b feat/seo-phrase-match-expansion
```

All subsequent commits land on this branch. Final PR targets `main`.

---

## Task 1: Extend SEOPage interface with `template` and `customTokenBlock` fields

**Files:**
- Modify: `app/data/seo-pages.ts` (interface definition around lines 25-63)

**Context:** The existing `SEOPage` interface discriminates templates via `type: 'commercial' | 'milestone' | 'glossary'`. Adding a new template variant per type would require duplicating existing page data. Instead, introduce an optional `template` discriminator that is orthogonal to `type` and only consulted for `type === 'commercial'` pages. Existing pages leave `template` undefined and keep rendering on `CommercialLandingTemplate`.

- [ ] **Step 1: Add `template` and `customTokenBlock` fields to the interface**

In `app/data/seo-pages.ts`, locate the `SEOPage` interface (starts near line 25). Add the two new optional fields immediately after the `schema: SchemaType[];` field. The file currently ends the interface with:

```ts
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
```

Replace with:

```ts
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

  /**
   * Which template to render. Only consulted when `type === 'commercial'`.
   * - undefined → CommercialLandingTemplate (legacy, all existing commercial pages)
   * - 'generic-seo' → GenericSEOLandingTemplate (Tier A phrase-match pages)
   * - 'custom-intent' → CustomIntentLandingTemplate (Tier B custom-flow-forward pages)
   */
  template?: 'generic-seo' | 'custom-intent';

  /**
   * Optional per-page override for the CustomTokenFeatureBlock copy.
   * Falls back to the shared default copy in CustomTokenFeatureBlock.tsx when omitted.
   */
  customTokenBlock?: {
    eyebrow?: string;
    headline?: string;
    body?: string;
    primaryCtaLabel?: string;
    secondaryCtaLabel?: string;
  };
}
```

- [ ] **Step 2: Run typecheck to verify no existing pages break**

```bash
npm run typecheck
```

Expected: PASS. All existing `registerSEOPage()` calls are unaffected because the new fields are optional.

- [ ] **Step 3: Commit**

```bash
git add app/data/seo-pages.ts
git commit -m "feat(seo): add template and customTokenBlock fields to SEOPage interface"
```

---

## Task 2: Create CustomTokenFeatureBlock component

**Files:**
- Create: `app/components/seo/CustomTokenFeatureBlock.tsx`

**Context:** This is the shared component that surfaces `/custom-token` on every new SEO page. Both new templates render it. Dark-gradient card with a three-step visual on the left and headline + CTAs on the right. Uses inline styles per CLAUDE.md convention (Tailwind is unreliable inside wrapped/motion components).

- [ ] **Step 1: Create the component file**

Create `app/components/seo/CustomTokenFeatureBlock.tsx` with the following contents:

```tsx
/**
 * CustomTokenFeatureBlock — Shared feature card surfacing the /custom-token flow
 *
 * Used by: GenericSEOLandingTemplate, CustomIntentLandingTemplate
 * Layout: Full-width dark-gradient card. Two columns on desktop (stacks on mobile):
 *   Left — three-step process visual (Share → Review → Receive)
 *   Right — eyebrow, headline, body, two CTAs
 *
 * Per-page copy overrides via the `copy` prop (from SEOPage.customTokenBlock).
 * Falls back to the DEFAULT_COPY below when any field is omitted.
 */

import {Link} from 'react-router';
import {Button} from '~/components/ui/Button';
import type {SEOPage} from '~/data/seo-pages';

interface CustomTokenFeatureBlockProps {
  copy?: SEOPage['customTokenBlock'];
  className?: string;
}

const DEFAULT_COPY = {
  eyebrow: 'The Coinplugz Difference',
  headline: "Can't find exactly what you want? Create your own.",
  body:
    "Every recovery journey is different. That's why we built two ways to make a token that's truly yours — whether you want us to design it from your story, or you want to control every detail.",
  primaryCtaLabel: 'Start Designing',
  secondaryCtaLabel: 'See How It Works',
};

const STEPS = [
  {number: 1, label: 'Share your vision'},
  {number: 2, label: 'Review the design'},
  {number: 3, label: 'Receive your token'},
];

export function CustomTokenFeatureBlock({
  copy,
  className = '',
}: CustomTokenFeatureBlockProps) {
  const eyebrow = copy?.eyebrow ?? DEFAULT_COPY.eyebrow;
  const headline = copy?.headline ?? DEFAULT_COPY.headline;
  const body = copy?.body ?? DEFAULT_COPY.body;
  const primaryCtaLabel = copy?.primaryCtaLabel ?? DEFAULT_COPY.primaryCtaLabel;
  const secondaryCtaLabel =
    copy?.secondaryCtaLabel ?? DEFAULT_COPY.secondaryCtaLabel;

  return (
    <section
      className={`rounded-2xl border border-white/[0.08] ${className}`}
      style={{
        background:
          'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr)',
          gap: '2.5rem',
          padding: '3rem',
          alignItems: 'center',
        }}
        className="md:!grid-cols-2"
      >
        {/* Left: three-step visual */}
        <div>
          <ol
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              listStyle: 'none',
              padding: 0,
              margin: 0,
            }}
          >
            {STEPS.map((step, idx) => (
              <li
                key={step.number}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    width: '3rem',
                    height: '3rem',
                    borderRadius: '9999px',
                    border: '1px solid rgba(184,118,79,0.5)',
                    backgroundColor: 'rgba(184,118,79,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#B8764F',
                    fontFamily: 'var(--font-display, serif)',
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {step.number}
                </div>
                <span
                  style={{
                    fontSize: '1rem',
                    color: 'rgba(255,255,255,0.8)',
                    fontWeight: 500,
                  }}
                >
                  {step.label}
                </span>
                {idx < STEPS.length - 1 && (
                  <div
                    aria-hidden
                    style={{
                      position: 'absolute',
                      left: '1.5rem',
                      top: '3rem',
                      width: '1px',
                      height: '1.5rem',
                      backgroundColor: 'rgba(184,118,79,0.3)',
                    }}
                  />
                )}
              </li>
            ))}
          </ol>
        </div>

        {/* Right: eyebrow + headline + body + CTAs */}
        <div>
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
            {eyebrow}
          </span>
          <h2
            style={{
              fontFamily: 'var(--font-display, serif)',
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              fontWeight: 700,
              color: '#FFFFFF',
              lineHeight: 1.2,
              marginBottom: '1rem',
            }}
          >
            {headline}
          </h2>
          <p
            style={{
              fontSize: '1.0625rem',
              lineHeight: 1.6,
              color: 'rgba(255,255,255,0.6)',
              marginBottom: '2rem',
            }}
          >
            {body}
          </p>
          <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.75rem'}}>
            <Link to="/custom-token" prefetch="intent">
              <Button
                variant="primary"
                size="lg"
                className="!bg-accent !text-black"
              >
                {primaryCtaLabel}
              </Button>
            </Link>
            <Link to="/custom-token" prefetch="intent">
              <Button
                variant="secondary"
                size="lg"
                className="!border-white/30 !text-white"
              >
                {secondaryCtaLabel}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Run typecheck**

```bash
npm run typecheck
```

Expected: PASS.

- [ ] **Step 3: Run lint**

```bash
npm run lint app/components/seo/CustomTokenFeatureBlock.tsx
```

Expected: PASS with zero errors.

- [ ] **Step 4: Commit**

```bash
git add app/components/seo/CustomTokenFeatureBlock.tsx
git commit -m "feat(seo): add CustomTokenFeatureBlock shared component"
```

---

## Task 3: Extend routing switch in ($locale)._index.tsx

> **⚠️ DEPENDENCY: Execute this task AFTER Tasks 4 and 6.**
> This task imports `GenericSEOLandingTemplate` (created in Task 4) and `CustomIntentLandingTemplate` (created in Task 6). Running Task 3 before those tasks will fail typecheck. The linear execution order for this plan is: **1 → 2 → 4 → 6 → 3 → 5 → 7 → ...**

**Files:**
- Modify: `app/routes/($locale)._index.tsx` (around lines 392-398)

**Context:** The loader at line 229 already detects SEO page slugs and fetches products. The switch near line 394 currently routes `milestone` → `MilestoneLandingTemplate` and everything else → `CommercialLandingTemplate`. We insert two new branches that check the optional `template` field. The two new templates must exist before this task runs.

- [ ] **Step 1: Add the new template imports**

Open `app/routes/($locale)._index.tsx` and locate the imports near line 34:

```tsx
import {CommercialLandingTemplate} from '~/components/seo/CommercialLandingTemplate';
import {MilestoneLandingTemplate} from '~/components/seo/MilestoneLandingTemplate';
```

Add the two new imports directly below:

```tsx
import {CommercialLandingTemplate} from '~/components/seo/CommercialLandingTemplate';
import {MilestoneLandingTemplate} from '~/components/seo/MilestoneLandingTemplate';
import {GenericSEOLandingTemplate} from '~/components/seo/GenericSEOLandingTemplate';
import {CustomIntentLandingTemplate} from '~/components/seo/CustomIntentLandingTemplate';
```

- [ ] **Step 2: Extend the template switch**

Locate the switch around line 392-398 which currently reads:

```tsx
  // Render SEO landing page when the route matched an SEO slug
  if ('seoPage' in data && data.seoPage) {
    const {seoPage, seoProducts} = data as {seoPage: any; seoProducts: any};
    if (seoPage.type === 'milestone') {
      return <MilestoneLandingTemplate page={seoPage} products={seoProducts} />;
    }
    return <CommercialLandingTemplate page={seoPage} products={seoProducts} />;
  }
```

Replace with:

```tsx
  // Render SEO landing page when the route matched an SEO slug
  if ('seoPage' in data && data.seoPage) {
    const {seoPage, seoProducts} = data as {seoPage: any; seoProducts: any};
    if (seoPage.type === 'milestone') {
      return <MilestoneLandingTemplate page={seoPage} products={seoProducts} />;
    }
    if (seoPage.template === 'generic-seo') {
      return (
        <GenericSEOLandingTemplate page={seoPage} products={seoProducts} />
      );
    }
    if (seoPage.template === 'custom-intent') {
      return (
        <CustomIntentLandingTemplate page={seoPage} products={seoProducts} />
      );
    }
    return <CommercialLandingTemplate page={seoPage} products={seoProducts} />;
  }
```

The order matters: milestone check first (milestone pages ignore `template`), then the two new template branches, then the legacy commercial fallback.

- [ ] **Step 3: Run typecheck**

```bash
npm run typecheck
```

Expected: PASS. (Requires Tasks 4 and 6 to have completed first so the imports resolve.)

- [ ] **Step 4: Run dev server and spot-check existing pages**

```bash
npm run dev
```

In a browser, verify these existing pages still render unchanged:
- `http://localhost:3000/recovery-tokens` (commercial)
- `http://localhost:3000/sobriety-coins` (commercial)
- `http://localhost:3000/1-year-sobriety-coin` (milestone)

Expected: All three pages render identically to pre-change. Stop the dev server with Ctrl+C.

- [ ] **Step 5: Commit**

```bash
git add app/routes/\(\$locale\)._index.tsx
git commit -m "feat(seo): route generic-seo and custom-intent template pages"
```

---

## Task 4: Create GenericSEOLandingTemplate

**Files:**
- Create: `app/components/seo/GenericSEOLandingTemplate.tsx`

**Context:** This is the Tier A template. Product-forward layout with the `CustomTokenFeatureBlock` placed prominently mid-page and a secondary "or design your own" CTA in the hero + final card. Mirrors the visual structure of `CommercialLandingTemplate.tsx` so existing pages and new Tier A pages feel consistent — but adds custom-token surfacing.

- [ ] **Step 1: Create the template file**

Create `app/components/seo/GenericSEOLandingTemplate.tsx` with:

```tsx
/**
 * GenericSEOLandingTemplate — Tier A phrase-match SEO pages
 *
 * Used by: /milestone-tokens, /aa-sobriety-coins, /aa-sobriety-tokens,
 *          /aa-sober-chips, /na-sobriety-coins, /na-sober-chips,
 *          /alcoholics-anonymous-sobriety-coins, /narcotics-anonymous-coins,
 *          /sobriety-medallion, /recovery-chips
 *
 * Layout: Breadcrumbs → Hero (dual CTA) → Trust Bar → Intro Text
 *       → Product Showcase → CustomTokenFeatureBlock → Distinctive Section
 *       → FAQ → Related Pages → Final Dual-CTA
 *
 * Product-forward with custom-token surfaced prominently mid-page. Hero and
 * final CTA both offer "Shop" (primary) + "Or design your own" (secondary).
 */

import {Link} from 'react-router';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';
import {Breadcrumbs} from '~/components/ui/Breadcrumbs';
import {JsonLd} from '~/components/seo/JsonLd';
import {Button} from '~/components/ui/Button';
import {SEOProductCard} from '~/components/seo/SEOProductCard';
import {SEOFaqAccordion} from '~/components/seo/SEOFaqAccordion';
import {SEORelatedPages} from '~/components/seo/SEORelatedPages';
import {SEOTrustBar} from '~/components/seo/SEOTrustBar';
import {CustomTokenFeatureBlock} from '~/components/seo/CustomTokenFeatureBlock';
import type {SEOPage} from '~/data/seo-pages';

interface GenericSEOLandingTemplateProps {
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
      minVariantPrice: MoneyV2;
    };
  }>;
}

export function GenericSEOLandingTemplate({
  page,
  products,
}: GenericSEOLandingTemplateProps) {
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

  // Split sections: first text section = intro (rendered mid-hero),
  // remaining text sections render below the CustomTokenFeatureBlock.
  const textSections = page.sections.filter((s) => s.type === 'text');
  const introSection = textSections[0];
  const distinctiveSections = textSections.slice(1);

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
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '0.75rem',
            }}
          >
            <Link to={page.primaryCTA.href} prefetch="intent">
              <Button
                variant="primary"
                size="lg"
                className="!bg-accent !text-black"
              >
                {page.primaryCTA.label}
              </Button>
            </Link>
            <Link to="/custom-token" prefetch="intent">
              <Button
                variant="secondary"
                size="lg"
                className="!border-white/30 !text-white"
              >
                Or design your own
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <div className="container-standard">
        <SEOTrustBar />
      </div>

      {/* Intro text */}
      {introSection && (
        <div className="container-standard py-16">
          <section>
            {introSection.heading && (
              <h2 className="font-display text-subsection text-white mb-4">
                {introSection.heading}
              </h2>
            )}
            <div className="text-white/50 leading-relaxed max-w-3xl">
              {introSection.body.split('\n\n').map((paragraph, pIdx) => (
                <p key={pIdx} style={{marginBottom: '1.5rem'}}>
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Product Showcase */}
      {products.length > 0 && (
        <div className="container-standard pb-16">
          <section>
            <h2 className="font-display text-subsection text-white mb-8">
              Shop {page.title}
            </h2>
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
        </div>
      )}

      {/* Custom Token Feature Block — mid-page, prominent */}
      <div className="container-standard pb-16">
        <CustomTokenFeatureBlock copy={page.customTokenBlock} />
      </div>

      {/* Distinctive content sections (history / terminology angle) */}
      {distinctiveSections.length > 0 && (
        <div className="container-standard pb-16 space-y-16">
          {distinctiveSections.map((section, index) => (
            <section key={index}>
              {section.heading && (
                <h2 className="font-display text-subsection text-white mb-4">
                  {section.heading}
                </h2>
              )}
              <div className="text-white/50 leading-relaxed max-w-3xl">
                {section.body.split('\n\n').map((paragraph, pIdx) => (
                  <p key={pIdx} style={{marginBottom: '1.5rem'}}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

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
            Ready to shop {page.title.toLowerCase()}?
          </h2>
          <p
            style={{
              color: 'rgba(255,255,255,0.5)',
              marginBottom: '2rem',
              maxWidth: '32rem',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            Browse the collection or design a one-of-a-kind token that tells
            your own story.
          </p>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '0.75rem',
            }}
          >
            <Link to={page.primaryCTA.href} prefetch="intent">
              <Button
                variant="primary"
                size="lg"
                className="!bg-accent !text-black"
              >
                {page.primaryCTA.label}
              </Button>
            </Link>
            <Link to="/custom-token" prefetch="intent">
              <Button
                variant="secondary"
                size="lg"
                className="!border-white/30 !text-white"
              >
                Start Designing
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Run typecheck**

```bash
npm run typecheck
```

Expected: PASS.

- [ ] **Step 3: Run lint**

```bash
npm run lint app/components/seo/GenericSEOLandingTemplate.tsx
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add app/components/seo/GenericSEOLandingTemplate.tsx
git commit -m "feat(seo): add GenericSEOLandingTemplate for Tier A phrase-match pages"
```

---

## Task 5: Register and verify pilot page `/milestone-tokens`

**Files:**
- Modify: `app/data/seo-pages.ts` (append new `registerSEOPage()` call)

**Context:** First page on the new template. This is the quality bar — subsequent Tier A pages copy this structure, angle-by-angle. The prose below is ~700 words of distinct content targeting the "milestone tokens" phrase.

- [ ] **Step 1: Append the page registration**

At the end of `app/data/seo-pages.ts`, append (add before the final `// END OF FILE` comment if present, otherwise at the very end):

```ts
// ============================================================
// PHRASE-MATCH EXPANSION — TIER A (generic-seo template)
// ============================================================

registerSEOPage({
  slug: 'milestone-tokens',
  type: 'commercial',
  template: 'generic-seo',
  title: 'Milestone Tokens',
  metaTitle: 'Milestone Tokens — Handcrafted Recovery Coins | Coinplugz',
  metaDescription:
    'Shop premium milestone tokens for every recovery achievement. Handcrafted coins marking 24 hours, 30 days, 1 year, and every milestone in between. Design your own.',
  canonicalPath: 'milestone-tokens',
  eyebrow: 'Mark Every Milestone',
  heroDescription:
    'Milestone tokens are the physical proof that the days you strung together actually happened. Handcrafted, weighted, and made to last — one for every milestone that mattered.',
  primaryCTA: {label: 'Shop Milestone Tokens', href: '/collections/all'},
  featuredCollectionHandle: 'all',
  relatedPageSlugs: [
    'recovery-tokens',
    'sobriety-coins',
    '1-year-sobriety-coin',
    'custom-recovery-token',
  ],
  sections: [
    {
      type: 'text',
      heading: 'What Are Milestone Tokens?',
      body: "Milestone tokens are physical markers — coins, chips, or medallions — given to people in recovery to commemorate specific sobriety achievements. Unlike a generic keepsake, a milestone token is tied to a date: the day you reached 24 hours, 30 days, 90 days, a year, five years, and beyond. Every token corresponds to a moment you decided to keep going.\n\nThe term 'milestone token' is deliberately program-agnostic. AA calls them chips. NA uses medallions and key tags. Celebrate Recovery has its own designs. SMART Recovery doesn't formalize them at all. But the underlying idea is shared across every major recovery tradition: turn an invisible achievement into something you can hold in your hand, and the achievement feels real.\n\nAt Coinplugz, we make milestone tokens for every point in the journey — from the 24-hour surrender chip to 25-year anniversary medallions — and we make them out of premium materials because the days they represent are worth more than stamped aluminum.",
    },
    {
      type: 'text',
      heading: 'Every Milestone Deserves a Marker',
      body: "The milestones that matter aren't always the ones you'd expect. The 1-year chip gets the celebrations, but ask anyone in long-term recovery and they'll tell you the 24-hour chip is the one that saved their life. The decision to start — in a church basement, on a couch, in a treatment center parking lot — is the hardest one they ever made. The token that marks that day becomes the most important thing they own.\n\nEarly recovery milestones land hardest: 30 days (the month you proved you could), 60 days (the month you proved the first month wasn't a fluke), 90 days (the quarter that starts to feel like who you are now). Then the half-year and nine-month tokens fill the long stretches where the meetings get quieter and the work gets harder. The 1-year medallion is the first real celebration — the proof you were building toward something.\n\nAnnual milestones after that — 2, 5, 10, 15, 20, 25 years — each carry their own weight. Some mark a quiet morning alone. Others mark the dinner where your family finally stopped waiting for the relapse. Every one of them deserves a token that feels as permanent as the work that earned it.",
    },
    {
      type: 'text',
      heading: 'Tokens, Chips, Coins, Medallions — What\'s the Difference?',
      body: "The vocabulary varies by program and region, and the distinctions are mostly historical. 'Chip' comes from AA's earliest days in 1940s Cleveland, when the Clarence Snyder group handed out poker chips at meetings — the cheapest round tokens they could buy. AA kept the name. 'Coin' became popular as designs got more elaborate and manufacturers moved from stamped plastic to cast metal. 'Medallion' tends to describe larger, heavier annual coins — the ones you display rather than carry. 'Token' is the umbrella word that captures all of them.\n\nSome groups treat the terms as strictly different objects — NA, for example, distinguishes key tags (plastic, for shorter clean-time) from medallions (metal, for annual milestones). Other groups use the words interchangeably. When you're shopping for a milestone token, what matters isn't the label — it's whether the object feels substantial enough to carry the weight of what it represents.",
    },
  ],
  faq: [
    {
      question: 'What is a milestone token in recovery?',
      answer:
        'A milestone token is a physical coin, chip, or medallion given to someone in recovery to mark a specific sobriety achievement — 24 hours, 30 days, 1 year, and so on. The tradition comes from AA but has spread across almost every recovery program. Milestone tokens turn an invisible accomplishment into something tangible you can hold.',
    },
    {
      question: 'Are milestone tokens the same as AA chips?',
      answer:
        'AA chips are a type of milestone token. The word "token" is broader — it covers AA chips, NA medallions, Celebrate Recovery coins, and every other program-specific marker. If you\'re shopping for someone whose program you don\'t know, a generic premium milestone token works across every tradition.',
    },
    {
      question: 'What milestones typically get tokens?',
      answer:
        'The most common milestone tokens are 24 hours, 30 days, 60 days, 90 days, 6 months, 9 months, and then annual anniversaries starting at 1 year. Some people also collect tokens for 18 months, 2 years, 5 years, 10 years, 15 years, 20 years, and 25 years. Every milestone that matters to you deserves one.',
    },
    {
      question: 'Can I get a custom milestone token made?',
      answer:
        'Yes. Our custom token flow lets you design a one-of-a-kind milestone token with your own date, engraving, and imagery. You can either describe your vision and let us design it, or control every detail yourself. The custom flow is built for people who want their milestone marked by something truly personal.',
    },
    {
      question: 'What material is best for a milestone token?',
      answer:
        'Bronze is the most traditional and durable choice — it develops a patina over time that many people find meaningful. Silver has a cleaner, more formal look and feels substantial in the hand. Gold is reserved for the most significant milestones — typically 10+ year anniversaries. For daily-carry tokens that need to survive pockets and keyrings, bronze is the most forgiving.',
    },
  ],
  schema: ['breadcrumb', 'faq', 'webPage'],
});
```

- [ ] **Step 2: Run typecheck**

```bash
npm run typecheck
```

Expected: PASS.

- [ ] **Step 3: Start dev server**

```bash
npm run dev
```

- [ ] **Step 4: Load `/milestone-tokens` in the browser**

Navigate to `http://localhost:3000/milestone-tokens`.

Expected:
- Page renders without errors
- H1 shows "Milestone Tokens"
- Hero has two CTAs ("Shop Milestone Tokens" + "Or design your own")
- Trust bar visible
- Intro text section visible
- 4 products in showcase (from `collections/all`)
- CustomTokenFeatureBlock visible mid-page with three-step visual and two CTAs
- Two distinctive content sections ("Every Milestone Deserves a Marker" + "Tokens, Chips, Coins, Medallions...")
- 5-question FAQ accordion
- Related pages grid
- Final dual-CTA card

- [ ] **Step 5: Verify JSON-LD in page source**

Right-click the page → View Source. Search for `application/ld+json`.

Expected: At least 3 JSON-LD blocks — BreadcrumbList, WebPage, and FAQPage.

- [ ] **Step 6: Verify sitemap inclusion**

In the browser, load `http://localhost:3000/sitemap/custom/1.xml`.

Expected: `<loc>http://localhost:3000/milestone-tokens</loc>` appears in the XML.

- [ ] **Step 7: Regression-check an existing commercial page**

Navigate to `http://localhost:3000/recovery-tokens`.

Expected: Page still renders on the legacy `CommercialLandingTemplate` (no CustomTokenFeatureBlock visible — that's the legacy template). Visually identical to pre-change.

Stop the dev server (Ctrl+C).

- [ ] **Step 8: Commit**

```bash
git add app/data/seo-pages.ts
git commit -m "feat(seo): register /milestone-tokens pilot page on GenericSEOLandingTemplate"
```

---

## Task 6: Create CustomIntentLandingTemplate

**Files:**
- Create: `app/components/seo/CustomIntentLandingTemplate.tsx`

**Context:** Tier B template. Custom-token-forward: hero points straight at `/custom-token`, the `CustomTokenFeatureBlock` sits directly below the hero as a feature showcase, and products appear later labeled "Or shop ready-made." Used by the 5 custom-intent pages.

- [ ] **Step 1: Create the template file**

Create `app/components/seo/CustomIntentLandingTemplate.tsx` with:

```tsx
/**
 * CustomIntentLandingTemplate — Tier B custom-intent SEO pages
 *
 * Used by: /custom-recovery-token, /custom-aa-coins, /custom-na-coins,
 *          /custom-sobriety-medallion, /personalized-recovery-tokens
 *
 * Layout: Breadcrumbs → Hero (primary CTA → /custom-token)
 *       → CustomTokenFeatureBlock (hero-adjacent) → Two-Paths Explanation
 *       → Distinctive Section → Product Showcase (secondary "Or shop ready-made")
 *       → FAQ → Related Pages → Final CTA (/custom-token)
 *
 * Custom-token-forward. Products are shown but framed as a fallback for
 * visitors who don't want to go through the design flow.
 */

import {Link} from 'react-router';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';
import {Breadcrumbs} from '~/components/ui/Breadcrumbs';
import {JsonLd} from '~/components/seo/JsonLd';
import {Button} from '~/components/ui/Button';
import {SEOProductCard} from '~/components/seo/SEOProductCard';
import {SEOFaqAccordion} from '~/components/seo/SEOFaqAccordion';
import {SEORelatedPages} from '~/components/seo/SEORelatedPages';
import {CustomTokenFeatureBlock} from '~/components/seo/CustomTokenFeatureBlock';
import type {SEOPage} from '~/data/seo-pages';

interface CustomIntentLandingTemplateProps {
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
      minVariantPrice: MoneyV2;
    };
  }>;
}

export function CustomIntentLandingTemplate({
  page,
  products,
}: CustomIntentLandingTemplateProps) {
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

  const textSections = page.sections.filter((s) => s.type === 'text');

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
          <Link to="/custom-token" prefetch="intent">
            <Button
              variant="primary"
              size="lg"
              className="!bg-accent !text-black"
            >
              {page.primaryCTA.label}
            </Button>
          </Link>
        </div>
      </section>

      {/* Custom Token Feature Block — directly below hero */}
      <div className="container-standard pb-16">
        <CustomTokenFeatureBlock copy={page.customTokenBlock} />
      </div>

      {/* Text sections — the two-paths explanation and distinctive content */}
      {textSections.length > 0 && (
        <div className="container-standard pb-16 space-y-16">
          {textSections.map((section, index) => (
            <section key={index}>
              {section.heading && (
                <h2 className="font-display text-subsection text-white mb-4">
                  {section.heading}
                </h2>
              )}
              <div className="text-white/50 leading-relaxed max-w-3xl">
                {section.body.split('\n\n').map((paragraph, pIdx) => (
                  <p key={pIdx} style={{marginBottom: '1.5rem'}}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Product Showcase — secondary, labeled "Or shop ready-made" */}
      {products.length > 0 && (
        <div className="container-standard pb-16">
          <section>
            <h2 className="font-display text-subsection text-white mb-2">
              Or shop ready-made
            </h2>
            <p className="text-white/40 text-sm mb-8 max-w-2xl">
              Prefer something off the shelf? Browse our handcrafted collection
              — every token is built to the same premium standard as our custom
              work.
            </p>
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
        </div>
      )}

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
            Ready to start designing?
          </h2>
          <p
            style={{
              color: 'rgba(255,255,255,0.5)',
              marginBottom: '2rem',
              maxWidth: '32rem',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            Your story deserves a token made for it — not pulled from a catalog.
            The custom flow takes about 5 minutes.
          </p>
          <Link to="/custom-token" prefetch="intent">
            <Button
              variant="primary"
              size="lg"
              className="!bg-accent !text-black"
            >
              Start Designing
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Run typecheck**

```bash
npm run typecheck
```

Expected: PASS.

- [ ] **Step 3: Run lint**

```bash
npm run lint app/components/seo/CustomIntentLandingTemplate.tsx
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add app/components/seo/CustomIntentLandingTemplate.tsx
git commit -m "feat(seo): add CustomIntentLandingTemplate for Tier B custom-intent pages"
```

---

## Interlude: Execute Task 3 now

At this point Tasks 1, 2, 4, and 6 are complete and the two new templates exist. Go back and execute Task 3 (routing switch extension) now. After Task 3 commits cleanly, resume with Task 7.

---

## Task 7: Register and verify pilot page `/custom-recovery-token`

**Files:**
- Modify: `app/data/seo-pages.ts` (append new `registerSEOPage()` call)

**Context:** The flagship Tier B page. This is the quality bar for the other four custom-intent pages. Content leans fully into the `/custom-token` flow.

- [ ] **Step 1: Append the page registration**

At the end of `app/data/seo-pages.ts`, append below the `/milestone-tokens` registration:

```ts
// ============================================================
// PHRASE-MATCH EXPANSION — TIER B (custom-intent template)
// ============================================================

registerSEOPage({
  slug: 'custom-recovery-token',
  type: 'commercial',
  template: 'custom-intent',
  title: 'Custom Recovery Token',
  metaTitle: 'Custom Recovery Token — Design Your Own Sobriety Coin | Coinplugz',
  metaDescription:
    'Design a one-of-a-kind custom recovery token. Choose engraving, material, and imagery — or tell us your story and we\'ll design it for you. Built for the milestones that matter most.',
  canonicalPath: 'custom-recovery-token',
  eyebrow: 'Make It Yours',
  heroDescription:
    "A custom recovery token turns your story into something you can hold. Your date, your imagery, your words — on a premium token built to last a lifetime. Two ways to create yours.",
  primaryCTA: {label: 'Start Designing', href: '/custom-token'},
  featuredCollectionHandle: 'all',
  relatedPageSlugs: [
    'milestone-tokens',
    'personalized-recovery-tokens',
    'recovery-tokens',
    'custom-sobriety-coins',
  ],
  customTokenBlock: {
    eyebrow: 'The Flagship Experience',
    headline: "A recovery token that's truly yours — start to finish.",
    body: "Every milestone is different. So is every story. Our custom token flow is built for the moments a stock design can't quite capture — the name you want engraved, the date only you know, the image that means something only to you. Two paths, one result: a token made for you alone.",
    primaryCtaLabel: 'Start Designing',
    secondaryCtaLabel: 'See the Process',
  },
  sections: [
    {
      type: 'text',
      heading: 'Two Paths to Your Custom Recovery Token',
      body: "When you start the custom token flow, you'll choose between two paths.\n\n**We Design It For You.** If you have a story but not a design, tell us the occasion, the person, the milestone, the words that matter. Our designers will translate your answers into a finished proof — usually within 2-3 business days — and send it to you by email. You review, suggest changes, and approve. Once you're happy, we cast and finish the token and ship it to you. This path is best for people who know what they want to say but don't want to pick every font and color.\n\n**You Design It Yourself.** If you have a clear vision — specific imagery, a layout in mind, fonts you love — the self-design path gives you control. You describe your design, refine it with our on-screen tools, preview the front and back, and approve before we produce it. This path is best for people who enjoy the design process and want to own every detail.\n\nBoth paths end the same way: a premium, handcrafted recovery token built from bronze, silver, or gold, weighted to feel substantial in your pocket, and made to last longer than the memories it marks.",
    },
    {
      type: 'text',
      heading: 'What You Can Customize',
      body: "A custom recovery token isn't just a stock design with a date slapped on. You control everything that matters.\n\n**Engraving.** Names, dates, phrases, Roman numerals, the Serenity Prayer, a sponsor's initials, a spouse's handwriting. Front and back. Deep engraving that won't wear off.\n\n**Imagery.** Triangle and circle (AA), clean-time symbols (NA), a lighthouse, a mountain, a phoenix, a tree, your home group logo, a meaningful place. If you can describe it, we can design it.\n\n**Material and finish.** Bronze (traditional, develops a warm patina), silver (clean and formal), or gold (reserved for major milestones). Matte, polished, or antiqued finishes.\n\n**Size and weight.** Standard pocket-carry sized (same as AA chips) or larger commemorative sizes for display.\n\n**Edge and rim details.** Knurled, beaded, plain, or custom-etched rims.\n\nThe only thing you can't customize is the quality. Every token we ship meets the same premium standard.",
    },
    {
      type: 'text',
      heading: 'Who Custom Recovery Tokens Are For',
      body: "Most people who order a custom recovery token are marking an occasion a stock design can't quite reach. Sponsors giving a 1-year medallion to a sponsee whose story they want to honor. Spouses commemorating a partner's 5-year sober anniversary. Parents celebrating a child's first year in recovery. People in long-term recovery building a personal collection that documents their own journey in a way no catalog can.\n\nThe custom flow also serves the practical case: group logos for home groups, retreat commemorative tokens, recovery center graduation coins, and memorial tokens for people lost to addiction. Whatever the reason, the custom path exists because some milestones deserve a token designed for that exact moment and nobody else's.",
    },
  ],
  faq: [
    {
      question: 'How long does it take to get a custom recovery token?',
      answer:
        'Design proofs typically come back within 2-3 business days. Once you approve the design, production takes about a week. Total time from order to doorstep is usually 2-3 weeks — longer if you choose gold or request multiple rounds of revisions.',
    },
    {
      question: 'How much does a custom recovery token cost?',
      answer:
        'Custom token pricing depends on material (bronze is most affordable, gold is the most premium), size, and complexity of the design. Start the custom flow to get a personalized quote — you\'ll see the price before you commit to anything.',
    },
    {
      question: 'Can I see the design before I commit to buying?',
      answer:
        'Yes. Both custom paths produce a finished design proof that you review and approve before we start production. If the proof isn\'t quite right, you can request revisions. You only commit to the final product once you\'ve signed off on the design.',
    },
    {
      question: "What's the difference between a custom token and a personalized token?",
      answer:
        'A personalized token is a stock design with your name or date engraved on it. A custom token is a design built from scratch to your specifications — imagery, layout, engraving, and all. Personalization is faster and cheaper. Custom gives you something genuinely one-of-a-kind.',
    },
    {
      question: 'Can I order multiple identical custom tokens?',
      answer:
        "Yes. Custom designs can be produced in quantities from 1 to several hundred — useful for home groups, retreats, or gifting a matching set to people who shared a milestone. Quantity pricing becomes more favorable above 10 units.",
    },
  ],
  schema: ['breadcrumb', 'faq', 'webPage'],
});
```

- [ ] **Step 2: Run typecheck**

```bash
npm run typecheck
```

Expected: PASS.

- [ ] **Step 3: Start dev server**

```bash
npm run dev
```

- [ ] **Step 4: Load `/custom-recovery-token` in the browser**

Navigate to `http://localhost:3000/custom-recovery-token`.

Expected:
- H1: "Custom Recovery Token"
- Hero CTA: "Start Designing" (single primary, no secondary)
- CustomTokenFeatureBlock directly below the hero (NOT mid-page) with the overridden copy ("The Flagship Experience" eyebrow)
- Three text sections below the feature block
- Product grid labeled "Or shop ready-made" (smaller visual weight)
- 5-question FAQ
- Related pages
- Final CTA: "Start Designing"

- [ ] **Step 5: Verify `/milestone-tokens` still renders correctly**

Navigate to `http://localhost:3000/milestone-tokens`. Expected: unchanged from Task 5's verification. The two new templates coexist.

Stop the dev server (Ctrl+C).

- [ ] **Step 6: Commit**

```bash
git add app/data/seo-pages.ts
git commit -m "feat(seo): register /custom-recovery-token flagship page on CustomIntentLandingTemplate"
```

---

## Task 8: Register Tier A batch 1 — 5 AA/NA exact-phrase pages

**Files:**
- Modify: `app/data/seo-pages.ts` (append 5 new `registerSEOPage()` calls)

**Context:** Five AA/NA phrase-match pages. Each needs 600-800 words of distinct prose following the angle table in the spec §6.1. The plan provides the full metadata shell and FAQ questions for each page, plus the distinctive angle per the spec. Body prose is drafted following the `/milestone-tokens` pilot pattern from Task 5.

**Critical de-duplication rule:** Do not reuse prose between `aa-sobriety-coins`, `aa-sobriety-tokens`, and `aa-sober-chips`. The angles are deliberately different (color system, etymology/history, in-meeting ritual) — keep the distinctive section genuinely distinct.

- [ ] **Step 1: Append `/aa-sobriety-coins` — angle: AA color system**

Append to `app/data/seo-pages.ts`:

```ts
registerSEOPage({
  slug: 'aa-sobriety-coins',
  type: 'commercial',
  template: 'generic-seo',
  title: 'AA Sobriety Coins',
  metaTitle: 'AA Sobriety Coins — Premium Handcrafted AA Chips | Coinplugz',
  metaDescription:
    'Shop premium AA sobriety coins for every milestone. Handcrafted coins in the traditional AA color system. Design your own for a truly personal touch.',
  canonicalPath: 'aa-sobriety-coins',
  eyebrow: 'Alcoholics Anonymous',
  heroDescription:
    "AA sobriety coins are the original milestone markers — handed out in meetings for over 80 years to celebrate clean time from 24 hours onward. Shop the collection or design your own.",
  primaryCTA: {label: 'Shop AA Sobriety Coins', href: '/collections/all'},
  featuredCollectionHandle: 'all',
  relatedPageSlugs: [
    'aa-coins',
    'aa-sobriety-tokens',
    'aa-sober-chips',
    'sobriety-coins',
    'custom-aa-coins',
  ],
  sections: [
    {
      type: 'text',
      heading: 'What Are AA Sobriety Coins?',
      // Body: ~150 words. Explain the AA tradition of handing out coins at meetings
      // to mark milestones. Cover the basic milestone ladder (24hr, 30d, 60d, 90d, 6mo, 9mo, 1yr+).
      // Mention Clarence Snyder's 1940s Cleveland group originated the tradition.
      // Use the phrase "AA sobriety coins" 2-3 times.
      body: "[Draft per the Task 5 pilot pattern. ~150 words. Use exact phrase 'AA sobriety coins' 2-3 times. Cover: what AA sobriety coins are, who gives them (group secretary at meetings), what milestones they mark (24hr white chip → 30d → 60d → 90d → 6mo → 9mo → 1yr+), brief mention of the 1940s origin. End with a sentence connecting to the distinctive angle of this page — the color system.]",
    },
    {
      type: 'text',
      heading: 'Colors and Meanings in AA Sobriety Coins',
      // Body: ~300 words. THIS IS THE DISTINCTIVE ANGLE FOR THIS PAGE.
      // Detail the AA color convention for early milestones: white (24hr/desire),
      // gold or yellow (30 days), red (60 days), green (90 days), blue (6 months),
      // purple (9 months), bronze (1 year+). Note that colors vary by region and group.
      // Explain what each color represents (white = surrender, red = willingness, etc.).
      // Note that annual coins are traditionally bronze, silver, or gold by material
      // rather than paint, and the material itself carries meaning.
      body: "[Draft ~300 words on the AA color system. This is the distinctive angle — do NOT mention etymology or in-meeting ritual. Focus on colors. Reference: white/24hr, gold/30d, red/60d, green/90d, blue/6mo, purple/9mo. Annual bronze/silver/gold material distinction. Note regional variation. Close with why the color system matters emotionally — each color represents a stage of the early-recovery journey.]",
    },
    {
      type: 'text',
      heading: 'Why Premium Matters for AA Sobriety Coins',
      body: "[Draft ~200 words. The token you carry every day should feel like it means something. Contrast mass-produced meeting chips with premium handcrafted ones. Emphasize material quality, weight, longevity. Use the exact phrase 'AA sobriety coins' once more.]",
    },
  ],
  faq: [
    {
      question: 'What do the colors on AA sobriety coins mean?',
      answer:
        "AA sobriety coin colors mark early milestones. The most common system: white (24 hours / desire chip), gold or yellow (30 days), red (60 days), green (90 days), blue (6 months), purple (9 months), and bronze (1 year). Annual coins beyond the first year are typically bronze, silver, or gold by material rather than paint. Colors vary by region and group, so your home group's tradition may differ slightly.",
    },
    {
      question: 'What is the first AA sobriety coin called?',
      answer:
        'The first AA sobriety coin is the 24-hour chip, often called the "white chip" or "desire chip." It\'s given to anyone in the meeting who wants to try sobriety for the next 24 hours — no questions asked, no judgment. The white chip represents the surrender that makes everything else possible.',
    },
    {
      question: 'Who gives out AA sobriety coins at meetings?',
      answer:
        "At most AA meetings, the chairperson or a designated member hands out sobriety coins. The person receiving the chip usually walks to the front of the room and shares briefly about their milestone. Some groups invite the person's sponsor to hand them the coin personally.",
    },
    {
      question: 'Can I buy my own AA sobriety coin instead of getting one at a meeting?',
      answer:
        "Yes. Many people buy their own AA sobriety coins as keepsakes, gifts, or replacements for chips they've lost. There's no rule against it — AA sobriety coins are meaningful because of what they represent, not because of where you got them. Our handcrafted coins are made to last decades longer than the stamped aluminum ones handed out at most meetings.",
    },
  ],
  schema: ['breadcrumb', 'faq', 'webPage'],
});
```

**Implementation note for Step 1:** The bracketed `[Draft ...]` placeholders in the `body` fields are instructions to the implementer, not content to ship. Before committing, replace each bracketed block with 150-300 words of original prose that follows the guidance. Do not ship with bracketed placeholders in the body. The same convention applies to Tasks 9-13.

- [ ] **Step 2: Append `/aa-sobriety-tokens` — angle: etymology / Clarence Snyder history**

```ts
registerSEOPage({
  slug: 'aa-sobriety-tokens',
  type: 'commercial',
  template: 'generic-seo',
  title: 'AA Sobriety Tokens',
  metaTitle: 'AA Sobriety Tokens — The Original Recovery Chips | Coinplugz',
  metaDescription:
    "Shop premium AA sobriety tokens. Discover the 1940s Cleveland origin story and carry the tradition that started it all. Handcrafted tokens for every milestone.",
  canonicalPath: 'aa-sobriety-tokens',
  eyebrow: 'AA Heritage',
  heroDescription:
    "AA sobriety tokens have a specific origin — the Clarence Snyder group in 1940s Cleveland, who first handed out poker chips at meetings to mark clean time. The word 'token' stuck. Here's where the tradition began.",
  primaryCTA: {label: 'Shop AA Sobriety Tokens', href: '/collections/all'},
  featuredCollectionHandle: 'all',
  relatedPageSlugs: [
    'aa-coins',
    'aa-sobriety-coins',
    'aa-sober-chips',
    'alcoholics-anonymous-sobriety-coins',
    'custom-aa-coins',
  ],
  sections: [
    {
      type: 'text',
      heading: 'What Are AA Sobriety Tokens?',
      body: "[Draft ~150 words. Define AA sobriety tokens, note the terminology overlap with chips/coins, mention they are used to mark milestones from 24 hours on. Use exact phrase 'AA sobriety tokens' 2-3 times. End with a sentence that sets up the distinctive angle — the historical origin.]",
    },
    {
      type: 'text',
      heading: 'Where the Token Tradition Began',
      // DISTINCTIVE ANGLE: Clarence Snyder's Cleveland AA group, 1940s.
      body: "[Draft ~300 words on the historical origin. Clarence Snyder co-founded one of the first AA groups in Cleveland in 1939-1940 after splitting from the Akron group. His group innovated handing out poker chips to mark milestones — the cheapest round tokens they could find. The word 'token' came from those poker chips. The practice spread across AA in the 1940s and eventually became universal. This is the etymological origin story that no other AA page on the site covers. Do NOT discuss colors or in-meeting ritual here — those are other pages' angles.]",
    },
    {
      type: 'text',
      heading: 'From Poker Chips to Premium Bronze',
      body: "[Draft ~200 words. Contrast the original stamped poker chips with modern handcrafted AA sobriety tokens. Emphasize that the symbolism has deepened even as the material has improved. Use exact phrase once more.]",
    },
  ],
  faq: [
    {
      question: 'Where did AA sobriety tokens come from?',
      answer:
        "AA sobriety tokens trace back to Clarence Snyder's Cleveland AA group in the early 1940s. Snyder's group was one of the first to formalize milestone celebrations, and they used poker chips — the cheapest round tokens they could buy — to mark clean time. The practice spread across AA meetings throughout the 1940s and became the tradition we know today.",
    },
    {
      question: 'Why are they called tokens and not chips?',
      answer:
        "The words 'token' and 'chip' both come from the original poker-chip tradition, and they're largely interchangeable. Some groups prefer 'token' because it evokes the idea of something given in recognition — a token of achievement. Others stick with 'chip' as a nod to the original object. In modern AA, both terms refer to the same milestone markers.",
    },
    {
      question: 'Are AA sobriety tokens the same as AA chips?',
      answer:
        "Yes, functionally they're the same object with slightly different names. Some groups use 'chip' for smaller stamped-plastic meeting markers and 'token' for heavier cast-metal milestone coins, but the distinction is informal and varies by region.",
    },
    {
      question: 'What milestones do AA sobriety tokens mark?',
      answer:
        "AA sobriety tokens mark the same milestones AA has recognized for decades: 24 hours, 30 days, 60 days, 90 days, 6 months, 9 months, 1 year, and every annual anniversary after that. Some groups also recognize 18 months as a formal milestone.",
    },
  ],
  schema: ['breadcrumb', 'faq', 'webPage'],
});
```

- [ ] **Step 3: Append `/aa-sober-chips` — angle: in-meeting ritual**

```ts
registerSEOPage({
  slug: 'aa-sober-chips',
  type: 'commercial',
  template: 'generic-seo',
  title: 'AA Sober Chips',
  metaTitle: 'AA Sober Chips — Premium Recovery Chips for Every Milestone | Coinplugz',
  metaDescription:
    "Shop premium AA sober chips for every milestone from 24 hours to 25+ years. The tradition of the white desire chip and the ritual of picking yours up.",
  canonicalPath: 'aa-sober-chips',
  eyebrow: 'The Meeting Room Tradition',
  heroDescription:
    "The moment you walk up to the front of the room and pick up your AA sober chip is the moment the milestone becomes real. Handcrafted chips that carry the weight of what you earned.",
  primaryCTA: {label: 'Shop AA Sober Chips', href: '/collections/all'},
  featuredCollectionHandle: 'all',
  relatedPageSlugs: [
    'aa-coins',
    'aa-sobriety-coins',
    'aa-sobriety-tokens',
    '24-hour-chip',
    'custom-aa-coins',
  ],
  sections: [
    {
      type: 'text',
      heading: 'What Are AA Sober Chips?',
      body: "[Draft ~150 words. Define AA sober chips, note they are milestone markers given out at meetings. Use exact phrase 'AA sober chips' 2-3 times. Set up the distinctive angle — the ritual of picking one up.]",
    },
    {
      type: 'text',
      heading: 'The Ritual of Picking Up Your Chip',
      // DISTINCTIVE ANGLE: the meeting-room ritual, emotional/behavioral angle.
      body: "[Draft ~300 words on the in-meeting ritual. The moment the chairperson asks who has a milestone this week. The walk to the front of the room. The white desire chip extended first — anyone who wants to try 24 hours of sobriety can take one, no questions asked. The applause. The hug or handshake from a sponsor. The brief moment of sharing — 'My name is ___ and I'm an alcoholic' followed by the milestone announcement. Do NOT discuss colors or historical origins here. Focus on the lived experience of the moment, the community aspect, the way the ritual transforms an abstract number into a shared acknowledgment.]",
    },
    {
      type: 'text',
      heading: 'Carrying the Chip Home',
      body: "[Draft ~200 words. What happens to the chip after the meeting. Pocket carry, nightstand, desk drawer, keychain. Stories of people pulling the chip out in hard moments. The physical object as a touchstone. Use exact phrase once more.]",
    },
  ],
  faq: [
    {
      question: 'What is the white chip in AA?',
      answer:
        "The white chip — also called the 'desire chip' or '24-hour chip' — is the first AA sober chip. It's offered to anyone in the meeting who wants to try 24 hours of sobriety, whether it's their first day or their hundredth relapse. The only requirement for taking a white chip is the desire to stop drinking.",
    },
    {
      question: 'Is there a ritual for receiving an AA sober chip?',
      answer:
        "Most AA meetings have a brief moment in every meeting when the chairperson asks who has a milestone. People with milestones walk up, receive their chip, often say their name and their clean-time count, and are met with applause. The format varies by group — some meetings invite a sponsor to hand over the chip personally, others keep it informal.",
    },
    {
      question: "What do you do with AA sober chips after you get them?",
      answer:
        "Most people carry their most recent chip in a pocket or wallet as a daily reminder. Older chips often end up on a keychain, in a nightstand drawer, or in a display case for longer collections. Some people keep every chip they've earned; others carry only the 24-hour and the most recent annual.",
    },
    {
      question: "Can I give someone an AA sober chip as a gift?",
      answer:
        "Yes, though the traditional giving happens at meetings. Giving an AA sober chip as a gift outside the meeting — from a sponsor to a sponsee, from a family member to someone in recovery, or as a keepsake replacement for a lost chip — is common and meaningful. A handcrafted premium chip can make a meaningful milestone gift.",
    },
  ],
  schema: ['breadcrumb', 'faq', 'webPage'],
});
```

- [ ] **Step 4: Append `/na-sobriety-coins` — angle: NA vs AA differences**

```ts
registerSEOPage({
  slug: 'na-sobriety-coins',
  type: 'commercial',
  template: 'generic-seo',
  title: 'NA Sobriety Coins',
  metaTitle: 'NA Sobriety Coins — Narcotics Anonymous Medallions | Coinplugz',
  metaDescription:
    "Shop premium NA sobriety coins and medallions. Narcotics Anonymous uses its own chip tradition — here's how it differs from AA and where to find quality tokens.",
  canonicalPath: 'na-sobriety-coins',
  eyebrow: 'Narcotics Anonymous',
  heroDescription:
    "NA sobriety coins mark clean time in Narcotics Anonymous. NA has its own color system, its own key-tag tradition for early clean-time, and its own medallion tradition for annual milestones.",
  primaryCTA: {label: 'Shop NA Sobriety Coins', href: '/collections/all'},
  featuredCollectionHandle: 'all',
  relatedPageSlugs: [
    'na-coins',
    'na-sober-chips',
    'narcotics-anonymous-coins',
    'aa-sobriety-coins',
    'custom-na-coins',
  ],
  sections: [
    {
      type: 'text',
      heading: 'What Are NA Sobriety Coins?',
      body: "[Draft ~150 words. Define NA sobriety coins, note that NA uses them to mark clean-time milestones the same way AA uses chips. Set up the distinctive angle — how NA differs from AA.]",
    },
    {
      type: 'text',
      heading: 'How NA Sobriety Coins Differ From AA Chips',
      // DISTINCTIVE ANGLE: NA-specific traditions.
      body: "[Draft ~300 words. Key differences: NA uses key tags (plastic) for shorter clean-time milestones (30d, 60d, 90d, 6mo, 9mo) and medallions (metal) for annual milestones. NA color system: white (welcome / desire), orange (30d), green (60d), red (90d), blue (6mo), yellow (9mo), moonglow (1yr), and then annual medallions. Mention NA was founded in 1953 — newer than AA (1935). NA traditions adapted AA's chip system for drug addiction specifically. Do NOT go into NA history — that belongs on /narcotics-anonymous-coins.]",
    },
    {
      type: 'text',
      heading: 'Key Tags, Medallions, and Premium NA Sobriety Coins',
      body: "[Draft ~200 words. Contrast the plastic key tags handed out in most NA meetings with premium metal medallions for annual milestones. Discuss why someone might want a handcrafted metal medallion for their clean date even if their home group gives out plastic. Use exact phrase once more.]",
    },
  ],
  faq: [
    {
      question: 'What are NA sobriety coins called?',
      answer:
        "NA has two distinct milestone markers: key tags for shorter clean-time milestones (white/welcome, orange/30d, green/60d, red/90d, blue/6mo, yellow/9mo) and medallions for annual anniversaries (moonglow for 1 year, then annual colors or metal for subsequent years). Both are often called 'NA sobriety coins' in casual conversation even though key tags are technically plastic tags, not coins.",
    },
    {
      question: 'How are NA sobriety coins different from AA chips?',
      answer:
        "The biggest difference is that NA uses key tags (plastic) for early clean-time and metal medallions only for annual milestones, while AA uses metal chips for every milestone from 24 hours forward. The color systems are also different — NA and AA use overlapping but not identical color conventions.",
    },
    {
      question: 'What does moonglow mean in NA?',
      answer:
        "Moonglow is the traditional color for the 1-year NA medallion. It's a pearlescent cream-white color that stands out distinctly from AA's bronze 1-year chip. Moonglow marks the first major annual milestone in NA and is usually the first metal medallion a member receives (after a year of plastic key tags).",
    },
    {
      question: "Can I use an NA sobriety coin if my program is different?",
      answer:
        "Yes. NA sobriety coins are meaningful across recovery traditions. Many people in cross-program recovery — AA, NA, Celebrate Recovery, SMART Recovery — choose medallions from whichever program resonates most. The coin is for you, not the program.",
    },
  ],
  schema: ['breadcrumb', 'faq', 'webPage'],
});
```

- [ ] **Step 5: Append `/na-sober-chips` — angle: clarifier for cross-program terminology**

```ts
registerSEOPage({
  slug: 'na-sober-chips',
  type: 'commercial',
  template: 'generic-seo',
  title: 'NA Sober Chips',
  metaTitle: 'NA Sober Chips — Key Tags, Medallions, and Recovery Coins | Coinplugz',
  metaDescription:
    "Shop NA sober chips, key tags, and medallions. Learn how NA's clean-time tradition actually works — and find premium recovery coins for every milestone.",
  canonicalPath: 'na-sober-chips',
  eyebrow: 'Narcotics Anonymous',
  heroDescription:
    "The phrase 'NA sober chips' covers a tradition that uses both plastic key tags and metal medallions. Here's how the system works — and the premium handcrafted coins that honor the milestones NA celebrates.",
  primaryCTA: {label: 'Shop NA Sober Chips', href: '/collections/all'},
  featuredCollectionHandle: 'all',
  relatedPageSlugs: [
    'na-coins',
    'na-sobriety-coins',
    'narcotics-anonymous-coins',
    'aa-sober-chips',
    'custom-na-coins',
  ],
  sections: [
    {
      type: 'text',
      heading: 'Are There NA Sober Chips?',
      body: "[Draft ~150 words. Clarifier opening. 'NA sober chips' is a cross-program phrasing — technically NA uses key tags and medallions, not 'chips' like AA. But the search phrase captures people who know the tradition exists without knowing the exact NA terminology. Walk them into NA's actual system. Use exact phrase 2-3 times.]",
    },
    {
      type: 'text',
      heading: 'Key Tags, Medallions, and Chips in NA',
      // DISTINCTIVE ANGLE: terminology clarifier.
      body: "[Draft ~300 words. NA's actual tradition: plastic key tags for early milestones (30d through 18mo), metal medallions for annual anniversaries (1yr+), and the distinction between 'clean time' (NA terminology) vs 'sobriety' (AA terminology). Note that NA members often still refer to any of these as 'chips' in casual speech. Cover the NA color sequence: white → orange → green → red → blue → yellow → moonglow. Do NOT cover NA vs AA comparisons in depth — that's /na-sobriety-coins.]",
    },
    {
      type: 'text',
      heading: 'Premium Recovery Coins for NA Milestones',
      body: "[Draft ~200 words. Discuss options for NA members who want a premium handcrafted milestone coin beyond the standard key tag. Custom medallions with NA symbols (the Service Symbol — square with four points). Use exact phrase once more.]",
    },
  ],
  faq: [
    {
      question: 'Does NA use chips like AA?',
      answer:
        "Not exactly. NA's tradition uses plastic key tags for early clean-time milestones (white/welcome, orange/30d, green/60d, red/90d, blue/6mo, yellow/9mo, moonglow/1yr) and metal medallions for annual anniversaries after the first year. NA members sometimes call these 'chips' in casual speech, but technically NA has key tags and medallions rather than AA-style chips.",
    },
    {
      question: 'What is a key tag in NA?',
      answer:
        "An NA key tag is a small plastic tag, usually with a hole for a keychain, given out at NA meetings to mark clean-time milestones before the 1-year anniversary. Key tags follow a color sequence: white (welcome / any clean-time desire), orange (30 days), green (60 days), red (90 days), blue (6 months), yellow (9 months), and moonglow (1 year — the transition to metal medallions).",
    },
    {
      question: 'When does NA switch from key tags to medallions?',
      answer:
        "NA members typically receive their first metal medallion at 1 year of clean time. The 1-year medallion is traditionally moonglow-colored (pearlescent white). Annual medallions continue every year after that, usually in metal — bronze, silver, or gold — though some groups use colored enamel for specific annual milestones.",
    },
    {
      question: "Can I buy an NA sober chip as a gift for someone?",
      answer:
        "Yes. Premium handcrafted NA medallions make meaningful gifts for sponsors, sponsees, family members, or yourself. Our custom token flow lets you design an NA medallion with the Service Symbol, a clean date, or a personal engraving.",
    },
  ],
  schema: ['breadcrumb', 'faq', 'webPage'],
});
```

- [ ] **Step 6: Draft all prose and remove bracketed placeholders**

Before the typecheck step, go through all 5 new page registrations and replace every `[Draft ...]` placeholder with actual prose at the target word count. Use the `/milestone-tokens` pilot from Task 5 as the voice/tone reference. Each body should:
- Hit the target word count (~150 / ~300 / ~200 for the three sections)
- Use the exact phrase at least 2-3 times across the page
- NOT reuse sentences or paragraphs between sibling pages
- Follow the spec §6.1 distinctive angle for that slug

- [ ] **Step 7: Run typecheck**

```bash
npm run typecheck
```

Expected: PASS.

- [ ] **Step 8: Start dev server and spot-check each new page**

```bash
npm run dev
```

Visit each of the 5 new pages:
- `http://localhost:3000/aa-sobriety-coins`
- `http://localhost:3000/aa-sobriety-tokens`
- `http://localhost:3000/aa-sober-chips`
- `http://localhost:3000/na-sobriety-coins`
- `http://localhost:3000/na-sober-chips`

For each: verify the H1 matches the exact phrase, CustomTokenFeatureBlock is visible, three text sections render, FAQ loads, related pages show links to the existing `/aa-coins` / `/na-coins` plus sibling new pages.

**Critical check:** Diff the prose between `/aa-sobriety-coins`, `/aa-sobriety-tokens`, and `/aa-sober-chips`. If any two pages share full sentences or paragraphs, the de-duplication rule is broken — rewrite before committing.

Stop the dev server (Ctrl+C).

- [ ] **Step 9: Commit**

```bash
git add app/data/seo-pages.ts
git commit -m "feat(seo): register Tier A batch 1 — 5 AA/NA phrase-match pages"
```

---

## Task 9: Register Tier A batch 2 — 4 remaining Tier A pages

**Files:**
- Modify: `app/data/seo-pages.ts` (append 4 new `registerSEOPage()` calls)

**Context:** Four more Tier A pages covering long-form program names, the singular `sobriety-medallion` query, and the umbrella `recovery-chips` comparison page.

- [ ] **Step 1: Append `/alcoholics-anonymous-sobriety-coins` — angle: AA founding history**

```ts
registerSEOPage({
  slug: 'alcoholics-anonymous-sobriety-coins',
  type: 'commercial',
  template: 'generic-seo',
  title: 'Alcoholics Anonymous Sobriety Coins',
  metaTitle: 'Alcoholics Anonymous Sobriety Coins — Premium Recovery Chips | Coinplugz',
  metaDescription:
    "Shop premium Alcoholics Anonymous sobriety coins. The full history of AA's chip tradition from 1935 Akron to today, and handcrafted coins for every milestone.",
  canonicalPath: 'alcoholics-anonymous-sobriety-coins',
  eyebrow: 'Since 1935',
  heroDescription:
    "Alcoholics Anonymous sobriety coins carry one of the oldest traditions in modern recovery. From Bill W. and Dr. Bob's first meeting in 1935 Akron to today's meeting rooms worldwide, these coins mark the milestones that make recovery real.",
  primaryCTA: {
    label: 'Shop Alcoholics Anonymous Sobriety Coins',
    href: '/collections/all',
  },
  featuredCollectionHandle: 'all',
  relatedPageSlugs: [
    'aa-coins',
    'aa-sobriety-coins',
    'aa-sobriety-tokens',
    'narcotics-anonymous-coins',
    'custom-aa-coins',
  ],
  sections: [
    {
      type: 'text',
      heading: 'What Are Alcoholics Anonymous Sobriety Coins?',
      body: "[Draft ~150 words. Formal opening for a research-intent query. Define Alcoholics Anonymous sobriety coins, note they are the milestone markers AA has used since the 1940s. Use exact phrase 2-3 times. Set up the distinctive angle — the historical deep-dive.]",
    },
    {
      type: 'text',
      heading: 'The History of Alcoholics Anonymous Sobriety Coins',
      // DISTINCTIVE ANGLE: deep historical dive into AA's founding.
      body: "[Draft ~400 words. Longer than other pages — this is a research-intent query that deserves depth. Cover: Bill W. (William Griffith Wilson, New York stockbroker) and Dr. Bob (Dr. Robert Holbrook Smith, Akron physician) meeting in May 1935. The founding of AA. The publication of the Big Book in 1939. Clarence Snyder's Cleveland group breaking off and introducing the first sobriety coins / poker chips in the early 1940s. The spread of the chip tradition through AA in the 1940s-50s. The evolution from stamped poker chips to cast-metal commemorative coins. Note that AA itself has no official position on the chip tradition — it's a local-group custom that became universal.]",
    },
    {
      type: 'text',
      heading: 'Carrying the Tradition Forward',
      body: "[Draft ~250 words. Connect the historical tradition to today's practice. What the chip represents to someone in early recovery now. Why premium handcrafted coins honor the tradition better than mass-produced ones. Use exact phrase once more.]",
    },
  ],
  faq: [
    {
      question: 'When did Alcoholics Anonymous start giving out sobriety coins?',
      answer:
        "Alcoholics Anonymous sobriety coins trace back to Clarence Snyder's Cleveland AA group in the early 1940s, just a few years after AA itself was founded in 1935. Snyder's group started handing out poker chips at meetings to mark clean-time milestones. The practice spread to other AA groups throughout the 1940s and became a universal tradition by the 1950s.",
    },
    {
      question: 'Who founded Alcoholics Anonymous?',
      answer:
        "Alcoholics Anonymous was co-founded in Akron, Ohio in May 1935 by Bill Wilson (known as 'Bill W.') and Dr. Robert Smith (known as 'Dr. Bob'). Bill W. was a New York stockbroker in early recovery; Dr. Bob was an Akron physician. Their meeting and partnership established the Twelve Step model that became AA's foundation.",
    },
    {
      question: 'Are Alcoholics Anonymous sobriety coins official AA merchandise?',
      answer:
        "No. AA General Service has no official position on sobriety coins — the chip tradition is a local-group custom, not an AA-sanctioned practice. Every AA meeting is free to handle milestone celebrations however they choose. Premium handcrafted coins are made by independent manufacturers and are not affiliated with AA General Service.",
    },
    {
      question: 'What does the triangle and circle on AA coins mean?',
      answer:
        "The circle-and-triangle is the traditional AA symbol. The circle represents 'the World of AA,' and the three sides of the triangle represent AA's Three Legacies: Unity, Recovery, and Service. The symbol originated in the 1950s and appears on most traditional Alcoholics Anonymous sobriety coins.",
    },
  ],
  schema: ['breadcrumb', 'faq', 'webPage'],
});
```

- [ ] **Step 2: Append `/narcotics-anonymous-coins` — angle: NA founding history**

```ts
registerSEOPage({
  slug: 'narcotics-anonymous-coins',
  type: 'commercial',
  template: 'generic-seo',
  title: 'Narcotics Anonymous Coins',
  metaTitle: 'Narcotics Anonymous Coins — NA Medallions & Key Tags | Coinplugz',
  metaDescription:
    "Shop premium Narcotics Anonymous coins and medallions. The NA tradition since 1953, the key-tag system, and handcrafted recovery coins for every clean-time milestone.",
  canonicalPath: 'narcotics-anonymous-coins',
  eyebrow: 'Since 1953',
  heroDescription:
    "Narcotics Anonymous coins mark the milestones of clean time in NA. Founded in 1953 as an adaptation of AA for drug addiction, NA developed its own traditions — including its key-tag system and moonglow medallions.",
  primaryCTA: {
    label: 'Shop Narcotics Anonymous Coins',
    href: '/collections/all',
  },
  featuredCollectionHandle: 'all',
  relatedPageSlugs: [
    'na-coins',
    'na-sobriety-coins',
    'na-sober-chips',
    'alcoholics-anonymous-sobriety-coins',
    'custom-na-coins',
  ],
  sections: [
    {
      type: 'text',
      heading: 'What Are Narcotics Anonymous Coins?',
      body: "[Draft ~150 words. Define Narcotics Anonymous coins. Note the key-tag + medallion system. Use exact phrase 2-3 times. Set up the history angle.]",
    },
    {
      type: 'text',
      heading: 'The History of Narcotics Anonymous and Its Coin Tradition',
      // DISTINCTIVE ANGLE: NA founding history, parallel to the AA page.
      body: "[Draft ~400 words. NA's 1953 founding in Los Angeles by Jimmy Kinnon, Dr. Harry Smith, and others. NA adapted AA's Twelve Steps by replacing 'alcohol' with 'drugs' — a small textual change with major implications for who could find recovery in NA. NA's early growth in the 1960s-70s. The key-tag system's introduction. The 1982 publication of NA's Basic Text. The global spread. End with how the coin/medallion tradition reflects NA's specific identity — the emphasis on 'complete abstinence from all drugs' rather than AA's focus on alcohol alone. Do NOT repeat the AA history from /alcoholics-anonymous-sobriety-coins.]",
    },
    {
      type: 'text',
      heading: 'Premium Coins for Narcotics Anonymous Milestones',
      body: "[Draft ~250 words. Connect the NA tradition to premium handcrafted coins today. The Service Symbol (square with four points inside a circle). Custom designs for NA milestones. Use exact phrase once more.]",
    },
  ],
  faq: [
    {
      question: 'When was Narcotics Anonymous founded?',
      answer:
        "Narcotics Anonymous was founded in Los Angeles in 1953, primarily by Jimmy Kinnon and a small group of co-founders. NA was created as an adaptation of AA's Twelve Step program for people recovering from drug addiction. Its growth was slow through the 1960s but accelerated in the 1970s, and NA is now active in over 140 countries.",
    },
    {
      question: "What's the Narcotics Anonymous service symbol?",
      answer:
        "The NA Service Symbol is a square with four points inside a circle. The four points represent self, society, service, and God (or higher power). The symbol appears on many Narcotics Anonymous coins and medallions, especially the annual medallions given for 1+ year milestones.",
    },
    {
      question: 'How are Narcotics Anonymous coins different from AA coins?',
      answer:
        "NA uses plastic key tags for shorter clean-time milestones (30d through 9mo) and metal medallions only for 1-year and longer anniversaries. AA uses metal chips for every milestone from 24 hours forward. NA's color sequence and symbols are also distinct, and the 1-year NA medallion is traditionally moonglow (pearlescent white) rather than AA's bronze.",
    },
    {
      question: 'Can I get a custom Narcotics Anonymous coin made?',
      answer:
        "Yes. Our custom token flow lets you design an NA-specific medallion with the Service Symbol, your clean date, personal engraving, or home-group imagery. Custom NA coins are a popular gift from sponsors and a common choice for people marking a major clean-time anniversary.",
    },
  ],
  schema: ['breadcrumb', 'faq', 'webPage'],
});
```

- [ ] **Step 3: Append `/sobriety-medallion` — angle: product-forward, singular-query shopping intent**

```ts
registerSEOPage({
  slug: 'sobriety-medallion',
  type: 'commercial',
  template: 'generic-seo',
  title: 'Sobriety Medallion',
  metaTitle: 'Sobriety Medallion — Premium Handcrafted Recovery Medallions | Coinplugz',
  metaDescription:
    'Shop a premium sobriety medallion for your milestone. Bronze, silver, and gold medallions with engraving options. Design your own or choose from handcrafted collections.',
  canonicalPath: 'sobriety-medallion',
  eyebrow: 'Premium Collection',
  heroDescription:
    "A sobriety medallion is the physical marker you carry for a milestone that matters. Shop handcrafted medallions in bronze, silver, and gold — or design your own.",
  primaryCTA: {label: 'Shop Sobriety Medallions', href: '/collections/all'},
  featuredCollectionHandle: 'all',
  relatedPageSlugs: [
    'recovery-medallions',
    'gold-silver-medallions',
    'bronze-sobriety-coins',
    'custom-sobriety-medallion',
    'milestone-tokens',
  ],
  sections: [
    {
      type: 'text',
      heading: 'What Is a Sobriety Medallion?',
      body: "[Draft ~150 words. Singular query = specific shopper. Define sobriety medallion as a metal milestone marker, typically larger and heavier than a meeting chip. Use exact phrase 2-3 times. Set up the angle — material choices.]",
    },
    {
      type: 'text',
      heading: 'Choosing a Material: Bronze, Silver, or Gold',
      // DISTINCTIVE ANGLE: material-focused product guide.
      body: "[Draft ~300 words. Deep material comparison. Bronze: traditional, develops a warm patina, most durable for daily carry, most affordable. Silver: cleaner appearance, formal, heavier feel per-volume, develops a gray patina slowly. Gold: reserved for major milestones (typically 10+ years), heirloom-quality, most premium price point. Note which milestones traditionally get which material. Practical considerations: daily-carry durability, display vs. pocket carry, gifting context. This is the most product-forward page in the Tier A set.]",
    },
    {
      type: 'text',
      heading: 'Engraving and Customization Options',
      body: "[Draft ~200 words. Engraving options for a sobriety medallion — name, date, phrase, Roman numerals, sponsor's initials. Front and back engraving. Note that custom medallions are available through the custom token flow. Use exact phrase once more.]",
    },
  ],
  faq: [
    {
      question: 'What is a sobriety medallion?',
      answer:
        "A sobriety medallion is a metal coin — typically bronze, silver, or gold — given or bought to mark a recovery milestone. Medallions are generally heavier and more substantial than the plastic or aluminum chips handed out at meetings. The word 'medallion' usually implies a premium, commemorative quality.",
    },
    {
      question: "What's the difference between a sobriety medallion and a sobriety chip?",
      answer:
        "A 'chip' is usually a smaller, lighter token — often stamped plastic or aluminum — handed out at meetings to mark milestones from 24 hours onward. A 'medallion' is a heavier, higher-quality metal coin, often used for annual anniversaries and major milestones. The distinction is informal, and some groups use the words interchangeably.",
    },
    {
      question: 'What material should I choose for a sobriety medallion?',
      answer:
        "Bronze is the most traditional and most durable for daily carry, with a warm patina that develops over time. Silver is cleaner and more formal, often chosen for gift contexts. Gold is reserved for major milestones — typically 10+ year anniversaries — and functions as an heirloom piece. For a daily-carry medallion, bronze is the most forgiving.",
    },
    {
      question: 'Can I get a sobriety medallion engraved?',
      answer:
        "Yes. Deep engraving with names, dates, or phrases is a standard option on premium sobriety medallions. Engraving can be added to the front, back, or both. Our custom token flow lets you preview the engraving before committing to production.",
    },
  ],
  schema: ['breadcrumb', 'faq', 'webPage'],
});
```

- [ ] **Step 4: Append `/recovery-chips` — angle: umbrella / cross-program comparison**

```ts
registerSEOPage({
  slug: 'recovery-chips',
  type: 'commercial',
  template: 'generic-seo',
  title: 'Recovery Chips',
  metaTitle: 'Recovery Chips — AA, NA, and Beyond | Coinplugz',
  metaDescription:
    "Recovery chips span AA, NA, Celebrate Recovery, and SMART Recovery. Compare traditions, find premium handcrafted chips for every program, or design your own.",
  canonicalPath: 'recovery-chips',
  eyebrow: 'Every Tradition',
  heroDescription:
    "Recovery chips are the umbrella term for the milestone markers used across recovery programs — AA chips, NA key tags, Celebrate Recovery coins, and more. One word, many traditions.",
  primaryCTA: {label: 'Shop Recovery Chips', href: '/collections/all'},
  featuredCollectionHandle: 'all',
  relatedPageSlugs: [
    'aa-coins',
    'na-coins',
    'celebrate-recovery-coins',
    'sobriety-coins',
    'milestone-tokens',
  ],
  sections: [
    {
      type: 'text',
      heading: 'What Are Recovery Chips?',
      body: "[Draft ~150 words. Umbrella definition. Recovery chips = the generic term for milestone markers across all 12-step and recovery programs. Use exact phrase 2-3 times. Set up the comparison angle.]",
    },
    {
      type: 'text',
      heading: 'Recovery Chips Across Programs',
      // DISTINCTIVE ANGLE: comparison hub page linking to program-specific pages.
      body: "[Draft ~350 words. Survey the chip traditions across programs.\n\nAA chips: metal (traditionally), every milestone from 24 hours onward, uses a color system (white/gold/red/green/blue/purple/bronze). Originated in 1940s Cleveland. Internal link: /aa-coins.\n\nNA key tags and medallions: plastic for early clean time (through 9 months), metal medallions for annual anniversaries starting at 1 year (moonglow). Different color system. Internal link: /na-coins.\n\nCelebrate Recovery coins: CR uses a 'Recovery Chip' with its own distinct design and color system. Grounded in Christian scripture rather than AA's non-denominational higher-power language. Internal link: /celebrate-recovery-coins.\n\nSMART Recovery: SMART does not formalize chips, preferring non-religious milestone recognition without physical tokens. Mention that premium handcrafted tokens are still meaningful to SMART members who want them.\n\nOther programs: Al-Anon has its own tradition. Refuge Recovery (Buddhist-inspired) is more informal. Celebrate Recovery for youth has its own adaptations.\n\nThis section is the hub that links out to program-specific pages on the site.]",
    },
    {
      type: 'text',
      heading: 'Premium Recovery Chips for Any Program',
      body: "[Draft ~150 words. Our collection and custom tokens work across every recovery tradition. Use exact phrase once more.]",
    },
  ],
  faq: [
    {
      question: 'Are AA chips and NA chips the same thing?',
      answer:
        "No. AA chips are metal (traditionally) and cover every milestone from 24 hours onward using a color system of white, gold, red, green, blue, purple, and bronze. NA uses plastic key tags for shorter clean-time milestones and metal medallions only for annual anniversaries. The two programs have different color conventions and different symbolic systems.",
    },
    {
      question: 'What is the most common recovery chip?',
      answer:
        "The 24-hour chip (the 'desire chip' in AA, the 'welcome tag' in NA) is the most universally recognized recovery chip. It's offered to anyone who wants to try sobriety for the next 24 hours — no questions, no commitment beyond that day. The 24-hour chip is usually white and is the first step in every milestone tradition.",
    },
    {
      question: 'Do all recovery programs use chips?',
      answer:
        "Most major 12-step programs have a chip or token tradition — AA, NA, Celebrate Recovery, Gamblers Anonymous, Overeaters Anonymous, and more. SMART Recovery is a notable exception: it doesn't formalize physical milestone markers, though individual members sometimes buy premium tokens on their own.",
    },
    {
      question: 'Can I use one program\'s recovery chips if I\'m in a different program?',
      answer:
        "Yes. Recovery chips are personal keepsakes, not membership credentials. Many people in cross-program recovery or mixed communities choose chips from whichever tradition resonates most. A premium handcrafted chip is meaningful regardless of which program it came from.",
    },
  ],
  schema: ['breadcrumb', 'faq', 'webPage'],
});
```

- [ ] **Step 5: Draft all prose and remove bracketed placeholders**

Follow the same process as Task 8 Step 6. Do not ship with `[Draft ...]` blocks in the body.

- [ ] **Step 6: Run typecheck**

```bash
npm run typecheck
```

Expected: PASS.

- [ ] **Step 7: Dev server spot-check**

```bash
npm run dev
```

Visit each of the 4 new pages:
- `http://localhost:3000/alcoholics-anonymous-sobriety-coins`
- `http://localhost:3000/narcotics-anonymous-coins`
- `http://localhost:3000/sobriety-medallion`
- `http://localhost:3000/recovery-chips`

Stop the dev server (Ctrl+C).

- [ ] **Step 8: Commit**

```bash
git add app/data/seo-pages.ts
git commit -m "feat(seo): register Tier A batch 2 — 4 long-form and umbrella pages"
```

---

## Task 10: Register Tier B batch — 4 remaining custom-intent pages

**Files:**
- Modify: `app/data/seo-pages.ts` (append 4 new `registerSEOPage()` calls)

**Context:** Four Tier B pages. Each points at `/custom-token` and each leans into a different angle of the custom flow. Use the `/custom-recovery-token` pilot (Task 7) as the voice reference.

- [ ] **Step 1: Append `/custom-aa-coins` — angle: AA-specific custom inspiration**

```ts
registerSEOPage({
  slug: 'custom-aa-coins',
  type: 'commercial',
  template: 'custom-intent',
  title: 'Custom AA Coins',
  metaTitle: 'Custom AA Coins — Design Your Own Alcoholics Anonymous Chip | Coinplugz',
  metaDescription:
    'Design a custom AA coin with your home group, sponsor name, anniversary date, or Serenity Prayer engraving. Two ways to create a one-of-a-kind AA coin that honors your story.',
  canonicalPath: 'custom-aa-coins',
  eyebrow: 'Design Your Own AA Coin',
  heroDescription:
    "A custom AA coin turns the traditions that kept you sober — your home group, your sponsor, your milestones — into something you can hold. Design yours in minutes.",
  primaryCTA: {label: 'Start Designing', href: '/custom-token'},
  featuredCollectionHandle: 'all',
  relatedPageSlugs: [
    'custom-recovery-token',
    'aa-sobriety-coins',
    'aa-sobriety-tokens',
    'aa-coins',
    'custom-sobriety-coins',
  ],
  sections: [
    {
      type: 'text',
      heading: 'Ideas for a Custom AA Coin',
      body: "[Draft ~300 words. AA-specific custom inspiration. Home group name and location. Sponsor's initials and sobriety date. Meeting-room imagery (specific location, meeting name). The Serenity Prayer (short form) engraved on the reverse. The circle-and-triangle AA symbol. Key phrases from the Big Book — 'One day at a time,' 'Keep coming back,' 'Easy does it,' 'Let go and let God.' Anniversary date in Roman numerals or standard format. Sponsor-to-sponsee gift framing — a sponsor commissioning a coin to give at a milestone. Do NOT reuse prose from /custom-recovery-token.]",
    },
    {
      type: 'text',
      heading: 'Two Paths to a Custom AA Coin',
      body: "[Draft ~250 words. We-design vs. you-design paths, framed specifically for AA members. The we-design path: describe your home group, your sponsor, your milestone, the phrase that matters most — we'll translate it into a design. The you-design path: pick the AA symbol placement, the engraving font, the material, the layout. Close with a sentence pointing at the custom flow.]",
    },
    {
      type: 'text',
      heading: 'Custom Coins as Sponsor Gifts',
      body: "[Draft ~200 words. Custom AA coins as a traditional sponsor-to-sponsee gift at a major milestone. The personal touch that a stock design can't reach. Use exact phrase once more.]",
    },
  ],
  faq: [
    {
      question: 'Can I put my home group name on a custom AA coin?',
      answer:
        "Yes. Home group names, meeting locations, and meeting times are among the most popular engraving choices for custom AA coins. You can add them to the front, back, or around the edge of the coin. The custom flow lets you preview the placement before committing.",
    },
    {
      question: 'Can a custom AA coin include the Serenity Prayer?',
      answer:
        "Yes. The short-form Serenity Prayer is one of the most-requested engravings on custom AA coins. The full prayer can also fit on larger medallions. You can combine the Serenity Prayer with a sobriety date, a name, and the AA circle-and-triangle symbol on a single coin.",
    },
    {
      question: 'Is a custom AA coin appropriate as a sponsor gift?',
      answer:
        "Yes — custom AA coins are one of the most traditional and meaningful gifts a sponsor can give a sponsee. A custom coin lets the sponsor put the sponsee's name, their sobriety date, and a personal message on something they'll carry for the rest of their life. It's the kind of gift that gets remembered.",
    },
    {
      question: "How do I design a custom AA coin if I'm not a designer?",
      answer:
        "Choose the 'We Design It For You' path in the custom flow. You describe what you want — the occasion, the group, the phrase, the symbolism — and our designers turn it into a finished proof. You review the proof, request changes if needed, and approve before we produce it. No design skills required.",
    },
  ],
  schema: ['breadcrumb', 'faq', 'webPage'],
});
```

- [ ] **Step 2: Append `/custom-na-coins` — angle: NA-specific custom inspiration**

```ts
registerSEOPage({
  slug: 'custom-na-coins',
  type: 'commercial',
  template: 'custom-intent',
  title: 'Custom NA Coins',
  metaTitle: 'Custom NA Coins — Design Your Own Narcotics Anonymous Medallion | Coinplugz',
  metaDescription:
    "Design a custom NA coin with the Service Symbol, 'Just for Today,' your clean date, or your home group. Build a one-of-a-kind Narcotics Anonymous medallion.",
  canonicalPath: 'custom-na-coins',
  eyebrow: 'Design Your Own NA Coin',
  heroDescription:
    "A custom NA coin puts the traditions of Narcotics Anonymous — the Service Symbol, 'Just for Today,' your clean date, your home group — on a token made for you alone.",
  primaryCTA: {label: 'Start Designing', href: '/custom-token'},
  featuredCollectionHandle: 'all',
  relatedPageSlugs: [
    'custom-recovery-token',
    'na-sobriety-coins',
    'na-sober-chips',
    'na-coins',
    'narcotics-anonymous-coins',
  ],
  sections: [
    {
      type: 'text',
      heading: 'Ideas for a Custom NA Coin',
      // NA-specific inspiration. Do NOT reuse prose from /custom-aa-coins.
      body: "[Draft ~300 words. NA-specific custom ideas. The NA Service Symbol (square with four points inside a circle). 'Just for Today' — the core NA daily phrase. Clean date in standard or Roman numeral format. Home group name and city. NA slogans: 'Live and Let Live,' 'One day at a time,' 'Keep coming back.' Moonglow color on a 1-year custom medallion. The NA basic text reference. Note that NA custom coins are common as home-group commemorative gifts and as sponsor-to-sponsee 1-year gifts.]",
    },
    {
      type: 'text',
      heading: 'Two Paths to a Custom NA Medallion',
      body: "[Draft ~250 words. We-design vs. you-design paths, framed for NA members. Parallel to the /custom-aa-coins page but distinct prose.]",
    },
    {
      type: 'text',
      heading: 'Custom Medallions for Major NA Milestones',
      body: "[Draft ~200 words. Why custom medallions work especially well for NA annual milestones — the step up from plastic key tags to a first metal medallion is already a major transition, and a custom design makes it permanent. Use exact phrase once more.]",
    },
  ],
  faq: [
    {
      question: 'Can I put the NA Service Symbol on a custom coin?',
      answer:
        "Yes. The NA Service Symbol — a square with four points inside a circle — is a popular element on custom NA coins. It can appear on the front or back, at any size, and can be combined with your clean date, your home group, or 'Just for Today.'",
    },
    {
      question: "Can a custom NA coin say 'Just for Today'?",
      answer:
        "Yes. 'Just for Today' is one of the most-requested engravings on custom NA coins. It can appear as the main front-side text or as a subtle reverse-side engraving. Some members combine it with their clean date and home group for a complete personal coin.",
    },
    {
      question: "What's the difference between a custom NA coin and a standard NA medallion?",
      answer:
        "A standard NA medallion comes in preset designs with fixed imagery and limited engraving options (usually just the clean-time number). A custom NA coin is designed from scratch to your specifications — your choice of imagery, layout, engraving, material, and finish. Custom coins are one-of-a-kind; standard medallions are mass-produced.",
    },
    {
      question: 'Can I give a custom NA coin as a 1-year anniversary gift?',
      answer:
        "Yes — it's one of the most meaningful gift choices for an NA 1-year anniversary. The 1-year moment in NA is already significant because it marks the transition from plastic key tags to metal medallions. A custom medallion with the person's clean date, home group, and a personal message turns that transition into something they'll carry forever.",
    },
  ],
  schema: ['breadcrumb', 'faq', 'webPage'],
});
```

- [ ] **Step 3: Append `/custom-sobriety-medallion` — angle: material and engraving depth**

```ts
registerSEOPage({
  slug: 'custom-sobriety-medallion',
  type: 'commercial',
  template: 'custom-intent',
  title: 'Custom Sobriety Medallion',
  metaTitle: 'Custom Sobriety Medallion — Bronze, Silver, Gold | Coinplugz',
  metaDescription:
    'Design a custom sobriety medallion in bronze, silver, or gold. Deep engraving, custom imagery, and a premium finish for the milestones that matter most.',
  canonicalPath: 'custom-sobriety-medallion',
  eyebrow: 'Premium Custom',
  heroDescription:
    "A custom sobriety medallion is the most premium way to mark a major milestone — your material, your engraving, your design, your story. Built to last as a heirloom.",
  primaryCTA: {label: 'Start Designing', href: '/custom-token'},
  featuredCollectionHandle: 'all',
  relatedPageSlugs: [
    'custom-recovery-token',
    'sobriety-medallion',
    'gold-silver-medallions',
    'bronze-sobriety-coins',
    'custom-sobriety-coins',
  ],
  sections: [
    {
      type: 'text',
      heading: 'What Makes a Custom Sobriety Medallion Different',
      // Angle: material and heirloom quality.
      body: "[Draft ~300 words. Custom medallions vs custom coins — the key difference is size, weight, and intended use. Medallions are larger and heavier, typically for display or annual-milestone carry rather than daily pocket use. The custom medallion route is usually chosen for major milestones (5, 10, 20, 25+ years) where the person wants something heirloom-quality. Material choices carry more weight at this tier: bronze for traditional warmth, silver for formal presentation, gold for the most significant milestones. Engraving depth matters more at medallion scale — deeper engraving holds up to decades of handling. Do NOT reuse prose from /custom-recovery-token or /sobriety-medallion.]",
    },
    {
      type: 'text',
      heading: 'Choosing Material for Your Custom Medallion',
      body: "[Draft ~250 words. Material decision guide for custom medallions specifically. Bronze: warm patina over time, most affordable, best for daily handling. Silver: clean formal look, best for display, develops gray patina slowly. Gold: heirloom-grade, reserved for 10+ year milestones, premium pricing. Note that material affects engraving appearance — silver holds sharp engraving best, gold holds it deepest, bronze develops the most character over time.]",
    },
    {
      type: 'text',
      heading: 'Engraving Options for Heirloom Medallions',
      body: "[Draft ~200 words. Deep engraving options for custom medallions. Front, back, and edge engraving. Font choices. Image reproduction capabilities (photos, logos, handwriting digitization). Use exact phrase once more.]",
    },
  ],
  faq: [
    {
      question: "What's the difference between a custom sobriety coin and a custom medallion?",
      answer:
        "Size, weight, and intended use. A custom sobriety coin is pocket-sized and designed for daily carry. A custom sobriety medallion is larger, heavier, and typically intended for display or annual-milestone carry. Medallions are usually chosen for major anniversaries where the person wants a heirloom-quality piece rather than a daily-carry token.",
    },
    {
      question: 'What material is best for a custom sobriety medallion?',
      answer:
        "For major milestones and heirloom pieces, silver and gold are the most premium choices. Gold is traditionally reserved for 10+ year anniversaries. Silver works for milestones at any level and holds sharp engraving beautifully. Bronze is the traditional and most affordable choice and develops a warm patina over decades of handling.",
    },
    {
      question: 'Can I include a photo or logo on a custom sobriety medallion?',
      answer:
        "Yes. Custom medallions can include photo reproduction, logo recreation, and even digitized handwriting. The larger medallion size gives designers more room to work with than a standard coin, so image detail can be significantly higher.",
    },
    {
      question: 'How long does a custom sobriety medallion take to produce?',
      answer:
        "Design proofs typically come back within 2-3 business days. Once you approve the design, medallion production takes 7-14 days depending on material (gold takes longer than bronze). Total time from order to delivery is usually 3-4 weeks.",
    },
  ],
  schema: ['breadcrumb', 'faq', 'webPage'],
});
```

- [ ] **Step 4: Append `/personalized-recovery-tokens` — angle: engraving on stock designs (lighter entry point)**

```ts
registerSEOPage({
  slug: 'personalized-recovery-tokens',
  type: 'commercial',
  template: 'custom-intent',
  title: 'Personalized Recovery Tokens',
  metaTitle: 'Personalized Recovery Tokens — Engraved Sobriety Coins | Coinplugz',
  metaDescription:
    "Personalize a recovery token with your name, date, or short message. Simpler and faster than fully custom design — all the meaning, less of the process.",
  canonicalPath: 'personalized-recovery-tokens',
  eyebrow: 'Add Your Own Touch',
  heroDescription:
    "Personalized recovery tokens are stock designs with your name, date, or message engraved on them. Simpler than a custom design, still distinctly yours.",
  primaryCTA: {label: 'Start Personalizing', href: '/custom-token'},
  featuredCollectionHandle: 'all',
  relatedPageSlugs: [
    'custom-recovery-token',
    'custom-sobriety-coins',
    'recovery-tokens',
    'milestone-tokens',
    'sobriety-coins',
  ],
  sections: [
    {
      type: 'text',
      heading: 'Personalized vs. Fully Custom',
      // Distinctive angle: distinguish personalized from fully custom.
      body: "[Draft ~300 words. Personalized means adding your name, date, or short message to an existing stock design. Fully custom means designing the token from scratch — imagery, layout, and all. Personalization is the lighter entry point: faster turnaround (usually 7-10 days vs. 2-3 weeks for custom), lower cost, less decision-making required. Fully custom is for people who want something genuinely one-of-a-kind. Both paths are meaningful — the question is how much of the design you want to control. Personalized recovery tokens work best for someone who likes an existing stock design and just wants to add a name and date. Use exact phrase 2-3 times. Do NOT reuse prose from /custom-recovery-token.]",
    },
    {
      type: 'text',
      heading: 'What You Can Personalize',
      body: "[Draft ~250 words. Specific personalization options: name, sobriety/clean date, short phrase (up to ~20 characters), Roman numeral milestone count. Front or back engraving. Font choice among 2-3 options. The customer chooses a stock design from the catalog, then specifies what to engrave on it. This is the 'middle path' between buying stock and commissioning full custom.]",
    },
    {
      type: 'text',
      heading: 'When to Personalize vs. Go Fully Custom',
      body: "[Draft ~200 words. Decision guide. Personalize when you like a stock design and just want to add your own details — faster, cheaper, still meaningful. Go fully custom when the stock catalog doesn't capture what you want to say, or when you're marking a milestone that deserves a one-of-a-kind token. Use exact phrase once more.]",
    },
  ],
  faq: [
    {
      question: "What's the difference between personalized and custom recovery tokens?",
      answer:
        "Personalized tokens are stock designs with your name, date, or message engraved on them. Custom tokens are designed from scratch — you control every element including imagery, layout, material, and engraving. Personalization is faster and more affordable; custom is slower, more expensive, and genuinely one-of-a-kind.",
    },
    {
      question: 'How long does personalization take?',
      answer:
        "Personalized recovery tokens typically ship within 7-10 days of order, compared to 2-3 weeks for a fully custom design. The shorter timeline is because the underlying design is already approved — only the engraving is new.",
    },
    {
      question: 'What can I add to a personalized recovery token?',
      answer:
        "A personalized recovery token can include your name, your sobriety or clean date, a short phrase (up to about 20 characters), your milestone count in Roman numerals, or a sponsor's initials. Engraving can go on the front, back, or both. The engraving sits alongside the stock design's existing imagery.",
    },
    {
      question: 'Can I change the material on a personalized token?',
      answer:
        "Yes. Most stock designs are offered in bronze, silver, and gold. You choose the material when you start the personalization flow. Note that changing material doesn't change the design — it still uses the same stock imagery. Only the engraving is unique to you.",
    },
  ],
  schema: ['breadcrumb', 'faq', 'webPage'],
});
```

- [ ] **Step 5: Draft all prose and remove bracketed placeholders**

Same process as prior tasks. No `[Draft ...]` blocks in committed code.

- [ ] **Step 6: Run typecheck**

```bash
npm run typecheck
```

Expected: PASS.

- [ ] **Step 7: Dev server spot-check all 4 new Tier B pages**

```bash
npm run dev
```

Visit:
- `http://localhost:3000/custom-aa-coins`
- `http://localhost:3000/custom-na-coins`
- `http://localhost:3000/custom-sobriety-medallion`
- `http://localhost:3000/personalized-recovery-tokens`

For each: verify hero CTA is "Start Designing" → `/custom-token` (single primary, no secondary), CustomTokenFeatureBlock is directly below hero (not mid-page — this is Tier B layout), product grid is labeled "Or shop ready-made," FAQ loads, related pages include at least one sibling Tier B + at least one existing page.

Stop the dev server (Ctrl+C).

- [ ] **Step 8: Commit**

```bash
git add app/data/seo-pages.ts
git commit -m "feat(seo): register Tier B batch — 4 custom-intent phrase-match pages"
```

---

## Task 11: Cross-linking pass — populate `relatedPageSlugs`

**Files:**
- Modify: `app/data/seo-pages.ts` (update `relatedPageSlugs` arrays on all 15 new pages and optionally 2-3 existing pages)

**Context:** All 15 new pages have been registered with initial `relatedPageSlugs` that reference other pages. This task audits those arrays to ensure the linking rules from spec §6.3 are met:
- 1-2 existing commercial pages
- 2-3 sibling new pages
- At least 1 Tier B page

The initial registrations already include reasonable slugs. This task is a systematic audit to make sure the linking graph is dense and symmetric.

- [ ] **Step 1: Audit each new page's relatedPageSlugs**

For each of the 15 new pages, open `app/data/seo-pages.ts` and locate the `relatedPageSlugs` array. Verify against this matrix:

| Slug | Existing commercial link(s) | New sibling(s) | Tier B link |
|---|---|---|---|
| `milestone-tokens` | `recovery-tokens`, `sobriety-coins` | `1-year-sobriety-coin` | `custom-recovery-token` ✓ |
| `aa-sobriety-coins` | `aa-coins`, `sobriety-coins` | `aa-sobriety-tokens`, `aa-sober-chips` | `custom-aa-coins` ✓ |
| `aa-sobriety-tokens` | `aa-coins` | `aa-sobriety-coins`, `aa-sober-chips`, `alcoholics-anonymous-sobriety-coins` | `custom-aa-coins` ✓ |
| `aa-sober-chips` | `aa-coins`, `24-hour-chip` | `aa-sobriety-coins`, `aa-sobriety-tokens` | `custom-aa-coins` ✓ |
| `na-sobriety-coins` | `na-coins` | `na-sober-chips`, `narcotics-anonymous-coins`, `aa-sobriety-coins` | `custom-na-coins` ✓ |
| `na-sober-chips` | `na-coins` | `na-sobriety-coins`, `narcotics-anonymous-coins`, `aa-sober-chips` | `custom-na-coins` ✓ |
| `alcoholics-anonymous-sobriety-coins` | `aa-coins` | `aa-sobriety-coins`, `aa-sobriety-tokens`, `narcotics-anonymous-coins` | `custom-aa-coins` ✓ |
| `narcotics-anonymous-coins` | `na-coins` | `na-sobriety-coins`, `na-sober-chips`, `alcoholics-anonymous-sobriety-coins` | `custom-na-coins` ✓ |
| `sobriety-medallion` | `recovery-medallions`, `gold-silver-medallions`, `bronze-sobriety-coins` | `milestone-tokens` | `custom-sobriety-medallion` ✓ |
| `recovery-chips` | `aa-coins`, `na-coins`, `celebrate-recovery-coins`, `sobriety-coins` | `milestone-tokens` | (add `custom-recovery-token`) |
| `custom-recovery-token` | `recovery-tokens`, `custom-sobriety-coins` | `milestone-tokens`, `personalized-recovery-tokens` | (Tier B itself) |
| `custom-aa-coins` | `aa-coins`, `custom-sobriety-coins` | `aa-sobriety-coins`, `aa-sobriety-tokens`, `custom-recovery-token` | (Tier B itself) |
| `custom-na-coins` | `na-coins`, `narcotics-anonymous-coins` | `na-sobriety-coins`, `na-sober-chips`, `custom-recovery-token` | (Tier B itself) |
| `custom-sobriety-medallion` | `sobriety-medallion`, `gold-silver-medallions`, `bronze-sobriety-coins`, `custom-sobriety-coins` | `custom-recovery-token` | (Tier B itself) |
| `personalized-recovery-tokens` | `recovery-tokens`, `sobriety-coins`, `custom-sobriety-coins` | `milestone-tokens`, `custom-recovery-token` | (Tier B itself) |

- [ ] **Step 2: Apply any missing links**

Update `relatedPageSlugs` arrays that don't meet the matrix. Specifically:

- `/recovery-chips` is missing an explicit Tier B link. Add `custom-recovery-token` to its array:

```ts
// Before
relatedPageSlugs: [
  'aa-coins',
  'na-coins',
  'celebrate-recovery-coins',
  'sobriety-coins',
  'milestone-tokens',
],

// After
relatedPageSlugs: [
  'aa-coins',
  'na-coins',
  'celebrate-recovery-coins',
  'sobriety-coins',
  'custom-recovery-token',
],
```

Apply similar targeted updates to any other row where the matrix shows a gap.

- [ ] **Step 3: Run typecheck**

```bash
npm run typecheck
```

Expected: PASS. All referenced slugs exist (we registered them in Tasks 5-10).

- [ ] **Step 4: Dev server spot-check related-pages sections**

```bash
npm run dev
```

On each new page, scroll to the "Related Pages" section and verify the rendered cards link to real existing pages. Spot-check 3 pages:

- `http://localhost:3000/aa-sobriety-coins` → should show cards linking to `/aa-coins`, `/aa-sobriety-tokens`, `/aa-sober-chips`, `/sobriety-coins`, `/custom-aa-coins`
- `http://localhost:3000/recovery-chips` → should show `/aa-coins`, `/na-coins`, `/celebrate-recovery-coins`, `/sobriety-coins`, `/custom-recovery-token`
- `http://localhost:3000/custom-recovery-token` → should show `/recovery-tokens`, `/custom-sobriety-coins`, `/milestone-tokens`, `/personalized-recovery-tokens`

All related-page links should resolve to real 200-OK pages.

Stop the dev server (Ctrl+C).

- [ ] **Step 5: Commit**

```bash
git add app/data/seo-pages.ts
git commit -m "feat(seo): finalize cross-linking across phrase-match expansion pages"
```

---

## Task 12: Navigation surfacing — add new pages to footer

**Files:**
- Modify: the footer component that renders site-wide navigation links (location to be discovered in Step 1)

**Context:** Sitemap inclusion is automatic, but for meaningful internal link equity and human discoverability, a curated set of the new pages should appear in the site footer. Focus on the 5 Tier B custom-intent pages plus 3-5 high-value Tier A pages.

- [ ] **Step 1: Locate the footer component**

```bash
grep -rn "footer" app/components/layout/ 2>/dev/null | head -20
```

Or search for the footer render in `app/root.tsx`:

```bash
grep -n "Footer" app/root.tsx
```

Identify the file that renders the site footer's navigation sections (likely `app/components/layout/Footer.tsx` or similar).

- [ ] **Step 2: Read the footer to understand the existing structure**

Read the identified footer file. Note how existing navigation sections are grouped (e.g., "Shop", "Resources", "About", etc.) and how links are formatted (likely `<Link to="...">` with tailwind classes).

- [ ] **Step 3: Add a "Custom Tokens" section and an "Explore" section**

Append two new navigation sections to the footer matching the existing visual pattern. Use these link sets:

**Custom Tokens section:**
- Start Designing → `/custom-token`
- Custom Recovery Token → `/custom-recovery-token`
- Custom AA Coins → `/custom-aa-coins`
- Custom NA Coins → `/custom-na-coins`
- Custom Sobriety Medallion → `/custom-sobriety-medallion`
- Personalized Recovery Tokens → `/personalized-recovery-tokens`

**Explore section (or add to existing Shop section):**
- Milestone Tokens → `/milestone-tokens`
- AA Sobriety Coins → `/aa-sobriety-coins`
- NA Sobriety Coins → `/na-sobriety-coins`
- Sobriety Medallion → `/sobriety-medallion`
- Recovery Chips → `/recovery-chips`

Match the exact JSX structure and class names of the existing footer sections. Do not change the footer's layout, colors, or typography — only add new sections following the existing pattern.

- [ ] **Step 4: Run typecheck**

```bash
npm run typecheck
```

Expected: PASS.

- [ ] **Step 5: Dev server visual check**

```bash
npm run dev
```

Load any page (e.g., `http://localhost:3000/`). Scroll to the footer. Verify the two new navigation sections render with the correct links and match the existing footer style.

Click each new link in the footer and verify all 11 destinations load without errors.

Stop the dev server (Ctrl+C).

- [ ] **Step 6: Commit**

```bash
git add app/components/layout/Footer.tsx  # or actual path identified in Step 1
git commit -m "feat(seo): surface phrase-match expansion pages in site footer"
```

---

## Task 13: Final verification and PR-ready checks

**Files:** None modified.

**Context:** End-of-plan sanity pass. No code changes — verification only.

- [ ] **Step 1: Full typecheck**

```bash
npm run typecheck
```

Expected: PASS with zero errors.

- [ ] **Step 2: Full lint**

```bash
npm run lint
```

Expected: PASS with zero errors.

- [ ] **Step 3: Dev server — regression check on existing pages**

```bash
npm run dev
```

Load each of these existing pages and verify they render unchanged from the pre-expansion baseline (no CustomTokenFeatureBlock, no new CTAs — these are legacy pages):

- `http://localhost:3000/` (homepage)
- `http://localhost:3000/recovery-tokens` (existing commercial)
- `http://localhost:3000/sobriety-coins` (existing commercial)
- `http://localhost:3000/aa-coins` (existing commercial)
- `http://localhost:3000/na-coins` (existing commercial)
- `http://localhost:3000/1-year-sobriety-coin` (milestone)
- `http://localhost:3000/resources/glossary/sobriety-coin` (glossary)

Expected: All 7 pages render identically to pre-expansion state.

- [ ] **Step 4: Dev server — smoke-test all 15 new pages**

Load each new page and verify the H1 matches the expected exact phrase:

- `http://localhost:3000/milestone-tokens` → "Milestone Tokens"
- `http://localhost:3000/aa-sobriety-coins` → "AA Sobriety Coins"
- `http://localhost:3000/aa-sobriety-tokens` → "AA Sobriety Tokens"
- `http://localhost:3000/aa-sober-chips` → "AA Sober Chips"
- `http://localhost:3000/na-sobriety-coins` → "NA Sobriety Coins"
- `http://localhost:3000/na-sober-chips` → "NA Sober Chips"
- `http://localhost:3000/alcoholics-anonymous-sobriety-coins` → "Alcoholics Anonymous Sobriety Coins"
- `http://localhost:3000/narcotics-anonymous-coins` → "Narcotics Anonymous Coins"
- `http://localhost:3000/sobriety-medallion` → "Sobriety Medallion"
- `http://localhost:3000/recovery-chips` → "Recovery Chips"
- `http://localhost:3000/custom-recovery-token` → "Custom Recovery Token"
- `http://localhost:3000/custom-aa-coins` → "Custom AA Coins"
- `http://localhost:3000/custom-na-coins` → "Custom NA Coins"
- `http://localhost:3000/custom-sobriety-medallion` → "Custom Sobriety Medallion"
- `http://localhost:3000/personalized-recovery-tokens` → "Personalized Recovery Tokens"

All 15 should render successfully.

- [ ] **Step 5: Verify sitemap coverage**

Load `http://localhost:3000/sitemap/custom/1.xml` and confirm all 15 new canonicalPaths appear in `<loc>` tags. Expected counts:
- 15 new `<url>` entries for the new pages
- Existing entries for the 16 commercial + 14 milestone + 30+ glossary + static pages remain unchanged

- [ ] **Step 6: Verify JSON-LD on one page per template**

Right-click → View Source on `/milestone-tokens` (generic-seo template) and `/custom-recovery-token` (custom-intent template). Search for `application/ld+json`. Expected on each page:

- One BreadcrumbList schema
- One WebPage schema
- One FAQPage schema (from `SEOFaqAccordion`)

Total: 3 JSON-LD blocks per page.

- [ ] **Step 7: Check for bracketed placeholders in committed code**

```bash
grep -n "\[Draft" app/data/seo-pages.ts
```

Expected: **Zero matches.** If any `[Draft ...]` placeholders remain, they must be replaced with final prose before the plan is considered complete.

Stop the dev server (Ctrl+C).

- [ ] **Step 8: Confirm branch is ready for PR**

```bash
git log --oneline feat/seo-canonicals-breadcrumbs..HEAD
```

Expected: ~12-13 commits on `feat/seo-phrase-match-expansion` (one per task, not counting the spec commit which is on the parent branch).

```bash
git status
```

Expected: Clean working tree.

**At this point the plan is complete.** The branch is ready to open a PR targeting `main`. The PR description should reference `docs/superpowers/specs/2026-04-11-seo-phrase-match-expansion-design.md` and summarize: "Adds 15 new phrase-match SEO landing pages across two new intent-matched templates, with the custom-token flow prominently surfaced on every new page."
