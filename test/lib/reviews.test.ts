import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {createJudgeMeClient} from '~/lib/judgeme.server';
import {mergeReviews} from '~/lib/reviews-data';
import type {LocalReview} from '~/lib/reviews-data';
import {getReviewsForProduct} from '~/lib/reviews.server';

function apiReview(id: number, overrides: Record<string, unknown> = {}) {
  return {
    id,
    title: '',
    body: `Review number ${id}`,
    rating: 5,
    created_at: '2026-09-01T00:00:00+00:00',
    product_external_id: 111,
    published: true,
    hidden: false,
    curated: 'ok',
    verified: 'buyer',
    reviewer: {name: `Reviewer ${id}`, email: `r${id}@example.com`},
    ...overrides,
  };
}

function page(reviews: unknown[]) {
  return new Response(JSON.stringify({reviews}));
}

function localReview(id: string, body: string, createdAt: string): LocalReview {
  return {
    id,
    title: '',
    body,
    rating: 5,
    created_at: createdAt,
    reviewer: {name: 'Someone', verified: true},
  };
}

// withCache that just runs the function, so tests hit the mocked fetch
const noCache = {
  run: (_opts: unknown, fn: () => unknown) => fn(),
  fetch: vi.fn(),
} as any;

describe('Judge.me listAllReviews', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('follows pagination past the first 100 reviews', async () => {
    const firstPage = Array.from({length: 100}, (_, i) => apiReview(i + 1));
    const secondPage = Array.from({length: 37}, (_, i) => apiReview(i + 101));
    (fetch as any)
      .mockResolvedValueOnce(page(firstPage))
      .mockResolvedValueOnce(page(secondPage));

    const client = createJudgeMeClient({
      shopDomain: 'shop.myshopify.com',
      publicToken: 'public',
      privateToken: 'private',
    });
    const reviews = await client.listAllReviews();

    expect(reviews).toHaveLength(137);
    expect(fetch).toHaveBeenCalledTimes(2);
    const secondUrl = new URL((fetch as any).mock.calls[1][0]);
    expect(secondUrl.searchParams.get('page')).toBe('2');
    expect(secondUrl.searchParams.get('api_token')).toBe('private');
  });

  it('finds a product review that is older than the newest 100', async () => {
    const firstPage = Array.from({length: 100}, (_, i) =>
      apiReview(i + 1, {product_external_id: 999}),
    );
    const secondPage = [
      apiReview(101, {product_external_id: 111}),
      apiReview(102, {product_external_id: 111, published: false}),
      apiReview(103, {product_external_id: 111, curated: 'spam'}),
    ];
    (fetch as any)
      .mockResolvedValueOnce(page(firstPage))
      .mockResolvedValueOnce(page(secondPage));

    const reviews = await getReviewsForProduct(
      {env: {JUDGEME_PUBLIC_TOKEN: 'public', PUBLIC_STORE_DOMAIN: 'shop'}, withCache: noCache},
      111,
    );

    expect(reviews.map((r) => r.id)).toEqual(['jm-101']);
    expect(reviews[0].reviewer.verified).toBe(true);
    // Emails are never exposed to the page
    expect(JSON.stringify(reviews)).not.toContain('@example.com');
  });
});

describe('mergeReviews', () => {
  it('keeps one copy of an Etsy review that was imported into Judge.me', () => {
    const live = [
      localReview('jm-1', 'Beautiful token!  Arrived fast.', '2026-04-10T00:00:00+00:00'),
      localReview('jm-2', 'Brand new review from this week', '2026-09-20T00:00:00+00:00'),
    ];
    const etsy = [
      localReview('555', 'Beautiful token! Arrived fast.', '2026-04-10'),
      localReview('556', 'Only on Etsy', '2025-12-01'),
    ];

    const merged = mergeReviews(live, etsy);

    expect(merged.map((r) => r.id)).toEqual(['jm-2', 'jm-1', '556']);
  });

  it('keeps an Etsy buyer verified when the Judge.me copy is not', () => {
    const imported = localReview('jm-1', 'Love it', '2026-04-10T00:00:00+00:00');
    imported.reviewer.verified = false;
    const etsy = localReview('555', 'Love it', '2026-04-10');

    const [merged] = mergeReviews([imported], [etsy]);

    expect(merged.id).toBe('jm-1');
    expect(merged.reviewer.verified).toBe(true);
  });

  it('drops reviews with no text', () => {
    const merged = mergeReviews([localReview('jm-1', '   ', '2026-01-01')], []);
    expect(merged).toEqual([]);
  });
});
