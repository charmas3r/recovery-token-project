# SEO & Structured Data Reference

## Industry Best Practices

### Meta Tags Priority

**Essential Meta Tags**
```typescript
export const meta: Route.MetaFunction = ({data}) => {
  const product = data?.product;
  
  return [
    // 1. Title (most important)
    {title: `${product.title} | Recovery Token Store`},
    
    // 2. Description (search snippet)
    {
      name: 'description',
      content: product.description || `Buy ${product.title} at Recovery Token Store`,
    },
    
    // 3. Canonical URL (prevent duplicates)
    {
      tagName: 'link',
      rel: 'canonical',
      href: `https://recoverytoken.store/products/${product.handle}`,
    },
    
    // 4. OpenGraph (social sharing)
    {property: 'og:type', content: 'product'},
    {property: 'og:title', content: product.title},
    {property: 'og:description', content: product.description},
    {property: 'og:image', content: product.featuredImage?.url},
    {property: 'og:url', content: `https://recoverytoken.store/products/${product.handle}`},
    
    // 5. Twitter Card
    {name: 'twitter:card', content: 'summary_large_image'},
    {name: 'twitter:title', content: product.title},
    {name: 'twitter:description', content: product.description},
    {name: 'twitter:image', content: product.featuredImage?.url},
  ];
};
```

**Title Formatting**
```typescript
// DO: Clear hierarchy with separator
{title: 'Product Name | Category | Store Name'}
{title: '1 Year Token | Recovery Tokens | Recovery Token Store'}

// AVOID: Too long (truncated in search)
{title: 'Buy 1 Year Recovery Token - Perfect for 1 Year Sobriety Anniversary - Premium Quality - Recovery Token Store'} // 100+ chars

// AVOID: Keyword stuffing
{title: 'Recovery Token, Sobriety Token, AA Token, NA Token, Recovery Chip'}
```

### Structured Data Hierarchy

**Product Schema with All Details**
```typescript
const productSchema = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: product.title,
  description: product.description,
  sku: product.variants.nodes[0]?.sku,
  mpn: product.variants.nodes[0]?.sku, // Manufacturer part number
  brand: {
    '@type': 'Brand',
    name: product.vendor || 'Recovery Token Store',
  },
  
  // Images (multiple recommended)
  image: product.images.nodes.map((img) => img.url),
  
  // Aggregate offer (multiple variants)
  offers: {
    '@type': 'AggregateOffer',
    lowPrice: product.priceRange.minVariantPrice.amount,
    highPrice: product.priceRange.maxVariantPrice.amount,
    priceCurrency: product.priceRange.minVariantPrice.currencyCode,
    availability: product.availableForSale
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock',
    url: `https://recoverytoken.store/products/${product.handle}`,
    priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
  },
  
  // Reviews (if available)
  aggregateRating: reviewsSummary ? {
    '@type': 'AggregateRating',
    ratingValue: reviewsSummary.rating,
    reviewCount: reviewsSummary.reviewCount,
    bestRating: 5,
    worstRating: 1,
  } : undefined,
};
```

### Breadcrumb Navigation

**Proper Breadcrumb Schema**
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
      name: 'Recovery Tokens',
      item: 'https://recoverytoken.store/collections/recovery-tokens',
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: product.title,
      item: `https://recoverytoken.store/products/${product.handle}`,
    },
  ],
};

// Render in component
<JsonLd data={breadcrumbSchema} />

// Also render visual breadcrumbs
<nav aria-label="Breadcrumb">
  <ol>
    <li><Link to="/">Home</Link></li>
    <li><Link to="/collections/recovery-tokens">Recovery Tokens</Link></li>
    <li aria-current="page">{product.title}</li>
  </ol>
