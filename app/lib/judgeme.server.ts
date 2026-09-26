/**
 * Judge.me API Client
 * 
 * Provides functions for fetching reviews data from Judge.me API.
 * Used server-side in loaders to get review summaries for SEO and ratings.
 */

interface JudgeMeConfig {
  shopDomain: string;
  publicToken: string;
  privateToken?: string;
}

interface JudgeMeReview {
  id: string;
  title: string;
  body: string;
  rating: number;
  created_at: string;
  reviewer: {
    name: string;
    email: string;
    verified: boolean;
  };
  pictures: Array<{
    urls: {
      original: string;
      thumb: string;
    };
  }>;
}

interface JudgeMeRatingSummary {
  rating: number;
  reviewCount: number;
  recommendation?: number;
}

/**
 * Review shape returned by GET /reviews.
 * `verified` lives on the review itself, not on `reviewer`.
 */
export interface JudgeMeApiReview {
  id: number;
  title: string | null;
  body: string | null;
  rating: number;
  created_at: string;
  product_external_id: number | null;
  published: boolean;
  hidden: boolean;
  curated: string;
  verified?: string;
  reviewer: {
    name: string;
    email?: string;
  };
}

const REVIEWS_PER_PAGE = 100;
// Safety cap: 30 pages = 3,000 reviews
const REVIEWS_MAX_PAGES = 30;
const REVIEWS_TIMEOUT_MS = 8000;

/** Whether a review should be shown on the storefront */
export function isPublicReview(review: JudgeMeApiReview): boolean {
  return review.published && !review.hidden && review.curated !== 'spam';
}

/**
 * Judge.me marks purchase-verified reviews as "buyer", "confirmed-buyer", or
 * "verified-purchase"; unverified ones are "nothing"
 */
export function isVerifiedBuyer(review: JudgeMeApiReview): boolean {
  return (
    review.verified === 'buyer' ||
    review.verified === 'confirmed-buyer' ||
    review.verified === 'verified-purchase'
  );
}

interface JudgeMeReviewsResponse {
  reviews: JudgeMeReview[];
  currentPage: number;
  perPage: number;
  total: number;
}

