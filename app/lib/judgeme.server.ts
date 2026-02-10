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
      const json = JSON.parse(text);
      const widget = json.widget || '';

      // Extract data attributes from the widget HTML
      const ratingMatch = widget.match(/data-average-rating='([^']+)'/);
      const countMatch = widget.match(/data-number-of-reviews='([^']+)'/);

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
