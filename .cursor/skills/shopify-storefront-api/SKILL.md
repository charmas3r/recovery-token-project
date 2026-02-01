# Shopify Storefront API Skill

## Overview

This skill covers how to interact with the Shopify Storefront API in a Hydrogen/React Router application. Use this when querying products, collections, cart operations, or any public-facing Shopify data.

**Relationship with graphql-queries:** This skill focuses on executing GraphQL queries in route loaders and handling responses. The `graphql-queries` skill focuses on query composition and patterns. Use both together: graphql-queries for query structure, this skill for execution in loaders.

## Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| Framework | Shopify Hydrogen | 2025.7.3 |
| Router | React Router | 7.12.0 |
| GraphQL | Shopify Storefront API | 2025-01 |
| Type Generation | @shopify/hydrogen-codegen | ^0.3.3 |

## Directory Structure

```
app/
├── lib/
│   ├── context.ts           # Hydrogen context setup
│   ├── fragments.ts         # Reusable GraphQL fragments
│   └── variants.ts          # Product variant helpers
├── routes/
│   └── ($locale).products.$handle.tsx  # Example route with query
└── root.tsx                 # Root route with Hydrogen context
```

## Core Patterns

### Pattern: Accessing Storefront API in Loaders

**When to use:** In any route loader when you need to fetch Shopify data

**File Location:** Any route file (e.g., `app/routes/($locale).products.$handle.tsx`)

```typescript
import {type Route} from './+types/products.$handle';

export async function loader({context, params}: Route.LoaderArgs) {
  const {storefront} = context;
  const {handle} = params;

  // Query the Storefront API
  const {product} = await storefront.query(PRODUCT_QUERY, {
    variables: {handle},
    cache: storefront.CacheLong(), // Optional caching strategy
  });

  if (!product) {
    throw new Response('Product not found', {status: 404});
  }

  return {product};
}

const PRODUCT_QUERY = `#graphql
  query Product($handle: String!) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      id
      title
      description
      handle
    }
  }
` as const;
```

### Pattern: Cache Strategies

**When to use:** Optimize performance by caching responses at the edge

**Cache Options:**
- `storefront.CacheLong()` - Long-lived cache (1 hour default)
- `storefront.CacheShort()` - Short-lived cache (3 seconds default)
- `storefront.CacheNone()` - No caching (for dynamic/personalized content)
- `storefront.CacheCustom({...})` - Custom cache configuration

```typescript
// Products: Cache for 1 hour, stale-while-revalidate for 24 hours
await storefront.query(PRODUCT_QUERY, {
  variables: {handle},
  cache: storefront.CacheCustom({
    mode: 'public',
    maxAge: 3600,
    staleWhileRevalidate: 86400,
  }),
});

// Cart: Never cache (personalized data)
await storefront.query(CART_QUERY, {
  variables: {cartId},
  cache: storefront.CacheNone(),
});
```

### Pattern: Critical vs Deferred Data Loading

**When to use:** Optimize time-to-first-byte by deferring non-critical data

```typescript
export async function loader(args: Route.LoaderArgs) {
  // Start fetching deferred data without blocking
  const deferredData = loadDeferredData(args);

  // Await critical data needed for initial render
  const criticalData = await loadCriticalData(args);

  // Combine and return
  return {...deferredData, ...criticalData};
}

async function loadCriticalData({context, params}: Route.LoaderArgs) {
  const {storefront} = context;
  
  const {product} = await storefront.query(PRODUCT_QUERY, {
    variables: {handle: params.handle},
  });

  return {product};
}

function loadDeferredData({context}: Route.LoaderArgs) {
  const {storefront} = context;

  // Return promise, don't await
  return {
    relatedProducts: storefront.query(RELATED_PRODUCTS_QUERY, {
      variables: {productId: context.productId},
    }).then(({products}) => products),
  };
}
```

### When to Load Data as Critical vs Deferred

**Load as CRITICAL (awaited in loader):**
- Product details needed for initial render
- Reviews summary for SEO (aggregateRating in Schema.org)
- Data used directly in JSX without Suspense/Await
- Data needed for meta tags or JSON-LD structured data
- Above-the-fold content
- Error states that should cause 404/500 responses

**Load as DEFERRED (Promise, not awaited):**
- Related/recommended products
- Full reviews list (not just summary)
- Content below the fold
- Non-essential social proof elements
- Analytics data
- Third-party widget data