</nav>
```

## Schema.org Patterns

### Organization Schema

**Company Information**
```typescript
// app/root.tsx
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Recovery Token Store',
  url: 'https://recoverytoken.store',
  logo: {
    '@type': 'ImageObject',
    url: 'https://recoverytoken.store/logo.png',
    width: 600,
    height: 60,
  },
  description: 'Premium recovery tokens and sobriety gifts',
  
  // Contact info
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+1-555-0123',
    contactType: 'Customer Service',
    email: 'support@recoverytoken.store',
    availableLanguage: ['English'],
    areaServed: 'US',
  },
  
  // Social profiles
  sameAs: [
    'https://www.facebook.com/recoverytokenstore',
    'https://www.instagram.com/recoverytokenstore',
    'https://www.twitter.com/recoverytokens',
  ],
  
  // Address
  address: {
    '@type': 'PostalAddress',
    streetAddress: '123 Main St',
    addressLocality: 'City',
    addressRegion: 'ST',
    postalCode: '12345',
    addressCountry: 'US',
  },
};
```

### WebSite Schema with SearchAction

**Enable Site Search**
```typescript
const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Recovery Token Store',
  url: 'https://recoverytoken.store',
  
  // Enable search box in Google
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://recoverytoken.store/search?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
};
```

### FAQ Schema

**Rich Results for FAQs**
```typescript
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is the engraving turnaround time?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Custom engraving typically adds 2-3 business days to processing time. Rush engraving is available for an additional fee.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can engraved tokens be returned?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Engraved tokens are custom-made and cannot be returned unless defective. We offer a preview before engraving to ensure accuracy.',
      },
    },
    {
      '@type': 'Question',
      name: 'What materials are the tokens made from?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Our tokens are made from high-quality brass with a durable lacquer coating to prevent tarnishing.',
      },
    },
  ],
};
```

## Performance Optimization

### Defer Non-Critical Schema

**Load Reviews Schema Lazily**
```typescript
export default function ProductPage() {
  const {product} = useLoaderData<typeof loader>();
  const [reviews, setReviews] = useState(null);
  
  useEffect(() => {
    // Load reviews after page load
    fetch(`/api/reviews/${product.id}`)
      .then(res => res.json())
      .then(setReviews);
  }, [product.id]);
  
  return (
    <div>
      {/* Critical schema (render immediately) */}
      <JsonLd data={productSchema} />
      <JsonLd data={breadcrumbSchema} />
      
      {/* Non-critical schema (defer) */}
      {reviews && <JsonLd data={reviewsSchema(reviews)} />}
      
      {/* Page content */}
    </div>
  );
}
```

### Minimize Schema Size

**Remove Optional Fields**
```typescript
// DO: Only include valuable fields
const minimalProductSchema = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: product.title,
  image: product.featuredImage?.url, // Single image
  offers: {
    '@type': 'Offer',
    price: product.priceRange.minVariantPrice.amount,
    priceCurrency: product.priceRange.minVariantPrice.currencyCode,
    availability: 'https://schema.org/InStock',
  },
};

// AVOID: Including empty fields
const bloatedSchema = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: product.title,
  description: '', // Empty
  sku: null, // Null
  review: [], // Empty array
  offers: {
    '@type': 'Offer',
    seller: undefined, // Undefined
  },
};
```

## SEO Best Practices

### Unique Page Titles

**Avoid Duplicates**
```typescript
// DO: Unique titles per page
export const meta: Route.MetaFunction = ({data, location}) => {
  // Product page
  if (data.product) {
    return [{title: `${data.product.title} | Store`}];
  }
  
  // Collection page
  if (data.collection) {
    const page = new URL(location.url).searchParams.get('page');
    const pageNum = page ? ` - Page ${page}` : '';
    return [{title: `${data.collection.title}${pageNum} | Store`}];
  }
  
  // Fallback
  return [{title: 'Recovery Token Store'}];
};
```

### Image Alt Text

**Descriptive Alt Text**
```typescript
// DO: Descriptive, keyword-rich
<img
  src={product.featuredImage.url}
  alt={`${product.title} - ${product.productType} featuring ${product.description.slice(0, 50)}`}
/>

