# React Router Patterns Skill

## Overview

This skill covers React Router v7 patterns for Hydrogen applications, including loaders, actions, route types, and navigation. Use this when creating new routes, handling forms, or implementing data fetching in a Hydrogen/React Router application.

## Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| Router | React Router | 7.12.0 |
| Framework | Shopify Hydrogen | 2025.7.3 |
| Type Generation | @react-router/dev | 7.12.0 |

## Directory Structure

```
app/
├── routes/
│   ├── ($locale)._index.tsx           # Homepage
│   ├── ($locale).products.$handle.tsx # Product detail page
│   ├── ($locale).account.tsx          # Account layout
│   └── ($locale).account._index.tsx   # Account dashboard
├── routes.ts                           # Route configuration
└── root.tsx                           # Root layout
```

## Core Patterns

### Pattern: Basic Route with Loader

**When to use:** Fetch data for a route

**File Location:** Any route file

```typescript
import {useLoaderData} from 'react-router';
import type {Route} from './+types/products.$handle';

// Type-safe loader
export async function loader({context, params}: Route.LoaderArgs) {
  const {storefront} = context;
  
  const {product} = await storefront.query(PRODUCT_QUERY, {
    variables: {handle: params.handle},
  });
  
  if (!product) {
    throw new Response('Product not found', {status: 404});
  }
  
  return {product};
}

// Type-safe meta
export const meta: Route.MetaFunction = ({data}) => {
  return [
    {title: `${data?.product.title || 'Product'} | Recovery Token Store`},
    {name: 'description', content: data?.product.description},
    {rel: 'canonical', href: `/products/${data?.product.handle}`},
  ];
};

// Component automatically typed from loader
export default function ProductPage() {
  const {product} = useLoaderData<typeof loader>();
  
  return (
    <div>
      <h1>{product.title}</h1>
      <p>{product.description}</p>
    </div>
  );
}

const PRODUCT_QUERY = `#graphql
  query Product($handle: String!) {
    product(handle: $handle) {
      id
      title
      description
      handle
    }
  }
` as const;
```

### Pattern: Route with Action (Form Handling)

**When to use:** Handle form submissions

```typescript
import {Form, useActionData, useNavigation, redirect} from 'react-router';
import type {Route} from './+types/contact';
import {contactFormSchema} from '~/lib/validation';

export async function action({request}: Route.ActionArgs) {
  const formData = await request.formData();
  
  const data = {
    name: String(formData.get('name') || ''),
    email: String(formData.get('email') || ''),
    message: String(formData.get('message') || ''),
  };
  
  // Validate
  const validation = contactFormSchema.safeParse(data);
  if (!validation.success) {
    return {
      errors: formatZodErrors(validation.error),
      fields: data,
    };
  }
  
  // Process
  try {
    await sendEmail(validation.data);
    return redirect('/contact?success=true');
  } catch (error) {
    return {
      errors: {_form: 'Failed to send message'},
      fields: data,
    };
  }
}

export default function ContactPage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  
  return (
    <Form method="post" className="space-y-4">
      {actionData?.errors?._form && (
        <div className="bg-red-50 p-4 rounded">
          {actionData.errors._form}
        </div>
      )}
      
      <div>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          name="name"
          type="text"
          defaultValue={actionData?.fields?.name}
          disabled={isSubmitting}
        />
        {actionData?.errors?.name && (
          <p className="text-red-600 text-sm">{actionData.errors.name}</p>
        )}
      </div>
      
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </button>
    </Form>
  );
}
```

### Pattern: Critical vs Deferred Data Loading

**When to use:** Optimize TTFB by deferring non-critical data

