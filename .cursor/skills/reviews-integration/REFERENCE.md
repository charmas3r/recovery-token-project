# Reviews Integration Reference

## Industry Best Practices

### Review Display Strategy

**Blend SEO with Performance**
```typescript
// DO: Server-render rating summary, client-load full reviews
export async function loader({context, params}: Route.LoaderArgs) {
  const {storefront, env} = context;
  
  // Fetch product
  const {product} = await storefront.query(PRODUCT_QUERY, {
    variables: {handle: params.handle},
  });
  
  // Fetch rating summary (fast, for SEO)
  let reviewsSummary = null;
  try {
    const judgeme = createJudgeMeClient(env);
    reviewsSummary = await judgeme.getRatingSummary(product.id);
  } catch (error) {
    console.error('Reviews summary failed:', error);
    // Non-blocking - continue without reviews
  }
  
  return {
    product,
    reviewsSummary, // Used for Schema.org and rating badge
    // Full reviews loaded client-side via widget
  };
}

// AVOID: Blocking page load on full review list
const allReviews = await judgeme.getProductReviews(product.id, 1, 100); // Slow!
```

**Progressive Enhancement**
```typescript
// DO: Show skeleton, then load reviews
export default function ProductPage() {
  const {product, reviewsSummary} = useLoaderData<typeof loader>();
  const [reviewsLoaded, setReviewsLoaded] = useState(false);
  
  useEffect(() => {
    // Load Judge.me widget script
    const script = document.createElement('script');
    script.src = 'https://cdn.judge.me/loader.js';
    script.async = true;
    script.onload = () => setReviewsLoaded(true);
    document.body.appendChild(script);
  }, []);
  
  return (
    <div>
      {/* Show rating badge immediately (from server) */}
      {reviewsSummary && (
        <RatingBadge
          rating={reviewsSummary.rating}
          reviewCount={reviewsSummary.reviewCount}
        />
      )}
      
      {/* Load full reviews lazily */}
      <div className="mt-12">
        <h2>Customer Reviews</h2>
        {!reviewsLoaded && <ReviewsSkeleton />}
        <div id="judgeme_product_reviews" data-product-id={product.id} />
      </div>
    </div>
  );
}
```

### Review Authenticity

