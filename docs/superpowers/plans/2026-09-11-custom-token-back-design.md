# Custom Token Back-of-Coin Design — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let customers design the back of their custom AI token — pick a standard preset or customize it with the same AI pipeline used for the front — while both images reach the shop owner via cart line-item attributes, with a bootstrapped test harness protecting the existing front-only flow from regressions.

**Architecture:** Insert one new wizard step (`you-design/back`) between the existing `refine` and `review` steps. The new step's route file is entirely new and calls the *same* shared generation/upload/rate-limit functions the front already uses (no shared-function signatures change — only filenames and session field names passed at each call site differ). `custom-token-session.ts` gets additive `back*` fields and a 6th step in `YOU_DESIGN_STEPS`. `you-design.review.tsx` is extended (not rewritten) to read/display/attribute both sides. Three existing front-only route files get a one-line touch each (a redirect target, and step-count label text) — these are called out explicitly since the spec's framing was "front routes untouched," and this is the one unavoidable exception, covered by regression tests.

**Tech Stack:** React Router v7 (route loaders/actions), Vitest + `@testing-library/react` (new — bootstrapped in Task 1), existing DALL·E 3 provider (`app/lib/ai/`), Shopify Admin API staged uploads (`app/lib/shopify-uploads.server.ts`).

**Spec:** `docs/superpowers/specs/2026-09-11-custom-token-back-design.md`

## Global Constraints

- Front's cart attribute key **must stay exactly** `'Final Design Image'` — no renaming (spec decision, avoids breaking downstream Klaviyo/Shopify Flow automations keyed on that string).
- Rate-limit budget is **shared** across front + back — both sides increment the same `session.generationCount`, still capped at `AI_MAX_GENERATIONS_PER_SESSION` (default 7 total, not 7 each).
- No shared AI/upload/rate-limit **function signatures** change. Back-side calls reuse the existing functions as-is, differing only in the filename string and which session fields they write to.
- New UI (`BackPresetSelector`, `you-design.back.tsx`) follows the dark-theme design system already used by sibling wizard files (`MaterialSelector.tsx`, `DesignRefiner.tsx`) — same inline-style tokens (`#B8764F` accent, `rgba(255,255,255,0.08)` borders, dark gradient cards).
- Test files live under a new top-level `test/` directory, **not** colocated inside `app/routes/` — `app/routes/routes.ts` uses `flatRoutes()` file-based routing with no ignore pattern configured, so a `*.test.tsx` file dropped into `app/routes/` risks being registered as a real route.
- Every new/changed behavior gets a test before or alongside the implementation (TDD); every existing behavior this plan touches gets a characterization test *before* it's touched (regression baseline).

---

### Task 1: Bootstrap Vitest + characterize `custom-token-session.ts`

No test runner exists in this repo today (`package.json` has no vitest/jest). This task wires one up and writes the first characterization test, which doubles as proof the harness works and as the regression baseline for the session helpers Task 5 will modify.

**Files:**
- Modify: `package.json` (add devDependencies + `test`/`test:watch` scripts)
- Create: `vitest.config.ts`
- Create: `test/setup.ts`
- Create: `test/helpers/fake-session.ts`
- Test: `test/lib/custom-token-session.test.ts`

**Interfaces:**
- Produces: `createFakeSession(initial?: Record<string, unknown>)` from `test/helpers/fake-session.ts` — returns an object with `get(key)`, `set(key, value)`, `unset(key)`, `has(key)`, `flash()`, `commit(): Promise<string>`, satisfying the subset of `AppSession` that `custom-token-session.ts` and every route loader/action under test actually calls. All later test tasks import this.

- [ ] **Step 1: Install test dependencies**

```bash
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 2: Add test scripts to `package.json`**

In the `"scripts"` block, add:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: Create `vitest.config.ts`**

```typescript
import {defineConfig} from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: 'node',
    environmentMatchGlobs: [['test/components/**', 'jsdom']],
    setupFiles: ['./test/setup.ts'],
    include: ['test/**/*.test.{ts,tsx}'],
  },
});
```

- [ ] **Step 4: Create `test/setup.ts`**

```typescript
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 5: Create `test/helpers/fake-session.ts`**

```typescript
export function createFakeSession(initial: Record<string, unknown> = {}) {
  const store = new Map(Object.entries(initial));
  return {
    get: (key: string) => store.get(key),
    set: (key: string, value: unknown) => store.set(key, value),
    unset: (key: string) => store.delete(key),
    has: (key: string) => store.has(key),
    flash: () => {},
    commit: async () => 'mock-cookie',
  };
}
```

- [ ] **Step 6: Write the failing characterization test**

Create `test/lib/custom-token-session.test.ts`:

```typescript
import {describe, it, expect} from 'vitest';
import {createFakeSession} from '../helpers/fake-session';
import {
  getCustomTokenSession,
  updateCustomTokenSession,
  clearCustomTokenSession,
  getSteps,
  getCompletedSteps,
  canProceedToStep,
  type CustomTokenSession,
} from '~/lib/custom-token-session';

describe('custom-token-session', () => {
  it('round-trips data through get/update/clear', () => {
    const session = createFakeSession();
    expect(getCustomTokenSession(session as any)).toBeNull();

    updateCustomTokenSession(session as any, {path: 'you-design', designPrompt: 'a phoenix'});
    expect(getCustomTokenSession(session as any)).toEqual({
      path: 'you-design',
      designPrompt: 'a phoenix',
    });

    updateCustomTokenSession(session as any, {material: 'brass'});
    expect(getCustomTokenSession(session as any)).toEqual({
      path: 'you-design',
      designPrompt: 'a phoenix',
      material: 'brass',
    });

    clearCustomTokenSession(session as any);
    expect(getCustomTokenSession(session as any)).toBeNull();
  });

  it('returns the current 5-step you-design order', () => {
    expect(getSteps('you-design')).toEqual([
      'describe',
      'material',
      'preview',
      'refine',
      'review',
    ]);
  });

  it('marks you-design steps completed as fields are filled in', () => {
    const data: CustomTokenSession = {
      path: 'you-design',
      designPrompt: 'a phoenix',
      material: 'brass',
      variantId: 'gid://shopify/ProductVariant/1',
      selectedPreviewId: 'gid://shopify/MediaImage/1',
      finalDesignId: 'gid://shopify/MediaImage/2',
    };
    expect(getCompletedSteps(data)).toEqual(['describe', 'material', 'preview', 'refine']);
  });

  it('blocks access to review until every prior you-design step is completed', () => {
    const partial: CustomTokenSession = {path: 'you-design', designPrompt: 'a phoenix'};
    expect(canProceedToStep(partial, 'review')).toBe(false);

    const complete: CustomTokenSession = {
      path: 'you-design',
      designPrompt: 'a phoenix',
      material: 'brass',
      variantId: 'gid://shopify/ProductVariant/1',
      selectedPreviewId: 'gid://shopify/MediaImage/1',
      finalDesignId: 'gid://shopify/MediaImage/2',
    };
    expect(canProceedToStep(complete, 'review')).toBe(true);
  });
});
```

- [ ] **Step 7: Run the tests and confirm they pass**

Run: `npm run test`
Expected: PASS (4 tests) — this characterizes today's real, already-implemented behavior; it's a regression baseline, not new functionality, so it should pass immediately once the harness is wired correctly. If it fails, the harness setup (Step 1-5) is broken, not the source code.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json vitest.config.ts test/setup.ts test/helpers/fake-session.ts test/lib/custom-token-session.test.ts
git commit -m "test: bootstrap Vitest and characterize custom-token-session"
```

---

### Task 2: Characterize `shopify-uploads.server.ts`

**Files:**
- Test: `test/lib/shopify-uploads.server.test.ts`

**Interfaces:**
- Consumes: `uploadImageToShopifyFiles(input, env)` and `resolveShopifyFileIds(ids, env)` from `app/lib/shopify-uploads.server.ts` (existing, unmodified).

- [ ] **Step 1: Write the failing test**

Create `test/lib/shopify-uploads.server.test.ts`:

```typescript
import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {uploadImageToShopifyFiles, resolveShopifyFileIds} from '~/lib/shopify-uploads.server';

const env = {
  SHOPIFY_ADMIN_API_TOKEN: 'test-token',
  PUBLIC_STORE_DOMAIN: 'https://example.myshopify.com',
} as any;