```typescript
import type {Route} from './+types/products.$handle';

export async function loader(args: Route.LoaderArgs) {
  // Start fetching deferred data (non-blocking)
  const deferredData = loadDeferredData(args);
  
  // Await critical data (blocks response)
  const criticalData = await loadCriticalData(args);
  
  return {...deferredData, ...criticalData};
}

async function loadCriticalData({context, params}: Route.LoaderArgs) {
  const {storefront} = context;
  
  const {product} = await storefront.query(PRODUCT_QUERY, {
    variables: {handle: params.handle},
  });
  
  if (!product) {
    throw new Response('Not found', {status: 404});
  }
  
  return {product};
}

function loadDeferredData({context, params}: Route.LoaderArgs) {
  const {storefront} = context;
  
  // Return promise, don't await
  return {
    relatedProducts: storefront
      .query(RELATED_PRODUCTS_QUERY, {
        variables: {productId: params.productId},
      })
      .then(({products}) => products),
  };
}

// In component
import {Suspense} from 'react';
import {Await} from 'react-router';

export default function ProductPage() {
  const {product, relatedProducts} = useLoaderData<typeof loader>();
  
  return (
    <div>
      <h1>{product.title}</h1>
      
      <Suspense fallback={<div>Loading related products...</div>}>
        <Await resolve={relatedProducts}>
          {(products) => (
            <div>
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </Await>
      </Suspense>
    </div>
  );
}
```

### Pattern: Protected Routes (Authentication)

**When to use:** Require user authentication

```typescript
import {requireCustomerAuth, getCustomerDetails} from '~/lib/customer.server';
import type {Route} from './+types/account._index';

export async function loader({context, request}: Route.LoaderArgs) {
  const {customerAccount} = context;
  
  // Redirect to login if not authenticated
  await requireCustomerAuth(customerAccount, request.url);
  
  // User is authenticated, fetch their data
  const result = await getCustomerDetails(customerAccount);
  
  if (!result.success) {
    throw new Response('Failed to load account', {status: 500});
  }
  
  return {customer: result.data};
}
```

### Pattern: Layout Routes

**When to use:** Share layout and data across child routes

**File Location:** `app/routes/($locale).account.tsx`

```typescript
import {Outlet, useLoaderData, useLocation, Link} from 'react-router';
import type {Route} from './+types/account';
import {isCustomerLoggedIn} from '~/lib/customer.server';

export async function loader({context}: Route.LoaderArgs) {
  const {customerAccount} = context;
  const isLoggedIn = await isCustomerLoggedIn(customerAccount);
  
  return {isLoggedIn};
}

export default function AccountLayout() {
  const {isLoggedIn} = useLoaderData<typeof loader>();
  const location = useLocation();
  
  if (!isLoggedIn) {
    return <div>Please log in to access your account</div>;
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <nav className="w-64">
            <ul className="space-y-2">
              <li>
                <Link
                  to="/account"
                  className={location.pathname === '/account' ? 'active' : ''}
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/account/orders">Orders</Link>
              </li>
              <li>
                <Link to="/account/addresses">Addresses</Link>
              </li>
              <li>
                <Link to="/account/profile">Profile</Link>
              </li>
            </ul>
          </nav>
          
          {/* Child route renders here */}
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
```

### Pattern: Pagination

**When to use:** Handle paginated lists (products, collections, orders)

```typescript
import {getPaginationVariables} from '@shopify/hydrogen';
import {useLoaderData, useSearchParams, Link} from 'react-router';
import type {Route} from './+types/collections.$handle';

export async function loader({context, params, request}: Route.LoaderArgs) {
  const {storefront} = context;
  const paginationVariables = getPaginationVariables(request, {pageBy: 12});
  
  const {collection} = await storefront.query(COLLECTION_QUERY, {
    variables: {
      handle: params.handle,
      ...paginationVariables,
    },
  });
  
  return {collection};
}

export default function CollectionPage() {
  const {collection} = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  
  return (
    <div>
      <h1>{collection.title}</h1>
      
      <div className="grid grid-cols-3 gap-4">
        {collection.products.nodes.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
      {/* Pagination */}
      <div className="flex gap-4 mt-8">
        {collection.products.pageInfo.hasPreviousPage && (
          <Link
            to={`?${new URLSearchParams({
              ...Object.fromEntries(searchParams),
              direction: 'prev',
              cursor: collection.products.pageInfo.startCursor,
            })}`}
          >
            Previous
          </Link>
        )}
        
        {collection.products.pageInfo.hasNextPage && (
          <Link
            to={`?${new URLSearchParams({
              ...Object.fromEntries(searchParams),
              direction: 'next',
              cursor: collection.products.pageInfo.endCursor,
            })}`}
          >
            Next
          </Link>
        )}
      </div>
    </div>
  );
}
```

## Type/Model Definitions

