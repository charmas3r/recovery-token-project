# Custom Token Creator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow customers to create custom recovery tokens through two paths — a guided intake wizard ("We Design It") and an AI-assisted design studio ("You Design It") — implemented as a route-per-step wizard with provider-agnostic AI image generation.

**Architecture:** Single Shopify product with two variants. Route-per-step wizard under a shared layout route at `/custom-token`. Session-based state persistence using Shopify File IDs (not full URLs) to stay within cookie limits. AI image generation via a provider-agnostic adapter pattern (`app/lib/ai/`) with OpenAI/DALL-E 3 as the day-1 provider. All generated images uploaded to Shopify Files immediately. Cart integration via line item properties (same pattern as existing engraving). Admin notification via Klaviyo fire-and-forget event.

**Tech Stack:** Hydrogen 2025.7.3, React Router v7, TypeScript, Tailwind v4, Zod 4.x, Framer Motion, OpenAI API, Shopify Admin API (staged uploads, metafields), Klaviyo API

**Spec:** `docs/superpowers/specs/2026-03-22-custom-token-design.md`

---

## File Map

### New Files

| File | Responsibility |
|------|---------------|
| `app/lib/ai/types.ts` | `ImageGenerationProvider` interface, request/result types |
| `app/lib/ai/adapter.ts` | Factory function: reads `AI_IMAGE_PROVIDER` env, returns provider instance |
| `app/lib/ai/openai.ts` | OpenAI/DALL-E 3 implementation of provider interface |
| `app/lib/ai/prompt-engine.ts` | Builds token-specific prompts from customer input |
| `app/lib/custom-token-session.ts` | Session read/write/clear helpers for `CustomTokenSession` |
| `app/components/custom-token/WizardProgress.tsx` | Step indicator bar with active/completed/upcoming states |
| `app/components/custom-token/WizardNav.tsx` | Back/Next navigation buttons |
| `app/components/custom-token/MaterialSelector.tsx` | Brass vs Color picker (shared between both paths) |
| `app/components/custom-token/ImageUploader.tsx` | Drag-drop + click-to-browse file upload |
| `app/components/custom-token/DesignPreviewGrid.tsx` | 4-up grid for AI-generated preview selection |
| `app/components/custom-token/DesignRefiner.tsx` | Refinement prompt input + current/new preview display |
| `app/components/custom-token/ReviewSummary.tsx` | Order summary card for both paths |
| `app/routes/($locale).custom-token.tsx` | Layout route: progress bar, session context, shared chrome |
| `app/routes/($locale).custom-token._index.tsx` | Landing page: path selector ("We Design" / "You Design") |
| `app/routes/($locale).custom-token.we-design.occasion.tsx` | Step 1: Occasion selection |
| `app/routes/($locale).custom-token.we-design.description.tsx` | Step 2: Design description + image uploads |
| `app/routes/($locale).custom-token.we-design.material.tsx` | Step 3: Material selection |
| `app/routes/($locale).custom-token.we-design.engraving.tsx` | Step 4: Engraving details |
| `app/routes/($locale).custom-token.we-design.review.tsx` | Step 5: Review + cart add |
| `app/routes/($locale).custom-token.you-design.describe.tsx` | Step 1: Design prompt input |
| `app/routes/($locale).custom-token.you-design.preview.tsx` | Step 2: AI preview generation + selection |
| `app/routes/($locale).custom-token.you-design.refine.tsx` | Step 3: Design refinement |
| `app/routes/($locale).custom-token.you-design.material.tsx` | Step 4: Material selection |
| `app/routes/($locale).custom-token.you-design.review.tsx` | Step 5: Review + cart add |

### Modified Files

| File | Change |
|------|--------|
| `env.d.ts` | Add AI env var types (`AI_IMAGE_PROVIDER`, `OPENAI_API_KEY`, etc.) |
| `app/lib/validation.ts` | Add custom token Zod schemas |
| `app/lib/shopify-uploads.server.ts` | Export `uploadImageToShopifyFiles` (single-file variant returning GID + URL) and `resolveShopifyFileIds` (batch ID→URL resolver) |
| `app/routes/($locale)._index.tsx` | Add "Create Custom Token" CTA to hero section |

---

## Task Breakdown

### Task 1: Environment Types & Validation Schemas

**Files:**
- Modify: `env.d.ts`
- Modify: `app/lib/validation.ts`

- [ ] **Step 1: Add AI env var types to `env.d.ts`**

Add inside the existing `Env` interface augmentation:

```typescript
// AI Image Generation
AI_IMAGE_PROVIDER?: string;
OPENAI_API_KEY?: string;
AI_MAX_GENERATIONS_PER_SESSION?: string;
AI_MAX_GENERATIONS_PER_DAY?: string;
```

- [ ] **Step 2: Add custom token Zod schemas to `app/lib/validation.ts`**

Add at the end of the file, before any existing exports:

```typescript
// Custom Token Schemas
export const customTokenOccasionSchema = z.enum([
  'milestone',
  'memorial',
  'gift',
  'organization',
]);
export type CustomTokenOccasion = z.infer<typeof customTokenOccasionSchema>;

export const customTokenDescriptionSchema = z.object({
  description: z.string().min(10, 'Please describe your design in at least 10 characters').max(500, 'Description must be under 500 characters'),
});
export type CustomTokenDescriptionData = z.infer<typeof customTokenDescriptionSchema>;

export const customTokenDesignPromptSchema = z.object({
  theme: z.string().min(3, 'Please describe a theme').max(200, 'Theme must be under 200 characters'),
  symbols: z.string().max(200, 'Symbols must be under 200 characters').optional().default(''),
  text: z.string().max(100, 'Text must be under 100 characters').optional().default(''),
  style: z.string().max(200, 'Style must be under 200 characters').optional().default(''),
});
export type CustomTokenDesignPromptData = z.infer<typeof customTokenDesignPromptSchema>;

export const customTokenRefinementSchema = z.object({
  refinement: z.string().min(3, 'Please describe what to change').max(200, 'Refinement must be under 200 characters'),
});
export type CustomTokenRefinementData = z.infer<typeof customTokenRefinementSchema>;

export const customTokenMaterialSchema = z.enum(['brass', 'color']);
export type CustomTokenMaterial = z.infer<typeof customTokenMaterialSchema>;

export const customTokenContactEmailSchema = z.object({
  contactEmail: z.string().email('Please enter a valid email address'),
});
export type CustomTokenContactEmailData = z.infer<typeof customTokenContactEmailSchema>;
```

- [ ] **Step 3: Run typecheck**

Run: `npm run typecheck`
Expected: PASS — no type errors

- [ ] **Step 4: Commit**

```bash
git add env.d.ts app/lib/validation.ts
git commit -m "feat(custom-token): add env types and validation schemas"
```

---

### Task 2: Session Helpers

**Files:**
- Create: `app/lib/custom-token-session.ts`

- [ ] **Step 1: Create the session helper module**

```typescript
import type {AppSession} from '~/lib/session';

const SESSION_KEY = 'customToken';

export interface CustomTokenSession {
  path: 'we-design' | 'you-design';
  material?: 'brass' | 'color';
  variantId?: string;

  // "We Design" fields
  occasion?: string;
  description?: string;
  inspirationImageIds?: string[];
  contactEmail?: string;
  engraving?: {
    name?: string;
    years?: string;
    cleanDate?: string;
    note?: string;
  };

  // "You Design" fields
  designPrompt?: string;
  referenceImageIds?: string[];
  previewImageIds?: string[];
  selectedPreviewId?: string;
  refinementPrompts?: string[];
  finalDesignId?: string;

  // Metadata
  generationCount?: number;
  startedAt?: string;
}

const WE_DESIGN_STEPS = ['occasion', 'description', 'material', 'engraving', 'review'] as const;
const YOU_DESIGN_STEPS = ['describe', 'preview', 'refine', 'material', 'review'] as const;

export function getCustomTokenSession(session: AppSession): CustomTokenSession | null {
  return session.get(SESSION_KEY) ?? null;
}

export function updateCustomTokenSession(
  session: AppSession,
  data: Partial<CustomTokenSession>,
): void {
  const current = getCustomTokenSession(session) ?? ({} as CustomTokenSession);
  session.set(SESSION_KEY, {...current, ...data});
}

export function clearCustomTokenSession(session: AppSession): void {
  session.unset(SESSION_KEY);
}

export function getSteps(path: 'we-design' | 'you-design') {
  return path === 'we-design' ? WE_DESIGN_STEPS : YOU_DESIGN_STEPS;
}

export function getCompletedSteps(data: CustomTokenSession): string[] {
  const completed: string[] = [];

  if (data.path === 'we-design') {
    if (data.occasion) completed.push('occasion');
    if (data.description) completed.push('description');
    if (data.material && data.variantId) completed.push('material');
    if (data.engraving) completed.push('engraving');
  } else {
    if (data.designPrompt) completed.push('describe');
    if (data.selectedPreviewId) completed.push('preview');
    if (data.finalDesignId) completed.push('refine');
    if (data.material && data.variantId) completed.push('material');
  }

  return completed;
}

export function canProceedToStep(
  data: CustomTokenSession | null,
  step: string,
): boolean {
  if (!data) return false;

  const steps = getSteps(data.path);
  const stepIndex = steps.indexOf(step as any);
  if (stepIndex <= 0) return true; // First step is always accessible

  // All previous steps must be completed
  const completed = getCompletedSteps(data);
  for (let i = 0; i < stepIndex; i++) {
    if (!completed.includes(steps[i])) return false;
  }
  return true;
}
```

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add app/lib/custom-token-session.ts
git commit -m "feat(custom-token): add session state helpers"
```

---

### Task 3: AI Provider Interface & Prompt Engine

**Files:**
- Create: `app/lib/ai/types.ts`
- Create: `app/lib/ai/prompt-engine.ts`
- Create: `app/lib/ai/adapter.ts`

- [ ] **Step 1: Create the provider interface**

Create `app/lib/ai/types.ts`:

```typescript
export interface GenerateImageRequest {
  prompt: string;
  count: number;
  size: '1024x1024';
  style?: 'natural' | 'vivid';
}

export interface GeneratedImage {
  url: string;
  revisedPrompt?: string;
}

export interface GenerateImageResult {
  images: GeneratedImage[];
  provider: string;
  model: string;
  cost?: number;
}

export interface ImageGenerationProvider {
  generate(req: GenerateImageRequest): Promise<GenerateImageResult>;
  healthCheck(): Promise<boolean>;
}
```

- [ ] **Step 2: Create the prompt engine**

Create `app/lib/ai/prompt-engine.ts`:

```typescript
const SYSTEM_PREFIX = `Design a circular recovery/sobriety token coin.
The design must work as a physical engraved coin:
- Circular composition, fits within a circle border
- High contrast suitable for metal engraving
- Clean lines, no photographic elements
- Front face design (text/symbols centered)
- Metallic coin aesthetic`;

const STYLE_SUFFIX = `Style: detailed coin engraving illustration,
metallic surface, raised relief design,
professional commemorative coin aesthetic.
Top-down view of a single coin on dark background.`;

export function buildTokenPrompt(
  customerPrompt: string,
  options?: {
    occasion?: string;
    material?: 'brass' | 'color';
  },
): string {
  const materialHint =
    options?.material === 'color'
      ? 'Colorful enamel coin design with vibrant fills.'
      : 'Polished brass coin with silver engraving lines.';

  const occasionHint = options?.occasion
    ? `This token celebrates: ${options.occasion}.`
    : '';

  return [SYSTEM_PREFIX, materialHint, occasionHint, `Customer's design vision: ${customerPrompt}`, STYLE_SUFFIX]
    .filter(Boolean)
    .join('\n');
}