describe('shopify-uploads.server', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('stages, uploads, and registers a base64 image as a Shopify File', async () => {
    (fetch as any)
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: {
              stagedUploadsCreate: {
                stagedTargets: [
                  {
                    url: 'https://staged.example.com/upload',
                    resourceUrl: 'https://staged.example.com/resource',
                    parameters: [{name: 'key', value: 'abc'}],
                  },
                ],
                userErrors: [],
              },
            },
          }),
        ),
      )
      .mockResolvedValueOnce(new Response('', {status: 200}))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: {
              fileCreate: {
                files: [{id: 'gid://shopify/MediaImage/999'}],
                userErrors: [],
              },
            },
          }),
        ),
      );

    const result = await uploadImageToShopifyFiles(
      {b64Data: Buffer.from('fake-image-bytes').toString('base64'), filename: 'test.png'},
      env,
    );

    expect(result).toEqual({url: 'https://staged.example.com/resource', fileId: 'gid://shopify/MediaImage/999'});
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it('resolves Shopify File GIDs to CDN URLs', async () => {
    (fetch as any).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          data: {
            nodes: [
              {id: 'gid://shopify/MediaImage/1', image: {url: 'https://cdn.shopify.com/1.png'}},
              {id: 'gid://shopify/MediaImage/2', url: 'https://cdn.shopify.com/2.png'},
            ],
          },
        }),
      ),
    );

    const result = await resolveShopifyFileIds(
      ['gid://shopify/MediaImage/1', 'gid://shopify/MediaImage/2'],
      env,
    );

    expect(result).toEqual({
      'gid://shopify/MediaImage/1': 'https://cdn.shopify.com/1.png',
      'gid://shopify/MediaImage/2': 'https://cdn.shopify.com/2.png',
    });
  });

  it('returns an empty map when given no ids, without calling fetch', async () => {
    const result = await resolveShopifyFileIds([], env);
    expect(result).toEqual({});
    expect(fetch).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run the tests and confirm they pass**

Run: `npm run test -- shopify-uploads.server`
Expected: PASS (3 tests)

- [ ] **Step 3: Commit**

```bash
git add test/lib/shopify-uploads.server.test.ts
git commit -m "test: characterize shopify-uploads.server upload/resolve flow"
```

---

### Task 3: Characterize `rate-limit.server.ts`

**Files:**
- Test: `test/lib/rate-limit.server.test.ts`

**Interfaces:**
- Consumes: `checkAndIncrementDailyLimit(env, incrementBy?)` from `app/lib/ai/rate-limit.server.ts` (existing, unmodified).

- [ ] **Step 1: Write the failing test**

Create `test/lib/rate-limit.server.test.ts`:

```typescript
import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {checkAndIncrementDailyLimit} from '~/lib/ai/rate-limit.server';

const env = {
  SHOPIFY_ADMIN_API_TOKEN: 'test-token',
  PUBLIC_STORE_DOMAIN: 'https://example.myshopify.com',
  AI_MAX_GENERATIONS_PER_DAY: '5',
} as any;

function metafieldResponse(value: string | null) {
  return new Response(
    JSON.stringify({data: {shop: {metafield: value ? {value} : null}}}),
  );
}

function mutationResponse() {
  return new Response(JSON.stringify({data: {metafieldsSet: {metafields: [], userErrors: []}}}));
}

describe('checkAndIncrementDailyLimit', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('allows and increments when under the daily limit', async () => {
    const today = new Date().toISOString().split('T')[0];
    (fetch as any)
      .mockResolvedValueOnce(metafieldResponse(JSON.stringify({date: today, count: 2})))
      .mockResolvedValueOnce(mutationResponse());

    const result = await checkAndIncrementDailyLimit(env, 1);

    expect(result).toEqual({allowed: true, current: 3, limit: 5});
  });

  it('blocks when incrementing would exceed the daily limit', async () => {
    const today = new Date().toISOString().split('T')[0];
    (fetch as any).mockResolvedValueOnce(metafieldResponse(JSON.stringify({date: today, count: 5})));

    const result = await checkAndIncrementDailyLimit(env, 1);

    expect(result).toEqual({allowed: false, current: 5, limit: 5});
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('resets the count when the stored date is not today', async () => {
    (fetch as any)
      .mockResolvedValueOnce(metafieldResponse(JSON.stringify({date: '2020-01-01', count: 5})))
      .mockResolvedValueOnce(mutationResponse());

    const result = await checkAndIncrementDailyLimit(env, 1);

    expect(result).toEqual({allowed: true, current: 1, limit: 5});
  });
});
```

- [ ] **Step 2: Run the tests and confirm they pass**

Run: `npm run test -- rate-limit.server`
Expected: PASS (3 tests)

- [ ] **Step 3: Commit**

```bash
git add test/lib/rate-limit.server.test.ts
git commit -m "test: characterize checkAndIncrementDailyLimit boundary behavior"
```

---

### Task 4: Characterize `you-design.review.tsx` action (front-only baseline)

This is the primary regression guard for the whole project: it pins today's exact cart attributes for a front-only session, before Task 14 touches this file at all.

**Files:**
- Create: `test/helpers/fake-env.ts`
- Test: `test/routes/custom-token-you-design-review.test.ts`

**Interfaces:**
- Produces: `createFakeEnv(overrides?)` from `test/helpers/fake-env.ts` — a plain object with the env keys route loaders/actions read (`PUBLIC_STORE_DOMAIN`, `SHOPIFY_ADMIN_API_TOKEN`, `AI_MAX_GENERATIONS_PER_SESSION`, `AI_MAX_GENERATIONS_PER_DAY`, `OPENAI_API_KEY`, `AI_IMAGE_PROVIDER`), merged with `overrides`. Used by every route test task from here on.
- Consumes: `action` exported from `app/routes/($locale).custom-token.you-design.review.tsx` (existing, unmodified in this task).

- [ ] **Step 1: Create `test/helpers/fake-env.ts`**

```typescript
export function createFakeEnv(overrides: Record<string, unknown> = {}) {
  return {
    PUBLIC_STORE_DOMAIN: 'https://example.myshopify.com',
    SHOPIFY_ADMIN_API_TOKEN: 'test-admin-token',
    AI_MAX_GENERATIONS_PER_SESSION: '7',
    AI_MAX_GENERATIONS_PER_DAY: '500',
    OPENAI_API_KEY: 'test-openai-key',
    AI_IMAGE_PROVIDER: 'openai',
    ...overrides,
  };
}
```

- [ ] **Step 2: Write the failing characterization test**

Create `test/routes/custom-token-you-design-review.test.ts`:

```typescript
import {describe, it, expect, vi} from 'vitest';
import {createFakeSession} from '../helpers/fake-session';
import {createFakeEnv} from '../helpers/fake-env';

vi.mock('~/lib/klaviyo.server', () => ({
  getKlaviyoClient: () => ({createEvent: vi.fn()}),
}));

vi.mock('~/lib/shopify-uploads.server', () => ({
  resolveShopifyFileIds: vi.fn(async (ids: string[]) =>
    Object.fromEntries(ids.map((id) => [id, `https://cdn.shopify.com/${id.split('/').pop()}.png`])),
  ),
}));

import {action} from '../../app/routes/($locale).custom-token.you-design.review';

function buildRequest() {
  return new Request('https://example.com/custom-token/you-design/review', {method: 'POST'});
}

describe('you-design.review action — front-only baseline', () => {
  it('builds the exact cart attributes for a front-only session', async () => {
    const session = createFakeSession({
      customToken: {
        path: 'you-design',
        designPrompt: 'A rising phoenix with laurel leaves',
        material: 'brass',
        variantId: 'gid://shopify/ProductVariant/1',
        finalDesignId: 'gid://shopify/MediaImage/front-1',
        refinementPrompts: ['make the wings bigger'],
        generationCount: 2,
      },
    });
    const context = {session, env: createFakeEnv()};

    const response = await action({request: buildRequest(), context, params: {}} as any);
    const body = await (response as Response).json();

    expect(body).toEqual({
      success: true,
      variantId: 'gid://shopify/ProductVariant/1',
      attributes: [
        {key: 'Custom Design Path', value: 'AI Generated Design'},
        {key: 'Design Description', value: 'A rising phoenix with laurel leaves'},
        {key: 'Material', value: 'Brass'},
        {key: 'Final Design Image', value: 'https://cdn.shopify.com/front-1.png'},
        {key: '_Design Prompt', value: 'A rising phoenix with laurel leaves'},
        {key: '_Refinement History', value: JSON.stringify(['make the wings bigger'])},
        {key: '_AI Provider', value: 'openai/dall-e-3'},
        {key: '_Generation Cost', value: '$0.08'},
      ],
    });
  });
});
```

- [ ] **Step 3: Run the test and confirm it passes**

Run: `npm run test -- custom-token-you-design-review`
Expected: PASS (1 test) — this is today's real behavior; Task 14 will extend this same file with new cases without changing this test's expectation.

- [ ] **Step 4: Commit**

```bash
git add test/helpers/fake-env.ts test/routes/custom-token-you-design-review.test.ts
git commit -m "test: characterize front-only you-design.review cart attributes"
```

---

### Task 5: Extend `custom-token-session.ts` with back-side fields and step

**Files:**
- Modify: `app/lib/custom-token-session.ts`
- Test: `test/lib/custom-token-session.test.ts` (extend, from Task 1)

**Interfaces:**
- Produces: `CustomTokenSession` gains `backMode?: 'preset' | 'custom'`, `backPresetId?: string`, `backDesignPrompt?: string`, `backPreviewImageIds?: string[]`, `backSelectedPreviewId?: string`, `backRefinementPrompts?: string[]`, `backFinalDesignId?: string`. `getSteps('you-design')` now returns 6 steps including `'back'` before `'review'`. `getCompletedSteps` marks `'back'` completed when `backFinalDesignId` is set.

- [ ] **Step 1: Write the failing tests**

In `test/lib/custom-token-session.test.ts`, replace the `'returns the current 5-step you-design order'` test and extend the completed-steps/gating tests:

```typescript
  it('returns the current 6-step you-design order including back', () => {
    expect(getSteps('you-design')).toEqual([
      'describe',
      'material',
      'preview',
      'refine',
      'back',
      'review',
    ]);
  });

  it('marks the back step completed once backFinalDesignId is set', () => {
    const withoutBack: CustomTokenSession = {
      path: 'you-design',
      designPrompt: 'a phoenix',
      material: 'brass',
      variantId: 'gid://shopify/ProductVariant/1',
      selectedPreviewId: 'gid://shopify/MediaImage/1',
      finalDesignId: 'gid://shopify/MediaImage/2',
    };
    expect(getCompletedSteps(withoutBack)).toEqual(['describe', 'material', 'preview', 'refine']);

    const withBack: CustomTokenSession = {...withoutBack, backFinalDesignId: 'gid://shopify/MediaImage/3'};
    expect(getCompletedSteps(withBack)).toEqual([
      'describe',
      'material',
      'preview',
      'refine',
      'back',
    ]);
  });

  it('blocks access to review until the back step is completed too', () => {
    const withoutBack: CustomTokenSession = {
      path: 'you-design',
      designPrompt: 'a phoenix',
      material: 'brass',
      variantId: 'gid://shopify/ProductVariant/1',
      selectedPreviewId: 'gid://shopify/MediaImage/1',
      finalDesignId: 'gid://shopify/MediaImage/2',
    };
    expect(canProceedToStep(withoutBack, 'review')).toBe(false);

    const withBack: CustomTokenSession = {...withoutBack, backFinalDesignId: 'gid://shopify/MediaImage/3'};
    expect(canProceedToStep(withBack, 'review')).toBe(true);
  });
