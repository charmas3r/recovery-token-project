# SEO & Structured Data Skill

## Overview

This skill covers SEO meta tags, Schema.org JSON-LD structured data, sitemaps, and OpenGraph tags for optimal search engine visibility and social sharing. Use this when implementing SEO for any page.

## Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| Meta Tags | React Router meta function | 7.12.0 |
| Structured Data | Schema.org JSON-LD | Latest |
| Framework | Shopify Hydrogen | 2025.7.3 |

## Directory Structure

```
app/
├── components/
│   └── seo/
│       ├── JsonLd.tsx        # JSON-LD helper component
│       └── MetaTags.tsx      # Meta tags helper
└── routes/
    └── *.tsx                 # Routes with meta exports
```

## Core Patterns

### Pattern: Page Meta Tags

**When to use:** Set title, description, and canonical URL for any page

```typescript
import type {Route} from './+types/products.$handle';

export const meta: Route.MetaFunction = ({data, params}) => {
  const product = data?.product;
  
  if (!product) {
    return [
      {title: 'Product Not Found'},
    ];
  }
  
  return [
    {title: `${product.title} | Recovery Token Store`},
    {name: 'description', content: product.description},
    {rel: 'canonical', href: `https://recoverytoken.store/products/${product.handle}`},
    
    // OpenGraph tags
    {property: 'og:type', content: 'product'},
    {property: 'og:title', content: product.title},
    {property: 'og:description', content: product.description},
    {property: 'og:image', content: product.featuredImage?.url},
    {property: 'og:url', content: `https://recoverytoken.store/products/${product.handle}`},
    
    // Twitter Card
    {name: 'twitter:card', content: 'summary_large_image'},
    {name: 'twitter:title', content: product.title},
    {name: 'twitter:description', content: product.description},
    {name: 'twitter:image', content: product.featuredImage?.url},
    
    // Product-specific meta
    {property: 'product:price:amount', content: product.priceRange.minVariantPrice.amount},
    {property: 'product:price:currency', content: product.priceRange.minVariantPrice.currencyCode},
  ];
};
```

### Pattern: Product Schema (JSON-LD)

**When to use:** Add structured data for products

**File Location:** Create `app/components/seo/JsonLd.tsx` first

```typescript
interface JsonLdProps {
  data: Record<string, unknown>;
}

export function JsonLd({data}: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{__html: JSON.stringify(data)}}
    />
  );
}
```

**Product Page Usage:**

```typescript
import {JsonLd} from '~/components/seo/JsonLd';

export default function ProductPage() {
  const {product} = useLoaderData<typeof loader>();
  
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: product.images.nodes.map((img) => img.url),
    sku: product.variants.nodes[0]?.sku,
    brand: {
      '@type': 'Brand',
      name: product.vendor,
    },
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: product.priceRange.minVariantPrice.amount,
      highPrice: product.priceRange.maxVariantPrice.amount,
      priceCurrency: product.priceRange.minVariantPrice.currencyCode,
      availability: product.availableForSale
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: `https://recoverytoken.store/products/${product.handle}`,
    },
  };
  
  return (
    <div>
      <JsonLd data={productSchema} />
      {/* Product content */}
    </div>
  );
}
```

### Pattern: Product with Reviews Schema

**When to use:** Add review aggregation to product schema

```typescript
const productWithReviewsSchema = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: product.title,
  description: product.description,
  image: product.featuredImage?.url,
  aggregateRating: reviews?.rating ? {
    '@type': 'AggregateRating',
    ratingValue: reviews.rating,
    reviewCount: reviews.count,
    bestRating: 5,
    worstRating: 1,
  } : undefined,
  review: reviews?.items?.map((review) => ({
    '@type': 'Review',
    author: {
      '@type': 'Person',
      name: review.author,
    },
    datePublished: review.date,
    reviewBody: review.text,
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
    availability: 'https://schema.org/InStock',
  },
};
```

### Pattern: Breadcrumb Schema

**When to use:** Show navigation hierarchy

```typescript
const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://recoverytoken.store/',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Collections',
      item: 'https://recoverytoken.store/collections',
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: collection.title,
      item: `https://recoverytoken.store/collections/${collection.handle}`,
    },
    {
      '@type': 'ListItem',
      position: 4,
      name: product.title,
      item: `https://recoverytoken.store/products/${product.handle}`,
    },
  ],
};
```

### Pattern: Organization Schema

**When to use:** Add business information (typically in root layout)

**File Location:** `app/root.tsx`

```typescript
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Recovery Token Store',
  url: 'https://recoverytoken.store',
  logo: 'https://recoverytoken.store/logo.png',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'Customer Service',
    email: 'support@recoverytoken.store',
    availableLanguage: ['English'],
  },
  sameAs: [
    'https://www.facebook.com/recoverytokenstore',
    'https://www.instagram.com/recoverytokenstore',
  ],
};
```

### Pattern: FAQ Schema

**When to use:** Structured data for FAQ pages

```typescript
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How long does engraving take?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Custom engraving typically adds 2-3 business days to processing time.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I return an engraved token?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Engraved tokens are custom-made and cannot be returned unless defective.',
      },
    },
  ],
};
```

## Type/Model Definitions

```typescript
// Schema.org types
interface SchemaOrganization {
  '@context': 'https://schema.org';
  '@type': 'Organization';
  name: string;
  url: string;
  logo?: string;
  contactPoint?: SchemaContactPoint;
  sameAs?: string[];
}

