# SEO Landing Pages — Design Spec

**Date:** 2026-04-05
**Status:** Approved
**Scope:** 60 SEO entry-point pages covering every key recovery token search term

---

## 1. Overview

Build a comprehensive set of SEO landing pages that serve as entry points to the shop. Every key search term related to recovery tokens, sobriety coins, AA chips, milestones, gifting, and related concepts gets a dedicated page optimized for that keyword cluster.

### Goals

- Capture organic search traffic for 250+ recovery token keywords
- Funnel visitors from informational/commercial intent searches into the shop
- Build internal link authority across the page network
- Architect content for CMS migration without route changes

### Approach: Tiered Templates

Three template tiers, each purpose-built for its intent:

1. **Commercial Landing** — high-volume transactional terms, content-first with commerce CTAs
2. **Milestone Landing** — milestone-specific pages with emotional resonance and contextual products
3. **Glossary Detail** — informational pages replacing the current glossary grid entries

---

## 2. Page Inventory

### 2.1 Commercial Landing Pages (15 pages, flat URLs)

| # | URL | Primary Keywords | Est. Volume |
|---|-----|-----------------|-------------|
| 1 | `/sobriety-coins` | sobriety coins, sobriety chips, sobriety tokens, recovery coins | High |
| 2 | `/aa-coins` | AA coins, AA chips, AA medallions, AA tokens | High |
| 3 | `/na-coins` | NA coins, NA medallions, NA chips, NA key tags | Med-High |
| 4 | `/recovery-medallions` | recovery medallions, sober medallions, 12 step medallions | Med-High |
| 5 | `/recovery-gifts` | sobriety gifts, recovery gifts, addiction recovery gifts | High |
| 6 | `/sobriety-gifts-for-women` | sobriety gifts for women, recovery gifts for her | Med |
| 7 | `/sobriety-gifts-for-men` | sobriety gifts for men, recovery gifts for him | Med |
| 8 | `/sponsor-gifts` | AA sponsor gifts, sponsee gifts, recovery sponsor gift | Med |
| 9 | `/custom-sobriety-coins` | custom sobriety coins, personalized recovery tokens, engraved AA coins | Med |
| 10 | `/bronze-sobriety-coins` | bronze AA coins, bronze sobriety coins | Med |
| 11 | `/gold-silver-medallions` | gold plated AA medallion, silver sobriety coin | Low-Med |
| 12 | `/serenity-prayer-coins` | serenity prayer coin, serenity prayer medallion | Med |
| 13 | `/aa-chip-colors` | AA chip colors, AA chip colors and meanings | High |
| 14 | `/sobriety-coin-holders` | AA coin holder, sobriety coin keychain, medallion holder | Med |
| 15 | `/celebrate-recovery-coins` | Celebrate Recovery chips, 12 step coins, program-specific | Low-Med |

### 2.2 Milestone Landing Pages (15 pages, flat URLs)

| # | URL | Primary Keywords | Est. Volume |
|---|-----|-----------------|-------------|
| 16 | `/24-hour-chip` | 24 hour chip, 24 hour sobriety chip, desire chip | Med-High |
| 17 | `/30-day-sobriety-coin` | 30 day chip, 1 month sobriety coin | Med |
| 18 | `/60-day-sobriety-coin` | 60 day chip, 2 month sobriety coin | Low-Med |
| 19 | `/90-day-sobriety-coin` | 90 day chip, 3 month sobriety coin | Med |
| 20 | `/6-month-sobriety-coin` | 6 month chip, 6 month sobriety coin | Med |
| 21 | `/9-month-sobriety-coin` | 9 month chip | Low-Med |
| 22 | `/1-year-sobriety-coin` | 1 year sobriety coin, 1 year AA coin, one year sober gift | **High** |
| 23 | `/2-year-sobriety-coin` | 2 year sobriety coin, 2 year AA medallion | Med |
| 24 | `/5-year-sobriety-coin` | 5 year sobriety coin, 5 year AA medallion | Med |
| 25 | `/10-year-sobriety-coin` | 10 year sobriety coin | Med |
| 26 | `/15-year-sobriety-coin` | 15 year sobriety coin | Low-Med |
| 27 | `/20-year-sobriety-coin` | 20 year sobriety coin | Low-Med |
| 28 | `/25-year-sobriety-coin` | 25 year sobriety coin, quarter century | Low-Med |
| 29 | `/long-term-sobriety-coins` | 30, 35, 40, 50 year sobriety coin | Low |
| 30 | `/early-recovery-chips` | 1 week chip, first chip in AA | Low-Med |