**Real-World Example from PDP:**

```typescript
async function loadCriticalData({context, params}: Route.LoaderArgs) {
  const {storefront, env} = context;

  // Reviews summary is critical because:
  // 1. Used in JSON-LD schema for SEO (aggregateRating)
  // 2. Displayed in rating badge above fold
  // 3. Used directly without Suspense wrapper
  const [{product}, reviewsSummary] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle: params.handle},
    }),
    fetchReviewsSummary(context, params.handle).catch(() => null),
  ]);

  return {product, reviewsSummary};
}

function loadDeferredData({context, params}: Route.LoaderArgs) {
  // Full reviews are deferred because:
  // 1. Displayed below fold in separate section
  // 2. Wrapped in Suspense/Await for progressive loading
  // 3. Not needed for SEO (summary covers aggregateRating)
  // 4. Page is fully functional without them
  return {
    productReviews: fetchProductReviews(context, params.handle)
      .catch(() => null),
    relatedProducts: context.storefront.query(RELATED_PRODUCTS_QUERY)
      .catch(() => null),
  };
}
```

**Key Principle:** If removing the data would make the page return a 404/500 or break critical SEO, load it as critical. If the page is still valuable without it, defer it.

### Pattern: Handling Localization

**When to use:** Support multiple languages and countries

```typescript
import {getLocaleFromRequest} from '~/lib/i18n';

export async function loader({context, request}: Route.LoaderArgs) {
  const {storefront} = context;
  const {language, country} = getLocaleFromRequest(request);

  // The @inContext directive automatically uses language and country
  // from the context.i18n object set in createHydrogenRouterContext
  const {product} = await storefront.query(PRODUCT_QUERY, {
    variables: {handle: 'recovery-token-1-year'},
  });

  return {product};
}

// GraphQL query with @inContext directive
const PRODUCT_QUERY = `#graphql
  query Product($handle: String!) 
    @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      id
      title
      description
    }
  }
` as const;
```

## Type/Model Definitions

```typescript
// Types are auto-generated from GraphQL schema
// Import from storefrontapi.generated.d.ts
import type {
  ProductQuery,
  ProductVariantFragment,
  CollectionQuery,
} from 'storefrontapi.generated';

// Example: Using generated types
type Product = NonNullable<ProductQuery['product']>;
type ProductVariant = ProductVariantFragment;
```

## Common Operations

### Query Product by Handle

**Purpose:** Fetch a single product with variants and options

**File:** `app/routes/($locale).products.$handle.tsx`