interface SchemaProduct {
  '@context': 'https://schema.org';
  '@type': 'Product';
  name: string;
  description?: string;
  image?: string | string[];
  brand?: SchemaBrand;
  offers?: SchemaOffer | SchemaAggregateOffer;
  aggregateRating?: SchemaAggregateRating;
  review?: SchemaReview[];
}

interface SchemaAggregateRating {
  '@type': 'AggregateRating';
  ratingValue: number;
  reviewCount: number;
  bestRating: number;
  worstRating: number;
}

interface SchemaReview {
  '@type': 'Review';
  author: {
    '@type': 'Person';
    name: string;
  };
  datePublished: string;
  reviewBody: string;
  reviewRating: {
    '@type': 'Rating';
    ratingValue: number;
    bestRating: number;
    worstRating: number;
  };
}

interface SchemaBreadcrumbList {
  '@context': 'https://schema.org';
  '@type': 'BreadcrumbList';
  itemListElement: SchemaBreadcrumbItem[];
}

interface SchemaBreadcrumbItem {
  '@type': 'ListItem';
  position: number;
  name: string;
  item?: string;
}
```

## Common Schemas

### Website Schema

```typescript
const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Recovery Token Store',
  url: 'https://recoverytoken.store',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://recoverytoken.store/search?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};
```

### Collection Schema

```typescript
const collectionSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: collection.title,
  description: collection.description,
  url: `https://recoverytoken.store/collections/${collection.handle}`,
  image: collection.image?.url,
};
```

## Sitemap Pattern

**File Location:** `app/routes/($locale).[sitemap.xml].tsx`

```typescript
import type {Route} from './+types/sitemap.xml';

export async function loader({context}: Route.LoaderArgs) {
  const {storefront} = context;
  
  // Fetch all products and collections
  const {products} = await storefront.query(ALL_PRODUCTS_QUERY);
  const {collections} = await storefront.query(ALL_COLLECTIONS_QUERY);
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://recoverytoken.store/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  ${products.nodes.map((product) => `
  <url>
    <loc>https://recoverytoken.store/products/${product.handle}</loc>
    <lastmod>${product.updatedAt}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  `).join('')}
  ${collections.nodes.map((collection) => `
  <url>
    <loc>https://recoverytoken.store/collections/${collection.handle}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  `).join('')}
</urlset>`;
  
  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
```

## Robots.txt Pattern

**File Location:** `app/routes/[robots.txt].tsx`

```typescript
export function loader() {
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /cart
Disallow: /account
Disallow: /checkout

Sitemap: https://recoverytoken.store/sitemap.xml
`;
  
  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
```

## Testing Patterns

```typescript
import {describe, it, expect} from 'vitest';

describe('Schema.org Validation', () => {
  it('should generate valid product schema', () => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Test Product',
    };
    
    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('Product');
    expect(schema.name).toBe('Test Product');
  });
});
```

## Gotchas & Best Practices

- **DO:** Use canonical URLs to prevent duplicate content issues
- **DO:** Include OpenGraph and Twitter Card meta tags
- **DO:** Add structured data for all product pages
- **DO:** Test structured data with Google Rich Results Test
- **DO:** Include breadcrumb navigation for better UX and SEO
- **DO:** Set appropriate cache headers for sitemaps
- **AVOID:** Duplicate titles across pages
- **AVOID:** Missing meta descriptions (use product descriptions)
- **AVOID:** Invalid JSON-LD (validate before deploying)
- **AVOID:** Forgetting to update sitemap when adding pages
- **AVOID:** Using relative URLs in structured data (use absolute URLs)

## Related Skills

- `react-router-patterns` - Meta function exports
- `shopify-storefront-api` - Product/collection queries for schema
- `reviews-integration` - Review schema with Judge.me data
- `ui-components` - Breadcrumb components