### 2.3 Glossary Detail Pages (30 pages, nested URLs)

All 30 existing glossary terms from Sanity CMS get individual pages at `/resources/glossary/{slug}`. The current glossary grid becomes a directory linking to these detail pages. The exact term slugs are sourced from Sanity at build/request time via the existing `getAllGlossaryTerms()` query — the data file only needs entries for terms where extended content or product links are provided beyond what Sanity already has.

Terms are organized in 5 existing categories:
- Recovery Basics
- Milestones & Time
- Tokens & Coins
- Support & Community
- Programs & Methods

---

## 3. Data Architecture

### 3.1 Data File: `app/data/seo-pages.ts`

Single file exporting a `Map<string, SEOPage>` keyed by slug. All page content is hardcoded initially, structured for CMS migration later.

```typescript
type SEOPageType = 'commercial' | 'milestone' | 'glossary';

interface SEOPage {
  // Routing & SEO
  slug: string;
  type: SEOPageType;
  title: string;                     // H1 + og:title
  metaTitle: string;                 // <title> tag
  metaDescription: string;           // 155 chars max
  canonicalPath: string;

  // Content
  eyebrow: string;
  heroDescription: string;
  sections: ContentSection[];
  faq: FAQItem[];

  // Commerce
  primaryCTA: {
    label: string;                   // e.g. "Shop Sobriety Coins"
    href: string;                    // e.g. "/collections/all"
  };
  featuredCollectionHandle?: string;
  featuredProductHandles?: string[];
  relatedPageSlugs: string[];

  // Milestone-specific
  milestone?: {
    duration: string;
    significance: string;
    traditionalColor?: string;
    nextMilestoneSlug?: string;
    prevMilestoneSlug?: string;
  };

  // Glossary-specific
  glossary?: {
    definition: string;
    extendedContent: string;
    category: string;
    relatedTermSlugs: string[];
    productLink?: string;
  };

  // Schema.org types to render
  schema: SchemaType[];
}

interface ContentSection {
  type: 'text' | 'productShowcase' | 'comparison' | 'testimonial' | 'cta';
  heading?: string;
  body: string;
  productHandles?: string[];
  collectionHandle?: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

type SchemaType = 'breadcrumb' | 'faq' | 'definedTerm' | 'webPage';
```

### 3.2 Key Design Decisions

1. **Flat file, not per-page files.** One file, one Map. Easy to search, type-check, and replace with a CMS fetch.

2. **CMS migration path.** Create a Sanity schema matching `SEOPage`, write a `getSEOPage(slug)` query, swap the data source in the loader. Routes and templates stay identical.

3. **Products referenced by handle, fetched live.** Content is static; product prices and availability are always current from Storefront API.

4. **FAQ doubles as schema.** The `faq[]` array renders both visible accordion UI and `FAQPage` JSON-LD.

5. **Glossary pages extend Sanity data.** The loader fetches the base term from Sanity and merges with `extendedContent` from the data file.

---

## 4. Template Components

### 4.1 Commercial Landing Template (`CommercialLandingTemplate`)

Used by: `/sobriety-coins`, `/aa-coins`, `/recovery-gifts`, etc.

**Layout:**

```
┌─────────────────────────────────────────────┐
│  Eyebrow + H1 + Hero Description            │
│  Primary CTA button ("Shop [Category]")     │
│  (inline styles for centering)              │
├─────────────────────────────────────────────┤
│  Trust Bar                                   │
│  "Handcrafted" · "Free Shipping" · "5★"     │
├─────────────────────────────────────────────┤
│  Content Sections (dynamic)                  │
│  - Text blocks with keyword-rich content     │
│  - ProductShowcase: 3-4 featured products    │
│  - More text content                         │
│  - Second ProductShowcase (if present)       │
├─────────────────────────────────────────────┤
│  FAQ Accordion                               │
├─────────────────────────────────────────────┤
│  Related Pages (internal link cards)         │
├─────────────────────────────────────────────┤
│  Final CTA ("Shop [Category]" → collection) │
└─────────────────────────────────────────────┘
```

