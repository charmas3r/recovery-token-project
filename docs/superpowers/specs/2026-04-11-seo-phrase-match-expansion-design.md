# SEO Phrase-Match Expansion — Design Spec

**Date:** 2026-04-11
**Status:** Draft — pending user review
**Related work:** Builds on `2026-04-05-seo-landing-pages-design.md` (original 16 commercial + 14 milestone SEO pages)

---

## 1. Problem

The Recovery Token Store already ranks for a core set of semantic keywords via 16 commercial and 14 milestone SEO landing pages registered in `app/data/seo-pages.ts`. However:

1. **Exact-phrase coverage gaps.** High-volume exact-phrase queries like "AA sobriety coins," "AA sober chips," "milestone tokens," and "custom recovery token" are not targeted with dedicated landing pages. Semantic neighbors exist (e.g., `/aa-coins`, `/sobriety-coins`) but do not phrase-match the user's query in URL/title/H1.
2. **Custom token service is invisible on SEO pages.** The flagship differentiator — the `/custom-token` flow — is mentioned nowhere in `CommercialLandingTemplate.tsx` or `MilestoneLandingTemplate.tsx`. Traffic that arrives on SEO pages has no on-page path to the feature the business most wants customers to use.

## 2. Goals

1. Add **15 new phrase-match landing pages** targeting uncovered high-volume search phrases, each with genuinely distinct content to avoid thin/duplicate-content flags.
2. Ensure **every new page prominently surfaces the `/custom-token` flow**, with intent-matched emphasis (product-forward for generic buy-intent, custom-forward for custom-intent queries).
3. **Do not modify existing SEO pages, templates, or content.** Existing pages ship unchanged.
4. Preserve the data-driven architecture: new pages register through `registerSEOPage()` in `app/data/seo-pages.ts`; routing flows through the existing `($locale)._index.tsx` intercept.

## 3. Non-Goals

- Modifying `CommercialLandingTemplate.tsx`, `MilestoneLandingTemplate.tsx`, or any existing page data.
- New glossary entries, blog articles, or resources content.
- Multi-locale / hreflang support.
- A/B testing infrastructure.
- Migrating `seo-pages.ts` to Sanity (separate project per the file header).

## 4. Keyword Targets (15 Pages)

### Tier A — Generic high-volume exact phrases (10)

| # | Slug | H1 / Title | Primary Intent |
|---|---|---|---|
| 1 | `milestone-tokens` | Milestone Tokens | Buy |
| 2 | `aa-sobriety-coins` | AA Sobriety Coins | Buy |
| 3 | `aa-sobriety-tokens` | AA Sobriety Tokens | Buy / research |
| 4 | `aa-sober-chips` | AA Sober Chips | Buy |
| 5 | `na-sobriety-coins` | NA Sobriety Coins | Buy |
| 6 | `na-sober-chips` | NA Sober Chips | Buy / clarify |
| 7 | `alcoholics-anonymous-sobriety-coins` | Alcoholics Anonymous Sobriety Coins | Research |
| 8 | `narcotics-anonymous-coins` | Narcotics Anonymous Coins | Research |
| 9 | `sobriety-medallion` | Sobriety Medallion | Buy (singular = specific shopper) |
| 10 | `recovery-chips` | Recovery Chips | Umbrella / compare |

### Tier B — Custom-intent flagship funnel (5)

| # | Slug | H1 / Title | Primary Intent |
|---|---|---|---|
| 11 | `custom-recovery-token` | Custom Recovery Token | Design (flagship) |
| 12 | `custom-aa-coins` | Custom AA Coins | Design |
| 13 | `custom-na-coins` | Custom NA Coins | Design |
| 14 | `custom-sobriety-medallion` | Custom Sobriety Medallion | Design |
| 15 | `personalized-recovery-tokens` | Personalized Recovery Tokens | Light design / engrave |

### Pages deliberately skipped (already covered by existing exact-phrase pages)