export function buildRefinementPrompt(
  originalPrompt: string,
  refinement: string,
): string {
  return [
    SYSTEM_PREFIX,
    `Previous design: ${originalPrompt}`,
    `Customer's requested changes: ${refinement}`,
    'Apply the requested changes while keeping the overall token design intact.',
    STYLE_SUFFIX,
  ].join('\n');
}
```

- [ ] **Step 3: Create the adapter factory**

Create `app/lib/ai/adapter.ts`:

```typescript
import type {ImageGenerationProvider} from './types';

export function createImageProvider(env: {
  AI_IMAGE_PROVIDER?: string;
  OPENAI_API_KEY?: string;
}): ImageGenerationProvider {
  const provider = env.AI_IMAGE_PROVIDER || 'openai';

  switch (provider) {
    case 'openai': {
      // Dynamic import to avoid loading provider code when not needed
      const {OpenAIProvider} = require('./openai');
      return new OpenAIProvider(env.OPENAI_API_KEY!);
    }
    default:
      throw new Error(`Unknown AI image provider: ${provider}. Set AI_IMAGE_PROVIDER to 'openai'.`);
  }
}
```

- [ ] **Step 4: Run typecheck**

Run: `npm run typecheck`
Expected: PASS (adapter will have a type error for the require until openai.ts exists — that's expected and fixed in next task)

- [ ] **Step 5: Commit**

```bash
git add app/lib/ai/types.ts app/lib/ai/prompt-engine.ts app/lib/ai/adapter.ts
git commit -m "feat(custom-token): add AI provider interface, prompt engine, and adapter factory"
```

---

### Task 4: OpenAI Provider Implementation

**Files:**
- Create: `app/lib/ai/openai.ts`

- [ ] **Step 1: Implement the OpenAI provider**

```typescript
import type {
  GenerateImageRequest,
  GenerateImageResult,
  GeneratedImage,
  ImageGenerationProvider,
} from './types';

const OPENAI_IMAGES_URL = 'https://api.openai.com/v1/images/generations';

export class OpenAIProvider implements ImageGenerationProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is required for OpenAI provider');
    }
    this.apiKey = apiKey;
  }

  async generate(req: GenerateImageRequest): Promise<GenerateImageResult> {
    // DALL-E 3 only generates 1 image per call — parallelize for count > 1
    const promises = Array.from({length: req.count}, () =>
      this.callDallE(req),
    );
    const images = await Promise.all(promises);

    return {
      images,
      provider: 'openai',
      model: 'dall-e-3',
      cost: req.count * 4, // ~$0.04 per 1024x1024 in cents
    };
  }

  async healthCheck(): Promise<boolean> {
    try {
      const res = await fetch('https://api.openai.com/v1/models', {
        headers: {Authorization: `Bearer ${this.apiKey}`},
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  private async callDallE(req: GenerateImageRequest): Promise<GeneratedImage> {
    const res = await fetch(OPENAI_IMAGES_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: req.prompt,
        n: 1,
        size: req.size,
        style: req.style ?? 'natural',
        response_format: 'url',
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`OpenAI API error (${res.status}): ${error}`);
    }

    const data = (await res.json()) as {
      data: Array<{url: string; revised_prompt?: string}>;
    };

    return {
      url: data.data[0].url,
      revisedPrompt: data.data[0].revised_prompt,
    };
  }
}
```

- [ ] **Step 2: Update adapter factory to use proper import**

In `app/lib/ai/adapter.ts`, replace the dynamic require with a static import:

```typescript
import type {ImageGenerationProvider} from './types';
import {OpenAIProvider} from './openai';

export function createImageProvider(env: {
  AI_IMAGE_PROVIDER?: string;
  OPENAI_API_KEY?: string;
}): ImageGenerationProvider {
  const provider = env.AI_IMAGE_PROVIDER || 'openai';

  switch (provider) {
    case 'openai':
      return new OpenAIProvider(env.OPENAI_API_KEY!);
    default:
      throw new Error(`Unknown AI image provider: ${provider}. Set AI_IMAGE_PROVIDER to 'openai'.`);
  }
}
```

- [ ] **Step 3: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add app/lib/ai/openai.ts app/lib/ai/adapter.ts
git commit -m "feat(custom-token): add OpenAI/DALL-E 3 provider implementation"
```

---

### Task 5: Shopify Uploads Enhancement

**Files:**
- Modify: `app/lib/shopify-uploads.server.ts`

- [ ] **Step 1: Read the current file to understand exact structure**

Read `app/lib/shopify-uploads.server.ts` in full before modifying.

- [ ] **Step 2: Add a single-file upload function that returns the Shopify File GID**

Add a new exported function alongside the existing `uploadImagesToShopify`. The new function uploads a single file (or downloads from a URL) and returns both the hosted URL and the Shopify file GID:

```typescript
export interface ShopifyFileUploadResult {
  url: string;      // CDN URL of the hosted file
  fileId: string;   // Shopify file GID (e.g., gid://shopify/MediaImage/12345)
}

/**
 * Upload a single image to Shopify Files via staged uploads.
 * Accepts either a File object or a URL to download from.
 */
export async function uploadImageToShopifyFiles(
  input: File | {url: string; filename: string},
  env: Env,
): Promise<ShopifyFileUploadResult> {
  // If input is a URL, fetch the image first
  let file: File;
  if ('url' in input) {
    const res = await fetch(input.url);
    if (!res.ok) throw new Error(`Failed to fetch image from ${input.url}`);
    const blob = await res.blob();
    file = new File([blob], input.filename, {type: blob.type || 'image/png'});
  } else {
    file = input;
  }

  const urls = await uploadImagesToShopify([file], env);
  if (!urls.length) throw new Error('Upload failed: no URL returned');

  // The resource URL is the CDN URL. For the GID, we query Shopify's
  // fileCreate mutation which registers the staged upload as a file.
  const fileId = await registerFileInShopify(urls[0], file.name, env);

  return {url: urls[0], fileId};
}
```

Also add the `registerFileInShopify` helper that calls the Admin API `fileCreate` mutation to get a proper file GID:

```typescript
async function registerFileInShopify(
  resourceUrl: string,
  filename: string,
  env: Env,
): Promise<string> {
  const mutation = `#graphql
    mutation fileCreate($files: [FileCreateInput!]!) {
      fileCreate(files: $files) {
        files {
          id
          ... on MediaImage {
            id
            image {
              url
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const res = await fetch(
    `https://${env.PUBLIC_STORE_DOMAIN}/admin/api/2024-10/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': env.SHOPIFY_ADMIN_API_TOKEN!,
      },
      body: JSON.stringify({
        query: mutation,
        variables: {
          files: [{
            alt: `Custom token design: ${filename}`,
            contentType: 'IMAGE',
            originalSource: resourceUrl,
          }],
        },
      }),
    },
  );

  const json = (await res.json()) as any;
  const fileData = json?.data?.fileCreate;

  if (fileData?.userErrors?.length) {
    throw new Error(`Shopify file create error: ${fileData.userErrors[0].message}`);
  }

  return fileData.files[0].id;
}
```

- [ ] **Step 3: Add `resolveShopifyFileIds` helper to resolve stored IDs to CDN URLs**

This is critical — the session stores Shopify File GIDs but loaders need to resolve them to displayable CDN URLs. Add this function to `app/lib/shopify-uploads.server.ts`:

```typescript
/**
 * Resolve Shopify File GIDs to CDN URLs in batch.
 * Uses the Admin API `nodes` query to fetch multiple files at once.
 */
export async function resolveShopifyFileIds(
  ids: string[],
  env: Env,
): Promise<Record<string, string>> {
  if (!ids.length) return {};

  const query = `#graphql
    query ResolveFiles($ids: [ID!]!) {
      nodes(ids: $ids) {
        ... on MediaImage {
          id
          image {
            url
          }
        }
        ... on GenericFile {
          id
          url
        }
      }
    }
  `;

  const res = await fetch(
    `https://${env.PUBLIC_STORE_DOMAIN}/admin/api/2024-10/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': env.SHOPIFY_ADMIN_API_TOKEN!,
      },
      body: JSON.stringify({query, variables: {ids}}),
    },
  );

  const json = (await res.json()) as any;
  const result: Record<string, string> = {};

  for (const node of json?.data?.nodes ?? []) {
    if (node?.id) {
      const url = node.image?.url ?? node.url;
      if (url) result[node.id] = url;
    }
  }

  return result;
}
```

- [ ] **Step 4: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/lib/shopify-uploads.server.ts
git commit -m "feat(custom-token): add single-file upload with GID return and batch ID resolver"
```

---

### Task 6: Rate Limit via Shop Metafield

**Files:**
- Create: `app/lib/ai/rate-limit.server.ts`

- [ ] **Step 1: Create the rate limit module**

This module reads/increments a daily generation counter stored as a Shopify shop metafield.

```typescript
const METAFIELD_NAMESPACE = 'custom_token';
const METAFIELD_KEY = 'daily_generation_count';

interface DailyCount {
  date: string;  // YYYY-MM-DD
  count: number;
}

export async function checkAndIncrementDailyLimit(
  env: Env,
  incrementBy: number = 1,
): Promise<{allowed: boolean; current: number; limit: number}> {
  const limit = parseInt(env.AI_MAX_GENERATIONS_PER_DAY || '500', 10);
  const today = new Date().toISOString().split('T')[0];

  // Read current count
  const current = await readDailyCount(env);
  const effectiveCount = current.date === today ? current.count : 0;

  if (effectiveCount + incrementBy > limit) {
    return {allowed: false, current: effectiveCount, limit};
  }

  // Increment
  await writeDailyCount(env, {date: today, count: effectiveCount + incrementBy});
  return {allowed: true, current: effectiveCount + incrementBy, limit};
}

async function readDailyCount(env: Env): Promise<DailyCount> {
  const query = `#graphql
    query ShopMetafield {
      shop {
        metafield(namespace: "${METAFIELD_NAMESPACE}", key: "${METAFIELD_KEY}") {
          value
        }
      }
    }
  `;

  const res = await fetch(
    `https://${env.PUBLIC_STORE_DOMAIN}/admin/api/2024-10/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': env.SHOPIFY_ADMIN_API_TOKEN!,
      },
      body: JSON.stringify({query}),
    },
  );

  const json = (await res.json()) as any;
  const value = json?.data?.shop?.metafield?.value;

  if (!value) return {date: '', count: 0};

  try {
    return JSON.parse(value) as DailyCount;
  } catch {
    return {date: '', count: 0};
  }
}

async function writeDailyCount(env: Env, data: DailyCount): Promise<void> {
  const mutation = `#graphql
    mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields { id }
        userErrors { field message }
      }
    }
  `;

  await fetch(
    `https://${env.PUBLIC_STORE_DOMAIN}/admin/api/2024-10/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': env.SHOPIFY_ADMIN_API_TOKEN!,
      },
      body: JSON.stringify({
        query: mutation,
        variables: {
          metafields: [{
            namespace: METAFIELD_NAMESPACE,
            key: METAFIELD_KEY,
            type: 'json',
            value: JSON.stringify(data),
            ownerId: `gid://shopify/Shop`, // Shop-level metafield
          }],
        },
      }),
    },
  );
}
```

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add app/lib/ai/rate-limit.server.ts
git commit -m "feat(custom-token): add daily rate limit via shop metafield"
```

---

### Task 7: Shared Wizard Components