**Commerce touchpoints:** Hero CTA, product showcase cards (each links to PDP), closing CTA. Minimum 2 shop links per page, more with product showcases.

### 4.2 Milestone Landing Template (`MilestoneLandingTemplate`)

Used by: `/1-year-sobriety-coin`, `/90-day-sobriety-coin`, etc.

**Layout:**

```
┌─────────────────────────────────────────────┐
│  Eyebrow (e.g. "1 Year Milestone")          │
│  H1 + Hero Description                      │
│  Primary CTA ("Shop 1 Year Coins")          │
│  Traditional color badge (if applicable)     │
├─────────────────────────────────────────────┤
│  Milestone Significance                      │
│  Emotional paragraph about this milestone    │
├─────────────────────────────────────────────┤
│  Featured Products for This Milestone        │
│  3-4 product cards from collection/handles   │
├─────────────────────────────────────────────┤
│  Content Sections (dynamic)                  │
│  - How to celebrate this milestone           │
│  - Gifting guidance                          │
├─────────────────────────────────────────────┤
│  Milestone Navigation                        │
│  ← Previous Milestone  ·  Next Milestone →  │
├─────────────────────────────────────────────┤
│  FAQ Accordion                               │
├─────────────────────────────────────────────┤
│  Related Pages                               │
├─────────────────────────────────────────────┤
│  Final CTA ("Shop [Milestone] Coins")       │
└─────────────────────────────────────────────┘
```

**Milestone-specific features:** Prev/next navigation chain through all 15 milestones. Traditional color badge. Emotional "significance" section.

### 4.3 Glossary Detail Template (`GlossaryDetailTemplate`)

Used by: `/resources/glossary/sobriety-coin`, etc.

**Layout:**

```
┌─────────────────────────────────────────────┐
│  Breadcrumb: Resources > Glossary > Term    │
├─────────────────────────────────────────────┤
│  Eyebrow (category)                         │
│  H1 (term name)                             │
│  Short definition (lead text)               │
├─────────────────────────────────────────────┤
│  Extended Content                            │
│  Rich informational content                  │
├─────────────────────────────────────────────┤
│  Related Products (soft CTA)                 │
│  "Explore our [term] collection"            │
│  1-2 product cards                           │
├─────────────────────────────────────────────┤
│  Related Terms (card grid)                   │
├─────────────────────────────────────────────┤
│  Back to Glossary link                       │
└─────────────────────────────────────────────┘
```

**Commerce touchpoints:** Soft CTA with 1-2 product cards if `productLink` exists, plus collection link.

### 4.4 Shared Sub-components

| Component | Purpose |
|-----------|---------|
| `SEOProductCard` | Product card fetched live from Storefront API (image, title, price, stars, "Shop Now") |
| `SEOFaqAccordion` | Radix Accordion rendering FAQ items + emits `FAQPage` JSON-LD |
| `SEORelatedPages` | Grid of internal link cards to other SEO pages |
| `SEOTrustBar` | Horizontal trust indicators (reused from homepage) |
| `SEOBreadcrumb` | Breadcrumb nav + `BreadcrumbList` schema |
| `SEOMilestoneNav` | Prev/next milestone navigation |

All components follow the design system: dark gradient cards, `text-white` headings, `text-white/50` body, `border-white/[0.08]`, eyebrow pattern, inline styles for centered text blocks.

---

## 5. Routing & Loaders

### 5.1 Route Files

Two dynamic route files handle all 60 pages:

```
app/routes/
  ($locale).$seoPage.tsx                    # Commercial + Milestone (flat URLs)
  ($locale).resources.glossary.$term.tsx     # Glossary detail pages
  ($locale).resources.glossary._index.tsx    # Existing grid (updated to link out)
```

