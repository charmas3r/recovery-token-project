# Reviews Integration Skill

## Overview

This skill covers Judge.me reviews integration for product ratings, reviews display, and Schema.org review markup. Use this when implementing product reviews and social proof.

## Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| Reviews Service | Judge.me | Awesome Plan |
| API | Judge.me REST API | Latest |

## Directory Structure

```
app/
├── components/
│   └── reviews/
│       ├── ReviewsWidget.tsx        # Main reviews display
│       ├── RatingBadge.tsx          # Star rating badge
│       └── ReviewsFallback.tsx      # Error state
├── lib/
│   └── judgeme.server.ts            # Judge.me API client
└── routes/
    ├── ($locale).products.$handle.tsx # Product with reviews
    └── ($locale).reviews.tsx          # All reviews page
```

## Core Patterns

### Pattern: Judge.me API Client

**File Location:** `app/lib/judgeme.server.ts`

```typescript
interface JudgeMeConfig {
  shopDomain: string;
  publicToken: string;
  cdnHost: string;
}

export function createJudgeMeClient(config: JudgeMeConfig) {
  const baseUrl = 'https://judge.me/api/v1';
  
  return {
    async getProductReviews(productId: string, page = 1, perPage = 10) {
      const params = new URLSearchParams({
        shop_domain: config.shopDomain,
        api_token: config.publicToken,
        external_id: productId,
        page: String(page),
        per_page: String(perPage),
      });
      
      const response = await fetch(`${baseUrl}/reviews?${params}`);
      return response.json();
    },
    
    async getRatingSummary(productId: string) {
      const params = new URLSearchParams({
        shop_domain: config.shopDomain,
        api_token: config.publicToken,
        product_id: productId,
      });
      
      const response = await fetch(`${baseUrl}/widgets/product_review?${params}`);
      return response.json();
    },
  };
}
```

### Pattern: Rating Badge (Server-Side)

**When to use:** Display star rating on product page

```typescript
import type {Route} from './+types/products.$handle';
import {createJudgeMeClient} from '~/lib/judgeme.server';

export async function loader({context, params}: Route.LoaderArgs) {
  const {storefront, env} = context;
  
  // Fetch product
  const {product} = await storefront.query(PRODUCT_QUERY, {
    variables: {handle: params.handle},
  });
  
  // Fetch rating summary
  let reviewsSummary = null;
  try {
    const judgeme = createJudgeMeClient({
      shopDomain: env.JUDGEME_SHOP_DOMAIN,
      publicToken: env.JUDGEME_PUBLIC_TOKEN,
      cdnHost: env.JUDGEME_CDN_HOST,
    });
    
    reviewsSummary = await judgeme.getRatingSummary(product.id);
  } catch (error) {
    console.error('Failed to fetch reviews summary:', error);
    // Continue without reviews (non-blocking)
  }
  
  return {product, reviewsSummary};
}

// Component
export default function ProductPage() {
  const {product, reviewsSummary} = useLoaderData<typeof loader>();
  
  return (
    <div>
      <h1>{product.title}</h1>
      
      {reviewsSummary && (
        <RatingBadge
          rating={reviewsSummary.rating}
          reviewCount={reviewsSummary.reviewCount}
        />
      )}
      
      {/* Product details */}
    </div>
  );
}
```

### Pattern: Rating Badge Component

**File Location:** `app/components/reviews/RatingBadge.tsx`

```typescript
import {Star} from 'lucide-react';

interface RatingBadgeProps {
  rating: number; // 0-5
  reviewCount: number;
}

export function RatingBadge({rating, reviewCount}: RatingBadgeProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center">
        {Array.from({length: 5}).map((_, i) => (
          <Star
            key={i}
            className={`h-5 w-5 ${
              i < Math.floor(rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
      <span className="text-sm text-gray-600">
        {rating.toFixed(1)} ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
      </span>
    </div>
  );
}
```

### Pattern: Reviews Widget (Client-Side)

**When to use:** Display full reviews list on product page

```typescript
import {useEffect, useState} from 'react';