**Files:**
- Create: `app/components/custom-token/WizardProgress.tsx`
- Create: `app/components/custom-token/WizardNav.tsx`
- Create: `app/components/custom-token/MaterialSelector.tsx`
- Create: `app/components/custom-token/ImageUploader.tsx`

- [ ] **Step 1: Create WizardProgress component**

@design-system — dark theme, `text-white`, `border-white/[0.08]`, accent `#B8764F`.

```typescript
// app/components/custom-token/WizardProgress.tsx
import {Link} from 'react-router';

interface WizardProgressProps {
  steps: readonly string[];
  currentStep: string;
  completedSteps: string[];
  basePath: string; // e.g., '/custom-token/we-design'
}

export function WizardProgress({steps, currentStep, completedSteps, basePath}: WizardProgressProps) {
  const currentIndex = steps.indexOf(currentStep);

  return (
    <nav aria-label="Wizard progress" className="mb-xl">
      <ol className="flex items-center gap-sm">
        {steps.map((step, i) => {
          const isCompleted = completedSteps.includes(step);
          const isCurrent = step === currentStep;
          const isAccessible = isCompleted || isCurrent;

          return (
            <li key={step} className="flex items-center gap-sm">
              {i > 0 && (
                <div
                  className={`h-px w-8 ${
                    isCompleted ? 'bg-accent' : 'bg-white/[0.08]'
                  }`}
                />
              )}
              {isAccessible && !isCurrent ? (
                <Link
                  to={`${basePath}/${step}`}
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                    isCompleted
                      ? 'bg-accent text-white'
                      : 'border border-white/[0.15] text-white'
                  }`}
                  aria-label={`Step ${i + 1}: ${step}`}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {i + 1}
                </Link>
              ) : (
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                    isCurrent
                      ? 'border-2 border-accent text-accent'
                      : 'border border-white/[0.08] text-white/40'
                  }`}
                  aria-label={`Step ${i + 1}: ${step}`}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {i + 1}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
```

- [ ] **Step 2: Create WizardNav component**

```typescript
// app/components/custom-token/WizardNav.tsx
import {Link} from 'react-router';
import {Button} from '~/components/ui/Button';

interface WizardNavProps {
  backTo?: string;
  nextLabel?: string;
  isSubmitting?: boolean;
  disabled?: boolean;
}

export function WizardNav({backTo, nextLabel = 'Continue', isSubmitting = false, disabled = false}: WizardNavProps) {
  return (
    <div className="flex items-center justify-between mt-xl">
      {backTo ? (
        <Link to={backTo} className="text-white/50 hover:text-white transition-colors text-sm">
          ← Back
        </Link>
      ) : (
        <div />
      )}
      <Button
        type="submit"
        variant="primary"
        className="!bg-accent !text-white"
        disabled={disabled || isSubmitting}
      >
        {isSubmitting ? 'Saving...' : nextLabel}
      </Button>
    </div>
  );
}
```

- [ ] **Step 3: Create MaterialSelector component**

This component fetches variant data from the Shopify product to show material options with prices.

```typescript
// app/components/custom-token/MaterialSelector.tsx
interface MaterialOption {
  id: string;      // Variant GID
  label: string;   // 'Brass' | 'Color'
  value: 'brass' | 'color';
  price: string;   // Formatted price
  description: string;
}

interface MaterialSelectorProps {
  options: MaterialOption[];
  selected?: string;
  onChange: (value: string, variantId: string) => void;
}

export function MaterialSelector({options, selected, onChange}: MaterialSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.value, option.id)}
          className={`rounded-2xl border p-lg text-left transition-colors ${
            selected === option.value
              ? 'border-accent bg-accent/10'
              : 'border-white/[0.08] hover:border-white/[0.15]'
          }`}
          style={{
            background:
              selected === option.value
                ? undefined
                : 'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)',
          }}
        >
          <h3 className="text-white font-bold text-lg mb-xs">{option.label}</h3>
          <p className="text-white/50 text-sm mb-sm">{option.description}</p>
          <p className="text-accent font-semibold">{option.price}</p>
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Create ImageUploader component**

```typescript
// app/components/custom-token/ImageUploader.tsx
import {useCallback, useRef, useState} from 'react';

interface ImageUploaderProps {
  maxFiles?: number;
  maxSizeMB?: number;
  existingImages?: string[];  // URLs of already-uploaded images
  onUpload: (files: File[]) => void;
  uploading?: boolean;
}