```

Also update the existing `'marks you-design steps completed as fields are filled in'` and `'blocks access to review until every prior you-design step is completed'` tests — they're now superseded by the two above; delete the old `'blocks access to review...'` test body (it asserted `true` for a session missing `backFinalDesignId`, which is no longer correct) and keep `'marks you-design steps completed as fields are filled in'` as-is since it doesn't set `backFinalDesignId` and still correctly expects `['describe', 'material', 'preview', 'refine']`.

- [ ] **Step 2: Run tests and confirm the new/changed ones fail**

Run: `npm run test -- custom-token-session`
Expected: FAIL — `getSteps('you-design')` still returns 5 steps; `getCompletedSteps`/`canProceedToStep` don't know about `backFinalDesignId` yet.

- [ ] **Step 3: Implement**

In `app/lib/custom-token-session.ts`:

Add to the `CustomTokenSession` interface, after `finalDesignId?: string;` (line 29):

```typescript
  // "You Design" back-side fields
  backMode?: 'preset' | 'custom';
  backPresetId?: string;
  backDesignPrompt?: string;
  backPreviewImageIds?: string[];
  backSelectedPreviewId?: string;
  backRefinementPrompts?: string[];
  backFinalDesignId?: string;
```

Change line 37:

```typescript
const YOU_DESIGN_STEPS = ['describe', 'material', 'preview', 'refine', 'back', 'review'] as const;
```

In `getCompletedSteps`, in the `else` branch (you-design), add after `if (data.finalDesignId) completed.push('refine');`:

```typescript
    if (data.backFinalDesignId) completed.push('back');
```

- [ ] **Step 4: Run tests and confirm they pass**

Run: `npm run test -- custom-token-session`
Expected: PASS (6 tests)

- [ ] **Step 5: Commit**

```bash
git add app/lib/custom-token-session.ts test/lib/custom-token-session.test.ts
git commit -m "feat(custom-token): add back-side session fields and wizard step"
```

---

### Task 6: Create `custom-token-presets.ts` (back preset library)

**Files:**
- Create: `app/lib/custom-token-presets.ts`
- Test: `test/lib/custom-token-presets.test.ts`

**Interfaces:**
- Produces: `interface BackPreset {id: string; label: string; fileGid: string}`, `BACK_PRESETS: BackPreset[]`, `DEFAULT_BACK_PRESET_ID: string`, `getBackPresetById(id: string): BackPreset | undefined`, `getDefaultBackPreset(): BackPreset`. Consumed by Task 8-11 (`you-design.back.tsx`).

**Note:** `fileGid` values below are placeholders. Before this ships, upload the real preset images via Shopify Admin → Content → Files and replace these two GIDs with the real ones returned there.

- [ ] **Step 1: Write the failing test**

Create `test/lib/custom-token-presets.test.ts`:

```typescript
import {describe, it, expect} from 'vitest';
import {
  BACK_PRESETS,
  DEFAULT_BACK_PRESET_ID,
  getBackPresetById,
  getDefaultBackPreset,
} from '~/lib/custom-token-presets';

describe('custom-token-presets', () => {
  it('has at least one preset and every preset has a non-empty id/label/fileGid', () => {
    expect(BACK_PRESETS.length).toBeGreaterThan(0);
    for (const preset of BACK_PRESETS) {
      expect(preset.id).not.toBe('');
      expect(preset.label).not.toBe('');
      expect(preset.fileGid).not.toBe('');
    }
  });

  it('has a DEFAULT_BACK_PRESET_ID that exists in BACK_PRESETS', () => {
    expect(getBackPresetById(DEFAULT_BACK_PRESET_ID)).toBeDefined();
  });

  it('getBackPresetById returns undefined for an unknown id', () => {
    expect(getBackPresetById('does-not-exist')).toBeUndefined();
  });

  it('getDefaultBackPreset returns the preset matching DEFAULT_BACK_PRESET_ID', () => {
    expect(getDefaultBackPreset().id).toBe(DEFAULT_BACK_PRESET_ID);
  });
});
```

- [ ] **Step 2: Run tests and confirm they fail**

Run: `npm run test -- custom-token-presets`
Expected: FAIL — module does not exist yet.

- [ ] **Step 3: Implement**

Create `app/lib/custom-token-presets.ts`:

```typescript
export interface BackPreset {
  id: string;
  label: string;
  fileGid: string;
}

// Replace these fileGid values with real Shopify File GIDs after uploading
// the preset images via Admin → Content → Files.
export const BACK_PRESETS: BackPreset[] = [
  {
    id: 'serenity-prayer',
    label: 'Serenity Prayer',
    fileGid: 'gid://shopify/MediaImage/0000000000001',
  },
  {
    id: 'unity-triangle',
    label: 'Unity Triangle',
    fileGid: 'gid://shopify/MediaImage/0000000000002',
  },
];

export const DEFAULT_BACK_PRESET_ID = 'serenity-prayer';

export function getBackPresetById(id: string): BackPreset | undefined {
  return BACK_PRESETS.find((preset) => preset.id === id);
}

export function getDefaultBackPreset(): BackPreset {
  const preset = getBackPresetById(DEFAULT_BACK_PRESET_ID);
  if (!preset) {
    throw new Error(
      `DEFAULT_BACK_PRESET_ID "${DEFAULT_BACK_PRESET_ID}" not found in BACK_PRESETS`,
    );
  }
  return preset;
}
```

- [ ] **Step 4: Run tests and confirm they pass**

Run: `npm run test -- custom-token-presets`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add app/lib/custom-token-presets.ts test/lib/custom-token-presets.test.ts
git commit -m "feat(custom-token): add back-preset library"
```

---

### Task 7: Create `BackPresetSelector` component

**Files:**
- Create: `app/components/custom-token/BackPresetSelector.tsx`
- Test: `test/components/BackPresetSelector.test.tsx`

**Interfaces:**
- Produces: `BackPresetSelector({presets, selected, onChange, disabled}: {presets: Array<{id: string; label: string; imageUrl: string}>; selected?: string; onChange: (presetId: string) => void; disabled?: boolean})`. Consumed by Task 11 (`you-design.back.tsx`).

- [ ] **Step 1: Write the failing test**

Create `test/components/BackPresetSelector.test.tsx`:

```typescript
import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {BackPresetSelector} from '~/components/custom-token/BackPresetSelector';

const presets = [
  {id: 'serenity-prayer', label: 'Serenity Prayer', imageUrl: 'https://cdn.shopify.com/serenity.png'},
  {id: 'unity-triangle', label: 'Unity Triangle', imageUrl: 'https://cdn.shopify.com/unity.png'},
];

describe('BackPresetSelector', () => {
  it('renders every preset with its label and image', () => {
    render(<BackPresetSelector presets={presets} onChange={() => {}} />);

    expect(screen.getByText('Serenity Prayer')).toBeInTheDocument();
    expect(screen.getByText('Unity Triangle')).toBeInTheDocument();
    expect(screen.getByAltText('Serenity Prayer')).toHaveAttribute('src', presets[0].imageUrl);
  });

  it('calls onChange with the preset id when clicked', async () => {
    const onChange = vi.fn();
    render(<BackPresetSelector presets={presets} onChange={onChange} />);

    await userEvent.click(screen.getByText('Unity Triangle'));

    expect(onChange).toHaveBeenCalledWith('unity-triangle');
  });

  it('disables all buttons when disabled is true', () => {
    render(<BackPresetSelector presets={presets} onChange={() => {}} disabled />);

    for (const button of screen.getAllByRole('button')) {
      expect(button).toBeDisabled();
    }
  });
});
```

- [ ] **Step 2: Run tests and confirm they fail**

Run: `npm run test -- BackPresetSelector`
Expected: FAIL — module does not exist yet.

- [ ] **Step 3: Implement**

Create `app/components/custom-token/BackPresetSelector.tsx`:

```typescript
interface BackPresetOption {
  id: string;
  label: string;
  imageUrl: string;
}

interface BackPresetSelectorProps {
  presets: BackPresetOption[];
  selected?: string;
  onChange: (presetId: string) => void;
  disabled?: boolean;
}

export function BackPresetSelector({presets, selected, onChange, disabled = false}: BackPresetSelectorProps) {
  return (
    <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem'}}>
      {presets.map((preset) => {
        const isSelected = selected === preset.id;
        return (
          <button
            key={preset.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(preset.id)}
            style={{
              position: 'relative',
              borderRadius: '1rem',
              border: isSelected ? '2px solid #B8764F' : '1px solid rgba(255,255,255,0.08)',
              padding: '1rem',
              textAlign: 'left',
              cursor: disabled ? 'not-allowed' : 'pointer',
              transition: 'border-color 0.2s, box-shadow 0.2s',
              background: isSelected
                ? 'rgba(184,118,79,0.1)'
                : 'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)',
              boxShadow: isSelected ? '0 0 0 3px rgba(184,118,79,0.2)' : 'none',
              opacity: disabled ? 0.5 : 1,
            }}
          >
            {isSelected && (
              <div
                style={{
                  position: 'absolute',
                  top: '0.75rem',
                  right: '0.75rem',
                  width: '1.5rem',
                  height: '1.5rem',
                  borderRadius: '50%',
                  background: '#B8764F',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1,
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            <div style={{aspectRatio: '1', borderRadius: '0.75rem', overflow: 'hidden', marginBottom: '0.75rem'}}>
              <img
                src={preset.imageUrl}
                alt={preset.label}
                style={{width: '100%', height: '100%', objectFit: 'cover'}}
              />
            </div>
            <h3 style={{color: '#fff', fontWeight: 700, fontSize: '1rem', margin: 0}}>{preset.label}</h3>
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: Run tests and confirm they pass**

Run: `npm run test -- BackPresetSelector`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add app/components/custom-token/BackPresetSelector.tsx test/components/BackPresetSelector.test.tsx
git commit -m "feat(custom-token): add BackPresetSelector component"
```

