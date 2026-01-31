# GraphQL Queries Reference

## Industry Best Practices

### Query Organization

**Fragment-First Approach**
```typescript
// DO: Define reusable fragments
const MONEY_FRAGMENT = `#graphql
  fragment Money on MoneyV2 {
    currencyCode
    amount
  }
` as const;

const IMAGE_FRAGMENT = `#graphql
  fragment Image on Image {
    id
    url
    altText
    width
    height
  }
` as const;

const PRODUCT_CARD_FRAGMENT = `#graphql
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
      ...Image
    }
  }
  ${MONEY_FRAGMENT}
  ${IMAGE_FRAGMENT}
` as const;

// AVOID: Repeating field selections
const QUERY_1 = `query { product1 { id title priceRange { minVariantPrice { amount currencyCode } } } }`;
const QUERY_2 = `query { product2 { id title priceRange { minVariantPrice { amount currencyCode } } } }`;
```

**Centralize Fragments**
```typescript
// app/lib/fragments.ts
export const COMMON_FRAGMENTS = {
  money: MONEY_FRAGMENT,
  image: IMAGE_FRAGMENT,
  productCard: PRODUCT_CARD_FRAGMENT,
  cartLine: CART_LINE_FRAGMENT,
  // ...
} as const;

// Import and use
import {COMMON_FRAGMENTS} from '~/lib/fragments';

const QUERY = `#graphql
  query Products {
    products(first: 10) {
      nodes {
        ...ProductCard
      }
    }
  }
  ${COMMON_FRAGMENTS.productCard}
` as const;
```

### Pagination Best Practices