**Verified Buyer Badge**
```typescript
// DO: Display verified buyer status
export function ReviewCard({review}: {review: JudgeMeReview}) {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <StarRating value={review.rating} />
        {review.reviewer.verified && (
          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
            ✓ Verified Buyer
          </span>
        )}
      </div>
      
      <p className="font-medium">{review.title}</p>
      <p className="text-sm text-gray-600 mb-2">
        by {review.reviewer.name} on{' '}
        {new Date(review.created_at).toLocaleDateString()}
      </p>
      <p>{review.body}</p>
      
      {/* Review photos */}
      {review.pictures?.length > 0 && (
        <div className="flex gap-2 mt-3">
          {review.pictures.map((pic, i) => (
            <img
              key={i}
              src={pic.urls.thumb}
              alt=""
              className="w-16 h-16 object-cover rounded"
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

### Review Response (Store Owner)

**Respond to Reviews**
```typescript
// Use Judge.me API to post responses
export async function respondToReview(reviewId: string, response: string) {
  const judgeme = createJudgeMeClient(env);
  
  await fetch(`https://judge.me/api/v1/reviews/${reviewId}/respond`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.JUDGEME_PRIVATE_TOKEN}`,
    },
    body: JSON.stringify({
      response: {
        body: response,
        reviewer_name: 'Recovery Token Store',
      },
    }),
  });
}
```

## Schema.org Integration

### Product + Review Schema

**Complete Schema with Reviews**
```typescript
import {JsonLd} from '~/components/seo/JsonLd';

export default function ProductPage() {
  const {product, reviewsSummary, recentReviews} = useLoaderData<typeof loader>();
  
  const productWithReviewsSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: product.images.nodes.map((img) => img.url),
    sku: product.variants.nodes[0]?.sku,
    brand: {
      '@type': 'Brand',
      name: product.vendor || 'Recovery Token Store',
    },
    
    // Aggregate rating
    aggregateRating: reviewsSummary ? {
      '@type': 'AggregateRating',
      ratingValue: reviewsSummary.rating,
      reviewCount: reviewsSummary.reviewCount,
      bestRating: 5,
      worstRating: 1,
    } : undefined,
    
    // Individual reviews (top 5-10 for SEO)
    review: recentReviews?.slice(0, 10).map((review) => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: review.reviewer.name,
      },
      datePublished: review.created_at,
      reviewBody: review.body,
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating,
        bestRating: 5,
        worstRating: 1,
      },
    })),
    
    offers: {
      '@type': 'Offer',
      price: product.priceRange.minVariantPrice.amount,
      priceCurrency: product.priceRange.minVariantPrice.currencyCode,
      availability: product.availableForSale
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
  };
  
  return (
    <div>
      <JsonLd data={productWithReviewsSchema} />
      {/* Product content */}
    </div>
  );
}
```

## Performance Optimization

### Cache Review Summaries

**Reduce API Calls**
```typescript
// DO: Cache rating summaries (updates infrequently)
export async function loader({context, params}: Route.LoaderArgs) {
  const {storefront, env} = context;
  
  const cacheKey = `reviews:summary:${params.handle}`;
  const cached = await cache.get(cacheKey);
  
  if (cached) {
    return {product, reviewsSummary: JSON.parse(cached)};
  }
  
  // Fetch from Judge.me
  const judgeme = createJudgeMeClient(env);
  const reviewsSummary = await judgeme.getRatingSummary(product.id);
  
  // Cache for 1 hour
  await cache.set(cacheKey, JSON.stringify(reviewsSummary), {
    ttl: 3600,
  });
  
  return {product, reviewsSummary};
}
```

### Lazy Load Widget

**Intersection Observer**
```typescript
import {useEffect, useRef, useState} from 'react';

export function ReviewsWidget({productId}: Props) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {rootMargin: '200px'} // Load 200px before visible
    );
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => observer.disconnect();
  }, []);
  
  useEffect(() => {
    if (!isVisible) return;
    
    // Load Judge.me widget when visible
    const script = document.createElement('script');
    script.src = 'https://cdn.judge.me/loader.js';
    script.async = true;
    document.body.appendChild(script);
  }, [isVisible]);
  
  return (
    <div ref={ref}>
      {!isVisible ? (
        <ReviewsSkeleton />
      ) : (
        <div
          id="judgeme_product_reviews"
          data-product-id={productId}
        />
      )}
    </div>
  );
}
```

## Error Handling

### Graceful Degradation

**Handle Judge.me Failures**
```typescript
// DO: Show product even if reviews fail
export async function loader({context, params}: Route.LoaderArgs) {
  const {product} = await storefront.query(PRODUCT_QUERY);
  
  if (!product) {
    throw new Response('Product not found', {status: 404});
  }
  
  // Reviews are optional
  let reviewsSummary = null;
  try {
    const judgeme = createJudgeMeClient(context.env);
    reviewsSummary = await judgeme.getRatingSummary(product.id);
  } catch (error) {
    // Log but don't fail page
    console.error('Reviews failed to load:', error);
    
    // Could also set a flag for fallback UI
    reviewsSummary = {error: true};
  }
  
  return {product, reviewsSummary};
}

// In component
{reviewsSummary && !reviewsSummary.error ? (
  <RatingBadge rating={reviewsSummary.rating} count={reviewsSummary.reviewCount} />
) : (
  <p className="text-sm text-gray-600">Reviews temporarily unavailable</p>
)}
```

### Error Boundary

**Wrap Widget in Boundary**
```typescript
import {ErrorBoundary} from 'react-error-boundary';

function ReviewsFallback({error}: {error: Error}) {
  console.error('Reviews widget error:', error);
  
  return (
    <div className="p-6 bg-gray-50 rounded-lg">
      <p className="text-gray-600">
        We're having trouble loading reviews right now. Please check back later.
      </p>
    </div>
  );
}

export default function ProductPage() {
  return (
    <div>
      {/* Product content */}
      
      <ErrorBoundary FallbackComponent={ReviewsFallback}>
        <ReviewsWidget productId={product.id} />
      </ErrorBoundary>
    </div>
  );
}
```

## Judge.me API Integration

### API Client Pattern

**Reusable Client**
```typescript
// app/lib/judgeme.server.ts
interface JudgeMeConfig {
  shopDomain: string;
  publicToken: string;
  privateToken?: string; // For admin operations
  cdnHost: string;
}

export function createJudgeMeClient(config: JudgeMeConfig) {
  const baseUrl = 'https://judge.me/api/v1';
  
  async function request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Judge.me API error: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  return {
    // Get rating summary
    async getRatingSummary(productId: string) {
      const params = new URLSearchParams({
        shop_domain: config.shopDomain,
        api_token: config.publicToken,
        product_id: productId,
      });
      
      return request(`/widgets/product_review?${params}`);
    },
    
    // Get product reviews (paginated)
    async getProductReviews(productId: string, page = 1, perPage = 10) {
      const params = new URLSearchParams({
        shop_domain: config.shopDomain,
        api_token: config.publicToken,
        external_id: productId,
        page: String(page),
        per_page: String(perPage),
      });
      
      return request(`/reviews?${params}`);
    },
    
    // Create review (requires private token)
    async createReview(review: {
      product_id: string;
      email: string;
      name: string;
      rating: number;
      title: string;
      body: string;
    }) {
      if (!config.privateToken) {
        throw new Error('Private token required for creating reviews');
      }
      
      return request('/reviews', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.privateToken}`,
        },
        body: JSON.stringify({review}),
      });
    },
  };
}
```

### Webhook Integration

**Sync Reviews Automatically**
```typescript
// app/routes/api.webhooks.reviews.tsx
export async function action({request, context}: Route.ActionArgs) {
  const {env} = context;
  
  // Verify webhook signature
  const signature = request.headers.get('X-Judgeme-Signature');
  const isValid = verifyJudgeMeSignature(signature, await request.text(), env.JUDGEME_WEBHOOK_SECRET);
  
  if (!isValid) {
    return new Response('Invalid signature', {status: 401});
  }
  
  const payload = await request.json();
  
  // Handle different event types
  switch (payload.event) {
    case 'review.created':
      // Invalidate cache for this product
      await cache.delete(`reviews:summary:${payload.review.product_id}`);
      break;
      
    case 'review.updated':
      await cache.delete(`reviews:summary:${payload.review.product_id}`);
      break;
      
    case 'review.deleted':
      await cache.delete(`reviews:summary:${payload.review.product_id}`);
      break;
  }
  
  return new Response('OK', {status: 200});
}
```

## Testing Patterns

### Mock Judge.me Responses

```typescript
import {describe, it, expect, vi} from 'vitest';

