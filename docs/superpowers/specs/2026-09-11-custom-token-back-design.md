# Custom Token Creator — Front + Back Design Extension

**Date:** 2026-09-11
**Status:** Draft
**Author:** Claude + esmith

---

## Overview

Extend the existing "You Design It" AI custom-token wizard (see `docs/superpowers/specs/2026-03-22-custom-token-design.md`) so customers can also design the **back** of the coin, in addition to the existing front-only flow. The back defaults to a small curated set of standard preset designs (no AI cost), with a "Customize instead" escape hatch that runs the same AI generation pipeline used for the front.

Both the front and back final images must reach the shop owner via cart/order line-item attributes, exactly as the front image does today.

This is an additive extension: the existing front-only wizard routes and behavior must not change. All new logic for the back side lives in new files, sharing only the underlying generation/upload/rate-limit *functions* (parameterized by side), not the route files themselves.

---

## Current State (baseline, unchanged by this work)

- Wizard: `describe` → `material` → `preview` → `refine` → `review`, one route file per step under `app/routes/($locale).custom-token.you-design.*`.
- Session (`app/lib/custom-token-session.ts`): single `designPrompt`, `previewImageIds[]`, `selectedPreviewId`, `finalDesignId`.
- Generation: `preview.tsx` (`intent=generate`) and `refine.tsx` (`intent=refine`) actions call `createImageProvider()` → DALL·E 3, one image per call, capped by `AI_MAX_GENERATIONS_PER_SESSION` (default 7) via `rate-limit.server.ts`.
- Upload: `uploadImageToShopifyFiles()` (`app/lib/shopify-uploads.server.ts`) stages and registers the image as a Shopify File, returning a GID.
- Shop-owner visibility: `you-design.review.tsx` action resolves the final GID to a CDN URL and attaches it as cart line-item attribute `'Final Design Image'`, plus private (`_`-prefixed) metadata attributes. No metafields or admin notes are used. A Klaviyo event fires as a secondary channel.
- **No test runner is configured** (`package.json` has no vitest/jest; only `eslint-plugin-jest` as a lint rule plugin). Skill docs show aspirational Vitest examples but nothing is wired up.

---

## Goals

1. Customers can add a back design to their coin: pick a standard preset, or customize it via the same AI flow used for the front.
2. Both front and back final images are visible to the shop owner through Shopify order data, in the same mechanism (cart line-item attributes) already used for front.
3. The existing front-only flow's route files, session fields, and cart attribute for front (`'Final Design Image'`) are **not modified** — zero regression risk to what already works.
4. A test harness is bootstrapped (none exists today) and used to both characterize current front-only behavior (regression safety net) and drive the new back-side work test-first.

## Non-Goals

- Redesigning the front flow.
- A separate/independent rate-limit budget for back generation (explicitly decided: shared budget, see Decisions).
- Enumerating exact test file names/cases in this spec (deferred to the implementation plan).

---

## Data Model

Extend `CustomTokenSession` (`app/lib/custom-token-session.ts`) with back-side fields, additive only:

```typescript
interface CustomTokenSession {
  // --- existing front fields, UNCHANGED ---
  designPrompt?: string;
  previewImageIds?: string[];
  selectedPreviewId?: string;
  finalDesignId?: string;

  // --- new back fields ---
  backMode?: 'preset' | 'custom';   // which path the customer took for the back
  backPresetId?: string;             // set when backMode === 'preset'
  backDesignPrompt?: string;         // set when backMode === 'custom'
  backPreviewImageIds?: string[];    // set when backMode === 'custom'
  backSelectedPreviewId?: string;    // set when backMode === 'custom'
  backFinalDesignId?: string;        // Shopify File GID either way (preset or custom)
}
```

If the customer never visits the back step (or leaves it untouched), `backMode` defaults to `'preset'` with a fixed default preset ID at review/checkout time — every order ends up with two sides, per product decision.

### Preset library

A small static list of pre-uploaded Shopify File GIDs, checked into `app/lib/custom-token-presets.ts`:

```typescript
export const BACK_PRESETS = [
  {id: 'serenity-prayer', label: 'Serenity Prayer', fileGid: '...'},
  {id: 'default-blank', label: 'Blank', fileGid: '...'},
  // additional presets supplied by the business
] as const;

export const DEFAULT_BACK_PRESET_ID = 'serenity-prayer';
```