`/recovery-tokens`, `/sobriety-coins`, `/aa-coins`, `/na-coins`, `/recovery-medallions`, `/custom-sobriety-coins`.

## 5. Architecture

### 5.1 Data model change

Add one optional field to the existing `SEOPage` interface in `app/data/seo-pages.ts`:

```ts
export interface SEOPage {
  // ...existing fields...
  /**
   * Which template to render.
   * Omitted/undefined → legacy behavior (CommercialLandingTemplate or MilestoneLandingTemplate based on `type`).
   * 'generic-seo' → GenericSEOLandingTemplate (Tier A phrase-match pages).
   * 'custom-intent' → CustomIntentLandingTemplate (Tier B custom-flow-forward pages).
   */
  template?: 'generic-seo' | 'custom-intent';

  /**
   * Optional override for the CustomTokenFeatureBlock copy.
   * Falls back to shared default copy when omitted.
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

All 16 existing commercial + 14 milestone pages remain unchanged — their `template` field is `undefined` and they keep rendering on the legacy templates.

**Constraint:** The `template` field is only set on pages with `type: 'commercial'`. Milestone and glossary pages ignore it; the routing switch (section 5.3) checks `type === 'milestone'` before `template`, so a milestone page that accidentally sets `template` will still render on `MilestoneLandingTemplate`.

### 5.2 New components

**`app/components/seo/CustomTokenFeatureBlock.tsx`** (~120 lines)

Shared full-width feature card used by both new templates.

- Props: `copy?: SEOPage['customTokenBlock']` (optional override; defaults to shared copy below).
- Layout: two-column grid, dark-gradient background (`linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)`), border `border-white/[0.08]`, rounded-2xl.
- Left column: three-step visual (1. Share your vision → 2. Review the design → 3. Receive your token). Numbered circles with accent color, connecting lines, brief label under each step.
- Right column: eyebrow + headline + body + two CTAs.
  - Primary: "Start Designing" → `/custom-token` (styled with `!bg-accent !text-black`).
  - Secondary: "See How It Works" → `/custom-token` (ghost/border style).
- Uses inline styles for all text (per project convention for centered/constrained text in wrapper components).

**Default copy:**

```
Eyebrow: "The Coinplugz Difference"
Headline: "Can't find exactly what you want? Create your own."
Body: "Every recovery journey is different. That's why we built two ways to make a
       token that's truly yours — whether you want us to design it from your story,
       or you want to control every detail."
Primary CTA: "Start Designing"
Secondary CTA: "See How It Works"
```

**`app/components/seo/GenericSEOLandingTemplate.tsx`** (~280 lines)

Tier A template. Product-forward with custom token as a prominent secondary path.

Layout sequence:
1. Breadcrumbs (reuses `Breadcrumbs` component).
2. Hero — eyebrow + H1 + hero description + dual CTA row (primary uses `page.primaryCTA.href` matching the `CommercialLandingTemplate` convention, typically a Shopify collection URL; secondary "Or design your own" → `/custom-token`).
3. `<SEOTrustBar />` (reused).
4. Intro text section — first `ContentSection` of type `text` rendered.
5. `<SEOProductCard />` showcase — up to 4 products from `featuredCollectionHandle` or `featuredProductHandles` (mirrors existing loader behavior in `($locale)._index.tsx`).
6. `<CustomTokenFeatureBlock copy={page.customTokenBlock} />` — mid-page, full-width, prominent.
7. Distinctive content section — second `text` section (the history/terminology angle).
8. `<SEOFaqAccordion items={page.faq} />`.
9. `<SEORelatedPages slugs={page.relatedPageSlugs} />`.
10. Final dual-CTA card (matches hero CTA pattern, inverted emphasis).
11. `<JsonLd>` for BreadcrumbList + WebPage schemas (matches existing template).

Consumes the same `SEOPage` shape, same `products` prop shape as `CommercialLandingTemplate`, so the `($locale)._index.tsx` loader needs no changes.

**`app/components/seo/CustomIntentLandingTemplate.tsx`** (~260 lines)

Tier B template. Custom-token-forward; products are secondary.

Layout sequence:
1. Breadcrumbs.
2. Hero — eyebrow + H1 + hero description + single primary CTA "Start Designing" → `/custom-token`.
3. `<CustomTokenFeatureBlock />` — directly below hero (not mid-page), acts as the feature showcase.
4. "Two Paths" explanation section — renders a `text` section explaining We Design It / You Design It, with two mini-cards linking to `/custom-token/we-design/occasion` and `/custom-token/you-design/describe` (these are the real entry points per existing `app/routes/($locale).custom-token._index.tsx`).
5. Distinctive content section — text section with page-specific angle.
6. `<SEOProductCard />` showcase labeled "Or shop ready-made" — up to 4 products, visually smaller than the custom flow emphasis.
7. `<SEOFaqAccordion items={page.faq} />`.
8. `<SEORelatedPages slugs={page.relatedPageSlugs} />`.
9. Final CTA — single primary "Start Designing" → `/custom-token`.
10. `<JsonLd>` for BreadcrumbList + WebPage schemas.

### 5.3 Routing change

Extend the switch in `app/routes/($locale)._index.tsx` (currently at lines 394-397):

```tsx
// BEFORE
if (seoPage.type === 'milestone') {
  return <MilestoneLandingTemplate page={seoPage} products={seoProducts} />;
}
return <CommercialLandingTemplate page={seoPage} products={seoProducts} />;