// AVOID: Generic or missing
<img src={product.featuredImage.url} alt="product" />
<img src={product.featuredImage.url} /> // Missing alt
```

### Canonical URLs

**Handle Query Parameters**
```typescript
export const meta: Route.MetaFunction = ({location}) => {
  // Remove tracking params for canonical
  const url = new URL(location.url);
  const cleanUrl = new URL(url.pathname, url.origin);
  
  // Keep important params (e.g., variant)
  const variant = url.searchParams.get('variant');
  if (variant) {
    cleanUrl.searchParams.set('variant', variant);
  }
  
  return [
    {
      tagName: 'link',
      rel: 'canonical',
      href: cleanUrl.toString(),
    },
  ];
};
```

## Sitemap Generation

### Dynamic Sitemap

**Include All Pages**
```typescript
export async function loader({context}: Route.LoaderArgs) {
  const {storefront} = context;
  
  // Fetch all products and collections
  const [productsData, collectionsData, articlesData] = await Promise.all([
    storefront.query(ALL_PRODUCTS_QUERY),
    storefront.query(ALL_COLLECTIONS_QUERY),
    storefront.query(ALL_ARTICLES_QUERY),
  ]);
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <!-- Homepage -->
  <url>
    <loc>https://recoverytoken.store/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <lastmod>${new Date().toISOString()}</lastmod>
  </url>
  
  <!-- Products -->
  ${productsData.products.nodes.map((product) => `
  <url>
    <loc>https://recoverytoken.store/products/${product.handle}</loc>
    <lastmod>${product.updatedAt}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    ${product.images.nodes.map((image) => `
    <image:image>
      <image:loc>${image.url}</image:loc>
      <image:title>${product.title}</image:title>
    </image:image>
    `).join('')}
  </url>
  `).join('')}
  
  <!-- Collections -->
  ${collectionsData.collections.nodes.map((collection) => `
  <url>
    <loc>https://recoverytoken.store/collections/${collection.handle}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  `).join('')}
  
  <!-- Articles -->
  ${articlesData.articles.nodes.map((article) => `
  <url>
    <loc>https://recoverytoken.store/blog/${article.handle}</loc>
    <lastmod>${article.publishedAt}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  `).join('')}
</urlset>`;
  
  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    },
  });
}
```

### Sitemap Index (Large Catalogs)

**Split into Multiple Sitemaps**
```typescript
// /sitemap.xml (index)
export async function loader() {
  const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://recoverytoken.store/sitemap-products.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://recoverytoken.store/sitemap-collections.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://recoverytoken.store/sitemap-pages.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
</sitemapindex>`;
  
  return new Response(sitemapIndex, {
    headers: {'Content-Type': 'application/xml'},
  });
}
```

## Robots.txt

**Production Configuration**
```typescript
export function loader({context}: Route.LoaderArgs) {
  const {env} = context;
  
  // Different rules for production vs staging
  const isProduction = env.PUBLIC_STORE_DOMAIN === 'recoverytoken.store';
  
  const robotsTxt = isProduction
    ? `# Production
User-agent: *
Allow: /
Disallow: /admin
Disallow: /cart
Disallow: /checkout
Disallow: /account
Disallow: /api

# Crawl delay
Crawl-delay: 1

# Sitemaps
Sitemap: https://recoverytoken.store/sitemap.xml
`
    : `# Staging - Block all crawlers
User-agent: *
Disallow: /
`;
  
  return new Response(robotsTxt, {
    headers: {'Content-Type': 'text/plain'},
  });
}
```

## Testing & Validation

### Structured Data Testing

**Google Rich Results Test**
```bash
# Use Google's Rich Results Test
https://search.google.com/test/rich-results

# Or Schema.org validator
https://validator.schema.org/

# Or programmatically
npm install --save-dev schema-dts
```

**Automated Validation**
```typescript
import {describe, it, expect} from 'vitest';

describe('Structured Data', () => {
  it('should have valid product schema', () => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Test Product',
      offers: {
        '@type': 'Offer',
        price: '19.99',
        priceCurrency: 'USD',
      },
    };
    
    // Validate required fields
    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('Product');
    expect(schema.name).toBeTruthy();
    expect(schema.offers).toBeTruthy();
  });
});
```

## Common Pitfalls

### Problem: Duplicate Content

**Symptom:** Same content indexed multiple times

**Solution:** Use canonical tags
```typescript
// Product with variants
export const meta: Route.MetaFunction = ({location, data}) => {
  const baseUrl = `https://recoverytoken.store/products/${data.product.handle}`;
  
  return [
    // Always point to base URL
    {
      tagName: 'link',
      rel: 'canonical',
      href: baseUrl, // Remove ?variant= param
    },
  ];
};
```

### Problem: Missing Structured Data

**Symptom:** No rich results in Google

**Solution:** Validate and fix schema
```typescript
// Use Rich Results Test tool
// Common issues:
// - Missing required fields (price, availability)
// - Invalid dates
// - Wrong @type
// - Malformed JSON
```

## Related Resources

- Schema.org: https://schema.org/
- Google Search Central: https://developers.google.com/search
- React Helmet Async: https://github.com/staylor/react-helmet-async
- Sitemap Protocol: https://www.sitemaps.org/protocol.html