Selecting a preset triggers zero AI calls and zero new Shopify uploads (the file is already uploaded once, ahead of time, by whoever curates the preset list).

---

## Wizard Flow

New step inserted between the existing `refine` and `review` steps:

```
describe → material → preview → refine → you-design.back.tsx (NEW) → review
```

### `you-design.back.tsx` (new — single file, not three)

Implementation research (during plan-writing) found the shared AI/upload functions don't need a `side` parameter at all — `uploadImageToShopifyFiles` already takes an explicit filename per call site, and `checkAndIncrementDailyLimit`'s cap is global regardless of caller. So rather than three new files (`back.tsx` + `back.preview.tsx` + `back.refine.tsx`) each parameterized by `side`, all back-side logic — preset selection, custom generation, and refinement — lives in **one** new route file, `you-design.back.tsx`, with multiple action intents (`select-preset`, `generate`, `refine`, `continue`). This mirrors how the front's own `you-design.preview.tsx` and `refine.tsx` already multiplex behavior through an `intent` field on a single route, rather than one route per intent. It still satisfies Option B's actual requirement — front's existing route files are never touched, and the expensive/risky business logic (OpenAI calls, Shopify uploads, rate limiting) is reused as-is, not duplicated — just with one file instead of three.

- Renders a card grid of `BACK_PRESETS` (a new `BackPresetSelector` component, image-thumbnail variant of the `MaterialSelector` card-grid pattern) — selecting one sets `backMode: 'preset'`, `backPresetId`, and resolves `backFinalDesignId` immediately (no AI call, `intent=select-preset`).
- A "Customize instead" link reveals an inline description textarea + generate button (`intent=generate`, calling the same `createImageProvider`/`buildTokenPrompt`/`uploadImageToShopifyFiles` functions the front uses, with a back-specific filename), writing to `backDesignPrompt`/`backPreviewImageIds`/`backSelectedPreviewId`/`backFinalDesignId` instead of the front's fields.
- Once generated, the same page shows the result via the existing `DesignRefiner` component, wired to `intent=refine` (mirrors `you-design.refine.tsx`'s refine action, writing to `backFinalDesignId`/`backRefinementPrompts`).
- `intent=continue` guarantees `backFinalDesignId` is set before redirecting to review — defaulting to `DEFAULT_BACK_PRESET_ID` if the customer never touched this step, or falling back to the last generated preview if they generated but never explicitly finalized one.

### `you-design.review.tsx` (extended, not rewritten)

- Reads both `finalDesignId` (front) and `backFinalDesignId` (back) from session.
- Renders both images side by side.
- Builds cart attributes for both sides (see below).
- The defaulting to `DEFAULT_BACK_PRESET_ID` happens earlier, in `you-design.back.tsx`'s own `continue` action (see above) — by the time review's loader/action run, `backFinalDesignId` is guaranteed to be set. Review doesn't need its own defaulting logic; it also gates on this via `canProceedToStep(session, 'review')`, which now requires the `back` step to be completed.

---

## Shared Generation Logic — No Signature Changes Needed

Rather than duplicating the AI/upload/rate-limit code paths (rejected as Option C — see Decisions), `you-design.back.tsx`'s `generate` and `refine` action intents call the exact same functions the front routes call, with **no signature changes**:

- `buildTokenPrompt(prompt, options)` / `buildRefinementPrompt(prompt, refinement, material)` (`app/lib/ai/prompt-engine.ts`) — prompt text differs (back's own `backDesignPrompt`), function signature doesn't.
- `uploadImageToShopifyFiles(image, env)` (`app/lib/shopify-uploads.server.ts`) — differentiated by filename string alone (e.g. `custom-token-back-preview.png` vs. `custom-token-preview.png`), which the function already takes per call.
- `checkAndIncrementDailyLimit(env, incrementBy)` (`app/lib/ai/rate-limit.server.ts`) — the cap is global and shared by design (see Decisions); there's nothing side-specific to pass.

An earlier draft of this spec proposed adding a `side: 'front' | 'back'` parameter to these functions for labeling. Implementation research found none of them branch or log per-side today, so the parameter would be unused ceremony. Isolation from the front routes is achieved by keeping all back-side call sites inside the new `you-design.back.tsx` file — the front routes are never imported from, or modified by, that file.

---

## Shop-Owner Visibility (Cart / Order Attributes)

`you-design.review.tsx`'s action is extended to emit attributes for both sides:

```
'Final Design Image': frontUrl              // UNCHANGED key name — no impact to existing automations
'Final Design Image (Back)': backUrl         // NEW
'Back Design Source': backMode               // NEW — 'preset' | 'custom', helps ops know what to expect
'_Design Prompt': frontPrompt                // UNCHANGED
'_Design Prompt (Back)': backPrompt          // NEW, only present when backMode === 'custom'
'_Refinement History (Back)': backHistory    // NEW, only present when backMode === 'custom'
```

All other existing private (`_`-prefixed) front metadata attributes are unchanged. The Klaviyo event fired from `review.tsx` is extended to carry the same back-side data as a backup channel, mirroring the existing front behavior.

---

## Decisions Log

| Decision | Choice | Rationale |
|---|---|---|
| Back customization scope | Standard presets by default, with a "fully customize" escape hatch into the same AI flow | Confirmed by product owner — most customers won't need full AI generation for the back |
| Is back required? | Optional; defaults to a standard preset if skipped | Every order still ships with two designed sides without forcing extra steps on the customer |
| Wizard architecture | Option B: one new isolated route file (`you-design.back.tsx`, multi-intent) for the back flow, reusing the underlying generation/upload/rate-limit functions unchanged | Front's existing, working route files are never touched — lowest regression risk — while still avoiding duplicating the expensive/risky business logic (Option C was rejected for this reason). Consolidated to one file instead of three during implementation planning, matching the front's own single-route-multi-intent convention |
| Rate-limit budget | Shared across front + back (still 7 generations/session total) | Same underlying cost driver (OpenAI calls); no product reason identified to double the budget |
| Cart attribute naming | Keep `'Final Design Image'` as-is for front; add `'Final Design Image (Back)'` for back | Avoids any risk to downstream automations (Klaviyo flows, Shopify Flow, fulfillment scripts) that may already key off the existing literal string |

---

## Testing Plan

No test runner exists in this repo today. This work includes bootstrapping one, not just adding tests to an existing suite.

1. **Bootstrap Vitest** + `@testing-library/react`, add `test`/`test:watch` scripts to `package.json`. Matches the test patterns already illustrated (but not wired up) in `.cursor/skills/product-personalization/SKILL.md` and `REFERENCE.md`.
2. **Characterization tests first, before any implementation changes** — lock down today's front-only behavior as a regression guard:
   - Session read/write round-trips (`custom-token-session.ts`).
   - Prompt builder output for known inputs (`prompt-engine.ts`).
   - Upload flow with mocked staged-upload + `fileCreate` (`shopify-uploads.server.ts`).
   - Rate-limit cap and daily-limit boundary behavior (`rate-limit.server.ts`).
   - `you-design.review.tsx` action's exact cart attributes for a front-only session — byte-for-byte match to today's output. This is the primary regression guard for this project.
3. **New unit tests written before back-side implementation (TDD)**:
   - Session round-trip including back fields.
   - Preset selection triggers no AI call and no new upload.
   - Back-side generate/refine action intents produce the same shape of result as the front's, using the shared functions unchanged.
   - `review.tsx` action produces both front and back attributes correctly.
   - Skipped-back-step path resolves to `DEFAULT_BACK_PRESET_ID` when `you-design.back.tsx`'s `continue` action runs.
4. **Component tests**: `you-design.back.tsx` preset grid selection and "Customize instead" escape hatch routing; `review.tsx` rendering both images.

Exact test file names and enumerated cases are left to the implementation plan, not this spec.

---

## Open Items for Implementation Plan

- Exact preset image assets/GIDs to seed `BACK_PRESETS` (business-supplied, e.g. the Serenity Prayer scroll design already provided as a reference). The implementation plan seeds this file with clearly-labeled placeholder GIDs; swap in the real ones after uploading via Admin → Content → Files.
- ~~Whether `you-design.back.tsx` needs its own progress-bar step indicator update~~ — resolved during implementation planning: `WizardProgress` already derives its step list from `getSteps('you-design')` and needs no changes; adding `'back'` to that array is sufficient.