export function ImageUploader({
  maxFiles = 5,
  maxSizeMB = 5,
  existingImages = [],
  onUpload,
  uploading = false,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const remaining = maxFiles - existingImages.length;

  const validateAndUpload = useCallback(
    (files: FileList | File[]) => {
      setError(null);
      const valid: File[] = [];

      for (const file of Array.from(files)) {
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
          setError('Only JPEG, PNG, and WebP images are accepted');
          return;
        }
        if (file.size > maxSizeMB * 1024 * 1024) {
          setError(`Each file must be under ${maxSizeMB}MB`);
          return;
        }
        valid.push(file);
      }

      if (valid.length > remaining) {
        setError(`You can upload ${remaining} more image${remaining !== 1 ? 's' : ''}`);
        return;
      }

      onUpload(valid);
    },
    [maxSizeMB, remaining, onUpload],
  );

  return (
    <div>
      <div
        className={`relative rounded-2xl border-2 border-dashed p-xl text-center transition-colors cursor-pointer ${
          dragActive
            ? 'border-accent bg-accent/5'
            : 'border-white/[0.15] hover:border-white/[0.25]'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          if (e.dataTransfer.files.length) validateAndUpload(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
        }}
        role="button"
        tabIndex={0}
        aria-label="Upload inspiration images"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) validateAndUpload(e.target.files);
            e.target.value = '';
          }}
          disabled={uploading || remaining <= 0}
        />
        <p className="text-white/50 text-sm">
          {uploading
            ? 'Uploading...'
            : remaining > 0
              ? `Drag & drop or click to upload (${remaining} remaining)`
              : 'Maximum images uploaded'}
        </p>
      </div>

      {error && <p className="text-red-400 text-sm mt-sm">{error}</p>}

      {existingImages.length > 0 && (
        <div className="flex gap-sm mt-md flex-wrap">
          {existingImages.map((url, i) => (
            <img
              key={i}
              src={url}
              alt={`Inspiration ${i + 1}`}
              className="h-20 w-20 rounded-lg object-cover border border-white/[0.08]"
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add app/components/custom-token/
git commit -m "feat(custom-token): add shared wizard components"
```

---

### Task 8: AI Preview & Refiner Components

**Files:**
- Create: `app/components/custom-token/DesignPreviewGrid.tsx`
- Create: `app/components/custom-token/DesignRefiner.tsx`
- Create: `app/components/custom-token/ReviewSummary.tsx`

- [ ] **Step 1: Create DesignPreviewGrid**

Displays 4 AI-generated token previews in a 2x2 grid. Customer clicks to select.

```typescript
// app/components/custom-token/DesignPreviewGrid.tsx
interface DesignPreviewGridProps {
  images: Array<{url: string; id: string}>;
  selectedId?: string;
  onSelect: (id: string) => void;
  loading?: boolean;
}

export function DesignPreviewGrid({images, selectedId, onSelect, loading}: DesignPreviewGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-md" aria-busy="true">
        {Array.from({length: 4}).map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-2xl border border-white/[0.08] animate-pulse"
            style={{background: 'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)'}}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-md">
      {images.map((image) => (
        <button
          key={image.id}
          type="button"
          onClick={() => onSelect(image.id)}
          className={`relative aspect-square rounded-2xl border-2 overflow-hidden transition-all ${
            selectedId === image.id
              ? 'border-accent ring-2 ring-accent/30'
              : 'border-white/[0.08] hover:border-white/[0.15]'
          }`}
        >
          <img
            src={image.url}
            alt="Generated token design option"
            className="h-full w-full object-cover"
          />
          {selectedId === image.id && (
            <div className="absolute top-sm right-sm bg-accent rounded-full p-xs">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create DesignRefiner**

```typescript
// app/components/custom-token/DesignRefiner.tsx
import {useState} from 'react';
import {Button} from '~/components/ui/Button';

interface DesignRefinerProps {
  currentDesignUrl: string;
  refinementsUsed: number;
  maxRefinements: number;
  onRefine: (prompt: string) => void;
  refining?: boolean;
}

export function DesignRefiner({
  currentDesignUrl,
  refinementsUsed,
  maxRefinements,
  onRefine,
  refining = false,
}: DesignRefinerProps) {
  const [prompt, setPrompt] = useState('');
  const remaining = maxRefinements - refinementsUsed;

  return (
    <div className="space-y-lg">
      <div className="relative aspect-square max-w-md mx-auto rounded-2xl overflow-hidden border border-white/[0.08]">
        <img
          src={currentDesignUrl}
          alt="Current token design"
          className="h-full w-full object-cover"
        />
      </div>

      {remaining > 0 ? (
        <div>
          <label htmlFor="refinement" className="block text-white text-sm font-medium mb-sm">
            What would you like to change? ({remaining} refinement{remaining !== 1 ? 's' : ''} remaining)
          </label>
          <textarea
            id="refinement"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder='e.g., "Make the eagle larger" or "Add a border around the edge"'
            maxLength={200}
            rows={3}
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-md py-sm text-white placeholder:text-white/30 focus:border-accent focus:outline-none"
          />
          <div className="flex items-center justify-between mt-sm">
            <span className="text-white/30 text-xs">{prompt.length}/200</span>
            <Button
              type="button"
              variant="secondary"
              className="!border-accent !text-accent"
              onClick={() => {
                onRefine(prompt);
                setPrompt('');
              }}
              disabled={!prompt.trim() || refining}
            >
              {refining ? 'Generating...' : 'Refine Design'}
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-white/50 text-sm text-center">
          Maximum refinements reached. You can proceed with this design.
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create ReviewSummary**

```typescript
// app/components/custom-token/ReviewSummary.tsx
interface ReviewItem {
  label: string;
  value: string;
  type?: 'text' | 'image';
}

interface ReviewSummaryProps {
  path: 'we-design' | 'you-design';
  items: ReviewItem[];
  variantPrice?: string;
}

export function ReviewSummary({path, items, variantPrice}: ReviewSummaryProps) {
  return (
    <div
      className="rounded-2xl border border-white/[0.08] overflow-hidden"
      style={{background: 'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)'}}
    >
      <div className="px-lg py-md border-b border-white/[0.08]">
        <span className="inline-block text-accent text-caption uppercase tracking-[0.25em] font-semibold">
          {path === 'we-design' ? 'We Design It For You' : 'You Design It'}
        </span>
        <h3 className="text-white font-bold text-lg mt-xs">Order Summary</h3>
      </div>

      <div className="divide-y divide-white/[0.05]">
        {items.map((item, i) => (
          <div key={i} className="px-lg py-md">
            <dt className="text-white/40 text-xs uppercase tracking-wider mb-xs">{item.label}</dt>
            {item.type === 'image' ? (
              <img
                src={item.value}
                alt={item.label}
                className="h-32 w-32 rounded-lg object-cover border border-white/[0.08]"
              />
            ) : (
              <dd className="text-white text-sm">{item.value}</dd>
            )}
          </div>
        ))}
      </div>

      {variantPrice && (
        <div className="px-lg py-md border-t border-white/[0.08]">
          <div className="flex items-center justify-between">
            <span className="text-white font-medium">Total</span>
            <span className="text-accent font-bold text-lg">{variantPrice}</span>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/components/custom-token/DesignPreviewGrid.tsx app/components/custom-token/DesignRefiner.tsx app/components/custom-token/ReviewSummary.tsx
git commit -m "feat(custom-token): add AI preview grid, refiner, and review summary components"
```

---

### Task 9: Layout Route & Landing Page

**Files:**
- Create: `app/routes/($locale).custom-token.tsx`
- Create: `app/routes/($locale).custom-token._index.tsx`

- [ ] **Step 1: Create the layout route**

The layout route provides shared wizard chrome (progress bar, back navigation) and reads the session state. It passes session data to child routes via `Outlet context`.

```typescript
// app/routes/($locale).custom-token.tsx
import {Outlet, useLoaderData, useLocation} from 'react-router';
import type {Route} from './+types/($locale).custom-token';
import {getCustomTokenSession, getCompletedSteps, getSteps} from '~/lib/custom-token-session';
import {WizardProgress} from '~/components/custom-token/WizardProgress';

export async function loader({context}: Route.LoaderArgs) {
  const sessionData = getCustomTokenSession(context.session);
  return {sessionData};
}

export type CustomTokenOutletContext = {
  sessionData: ReturnType<typeof getCustomTokenSession>;
};

export default function CustomTokenLayout() {
  const {sessionData} = useLoaderData<typeof loader>();
  const location = useLocation();

  // Derive current step from URL pathname
  // e.g., /custom-token/we-design/occasion → 'occasion'
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const currentStep = pathSegments.length >= 3 ? pathSegments[pathSegments.length - 1] : '';

  return (
    <div className="mx-auto max-w-3xl px-md py-2xl">
      {sessionData?.path && currentStep && (
        <WizardProgress
          steps={getSteps(sessionData.path)}
          currentStep={currentStep}
          completedSteps={getCompletedSteps(sessionData)}
          basePath={`/custom-token/${sessionData.path}`}
        />
      )}
      <Outlet context={{sessionData} satisfies CustomTokenOutletContext} />
    </div>
  );
}
```

- [ ] **Step 2: Create the landing page**

@design-system — Dark cards, accent text, eyebrow labels.

```typescript
// app/routes/($locale).custom-token._index.tsx
import {Form, redirect, useNavigation} from 'react-router';
import type {Route} from './+types/($locale).custom-token._index';
import {updateCustomTokenSession, clearCustomTokenSession} from '~/lib/custom-token-session';

export async function action({request, context}: Route.ActionArgs) {
  const formData = await request.formData();
  const path = formData.get('path') as 'we-design' | 'you-design';

  if (path !== 'we-design' && path !== 'you-design') {
    return {error: 'Please select a design path'};
  }

  // Clear any previous session and start fresh
  clearCustomTokenSession(context.session);
  updateCustomTokenSession(context.session, {
    path,
    startedAt: new Date().toISOString(),
  });

  const firstStep = path === 'we-design' ? 'occasion' : 'describe';
  return redirect(`/custom-token/${path}/${firstStep}`, {
    headers: {'Set-Cookie': await context.session.commit()},
  });
}

export default function CustomTokenLanding() {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <div>
      <div style={{textAlign: 'center', maxWidth: '42rem', marginLeft: 'auto', marginRight: 'auto', marginBottom: '3rem'}}>
        <span style={{display: 'inline-block', color: '#B8764F', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.25em', fontWeight: 600, marginBottom: '1rem'}}>
          Custom Tokens
        </span>
        <h1 style={{fontFamily: 'var(--font-display, serif)', fontSize: '2.5rem', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.1, marginBottom: '1rem'}}>
          Create Your Own Token
        </h1>
        <p style={{fontSize: '1.125rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.5)', maxWidth: '36rem', marginLeft: 'auto', marginRight: 'auto'}}>
          Design a one-of-a-kind recovery token that tells your unique story. Choose how you'd like to create it.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-lg">
        {/* We Design It */}
        <Form method="post">
          <input type="hidden" name="path" value="we-design" />
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full text-left rounded-2xl border border-white/[0.08] hover:border-accent/50 p-xl transition-all group"
            style={{background: 'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)'}}
          >
            <span className="inline-block text-accent text-caption uppercase tracking-[0.25em] font-semibold mb-sm">
              Option 1
            </span>
            <h2 className="text-white font-display text-xl font-bold mb-sm group-hover:text-accent transition-colors">
              We Design It For You
            </h2>
            <p className="text-white/50 text-sm leading-relaxed">
              Tell us about your vision and we'll create a custom design. Share inspiration images, describe what matters to you, and we'll handle the rest. We'll follow up via email with design proofs.
            </p>
          </button>
        </Form>

        {/* You Design It */}
        <Form method="post">
          <input type="hidden" name="path" value="you-design" />
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full text-left rounded-2xl border border-white/[0.08] hover:border-accent/50 p-xl transition-all group"
            style={{background: 'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)'}}
          >
            <span className="inline-block text-accent text-caption uppercase tracking-[0.25em] font-semibold mb-sm">
              Option 2
            </span>
            <h2 className="text-white font-display text-xl font-bold mb-sm group-hover:text-accent transition-colors">
              You Design It
            </h2>
            <p className="text-white/50 text-sm leading-relaxed">
              Use our AI-powered design studio to create your token. Describe what you want, preview generated designs, and refine until it's perfect. See your design come to life in real time.
            </p>
          </button>
        </Form>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Run dev server and verify both routes render**

Run: `npm run dev`
Navigate to `http://localhost:3000/custom-token` — verify landing page renders with two cards.

- [ ] **Step 4: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/routes/\(\$locale\).custom-token.tsx app/routes/\(\$locale\).custom-token._index.tsx
git commit -m "feat(custom-token): add layout route and landing page"
```

---

### Task 10: "We Design" Wizard Routes (Steps 1-4)

**Files:**
- Create: `app/routes/($locale).custom-token.we-design.occasion.tsx`
- Create: `app/routes/($locale).custom-token.we-design.description.tsx`
- Create: `app/routes/($locale).custom-token.we-design.material.tsx`
- Create: `app/routes/($locale).custom-token.we-design.engraving.tsx`

- [ ] **Step 1: Create the occasion step**

```typescript
// app/routes/($locale).custom-token.we-design.occasion.tsx
import {Form, redirect, useActionData, useOutletContext} from 'react-router';
import type {Route} from './+types/($locale).custom-token.we-design.occasion';
import {
  canProceedToStep,
  getCustomTokenSession,
  updateCustomTokenSession,
} from '~/lib/custom-token-session';
import {WizardNav} from '~/components/custom-token/WizardNav';
import type {CustomTokenOutletContext} from './($locale).custom-token';

const OCCASIONS = [
  {value: 'milestone', label: 'Sobriety Milestone', description: 'Celebrate a recovery anniversary or milestone date'},
  {value: 'memorial', label: 'Memorial', description: 'Honor someone's memory and their journey'},
  {value: 'gift', label: 'Custom Gift', description: 'A meaningful gift for someone special'},
  {value: 'organization', label: 'Organization / Group', description: 'For a recovery group, meeting, or organization'},
] as const;

export async function loader({context}: Route.LoaderArgs) {
  const session = getCustomTokenSession(context.session);
  if (!session || session.path !== 'we-design') {
    return redirect('/custom-token');
  }
  return {selectedOccasion: session.occasion};
}

export async function action({request, context}: Route.ActionArgs) {
  const formData = await request.formData();
  const occasion = formData.get('occasion') as string;

  if (!['milestone', 'memorial', 'gift', 'organization'].includes(occasion)) {
    return {error: 'Please select an occasion'};
  }

  updateCustomTokenSession(context.session, {occasion});
  return redirect('/custom-token/we-design/description', {
    headers: {'Set-Cookie': await context.session.commit()},
  });
}

export default function WeDesignOccasion() {
  const actionData = useActionData<typeof action>();
  const {sessionData} = useOutletContext<CustomTokenOutletContext>();

  return (
    <div>
      <div style={{marginBottom: '2rem'}}>
        <span style={{display: 'inline-block', color: '#B8764F', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.25em', fontWeight: 600, marginBottom: '0.5rem'}}>
          Step 1 of 5
        </span>
        <h2 style={{fontFamily: 'var(--font-display, serif)', fontSize: '1.875rem', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.2}}>
          What's the occasion?
        </h2>
        <p style={{fontSize: '1rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem'}}>
          Help us understand what this token celebrates.
        </p>
      </div>

      <Form method="post">
        <div className="space-y-md">
          {OCCASIONS.map((occ) => (
            <label
              key={occ.value}
              className={`block rounded-2xl border p-lg cursor-pointer transition-colors ${
                sessionData?.occasion === occ.value
                  ? 'border-accent bg-accent/10'
                  : 'border-white/[0.08] hover:border-white/[0.15]'
              }`}
              style={{
                background:
                  sessionData?.occasion === occ.value
                    ? undefined
                    : 'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)',
              }}
            >
              <input
                type="radio"
                name="occasion"
                value={occ.value}
                defaultChecked={sessionData?.occasion === occ.value}
                className="sr-only"
              />
              <h3 className="text-white font-bold">{occ.label}</h3>
              <p className="text-white/50 text-sm mt-xs">{occ.description}</p>
            </label>
          ))}
        </div>

        {actionData?.error && (
          <p className="text-red-400 text-sm mt-md">{actionData.error}</p>
        )}

        <WizardNav backTo="/custom-token" />
      </Form>
    </div>
  );
}
```

- [ ] **Step 2: Create the description step**

This step handles both text description and image uploads. Image uploads are handled via a separate `useFetcher` to avoid blocking the main form.

```typescript
// app/routes/($locale).custom-token.we-design.description.tsx
import {Form, redirect, useActionData, useFetcher, useLoaderData} from 'react-router';
import {useState} from 'react';
import type {Route} from './+types/($locale).custom-token.we-design.description';
import {getCustomTokenSession, updateCustomTokenSession, canProceedToStep} from '~/lib/custom-token-session';
import {WizardNav} from '~/components/custom-token/WizardNav';
import {ImageUploader} from '~/components/custom-token/ImageUploader';
import {uploadImageToShopifyFiles, resolveShopifyFileIds} from '~/lib/shopify-uploads.server';

export async function loader({context}: Route.LoaderArgs) {
  const session = getCustomTokenSession(context.session);
  if (!session || session.path !== 'we-design' || !canProceedToStep(session, 'description')) {
    return redirect('/custom-token/we-design/occasion');
  }
  // Resolve image IDs to URLs for display
  const imageIds = session.inspirationImageIds ?? [];
  const resolvedUrls = imageIds.length
    ? await resolveShopifyFileIds(imageIds, context.env)
    : {};
  const inspirationImageUrls = imageIds.map((id) => resolvedUrls[id]).filter(Boolean);

  return {
    description: session.description ?? '',
    inspirationImageIds: session.inspirationImageIds ?? [],
    inspirationImageUrls,
  };
}

export async function action({request, context}: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get('intent');

  if (intent === 'upload') {
    // Handle image upload
    const files = formData.getAll('files') as File[];
    const results = await Promise.all(
      files.map((f) => uploadImageToShopifyFiles(f, context.env)),
    );
    const session = getCustomTokenSession(context.session)!;
    const existingIds = session.inspirationImageIds ?? [];
    const newIds = results.map((r) => r.fileId);
    updateCustomTokenSession(context.session, {
      inspirationImageIds: [...existingIds, ...newIds],
    });
    return Response.json(
      {uploadedIds: newIds},
      {headers: {'Set-Cookie': await context.session.commit()}},
    );
  }

  // Handle form submission (continue to next step)
  const description = formData.get('description') as string;
  if (!description || description.length < 10) {
    return {error: 'Please provide at least 10 characters describing your design'};
  }
  if (description.length > 500) {
    return {error: 'Description must be under 500 characters'};
  }

  updateCustomTokenSession(context.session, {description});
  return redirect('/custom-token/we-design/material', {
    headers: {'Set-Cookie': await context.session.commit()},
  });
}

export default function WeDesignDescription() {
  const {description, inspirationImageIds} = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const uploadFetcher = useFetcher();
  const [text, setText] = useState(description);
  const uploading = uploadFetcher.state !== 'idle';

  return (
    <div>
      <div style={{marginBottom: '2rem'}}>
        <span style={{display: 'inline-block', color: '#B8764F', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.25em', fontWeight: 600, marginBottom: '0.5rem'}}>
          Step 2 of 5
        </span>
        <h2 style={{fontFamily: 'var(--font-display, serif)', fontSize: '1.875rem', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.2}}>
          Describe your design
        </h2>
        <p style={{fontSize: '1rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem'}}>
          Tell us what you envision. Upload any inspiration images to help us understand your style.
        </p>
      </div>

      <Form method="post" className="space-y-lg">
        <div>
          <label htmlFor="description" className="block text-white text-sm font-medium mb-sm">
            Design Description
          </label>
          <textarea
            id="description"
            name="description"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Describe what you'd like on your token — symbols, text, themes, style..."
            maxLength={500}
            rows={5}
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-md py-sm text-white placeholder:text-white/30 focus:border-accent focus:outline-none"
          />
          <span className="text-white/30 text-xs">{text.length}/500</span>
        </div>

        <div>
          <label className="block text-white text-sm font-medium mb-sm">
            Inspiration Images (optional)
          </label>
          <ImageUploader
            maxFiles={5}
            existingImages={inspirationImageUrls}
            uploading={uploading}
            onUpload={(files) => {
              const fd = new FormData();
              fd.set('intent', 'upload');
              files.forEach((f) => fd.append('files', f));
              uploadFetcher.submit(fd, {method: 'POST', encType: 'multipart/form-data'});
            }}
          />
        </div>

        {actionData?.error && (
          <p className="text-red-400 text-sm">{actionData.error}</p>
        )}

        <WizardNav backTo="/custom-token/we-design/occasion" />
      </Form>
    </div>
  );
}
```

- [ ] **Step 3: Create the material step**

```typescript
// app/routes/($locale).custom-token.we-design.material.tsx
import {Form, redirect, useActionData, useLoaderData} from 'react-router';
import {useState} from 'react';
import type {Route} from './+types/($locale).custom-token.we-design.material';
import {getCustomTokenSession, updateCustomTokenSession, canProceedToStep} from '~/lib/custom-token-session';
import {WizardNav} from '~/components/custom-token/WizardNav';
import {MaterialSelector} from '~/components/custom-token/MaterialSelector';

// GraphQL query for the custom token product variants
const CUSTOM_TOKEN_PRODUCT_QUERY = `#graphql
  query CustomTokenProduct($handle: String!) {
    product(handle: $handle) {
      id
      variants(first: 10) {
        nodes {
          id
          title
          price {
            amount
            currencyCode
          }
          availableForSale
        }
      }
    }
  }
` as const;

export async function loader({context}: Route.LoaderArgs) {
  const session = getCustomTokenSession(context.session);
  if (!session || session.path !== 'we-design' || !canProceedToStep(session, 'material')) {
    return redirect('/custom-token/we-design/description');
  }

  // Fetch product variants to display material options with prices
  const {product} = await context.storefront.query(CUSTOM_TOKEN_PRODUCT_QUERY, {
    variables: {handle: 'custom-token'},
  });

  const variants = product?.variants?.nodes ?? [];
  const materialOptions = variants
    .filter((v: any) => v.availableForSale)
    .map((v: any) => ({
      id: v.id,
      label: v.title.includes('We Design') ? v.title.replace('We Design - ', '') : v.title,
      value: v.title.toLowerCase().includes('brass') ? 'brass' : 'color',
      price: `$${parseFloat(v.price.amount).toFixed(2)}`,
      description: v.title.toLowerCase().includes('brass')
        ? 'Classic polished brass with silver engraving'
        : 'Vibrant color enamel with detailed design',
    }));

  return {materialOptions, selectedMaterial: session.material};
}

export async function action({request, context}: Route.ActionArgs) {
  const formData = await request.formData();
  const material = formData.get('material') as string;
  const variantId = formData.get('variantId') as string;

  if (!material || !variantId) {
    return {error: 'Please select a material'};
  }

  updateCustomTokenSession(context.session, {
    material: material as 'brass' | 'color',
    variantId,
  });
  return redirect('/custom-token/we-design/engraving', {
    headers: {'Set-Cookie': await context.session.commit()},
  });
}

export default function WeDesignMaterial() {
  const {materialOptions, selectedMaterial} = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [selected, setSelected] = useState<{material: string; variantId: string} | null>(
    selectedMaterial ? {material: selectedMaterial, variantId: ''} : null,
  );

  return (
    <div>
      <div style={{marginBottom: '2rem'}}>
        <span style={{display: 'inline-block', color: '#B8764F', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.25em', fontWeight: 600, marginBottom: '0.5rem'}}>
          Step 3 of 5
        </span>
        <h2 style={{fontFamily: 'var(--font-display, serif)', fontSize: '1.875rem', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.2}}>
          Choose your material
        </h2>
      </div>

      <Form method="post">
        <input type="hidden" name="material" value={selected?.material ?? ''} />
        <input type="hidden" name="variantId" value={selected?.variantId ?? ''} />

        <MaterialSelector
          options={materialOptions}
          selected={selected?.material}
          onChange={(value, variantId) => setSelected({material: value, variantId})}
        />

        {actionData?.error && (
          <p className="text-red-400 text-sm mt-md">{actionData.error}</p>
        )}

        <WizardNav backTo="/custom-token/we-design/description" />
      </Form>
    </div>
  );
}
```

- [ ] **Step 4: Create the engraving step**

Reuse existing `EngravingData` patterns but adapted for the wizard context.

```typescript
// app/routes/($locale).custom-token.we-design.engraving.tsx
import {Form, redirect, useActionData, useLoaderData} from 'react-router';
import {useState} from 'react';
import type {Route} from './+types/($locale).custom-token.we-design.engraving';
import {getCustomTokenSession, updateCustomTokenSession, canProceedToStep} from '~/lib/custom-token-session';
import {WizardNav} from '~/components/custom-token/WizardNav';

export async function loader({context}: Route.LoaderArgs) {
  const session = getCustomTokenSession(context.session);
  if (!session || session.path !== 'we-design' || !canProceedToStep(session, 'engraving')) {
    return redirect('/custom-token/we-design/material');
  }
  return {engraving: session.engraving ?? {}};
}

export async function action({request, context}: Route.ActionArgs) {
  const formData = await request.formData();
  const name = (formData.get('name') as string)?.trim() ?? '';
  const years = (formData.get('years') as string)?.trim() ?? '';
  const cleanDate = (formData.get('cleanDate') as string)?.trim() ?? '';
  const note = (formData.get('note') as string)?.trim() ?? '';

  // At least one engraving field should be filled
  if (!name && !years && !cleanDate) {
    return {error: 'Please fill in at least one engraving field'};
  }

  updateCustomTokenSession(context.session, {
    engraving: {name, years, cleanDate, note},
  });
  return redirect('/custom-token/we-design/review', {
    headers: {'Set-Cookie': await context.session.commit()},
  });
}

export default function WeDesignEngraving() {
  const {engraving} = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <div>
      <div style={{marginBottom: '2rem'}}>
        <span style={{display: 'inline-block', color: '#B8764F', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.25em', fontWeight: 600, marginBottom: '0.5rem'}}>
          Step 4 of 5
        </span>
        <h2 style={{fontFamily: 'var(--font-display, serif)', fontSize: '1.875rem', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.2}}>
          Engraving Details
        </h2>
        <p style={{fontSize: '1rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem'}}>
          What text should be engraved on your token?
        </p>
      </div>

      <Form method="post" className="space-y-lg">
        <div>
          <label htmlFor="name" className="block text-white text-sm font-medium mb-sm">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            maxLength={10}
            defaultValue={engraving.name}
            placeholder="e.g., John D."
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-md py-sm text-white placeholder:text-white/30 focus:border-accent focus:outline-none"
          />
          <span className="text-white/30 text-xs">Max 10 characters</span>
        </div>

        <div>
          <label htmlFor="years" className="block text-white text-sm font-medium mb-sm">Years</label>
          <input
            id="years"
            name="years"
            type="text"
            maxLength={3}
            defaultValue={engraving.years}
            placeholder="e.g., 5"
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-md py-sm text-white placeholder:text-white/30 focus:border-accent focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="cleanDate" className="block text-white text-sm font-medium mb-sm">Clean Date</label>
          <input
            id="cleanDate"
            name="cleanDate"
            type="date"
            defaultValue={engraving.cleanDate}
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-md py-sm text-white focus:border-accent focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="note" className="block text-white text-sm font-medium mb-sm">Special Note (optional, private)</label>
          <textarea
            id="note"
            name="note"
            maxLength={200}
            rows={3}
            defaultValue={engraving.note}
            placeholder="Any special instructions for the engraver..."
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-md py-sm text-white placeholder:text-white/30 focus:border-accent focus:outline-none"
          />
        </div>

        {actionData?.error && (
          <p className="text-red-400 text-sm">{actionData.error}</p>
        )}

        <WizardNav backTo="/custom-token/we-design/material" />
      </Form>
    </div>
  );
}
```

- [ ] **Step 5: Run typecheck and dev server**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add app/routes/\(\$locale\).custom-token.we-design.*.tsx
git commit -m "feat(custom-token): add We Design wizard steps 1-4"
```

---

### Task 11: "We Design" Review Step (Step 5) with Cart Integration

**Files:**
- Create: `app/routes/($locale).custom-token.we-design.review.tsx`

- [ ] **Step 1: Create the review step with CartForm**

This step reads all session data, displays the summary, collects contact email, and submits to cart with line item properties. Also fires Klaviyo event.

```typescript
// app/routes/($locale).custom-token.we-design.review.tsx
import {Form, redirect, useActionData, useLoaderData} from 'react-router';
import {useState, useRef, useEffect} from 'react';
import type {Route} from './+types/($locale).custom-token.we-design.review';
import {getCustomTokenSession, updateCustomTokenSession, clearCustomTokenSession, canProceedToStep} from '~/lib/custom-token-session';
import {ReviewSummary} from '~/components/custom-token/ReviewSummary';
import {WizardNav} from '~/components/custom-token/WizardNav';
import {Button} from '~/components/ui/Button';
import {CartForm} from '@shopify/hydrogen';

export async function loader({context}: Route.LoaderArgs) {
  const session = getCustomTokenSession(context.session);
  if (!session || session.path !== 'we-design' || !canProceedToStep(session, 'review')) {
    return redirect('/custom-token/we-design/engraving');
  }
  return {session};
}

export async function action({request, context}: Route.ActionArgs) {
  const formData = await request.formData();
  const contactEmail = (formData.get('contactEmail') as string)?.trim();

  if (!contactEmail || !contactEmail.includes('@')) {
    return {error: 'Please enter a valid email address so we can send design proofs'};
  }

  const session = getCustomTokenSession(context.session)!;
  updateCustomTokenSession(context.session, {contactEmail});

  // Build line item attributes
  const attributes: Array<{key: string; value: string}> = [
    {key: 'Custom Design Path', value: 'We Design It For You'},
  ];
  if (session.occasion) attributes.push({key: 'Occasion', value: session.occasion});
  if (session.description) attributes.push({key: 'Design Description', value: session.description});
  if (session.material) attributes.push({key: 'Material', value: session.material === 'brass' ? 'Brass' : 'Color'});
  if (session.engraving?.name) attributes.push({key: 'Engraving Name', value: session.engraving.name});
  if (session.engraving?.years) attributes.push({key: 'Engraving Years', value: session.engraving.years});
  if (session.engraving?.cleanDate) attributes.push({key: 'Engraving Clean Date', value: session.engraving.cleanDate});
  if (session.engraving?.note) attributes.push({key: '_Engraving Note', value: session.engraving.note});
  if (session.inspirationImageIds?.length) {
    attributes.push({key: '_Inspiration Images', value: session.inspirationImageIds.join(', ')});
  }
  attributes.push({key: '_Contact Email', value: contactEmail});

  // Fire Klaviyo event (fire-and-forget)
  try {
    const {getKlaviyoClient} = await import('~/lib/klaviyo.server');
    const klaviyo = getKlaviyoClient(context.env);
    klaviyo.createEvent({
      event: 'Custom Token Order - We Design',
      email: contactEmail,
      properties: {
        occasion: session.occasion,
        description: session.description,
        material: session.material,
        engravingName: session.engraving?.name,
        engravingYears: session.engraving?.years,
        engravingCleanDate: session.engraving?.cleanDate,
        engravingNote: session.engraving?.note,
        inspirationImages: session.inspirationImageIds?.join(', '),
      },
    });
  } catch {
    // Fail silently — order data is in line item properties as backup
  }

  // Clear wizard session
  clearCustomTokenSession(context.session);

  // Return attributes for client-side CartForm submission
  return Response.json(
    {attributes, variantId: session.variantId},
    {headers: {'Set-Cookie': await context.session.commit()}},
  );
}

export default function WeDesignReview() {
  const {session} = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [email, setEmail] = useState(session.contactEmail ?? '');

  const reviewItems = [
    {label: 'Occasion', value: session.occasion ?? ''},
    {label: 'Design Description', value: session.description ?? ''},
    {label: 'Material', value: session.material === 'brass' ? 'Brass' : 'Color'},
    ...(session.engraving?.name ? [{label: 'Engraving Name', value: session.engraving.name}] : []),
    ...(session.engraving?.years ? [{label: 'Engraving Years', value: session.engraving.years}] : []),
    ...(session.engraving?.cleanDate ? [{label: 'Engraving Clean Date', value: session.engraving.cleanDate}] : []),
  ].filter((item) => item.value);

  // If action returned attributes, submit to cart
  if (actionData?.attributes && actionData?.variantId) {
    return (
      <CartFormSubmit
        variantId={actionData.variantId}
        attributes={actionData.attributes}
      />
    );
  }

  return (
    <div>
      <div style={{marginBottom: '2rem'}}>
        <span style={{display: 'inline-block', color: '#B8764F', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.25em', fontWeight: 600, marginBottom: '0.5rem'}}>
          Step 5 of 5
        </span>
        <h2 style={{fontFamily: 'var(--font-display, serif)', fontSize: '1.875rem', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.2}}>
          Review & Order
        </h2>
        <p style={{fontSize: '1rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem'}}>
          Review your custom token details. We'll follow up at your email with design proofs.
        </p>
      </div>

      <div className="space-y-lg">
        <ReviewSummary path="we-design" items={reviewItems} />

        <Form method="post" className="space-y-lg">
          <div>
            <label htmlFor="contactEmail" className="block text-white text-sm font-medium mb-sm">
              Contact Email (for design follow-up)
            </label>
            <input
              id="contactEmail"
              name="contactEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-md py-sm text-white placeholder:text-white/30 focus:border-accent focus:outline-none"
            />
          </div>

          {actionData?.error && (
            <p className="text-red-400 text-sm">{actionData.error}</p>
          )}

          <WizardNav backTo="/custom-token/we-design/engraving" nextLabel="Add to Cart" />
        </Form>
      </div>
    </div>
  );
}

function CartFormSubmit({variantId, attributes}: {variantId: string; attributes: Array<{key: string; value: string}>}) {
  const submittedRef = useRef(false);

  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.LinesAdd}
      inputs={{lines: [{merchandiseId: variantId, quantity: 1, attributes}]}}
    >
      {(fetcher) => {
        useEffect(() => {
          if (fetcher.state === 'idle' && !fetcher.data && !submittedRef.current) {
            submittedRef.current = true;
            fetcher.submit(null);
          }
        }, [fetcher]);

        return (
          <div className="text-center py-2xl">
            <p className="text-white text-lg">Adding to cart...</p>
          </div>
        );
      }}
    </CartForm>
  );
}
```

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add app/routes/\(\$locale\).custom-token.we-design.review.tsx
git commit -m "feat(custom-token): add We Design review step with cart integration and Klaviyo"
```

---

### Task 12: "You Design" Wizard Routes (Steps 1-3 — AI Flow)

**Files:**
- Create: `app/routes/($locale).custom-token.you-design.describe.tsx`
- Create: `app/routes/($locale).custom-token.you-design.preview.tsx`
- Create: `app/routes/($locale).custom-token.you-design.refine.tsx`

- [ ] **Step 1: Create the describe step**

```typescript
// app/routes/($locale).custom-token.you-design.describe.tsx
import {Form, redirect, useActionData, useLoaderData} from 'react-router';
import {useState} from 'react';
import type {Route} from './+types/($locale).custom-token.you-design.describe';
import {getCustomTokenSession, updateCustomTokenSession} from '~/lib/custom-token-session';
import {WizardNav} from '~/components/custom-token/WizardNav';

export async function loader({context}: Route.LoaderArgs) {
  const session = getCustomTokenSession(context.session);
  if (!session || session.path !== 'you-design') {
    return redirect('/custom-token');
  }
  return {designPrompt: session.designPrompt ?? ''};
}

export async function action({request, context}: Route.ActionArgs) {
  const formData = await request.formData();
  const theme = (formData.get('theme') as string)?.trim();
  const symbols = (formData.get('symbols') as string)?.trim() ?? '';
  const text = (formData.get('text') as string)?.trim() ?? '';
  const style = (formData.get('style') as string)?.trim() ?? '';

  if (!theme || theme.length < 3) {
    return {error: 'Please describe a theme (at least 3 characters)'};
  }

  const designPrompt = [theme, symbols && `Symbols: ${symbols}`, text && `Text: ${text}`, style && `Style: ${style}`]
    .filter(Boolean)
    .join('. ');

  updateCustomTokenSession(context.session, {designPrompt});
  return redirect('/custom-token/you-design/preview', {
    headers: {'Set-Cookie': await context.session.commit()},
  });
}

export default function YouDesignDescribe() {
  const {designPrompt} = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <div>
      <div style={{marginBottom: '2rem'}}>
        <span style={{display: 'inline-block', color: '#B8764F', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.25em', fontWeight: 600, marginBottom: '0.5rem'}}>
          Step 1 of 5
        </span>
        <h2 style={{fontFamily: 'var(--font-display, serif)', fontSize: '1.875rem', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.2}}>
          Describe your design
        </h2>
        <p style={{fontSize: '1rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem'}}>
          Tell us what you want on your token. We'll generate preview designs for you to choose from.
        </p>
      </div>

      <Form method="post" className="space-y-lg">
        <div>
          <label htmlFor="theme" className="block text-white text-sm font-medium mb-sm">
            Theme / Main Idea *
          </label>
          <textarea
            id="theme"
            name="theme"
            rows={3}
            maxLength={200}
            placeholder='e.g., "An eagle soaring over mountains with a sunrise, representing freedom in recovery"'
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-md py-sm text-white placeholder:text-white/30 focus:border-accent focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="symbols" className="block text-white text-sm font-medium mb-sm">
            Symbols (optional)
          </label>
          <input
            id="symbols"
            name="symbols"
            type="text"
            maxLength={200}
            placeholder='e.g., "eagle, mountains, sunrise, AA triangle"'
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-md py-sm text-white placeholder:text-white/30 focus:border-accent focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="text" className="block text-white text-sm font-medium mb-sm">
            Text on Token (optional)
          </label>
          <input
            id="text"
            name="text"
            type="text"
            maxLength={100}
            placeholder='e.g., "5 Years" or "One Day At A Time"'
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-md py-sm text-white placeholder:text-white/30 focus:border-accent focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="style" className="block text-white text-sm font-medium mb-sm">
            Style Preference (optional)
          </label>
          <input
            id="style"
            name="style"
            type="text"
            maxLength={200}
            placeholder='e.g., "minimalist", "ornate Victorian", "modern geometric"'
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-md py-sm text-white placeholder:text-white/30 focus:border-accent focus:outline-none"
          />
        </div>

        {actionData?.error && (
          <p className="text-red-400 text-sm">{actionData.error}</p>
        )}

        <WizardNav backTo="/custom-token" />
      </Form>
    </div>
  );
}
```

- [ ] **Step 2: Create the AI preview step**

This is the core AI generation step. The action generates 4 previews, uploads them to Shopify Files, and stores the IDs in session.

```typescript
// app/routes/($locale).custom-token.you-design.preview.tsx
import {Form, redirect, useActionData, useFetcher, useLoaderData} from 'react-router';
import {useState, useEffect} from 'react';
import type {Route} from './+types/($locale).custom-token.you-design.preview';
import {getCustomTokenSession, updateCustomTokenSession, canProceedToStep} from '~/lib/custom-token-session';
import {DesignPreviewGrid} from '~/components/custom-token/DesignPreviewGrid';
import {WizardNav} from '~/components/custom-token/WizardNav';
import {createImageProvider} from '~/lib/ai/adapter';
import {buildTokenPrompt} from '~/lib/ai/prompt-engine';
import {uploadImageToShopifyFiles} from '~/lib/shopify-uploads.server';
import {checkAndIncrementDailyLimit} from '~/lib/ai/rate-limit.server';

export async function loader({context}: Route.LoaderArgs) {
  const session = getCustomTokenSession(context.session);
  if (!session || session.path !== 'you-design' || !canProceedToStep(session, 'preview')) {
    return redirect('/custom-token/you-design/describe');
  }
  return {
    previewImageIds: session.previewImageIds ?? [],
    selectedPreviewId: session.selectedPreviewId,
    designPrompt: session.designPrompt,
  };
}

export async function action({request, context}: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get('intent');

  if (intent === 'generate') {
    const session = getCustomTokenSession(context.session)!;

    // Check rate limits
    const sessionLimit = parseInt(context.env.AI_MAX_GENERATIONS_PER_SESSION || '7', 10);
    if ((session.generationCount ?? 0) + 4 > sessionLimit) {
      return {error: 'Generation limit reached for this session.'};
    }

    const dailyCheck = await checkAndIncrementDailyLimit(context.env, 4);
    if (!dailyCheck.allowed) {
      return {error: 'Design service temporarily unavailable. Please try again later.'};
    }

    // Generate 4 previews
    const provider = createImageProvider(context.env);
    const prompt = buildTokenPrompt(session.designPrompt!, {material: session.material});

    let result;
    try {
      result = await provider.generate({prompt, count: 4, size: '1024x1024'});
    } catch (e: any) {
      return {error: `Generation failed: ${e.message}. Please try again.`};
    }

    // Upload all previews to Shopify Files
    const uploadResults = await Promise.all(
      result.images.map((img, i) =>
        uploadImageToShopifyFiles(
          {url: img.url, filename: `custom-token-preview-${i + 1}.png`},
          context.env,
        ),
      ),
    );

    const previewImageIds = uploadResults.map((r) => r.fileId);
    updateCustomTokenSession(context.session, {
      previewImageIds,
      generationCount: (session.generationCount ?? 0) + 4,
    });

    return Response.json(
      {previewImageIds, previewUrls: uploadResults.map((r) => r.url)},
      {headers: {'Set-Cookie': await context.session.commit()}},
    );
  }

  if (intent === 'select') {
    const selectedPreviewId = formData.get('selectedPreviewId') as string;
    if (!selectedPreviewId) return {error: 'Please select a design'};

    updateCustomTokenSession(context.session, {selectedPreviewId});
    return redirect('/custom-token/you-design/refine', {
      headers: {'Set-Cookie': await context.session.commit()},
    });
  }

  return {error: 'Unknown action'};
}

export default function YouDesignPreview() {
  const {previewImageIds, selectedPreviewId, designPrompt} = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const generateFetcher = useFetcher();
  const [selected, setSelected] = useState(selectedPreviewId ?? '');
  const [images, setImages] = useState<Array<{url: string; id: string}>>([]);

  const isGenerating = generateFetcher.state !== 'idle';
  const hasImages = images.length > 0 || previewImageIds.length > 0;

  // Update images when generation completes
  useEffect(() => {
    if (generateFetcher.data?.previewUrls) {
      const newImages = generateFetcher.data.previewUrls.map((url: string, i: number) => ({
        url,
        id: generateFetcher.data.previewImageIds[i],
      }));
      setImages(newImages);
    }
  }, [generateFetcher.data]);

  return (
    <div>
      <div style={{marginBottom: '2rem'}}>
        <span style={{display: 'inline-block', color: '#B8764F', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.25em', fontWeight: 600, marginBottom: '0.5rem'}}>
          Step 2 of 5
        </span>
        <h2 style={{fontFamily: 'var(--font-display, serif)', fontSize: '1.875rem', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.2}}>
          {hasImages ? 'Choose your design' : 'Generate designs'}
        </h2>
        <p style={{fontSize: '1rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem'}}>
          {hasImages
            ? 'Select the design you like best. You can refine it in the next step.'
            : `We'll generate 4 token designs based on: "${designPrompt}"`}
        </p>
      </div>

      {!hasImages && (
        <generateFetcher.Form method="post" className="text-center py-xl">
          <input type="hidden" name="intent" value="generate" />
          <button
            type="submit"
            disabled={isGenerating}
            className="rounded-2xl border border-accent bg-accent/10 px-xl py-lg text-accent font-bold text-lg hover:bg-accent/20 transition-colors disabled:opacity-50"
          >
            {isGenerating ? 'Generating designs... (this may take 15-30 seconds)' : 'Generate 4 Token Designs'}
          </button>
        </generateFetcher.Form>
      )}

      {(hasImages || isGenerating) && (
        <DesignPreviewGrid
          images={images}
          selectedId={selected}
          onSelect={setSelected}
          loading={isGenerating}
        />
      )}

      {(actionData?.error || generateFetcher.data?.error) && (
        <p className="text-red-400 text-sm mt-md">{actionData?.error || generateFetcher.data?.error}</p>
      )}

      {hasImages && (
        <Form method="post" className="mt-lg">
          <input type="hidden" name="intent" value="select" />
          <input type="hidden" name="selectedPreviewId" value={selected} />
          <WizardNav backTo="/custom-token/you-design/describe" nextLabel="Refine This Design" disabled={!selected} />
        </Form>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create the refine step**

```typescript
// app/routes/($locale).custom-token.you-design.refine.tsx
import {Form, redirect, useActionData, useFetcher, useLoaderData} from 'react-router';
import {useState, useEffect} from 'react';
import type {Route} from './+types/($locale).custom-token.you-design.refine';
import {getCustomTokenSession, updateCustomTokenSession, canProceedToStep} from '~/lib/custom-token-session';
import {DesignRefiner} from '~/components/custom-token/DesignRefiner';
import {WizardNav} from '~/components/custom-token/WizardNav';
import {createImageProvider} from '~/lib/ai/adapter';
import {buildRefinementPrompt} from '~/lib/ai/prompt-engine';
import {uploadImageToShopifyFiles, resolveShopifyFileIds} from '~/lib/shopify-uploads.server';
import {checkAndIncrementDailyLimit} from '~/lib/ai/rate-limit.server';

const MAX_REFINEMENTS = 3;

export async function loader({context}: Route.LoaderArgs) {
  const session = getCustomTokenSession(context.session);
  if (!session || session.path !== 'you-design' || !canProceedToStep(session, 'refine')) {
    return redirect('/custom-token/you-design/preview');
  }
  // Resolve the current design (final or selected preview) to a URL for display
  const currentId = session.finalDesignId ?? session.selectedPreviewId;
  let currentDesignUrl = '';
  if (currentId) {
    const resolved = await resolveShopifyFileIds([currentId], context.env);
    currentDesignUrl = resolved[currentId] ?? '';
  }

  return {
    selectedPreviewId: session.selectedPreviewId,
    finalDesignId: session.finalDesignId,
    refinementPrompts: session.refinementPrompts ?? [],
    generationCount: session.generationCount ?? 0,
    currentDesignUrl,
  };
}

export async function action({request, context}: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get('intent');

  if (intent === 'refine') {
    const refinement = (formData.get('refinement') as string)?.trim();
    if (!refinement) return {error: 'Please describe what to change'};

    const session = getCustomTokenSession(context.session)!;
    const refinements = session.refinementPrompts ?? [];

    if (refinements.length >= MAX_REFINEMENTS) {
      return {error: 'Maximum refinements reached'};
    }

    // Check rate limits
    const sessionLimit = parseInt(context.env.AI_MAX_GENERATIONS_PER_SESSION || '7', 10);
    if ((session.generationCount ?? 0) + 1 > sessionLimit) {
      return {error: 'Generation limit reached for this session.'};
    }

    const dailyCheck = await checkAndIncrementDailyLimit(context.env, 1);
    if (!dailyCheck.allowed) {
      return {error: 'Design service temporarily unavailable.'};
    }

    const provider = createImageProvider(context.env);
    const prompt = buildRefinementPrompt(session.designPrompt!, refinement);

    let result;
    try {
      result = await provider.generate({prompt, count: 1, size: '1024x1024'});
    } catch (e: any) {
      return {error: `Refinement failed: ${e.message}`};
    }

    const uploadResult = await uploadImageToShopifyFiles(
      {url: result.images[0].url, filename: `custom-token-refined-${refinements.length + 1}.png`},
      context.env,
    );

    updateCustomTokenSession(context.session, {
      finalDesignId: uploadResult.fileId,
      refinementPrompts: [...refinements, refinement],
      generationCount: (session.generationCount ?? 0) + 1,
    });

    return Response.json(
      {newDesignUrl: uploadResult.url, newDesignId: uploadResult.fileId},
      {headers: {'Set-Cookie': await context.session.commit()}},
    );
  }

  if (intent === 'continue') {
    const session = getCustomTokenSession(context.session)!;
    // If no refinements were made, use the selected preview as final
    if (!session.finalDesignId) {
      updateCustomTokenSession(context.session, {
        finalDesignId: session.selectedPreviewId,
      });
    }
    return redirect('/custom-token/you-design/material', {
      headers: {'Set-Cookie': await context.session.commit()},
    });
  }

  return {error: 'Unknown action'};
}

export default function YouDesignRefine() {
  const {selectedPreviewId, finalDesignId, refinementPrompts, generationCount, currentDesignUrl: initialUrl} = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const refineFetcher = useFetcher();
  const [currentDesignUrl, setCurrentDesignUrl] = useState(initialUrl);

  const isRefining = refineFetcher.state !== 'idle';

  useEffect(() => {
    if (refineFetcher.data?.newDesignUrl) {
      setCurrentDesignUrl(refineFetcher.data.newDesignUrl);
    }
  }, [refineFetcher.data]);

  return (
    <div>
      <div style={{marginBottom: '2rem'}}>
        <span style={{display: 'inline-block', color: '#B8764F', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.25em', fontWeight: 600, marginBottom: '0.5rem'}}>
          Step 3 of 5
        </span>
        <h2 style={{fontFamily: 'var(--font-display, serif)', fontSize: '1.875rem', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.2}}>
          Refine your design
        </h2>
        <p style={{fontSize: '1rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem'}}>
          Happy with this design? Continue to the next step. Want changes? Describe them below.
        </p>
      </div>

      <DesignRefiner
        currentDesignUrl={currentDesignUrl}
        refinementsUsed={refinementPrompts.length}
        maxRefinements={MAX_REFINEMENTS}
        refining={isRefining}
        onRefine={(prompt) => {
          const fd = new FormData();
          fd.set('intent', 'refine');
          fd.set('refinement', prompt);
          refineFetcher.submit(fd, {method: 'POST'});
        }}
      />

      {(actionData?.error || refineFetcher.data?.error) && (
        <p className="text-red-400 text-sm mt-md">{actionData?.error || refineFetcher.data?.error}</p>
      )}

      <Form method="post" className="mt-lg">
        <input type="hidden" name="intent" value="continue" />
        <WizardNav backTo="/custom-token/you-design/preview" nextLabel="Continue with This Design" />
      </Form>
    </div>
  );
}
```

- [ ] **Step 4: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/routes/\(\$locale\).custom-token.you-design.describe.tsx app/routes/\(\$locale\).custom-token.you-design.preview.tsx app/routes/\(\$locale\).custom-token.you-design.refine.tsx
git commit -m "feat(custom-token): add You Design wizard steps 1-3 with AI generation"
```

---

### Task 13: "You Design" Material & Review Steps (Steps 4-5)

**Files:**
- Create: `app/routes/($locale).custom-token.you-design.material.tsx`
- Create: `app/routes/($locale).custom-token.you-design.review.tsx`

- [ ] **Step 1: Create material step (full implementation)**

```typescript
// app/routes/($locale).custom-token.you-design.material.tsx
import {Form, redirect, useActionData, useLoaderData} from 'react-router';
import {useState} from 'react';
import type {Route} from './+types/($locale).custom-token.you-design.material';
import {getCustomTokenSession, updateCustomTokenSession, canProceedToStep} from '~/lib/custom-token-session';
import {WizardNav} from '~/components/custom-token/WizardNav';
import {MaterialSelector} from '~/components/custom-token/MaterialSelector';

const CUSTOM_TOKEN_PRODUCT_QUERY = `#graphql
  query CustomTokenProduct($handle: String!) {
    product(handle: $handle) {
      id
      variants(first: 10) {
        nodes {
          id
          title
          price {
            amount
            currencyCode
          }
          availableForSale
        }
      }
    }
  }
` as const;

export async function loader({context}: Route.LoaderArgs) {
  const session = getCustomTokenSession(context.session);
  if (!session || session.path !== 'you-design' || !canProceedToStep(session, 'material')) {
    return redirect('/custom-token/you-design/refine');
  }

  const {product} = await context.storefront.query(CUSTOM_TOKEN_PRODUCT_QUERY, {
    variables: {handle: 'custom-token'},
  });

  const variants = product?.variants?.nodes ?? [];
  const materialOptions = variants
    .filter((v: any) => v.availableForSale)
    .map((v: any) => ({
      id: v.id,
      label: v.title.includes('You Design') ? v.title.replace('You Design - ', '') : v.title,
      value: v.title.toLowerCase().includes('brass') ? 'brass' : 'color',
      price: `$${parseFloat(v.price.amount).toFixed(2)}`,
      description: v.title.toLowerCase().includes('brass')
        ? 'Classic polished brass with silver engraving'
        : 'Vibrant color enamel with detailed design',
    }));

  return {materialOptions, selectedMaterial: session.material};
}

export async function action({request, context}: Route.ActionArgs) {
  const formData = await request.formData();
  const material = formData.get('material') as string;
  const variantId = formData.get('variantId') as string;

  if (!material || !variantId) {
    return {error: 'Please select a material'};
  }

  updateCustomTokenSession(context.session, {
    material: material as 'brass' | 'color',
    variantId,
  });
  return redirect('/custom-token/you-design/review', {
    headers: {'Set-Cookie': await context.session.commit()},
  });
}

export default function YouDesignMaterial() {
  const {materialOptions, selectedMaterial} = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [selected, setSelected] = useState<{material: string; variantId: string} | null>(
    selectedMaterial ? {material: selectedMaterial, variantId: ''} : null,
  );

  return (
    <div>
      <div style={{marginBottom: '2rem'}}>
        <span style={{display: 'inline-block', color: '#B8764F', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.25em', fontWeight: 600, marginBottom: '0.5rem'}}>
          Step 4 of 5
        </span>
        <h2 style={{fontFamily: 'var(--font-display, serif)', fontSize: '1.875rem', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.2}}>
          Choose your material
        </h2>
      </div>

      <Form method="post">
        <input type="hidden" name="material" value={selected?.material ?? ''} />
        <input type="hidden" name="variantId" value={selected?.variantId ?? ''} />

        <MaterialSelector
          options={materialOptions}
          selected={selected?.material}
          onChange={(value, variantId) => setSelected({material: value, variantId})}
        />

        {actionData?.error && (
          <p className="text-red-400 text-sm mt-md">{actionData.error}</p>
        )}

        <WizardNav backTo="/custom-token/you-design/refine" />
      </Form>
    </div>
  );
}
```

- [ ] **Step 2: Create review step with CartForm (full implementation)**

```typescript
// app/routes/($locale).custom-token.you-design.review.tsx
import {Form, redirect, useActionData, useLoaderData} from 'react-router';
import {useEffect, useRef} from 'react';
import type {Route} from './+types/($locale).custom-token.you-design.review';
import {getCustomTokenSession, clearCustomTokenSession, canProceedToStep} from '~/lib/custom-token-session';
import {resolveShopifyFileIds} from '~/lib/shopify-uploads.server';
import {ReviewSummary} from '~/components/custom-token/ReviewSummary';
import {WizardNav} from '~/components/custom-token/WizardNav';
import {CartForm} from '@shopify/hydrogen';

export async function loader({context}: Route.LoaderArgs) {
  const session = getCustomTokenSession(context.session);
  if (!session || session.path !== 'you-design' || !canProceedToStep(session, 'review')) {
    return redirect('/custom-token/you-design/material');
  }

  // Resolve final design ID to URL for display
  let finalDesignUrl = '';
  if (session.finalDesignId) {
    const resolved = await resolveShopifyFileIds([session.finalDesignId], context.env);
    finalDesignUrl = resolved[session.finalDesignId] ?? '';
  }

  return {session, finalDesignUrl};
}

export async function action({request, context}: Route.ActionArgs) {
  const session = getCustomTokenSession(context.session)!;

  // Resolve final design ID to URL for line item property
  let finalDesignUrl = '';
  if (session.finalDesignId) {
    const resolved = await resolveShopifyFileIds([session.finalDesignId], context.env);
    finalDesignUrl = resolved[session.finalDesignId] ?? '';
  }

  // Build line item attributes
  const attributes: Array<{key: string; value: string}> = [
    {key: 'Custom Design Path', value: 'You Design It'},
    {key: 'Design Description', value: session.designPrompt ?? ''},
    {key: 'Material', value: session.material === 'brass' ? 'Brass' : 'Color'},
  ];
  if (finalDesignUrl) {
    attributes.push({key: 'Final Design Image', value: finalDesignUrl});
  }
  attributes.push({key: '_Design Prompt', value: session.designPrompt ?? ''});
  attributes.push({key: '_Refinement History', value: JSON.stringify(session.refinementPrompts ?? [])});
  attributes.push({key: '_AI Provider', value: 'openai/dall-e-3'});
  attributes.push({key: '_Generation Cost', value: `$${((session.generationCount ?? 0) * 0.04).toFixed(2)}`});

  // Fire Klaviyo event (fire-and-forget)
  try {
    const {getKlaviyoClient} = await import('~/lib/klaviyo.server');
    const klaviyo = getKlaviyoClient(context.env);
    klaviyo.createEvent({
      event: 'Custom Token Order - You Design',
      email: 'admin@recoverytokenstore.com', // Admin notification
      properties: {
        designPrompt: session.designPrompt,
        material: session.material,
        finalDesignUrl,
        refinementHistory: JSON.stringify(session.refinementPrompts ?? []),
        generationCount: session.generationCount,
        aiProvider: 'openai/dall-e-3',
      },
    });
  } catch {
    // Fail silently — order data is in line item properties as backup
  }

  // Clear wizard session
  clearCustomTokenSession(context.session);

  return Response.json(
    {attributes, variantId: session.variantId},
    {headers: {'Set-Cookie': await context.session.commit()}},
  );
}

export default function YouDesignReview() {
  const {session, finalDesignUrl} = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const reviewItems = [
    {label: 'Design Description', value: session.designPrompt ?? ''},
    {label: 'Material', value: session.material === 'brass' ? 'Brass' : 'Color'},
    ...(finalDesignUrl ? [{label: 'Final Design', value: finalDesignUrl, type: 'image' as const}] : []),
    ...(session.refinementPrompts?.length
      ? [{label: 'Refinements Made', value: `${session.refinementPrompts.length} refinement(s)`}]
      : []),
  ].filter((item) => item.value);

  // If action returned attributes, auto-submit to cart
  if (actionData?.attributes && actionData?.variantId) {
    return (
      <CartFormAutoSubmit
        variantId={actionData.variantId}
        attributes={actionData.attributes}
      />
    );
  }

  return (
    <div>
      <div style={{marginBottom: '2rem'}}>
        <span style={{display: 'inline-block', color: '#B8764F', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.25em', fontWeight: 600, marginBottom: '0.5rem'}}>
          Step 5 of 5
        </span>
        <h2 style={{fontFamily: 'var(--font-display, serif)', fontSize: '1.875rem', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.2}}>
          Review & Order
        </h2>
        <p style={{fontSize: '1rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem'}}>
          Review your custom token design. Once ordered, our team will engrave this design and ship your token.
        </p>
      </div>

      <div className="space-y-lg">
        <ReviewSummary path="you-design" items={reviewItems} />

        <Form method="post">
          <WizardNav backTo="/custom-token/you-design/material" nextLabel="Add to Cart" />
        </Form>
      </div>
    </div>
  );
}

function CartFormAutoSubmit({variantId, attributes}: {variantId: string; attributes: Array<{key: string; value: string}>}) {
  const submittedRef = useRef(false);

  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.LinesAdd}
      inputs={{lines: [{merchandiseId: variantId, quantity: 1, attributes}]}}
    >
      {(fetcher) => {
        useEffect(() => {
          if (fetcher.state === 'idle' && !fetcher.data && !submittedRef.current) {
            submittedRef.current = true;
            fetcher.submit(null);
          }
        }, [fetcher]);

        return (
          <div className="text-center py-2xl">
            <p className="text-white text-lg">Adding to cart...</p>
          </div>
        );
      }}
    </CartForm>
  );
}
```

- [ ] **Step 3: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add app/routes/\(\$locale\).custom-token.you-design.material.tsx app/routes/\(\$locale\).custom-token.you-design.review.tsx
git commit -m "feat(custom-token): add You Design material and review steps"
```

---

### Task 14: Homepage CTA Integration

**Files:**
- Modify: `app/routes/($locale)._index.tsx`

- [ ] **Step 1: Read the current homepage to find the right insertion point**

Read `app/routes/($locale)._index.tsx` and identify where to add a "Create Custom Token" CTA. Look for the hero section or featured sections area.

- [ ] **Step 2: Add a CTA section**

Add a new section (after the hero or in the featured section) with a link to `/custom-token`. Follow the existing `SectionCard` pattern with dark gradient styling:

```tsx
<Link
  to="/custom-token"
  className="block rounded-2xl border border-white/[0.08] hover:border-accent/50 p-xl transition-all group"
  style={{background: 'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)'}}
>
  <span className="inline-block text-accent text-caption uppercase tracking-[0.25em] font-semibold mb-sm">
    New
  </span>
  <h3 className="text-white font-display text-xl font-bold mb-sm group-hover:text-accent transition-colors">
    Create a Custom Token
  </h3>
  <p className="text-white/50 text-sm">
    Design a one-of-a-kind recovery token — we'll bring your vision to life.
  </p>
</Link>
```

- [ ] **Step 3: Run dev server and verify CTA renders on homepage**

Run: `npm run dev`
Verify the CTA appears and links to `/custom-token`.

- [ ] **Step 4: Commit**

```bash
git add app/routes/\(\$locale\)._index.tsx
git commit -m "feat(custom-token): add Create Custom Token CTA to homepage"
```

---

### Task 15: End-to-End Testing & Polish

- [ ] **Step 1: Run full typecheck**

Run: `npm run typecheck`
Expected: PASS with no errors

- [ ] **Step 2: Run linter**

Run: `npm run lint`
Fix any lint errors.

- [ ] **Step 3: Manual smoke test — "We Design" flow**

Run: `npm run dev`
1. Navigate to `/custom-token`
2. Click "We Design It For You"
3. Select an occasion → Continue
4. Enter a description → Continue
5. Select a material → Continue
6. Enter engraving details → Continue
7. Enter email, verify review summary → Add to Cart
8. Verify cart drawer opens with correct line items

- [ ] **Step 4: Manual smoke test — "You Design" flow**

1. Navigate to `/custom-token`
2. Click "You Design It"
3. Enter design prompt → Continue
4. Click "Generate 4 Token Designs" (requires valid OPENAI_API_KEY in .env)
5. Select a design → Continue
6. Optionally refine → Continue with design
7. Select material → Continue
8. Review and add to cart

- [ ] **Step 5: Verify Shopify order line item properties**

Check the Shopify admin order view to confirm all custom attributes appear correctly on the line item.

- [ ] **Step 6: Commit any fixes**

```bash
git add -A
git commit -m "fix(custom-token): polish and fix issues from smoke testing"
```

---

### Task 16: Feature Branch & Oxygen Preview Deployment

- [ ] **Step 1: Create feature branch**

```bash
git checkout -b feature/custom-tokens
```

- [ ] **Step 2: Push to trigger Oxygen preview deployment**

```bash
git push -u origin feature/custom-tokens
```

- [ ] **Step 3: Verify GitHub Actions runs**

Check GitHub Actions for the Oxygen deployment workflow. It should trigger automatically on the push.

- [ ] **Step 4: Get preview URL**

Check the GitHub Actions run output or Shopify admin (Hydrogen > Settings > Deployments) for the preview URL.

- [ ] **Step 5: Set environment variables in Oxygen preview**

In Shopify admin (Hydrogen > Store > Settings > Environments), add for the preview environment:
- `AI_IMAGE_PROVIDER=openai`
- `OPENAI_API_KEY=sk-preview-...` (your preview API key)
- `AI_MAX_GENERATIONS_PER_SESSION=7`
- `AI_MAX_GENERATIONS_PER_DAY=20`

- [ ] **Step 6: Test on preview URL**

Navigate to the preview URL and run through both flows to verify everything works in the Oxygen environment.

- [ ] **Step 7: Share preview URL for review**

Share the preview deployment URL with stakeholders for feedback.