```typescript
// Route types are auto-generated
// Import from ./+types/[route-name]
import type {Route} from './+types/products.$handle';

// Loader args type
type LoaderArgs = Route.LoaderArgs;
// {context, params, request}

// Action args type
type ActionArgs = Route.ActionArgs;
// {context, params, request}

// Meta function type
type MetaFunction = Route.MetaFunction;
// ({data, params, matches}) => MetaDescriptor[]
```

## Common Operations

### Redirect After Action

```typescript
import {redirect} from 'react-router';

export async function action({request}: Route.ActionArgs) {
  // Process form
  await processForm();
  
  // Redirect to success page
  return redirect('/success');
}
```

### Set Response Headers

```typescript
export async function loader({context}: Route.LoaderArgs) {
  const data = await fetchData();
  
  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
```

### Handle Query Parameters

```typescript
export async function loader({request}: Route.LoaderArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get('query');
  const sort = url.searchParams.get('sort') || 'relevance';
  
  return {query, sort};
}
```

### Prefetch on Intent

```typescript
import {Link, PrefetchPageLinks} from 'react-router';

<Link to="/products/token-1-year" prefetch="intent">
  1 Year Token
</Link>
```

### Handle Errors

```typescript
import {isRouteErrorResponse, useRouteError} from 'react-router';

export function ErrorBoundary() {
  const error = useRouteError();
  
  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>{error.status} {error.statusText}</h1>
        <p>{error.data}</p>
      </div>
    );
  }
  
  return (
    <div>
      <h1>Something went wrong</h1>
      <p>{error instanceof Error ? error.message : 'Unknown error'}</p>
    </div>
  );
}
```

## Navigation Patterns

### Programmatic Navigation

```typescript
import {useNavigate} from 'react-router';

function MyComponent() {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate('/products/token-1-year');
  };
  
  return <button onClick={handleClick}>View Product</button>;
}
```

### Check Navigation State

```typescript
import {useNavigation} from 'react-router';

function MyComponent() {
  const navigation = useNavigation();
  
  const isNavigating = navigation.state === 'loading';
  const isSubmitting = navigation.state === 'submitting';
  
  return (
    <div>
      {isNavigating && <LoadingSpinner />}
      {isSubmitting && <SubmittingSpinner />}
    </div>
  );
}
```

## Testing Patterns

```typescript
import {describe, it, expect, vi} from 'vitest';
import {loader} from '~/routes/($locale).products.$handle';

describe('Product Route', () => {
  it('should load product data', async () => {
    const mockContext = {
      storefront: {
        query: vi.fn().mockResolvedValue({
          product: {
            id: '123',
            title: '1 Year Token',
            handle: 'token-1-year',
          },
        }),
      },
    };
    
    const params = {handle: 'token-1-year'};
    const request = new Request('http://localhost/products/token-1-year');
    
    const result = await loader({
      context: mockContext,
      params,
      request,
    } as any);
    
    expect(result.product.title).toBe('1 Year Token');
  });
  
  it('should throw 404 for missing product', async () => {
    const mockContext = {
      storefront: {
        query: vi.fn().mockResolvedValue({product: null}),
      },
    };
    
    await expect(
      loader({
        context: mockContext,
        params: {handle: 'nonexistent'},
        request: new Request('http://localhost/products/nonexistent'),
      } as any),
    ).rejects.toThrow();
  });
});
```

## Gotchas & Best Practices

- **DO:** Use type-safe imports from `./+types/[route-name]`
- **DO:** Handle loading and error states in UI
- **DO:** Throw Response objects for HTTP errors (404, 500)
- **DO:** Use Form component for progressive enhancement
- **DO:** Defer non-critical data to improve TTFB
- **DO:** Implement error boundaries for graceful degradation
- **AVOID:** Fetching data in components (use loaders)
- **AVOID:** Mutating data in loaders (use actions)
- **AVOID:** Blocking critical path with deferred data
- **AVOID:** Forgetting to handle 404s and errors
- **AVOID:** Using `useEffect` for data fetching

## Related Skills

- `shopify-storefront-api` - Data fetching in loaders
- `shopify-customer-account-api` - Authentication patterns
- `form-validation` - Form handling in actions
- `cart-management` - Cart actions and optimistic UI
