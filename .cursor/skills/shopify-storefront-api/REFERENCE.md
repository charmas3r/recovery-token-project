# Shopify Storefront API - Reference Documentation

**Last Updated:** January 30, 2026  
**Skill:** shopify-storefront-api  
**Purpose:** Industry best practices, MCP server integration, and advanced patterns

---

## Table of Contents

1. [Industry Best Practices](#industry-best-practices)
2. [Shopify MCP Server Integration](#shopify-mcp-server-integration)
3. [Performance Optimization](#performance-optimization)
4. [Common Pitfalls & Solutions](#common-pitfalls--solutions)
5. [Security Considerations](#security-considerations)
6. [Advanced Patterns](#advanced-patterns)
7. [Migration Guide](#migration-guide)

---

## Industry Best Practices

### 1. GraphQL Query Optimization

**Best Practice: Use Fragments for Reusability**
```graphql
# ✅ GOOD: Reusable fragments
fragment ProductCard on Product {
  id
  title
  handle
  priceRange {
    minVariantPrice { amount currencyCode }
  }
  featuredImage { id url altText }
}

query Collection($handle: String!) {
  collection(handle: $handle) {
    products(first: 12) {
      nodes { ...ProductCard }
    }
  }
}
```

**Anti-Pattern: Duplicated Fields**
```graphql
# ❌ BAD: Repeated field definitions
query Collection($handle: String!) {
  collection(handle: $handle) {
    products(first: 12) {
      nodes {
        id
        title
        handle
        priceRange { minVariantPrice { amount currencyCode } }
        featuredImage { id url altText }
      }
    }
  }
}
```

### 2. Pagination Best Practices

**Industry Standard: Cursor-Based Pagination**
- Shopify uses cursor-based pagination (GraphQL Connections spec)
- More scalable than offset-based pagination
- Prevents "page drift" when data changes

```typescript
// ✅ GOOD: Forward pagination with cursor
const {collection} = await storefront.query(COLLECTION_QUERY, {
  variables: {
    handle: 'all',
    first: 24,
    after: cursor, // From previous page
  },
});

// ✅ GOOD: Backward pagination
const {collection} = await storefront.query(COLLECTION_QUERY, {
  variables: {
    handle: 'all',
    last: 24,
    before: cursor,
  },
});

// ❌ BAD: Don't use both first and last
const {collection} = await storefront.query(COLLECTION_QUERY, {
  variables: {
    first: 24,
    last: 24, // Don't do this!
  },
});
```

### 3. Cache Strategy Best Practices

**HTTP Cache Headers (Industry Standard)**

```typescript
// Products: Long cache, stale-while-revalidate
await storefront.query(PRODUCT_QUERY, {
  cache: storefront.CacheCustom({
    mode: 'public',
    maxAge: 3600, // 1 hour
    staleWhileRevalidate: 86400, // 24 hours
  }),
});

// Collections: Medium cache
await storefront.query(COLLECTION_QUERY, {
  cache: storefront.CacheCustom({
    mode: 'public',
    maxAge: 1800, // 30 minutes
    staleWhileRevalidate: 3600, // 1 hour
  }),
});

// Cart/Personalized: No cache
await storefront.query(CART_QUERY, {
  cache: storefront.CacheNone(),
});
```

**Cache Invalidation Strategy**
- Use Shopify webhooks to invalidate caches on product updates
- Implement edge cache purging for critical updates
- Consider stale-while-revalidate for better UX

### 4. Error Handling Best Practices

**Industry Standard: Error Boundaries + Graceful Degradation**

```typescript
export async function loader({context, params}: Route.LoaderArgs) {
  const {storefront} = context;
  
  try {
    const {product} = await storefront.query(PRODUCT_QUERY, {
      variables: {handle: params.handle},
    });
    
    if (!product) {
      // Specific 404 error
      throw new Response('Product not found', {
        status: 404,
        statusText: 'Not Found',
      });
    }
    
    return {product};
  } catch (error) {
    // Log for monitoring
    console.error('Product query failed:', {
      handle: params.handle,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    
    // Re-throw Response errors (404, etc.)
    if (error instanceof Response) {
      throw error;
    }
    
    // Generic 500 for other errors
    throw new Response('Failed to load product', {
      status: 500,
      statusText: 'Internal Server Error',
    });
  }
}
```

---

## Shopify MCP Server Integration

### When to Use Shopify MCP Tools

The Shopify MCP server provides powerful tools for exploring and validating Shopify APIs during development:

**1. `learn_shopify_api` - Start Here**
```typescript
// Use this tool to get conversationId and load API context
// Call BEFORE any other MCP tools
//
// For Storefront API work:
// learn_shopify_api(api: "storefront-graphql")
//
// Returns: { conversationId: "uuid" }
```

**2. `introspect_graphql_schema` - Explore Schema**
```typescript
// Use to discover available fields, types, queries, mutations
//
// Example: Find product fields
// introspect_graphql_schema(
//   conversationId: "from-learn-tool",
//   query: "product",
//   filter: ["types", "queries"],
//   api: "storefront-graphql"
// )
//
// Use when:
// - You need to know what fields are available
// - You're unsure about field names or types
// - You want to see mutation signatures
```

**3. `search_docs_chunks` - Find Documentation**
```typescript
// Search Shopify docs for specific topics
//
// search_docs_chunks(
//   conversationId: "from-learn-tool",
//   prompt: "How to implement variant selection in Hydrogen"
// )
//
// Use when:
// - You need implementation examples
// - You want official Shopify guidance
// - You're looking for best practices
```

### MCP Workflow for New Features

```
1. Call learn_shopify_api(api: "storefront-graphql")
   → Get conversationId

2. Call introspect_graphql_schema(
     conversationId: "...",
     query: "product",
     api: "storefront-graphql"
   )
   → Discover available fields

3. Call search_docs_chunks(
     conversationId: "...",
     prompt: "product query best practices"
   )
   → Get official documentation

4. Implement using discovered schema + docs
```

**Important Notes:**
- ALWAYS call `learn_shopify_api` first
- Keep using the same conversationId throughout
- Don't search the web - use MCP tools for accurate info
- MCP tools have the latest API information

---

## Performance Optimization

### 1. Critical Rendering Path

**Optimize TTFB (Time to First Byte)**
```typescript
export async function loader(args: Route.LoaderArgs) {
  // ✅ GOOD: Deferred non-critical data
  const deferredData = {
    relatedProducts: loadRelatedProducts(args),
    reviews: loadReviews(args),
  };
  
  // ✅ GOOD: Await only critical data
  const criticalData = await loadCriticalData(args);
  
  return {...deferredData, ...criticalData};
}

// ❌ BAD: Awaiting everything
export async function loader(args: Route.LoaderArgs) {
  const product = await loadProduct(args);
  const relatedProducts = await loadRelatedProducts(args); // Blocks TTFB!
  const reviews = await loadReviews(args); // Blocks TTFB!
  
  return {product, relatedProducts, reviews};
}
```

### 2. Image Optimization

**Best Practices from Industry Leaders**
```typescript
// ✅ Use Shopify CDN transformations
const optimizedUrl = image.url + '?width=800&height=800&crop=center';

// ✅ Responsive images with srcset
<Image
  src={image.url}
  srcSet={`
    ${image.url}?width=400 400w,
    ${image.url}?width=800 800w,
    ${image.url}?width=1200 1200w
  `}
  sizes="(min-width: 768px) 50vw, 100vw"
  loading="lazy"
/>

// ✅ Use WebP format when available
const imageUrl = image.url + '?format=webp&quality=80';

// ✅ Set explicit dimensions to prevent CLS
<img
  src={image.url}
  width={image.width}
  height={image.height}
  alt={image.altText}
/>
```

### 3. Query Batching

**Parallel Queries for Better Performance**
```typescript
// ✅ GOOD: Parallel execution
const [
  {product},
  {collection},
  {shop},
] = await Promise.all([
  storefront.query(PRODUCT_QUERY, {variables: {handle}}),
  storefront.query(COLLECTION_QUERY, {variables: {handle}}),
  storefront.query(SHOP_QUERY),
]);

// ❌ BAD: Sequential execution
const {product} = await storefront.query(PRODUCT_QUERY, {variables: {handle}});
const {collection} = await storefront.query(COLLECTION_QUERY, {variables: {handle}});
const {shop} = await storefront.query(SHOP_QUERY);
```

### 4. Prefetching Strategies

```typescript
// ✅ Prefetch on hover (intent-based)
<Link to="/products/token" prefetch="intent">
  View Product
</Link>

// ✅ Prefetch on viewport (for likely navigation)
<Link to="/products/token" prefetch="viewport">
  Featured Product
</Link>

// ❌ Don't prefetch everything
<Link to="/products/token" prefetch="render">
  {/* Prefetches immediately, can waste bandwidth */}
</Link>
```

---

## Common Pitfalls & Solutions

### Pitfall 1: Over-Fetching Data

**Problem:** Querying too many fields or variants
```graphql
# ❌ BAD: Fetching all variants (could be 100+)
query Product($handle: String!) {
  product(handle: $handle) {
    variants(first: 250) {
      nodes { id title price }
    }
  }
}
```

**Solution:** Paginate variants or fetch only selected variant
```graphql
# ✅ GOOD: Fetch selected variant + pagination for others
query Product($handle: String!, $selectedOptions: [SelectedOptionInput!]!) {
  product(handle: $handle) {
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions) {
      id title price
    }
    variants(first: 10) {
      nodes { id title price }
      pageInfo { hasNextPage }
    }
  }
}
```

### Pitfall 2: Missing @inContext Directive

**Problem:** Prices/content not localized
```graphql
# ❌ BAD: Missing localization
query Product($handle: String!) {
  product(handle: $handle) {
    title
    priceRange { minVariantPrice { amount } }
  }
}
```

**Solution:** Always use @inContext
```graphql
# ✅ GOOD: Localized query
query Product($handle: String!) 
  @inContext(country: $country, language: $language) {
  product(handle: $handle) {
    title
    priceRange { minVariantPrice { amount currencyCode } }
  }
}
```

### Pitfall 3: Not Handling Out of Stock

**Problem:** Showing "Add to Cart" for unavailable products
```typescript
// ❌ BAD: No availability check
<AddToCartButton lines={[{merchandiseId: variant.id, quantity: 1}]}>
  Add to Cart
</AddToCartButton>
```

**Solution:** Check availability first
```typescript
// ✅ GOOD: Conditional based on availability
{variant.availableForSale ? (
  <AddToCartButton lines={[{merchandiseId: variant.id, quantity: 1}]}>
    Add to Cart
  </AddToCartButton>
) : (
  <button disabled>Out of Stock</button>
)}
```

### Pitfall 4: Cart ID Not Persisted

**Problem:** Cart lost on page refresh
```typescript
// ❌ BAD: Not setting cart ID in cookies
const cartId = await cart.create({lines});
return {cartId};
```

**Solution:** Use cart.setCartId() for persistence
```typescript
// ✅ GOOD: Persist cart ID in cookies
const cartId = await cart.create({lines});
const headers = cart.setCartId(cartId);
return redirect('/cart', {headers});
```

---

## Security Considerations

### 1. API Token Security

**Critical: Never Expose Private Tokens**
```typescript
// ✅ GOOD: Public token in environment
const PUBLIC_STOREFRONT_API_TOKEN = env.PUBLIC_STOREFRONT_API_TOKEN;

// ❌ BAD: Private token (has write access!)
const PRIVATE_STOREFRONT_API_TOKEN = env.PRIVATE_STOREFRONT_API_TOKEN;
// ^ Should ONLY be used server-side for admin operations
```

### 2. Input Validation

**Always Validate User Input Before Queries**
```typescript
export async function loader({params}: Route.LoaderArgs) {
  const {handle} = params;
  
  // ✅ GOOD: Validate handle format
  if (!handle || !/^[a-z0-9-]+$/.test(handle)) {
    throw new Response('Invalid product handle', {status: 400});
  }
  
  // Now safe to query
  const {product} = await storefront.query(PRODUCT_QUERY, {
    variables: {handle},
  });
}
```

### 3. Rate Limiting

**Implement Client-Side Rate Limiting**
```typescript
// ✅ GOOD: Debounce search queries
import {useDebouncedCallback} from 'use-debounce';

const debouncedSearch = useDebouncedCallback(
  async (query: string) => {
    const results = await storefront.query(SEARCH_QUERY, {
      variables: {query},
    });
    setResults(results);
  },
  300, // 300ms delay
);
```

### 4. CORS & Origin Validation

**Verify Request Origins in Production**
```typescript
// In server.ts or middleware
export async function handleRequest(request: Request) {
  const origin = request.headers.get('origin');
  
  // ✅ GOOD: Validate origin in production
  if (process.env.NODE_ENV === 'production') {
    const allowedOrigins = [
      'https://recoverytoken.store',
      'https://www.recoverytoken.store',
    ];
    
    if (origin && !allowedOrigins.includes(origin)) {
      return new Response('Forbidden', {status: 403});
    }
  }
  
  // Continue with request...
}
```

---

## Advanced Patterns

### 1. Multi-Currency Support

```typescript
// Query with buyer's currency
const {product} = await storefront.query(PRODUCT_QUERY, {
  variables: {
    handle: 'recovery-token',
  },
  headers: {
    'Shopify-Storefront-Buyer-IP': ipAddress,
    'Accept-Language': 'en-US',
  },
});

// Use presentment prices (what customer pays)
const price = variant.price.amount; // In buyer's currency
const currencyCode = variant.price.currencyCode; // Buyer's currency
```

### 2. Personalized Recommendations

```typescript
// Use productRecommendations for AI-powered suggestions
const PRODUCT_RECOMMENDATIONS_QUERY = `#graphql
  query ProductRecommendations(
    $productId: ID!
    $intent: ProductRecommendationIntent
  ) @inContext(country: $country, language: $language) {
    productRecommendations(
      productId: $productId
      intent: $intent
    ) {
      id title handle
      priceRange { minVariantPrice { amount currencyCode } }
      featuredImage { url altText }
    }
  }
` as const;

// Intent options: RELATED, COMPLEMENTARY
const {productRecommendations} = await storefront.query(
  PRODUCT_RECOMMENDATIONS_QUERY,
  {
    variables: {
      productId: currentProduct.id,
      intent: 'RELATED',
    },
  },
);
```

### 3. Metafield Best Practices

```typescript
// ✅ GOOD: Query specific metafields by namespace/key
const PRODUCT_WITH_METAFIELDS = `#graphql
  query Product($handle: String!) {
    product(handle: $handle) {
      id
      title
      metafields(identifiers: [
        {namespace: "custom", key: "shipping_estimate"}
        {namespace: "custom", key: "care_instructions"}
        {namespace: "custom", key: "sustainability_rating"}
      ]) {
        key
        value
        type
        reference {
          ... on MediaImage {
            image { url }
          }
        }
      }
    }
  }
` as const;

// ❌ BAD: Querying all metafields (slow!)
query Product($handle: String!) {
  product(handle: $handle) {
    metafields(first: 250) { # Don't do this
      nodes { key value }
    }
  }
}
```

---

## Migration Guide

### From Liquid to Hydrogen

**Key Differences:**
1. **Data Fetching:** Liquid uses implicit objects, Hydrogen uses explicit GraphQL queries
2. **Routing:** Liquid uses file-based templates, Hydrogen uses React Router
3. **Templating:** Liquid uses tags, Hydrogen uses JSX

**Example Migration:**

**Liquid (Before):**
```liquid
{% assign product = all_products[product_handle] %}
<h1>{{ product.title }}</h1>
<p>{{ product.price | money }}</p>
```

**Hydrogen (After):**
```typescript
export async function loader({params}: Route.LoaderArgs) {
  const {product} = await storefront.query(PRODUCT_QUERY, {
    variables: {handle: params.handle},
  });
  return {product};
}

export default function Product() {
  const {product} = useLoaderData<typeof loader>();
  return (
    <>
      <h1>{product.title}</h1>
      <p>${product.priceRange.minVariantPrice.amount}</p>
    </>
  );
}
```

### From Remix to React Router v7

Hydrogen now uses React Router v7 (not Remix). Key changes:

```typescript
// ✅ NEW: React Router v7 imports
import {useLoaderData, Form} from 'react-router';
import type {Route} from './+types/products.$handle';

// ❌ OLD: Don't use Remix imports
import {useLoaderData, Form} from '@remix-run/react';
import type {LoaderFunctionArgs} from '@remix-run/node';
```

---

## Quick Reference

### Essential Queries

```graphql
# Product by handle
query Product($handle: String!) @inContext(country: $country, language: $language) {
  product(handle: $handle) {
    id title handle description
    priceRange { minVariantPrice { amount currencyCode } }
    featuredImage { url altText width height }
    variants(first: 10) {
      nodes { id title availableForSale price { amount } }
    }
  }
}

# Collection with products
query Collection($handle: String!, $first: Int!) @inContext(country: $country, language: $language) {
  collection(handle: $handle) {
    id title description
    products(first: $first) {
      nodes { id title handle featuredImage { url } }
      pageInfo { hasNextPage endCursor }
    }
  }
}

# Search products
query Search($query: String!, $first: Int!) @inContext(country: $country, language: $language) {
  search(query: $query, first: $first, types: [PRODUCT]) {
    nodes {
      ... on Product { id title handle }
    }
  }
}
```

### Performance Checklist

- [ ] Use fragments for repeated field sets
- [ ] Implement proper caching strategy
- [ ] Defer non-critical data in loaders
- [ ] Use @inContext for all queries
- [ ] Optimize images with CDN params
- [ ] Implement prefetching for likely navigation
- [ ] Monitor query complexity (keep under 1000 points)

### Security Checklist

- [ ] Only use public API tokens in client code
- [ ] Validate all user inputs before queries
- [ ] Implement rate limiting on searches
- [ ] Set proper CORS headers
- [ ] Never log sensitive data
- [ ] Use HTTPS everywhere

---

**Additional Resources:**
- [Shopify Storefront API Reference](https://shopify.dev/docs/api/storefront)
- [Hydrogen Documentation](https://shopify.dev/docs/custom-storefronts/hydrogen)
- [GraphQL Best Practices](https://graphql.org/learn/best-practices/)
- [Web Performance Optimization](https://web.dev/performance/)
