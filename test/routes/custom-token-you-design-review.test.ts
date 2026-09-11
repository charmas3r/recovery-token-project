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

import {action, loader} from '../../app/routes/($locale).custom-token.you-design.review';

function buildRequest() {
  return new Request('https://example.com/custom-token/you-design/review', {method: 'POST'});
}

describe('you-design.review loader — step gate', () => {
  it('redirects to the back step when backFinalDesignId is missing (stale mid-wizard session)', async () => {
    const session = createFakeSession({
      customToken: {
        path: 'you-design',
        designPrompt: 'A rising phoenix with laurel leaves',
        material: 'brass',
        variantId: 'gid://shopify/ProductVariant/1',
        selectedPreviewId: 'gid://shopify/MediaImage/preview-1',
        finalDesignId: 'gid://shopify/MediaImage/front-1',
        // backFinalDesignId intentionally omitted — customer never reached the back step
      },
    });
    const context = {session, env: createFakeEnv()};

    const result = await loader({context, request: new Request('https://example.com'), params: {}} as any);

    expect(result).toBeInstanceOf(Response);
    expect((result as Response).headers.get('Location')).toBe('/custom-token/you-design/back');
  });
});

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