---

### Task 8: Create `you-design.back.tsx` — loader + preset selection

This task creates the new route file with its loader and the `select-preset` action intent only. Later tasks (9-11) add the `generate`, `refine`, and `continue` intents to the same file.

**Files:**
- Create: `app/routes/($locale).custom-token.you-design.back.tsx`
- Test: `test/routes/custom-token-you-design-back.test.ts`

**Interfaces:**
- Consumes: `getBackPresetById`, `BACK_PRESETS` from `~/lib/custom-token-presets` (Task 6); `resolveShopifyFileIds` from `~/lib/shopify-uploads.server`; `canProceedToStep`, `getCustomTokenSession`, `updateCustomTokenSession` from `~/lib/custom-token-session` (Task 5).
- Produces: route `loader` returning `{backMode, backPresetId, backDesignPrompt, backImageUrl, backRefinementCount, generationCount, presets}`; route `action` handling `intent=select-preset`.

- [ ] **Step 1: Write the failing tests**

Create `test/routes/custom-token-you-design-back.test.ts`:

```typescript
import {describe, it, expect, vi} from 'vitest';
import {createFakeSession} from '../helpers/fake-session';
import {createFakeEnv} from '../helpers/fake-env';

vi.mock('~/lib/shopify-uploads.server', () => ({
  resolveShopifyFileIds: vi.fn(async (ids: string[]) =>
    Object.fromEntries(ids.map((id) => [id, `https://cdn.shopify.com/${id.split('/').pop()}.png`])),
  ),
}));

import {loader, action} from '../../app/routes/($locale).custom-token.you-design.back';

function baseSessionData() {
  return {
    path: 'you-design' as const,
    designPrompt: 'a phoenix',
    material: 'brass' as const,
    variantId: 'gid://shopify/ProductVariant/1',
    selectedPreviewId: 'gid://shopify/MediaImage/preview-1',
    finalDesignId: 'gid://shopify/MediaImage/front-final',
  };
}

describe('you-design.back loader', () => {
  it('redirects to refine when the wizard has not reached this step', async () => {
    const session = createFakeSession({customToken: {path: 'you-design'}});
    const context = {session, env: createFakeEnv()};

    const result = await loader({context, request: new Request('https://example.com'), params: {}} as any);

    expect(result).toBeInstanceOf(Response);
    expect((result as Response).headers.get('Location')).toBe('/custom-token/you-design/refine');
  });

  it('returns the preset list and no selection when back has not been touched', async () => {
    const session = createFakeSession({customToken: baseSessionData()});
    const context = {session, env: createFakeEnv()};

    const result: any = await loader({context, request: new Request('https://example.com'), params: {}} as any);

    expect(result.backMode).toBeNull();
    expect(result.backImageUrl).toBe('');
    expect(result.presets.length).toBeGreaterThan(0);
    expect(result.presets[0]).toHaveProperty('imageUrl');
  });
});

describe('you-design.back action — select-preset', () => {
  it('sets backMode/backPresetId/backFinalDesignId and returns the resolved image url', async () => {
    const session = createFakeSession({customToken: baseSessionData()});
    const context = {session, env: createFakeEnv()};

    const formData = new FormData();
    formData.set('intent', 'select-preset');
    formData.set('presetId', 'unity-triangle');
    const request = new Request('https://example.com', {method: 'POST', body: formData});

    const response = await action({context, request, params: {}} as any);
    const body = await (response as Response).json();

    expect(body.backPresetId).toBe('unity-triangle');
    expect(body.backImageUrl).toBe('https://cdn.shopify.com/0000000000002.png');

    const stored = session.get('customToken') as any;
    expect(stored.backMode).toBe('preset');
    expect(stored.backPresetId).toBe('unity-triangle');
    expect(stored.backFinalDesignId).toBe('gid://shopify/MediaImage/0000000000002');
  });

  it('returns an error for an unknown preset id', async () => {
    const session = createFakeSession({customToken: baseSessionData()});
    const context = {session, env: createFakeEnv()};

    const formData = new FormData();
    formData.set('intent', 'select-preset');
    formData.set('presetId', 'does-not-exist');
    const request = new Request('https://example.com', {method: 'POST', body: formData});

    const response: any = await action({context, request, params: {}} as any);

    expect(response.error).toBe('Unknown preset selected');
  });
});
```

- [ ] **Step 2: Run tests and confirm they fail**

Run: `npm run test -- custom-token-you-design-back`
Expected: FAIL — route module does not exist yet.

- [ ] **Step 3: Implement**

Create `app/routes/($locale).custom-token.you-design.back.tsx`:

```typescript
import {
  Form,
  redirect,
  useActionData,
  useFetcher,
  useLoaderData,
} from 'react-router';
import {useState, useEffect} from 'react';
import type {Route} from './+types/($locale).custom-token.you-design.back';
import {
  getCustomTokenSession,
  updateCustomTokenSession,
  canProceedToStep,
} from '~/lib/custom-token-session';
import {WizardNav} from '~/components/custom-token/WizardNav';
import {BackPresetSelector} from '~/components/custom-token/BackPresetSelector';
import {BACK_PRESETS, getBackPresetById} from '~/lib/custom-token-presets';
import {resolveShopifyFileIds} from '~/lib/shopify-uploads.server';
import type {AppSession} from '~/lib/session';
import {trackEvent} from '~/lib/ga4';

export async function loader({context}: Route.LoaderArgs) {
  const session = getCustomTokenSession(context.session as AppSession);
  if (
    !session ||
    session.path !== 'you-design' ||
    !canProceedToStep(session, 'back')
  ) {
    return redirect('/custom-token/you-design/refine');
  }

  const idsToResolve: string[] = [];
  if (session.backMode === 'custom') {
    const backId = session.backSelectedPreviewId ?? session.backFinalDesignId;
    if (backId && backId !== 'pending') idsToResolve.push(backId);
  } else if (session.backPresetId) {
    const preset = getBackPresetById(session.backPresetId);
    if (preset) idsToResolve.push(preset.fileGid);
  }

  const [resolved, presetImageUrls] = await Promise.all([
    idsToResolve.length ? resolveShopifyFileIds(idsToResolve, context.env) : Promise.resolve({}),
    resolveShopifyFileIds(BACK_PRESETS.map((p) => p.fileGid), context.env),
  ]);

  return {
    backMode: session.backMode ?? null,
    backPresetId: session.backPresetId ?? null,
    backDesignPrompt: session.backDesignPrompt ?? '',
    backImageUrl: idsToResolve[0] ? resolved[idsToResolve[0]] ?? '' : '',
    backRefinementCount: session.backRefinementPrompts?.length ?? 0,
    generationCount: session.generationCount ?? 0,
    presets: BACK_PRESETS.map((p) => ({...p, imageUrl: presetImageUrls[p.fileGid] ?? ''})),
  };
}

export async function action({request, context}: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get('intent');

  if (intent === 'select-preset') {
    const presetId = formData.get('presetId') as string;
    const preset = getBackPresetById(presetId);
    if (!preset) return {error: 'Unknown preset selected'};

    updateCustomTokenSession(context.session as AppSession, {
      backMode: 'preset',
      backPresetId: preset.id,
      backFinalDesignId: preset.fileGid,
    });

    const resolved = await resolveShopifyFileIds([preset.fileGid], context.env);
    return Response.json(
      {backImageUrl: resolved[preset.fileGid] ?? '', backPresetId: preset.id},
      {headers: {'Set-Cookie': await context.session.commit()}},
    );
  }

  return {error: 'Unknown action'};
}

