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

export function getReviewStats(): ReviewStats {
  if (cachedStats) return cachedStats;
  const reviews = getLocalReviews();
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

  cachedStats = {averageRating, totalCount: reviews.length, distribution};
  return cachedStats;
}