export function createJudgeMeClient(config: JudgeMeConfig) {
  const baseUrl = 'https://judge.me/api/v1';

  async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      // Get response text first to handle both JSON and non-JSON responses
      const text = await response.text();

      if (!response.ok) {
        throw new Error(`Judge.me API error (${response.status}): ${text}`);
      }

      // Try to parse as JSON
      try {
        const data = JSON.parse(text);
        return data as T;
      } catch (parseError) {
        // If JSON parsing fails, provide detailed error
        console.error('Judge.me API response text:', text);
        throw new Error(
          `Judge.me API returned invalid JSON. Status: ${response.status}, ` +
          `Response: ${text.substring(0, 200)}${text.length > 200 ? '...' : ''}`
        );
      }
    } catch (error) {
      // Re-throw with more context
      if (error instanceof Error) {
        throw new Error(`Judge.me API request failed: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * List every review in the shop, following pagination.
   * GET /reviews only returns one page at a time and cannot filter by
   * Shopify product ID, so callers filter the full list themselves.
   */
  async function listAllReviews(): Promise<JudgeMeApiReview[]> {
    const token = config.privateToken || config.publicToken;
    const all: JudgeMeApiReview[] = [];

    for (let page = 1; page <= REVIEWS_MAX_PAGES; page++) {
      const params = new URLSearchParams({
        shop_domain: config.shopDomain,
        api_token: token,
        per_page: String(REVIEWS_PER_PAGE),
        page: String(page),
      });

      const data = await request<{reviews?: JudgeMeApiReview[]}>(
        `/reviews?${params}`,
        {signal: AbortSignal.timeout(REVIEWS_TIMEOUT_MS)},
      );
      const reviews = data.reviews || [];
      all.push(...reviews);

      if (reviews.length < REVIEWS_PER_PAGE) break;
    }

    return all;
  }

  return {
    /**
     * Get rating summary for a product
     * Fast endpoint for displaying star ratings and review count
     */
    async getRatingSummary(productId: string): Promise<JudgeMeRatingSummary> {
      const params = new URLSearchParams({
        shop_domain: config.shopDomain,
        api_token: config.publicToken,
        external_id: productId,
      });

      // Widget endpoint returns JSON with an HTML widget string
      // Parse rating data from the data attributes in the HTML
      const response = await fetch(
        `${baseUrl}/widgets/product_review?${params}`,
        {headers: {'Content-Type': 'application/json'}},
      );
      const text = await response.text();

      if (!response.ok) {
        throw new Error(`Judge.me API error (${response.status}): ${text}`);
      }

      // Response is JSON: { product_external_id, widget: "<html string>" }
      const json = JSON.parse(text) as {widget?: string};
      const widget = json.widget || '';

      // Extract data attributes from the widget HTML (handle both single and double quotes)
      const ratingMatch = widget.match(/data-average-rating=["']([^"']+)["']/);
      const countMatch = widget.match(/data-number-of-reviews=["']([^"']+)["']/);

      return {
        rating: ratingMatch ? parseFloat(ratingMatch[1]) : 0,
        reviewCount: countMatch ? parseInt(countMatch[1], 10) : 0,
      };
    },

    /**
     * Get paginated product reviews
     * Use for fetching full review list
     */
    async getProductReviews(
      productId: string,
      page = 1,
      perPage = 10
    ): Promise<JudgeMeReviewsResponse> {
      const params = new URLSearchParams({
        shop_domain: config.shopDomain,
        api_token: config.publicToken,
        external_id: productId,
        page: String(page),
        per_page: String(perPage),
      });

      return request<JudgeMeReviewsResponse>(`/reviews?${params}`);
    },

    /**
     * List every review in the shop, following pagination.
     */
    listAllReviews,

    /**
     * Create a review (requires private token)
     * Use for custom review submission forms
     */
    async createReview(data: {
      product_id: string;
      email: string;
      name: string;
      rating: number;
      title: string;
      body: string;
      picture_urls?: string[];
    }): Promise<JudgeMeReview> {
      if (!config.privateToken) {
        throw new Error('Private token required for creating reviews');
      }

      const payload: Record<string, unknown> = {
        shop_domain: config.shopDomain,
        api_token: config.privateToken,
        platform: 'shopify',
        id: Number(data.product_id),
        name: data.name,
        email: data.email,
        rating: data.rating,
        title: data.title,
        body: data.body,
      };

      if (data.picture_urls?.length) {
        payload.picture_urls = data.picture_urls;
      }

      return request<JudgeMeReview>('/reviews', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    /**
     * Check if a review from a given email already exists for a product.
     * Uses private token to access reviewer emails.
     */
    async hasExistingReview(
      productExternalId: string,
      email: string,
    ): Promise<boolean> {
      if (!config.privateToken) {
        console.warn('Private token required for duplicate review check');
        return false;
      }

      let reviews: JudgeMeApiReview[];
      try {
        reviews = await listAllReviews();
      } catch (error) {
        console.error('Judge.me review check failed:', error);
        return false;
      }

      const externalId = Number(productExternalId);
      const normalizedEmail = email.toLowerCase().trim();

      return reviews.some(
        (r) =>
          r.product_external_id === externalId &&
          r.reviewer?.email?.toLowerCase().trim() === normalizedEmail &&
          isPublicReview(r),
      );
    },
  };
}

/**
 * Helper to get Judge.me client from environment
 */
export function getJudgeMeClient(env: Env) {
  if (!env.JUDGEME_PUBLIC_TOKEN) {
    throw new Error('JUDGEME_PUBLIC_TOKEN not configured');
  }

  const shopDomain = env.PUBLIC_JUDGEME_SHOP_DOMAIN || env.PUBLIC_STORE_DOMAIN;
  
  if (!shopDomain) {
    throw new Error('Shop domain not configured');
  }

  return createJudgeMeClient({
    shopDomain,
    publicToken: env.JUDGEME_PUBLIC_TOKEN,
    privateToken: env.JUDGEME_PRIVATE_TOKEN,
  });
}

// Re-export for convenience
export {extractProductId} from './judgeme';