export default function YouDesignBack() {
  const {
    backMode,
    backPresetId,
    backDesignPrompt,
    backImageUrl: initialUrl,
    backRefinementCount,
    generationCount,
    presets,
  } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const presetFetcher = useFetcher<typeof action>();
  const [mode, setMode] = useState<'preset' | 'custom'>(backMode === 'custom' ? 'custom' : 'preset');
  const [selectedPreset, setSelectedPreset] = useState(backPresetId ?? undefined);
  const [backImageUrl, setBackImageUrl] = useState(initialUrl);

  useEffect(() => {
    if (presetFetcher.data && 'backImageUrl' in presetFetcher.data) {
      setBackImageUrl(presetFetcher.data.backImageUrl);
      setSelectedPreset(presetFetcher.data.backPresetId);
    }
  }, [presetFetcher.data]);

  return (
    <div>
      <div style={{marginBottom: '2rem'}}>
        <span
          style={{
            display: 'inline-block',
            color: '#B8764F',
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.25em',
            fontWeight: 600,
            marginBottom: '0.5rem',
          }}
        >
          Step 5 of 6
        </span>
        <h2
          style={{
            fontFamily: 'var(--font-display, serif)',
            fontSize: '1.875rem',
            fontWeight: 700,
            color: '#FFFFFF',
            lineHeight: 1.2,
          }}
        >
          Design the back
        </h2>
        <p style={{fontSize: '1rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem'}}>
          Choose a standard back design, or customize your own.
        </p>
      </div>

      {mode === 'preset' && (
        <BackPresetSelector
          presets={presets}
          selected={selectedPreset}
          onChange={(presetId) => {
            const fd = new FormData();
            fd.set('intent', 'select-preset');
            fd.set('presetId', presetId);
            presetFetcher.submit(fd, {method: 'POST'});
          }}
        />
      )}

      {(actionData?.error || presetFetcher.data?.error) && (
        <p style={{color: '#f87171', fontSize: '0.875rem', marginTop: '1rem'}}>
          {actionData?.error || presetFetcher.data?.error}
        </p>
      )}

      <Form
        method="post"
        style={{marginTop: '1.5rem'}}
        onSubmit={() => trackEvent('custom_token_step', {path: 'you-design', step: 'back'})}
      >
        <input type="hidden" name="intent" value="continue" />
        <WizardNav backTo="/custom-token/you-design/refine" nextLabel="Continue to Review" />
      </Form>
    </div>
  );
}
```

Note: the `continue` intent used by the bottom `Form` isn't handled by the action yet — that's Task 11. Until then, submitting it falls through to `{error: 'Unknown action'}`, which is expected and will be fixed in Task 11.

- [ ] **Step 4: Run tests and confirm they pass**

Run: `npm run test -- custom-token-you-design-back`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add app/routes/'($locale).custom-token.you-design.back.tsx' test/routes/custom-token-you-design-back.test.ts
git commit -m "feat(custom-token): add back-design route with preset selection"
```

---

### Task 9: Extend `you-design.back.tsx` — custom AI generation

**Files:**
- Modify: `app/routes/($locale).custom-token.you-design.back.tsx`
- Test: `test/routes/custom-token-you-design-back.test.ts` (extend)

**Interfaces:**
- Consumes: `createImageProvider` from `~/lib/ai/adapter`; `buildTokenPrompt` from `~/lib/ai/prompt-engine`; `uploadImageToShopifyFiles` from `~/lib/shopify-uploads.server`; `checkAndIncrementDailyLimit` from `~/lib/ai/rate-limit.server` — all existing, unmodified, called exactly as the front's `you-design.preview.tsx` calls them.
- Produces: action handles `intent=generate` with formData `backDesignPrompt`.

- [ ] **Step 1: Write the failing tests**

Add to `test/routes/custom-token-you-design-back.test.ts`, add these mocks near the top (alongside the existing `shopify-uploads.server` mock) and a new `describe` block:

```typescript
vi.mock('~/lib/ai/adapter', () => ({
  createImageProvider: vi.fn(),
}));

vi.mock('~/lib/ai/rate-limit.server', () => ({
  checkAndIncrementDailyLimit: vi.fn(async () => ({allowed: true, current: 1, limit: 500})),
}));
```

```typescript
import {createImageProvider} from '~/lib/ai/adapter';

describe('you-design.back action — generate (custom)', () => {
  it('generates, uploads, and stores a custom back design', async () => {
    (createImageProvider as any).mockReturnValue({
      generate: vi.fn(async () => ({
        images: [{url: 'data:image/png;base64,fakepixels', b64Data: 'fakepixels'}],
        provider: 'openai',
        model: 'dall-e-3',
      })),
      healthCheck: vi.fn(),
    });

    const uploadsMock = await import('~/lib/shopify-uploads.server');
    (uploadsMock.uploadImageToShopifyFiles as any) = vi.fn(async () => ({
      url: 'https://cdn.shopify.com/back-preview.png',
      fileId: 'gid://shopify/MediaImage/back-preview-1',
    }));

    const session = createFakeSession({customToken: baseSessionData()});
    const context = {session, env: createFakeEnv()};

    const formData = new FormData();
    formData.set('intent', 'generate');
    formData.set('backDesignPrompt', 'A dove carrying an olive branch');
    const request = new Request('https://example.com', {method: 'POST', body: formData});

    const response = await action({context, request, params: {}} as any);
    const body = await (response as Response).json();

    expect(body.backImageUrl).toBe('data:image/png;base64,fakepixels');
    expect(body.backImageId).toBe('gid://shopify/MediaImage/back-preview-1');

    const stored = session.get('customToken') as any;
    expect(stored.backMode).toBe('custom');
    expect(stored.backDesignPrompt).toBe('A dove carrying an olive branch');
    expect(stored.backFinalDesignId).toBe('gid://shopify/MediaImage/back-preview-1');
    expect(stored.generationCount).toBe(1);
  });

  it('rejects generation when the session generation cap is already reached', async () => {
    const session = createFakeSession({
      customToken: {...baseSessionData(), generationCount: 7},
    });
    const context = {session, env: createFakeEnv({AI_MAX_GENERATIONS_PER_SESSION: '7'})};

    const formData = new FormData();
    formData.set('intent', 'generate');
    formData.set('backDesignPrompt', 'A dove');
    const request = new Request('https://example.com', {method: 'POST', body: formData});

    const response: any = await action({context, request, params: {}} as any);

    expect(response.error).toBe('Generation limit reached for this session.');
  });

  it('requires a non-empty backDesignPrompt', async () => {
    const session = createFakeSession({customToken: baseSessionData()});
    const context = {session, env: createFakeEnv()};

    const formData = new FormData();
    formData.set('intent', 'generate');
    formData.set('backDesignPrompt', '   ');
    const request = new Request('https://example.com', {method: 'POST', body: formData});

    const response: any = await action({context, request, params: {}} as any);

    expect(response.error).toBe('Please describe your back design');
  });
});
```

- [ ] **Step 2: Run tests and confirm the new ones fail**

Run: `npm run test -- custom-token-you-design-back`
Expected: FAIL — action has no `generate` intent handler yet.

- [ ] **Step 3: Implement**

In `app/routes/($locale).custom-token.you-design.back.tsx`, add imports:

```typescript
import {createImageProvider} from '~/lib/ai/adapter';
import {buildTokenPrompt} from '~/lib/ai/prompt-engine';
import {uploadImageToShopifyFiles, resolveShopifyFileIds} from '~/lib/shopify-uploads.server';
import {checkAndIncrementDailyLimit} from '~/lib/ai/rate-limit.server';
```

(`resolveShopifyFileIds` replaces the standalone import already there — merge into one import line.)

In the `action`, add before the final `return {error: 'Unknown action'};`:

```typescript
  if (intent === 'generate') {
    const backDesignPrompt = (formData.get('backDesignPrompt') as string)?.trim();
    if (!backDesignPrompt) return {error: 'Please describe your back design'};

    const session = getCustomTokenSession(context.session as AppSession)!;

    const sessionLimit = parseInt(context.env.AI_MAX_GENERATIONS_PER_SESSION || '7', 10);
    if ((session.generationCount ?? 0) + 1 > sessionLimit) {
      return {error: 'Generation limit reached for this session.'};
    }

    try {
      const dailyCheck = await checkAndIncrementDailyLimit(context.env, 1);
      if (!dailyCheck.allowed) {
        return {error: 'Design service temporarily unavailable. Please try again later.'};
      }
    } catch (e) {
      console.error('Custom token back generation daily limit check failed:', e);
      return {error: 'Design service temporarily unavailable. Please try again later.'};
    }

    let result;
    try {
      const provider = createImageProvider(context.env);
      const prompt = buildTokenPrompt(backDesignPrompt, {material: session.material});
      result = await provider.generate({prompt, count: 1, size: '1024x1024'});
    } catch (e: any) {
      const msg = e.message ?? '';
      if (msg.startsWith('SAFETY_REJECTED:')) {
        return {error: msg.replace('SAFETY_REJECTED: ', ''), safetyRejected: true};
      }
      if (msg.startsWith('SYSTEM_ERROR:')) {
        return {error: msg.replace('SYSTEM_ERROR: ', '')};
      }
      console.error('Custom token back generation failed:', e);
      return {error: 'Image generation is temporarily unavailable. Please try again later.'};
    }

    const img = result.images[0];
    const displayUrl = img.url;

    let fileId = '';
    try {
      const uploadResult = await uploadImageToShopifyFiles(
        img.b64Data
          ? {b64Data: img.b64Data, filename: 'custom-token-back-preview.png'}
          : {url: img.url, filename: 'custom-token-back-preview.png'},
        context.env,
      );
      fileId = uploadResult.fileId;
    } catch {
      // Upload failed — we can still show the preview
    }

    updateCustomTokenSession(context.session as AppSession, {
      backMode: 'custom',
      backDesignPrompt,
      backPreviewImageIds: fileId ? [fileId] : [],
      backSelectedPreviewId: fileId || 'pending',
      backFinalDesignId: fileId || 'pending',
      generationCount: (session.generationCount ?? 0) + 1,
    });

    return Response.json(
      {backImageUrl: displayUrl, backImageId: fileId},
      {headers: {'Set-Cookie': await context.session.commit()}},
    );
  }
```

Update the component to add the "customize" UI path — replace the `{mode === 'preset' && (...)}` block with:

```typescript
      {mode === 'preset' && (
        <div>
          <BackPresetSelector
            presets={presets}
            selected={selectedPreset}
            onChange={(presetId) => {
              const fd = new FormData();
              fd.set('intent', 'select-preset');
              fd.set('presetId', presetId);
              presetFetcher.submit(fd, {method: 'POST'});
            }}
          />
          <button
            type="button"
            onClick={() => setMode('custom')}
            style={{
              marginTop: '1.5rem',
              background: 'none',
              border: 'none',
              color: '#B8764F',
              fontSize: '0.875rem',
              textDecoration: 'underline',
              cursor: 'pointer',
            }}
          >
            Or customize your own design →
          </button>
        </div>
      )}

      {mode === 'custom' && !backImageUrl && generateFetcher.state === 'idle' && (
        <generateFetcher.Form method="post">
          <input type="hidden" name="intent" value="generate" />
          <label
            htmlFor="backDesignPrompt"
            style={{display: 'block', color: '#fff', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem'}}
          >
            Describe the back design
          </label>
          <textarea
            id="backDesignPrompt"
            name="backDesignPrompt"
            defaultValue={backDesignPrompt}
            maxLength={500}
            rows={4}
            style={{
              width: '100%',
              borderRadius: '0.75rem',
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.03)',
              padding: '0.5rem 1rem',
              color: '#fff',
              outline: 'none',
              fontFamily: 'inherit',
              fontSize: '0.875rem',
              resize: 'vertical',
              boxSizing: 'border-box',
            }}
          />
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem'}}>
            <button
              type="button"
              onClick={() => setMode('preset')}
              style={{background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', textDecoration: 'underline', cursor: 'pointer'}}
            >
              ← Back to presets
            </button>
            <button
              type="submit"
              disabled={generationCount >= 7}
              style={{
                borderRadius: '0.75rem',
                border: '1px solid #B8764F',
                background: 'rgba(184,118,79,0.1)',
                padding: '0.75rem 1.5rem',
                color: '#B8764F',
                fontWeight: 700,
                cursor: generationCount >= 7 ? 'not-allowed' : 'pointer',
                opacity: generationCount >= 7 ? 0.4 : 1,
              }}
            >
              Generate Back Design
            </button>
          </div>
        </generateFetcher.Form>
      )}

      {mode === 'custom' && generateFetcher.state !== 'idle' && (
        <div style={{textAlign: 'center', padding: '3rem 0'}}>
          <div
            style={{
              width: '200px',
              height: '200px',
              borderRadius: '1rem',
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)',
              margin: '0 auto 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{color: 'rgba(255,255,255,0.3)', fontSize: '0.875rem'}}>Generating...</span>
          </div>
          <p style={{color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem'}}>This may take 15-30 seconds</p>
        </div>
      )}
```

Add `generateFetcher` alongside `presetFetcher` in the component, and an effect updating `backImageUrl` from it:

```typescript
  const generateFetcher = useFetcher<typeof action>();
```

```typescript
  useEffect(() => {
    if (generateFetcher.data && 'backImageUrl' in generateFetcher.data) {
      setBackImageUrl(generateFetcher.data.backImageUrl);
    }
  }, [generateFetcher.data]);
```

And extend the error line to include `generateFetcher.data?.error`.

- [ ] **Step 4: Run tests and confirm they pass**

Run: `npm run test -- custom-token-you-design-back`
Expected: PASS (7 tests)

- [ ] **Step 5: Commit**

```bash
git add app/routes/'($locale).custom-token.you-design.back.tsx' test/routes/custom-token-you-design-back.test.ts
git commit -m "feat(custom-token): add custom AI generation to back-design step"
```

---

### Task 10: Extend `you-design.back.tsx` — refine the custom design

**Files:**
- Modify: `app/routes/($locale).custom-token.you-design.back.tsx`
- Test: `test/routes/custom-token-you-design-back.test.ts` (extend)

**Interfaces:**
- Consumes: `buildRefinementPrompt` from `~/lib/ai/prompt-engine`; `DesignRefiner` from `~/components/custom-token/DesignRefiner` (both existing, unmodified).
- Produces: action handles `intent=refine` with formData `refinement`, capped at `MAX_REFINEMENTS = 3`.

- [ ] **Step 1: Write the failing tests**

Add to `test/routes/custom-token-you-design-back.test.ts`:

```typescript
describe('you-design.back action — refine (custom)', () => {
  function customBackSession(overrides: Record<string, unknown> = {}) {
    return {
      ...baseSessionData(),
      backMode: 'custom',
      backDesignPrompt: 'A dove carrying an olive branch',
      backSelectedPreviewId: 'gid://shopify/MediaImage/back-preview-1',
      backFinalDesignId: 'gid://shopify/MediaImage/back-preview-1',
      generationCount: 1,
      ...overrides,
    };
  }

  it('refines the back design and stores the new final id', async () => {
    (createImageProvider as any).mockReturnValue({
      generate: vi.fn(async () => ({
        images: [{url: 'data:image/png;base64,refinedpixels', b64Data: 'refinedpixels'}],
        provider: 'openai',
        model: 'dall-e-3',
      })),
      healthCheck: vi.fn(),
    });

    const uploadsMock = await import('~/lib/shopify-uploads.server');
    (uploadsMock.uploadImageToShopifyFiles as any) = vi.fn(async () => ({
      url: 'https://cdn.shopify.com/back-refined-1.png',
      fileId: 'gid://shopify/MediaImage/back-refined-1',
    }));

    const session = createFakeSession({customToken: customBackSession()});
    const context = {session, env: createFakeEnv()};

    const formData = new FormData();
    formData.set('intent', 'refine');
    formData.set('refinement', 'Make the olive branch larger');
    const request = new Request('https://example.com', {method: 'POST', body: formData});

    const response = await action({context, request, params: {}} as any);
    const body = await (response as Response).json();

    expect(body.backImageUrl).toBe('data:image/png;base64,refinedpixels');

    const stored = session.get('customToken') as any;
    expect(stored.backFinalDesignId).toBe('gid://shopify/MediaImage/back-refined-1');
    expect(stored.backRefinementPrompts).toEqual(['Make the olive branch larger']);
    expect(stored.generationCount).toBe(2);
  });

  it('rejects refinement past MAX_REFINEMENTS', async () => {
    const session = createFakeSession({
      customToken: customBackSession({
        backRefinementPrompts: ['change 1', 'change 2', 'change 3'],
      }),
    });
    const context = {session, env: createFakeEnv()};

    const formData = new FormData();
    formData.set('intent', 'refine');
    formData.set('refinement', 'change 4');
    const request = new Request('https://example.com', {method: 'POST', body: formData});

    const response: any = await action({context, request, params: {}} as any);

    expect(response.error).toBe('Maximum refinements reached');
  });
});
```

- [ ] **Step 2: Run tests and confirm the new ones fail**

Run: `npm run test -- custom-token-you-design-back`
Expected: FAIL — action has no `refine` intent handler yet.

- [ ] **Step 3: Implement**

In `app/routes/($locale).custom-token.you-design.back.tsx`, add import:

```typescript
import {buildTokenPrompt, buildRefinementPrompt} from '~/lib/ai/prompt-engine';
import {DesignRefiner} from '~/components/custom-token/DesignRefiner';
```

(merge `buildRefinementPrompt` into the existing `buildTokenPrompt` import line.)

Add module-level constant near the top, after imports:

```typescript
const MAX_REFINEMENTS = 3;
```

In the `action`, add before `return {error: 'Unknown action'};`:

```typescript
  if (intent === 'refine') {
    const refinement = (formData.get('refinement') as string)?.trim();
    if (!refinement) return {error: 'Please describe what to change'};

    const session = getCustomTokenSession(context.session as AppSession)!;
    const refinements = session.backRefinementPrompts ?? [];

    if (refinements.length >= MAX_REFINEMENTS) {
      return {error: 'Maximum refinements reached'};
    }

    const sessionLimit = parseInt(context.env.AI_MAX_GENERATIONS_PER_SESSION || '7', 10);
    if ((session.generationCount ?? 0) + 1 > sessionLimit) {
      return {error: 'Generation limit reached for this session.'};
    }

    const dailyCheck = await checkAndIncrementDailyLimit(context.env, 1);
    if (!dailyCheck.allowed) {
      return {error: 'Design service temporarily unavailable.'};
    }

    const provider = createImageProvider(context.env);
    const prompt = buildRefinementPrompt(session.backDesignPrompt!, refinement, session.material);

    let result;
    try {
      result = await provider.generate({prompt, count: 1, size: '1024x1024'});
    } catch (e: any) {
      const msg = e.message ?? '';
      if (msg.startsWith('SAFETY_REJECTED:')) {
        return {error: msg.replace('SAFETY_REJECTED: ', ''), safetyRejected: true};
      }
      return {error: msg.replace('SYSTEM_ERROR: ', '')};
    }

    const img = result.images[0];
    const displayUrl = img.url;

    let fileId = '';
    try {
      const uploadResult = await uploadImageToShopifyFiles(
        img.b64Data
          ? {b64Data: img.b64Data, filename: `custom-token-back-refined-${refinements.length + 1}.png`}
          : {url: img.url, filename: `custom-token-back-refined-${refinements.length + 1}.png`},
        context.env,
      );
      fileId = uploadResult.fileId;
    } catch {
      // Upload failed — still show the preview
    }

    updateCustomTokenSession(context.session as AppSession, {
      backFinalDesignId: fileId || 'pending',
      backRefinementPrompts: [...refinements, refinement],
      generationCount: (session.generationCount ?? 0) + 1,
    });

    return Response.json(
      {backImageUrl: displayUrl, backImageId: fileId},
      {headers: {'Set-Cookie': await context.session.commit()}},
    );
  }
```

Add `refineFetcher` to the component and render `DesignRefiner` once a custom image exists:

```typescript
  const refineFetcher = useFetcher<typeof action>();
```

```typescript
  useEffect(() => {
    if (refineFetcher.data && 'backImageUrl' in refineFetcher.data) {
      setBackImageUrl(refineFetcher.data.backImageUrl);
    }
  }, [refineFetcher.data]);
```

Add after the generating-spinner block:

```typescript
      {mode === 'custom' && backImageUrl && generateFetcher.state === 'idle' && (
        <DesignRefiner
          currentDesignUrl={backImageUrl}
          refinementsUsed={backRefinementCount}
          maxRefinements={MAX_REFINEMENTS}
          refining={refineFetcher.state !== 'idle'}
          onRefine={(prompt) => {
            const fd = new FormData();
            fd.set('intent', 'refine');
            fd.set('refinement', prompt);
            refineFetcher.submit(fd, {method: 'POST'});
          }}
        />
      )}
```

Change the generate-form's guard condition from `!backImageUrl` to also require it's not already rendering the refiner — replace `{mode === 'custom' && !backImageUrl && generateFetcher.state === 'idle' && (` with the same condition (unchanged; `backImageUrl` starting empty is already correct — once it's set, the refiner block above takes over and the generate form's `!backImageUrl` condition naturally stops matching).

Extend the error line to include `refineFetcher.data?.error`.

- [ ] **Step 4: Run tests and confirm they pass**

Run: `npm run test -- custom-token-you-design-back`
Expected: PASS (9 tests)

- [ ] **Step 5: Commit**

```bash
git add app/routes/'($locale).custom-token.you-design.back.tsx' test/routes/custom-token-you-design-back.test.ts
git commit -m "feat(custom-token): add refine step to custom back design"
```

---

### Task 11: Extend `you-design.back.tsx` — continue action with default-preset fallback

**Files:**
- Modify: `app/routes/($locale).custom-token.you-design.back.tsx`
- Test: `test/routes/custom-token-you-design-back.test.ts` (extend)

**Interfaces:**
- Consumes: `getDefaultBackPreset` from `~/lib/custom-token-presets` (Task 6).
- Produces: action handles `intent=continue`, redirecting to `/custom-token/you-design/review`; guarantees `backFinalDesignId` is always set by the time it redirects.

- [ ] **Step 1: Write the failing tests**

Add to `test/routes/custom-token-you-design-back.test.ts`:

```typescript
describe('you-design.back action — continue', () => {
  it('redirects to review, defaulting to the standard preset when back was never touched', async () => {
    const session = createFakeSession({customToken: baseSessionData()});
    const context = {session, env: createFakeEnv()};

    const formData = new FormData();
    formData.set('intent', 'continue');
    const request = new Request('https://example.com', {method: 'POST', body: formData});

    const response = await action({context, request, params: {}} as any);

    expect(response).toBeInstanceOf(Response);
    expect((response as Response).headers.get('Location')).toBe('/custom-token/you-design/review');

    const stored = session.get('customToken') as any;
    expect(stored.backMode).toBe('preset');
    expect(stored.backFinalDesignId).toBe('gid://shopify/MediaImage/0000000000001');
  });

  it('keeps an already-selected preset as-is', async () => {
    const session = createFakeSession({
      customToken: {
        ...baseSessionData(),
        backMode: 'preset',
        backPresetId: 'unity-triangle',
        backFinalDesignId: 'gid://shopify/MediaImage/0000000000002',
      },
    });
    const context = {session, env: createFakeEnv()};

    const formData = new FormData();
    formData.set('intent', 'continue');
    const request = new Request('https://example.com', {method: 'POST', body: formData});

    await action({context, request, params: {}} as any);

    const stored = session.get('customToken') as any;
    expect(stored.backFinalDesignId).toBe('gid://shopify/MediaImage/0000000000002');
  });

  it('falls back to the last generated preview if a custom design was never explicitly finalized', async () => {
    const session = createFakeSession({
      customToken: {
        ...baseSessionData(),
        backMode: 'custom',
        backSelectedPreviewId: 'gid://shopify/MediaImage/back-preview-1',
        backFinalDesignId: 'pending',
      },
    });
    const context = {session, env: createFakeEnv()};

    const formData = new FormData();
    formData.set('intent', 'continue');
    const request = new Request('https://example.com', {method: 'POST', body: formData});

    await action({context, request, params: {}} as any);

    const stored = session.get('customToken') as any;
    expect(stored.backFinalDesignId).toBe('gid://shopify/MediaImage/back-preview-1');
  });
});
```

- [ ] **Step 2: Run tests and confirm the new ones fail**

Run: `npm run test -- custom-token-you-design-back`
Expected: FAIL — action has no `continue` intent handler yet (falls through to `{error: 'Unknown action'}`).

- [ ] **Step 3: Implement**

In `app/routes/($locale).custom-token.you-design.back.tsx`, add import:

```typescript
import {BACK_PRESETS, getBackPresetById, getDefaultBackPreset} from '~/lib/custom-token-presets';
```

(merge `getDefaultBackPreset` into the existing import line.)

In the `action`, add before `return {error: 'Unknown action'};`:

```typescript
  if (intent === 'continue') {
    const session = getCustomTokenSession(context.session as AppSession)!;

    if (!session.backFinalDesignId || session.backFinalDesignId === 'pending') {
      if (session.backMode === 'custom' && session.backSelectedPreviewId) {
        updateCustomTokenSession(context.session as AppSession, {
          backFinalDesignId: session.backSelectedPreviewId,
        });
      } else {
        const defaultPreset = getDefaultBackPreset();
        updateCustomTokenSession(context.session as AppSession, {
          backMode: 'preset',
          backPresetId: defaultPreset.id,
          backFinalDesignId: defaultPreset.fileGid,
        });
      }
    }

    return redirect('/custom-token/you-design/review', {
      headers: {'Set-Cookie': await context.session.commit()},
    });
  }
```

- [ ] **Step 4: Run tests and confirm they pass**

Run: `npm run test -- custom-token-you-design-back`
Expected: PASS (12 tests)

- [ ] **Step 5: Commit**

```bash
git add app/routes/'($locale).custom-token.you-design.back.tsx' test/routes/custom-token-you-design-back.test.ts
git commit -m "feat(custom-token): default back design to standard preset on continue"
```

---

### Task 12: Point `refine.tsx`'s continue action at the new back step

This is the one necessary touch to a front-flow file's *behavior*: the linear wizard now has a step between `refine` and `review`, so `refine`'s "continue" must redirect there instead of straight to `review`.

**Files:**
- Modify: `app/routes/($locale).custom-token.you-design.refine.tsx`
- Test: create `test/routes/custom-token-you-design-refine.test.ts`

**Interfaces:**
- Consumes: `action` exported from `app/routes/($locale).custom-token.you-design.refine.tsx`.

- [ ] **Step 1: Write the failing test**

Create `test/routes/custom-token-you-design-refine.test.ts`:

```typescript
import {describe, it, expect} from 'vitest';
import {createFakeSession} from '../helpers/fake-session';
import {createFakeEnv} from '../helpers/fake-env';
import {action} from '../../app/routes/($locale).custom-token.you-design.refine';

describe('you-design.refine action — continue', () => {
  it('redirects to the new back step, not straight to review', async () => {
    const session = createFakeSession({
      customToken: {
        path: 'you-design',
        designPrompt: 'a phoenix',
        material: 'brass',
        variantId: 'gid://shopify/ProductVariant/1',
        selectedPreviewId: 'gid://shopify/MediaImage/preview-1',
        finalDesignId: 'gid://shopify/MediaImage/final-1',
      },
    });
    const context = {session, env: createFakeEnv()};

    const formData = new FormData();
    formData.set('intent', 'continue');
    const request = new Request('https://example.com', {method: 'POST', body: formData});

    const response = await action({context, request, params: {}} as any);

    expect(response).toBeInstanceOf(Response);
    expect((response as Response).headers.get('Location')).toBe('/custom-token/you-design/back');
  });
});
```

- [ ] **Step 2: Run test and confirm it fails**

Run: `npm run test -- custom-token-you-design-refine`
Expected: FAIL — currently redirects to `/custom-token/you-design/review`.

- [ ] **Step 3: Implement**

In `app/routes/($locale).custom-token.you-design.refine.tsx`, change line 134:

```typescript
    return redirect('/custom-token/you-design/back', {
      headers: {'Set-Cookie': await context.session.commit()},
    });
```

Also update the hardcoded step label on line 176 from `Step 4 of 5` to `Step 4 of 6` (the wizard now has 6 steps total; this step is still the 4th).

- [ ] **Step 4: Run test and confirm it passes**

Run: `npm run test -- custom-token-you-design-refine`
Expected: PASS (1 test)

- [ ] **Step 5: Commit**

```bash
git add app/routes/'($locale).custom-token.you-design.refine.tsx' test/routes/custom-token-you-design-refine.test.ts
git commit -m "fix(custom-token): route refine's continue through the new back step"
```

---

### Task 13: Update step-count labels on the remaining you-design steps

Purely cosmetic: `describe`, `material`, and `preview` keep their step number but the wizard now has 6 steps total instead of 5. These are static JSX text, not computed, so each needs a one-line text edit. Batched into one task since they're mechanical and carry no independent logic to review.

**Files:**
- Modify: `app/routes/($locale).custom-token.you-design.describe.tsx:81`
- Modify: `app/routes/($locale).custom-token.you-design.material.tsx:123`
- Modify: `app/routes/($locale).custom-token.you-design.preview.tsx:179`

- [ ] **Step 1: Make the three text edits**

In `app/routes/($locale).custom-token.you-design.describe.tsx`, line 81: change `Step 1 of 5` to `Step 1 of 6`.

In `app/routes/($locale).custom-token.you-design.material.tsx`, line 123: change `Step 2 of 5` to `Step 2 of 6`.

In `app/routes/($locale).custom-token.you-design.preview.tsx`, line 179: change `Step 3 of 5` to `Step 3 of 6`.

- [ ] **Step 2: Run the full test suite to confirm nothing broke**