### 5.2 Commercial/Milestone Loader (`($locale).$seoPage.tsx`)

```typescript
export async function loader({params, context}: Route.LoaderArgs) {
  const page = getSEOPage(params.seoPage);

  if (!page || page.type === 'glossary') {
    throw new Response('Not Found', {status: 404});
  }

  // Fetch live product data
  const products = page.featuredProductHandles
    ? await context.storefront.query(PRODUCTS_BY_HANDLES_QUERY, {
        variables: {handles: page.featuredProductHandles},
        cache: context.storefront.CacheLong(),
      })
    : null;

  const collection = page.featuredCollectionHandle
    ? await context.storefront.query(COLLECTION_WITH_PRODUCTS_QUERY, {
        variables: {handle: page.featuredCollectionHandle, first: 4},
        cache: context.storefront.CacheLong(),
      })
    : null;

  return {page, products, collection};
}
```

**Route priority:** React Router resolves static segments before dynamic ones. Existing routes like `($locale).about.tsx`, `($locale).cart.tsx`, `($locale).contact.tsx` etc. all take priority over `($locale).$seoPage.tsx` because they are static matches. The `$seoPage` dynamic segment only matches slugs that don't correspond to any existing route. Unknown slugs return 404 from the loader, and the existing `($locale).$.tsx` splat route is less specific than `$seoPage`, so it remains the final fallback.

### 5.3 Glossary Detail Loader (`($locale).resources.glossary.$term.tsx`)

```typescript
export async function loader({params, context}: Route.LoaderArgs) {
  const page = getSEOPage(`resources/glossary/${params.term}`);

  if (!page || page.type !== 'glossary') {
    throw new Response('Not Found', {status: 404});
  }

  // Fetch base term from Sanity
  const sanityTerm = await getGlossaryTerm(params.term);

  // Fetch related products if linked
  const products = page.glossary?.productLink
    ? await context.storefront.query(COLLECTION_WITH_PRODUCTS_QUERY, {
        variables: {handle: page.glossary.productLink, first: 2},
        cache: context.storefront.CacheLong(),
      })
    : null;

  return {page, sanityTerm, products};
}
```

### 5.4 Glossary Index Update

The existing `($locale).resources.glossary._index.tsx` is updated so each term in the grid becomes a `<Link to={term.slug}>` instead of showing the definition inline. The grid becomes a directory. The `DefinedTermSet` schema stays on the index page.

### 5.5 Caching

All SEO page loaders use `CacheLong()` (1 hour). Content is static; product data is bounded by the small number of featured items per page.

---

## 6. SEO & Structured Data

### 6.1 Meta Tags

Every page uses the existing `buildMeta()` helper:

```typescript
export const meta: Route.MetaFunction = ({data}) => {
  return buildMeta({
    title: data.page.metaTitle,
    description: data.page.metaDescription,
    url: `/${data.page.canonicalPath}`,
    type: 'website',
  });
};
```

### 6.2 JSON-LD Schemas by Page Type

| Page Type | Schemas |
|-----------|---------|
| Commercial Landing | `BreadcrumbList`, `FAQPage`, `WebPage` |
| Milestone Landing | `BreadcrumbList`, `FAQPage`, `WebPage` |
| Glossary Detail | `BreadcrumbList`, `DefinedTerm`, `FAQPage` (if FAQ exists) |

Additionally, `Organization` schema will be added to the root layout (fixing an existing gap) — rendered once, not per-page.

### 6.3 Internal Linking Strategy

Hub-and-spoke topology distributing authority across the network:

1. **Commercial → Milestone:** Each commercial page links to relevant milestone pages
2. **Milestone → Milestone:** Prev/next chain through all 15 milestones
3. **Milestone → Commercial:** Each milestone links to relevant commercial pages
4. **Glossary → Commercial:** Detail pages link to commercial pages where the term is relevant
5. **Commercial → Glossary:** Commercial pages link to glossary for deeper reading
6. **All pages → Shop:** Every page links to Shopify collections via hero CTA, product cards, and closing CTA