**Cursor-Based Pagination**
```typescript
// DO: Use cursor-based pagination (Shopify standard)
const PRODUCTS_QUERY = `#graphql
  query Products(
    $first: Int
    $after: String
  ) @inContext(country: $country, language: $language) {
    products(first: $first, after: $after) {
      nodes {
        ...ProductCard
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
` as const;

// AVOID: Offset pagination
// products(limit: 10, offset: 20) // Not available in Shopify
```

**Load More Pattern**
```typescript
export default function CollectionPage() {
  const {collection, products} = useLoaderData<typeof loader>();
  const [items, setItems] = useState(products.nodes);
  const [pageInfo, setPageInfo] = useState(products.pageInfo);
  const [loading, setLoading] = useState(false);
  
  const loadMore = async () => {
    if (!pageInfo.hasNextPage || loading) return;
    
    setLoading(true);
    const response = await fetch(
      `/api/products?after=${pageInfo.endCursor}`
    );
    const data = await response.json();
    
    setItems([...items, ...data.products.nodes]);
    setPageInfo(data.products.pageInfo);
    setLoading(false);
  };
  
  return (
    <div>
      <ProductGrid products={items} />
      {pageInfo.hasNextPage && (
        <button onClick={loadMore} disabled={loading}>
          {loading ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
}
```

### Error Handling

**Handle GraphQL Errors**
```typescript
// DO: Handle both network and GraphQL errors
export async function loader({context}: Route.LoaderArgs) {
  const {storefront} = context;
  
  try {
    const {data, errors} = await storefront.query(PRODUCT_QUERY, {
      variables: {handle: params.handle},
    });
    
    // GraphQL errors (partial failure)
    if (errors && errors.length > 0) {
      console.error('GraphQL Errors:', errors);
      // Continue with partial data if available
    }
    
    // No data returned
    if (!data?.product) {
      throw new Response('Product not found', {status: 404});
    }
    
    return {product: data.product};
  } catch (error) {
    // Network error or query parsing error
    console.error('Query failed:', error);
    throw new Response('Unable to load product', {status: 500});
  }
}
```

**Mutation Error Handling**
```typescript
// DO: Check both errors and userErrors
export async function action({context}: Route.ActionArgs) {
  const {customerAccount} = context;
  
  const {data, errors} = await customerAccount.mutate(
    CUSTOMER_UPDATE_MUTATION,
    {variables: {customer: updatedData}}
  );
  
  // GraphQL errors
  if (errors && errors.length > 0) {
    return {
      success: false,
      errors: errors.map(e => ({message: e.message})),
    };
  }
  
  // UserErrors (business logic errors)
  if (data?.customerUpdate?.userErrors?.length > 0) {
    return {
      success: false,
      errors: data.customerUpdate.userErrors,
    };
  }
  
  return {success: true, customer: data.customerUpdate.customer};
}
```

## Performance Optimization

### Query Only What You Need

**Avoid Over-Fetching**
```typescript
// WRONG: Fetching unnecessary fields
const PRODUCT_QUERY = `#graphql
  query Product($handle: String!) {
    product(handle: $handle) {
      id
      title
      description
      descriptionHtml
      vendor
      productType
      tags
      options(first: 100) { ... }
      variants(first: 250) { ... }
      media(first: 100) { ... }
      metafields(identifiers: [...]) { ... }
      seo { ... }
      # Too many fields!
    }
  }
`;

// RIGHT: Query only what's needed for this page
const PRODUCT_CARD_QUERY = `#graphql
  query ProductCard($handle: String!) {
    product(handle: $handle) {
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
        url
        altText
      }
    }
  }
`;
```

### Batch Related Queries

**Single Query for Related Data**
```typescript
// DO: Fetch related data in one query
const PRODUCT_WITH_RELATED_QUERY = `#graphql
  query Product($handle: String!) {
    product(handle: $handle) {
      ...ProductDetails
    }
    
    # Fetch related in same query
    collection(handle: "all") {
      products(first: 4, filters: {tag: "recommended"}) {
        nodes {
          ...ProductCard
        }
      }
    }
  }
`;

// AVOID: Separate queries
const product = await storefront.query(PRODUCT_QUERY);
const related = await storefront.query(RELATED_PRODUCTS_QUERY); // Extra roundtrip
```

### Variable Coercion

**Type-Safe Variables**
```typescript
// DO: Use proper variable types
const {product} = await storefront.query<ProductQuery, ProductQueryVariables>(
  PRODUCT_QUERY,
  {
    variables: {
      handle: params.handle, // string
      first: 10, // number
      selectedOptions: [], // SelectedOptionInput[]
    },
  }
);

// AVOID: Wrong types
const {product} = await storefront.query(PRODUCT_QUERY, {
  variables: {
    handle: params.handle,
    first: "10", // Wrong: should be number
  },
});
```

## MCP Integration

### Introspect GraphQL Schema

**Explore Available Fields**
```typescript
// Use introspect_graphql_schema MCP tool
{
  "api": "storefront",
  "types": ["Product", "ProductVariant", "Collection"]
}

// Returns:
// - All fields on Product type
// - Relationships (variants, images, etc.)
// - Available filters and arguments
// - Deprecated fields to avoid
```

**Discover Metafield Types**
```typescript
{
  "api": "storefront",
  "types": ["Metafield"],
  "includeDescription": true
}

// Learn about:
// - Metafield reference types
// - How to query nested references
// - Available metafield types
```

### Learn API Patterns

**Best Practices from Shopify**
```typescript
// Use learn_shopify_api MCP tool
{
  "topic": "GraphQL query optimization",
  "context": "I need to query products with variants efficiently"
}

// Get guidance on:
// - Optimal first/last values
// - When to use fragments
// - Pagination strategies
// - Cost calculation
```

### Search Documentation

**Find Query Examples**
```typescript
// Use search_docs_chunks MCP tool
{
  "query": "product query with metafields example",
  "max_results": 5
}

// Returns code examples for:
// - Complete query structure
// - Metafield querying
// - Error handling
// - Common patterns
```

## Advanced Patterns

### Conditional Fields

**Use @include and @skip Directives**
```typescript
const PRODUCT_QUERY = `#graphql
  query Product(
    $handle: String!
    $includeMetafields: Boolean = false
    $includeReviews: Boolean = false
  ) {
    product(handle: $handle) {
      id
      title
      
      # Only fetch if flag is true
      metafields(identifiers: [...]) @include(if: $includeMetafields) {
        key
        value
      }
      
      # Skip if flag is false
      reviewsWidget @skip(if: $includeReviews) {
        rating
        count
      }
    }
  }
`;

// Usage
const {product} = await storefront.query(PRODUCT_QUERY, {
  variables: {
    handle: 'token',
    includeMetafields: true, // Fetch metafields
    includeReviews: false, // Skip reviews
  },
});
```

### Type Conditions (Unions/Interfaces)

**Handle Multiple Types**
```typescript
const SEARCH_QUERY = `#graphql
  query Search($query: String!) {
    search(query: $query, types: [PRODUCT, ARTICLE], first: 20) {
      nodes {
        ... on Product {
          __typename
          id
          title
          handle
          priceRange {
            minVariantPrice {
              amount
            }
          }
        }
        ... on Article {
          __typename
          id
          title
          handle
          excerpt
        }
      }
    }
  }
`;

// Type-safe handling
searchResults.nodes.map((node) => {
  if (node.__typename === 'Product') {
    return <ProductCard product={node} />;
  } else if (node.__typename === 'Article') {
    return <ArticleCard article={node} />;
  }
});
```

### Aliases for Multiple Queries

**Query Same Type with Different Args**
```typescript
const MULTI_COLLECTION_QUERY = `#graphql
  query MultiCollections {
    # Alias to query multiple collections
    newArrivals: collection(handle: "new-arrivals") {
      ...CollectionSummary
    }
    
    bestsellers: collection(handle: "bestsellers") {
      ...CollectionSummary
    }
    
    sale: collection(handle: "sale") {
      ...CollectionSummary
    }
  }
  
  fragment CollectionSummary on Collection {
    id
    title
    products(first: 4) {
      nodes {
        ...ProductCard
      }
    }
  }
`;

// Access with aliases
const {newArrivals, bestsellers, sale} = data;
```

## Code Generation

### GraphQL Codegen Config

**Optimal Configuration**
```typescript
// .graphqlrc.ts
import {ApiType, shopifyApiProject} from '@shopify/api-codegen-preset';

export default {
  projects: {
    // Storefront API
    default: shopifyApiProject({
      apiType: ApiType.Storefront,
      apiVersion: '2025-01',
      documents: [
        './app/**/*.{ts,tsx}',
        './app/lib/fragments.ts', // Include fragments
      ],
      outputDir: './',
    }),
    // Customer Account API
    customer: shopifyApiProject({
      apiType: ApiType.Customer,
      apiVersion: '2025-01',
      documents: ['./app/graphql/customer-account/*.ts'],
      outputDir: './',
    }),
  },
};
```

### Type Generation Workflow

**Automated Types**
```bash
# Generate types after query changes
npm run codegen

# Or auto-generate on file change
npm run codegen -- --watch
```

**Using Generated Types**
```typescript
// Import generated types
import type {
  ProductQuery,
  ProductQueryVariables,
  ProductFragment,
} from 'storefrontapi.generated';

// Type-safe query
export async function loader({context, params}: Route.LoaderArgs) {
  const {storefront} = context;
  
  const {product} = await storefront.query<
    ProductQuery,
    ProductQueryVariables
  >(PRODUCT_QUERY, {
    variables: {
      handle: params.handle, // Type-checked
      selectedOptions: [], // Type-checked
    },
  });
  
  // product is fully typed
  return {product};
}
```

## Common Pitfalls & Solutions

### Problem: Query Cost Too High

**Symptom:** Shopify throttles or rejects query

**Solution:** Reduce query complexity
```typescript
// WRONG: Requesting too many items
const {products} = await storefront.query(`
  query {
    products(first: 250) { # Too many!
      nodes {
        variants(first: 100) { # Way too many!
          nodes { ... }
        }
      }
    }
  }
`);

// RIGHT: Reasonable pagination
const {products} = await storefront.query(`
  query {
    products(first: 24) { # Reasonable
      nodes {
        variants(first: 10) { # Reasonable
          nodes { ... }
        }
      }
    }
  }
`);
```

### Problem: Missing @inContext Directive

**Symptom:** Wrong currency/language returned

**Solution:** Always use @inContext
```typescript
// WRONG: No localization
const PRODUCT_QUERY = `#graphql
  query Product($handle: String!) {
    product(handle: $handle) {
      title
      priceRange { ... }
    }
  }
`;

// RIGHT: With @inContext
const PRODUCT_QUERY = `#graphql
  query Product($handle: String!) 
    @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      title # Localized
      priceRange { ... } # Localized currency
    }
  }