// AFTER
if (seoPage.type === 'milestone') {
  return <MilestoneLandingTemplate page={seoPage} products={seoProducts} />;
}
if (seoPage.template === 'generic-seo') {
  return <GenericSEOLandingTemplate page={seoPage} products={seoProducts} />;
}
if (seoPage.template === 'custom-intent') {
  return <CustomIntentLandingTemplate page={seoPage} products={seoProducts} />;
}
return <CommercialLandingTemplate page={seoPage} products={seoProducts} />;
```

No loader changes required — the loader already fetches products via `featuredCollectionHandle` or `featuredProductHandles`, which both templates consume.

### 5.4 Sitemap, robots, and metadata

- `app/routes/($locale).sitemap.custom.$page[.xml].tsx` already iterates `getAllSEOPages()` → new pages appear automatically. No change.
- Each new page supplies `metaTitle`, `metaDescription`, and (via the template) BreadcrumbList + WebPage JSON-LD. No sitewide robots or manifest changes.
- Canonical URLs: both templates set `canonical` via `<JsonLd>`'s `url` field, matching `https://coinplugz.com/${page.canonicalPath}` convention from `CommercialLandingTemplate.tsx:57-68`.

## 6. Content Differentiation Strategy

**Duplicate-content risk.** Google has de-ranked thin exact-phrase doorway pages since ~2015. Each of the 15 pages must be substantively distinct, not just title/URL swaps.

**Minimum content bar per page:**

| Element | Target |
|---|---|
| Hero description | 25-40 words, exact phrase once, distinct wording |
| Intro text section | 120-180 words, exact phrase 2-3x |
| Distinctive content section | 200-300 words of unique angle (see per-page table) |
| FAQ | 3-5 questions, each written specifically for this phrase |
| **Total distinct prose** | **600-800 words per page** |

Pages in the same phrase family (e.g., `/aa-sobriety-coins`, `/aa-sobriety-tokens`, `/aa-sober-chips`) must lean into **different angles**. If three pages all explain "AA's chip tradition" identically, Google will pick one as canonical and drop the others. The per-page angles below are the de-duplication primary defense.

### 6.1 Tier A per-page angles

