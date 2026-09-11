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
