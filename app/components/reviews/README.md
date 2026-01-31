# Judge.me Reviews Integration

## Overview

This directory contains the Judge.me reviews integration for the Recovery Token Store Hydrogen storefront.

## Components

### RatingBadge.tsx
Displays star rating and review count for a product. Used on:
- Product detail pages
- Collection pages (when added)
- Search results (when added)

**Usage:**
```tsx
import {RatingBadge} from '~/components/reviews/RatingBadge';

<RatingBadge rating={4.5} reviewCount={42} />
```

### ReviewsWidget.tsx
Lazy-loads the full Judge.me reviews widget with:
- Intersection Observer for performance
- Skeleton loading state
- Client-side script loading

**Usage:**
```tsx
import {ReviewsWidget} from '~/components/reviews/ReviewsWidget';

<ReviewsWidget
  productId={extractProductId(product.id)}
  shopDomain="recovery-token-store.myshopify.com"
/>
```

### ReviewsFallback.tsx
Error boundary fallback component shown when reviews fail to load.

## Server-Side Utilities

### app/lib/judgeme.server.ts

**Functions:**
- `createJudgeMeClient(config)` - Creates API client
- `getJudgeMeClient(env)` - Gets client from environment
- `extractProductId(gid)` - Extracts numeric ID from Shopify GID

**Client Methods:**
- `getRatingSummary(productId)` - Fast endpoint for rating badge
- `getProductReviews(productId, page, perPage)` - Paginated reviews
- `createReview(review)` - Create new review (requires private token)

## Environment Variables

Required in `.env`:
```env
JUDGEME_PUBLIC_TOKEN="your-public-token"
JUDGEME_PRIVATE_TOKEN="your-private-token"
PUBLIC_JUDGEME_SHOP_DOMAIN="your-store.myshopify.com"
```

## Integration Points

### Product Page
File: `app/routes/($locale).products.$handle.tsx`

**Features:**
1. Server-side rating summary fetch (non-blocking, deferred)
2. Rating badge above price
3. Full reviews widget at bottom of page
4. JSON-LD structured data with aggregate rating
5. Error boundary for graceful degradation

### SEO & Structured Data

**Product Schema includes:**
- `aggregateRating` with rating value and count
- Individual reviews (when implemented)
- Proper `@type` annotations for rich results

## Performance Optimization

1. **Lazy Loading**: Widget loads only when scrolled near (Intersection Observer)
2. **Non-Blocking**: Reviews don't block critical product data
3. **Deferred Data**: Rating summary fetched after initial page render
4. **Script Caching**: Judge.me script loaded once per session

## Testing

**Manual Testing:**
1. Navigate to any product page
2. Verify rating badge displays (if reviews exist)
3. Scroll down to verify reviews widget loads
4. Test with no JavaScript enabled (rating badge should still show from server data)

**Validate Structured Data:**
1. Use Google Rich Results Test: https://search.google.com/test/rich-results
2. Check for Product schema with aggregateRating
3. Verify no validation errors

## Troubleshooting

**Reviews not showing:**
- Check product ID format (must be numeric, not full GID)
- Verify Judge.me tokens in `.env`
- Check browser console for script errors
- Ensure product has reviews in Judge.me dashboard

**Rating badge missing:**
- Check loader for errors in server logs
- Verify API tokens are correct
- Check that `reviewsSummary` is passed to component

**Performance issues:**
- Verify Intersection Observer is working (check React DevTools)
- Check Network tab for script loading
- Ensure deferred data is not blocking

## Future Enhancements

- [ ] Add reviews to collection pages
- [ ] Implement custom review submission form
- [ ] Add review photos to product gallery
- [ ] Cache review summaries in KV store
- [ ] Add review count to product cards
- [ ] Implement review webhooks for real-time updates
