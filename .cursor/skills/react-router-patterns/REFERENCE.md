# React Router Patterns - Reference Documentation

**Last Updated:** January 30, 2026  
**Skill:** react-router-patterns  
**Purpose:** React Router v7 best practices for Hydrogen applications

---

## React Router v7 vs Remix

**IMPORTANT:** Hydrogen uses React Router v7, NOT Remix!

```typescript
// ✅ CORRECT: React Router v7 imports
import {useLoaderData, Form, redirect} from 'react-router';
import type {Route} from './+types/route-name';

// ❌ WRONG: Remix imports (don't use these!)
import {useLoaderData, Form, redirect} from '@remix-run/react';
import type {LoaderFunctionArgs} from '@remix-run/node';
```

## Industry Best Practices

### 1. Data Loading Patterns

**Critical vs Deferred Data (Google's RAIL Model)**

```typescript
// ✅ GOOD: Optimize TTFB with deferred data
export async function loader(args: Route.LoaderArgs) {
  // Deferred (non-blocking): Returns promises
  const deferredData = {
    relatedProducts: loadRelatedProducts(args), // Don't await
    reviews: loadReviews(args), // Don't await
  };
  
  // Critical (blocking): Await before returning
  const criticalData = await loadCriticalData(args);
  
  // TTFB only waits for critical data
  return {...deferredData, ...criticalData};
}

// In component: Use Suspense for deferred data
<Suspense fallback={<Loading />}>
  <Await resolve={relatedProducts}>
    {(products) => <ProductGrid products={products} />}
  </Await>
</Suspense>
```

**When to Defer:**
- Product recommendations
- Reviews
- Related content
- Analytics data
- Non-critical images

**When NOT to Defer:**
- Primary product data
- User authentication status
- Cart contents
- Hero images
- Above-the-fold content

### 2. Error Handling (Graceful Degradation)

**Industry Standard: Error Boundaries + Fallbacks**

```typescript
// Route-level error boundary
export function ErrorBoundary() {
  const error = useRouteError();
  
  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return (
        <div>
          <h1>404: Product Not Found</h1>
          <p>This product may have been removed or is no longer available.</p>
          <Link to="/collections/all">Browse All Products</Link>
        </div>
      );
    }
    
    if (error.status === 500) {
      return (
        <div>
          <h1>500: Server Error</h1>
          <p>We're experiencing technical difficulties. Please try again.</p>
        </div>
      );
    }
  }
  
  // Generic error fallback
  return (
    <div>
      <h1>Something Went Wrong</h1>
      <p>Please try refreshing the page.</p>
    </div>
  );
}
```

### 3. Loading States (Skeleton UI)

**Industry Standard: Optimistic UI + Skeletons**

```typescript
import {useNavigation} from 'react-router';

export function ProductList() {
  const navigation = useNavigation();
  const {products} = useLoaderData<typeof loader>();
  
  // Show skeleton during navigation
  if (navigation.state === 'loading') {
    return <ProductListSkeleton />;
  }
  
  return (
    <div className="grid grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

function ProductListSkeleton() {
  return (
    <div className="grid grid-cols-4 gap-6">
      {Array.from({length: 8}).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-square bg-gray-200 rounded" />
          <div className="mt-2 h-4 bg-gray-200 rounded w-3/4" />
          <div className="mt-1 h-4 bg-gray-200 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}
```

## Performance Optimization

### 1. Prefetching Strategies

**Prefetch on Intent (Industry Best Practice)**

```typescript
// ✅ GOOD: Prefetch on hover (intent-based)
<Link to="/products/token-1-year" prefetch="intent">
  1 Year Recovery Token
</Link>
// Prefetches when user hovers - likely to click

// ✅ GOOD: Prefetch in viewport (for featured products)
<Link to="/products/featured" prefetch="viewport">
  Featured Product
</Link>
// Prefetches when link enters viewport

// ⚠️ CAREFUL: Prefetch on render
<Link to="/products/all" prefetch="render">
  All Products
</Link>
// Prefetches immediately - use sparingly

// ❌ BAD: No prefetch for likely navigation
<Link to="/products/popular">Popular Product</Link>
// User waits for data when they click
```

### 2. Parallel Data Fetching

```typescript
// ✅ GOOD: Fetch in parallel
async function loadCriticalData({context, params}: Route.LoaderArgs) {
  const {storefront} = context;
  
  const [
    {product},
    {collection},
    {shop},
  ] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {variables: {handle: params.handle}}),
    storefront.query(COLLECTION_QUERY, {variables: {handle: params.collection}}),
    storefront.query(SHOP_QUERY),
  ]);
  
  return {product, collection, shop};
}

// ❌ BAD: Sequential fetching
async function loadCriticalData({context, params}: Route.LoaderArgs) {
  const {storefront} = context;
  
  const {product} = await storefront.query(PRODUCT_QUERY, {
    variables: {handle: params.handle},
  });
  
  const {collection} = await storefront.query(COLLECTION_QUERY, {
    variables: {handle: params.collection},
  });
  
  // Each query blocks the next!
  return {product, collection};
}
```

### 3. Cache Headers

**HTTP Caching Best Practices**

```typescript
export async function loader({context}: Route.LoaderArgs) {
  const {storefront} = context;
  
  // Public, cacheable product page
  const {product} = await storefront.query(PRODUCT_QUERY, {
    cache: storefront.CacheCustom({
      mode: 'public',
      maxAge: 3600, // 1 hour
      staleWhileRevalidate: 86400, // 24 hours
    }),
  });
  
  // Set response cache headers
  return new Response(JSON.stringify({product}), {
    headers: {
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      'Content-Type': 'application/json',
    },
  });
}

// Private, non-cacheable account page
export async function loader({context}: Route.LoaderArgs) {
  const {customerAccount} = context;
  
  const customer = await getCustomerDetails(customerAccount);
  
  return new Response(JSON.stringify({customer}), {
    headers: {
      'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      'Content-Type': 'application/json',
    },
  });
}
```

## Security Best Practices

### 1. Protected Routes

**Authentication Middleware Pattern**

```typescript
import {requireCustomerAuth} from '~/lib/customer.server';

export async function loader({context, request}: Route.LoaderArgs) {
  const {customerAccount} = context;
  
  // ✅ Redirects to login if not authenticated
  await requireCustomerAuth(customerAccount, request.url);
  
  // User is authenticated, proceed
  const data = await getAccountData(customerAccount);
  return {data};
}

// Helper function (in lib/customer.server.ts)
export async function requireCustomerAuth(
  customerAccount: CustomerAccount,
  redirectTo?: string,
): Promise<void> {
  const isLoggedIn = await customerAccount.isLoggedIn();
  
  if (!isLoggedIn) {
    const loginUrl = redirectTo
      ? `/account/login?redirect=${encodeURIComponent(redirectTo)}`
      : '/account/login';
    
    throw redirect(loginUrl);
  }
}
```

### 2. CSRF Protection

**React Router Form = Built-in CSRF Protection**

```typescript
// ✅ GOOD: React Router Form (CSRF protected)
import {Form} from 'react-router';

export function ContactForm() {
  return (
    <Form method="post">
      <input type="email" name="email" />
      <button type="submit">Submit</button>
    </Form>
  );
}

// ❌ BAD: Native form (no CSRF protection)
<form method="post" action="/contact">
  <input type="email" name="email" />
  <button type="submit">Submit</button>
</form>
```

### 3. Input Validation

**Always Validate in Actions**

```typescript
import {contactFormSchema} from '~/lib/validation';

export async function action({request}: Route.ActionArgs) {
  const formData = await request.formData();
  
  const data = {
    name: String(formData.get('name') || ''),
    email: String(formData.get('email') || ''),
    message: String(formData.get('message') || ''),
  };
  
  // ✅ GOOD: Server-side validation
  const validation = contactFormSchema.safeParse(data);
  
  if (!validation.success) {
    return {
      errors: formatZodErrors(validation.error),
      fields: data,
    };
  }
  
  // Safe to process validated data
  await sendEmail(validation.data);
  return redirect('/contact?success=true');
}

// ❌ BAD: No validation
export async function action({request}: Route.ActionArgs) {
  const formData = await request.formData();
  
  // Directly using unvalidated input!
  await sendEmail({
    name: formData.get('name'),
    email: formData.get('email'),
  });
}
```

## Common Patterns

### Pattern: Form with Optimistic UI

```typescript
import {useFetcher} from 'react-router';

export function AddToFavoritesButton({productId}: {productId: string}) {
  const fetcher = useFetcher();
  
  // Optimistic state
  const isAdding = fetcher.state === 'submitting';
  const isFavorited = 
    fetcher.formData?.get('action') === 'add' || 
    fetcher.data?.isFavorited;
  
  return (
    <fetcher.Form method="post">
      <input type="hidden" name="productId" value={productId} />
      <button
        type="submit"
        name="action"
        value={isFavorited ? 'remove' : 'add'}
        disabled={isAdding}
      >
        {isAdding ? 'Saving...' : 
         isFavorited ? '❤️ Favorited' : '🤍 Favorite'}
      </button>
    </fetcher.Form>
  );
}
```

### Pattern: Search with URL Params

```typescript
export async function loader({request}: Route.LoaderArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get('q') || '';
  const sort = url.searchParams.get('sort') || 'relevance';
  const minPrice = url.searchParams.get('minPrice');
  const maxPrice = url.searchParams.get('maxPrice');
  
  // Query with filters
  const results = await searchProducts({
    query,
    sort,
    priceRange: minPrice && maxPrice ? {
      min: Number(minPrice),
      max: Number(maxPrice),
    } : undefined,
  });
  
  return {results, query, sort, filters: {minPrice, maxPrice}};
}

// Update URL without reloading
export function SearchForm() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set(key, value);
    setSearchParams(params);
  };
  
  return (
    <Form>
      <input
        name="q"
        defaultValue={searchParams.get('q') || ''}
        onChange={(e) => updateFilter('q', e.target.value)}
      />
      <select
        name="sort"
        defaultValue={searchParams.get('sort') || 'relevance'}
        onChange={(e) => updateFilter('sort', e.target.value)}
      >
        <option value="relevance">Relevance</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
      </select>
    </Form>
  );
}
```

### Pattern: Pagination

```typescript
import {getPaginationVariables} from '@shopify/hydrogen';

export async function loader({context, request}: Route.LoaderArgs) {
  const {storefront} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 12,
  });
  
  const {collection} = await storefront.query(COLLECTION_QUERY, {
    variables: {
      handle: 'all',
      ...paginationVariables,
    },
  });
  
  return {collection};
}

// Pagination UI
export default function CollectionPage() {
  const {collection} = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  
  const buildPaginationUrl = (cursor: string, direction: 'prev' | 'next') => {
    const params = new URLSearchParams(searchParams);
    params.set('direction', direction);
    params.set('cursor', cursor);
    return `?${params}`;
  };
  
  return (
    <>
      <ProductGrid products={collection.products.nodes} />
      
      <div className="flex gap-4 justify-center mt-8">
        {collection.products.pageInfo.hasPreviousPage && (
          <Link
            to={buildPaginationUrl(
              collection.products.pageInfo.startCursor,
              'prev'
            )}
          >
            ← Previous
          </Link>
        )}
        
        {collection.products.pageInfo.hasNextPage && (
          <Link
            to={buildPaginationUrl(
              collection.products.pageInfo.endCursor,
              'next'
            )}
          >
            Next →
          </Link>
        )}
      </div>
    </>
  );
}
```

## Hydrogen-Specific Patterns

### Pattern: Analytics Events

```typescript
import {Analytics} from '@shopify/hydrogen';

export default function ProductPage() {
  const {product} = useLoaderData<typeof loader>();
  
  return (
    <>
      {/* Analytics pageview */}
      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: product.priceRange.minVariantPrice.amount,
              vendor: product.vendor,
              variantId: product.selectedVariant.id,
              variantTitle: product.selectedVariant.title,
              quantity: 1,
            },
          ],
        }}
      />
      
      {/* Product content */}
      <h1>{product.title}</h1>
    </>
  );
}
```

### Pattern: Locale Handling

```typescript
import {getLocaleFromRequest} from '~/lib/i18n';

export async function loader({context, request}: Route.LoaderArgs) {
  const {storefront} = context;
  const {language, country} = getLocaleFromRequest(request);
  
  // Queries automatically use i18n context
  const {product} = await storefront.query(PRODUCT_QUERY, {
    variables: {handle: 'token'},
  });
  
  // Product title, prices in correct language/currency
  return {product, locale: {language, country}};
}
```

## Testing Patterns

```typescript
import {describe, it, expect, vi} from 'vitest';
import {loader} from '~/routes/($locale).products.$handle';

describe('Product Loader', () => {
  it('should load product data', async () => {
    const mockStorefront = {
      query: vi.fn().mockResolvedValue({
        product: {
          id: '123',
          title: 'Test Product',
        },
      }),
    };
    
    const result = await loader({
      context: {storefront: mockStorefront},
      params: {handle: 'test-product'},
      request: new Request('http://localhost/products/test-product'),
    } as any);
    
    expect(result.product.title).toBe('Test Product');
  });
  
  it('should throw 404 for missing product', async () => {
    const mockStorefront = {
      query: vi.fn().mockResolvedValue({product: null}),
    };
    
    await expect(
      loader({
        context: {storefront: mockStorefront},
        params: {handle: 'nonexistent'},
        request: new Request('http://localhost/products/nonexistent'),
      } as any)
    ).rejects.toThrow();
  });
});
```

## Quick Reference

### Essential React Router Hooks

```typescript
// Data from loader
const data = useLoaderData<typeof loader>();

// Form submission data
const actionData = useActionData<typeof action>();

// Navigation state
const navigation = useNavigation();
const isLoading = navigation.state === 'loading';
const isSubmitting = navigation.state === 'submitting';

// URL search params
const [searchParams, setSearchParams] = useSearchParams();

// Route error
const error = useRouteError();
const isRouteError = isRouteErrorResponse(error);

// Programmatic navigation
const navigate = useNavigate();
navigate('/products/token');

// Non-navigation submission
const fetcher = useFetcher();
fetcher.submit(formData, {method: 'post'});
```

### Performance Checklist

- [ ] Defer non-critical data
- [ ] Use Suspense for deferred data
- [ ] Prefetch likely navigation (intent-based)
- [ ] Parallel data fetching (Promise.all)
- [ ] Set appropriate cache headers
- [ ] Show loading states (skeletons)
- [ ] Handle errors gracefully
- [ ] Implement optimistic UI for mutations

### Security Checklist

- [ ] Use React Router Form (CSRF protection)
- [ ] Validate all inputs in actions
- [ ] Protect routes requiring auth
- [ ] Set secure cookie options
- [ ] Never expose sensitive data in loaders
- [ ] Sanitize user inputs
- [ ] Implement rate limiting

---

**Additional Resources:**
- [React Router Documentation](https://reactrouter.com/)
- [Hydrogen Documentation](https://shopify.dev/docs/custom-storefronts/hydrogen)
- [Web Performance Best Practices](https://web.dev/performance/)