### 6.4 Sitemap Integration

Update `($locale).sitemap.custom.$page[.xml].tsx` to auto-generate entries from `seo-pages.ts`:

```typescript
const seoPages = getAllSEOPages();
const seoEntries = seoPages.map(page => ({
  url: `${baseUrl}/${page.canonicalPath}`,
  lastmod: new Date().toISOString(),
  changefreq: 'weekly',
  priority: page.type === 'commercial' ? 0.8 : page.type === 'milestone' ? 0.7 : 0.6,
}));
```

All 60 pages are indexable (no `noindex`). No canonicalization conflicts between glossary index and detail pages — they serve different intents.

---

## 7. Commerce Integration

### 7.1 Shop Links Per Template

Every page has a minimum of two shop touchpoints:

| Template | Hero CTA | Product Cards | Closing CTA |
|----------|----------|---------------|-------------|
| Commercial | "Shop {Category}" → collection | 3-4 cards → PDP | "Shop {Category}" → collection |
| Milestone | "Shop {Milestone} Coins" → collection | 3-4 cards → PDP | "Shop {Milestone} Coins" → collection |
| Glossary | (none) | 1-2 cards → PDP (if productLink) | "Explore Collection" → collection |

### 7.2 Product Data

Products are referenced by Shopify handle in the data file and fetched live from the Storefront API at request time. This ensures prices, availability, and images are always current regardless of when the content was written.

### 7.3 `primaryCTA` Field

Every page requires a `primaryCTA`:

```typescript
primaryCTA: {
  label: string;   // "Shop Sobriety Coins", "Shop 1 Year Coins"
  href: string;    // "/collections/all", "/collections/classic"
}
```

---

## 8. File Structure (New/Modified)

### New Files

```
app/
  data/
    seo-pages.ts                           # All 60 page definitions
  components/
    seo/
      CommercialLandingTemplate.tsx         # Commercial page template
      MilestoneLandingTemplate.tsx          # Milestone page template
      GlossaryDetailTemplate.tsx           # Glossary detail template
      SEOProductCard.tsx                    # Product card (live data)
      SEOFaqAccordion.tsx                   # FAQ accordion + FAQPage schema
      SEORelatedPages.tsx                   # Internal link card grid
      SEOTrustBar.tsx                       # Trust indicators bar
      SEOBreadcrumb.tsx                     # Breadcrumb nav + schema
      SEOMilestoneNav.tsx                   # Prev/next milestone nav
  routes/
    ($locale).$seoPage.tsx                 # Dynamic route for commercial + milestone
    ($locale).resources.glossary.$term.tsx  # Glossary detail route
```

### Modified Files

```
app/routes/
  ($locale).resources.glossary._index.tsx  # Grid → directory (terms link out)
  ($locale).sitemap.custom.$page[.xml].tsx # Auto-generate SEO page entries
app/root.tsx                               # Add Organization schema (one-time)
```

---

## 9. CMS Migration Path

When ready to move content to Sanity:

1. Create Sanity document types matching `SEOPage`, `ContentSection`, `FAQItem`
2. Write a migration script that reads `seo-pages.ts` and creates Sanity documents
3. Replace `getSEOPage()` with a Sanity GROQ query
4. Routes, templates, and components remain unchanged
5. Delete `seo-pages.ts`

No route changes. No template changes. Only the data source swaps.

---

## 10. Keyword Coverage Summary

| Cluster | Keywords | Pages Covering |
|---------|----------|----------------|
| Core commercial (sobriety coins, AA chips, etc.) | ~25 | Pages 1-4 |
| Program-specific (AA, NA, Celebrate Recovery) | ~30 | Pages 2, 3, 15 |
| Milestone-specific (all durations) | ~50+ | Pages 16-30 |
| Gifting/occasion | ~40 | Pages 5-8 |
| Material/style/customization | ~40 | Pages 9-12, 14 |
| Informational (colors, history, meaning) | ~40 | Pages 13 + glossary detail pages |
| Recovery-adjacent | ~25 | Cross-linked from relevant pages |
| **Total unique keywords** | **~250+** | **60 pages** |