Run: `npm run test`
Expected: PASS (all tests so far — these are pure text changes with no test assertions on the label string, so this step's only job is confirming no other test happens to assert the old text)

- [ ] **Step 3: Commit**

```bash
git add app/routes/'($locale).custom-token.you-design.describe.tsx' app/routes/'($locale).custom-token.you-design.material.tsx' app/routes/'($locale).custom-token.you-design.preview.tsx'
git commit -m "chore(custom-token): update step-count labels for the new 6-step wizard"
```

---

### Task 14: Extend `you-design.review.tsx` for both sides

This is the last task: extend the loader/action/component to read, attribute, and display both the front and back designs, using Task 4's characterization test as the fixed baseline for front-only behavior.

**Files:**
- Modify: `app/routes/($locale).custom-token.you-design.review.tsx`
- Test: `test/routes/custom-token-you-design-review.test.ts` (extend, from Task 4)

**Interfaces:**
- Consumes: `getBackPresetById` — not needed here (back is already resolved to `backFinalDesignId` by Task 11 before review is ever reached).

- [ ] **Step 1: Write the failing tests**

Add to `test/routes/custom-token-you-design-review.test.ts`:

```typescript
describe('you-design.review action — with a back design', () => {
  it('adds the back attributes for a preset back design', async () => {
    const session = createFakeSession({
      customToken: {
        path: 'you-design',
        designPrompt: 'A rising phoenix with laurel leaves',
        material: 'brass',
        variantId: 'gid://shopify/ProductVariant/1',
        finalDesignId: 'gid://shopify/MediaImage/front-1',
        refinementPrompts: [],
        generationCount: 1,
        backMode: 'preset',
        backPresetId: 'serenity-prayer',
        backFinalDesignId: 'gid://shopify/MediaImage/back-preset-1',
      },
    });
    const context = {session, env: createFakeEnv()};

    const response = await action({request: buildRequest(), context, params: {}} as any);
    const body = await (response as Response).json();

    expect(body.attributes).toEqual([
      {key: 'Custom Design Path', value: 'AI Generated Design'},
      {key: 'Design Description', value: 'A rising phoenix with laurel leaves'},
      {key: 'Material', value: 'Brass'},
      {key: 'Final Design Image', value: 'https://cdn.shopify.com/front-1.png'},
      {key: 'Final Design Image (Back)', value: 'https://cdn.shopify.com/back-preset-1.png'},
      {key: 'Back Design Source', value: 'Preset'},
      {key: '_Design Prompt', value: 'A rising phoenix with laurel leaves'},
      {key: '_Refinement History', value: '[]'},
      {key: '_AI Provider', value: 'openai/dall-e-3'},
      {key: '_Generation Cost', value: '$0.04'},
    ]);
  });

  it('adds custom-back attributes including the back design prompt and refinement history', async () => {
    const session = createFakeSession({
      customToken: {
        path: 'you-design',
        designPrompt: 'A rising phoenix with laurel leaves',
        material: 'color',
        variantId: 'gid://shopify/ProductVariant/1',
        finalDesignId: 'gid://shopify/MediaImage/front-1',
        refinementPrompts: [],
        generationCount: 3,
        backMode: 'custom',
        backDesignPrompt: 'A dove carrying an olive branch',
        backRefinementPrompts: ['Make the olive branch larger'],
        backFinalDesignId: 'gid://shopify/MediaImage/back-custom-1',
      },
    });
    const context = {session, env: createFakeEnv()};

    const response = await action({request: buildRequest(), context, params: {}} as any);
    const body = await (response as Response).json();

    expect(body.attributes).toEqual([
      {key: 'Custom Design Path', value: 'AI Generated Design'},
      {key: 'Design Description', value: 'A rising phoenix with laurel leaves'},
      {key: 'Material', value: 'Color'},
      {key: 'Final Design Image', value: 'https://cdn.shopify.com/front-1.png'},
      {key: 'Final Design Image (Back)', value: 'https://cdn.shopify.com/back-custom-1.png'},
      {key: 'Back Design Source', value: 'Custom'},
      {key: '_Design Prompt', value: 'A rising phoenix with laurel leaves'},
      {key: '_Refinement History', value: '[]'},
      {key: '_Design Prompt (Back)', value: 'A dove carrying an olive branch'},
      {key: '_Refinement History (Back)', value: JSON.stringify(['Make the olive branch larger'])},
      {key: '_AI Provider', value: 'openai/dall-e-3'},
      {key: '_Generation Cost', value: '$0.12'},
    ]);
  });
});
```

- [ ] **Step 2: Run tests and confirm the new ones fail while the Task 4 baseline still passes**

Run: `npm run test -- custom-token-you-design-review`
Expected: The original front-only baseline test (Task 4) still PASSes unchanged; the two new tests FAIL because `review.tsx` doesn't read/attribute `back*` fields yet.

- [ ] **Step 3: Implement**

In `app/routes/($locale).custom-token.you-design.review.tsx`, replace the `loader` function body with:

```typescript
export async function loader({context}: Route.LoaderArgs) {
  const session = getCustomTokenSession(context.session as AppSession);
  if (
    !session ||
    session.path !== 'you-design' ||
    !canProceedToStep(session, 'review')
  ) {
    return redirect('/custom-token/you-design/material');
  }

  const idsToResolve = [session.finalDesignId, session.backFinalDesignId].filter(
    (id): id is string => Boolean(id),
  );
  const resolved = idsToResolve.length
    ? await resolveShopifyFileIds(idsToResolve, context.env)
    : {};

  const finalDesignUrl = session.finalDesignId ? resolved[session.finalDesignId] ?? '' : '';
  const backFinalDesignUrl = session.backFinalDesignId ? resolved[session.backFinalDesignId] ?? '' : '';

  return {session, finalDesignUrl, backFinalDesignUrl};
}
```

Replace the `action` function's attribute-building and Klaviyo sections (from `// Resolve final design ID to URL for line item property` through the Klaviyo `try`/`catch` block) with:

```typescript
  const idsToResolve = [session.finalDesignId, session.backFinalDesignId].filter(
    (id): id is string => Boolean(id),
  );
  const resolved = idsToResolve.length
    ? await resolveShopifyFileIds(idsToResolve, context.env)
    : {};

  const finalDesignUrl = session.finalDesignId ? resolved[session.finalDesignId] ?? '' : '';
  const backFinalDesignUrl = session.backFinalDesignId ? resolved[session.backFinalDesignId] ?? '' : '';

  // Build line item attributes
  const attributes: Array<{key: string; value: string}> = [
    {key: 'Custom Design Path', value: 'AI Generated Design'},
    {key: 'Design Description', value: session.designPrompt ?? ''},
    {key: 'Material', value: session.material === 'brass' ? 'Brass' : 'Color'},
  ];
  if (finalDesignUrl) {
    attributes.push({key: 'Final Design Image', value: finalDesignUrl});
  }
  if (backFinalDesignUrl) {
    attributes.push({key: 'Final Design Image (Back)', value: backFinalDesignUrl});
  }
  attributes.push({
    key: 'Back Design Source',
    value: session.backMode === 'custom' ? 'Custom' : 'Preset',
  });
  attributes.push({key: '_Design Prompt', value: session.designPrompt ?? ''});
  attributes.push({
    key: '_Refinement History',
    value: JSON.stringify(session.refinementPrompts ?? []),
  });
  if (session.backMode === 'custom') {
    attributes.push({key: '_Design Prompt (Back)', value: session.backDesignPrompt ?? ''});
    attributes.push({
      key: '_Refinement History (Back)',
      value: JSON.stringify(session.backRefinementPrompts ?? []),
    });
  }
  attributes.push({key: '_AI Provider', value: 'openai/dall-e-3'});
  attributes.push({
    key: '_Generation Cost',
    value: `$${((session.generationCount ?? 0) * 0.04).toFixed(2)}`,
  });

  // Fire Klaviyo event (fire-and-forget)
  try {
    const {getKlaviyoClient} = await import('~/lib/klaviyo.server');
    const klaviyo = getKlaviyoClient(context.env);
    klaviyo.createEvent({
      event: 'Custom Token Order - You Design',
      email: 'admin@recoverytokenstore.com',
      properties: {
        designPrompt: session.designPrompt,
        material: session.material,
        finalDesignUrl,
        refinementHistory: JSON.stringify(session.refinementPrompts ?? []),
        generationCount: session.generationCount,
        aiProvider: 'openai/dall-e-3',
        backDesignUrl: backFinalDesignUrl,
        backMode: session.backMode ?? 'preset',
        backDesignPrompt: session.backDesignPrompt,
        backRefinementHistory: JSON.stringify(session.backRefinementPrompts ?? []),
      },
    });
  } catch {
    // Fail silently — order data is in line item properties as backup
  }
```

In the component, destructure `backFinalDesignUrl` from `useLoaderData`, add it to `reviewItems` after the existing front `Final Design` entry:

```typescript
    ...(backFinalDesignUrl
      ? [{label: 'Back Design', value: backFinalDesignUrl, type: 'image' as const}]
      : []),
```

Change the `WizardNav backTo` prop from `/custom-token/you-design/refine` to `/custom-token/you-design/back`, and the step label from `Step 5 of 5` to `Step 6 of 6`.

- [ ] **Step 4: Run tests and confirm they pass, including the untouched Task 4 baseline**

Run: `npm run test -- custom-token-you-design-review`
Expected: PASS (3 tests — the original front-only baseline plus the two new back-design cases)

- [ ] **Step 5: Run the full suite**

Run: `npm run test`
Expected: PASS (all tests across every task)

- [ ] **Step 6: Run typecheck**

Run: `npm run typecheck`
Expected: PASS — no type errors in the modified/created `app/**` files.

- [ ] **Step 7: Commit**

```bash
git add app/routes/'($locale).custom-token.you-design.review.tsx' test/routes/custom-token-you-design-review.test.ts
git commit -m "feat(custom-token): show and attribute both front and back designs at review"
```
