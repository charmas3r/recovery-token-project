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
