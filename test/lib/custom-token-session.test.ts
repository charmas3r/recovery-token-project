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
});