interface ReviewsWidgetProps {
  productId: string;
  shopDomain: string;
}

export function ReviewsWidget({productId, shopDomain}: ReviewsWidgetProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    // Load Judge.me widget script
    const script = document.createElement('script');
    script.src = 'https://cdn.judge.me/loader.js';
    script.async = true;
    script.onload = () => setIsLoaded(true);
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);
  
  return (
    <div>
      {!isLoaded && <ReviewsSkeleton />}
      <div
        id="judgeme_product_reviews"
        className="jdgm-widget jdgm-review-widget"
        data-product-id={productId}
        data-shop-domain={shopDomain}
      />
    </div>
  );
}

function ReviewsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({length: 3}).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="mt-2 h-16 bg-gray-200 rounded" />
        </div>
      ))}
    </div>
  );
}
```

### Pattern: Reviews with Error Boundary

**When to use:** Gracefully handle Judge.me failures

```typescript
import {ErrorBoundary} from 'react-error-boundary';

export default function ProductPage() {
  return (
    <div>
      {/* Product content */}
      
      <ErrorBoundary FallbackComponent={ReviewsFallback}>
        <Suspense fallback={<ReviewsSkeleton />}>
          <ReviewsWidget
            productId={product.id}
            shopDomain={env.JUDGEME_SHOP_DOMAIN}
          />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

function ReviewsFallback() {
  return (
    <div className="p-6 bg-gray-50 rounded-lg">
      <p className="text-gray-600">
        Reviews are temporarily unavailable. Please check back later.
      </p>
    </div>
  );
}
```

### Pattern: Review Schema.org Markup

**When to use:** Add structured data for SEO

```typescript
import {JsonLd} from '~/components/seo/JsonLd';

export default function ProductPage() {
  const {product, reviewsSummary, reviews} = useLoaderData<typeof loader>();
  
  const reviewSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    aggregateRating: reviewsSummary ? {
      '@type': 'AggregateRating',
      ratingValue: reviewsSummary.rating,
      reviewCount: reviewsSummary.reviewCount,
      bestRating: 5,
      worstRating: 1,
    } : undefined,
    review: reviews?.map((review) => ({
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
  };
  
  return (
    <div>
      <JsonLd data={reviewSchema} />
      {/* Product content */}
    </div>
  );
}
```

## Environment Variables

```env
# .env
JUDGEME_SHOP_DOMAIN=recovery-token-store.myshopify.com
JUDGEME_PUBLIC_TOKEN=xxxxxxxxxxxx
JUDGEME_CDN_HOST=https://cdn.judge.me
```

## Judge.me API Types

```typescript
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
  recommendation: number; // Percentage
}
```

## Testing Patterns

```typescript
import {describe, it, expect, vi} from 'vitest';

describe('Judge.me Integration', () => {
  it('should fetch rating summary', async () => {
    const mockClient = {
      getRatingSummary: vi.fn().mockResolvedValue({
        rating: 4.5,
        reviewCount: 42,
      }),
    };
    
    const result = await mockClient.getRatingSummary('product-123');
    
    expect(result.rating).toBe(4.5);
    expect(result.reviewCount).toBe(42);
  });
});
```

## Gotchas & Best Practices

- **DO:** Wrap reviews in error boundaries (third-party failures)
- **DO:** Server-render rating badges for SEO
- **DO:** Lazy-load full reviews widget (performance)
- **DO:** Cache review summaries (reduce API calls)
- **DO:** Include Schema.org review markup
- **AVOID:** Blocking page render on reviews API
- **AVOID:** Showing error messages for review failures
- **AVOID:** Querying reviews on every page load (cache)
- **AVOID:** Forgetting verified buyer badges
- **AVOID:** Not handling empty review states

## Related Skills

- `shopify-storefront-api` - Product queries with reviews
- `seo-structured-data` - Review Schema.org markup
- `ui-components` - Review display components
- `react-router-patterns` - Loading reviews in loaders
