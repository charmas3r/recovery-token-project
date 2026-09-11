import {describe, it, expect, vi} from 'vitest';
import {createFakeSession} from '../helpers/fake-session';
import {createFakeEnv} from '../helpers/fake-env';

vi.mock('~/lib/shopify-uploads.server', () => ({
  resolveShopifyFileIds: vi.fn(async (ids: string[]) =>
    Object.fromEntries(ids.map((id) => [id, `https://cdn.shopify.com/${id.split('/').pop()}.png`])),
  ),
  uploadImageToShopifyFiles: vi.fn(),
}));

vi.mock('~/lib/ai/adapter', () => ({
  createImageProvider: vi.fn(),
}));

vi.mock('~/lib/ai/rate-limit.server', () => ({
  checkAndIncrementDailyLimit: vi.fn(async () => ({allowed: true, current: 1, limit: 500})),
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

  it('prefers backFinalDesignId over backSelectedPreviewId when they differ (post-refine reload)', async () => {
    const session = createFakeSession({
      customToken: {
        ...baseSessionData(),
        backMode: 'custom',
        backSelectedPreviewId: 'gid://shopify/MediaImage/back-preview-1',
        backFinalDesignId: 'gid://shopify/MediaImage/back-refined-1',
      },
    });
    const context = {session, env: createFakeEnv()};

    const result: any = await loader({context, request: new Request('https://example.com'), params: {}} as any);

    expect(result.backImageUrl).toBe('https://cdn.shopify.com/back-refined-1.png');
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

  it('falls back to the default preset when the custom preview never finished uploading (both ids stuck at pending)', async () => {
    const session = createFakeSession({
      customToken: {
        ...baseSessionData(),
        backMode: 'custom',
        backSelectedPreviewId: 'pending',
        backFinalDesignId: 'pending',
      },
    });
    const context = {session, env: createFakeEnv()};

    const formData = new FormData();
    formData.set('intent', 'continue');
    const request = new Request('https://example.com', {method: 'POST', body: formData});

    await action({context, request, params: {}} as any);

    const stored = session.get('customToken') as any;
    expect(stored.backFinalDesignId).not.toBe('pending');
    expect(stored.backMode).toBe('preset');
    expect(stored.backFinalDesignId).toBe('gid://shopify/MediaImage/0000000000001');
  });
});
