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
