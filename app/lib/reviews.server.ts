/**
 * Reviews data layer
 *
 * Single source for review data on the storefront. Live Judge.me reviews are
 * fetched in full (all pages), cached, and merged with the Etsy export in
 * ~/data/reviews.json. Reviewer emails are stripped before caching.
 */

import {CacheCustom} from '@shopify/hydrogen';
import type {WithCache} from '@shopify/hydrogen';
import {
  getJudgeMeClient,
  isPublicReview,
  isVerifiedBuyer,
} from '~/lib/judgeme.server';
import type {JudgeMeApiReview} from '~/lib/judgeme.server';
import {
  computeReviewStats,
  getLocalReviews,
  mergeReviews,
} from '~/lib/reviews-data';
import type {LocalReview, ReviewStats} from '~/lib/reviews-data';

interface ReviewsContext {
  env: {
    JUDGEME_PUBLIC_TOKEN?: string;
    JUDGEME_PRIVATE_TOKEN?: string;
    PUBLIC_JUDGEME_SHOP_DOMAIN?: string;
    PUBLIC_STORE_DOMAIN?: string;
  };
  withCache: WithCache;
}

export interface JudgeMeDisplayReview extends LocalReview {
  /** Shopify numeric product ID, or null for store-level reviews */
  productExternalId: number | null;
}

// Fresh for 5 minutes, then served stale for up to an hour while revalidating
const JUDGEME_REVIEWS_CACHE = CacheCustom({
  mode: 'public',
  maxAge: 300,
  staleWhileRevalidate: 3600,
});

function toDisplayReview(review: JudgeMeApiReview): JudgeMeDisplayReview {
  return {
    id: `jm-${review.id}`,
    title: review.title ?? '',
    body: (review.body ?? '').trim(),
    rating: review.rating,
    created_at: review.created_at,
    productExternalId: review.product_external_id ?? null,
    reviewer: {
      name: review.reviewer?.name || 'Verified Buyer',
      verified: isVerifiedBuyer(review),
    },
  };
}

/**
 * All published Judge.me reviews, newest first. Throws if Judge.me fails;
 * returns [] when Judge.me is not configured.
 */
export async function getJudgeMeReviews(
  context: ReviewsContext,
): Promise<JudgeMeDisplayReview[]> {
  const {env, withCache} = context;
  if (!env.JUDGEME_PUBLIC_TOKEN) return [];

  const shopDomain = env.PUBLIC_JUDGEME_SHOP_DOMAIN || env.PUBLIC_STORE_DOMAIN;

  return withCache.run(
    {
      cacheKey: ['judgeme', 'reviews', shopDomain],
      cacheStrategy: JUDGEME_REVIEWS_CACHE,
      shouldCacheResult: (reviews) => reviews.length > 0,
    },
    async () => {
      const reviews = await getJudgeMeClient(
        env as Parameters<typeof getJudgeMeClient>[0],
      ).listAllReviews();
      return reviews
        .filter(isPublicReview)
        .map(toDisplayReview)
        .sort((a, b) => b.created_at.localeCompare(a.created_at));
    },
  );
}

/** Published Judge.me reviews for one Shopify product (numeric ID) */
export async function getReviewsForProduct(
  context: ReviewsContext,
  productExternalId: number,
): Promise<JudgeMeDisplayReview[]> {
  const reviews = await getJudgeMeReviews(context);
  return reviews.filter((r) => r.productExternalId === productExternalId);
}

/** Per-product {rating, reviewCount}, keyed by Shopify numeric product ID */
export async function getReviewSummariesByProduct(
  context: ReviewsContext,
): Promise<Record<string, {rating: number; reviewCount: number}>> {
  const byProduct = new Map<number, LocalReview[]>();
  for (const review of await getJudgeMeReviews(context)) {
    if (review.productExternalId == null) continue;
    const list = byProduct.get(review.productExternalId) ?? [];
    list.push(review);
    byProduct.set(review.productExternalId, list);
  }

  const result: Record<string, {rating: number; reviewCount: number}> = {};
  for (const [id, reviews] of byProduct) {
    const {averageRating, totalCount} = computeReviewStats(reviews);
    result[String(id)] = {rating: averageRating, reviewCount: totalCount};
  }
  return result;
}

/**
 * Every review on the site: Judge.me merged with the Etsy export.
 * Never throws — falls back to the Etsy export if Judge.me is down.
 */
export async function getAllReviews(
  context: ReviewsContext,
): Promise<LocalReview[]> {
  let live: JudgeMeDisplayReview[] = [];
  try {
    live = await getJudgeMeReviews(context);
  } catch (error) {
    console.error('Failed to fetch Judge.me reviews:', error);
  }
  return mergeReviews(live, getLocalReviews());
}

export async function getAllReviewStats(
  context: ReviewsContext,
): Promise<ReviewStats> {
  return computeReviewStats(await getAllReviews(context));
}