`;
```

### Problem: Fragment Nesting Too Deep

**Symptom:** Slow query performance

**Solution:** Flatten fragment structure
```typescript
// AVOID: Deep nesting
const FRAGMENT_A = `fragment A on Product { ...B }`;
const FRAGMENT_B = `fragment B on Product { ...C }`;
const FRAGMENT_C = `fragment C on Product { ...D }`;
const FRAGMENT_D = `fragment D on Product { id title }`;

// PREFER: Shallow structure
const PRODUCT_BASICS = `fragment ProductBasics on Product { id title }`;
const PRODUCT_WITH_PRICE = `
  fragment ProductWithPrice on Product {
    ...ProductBasics
    priceRange { ... }
  }
`;
```

### Problem: Codegen Not Updating

**Symptom:** Types don't match queries

**Solution:** Re-run codegen
```bash
# Delete old types
rm storefrontapi.generated.d.ts

# Regenerate
npm run codegen

# If still broken, clear cache
rm -rf node_modules/.cache
npm run codegen
```

## Testing Patterns

### Mock GraphQL Responses

```typescript
import {describe, it, expect, vi} from 'vitest';

describe('Product Loader', () => {
  it('should fetch product', async () => {
    const mockStorefront = {
      query: vi.fn().mockResolvedValue({
        data: {
          product: {
            id: 'gid://shopify/Product/123',
            title: 'Test Product',
            handle: 'test-product',
          },
        },
        errors: undefined,
      }),
    };
    
    const result = await loader({
      context: {storefront: mockStorefront},
      params: {handle: 'test-product'},
    });
    
    expect(mockStorefront.query).toHaveBeenCalledWith(
      expect.stringContaining('query Product'),
      expect.objectContaining({
        variables: {handle: 'test-product'},
      })
    );
    
    expect(result.product.title).toBe('Test Product');
  });
});
```

