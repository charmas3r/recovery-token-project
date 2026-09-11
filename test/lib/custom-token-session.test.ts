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