| Slug | Angle / Distinctive Section |
|---|---|
| `milestone-tokens` | "Every Milestone Deserves a Marker." What qualifies as a milestone token across programs. Distinguishes tokens (neutral/umbrella), chips (AA-specific), coins (commemorative). Target: people searching the generic term. |
| `aa-sobriety-coins` | "Colors and Meanings in AA Sobriety Coins." The AA color system for early milestones (white/24hr, gold/30d, red/60d, green/90d, etc.) and the 12-step connection. |
| `aa-sobriety-tokens` | "Where the Token Tradition Began." Historical angle — Clarence Snyder's 1940s Cleveland AA group originally used poker chips called "tokens." This is the etymological origin story no other AA page covers. |
| `aa-sober-chips` | "The Ritual of Picking Up Your Chip." Ritual-focused — the in-meeting moment of walking up, the significance of the white desire chip, the community aspect. Behavioral/emotional angle. |
| `na-sobriety-coins` | "How NA Sobriety Coins Differ From AA Chips." NA uses medallions (annual) and key tags (shorter clean-time). Different color system. Clarifier page that converts confused cross-program searchers. |
| `na-sober-chips` | "Key Tags, Medallions, and Chips in NA." Clarifier for the less-common "NA chip" phrasing. Explains NA's actual tradition (key tags + medallions) while capturing the search. |
| `alcoholics-anonymous-sobriety-coins` | Historical deep-dive — AA's founding in Akron 1935, Bill W. and Dr. Bob, the chip tradition's origins. Longer page (target 800+ words). Full-name queries signal research intent. |
| `narcotics-anonymous-coins` | NA history — 1953 founding, adaptation of the 12 steps for drug addiction, medallion tradition distinct from AA. Parallel structure to the AA historical page. |
| `sobriety-medallion` | Singular-query = specific-shopper intent. Light history, heavy on material choices (bronze/silver/gold), sizing, engraving options. Most product-forward of the Tier A set. |
| `recovery-chips` | Umbrella comparison page. AA chips vs. NA key tags vs. Celebrate Recovery tokens vs. SMART Recovery markers. Internal links to program-specific pages serve as a hub. |

### 6.2 Tier B per-page angles

| Slug | Angle |
|---|---|
| `custom-recovery-token` | **Flagship landing page.** Full walkthrough of both custom paths (We Design / You Design), example narratives, the clearest funnel to `/custom-token`. Highest conversion priority. |
| `custom-aa-coins` | Custom flow framed with AA-specific inspiration: home group logos, anniversary dates, sponsor names, Serenity Prayer engraving, meeting-room imagery. |
| `custom-na-coins` | Custom flow framed with NA-specific inspiration: home group symbols, "Just for Today" engraving, clean-date formatting, NA slogans. |
| `custom-sobriety-medallion` | Singular, medallion-specific. Emphasizes material choices (gold/silver/bronze) and premium engraving depth. |
| `personalized-recovery-tokens` | Distinguishes **personalized** (name/date engraving on existing designs) from **fully custom** (ground-up design). Positioned as the lighter entry point to the custom flow — lower barrier for name-engrave shoppers. |

### 6.3 Internal linking rules

Each new page's `relatedPageSlugs` array must include:

- **1-2 existing commercial pages** (sends link equity to both directions).
- **2-3 sibling new pages** (e.g., `/aa-sobriety-coins` links to `/aa-sober-chips` and `/aa-sobriety-tokens`).
- **At least 1 Tier B page** (every Tier A page surfaces the custom flow via a related link in addition to the in-template CustomTokenFeatureBlock).

Tier B pages cross-link to each other and to their Tier A parents.

## 7. File Manifest

**New files (3):**
- `app/components/seo/CustomTokenFeatureBlock.tsx`
- `app/components/seo/GenericSEOLandingTemplate.tsx`
- `app/components/seo/CustomIntentLandingTemplate.tsx`

**Modified files (2):**
- `app/data/seo-pages.ts` — add `template` and `customTokenBlock` to `SEOPage` interface; append 15 new `registerSEOPage()` calls.
- `app/routes/($locale)._index.tsx` — extend the template switch around line 394.

