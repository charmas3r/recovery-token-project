# Custom Token Creator — Design Specification

**Date:** 2026-03-22
**Status:** Draft
**Author:** Claude + esmith

---

## Overview

A feature allowing customers to create custom recovery tokens through two paths: "We Design It For You" (guided intake wizard) and "You Design It" (AI-assisted design studio). Both paths result in a physical engraved token shipped to the customer.

The feature is implemented as a single Shopify product with two variants, a multi-step route-per-step wizard, a provider-agnostic AI image generation system, and Klaviyo-based admin notification for fulfillment.

---

## Product Structure

- **Single Shopify product:** "Custom Token"
- **Two variants:** "We Design It" and "You Design It" (independently priced)
- **Entry points:** Hero CTA on homepage, CTA on product pages, direct navigation to `/custom-token`

---

## Architecture

### Route-Per-Step Wizard

Each wizard step is its own nested route under a shared layout. The layout route provides the progress bar, back navigation, and session context. Steps validate independently via their own loader/action pairs. Browser back/forward navigation works natively.

**Layout route:** `($locale).custom-token.tsx` — Reads session for progress state, renders progress bar and wizard chrome.

**Landing route:** `($locale).custom-token._index.tsx` — Path selector ("We Design" vs "You Design"). Initializes session with `path` and `startedAt`.

### "We Design It" Flow — 5 Steps

| Step | Route File | Purpose | Session Writes |
|------|-----------|---------|----------------|
| 1. Occasion | `we-design.occasion.tsx` | Multiple choice: Sobriety milestone, Memorial, Custom gift, Organization/Group | `customToken.occasion` |
| 2. Design Description | `we-design.description.tsx` | Free text description + up to 5 inspiration image uploads (5MB each, JPEG/PNG/WebP) | `customToken.description`, `customToken.inspirationImageIds[]` |
| 3. Material | `we-design.material.tsx` | Brass vs Color — maps to Shopify product variant | `customToken.material`, `customToken.variantId` |
| 4. Engraving | `we-design.engraving.tsx` | Name, date, custom text — reuses existing EngravingForm patterns | `customToken.engraving{name, years, cleanDate, note}` |
| 5. Review | `we-design.review.tsx` | Summary of all selections. Collects contact email for design follow-up. CartForm submission. | `customToken.contactEmail`. Adds to cart, clears session, fires Klaviyo event |

### "You Design It" Flow — 5 Steps

| Step | Route File | Purpose | Session Writes |
|------|-----------|---------|----------------|
| 1. Describe | `you-design.describe.tsx` | Guided prompt: theme, symbols, text, style. Optional reference image upload. | `customToken.designPrompt`, `customToken.referenceImageIds[]` |
| 2. AI Preview | `you-design.preview.tsx` | System amends prompt, generates 4 token design previews (uploaded to Shopify Files immediately). Customer picks favorite. | `customToken.previewImageIds[]`, `customToken.selectedPreviewId` |
| 3. Refine | `you-design.refine.tsx` | Shows selected design. Customer types refinements. Re-generates. Max 3 rounds. | `customToken.refinementPrompts[]`, `customToken.finalDesignId` |
| 4. Material | `you-design.material.tsx` | Same material selection — shared MaterialSelector component | `customToken.material`, `customToken.variantId` |
| 5. Review | `you-design.review.tsx` | Shows final AI design preview, material, summary. CartForm submission. | Uploads final image to Shopify Files, adds to cart, clears session, fires Klaviyo event |

---

## File Structure

### Routes

```
app/routes/
├── ($locale).custom-token.tsx                    ← Layout: progress bar, session
├── ($locale).custom-token._index.tsx             ← Path selector landing
├── ($locale).custom-token.we-design.occasion.tsx
├── ($locale).custom-token.we-design.description.tsx
├── ($locale).custom-token.we-design.material.tsx
├── ($locale).custom-token.we-design.engraving.tsx
├── ($locale).custom-token.we-design.review.tsx
├── ($locale).custom-token.you-design.describe.tsx
├── ($locale).custom-token.you-design.preview.tsx
├── ($locale).custom-token.you-design.refine.tsx
├── ($locale).custom-token.you-design.material.tsx
└── ($locale).custom-token.you-design.review.tsx
```

### Shared Components

