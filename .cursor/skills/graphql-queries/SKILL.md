# GraphQL Queries Skill

## Overview

This skill covers GraphQL query patterns, fragment composition, and code generation for Shopify Storefront and Customer Account APIs. Use this when writing new GraphQL queries or understanding the GraphQL architecture.

**Relationship with shopify-storefront-api:** This skill focuses on GraphQL query composition, fragments, and patterns. The `shopify-storefront-api` skill focuses on executing those queries in loaders and handling responses. Use both together: this skill for query structure, storefront-api for execution.

## Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| GraphQL Client | Shopify Hydrogen | 2025.7.3 |
| Code Generation | @shopify/hydrogen-codegen | ^0.3.3 |
| Type Generation | @graphql-codegen/cli | 5.0.2 |

## Directory Structure

```
app/
├── graphql/
│   └── customer-account/
│       ├── CustomerDetailsQuery.ts
│       ├── CustomerUpdateMutation.ts
│       ├── CustomerOrdersQuery.ts
│       ├── CustomerOrderQuery.ts
│       └── CustomerAddressMutations.ts
├── lib/
│   └── fragments.ts              # Reusable fragments
├── routes/
│   └── *.tsx                     # Queries defined inline
├── .graphqlrc.ts                 # GraphQL config
└── storefrontapi.generated.d.ts  # Generated types
```

## Core Patterns

### Pattern: Define Query with Fragments

**When to use:** Create reusable, composable GraphQL queries

```typescript
// Define fragments first
const PRODUCT_VARIANT_FRAGMENT = `#graphql
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
` as const;

// Use fragments in queries
const PRODUCT_QUERY = `#graphql
  fragment Product on Product {
    id
    title
    description
    descriptionHtml
    handle
    vendor
    productType
    options(first: 10) {
      id
      name
      optionValues {
        id
        name
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
  }

  query Product($handle: String!, $selectedOptions: [SelectedOptionInput!]!) 
    @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;
```

### Pattern: Query with Pagination

**When to use:** Fetch paginated lists (collections, orders, products)

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

### Pattern: Mutation with Error Handling

**When to use:** Modify data (create, update, delete)

```typescript
const CUSTOMER_UPDATE_MUTATION = `#graphql
  mutation CustomerUpdate($customer: CustomerUpdateInput!) {
    customerUpdate(input: {customer: $customer}) {
      customer {
        id
        firstName
        lastName
        emailAddress {
          emailAddress
        }
        phoneNumber {
          phoneNumber
        }
      }
      userErrors {
        field
        message
        code
      }
    }
  }
` as const;

// Usage with error handling
const {data, errors} = await customerAccount.mutate(
  CUSTOMER_UPDATE_MUTATION,
  {
    variables: {
      customer: {
        firstName: 'John',
        lastName: 'Doe',
      },
    },
  },
);

if (errors?.length || data?.customerUpdate?.userErrors?.length) {
  // Handle errors
  return {
    success: false,
    errors: [
      ...(errors?.map((e) => ({message: e.message})) || []),
      ...(data?.customerUpdate?.userErrors || []),
    ],
  };
}
```

### Pattern: Localization with @inContext

**When to use:** Support multiple languages and currencies

```typescript
const PRODUCT_QUERY = `#graphql
  query Product($handle: String!) 
    @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      id
      title
      description
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
    }
  }
` as const;

// The @inContext directive automatically uses language and country
// from context.i18n (set in createHydrogenRouterContext)
```

### Pattern: Metafields

**When to use:** Query custom product/collection data

```typescript
const PRODUCT_WITH_METAFIELDS_QUERY = `#graphql
  query Product($handle: String!) 
    @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      id
      title
      metafields(identifiers: [
        {namespace: "custom", key: "shipping_estimate"}
        {namespace: "custom", key: "materials"}
        {namespace: "custom", key: "dimensions"}
        {namespace: "custom", key: "care_instructions"}
      ]) {
        key
        value
        type
        reference {
          ... on MediaImage {
            image {
              url
            }
          }
        }
      }
    }
  }
` as const;
```

## Type/Model Definitions

```typescript
// Import generated types
import type {
  ProductQuery,
  ProductQueryVariables,
  ProductVariantFragment,
  CollectionQuery,
} from 'storefrontapi.generated';

// Use generated types
type Product = NonNullable<ProductQuery['product']>;
type ProductVariant = ProductVariantFragment;

// Type-safe query execution
const {product} = await storefront.query<ProductQuery, ProductQueryVariables>(
  PRODUCT_QUERY,
  {
    variables: {
      handle: 'recovery-token-1-year',
      selectedOptions: [],
    },
  },
);
```

## Common GraphQL Fragments

### Money Fragment

```typescript
export const MONEY_FRAGMENT = `#graphql
  fragment Money on MoneyV2 {
    currencyCode
    amount
  }
` as const;
```

### Image Fragment

```typescript
export const IMAGE_FRAGMENT = `#graphql
  fragment Image on Image {
    id
    url
    altText
    width
    height
  }
` as const;
```

### Product Card Fragment

```typescript
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
      ...Image
    }
  }
  ${MONEY_FRAGMENT}
  ${IMAGE_FRAGMENT}
