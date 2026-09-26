import etsyReviews from '~/data/reviews.json';

export interface LocalReview {
  id: string;
  title: string;
  body: string;
  rating: number;
  created_at: string;
  reviewer: {
    name: string;
    verified: boolean;
  };
}

interface EtsyReview {
  reviewer: string;
  date_reviewed: string;
  star_rating: number;
  message: string;
  order_id: number;
}

function parseEtsyDate(mmddyyyy: string): string {
  const [month, day, year] = mmddyyyy.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function normalizeReviewerName(raw: string): string {
  if (raw === 'Sign in with Apple user') return 'Verified Buyer';
  return raw;
}

let cachedReviews: LocalReview[] | null = null;

export function getLocalReviews(): LocalReview[] {
  if (cachedReviews) return cachedReviews;
  const source = etsyReviews as EtsyReview[];
  cachedReviews = source
    .filter((r) => r.message && r.message.trim().length > 0)
    .map((r) => ({
      id: String(r.order_id),
      title: '',
      body: r.message.trim(),
      rating: r.star_rating,
      created_at: parseEtsyDate(r.date_reviewed),
      reviewer: {
        name: normalizeReviewerName(r.reviewer),
        verified: true,
      },
    }))
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
  return cachedReviews;
}

export interface ReviewStats {
  averageRating: number;
  totalCount: number;
  distribution: {1: number; 2: number; 3: number; 4: number; 5: number};
}

let cachedStats: ReviewStats | null = null;

/** Stats for the Etsy export alone — the fallback when Judge.me is unavailable */
export function getReviewStats(): ReviewStats {
  if (!cachedStats) cachedStats = computeReviewStats(getLocalReviews());
  return cachedStats;
}

export function computeReviewStats(reviews: LocalReview[]): ReviewStats {
  const distribution = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
  let averageRating = 0;

  if (reviews.length > 0) {
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    averageRating = Math.round((sum / reviews.length) * 10) / 10;
    for (const r of reviews) {
      const star = Math.min(5, Math.max(1, Math.round(r.rating))) as
        | 1
        | 2
        | 3
        | 4
        | 5;
      distribution[star]++;
    }
  }

  return {averageRating, totalCount: reviews.length, distribution};
}

/**
 * Normalized review text used to spot the same review in two sources.
 * Returns '' for reviews with no text.
 */
function reviewTextKey(body: string): string {
  return body
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .slice(0, 160);
}

/**
 * Merge live Judge.me reviews with the Etsy export, newest first.
 * The Etsy reviews were also imported into Judge.me, so reviews with the same
 * text are kept once (the Judge.me copy wins, but stays verified if either
 * copy is). Reviews with no text are
 * dropped, matching how the Etsy export is filtered.
 */
export function mergeReviews(
  live: LocalReview[],
  local: LocalReview[],
): LocalReview[] {
  const byKey = new Map<string, LocalReview>();

  for (const review of [...live, ...local]) {
    const key = reviewTextKey(review.body);
    if (!key) continue;

    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, review);
    } else if (review.reviewer.verified && !existing.reviewer.verified) {
      // Etsy reviews are all from real orders; keep that even if the
      // imported Judge.me copy isn't flagged as a verified buyer
      byKey.set(key, {
        ...existing,
        reviewer: {...existing.reviewer, verified: true},
      });
    }
  }

  return [...byKey.values()].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

/** Newest positive reviews that fit on a marquee card */
export function pickFeaturedReviews(
  reviews: LocalReview[],
  limit = 12,
): LocalReview[] {
  return reviews
    .filter((r) => r.rating >= 4 && r.body.length >= 40 && r.body.length <= 400)
    .slice(0, limit);
}