**Untouched:**
- `app/components/seo/CommercialLandingTemplate.tsx`
- `app/components/seo/MilestoneLandingTemplate.tsx`
- `app/components/seo/GlossaryDetailTemplate.tsx`
- All 30+ existing `registerSEOPage()` entries.
- `app/routes/($locale).sitemap.custom.$page[.xml].tsx` (auto-picks up new pages).

## 8. Build Sequence

Each step is independently shippable and verifiable.

1. **Foundation** — Add `template` and `customTokenBlock` to `SEOPage` interface. Build `CustomTokenFeatureBlock.tsx`. Extend the routing switch in `($locale)._index.tsx`. Verify all existing pages still render unchanged via typecheck + dev-server spot check.
2. **GenericSEOLandingTemplate + pilot page** — Build the template. Register `/milestone-tokens` as the pilot. Verify: page renders, metadata correct, shows up in `/sitemap/custom/1.xml`, BreadcrumbList + WebPage JSON-LD present, CustomTokenFeatureBlock visible, no regressions on existing pages.
3. **CustomIntentLandingTemplate + flagship pilot** — Build the template. Register `/custom-recovery-token` as the pilot. Same verification checklist.
4. **Tier A batch 1 (5 pages)** — Register `/aa-sobriety-coins`, `/aa-sobriety-tokens`, `/aa-sober-chips`, `/na-sobriety-coins`, `/na-sober-chips`. Full copy to the 600-800 word standard per the per-page angles table.
5. **Tier A batch 2 (4 pages)** — Register `/alcoholics-anonymous-sobriety-coins`, `/narcotics-anonymous-coins`, `/sobriety-medallion`, `/recovery-chips`.
6. **Tier B batch (4 remaining pages)** — Register `/custom-aa-coins`, `/custom-na-coins`, `/custom-sobriety-medallion`, `/personalized-recovery-tokens`.
7. **Cross-linking pass** — Once all 15 slugs exist, fill in `relatedPageSlugs` across every page per the linking rules. This is a separate step because related-page slug references need all targets to exist first.
8. **Navigation surfacing** — Add a curated set (likely the 5 Tier B pages + 3-5 high-value Tier A pages) to the footer or Shop mega-nav for internal link equity and human discoverability.

## 9. Verification Checklist

**Per new page:**
- [ ] Page renders at `/<canonicalPath>` without errors
- [ ] Exact phrase appears in `<title>`, `<h1>`, and meta description
- [ ] 600-800 words of distinct prose (spot-check against sibling pages)
- [ ] `CustomTokenFeatureBlock` visible with working CTAs to `/custom-token`
- [ ] Appears in `/sitemap/custom/1.xml`
- [ ] BreadcrumbList and WebPage JSON-LD present in page source
- [ ] At least 3 `relatedPageSlugs` with at least one Tier B link
- [ ] Mobile layout verified (dark theme, eyebrow, H1, body, CTAs, trust bar, product grid)

**Sitewide regression:**
- [ ] All 16 existing commercial pages unchanged (spot-check 3: `/recovery-tokens`, `/sobriety-coins`, `/aa-coins`)
- [ ] All 14 milestone pages unchanged (spot-check 1: `/1-year-sobriety-coin`)
- [ ] Homepage still renders
- [ ] Typecheck passes (`npm run typecheck`)
- [ ] Lint passes (`npm run lint`)

## 10. Open Questions / Decisions Deferred to Implementation

- **Example images for CustomIntentLandingTemplate "example gallery"** — v1 can ship with text-only examples and a placeholder illustration. Real product shots can land later without template changes.
- **Copy authoring** — The per-page content is not in this spec. Each page's prose (600-800 words) is drafted during the batch-rollout steps and checked against the distinctive-angle rule before shipping.
- **Collection handles** — Each Tier A page needs a `featuredCollectionHandle` or `featuredProductHandles` list. These will be selected during the batch-rollout steps based on which existing Shopify collections best match each phrase. If no clean match exists for a phrase, `featuredProductHandles` lets us curate manually.