` as const;
```

### Page Info Fragment

```typescript
export const PAGE_INFO_FRAGMENT = `#graphql
  fragment PageInfo on PageInfo {
    hasNextPage
    hasPreviousPage
    startCursor
    endCursor
  }
` as const;
```

## Code Generation

### GraphQL Config (.graphqlrc.ts)

```typescript
import {ApiType, shopifyApiProject} from '@shopify/api-codegen-preset';

export default {
  projects: {
    // Storefront API
    default: shopifyApiProject({
      apiType: ApiType.Storefront,
      apiVersion: '2025-01',
      documents: ['./app/**/*.{ts,tsx}'],
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

### Run Code Generation

```bash
# Generate types for all GraphQL queries
npm run codegen

# Or use Hydrogen's build command (includes codegen)
npm run build
```

## Query Patterns

### Search Query

```typescript
const SEARCH_QUERY = `#graphql
  query Search(
    $query: String!
    $first: Int!
    $startCursor: String
  ) @inContext(country: $country, language: $language) {
    search(
      query: $query
      first: $first
      after: $startCursor
      types: [PRODUCT]
      unavailableProducts: HIDE
    ) {
      nodes {
        ... on Product {
          ...ProductCard
        }
      }
      pageInfo {
        ...PageInfo
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
  ${PAGE_INFO_FRAGMENT}
` as const;
```

### Menu Query

```typescript
const MENU_QUERY = `#graphql
  fragment MenuItem on MenuItem {
    id
    resourceId
    tags
    title
    type
    url
  }
  
  fragment ChildMenuItem on MenuItem {
    ...MenuItem
  }
  
  fragment ParentMenuItem on MenuItem {
    ...MenuItem
    items {
      ...ChildMenuItem
    }
  }
  
  fragment Menu on Menu {
    id
    items {
      ...ParentMenuItem
    }
  }
  
  query Menu($handle: String!) 
    @inContext(country: $country, language: $language) {
    menu(handle: $handle) {
      ...Menu
    }
  }
` as const;
```

## Testing Patterns

```typescript
import {describe, it, expect} from 'vitest';

describe('GraphQL Queries', () => {
  it('should have valid syntax', () => {
    expect(PRODUCT_QUERY).toContain('query Product');
    expect(PRODUCT_QUERY).toContain('fragment Product');
  });
  
  it('should include required fields', () => {
    expect(PRODUCT_QUERY).toContain('id');
    expect(PRODUCT_QUERY).toContain('title');
    expect(PRODUCT_QUERY).toContain('handle');
  });
});
```

## Gotchas & Best Practices

- **DO:** Use fragments to avoid duplication
- **DO:** Include `@inContext` for localized queries
- **DO:** Use `as const` for query strings (enables type inference)
- **DO:** Handle both GraphQL errors and userErrors in mutations
- **DO:** Query only the fields you need (avoid over-fetching)
- **DO:** Use pagination for large lists
- **AVOID:** Hardcoding API versions (use config)
- **AVOID:** Nesting fragments too deeply (performance impact)
- **AVOID:** Querying unnecessary fields
- **AVOID:** Forgetting to run codegen after schema changes
- **AVOID:** Using deprecated fields (check Shopify changelog)

## Related Skills

- `shopify-storefront-api` - Executing queries in loaders
- `shopify-customer-account-api` - Customer-specific queries
- `react-router-patterns` - Using queries in loaders
- `cart-management` - Cart query fragments
