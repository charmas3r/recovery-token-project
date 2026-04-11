# Shop Page Custom-Token Hero Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a compact custom-token conversion hero above the products grid on `/collections/all`, plus targeted styling cleanup of the bare `<h1>` and grid container in the same file.

**Architecture:** Single-file change. Add a local `ShopHero` function component inside `app/routes/($locale).collections.all.tsx`, gated behind `FEATURE_FLAGS.CUSTOM_TOKEN`, rendered above the (now-styled) products grid. Two POST forms reuse the existing `/custom-token` seeding action established in commit `a9a7c05`. No new files, no shared component edits.

**Tech Stack:** React Router v7, Hydrogen 2025.x, TypeScript, Tailwind v4, existing `Button` UI primitive.

**Testing approach:** This codebase has no project-level unit tests for route components — verification is `npm run typecheck` plus manual browser checks. Writing fake unit tests for a markup-only change would be cargo-cult TDD.

**Spec:** `docs/superpowers/specs/2026-04-11-shop-hero-custom-token-design.md`

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `app/routes/($locale).collections.all.tsx` | Modify | Add `ShopHero` local component, restyle existing H1 + grid container, gate hero on feature flag |

No other files touched. No new files created.

---

## Task 1: Add imports

**Files:**
- Modify: `app/routes/($locale).collections.all.tsx:1-7`

- [ ] **Step 1: Update the import block**

Replace lines 1–7 of `app/routes/($locale).collections.all.tsx`:

```tsx
import type {Route} from './+types/collections.all';
import {useLoaderData} from 'react-router';
import {getPaginationVariables, Image, Money} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/layout/PaginatedResourceSection';
import {ProductItem} from '~/components/product/ProductItem';
import type {CollectionItemFragment} from 'storefrontapi.generated';
import {buildMeta} from '~/lib/meta';
```

with:

```tsx
import type {Route} from './+types/collections.all';
import {useLoaderData, Form} from 'react-router';
import {getPaginationVariables, Image, Money} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/layout/PaginatedResourceSection';
import {ProductItem} from '~/components/product/ProductItem';
import {Button} from '~/components/ui/Button';
import {FEATURE_FLAGS} from '~/lib/feature-flags';
import type {CollectionItemFragment} from 'storefrontapi.generated';
import {buildMeta} from '~/lib/meta';
```

Three additions: `Form` joins the existing `react-router` import; `Button` and `FEATURE_FLAGS` get new lines in the internal-imports group per CLAUDE.md import organization.

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: PASS. (`Form`, `Button`, `FEATURE_FLAGS` are all known modules; this step exists to catch typos before moving on.)

- [ ] **Step 3: Do not commit yet**

The imports alone reference `Form` and `Button` which aren't used anywhere — TS will warn but won't fail with `noUnusedLocals` off. We'll commit after Task 3 when everything is wired together.

---

## Task 2: Add the `ShopHero` local component

**Files:**
- Modify: `app/routes/($locale).collections.all.tsx` (append after the `Collection` default export, before `COLLECTION_ITEM_FRAGMENT`)

- [ ] **Step 1: Add the component**

Insert the following block immediately after the closing `}` of the `Collection` default export function (currently at line 75) and before the `COLLECTION_ITEM_FRAGMENT` const declaration:

```tsx

/**
 * Compact custom-token conversion hero — sits above the products grid
 * to capture visitors who didn't find what they wanted in the catalog.
 * Two CTAs POST to /custom-token to seed session state, mirroring the
 * landing page hero (commit a9a7c05).
 */
function ShopHero() {
  return (
    <section className="relative bg-black border-b border-white/[0.08]">
      <div className="container-wide">
        <div
          style={{
            textAlign: 'center',
            maxWidth: '42rem',
            marginLeft: 'auto',
            marginRight: 'auto',
            paddingTop: '4rem',
            paddingBottom: '4rem',
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
            Custom Tokens
          </span>
          <h2
            style={{
              fontFamily: 'var(--font-display, serif)',
              fontSize: '2.5rem',
              fontWeight: 700,
              color: '#FFFFFF',
              lineHeight: 1.1,
              marginBottom: '1rem',
            }}
          >
            Don&apos;t see your milestone?
          </h2>
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
            Design a custom token — pick the metal, the symbols, and the
            words that matter.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Form method="post" action="/custom-token">
              <input type="hidden" name="path" value="you-design" />
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full sm:w-auto !px-10"
              >
                Design It Yourself
              </Button>
            </Form>
            <Form method="post" action="/custom-token">
              <input type="hidden" name="path" value="we-design" />
              <Button
                type="submit"
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto"
              >
                Have Us Design It
              </Button>
            </Form>
          </div>
        </div>
      </div>
    </section>
  );
}
```

Notes for the implementer:
- Inline styles are required by CLAUDE.md for centered/constrained text blocks. Do not "clean this up" by converting to Tailwind classes — they break in this context (see CLAUDE.md "Tailwind in Suspense/Await/Motion Boundaries").
- `Don&apos;t` is the JSX-safe form of "Don't"; `<h2>Don't see…</h2>` will trigger a React/JSX lint warning, the entity is correct.
- The component takes no props — all copy is hard-coded per the spec. If this hero gets reused elsewhere later, *then* extract and parameterize.

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: PASS. The component is defined but not yet rendered — it will warn as unused under strict configs but should not error.

