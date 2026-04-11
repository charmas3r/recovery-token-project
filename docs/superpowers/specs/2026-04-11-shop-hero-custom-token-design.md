# Shop Page Custom-Token Hero — Design

**Date:** 2026-04-11
**Status:** Draft (awaiting user review)
**Scope:** `/collections/all` only

## Goal

Add a compact custom-token conversion hero to the shop page (`/collections/all`) that captures visitors who didn't find what they wanted in the catalog and routes them into the existing `/custom-token` design flow.

## Context

- The landing page (`app/routes/($locale)._index.tsx:417`) already runs a full-viewport custom-token hero with two CTAs ("Design It Yourself" / "Have Us Design It") that POST to `/custom-token` with a hidden `path` field. The action seeds session state then redirects into the wizard. (Established in commit `a9a7c05`.)
- The shop page (`app/routes/($locale).collections.all.tsx`) is currently a bare `<h1>Products</h1>` plus a paginated grid — no styling, no container, no hero.
- A `FEATURE_FLAGS.CUSTOM_TOKEN` boolean in `app/lib/feature-flags.ts` gates all custom-token surfaces. The landing page's `CustomTokenCTA` is gated on it.
- Per `CLAUDE.md`, Tailwind classes break inside Suspense / motion / Await wrappers and inside multi-line centered text blocks — inline styles are required for any centered/constrained text.

## Non-goals

- Other collection pages (`/collections/$handle`, `/collections`) — out of scope.
- Extracting the hero into a shared component — only one caller, deferred until a second use case appears.
- Unrelated refactors of `collections.all.tsx` beyond the targeted styling improvement to `<h1>` and grid container.
- A/B testing harness, analytics events — none beyond what `/custom-token` already records.
- Video, background lighting glow, scrambling headline — intentionally omitted to differentiate from the landing hero and respect product-browsing intent.

## Design decisions and rationale

**Compact, no video.** The shop page's primary job is product browsing. A full-viewport hero with video would push the grid below the fold and compete with dozens of product images directly underneath. A ~30vh single-column text+CTA strip respects browsing intent while still preserving the two-path conversion CTA.

**Shop-contextual copy.** Headline reframes the hero as a fallback for unmet demand ("Don't see your milestone?") rather than reusing the landing pitch verbatim. Visitors on the catalog already know the brand and the catalog — meeting them where they are converts the long tail without feeling redundant.

**Hero is `<h2>`, page keeps `<h1>`.** The hero's headline is marketing copy, not the page topic. The document `<h1>` stays "All Products" so SEO/page hierarchy remains correct. The hero sits *above* the H1 visually but uses an H2 semantically.

**Inline component, not extracted.** Single caller, no second use case in sight. Extract later if `/collections/$handle` ever wants the same treatment.

**Feature flag gated.** Mirrors how `CustomTokenCTA` is gated on the landing page (`_index.tsx:407`). When the flag flips off, the hero disappears and the bare H1 + grid render unchanged.

**Targeted styling cleanup of existing markup.** The current `<h1>Products</h1>` and unwrapped grid are bare and unstyled. While we're in this file, we wrap the grid in `container-wide`, add vertical padding, and style the H1 with `font-display text-section text-white` per the design system. Scoped to the area touched — not a wider refactor.

## Implementation

### File changes

- `app/routes/($locale).collections.all.tsx` — add `ShopHero` local component, wire it into the default export, add new imports, style the existing H1 + grid container.

No new files. No changes to `feature-flags.ts`, `Button`, or any shared component.

### Component shape

A local `ShopHero` function component inside `collections.all.tsx`. No props. Renders a single `<section>` with:

- `bg-black` background, `border-b border-white/[0.08]` to separate from the grid below.
- `container-wide` wrapper.
- Inner block uses inline styles per the CLAUDE.md rule for centered text:
  - `textAlign: 'center'`, `maxWidth: '42rem'`, auto margins, `paddingTop/Bottom: '4rem'`.
- Eyebrow `<span>`: "Custom Tokens" — `#B8764F`, uppercase, `letterSpacing: '0.25em'`, `fontWeight: 600`, `marginBottom: '1rem'`.
- `<h2>`: "Don't see your milestone?" — `font-display`, `2.5rem`, white, `lineHeight: 1.1`.
- `<p>`: "Design a custom token — pick the metal, the symbols, and the words that matter." — `1.125rem`, `rgba(255,255,255,0.5)`, max-width `36rem`, centered.
- CTA row: `flex flex-col sm:flex-row gap-4 justify-center` containing two `<Form method="post" action="/custom-token">` elements:
  - Form 1: hidden `path=you-design`, primary `<Button type="submit" size="lg">Design It Yourself</Button>` with `!px-10`.
  - Form 2: hidden `path=we-design`, secondary `<Button type="submit" size="lg">Have Us Design It</Button>`.

### Default export update

Replace:
```tsx
return (
  <div className="collection">
    <h1>Products</h1>
    <PaginatedResourceSection ... />
  </div>
);
```

with:
```tsx
return (
  <div className="collection">
    {FEATURE_FLAGS.CUSTOM_TOKEN && <ShopHero />}
    <div className="container-wide py-2xl">
      <h1 className="font-display text-section text-white mb-lg">All Products</h1>
      <PaginatedResourceSection ... />
    </div>
  </div>
);
```

### New imports

Added to `collections.all.tsx`:
- `Form` from `react-router`
- `Button` from `~/components/ui/Button`
- `FEATURE_FLAGS` from `~/lib/feature-flags`

## Testing

- **Manual:** Visit `/collections/all` in dev. Verify hero renders above the grid, both CTAs POST to `/custom-token` and land on the correct wizard step (you-design vs we-design). Verify the H1 + grid below render with proper spacing.
- **Feature flag off:** Temporarily flip `CUSTOM_TOKEN` to `false`, confirm hero disappears and the styled H1 + grid render correctly on their own.
- **Responsive:** Mobile (CTAs stack), tablet, desktop (CTAs side-by-side, hero centered, grid below).
- **Reduced motion:** No animation in this hero, so no specific check needed beyond visual smoke test.
- **Type check:** `npm run typecheck` passes.

## Rollback

Single-file change. Revert the commit. No data migrations, no feature flag changes, no shared component edits.

## Open questions

None. All clarifying questions resolved during brainstorming:
- Scope: `/collections/all` only.
- Prominence: compact (~30vh).
- Copy: shop-contextual ("Don't see your milestone?").
- Visual: text + CTAs only, no video.