### Query Validation

```typescript
describe('GraphQL Queries', () => {
  it('should have valid syntax', () => {
    expect(PRODUCT_QUERY).toContain('query Product');
    expect(PRODUCT_QUERY).toContain('@inContext');
  });
  
  it('should use fragments', () => {
    expect(PRODUCT_QUERY).toContain('...ProductCard');
    expect(PRODUCT_QUERY).toContain(PRODUCT_CARD_FRAGMENT);
  });
  
  it('should use as const', () => {
    // TypeScript will error if not using 'as const'
    type QueryType = typeof PRODUCT_QUERY;
    const isLiteral: QueryType extends string ? false : true = true;
  });
});
```

## Migration Notes

### From Remix to React Router

```typescript
// No changes needed for GraphQL queries
// Only import paths change for useLoaderData, etc.

// OLD
import {useLoaderData} from '@remix-run/react';

// NEW
import {useLoaderData} from 'react-router';

// Queries remain identical
```

### API Version Updates

```bash
# Update API version in config
# .graphqlrc.ts
apiVersion: '2025-01', // Update this

# Regenerate types
npm run codegen

# Check for deprecated fields
# Review Shopify API changelog
```

## Related Resources

- Shopify Storefront API: https://shopify.dev/docs/api/storefront
- GraphQL Best Practices: https://graphql.org/learn/best-practices/
- Hydrogen GraphQL: https://shopify.dev/docs/api/hydrogen/2025-01/utilities/storefront
- Apollo Client Docs: https://www.apollographql.com/docs/react/