```
app/components/custom-token/
├── WizardProgress.tsx        ← Step indicator bar
├── WizardNav.tsx             ← Back/Next buttons
├── MaterialSelector.tsx      ← Shared brass/color picker
├── DesignPreviewGrid.tsx     ← 4-up AI preview display
├── DesignRefiner.tsx         ← Refinement prompt + preview
├── ImageUploader.tsx         ← Drag-drop inspiration uploads
└── ReviewSummary.tsx         ← Order summary card
```

### AI Module

```
app/lib/ai/
├── types.ts                  ← ImageGenerationProvider interface
├── adapter.ts                ← Factory: reads env → returns provider
├── openai.ts                 ← OpenAI/DALL-E implementation
├── prompt-engine.ts          ← System prompt templates
└── [future-provider].ts      ← Drop in new providers here
```

### Session Helpers

```
app/lib/
├── custom-token-session.ts   ← Session read/write/clear helpers
└── validation.ts             ← (extend with custom token Zod schemas)
```

---

## AI Image Generation

### Provider Interface

```typescript
interface GenerateImageRequest {
  prompt: string;           // Already amended by prompt engine
  count: number;            // Number of images (1-4)
  size: '1024x1024';       // Square for token design
  style?: 'natural' | 'vivid';
}

interface GenerateImageResult {
  images: {
    url: string;            // Temporary URL from provider
    revisedPrompt?: string; // Provider's revised prompt (if any)
  }[];
  provider: string;         // 'openai' | 'stability' | etc.
  model: string;            // 'dall-e-3' | 'sd-xl' | etc.
  cost?: number;            // Estimated cost in cents (for logging)
}

interface ImageGenerationProvider {
  generate(req: GenerateImageRequest): Promise<GenerateImageResult>;
  healthCheck(): Promise<boolean>;
}
```

### Adapter Factory

The factory reads `AI_IMAGE_PROVIDER` env var and returns the corresponding implementation. Adding a new provider requires only a new implementation file and a new case in the factory switch.

### Prompt Engine

Takes the customer's raw description and wraps it with token-specific design parameters. The customer never sees these additions.

System prompt includes:
- Circular composition constraint (fits within a circle border)
- High contrast suitable for metal engraving
- Clean lines, no photographic elements
- Front face design (text/symbols centered)
- Metallic coin aesthetic
- Material-specific hints (brass vs color enamel)

### Day 1: OpenAI / DALL-E 3

DALL-E 3 generates one image per API call. For the initial 4-preview batch, 4 calls are made in parallel. For refinements, 1 call per round.

### Cost Protection

- **Per-session cap:** 7 generations (4 initial + 3 refinements). Tracked in the cookie session via `generationCount`.
- **Daily global cap:** Configurable via `AI_MAX_GENERATIONS_PER_DAY` env var. The counter is stored as a Shopify shop metafield (`custom_token.daily_generation_count`) with a date key. Each generation increments it via the Admin API `metafieldsSet` mutation (same pattern as the existing recovery circle metafields). The metafield is read in the AI adapter before generating and checked against the cap. If the count exceeds the cap, generation is refused. The date key resets the counter daily.
- **Estimated cost per session:** ~$0.28 (7 images at ~$0.04 each for DALL-E 3 1024x1024)

---

## Session State

### Storage Strategy

The Hydrogen session uses cookie-based storage with a ~4KB limit. The `CustomTokenSession` data — including multiple image URLs, refinement history, and text fields — can exceed this limit. To avoid this:

**Approach: Store image URLs as Shopify File IDs, not full URLs.** When images are uploaded (inspiration, AI-generated previews), immediately upload them to Shopify Files via staged uploads and store only the short file ID in the session (e.g., `gid://shopify/MediaImage/12345`). Resolve to full CDN URLs at read time in the loader. This keeps each URL reference to ~40 bytes instead of ~150+ bytes.

Additionally, the session stores only the data needed for the current and future steps. Text fields (`description`, `designPrompt`) are capped at reasonable lengths by validation (see Validation Schemas). The `refinementHistory` stores only the prompt text (not the full result URL — the result URL is the `finalDesignUrl` or `selectedPreviewUrl`).

**Estimated session size budget:**
- Path + material + variantId + occasion + metadata: ~200 bytes
- Description or designPrompt (capped at 500 chars): ~500 bytes
- Up to 5 image file IDs (~40 bytes each): ~200 bytes
- Engraving fields: ~200 bytes
- Refinement prompts (3 x ~200 chars): ~600 bytes
- **Total: ~1.7KB** — well within 4KB limit

