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