describe('Reviews Integration', () => {
  it('should fetch rating summary', async () => {
    const mockClient = {
      getRatingSummary: vi.fn().mockResolvedValue({
        rating: 4.5,
        reviewCount: 42,
        recommendation: 95,
      }),
    };
    
    const result = await mockClient.getRatingSummary('product-123');
    
    expect(result.rating).toBe(4.5);
    expect(result.reviewCount).toBe(42);
  });
  
  it('should handle API failures gracefully', async () => {
    const mockClient = {
      getRatingSummary: vi.fn().mockRejectedValue(new Error('API error')),
    };
    
    // Should not throw - catch in loader
    const reviewsSummary = await mockClient
      .getRatingSummary('product-123')
      .catch(() => null);
    
    expect(reviewsSummary).toBeNull();
  });
});
```

## Common Pitfalls

### Problem: Reviews Not Showing

**Symptom:** Widget div empty

**Solution:** Check product ID format
```typescript
// WRONG: Using product handle
<div data-product-id={product.handle} /> // "recovery-token-1-year"

// RIGHT: Using Shopify product ID
<div data-product-id={product.id} /> // "gid://shopify/Product/123456"

// Or extract numeric ID
const numericId = product.id.split('/').pop();
<div data-product-id={numericId} /> // "123456"
```

### Problem: Schema Validation Errors

**Symptom:** Google Rich Results Test shows errors

**Solution:** Ensure all required fields
```typescript
// WRONG: Missing required fields
{
  '@type': 'Review',
  author: 'John', // Should be object
  rating: 5, // Missing @type
}

// RIGHT: Complete review schema
{
  '@type': 'Review',
  author: {
    '@type': 'Person',
    name: 'John Doe',
  },
  reviewRating: {
    '@type': 'Rating',
    ratingValue: 5,
    bestRating: 5,
    worstRating: 1,
  },
  reviewBody: 'Great product!',
  datePublished: '2024-01-15',
}
```

### Problem: Slow Page Load

**Symptom:** TTFB increases by 500+ms

**Solution:** Don't await reviews in loader
```typescript
// WRONG: Blocking loader
const reviews = await judgeme.getProductReviews(product.id);

// RIGHT: Load widget client-side
// Only fetch summary (fast) in loader
const summary = await judgeme.getRatingSummary(product.id);
```

## Moderation & Quality

**Filter Low-Quality Reviews**
```typescript
// DO: Set minimum review length
const minReviewLength = 50; // characters

// In Judge.me settings:
// - Require review text
// - Set minimum word count
// - Enable photo uploads (increases quality)
// - Enable verified buyer badge
```

**Respond to Negative Reviews**
```typescript
// DO: Monitor and respond to low ratings
export async function checkForNegativeReviews() {
  const judgeme = createJudgeMeClient(env);
  const reviews = await judgeme.getProductReviews(productId);
  
  const negativeReviews = reviews.filter((r) => r.rating <= 2);
  
  if (negativeReviews.length > 0) {
    // Send notification to support team
    await sendEmail({
      to: 'support@recoverytoken.store',
      subject: `${negativeReviews.length} negative reviews need attention`,
      html: renderNegativeReviewsAlert(negativeReviews),
    });
  }
}
```

## Related Resources

- Judge.me API Docs: https://judge.me/api
- Schema.org Review: https://schema.org/Review
- Google Rich Results: https://developers.google.com/search/docs/appearance/structured-data/review-snippet
- Shopify Product Reviews: https://shopify.dev/docs/apps/selling-strategies/product-ratings-reviews