### Data Shape

```typescript
interface CustomTokenSession {
  // Path selection
  path: 'we-design' | 'you-design';

  // Shared fields
  material?: 'brass' | 'color';
  variantId?: string;

  // "We Design" fields
  occasion?: string;
  description?: string;
  inspirationImageIds?: string[];   // Shopify File IDs (resolved to URLs in loader)
  contactEmail?: string;            // For design follow-up communication
  engraving?: {
    name?: string;
    years?: string;
    cleanDate?: string;
    note?: string;
  };

  // "You Design" fields
  designPrompt?: string;
  referenceImageIds?: string[];     // Shopify File IDs (resolved to URLs in loader)
  previewImageIds?: string[];       // Shopify File IDs (resolved to URLs in loader)
  selectedPreviewId?: string;       // Shopify File ID of chosen design
  refinementPrompts?: string[];     // Just the prompt text (max 3)
  finalDesignId?: string;           // Shopify File ID of final approved design

  // Metadata
  generationCount?: number;
  startedAt?: string;
}
```

### Helper Functions

- `getCustomTokenSession(session)` — Read current session state
- `updateCustomTokenSession(session, data)` — Merge partial updates
- `clearCustomTokenSession(session)` — Clear on cart add or abandon
- `getCompletedSteps(session)` — For progress bar
- `canProceedToStep(session, step)` — Step guards to prevent URL jumping

### Lifecycle

1. **Created** — User picks path on landing page. Session initialized with `path` and `startedAt`.
2. **Progressive fill** — Each step's action validates input, writes to session, redirects to next step.
3. **Step guards** — Each step's loader calls `canProceedToStep()`. Redirects back if prerequisites incomplete.
4. **Cleared** — On successful cart add. Abandoned sessions expire with Hydrogen session TTL.

---

## Cart Integration

### Line Item Properties — "We Design" Order

```
Custom Design Path     = "We Design It For You"
Occasion               = "Sobriety Milestone"
Design Description     = "Eagle with banner..."
Material               = "Brass"
Engraving Name         = "John D."
Engraving Years        = "5"
Engraving Clean Date   = "2021-03-15"
_Engraving Note        = "Special request..."     (private)
_Inspiration Images    = "url1, url2, url3"       (private)
_Contact Email         = "john@example.com"       (private)
```

### Line Item Properties — "You Design" Order

```
Custom Design Path     = "You Design It"
Design Description     = "Eagle with banner..."
Material               = "Color"
Final Design Image     = "https://cdn.shopify..."
_Design Prompt         = "Original prompt text"   (private)
_Refinement History    = "JSON of refinements"    (private)
_Reference Images      = "url1, url2"             (private)
_AI Provider           = "openai/dall-e-3"        (private)
_Generation Cost       = "$0.28"                  (private)
```

Keys prefixed with `_` are hidden from packing slips (follows existing engraving convention).

### Cart Add Flow

1. Review page shows full summary, customer confirms
2. Action uploads final design image to Shopify Files (if "You Design" path)
3. Action builds line item attributes array from session
4. CartForm submits `LinesAdd` with `merchandiseId` (variant) + all attributes
5. Fire-and-forget Klaviyo event with design brief and image URLs
6. Session cleared, cart drawer opened

---

## Admin Notification

### Klaviyo Event

On cart add, a fire-and-forget POST sends a `Custom Token Order` event to Klaviyo with all design data. A Klaviyo flow triggers an admin email containing:

- Design path chosen
- All customer selections (occasion, description, material, engraving)
- Clickable links to inspiration/design images (hosted on Shopify Files)
- Customer contact email for design follow-up ("We Design" path)

This follows the existing fire-and-forget pattern used for circle member adds.

---

## Image Storage

All images (inspiration uploads and AI-generated designs) are stored via Shopify's Admin API staged uploads pipeline. This reuses the existing `shopify-uploads.server.ts` infrastructure.

- **Inspiration images:** Uploaded during the description step, URLs stored in session
- **AI-generated previews:** All generated previews are immediately uploaded to Shopify Files via staged uploads after generation. This avoids DALL-E temporary URL expiration (~1-2 hours) and ensures previews remain visible if a customer pauses mid-wizard. Shopify File IDs are stored in the session (not full URLs) to stay within cookie size limits.
- **Final design:** Already in Shopify Files from the preview/refine step. The Shopify File CDN URL is stored as a line item property on cart add.