- [ ] **Step 3: Do not commit yet**

Wire-up happens in Task 3.

---

## Task 3: Wire `ShopHero` into the default export and restyle existing markup

**Files:**
- Modify: `app/routes/($locale).collections.all.tsx:55-75`

- [ ] **Step 1: Replace the `Collection` default export body**

Replace the current default export (lines 55–75):

```tsx
export default function Collection() {
  const {products} = useLoaderData<typeof loader>();

  return (
    <div className="collection">
      <h1>Products</h1>
      <PaginatedResourceSection<CollectionItemFragment>
        connection={products}
        resourcesClassName="products-grid"
      >
        {({node: product, index}) => (
          <ProductItem
            key={product.id}
            product={product}
            loading={index < 8 ? 'eager' : undefined}
          />
        )}
      </PaginatedResourceSection>
    </div>
  );
}
```

with:

```tsx
export default function Collection() {
  const {products} = useLoaderData<typeof loader>();

  return (
    <div className="collection">
      {FEATURE_FLAGS.CUSTOM_TOKEN && <ShopHero />}
      <div className="container-wide py-2xl">
        <h1 className="font-display text-section text-white mb-lg">
          All Products
        </h1>
        <PaginatedResourceSection<CollectionItemFragment>
          connection={products}
          resourcesClassName="products-grid"
        >
          {({node: product, index}) => (
            <ProductItem
              key={product.id}
              product={product}
              loading={index < 8 ? 'eager' : undefined}
            />
          )}
        </PaginatedResourceSection>
      </div>
    </div>
  );
}
```

Three changes:
1. `{FEATURE_FLAGS.CUSTOM_TOKEN && <ShopHero />}` renders the new hero (gated).
2. The grid is now wrapped in `<div className="container-wide py-2xl">` for proper page width and vertical breathing room.
3. The bare `<h1>Products</h1>` becomes `<h1 className="font-display text-section text-white mb-lg">All Products</h1>` per the design system. "All Products" matches the page meta title (`'All Products | Coinplugz'` at line 11).

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 3: Start dev server**

Run: `npm run dev`
Expected: Server starts, prints local URL (typically `http://localhost:3000`).

- [ ] **Step 4: Manual visual check — hero on**

Open `http://localhost:3000/collections/all` in a browser.

Verify:
- Hero renders above the products grid.
- Eyebrow "Custom Tokens" in accent color (#B8764F), uppercase, letter-spaced.
- Headline "Don't see your milestone?" in white serif, ~2.5rem.
- Subhead in white/50.
- Two CTAs side-by-side on desktop, stacked on mobile (resize the window to <640px to confirm).
- Border-bottom separates hero from the grid below.
- Grid has proper `container-wide` width (not full-bleed), `py-2xl` padding above and below.
- "All Products" H1 uses display font in white, sits above the grid.

- [ ] **Step 5: Manual CTA check — both POST flows**

Click "Design It Yourself" — should navigate into the `/custom-token` you-design wizard step.
Click browser back, then click "Have Us Design It" — should navigate into the we-design step.

Both should work because they reuse the existing `/custom-token` action from commit `a9a7c05`. If either flow fails, do NOT add error handling here — the bug is in the action, not the hero, and is out of scope.

- [ ] **Step 6: Manual flag-off check**

Stop the dev server. Edit `app/lib/feature-flags.ts` and temporarily set `CUSTOM_TOKEN: false`. Restart dev server. Reload `/collections/all`.

Verify:
- Hero is gone.
- "All Products" H1 + grid still render correctly with the new container/spacing.
- No layout artifacts (no leftover border, no empty section).

Then revert `feature-flags.ts` back to `CUSTOM_TOKEN: true`. Do NOT commit the flag flip.

- [ ] **Step 7: Final typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add app/routes/'($locale).collections.all.tsx'
git commit -m "$(cat <<'EOF'
feat: add custom-token hero to shop page

Adds a compact ShopHero above the products grid on /collections/all
that captures visitors who didn't find their milestone and routes them
into the existing /custom-token design flow. Two CTAs POST to seed
session state, mirroring the landing hero. Gated on FEATURE_FLAGS.CUSTOM_TOKEN.

Also restyles the bare <h1>Products</h1> and wraps the grid in
container-wide + py-2xl for proper page layout while in the file.
EOF
)"
```

(Single-quoted path because the filename contains parentheses that zsh would otherwise expand.)

---

## Self-review notes

**Spec coverage:** All sections of `2026-04-11-shop-hero-custom-token-design.md` are implemented across Tasks 1–3 (imports, component, wire-up + restyle, feature-flag gating, manual verification, single-file commit).

**Placeholder scan:** No "TBD" / "TODO" / vague verbs. Every code step shows complete code.

**Type/name consistency:** `ShopHero` (no props), `FEATURE_FLAGS.CUSTOM_TOKEN`, `Form` from `react-router`, `Button` from `~/components/ui/Button` — all consistent across tasks.

**Honest about TDD:** No fabricated unit tests. Verification is typecheck + manual browser checks, which is appropriate for a markup-only change in a codebase with no existing route-component test suite.