```typescript
const PRODUCT_QUERY = `#graphql
  fragment ProductVariant on ProductVariant {
    id
    title
    availableForSale
    price {
      amount
      currencyCode
    }
    compareAtPrice {
      amount
      currencyCode
    }
    selectedOptions {
      name
      value
    }
    image {
      id
      url
      altText
      width
      height
    }
  }

  fragment Product on Product {
    id
    title
    description
    descriptionHtml
    handle
    vendor
    productType
    tags
    options(first: 10) {
      id
      name
      optionValues {
        id
        name
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    images(first: 20) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
    variants(first: 50) {
      nodes {
        ...ProductVariant
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo {
      title
      description
    }
    metafields(identifiers: [
      {namespace: "custom", key: "shipping_estimate"}
      {namespace: "custom", key: "materials"}
    ]) {
      key
      value
      type
    }
  }

  query Product($handle: String!, $selectedOptions: [SelectedOptionInput!]!) 
    @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
` as const;
```

**Usage:**

```typescript
import {getSelectedProductOptions} from '@shopify/hydrogen';

export async function loader({context, params, request}: Route.LoaderArgs) {
  const {storefront} = context;
  const selectedOptions = getSelectedProductOptions(request);

  const {product} = await storefront.query(PRODUCT_QUERY, {
    variables: {
      handle: params.handle,
      selectedOptions,
    },
    cache: storefront.CacheCustom({
      mode: 'public',
      maxAge: 3600,
      staleWhileRevalidate: 86400,
    }),
  });

  return {product};
}
```

### Query Collection with Products

**Purpose:** Fetch a collection with paginated products

```typescript
const COLLECTION_QUERY = `#graphql
  fragment ProductItem on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      id
      url
      altText
      width
      height
    }
  }

  query Collection(
    $handle: String!
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      title
      description
      handle
      image {
        id
        url
        altText
        width
        height
      }
      products(
        first: $first
        last: $last
        before: $startCursor
        after: $endCursor
      ) {
        nodes {
          ...ProductItem
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          startCursor
          endCursor
        }
      }
    }
  }
` as const;
```

**Usage:**

```typescript
import {getPaginationVariables} from '@shopify/hydrogen';

export async function loader({context, params, request}: Route.LoaderArgs) {
  const {storefront} = context;
  const paginationVariables = getPaginationVariables(request, {pageBy: 8});

  const {collection} = await storefront.query(COLLECTION_QUERY, {
    variables: {
      handle: params.handle,
      ...paginationVariables,
    },
  });

  return {collection};
}
```

### Query Product Recommendations

**Purpose:** Get related/recommended products based on a product ID

```typescript
const PRODUCT_RECOMMENDATIONS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      id
      url
      altText
      width
      height
    }
  }

  query ProductRecommendations($productId: ID!) 
    @inContext(country: $country, language: $language) {
    productRecommendations(productId: $productId) {
      ...RecommendedProduct
    }
  }
` as const;
```

## GraphQL Fragment Best Practices

**Reusable Fragments:** Define common fragments in `app/lib/fragments.ts`

```typescript
// app/lib/fragments.ts
export const MONEY_FRAGMENT = `#graphql
  fragment Money on MoneyV2 {
    currencyCode
    amount
  }
` as const;

export const PRODUCT_CARD_FRAGMENT = `#graphql
  fragment ProductCard on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
        ...Money
      }
    }
    featuredImage {
      id
      url
      altText
      width
      height
    }
  }
  ${MONEY_FRAGMENT}
` as const;
```

**Usage in Routes:**

```typescript
import {PRODUCT_CARD_FRAGMENT} from '~/lib/fragments';

const COLLECTION_QUERY = `#graphql
  query Collection($handle: String!) {
    collection(handle: $handle) {
      products(first: 12) {
        nodes {
          ...ProductCard
        }
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
` as const;
```

## Error Handling

```typescript
export async function loader({context, params}: Route.LoaderArgs) {
  const {storefront} = context;

  try {
    const {product} = await storefront.query(PRODUCT_QUERY, {
      variables: {handle: params.handle},
    });

    if (!product) {
      throw new Response('Product not found', {
        status: 404,
        statusText: 'Not Found',
      });
    }

    return {product};
  } catch (error) {
    // Log error for monitoring
    console.error('Failed to fetch product:', error);

    // Handle specific error types
    if (error instanceof Response) {
      throw error; // Re-throw Response errors (404, etc.)
    }

    // Generic error fallback
    throw new Response('Failed to load product', {
      status: 500,
      statusText: 'Internal Server Error',
    });
  }
}
```

## Testing Patterns

```typescript
// test/storefront-query.test.ts
import {describe, it, expect, vi} from 'vitest';

describe('Product Loader', () => {
  it('should fetch product by handle', async () => {
    const mockStorefront = {
      query: vi.fn().mockResolvedValue({
        product: {
          id: 'gid://shopify/Product/123',
          title: '1 Year Recovery Token',
          handle: 'recovery-token-1-year',
        },
      }),
      CacheLong: vi.fn(),
    };

    const context = {storefront: mockStorefront};
    const params = {handle: 'recovery-token-1-year'};

    const result = await loader({context, params} as any);

    expect(mockStorefront.query).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        variables: {handle: 'recovery-token-1-year'},
      }),
    );
    expect(result.product.title).toBe('1 Year Recovery Token');
  });
});
```

## Gotchas & Best Practices

- **DO:** Use `@inContext` directive for all queries to support localization
- **DO:** Implement proper cache strategies based on content type
- **DO:** Use fragments to avoid duplication
- **DO:** Handle 404s explicitly when resources are not found
- **DO:** Use generated TypeScript types for type safety
- **AVOID:** Querying too much data - be selective with fields
- **AVOID:** Hardcoding pagination values - use `getPaginationVariables`
- **AVOID:** Skipping error boundaries for route-level errors
- **AVOID:** Caching personalized data (cart, customer info)
- **AVOID:** Making multiple sequential queries when they can be parallelized

## Related Skills

- `graphql-queries` - GraphQL query patterns and code generation
- `cart-management` - Cart-specific Storefront API operations
- `react-router-patterns` - How to structure loaders and actions
- `product-personalization` - Line item properties and cart attributes