---

## Deployment & Preview

### Oxygen Preview Deployments

The existing GitHub Actions workflow (`.github/workflows/oxygen-deployment-*.yml`) deploys on push to any branch. No configuration changes needed.

**Workflow:**
1. All development on `feature/custom-tokens` branch
2. Every push creates an Oxygen preview deployment with a unique URL
3. Share preview URL for demo and stakeholder review
4. Merge to `main` for production deployment

### Environment Variables (New)

| Variable | Preview | Production | Description |
|----------|---------|------------|-------------|
| `AI_IMAGE_PROVIDER` | `openai` | `openai` | Which AI provider to use |
| `OPENAI_API_KEY` | `sk-preview-...` | `sk-prod-...` | Provider API key (lower limits for preview) |
| `AI_MAX_GENERATIONS_PER_SESSION` | `7` | `7` | Max images per wizard session |
| `AI_MAX_GENERATIONS_PER_DAY` | `20` | `500` | Global daily cap (cost protection) |

Set via Shopify admin: **Hydrogen > Store > Settings > Environments** or `shopify hydrogen env push`.

### Pre-Demo Checklist

- [ ] "Custom Token" product created in Shopify admin with both variants and pricing
- [ ] OpenAI preview API key set in Oxygen preview environment
- [ ] All new env vars configured for preview
- [ ] Klaviyo "Custom Token Order" flow created and tested
- [ ] Full "We Design" flow tested end-to-end
- [ ] Full "You Design" flow tested with AI generation
- [ ] Cart line items verified in Shopify order view
- [ ] Klaviyo admin notification email verified
- [ ] Mobile tested
- [ ] Preview URL shared for stakeholder review

### Go-Live Checklist

- [ ] All demo feedback addressed
- [ ] Production OpenAI key set in Oxygen production environment
- [ ] Rate limits tuned for expected traffic
- [ ] Hero CTA and product page CTAs enabled
- [ ] Error states tested (API failure, rate limit exceeded)
- [ ] PostHog analytics events tracked
- [ ] CSP headers verified (AI calls are server-side; no client-side CSP changes needed since all images are served from Shopify CDN)
- [ ] Merge `feature/custom-tokens` to `main`

---

## Validation Schemas (Zod)

New schemas to add to `app/lib/validation.ts`:

- `customTokenOccasionSchema` — Enum of occasion types
- `customTokenDescriptionSchema` — Min/max length for description text
- `customTokenDesignPromptSchema` — Guided prompt fields (theme, symbols, text, style)
- `customTokenRefinementSchema` — Refinement prompt text (max length)
- `customTokenMaterialSchema` — Enum of material options
- `customTokenContactEmailSchema` — Valid email for design follow-up ("We Design" review step)

---

## Error Handling

| Scenario | Handling |
|----------|----------|
| AI generation fails | Show error message with retry button. Do not consume generation count on failure. |
| Rate limit hit (per-session) | Disable generate button, show "Maximum refinements reached" message. Customer can proceed with current best design. |
| Rate limit hit (daily global) | Show "Design service temporarily unavailable, please try again later." |
| Image upload fails | Show error with retry. Do not advance to next step. |
| Session expired mid-wizard | Redirect to landing page with message "Your session expired. Please start again." |
| Cart add fails | Show error, keep session intact so customer can retry. |
| Klaviyo notification fails | Fail silently (fire-and-forget). Order data is in line item properties as backup. |

---

## Accessibility

- All wizard steps keyboard-navigable
- Progress bar uses `aria-valuenow` / `aria-valuemax`
- Image upload has drag-drop + click-to-browse + keyboard support
- AI preview images have alt text describing the generated design
- Loading states for AI generation use `aria-busy` and visible spinner
- Focus management: auto-focus first interactive element on step transition
- All animations respect `prefers-reduced-motion` (handled by existing Framer Motion components)
- Minimum 44px touch targets on all interactive elements

---

## Out of Scope

- Admin dashboard for managing custom orders (future enhancement if volume warrants)
- Real-time design collaboration between customer and designer
- 3D token preview/mockup
- Automatic engraving machine integration
- Customer account history of custom designs
