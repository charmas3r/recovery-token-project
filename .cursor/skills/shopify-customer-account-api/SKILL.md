# Shopify Customer Account API Skill

## Overview

This skill covers authentication, profile management, order history, and address management using Shopify's Customer Account API. Use this when implementing customer accounts, login/registration, or any customer-specific functionality.

## Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| Authentication | Shopify Customer Account API | Latest |
| Helper Functions | Custom utilities | N/A |
| GraphQL Queries | Customer Account schema | Latest |
| Session Management | AppSession (custom) | N/A |

## Directory Structure

```
app/
├── lib/
│   ├── customer.server.ts        # Customer API helpers
│   └── session.ts                # Session management
├── graphql/
│   └── customer-account/
│       ├── CustomerDetailsQuery.ts
│       ├── CustomerUpdateMutation.ts
│       ├── CustomerOrdersQuery.ts
│       ├── CustomerOrderQuery.ts
│       └── CustomerAddressMutations.ts
└── routes/
    └── ($locale).account.*.tsx   # Account routes
```

## Core Patterns

### Pattern: Check Authentication Status

**When to use:** Determine if user is logged in

**File Location:** Any route loader

```typescript
import {isCustomerLoggedIn} from '~/lib/customer.server';
import type {Route} from './+types/route';

export async function loader({context}: Route.LoaderArgs) {
  const {customerAccount} = context;
  
  const isLoggedIn = await isCustomerLoggedIn(customerAccount);
  
  return {isLoggedIn};
}
```

### Pattern: Require Authentication

**When to use:** Protect routes that require a logged-in user

**File Location:** Protected route loaders (e.g., `($locale).account._index.tsx`)

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

### Pattern: Customer Login

**When to use:** Handle login form submission

**File Location:** `app/routes/($locale).account_.login.tsx`

```typescript
import {redirect} from 'react-router';
import type {Route} from './+types/account_.login';
import {loginFormSchema} from '~/lib/validation';

export async function action({context, request}: Route.ActionArgs) {
  const {customerAccount} = context;
  const formData = await request.formData();
  
  const email = String(formData.get('email'));
  const password = String(formData.get('password'));
  
  // Validate input
  const validation = loginFormSchema.safeParse({email, password});
  if (!validation.success) {
    return {
      error: 'Invalid email or password',
      fields: {email, password: ''},
    };
  }
  
  try {
    // Attempt login (Hydrogen handles the OAuth flow)
    await customerAccount.login();
    
    // Get redirect URL from query params or default to account page
    const url = new URL(request.url);
    const redirectTo = url.searchParams.get('redirect') || '/account';
    
    return redirect(redirectTo);
  } catch (error) {
    return {
      error: 'Login failed. Please check your credentials.',
      fields: {email, password: ''},
    };
  }
}
```

### Pattern: Customer Registration

**When to use:** Handle registration form submission

**File Location:** `app/routes/($locale).account_.register.tsx`

```typescript
import {redirect} from 'react-router';
import type {Route} from './+types/account_.register';
import {registerFormSchema} from '~/lib/validation';

export async function action({context, request}: Route.ActionArgs) {
  const {customerAccount} = context;
  const formData = await request.formData();
  
  const data = {
    firstName: String(formData.get('firstName')),
    lastName: String(formData.get('lastName')),
    email: String(formData.get('email')),
    password: String(formData.get('password')),
    confirmPassword: String(formData.get('confirmPassword')),
    acceptsMarketing: formData.get('acceptsMarketing') === 'on',
  };
  
  // Validate input
  const validation = registerFormSchema.safeParse(data);
  if (!validation.success) {
    return {
      errors: validation.error.flatten().fieldErrors,
      fields: {...data, password: '', confirmPassword: ''},
    };
  }
  
  try {
    // Register via Customer Account API
    await customerAccount.register({
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      acceptsMarketing: data.acceptsMarketing,
    });
    
    // Auto-login after registration
    await customerAccount.login();
    
    return redirect('/account');
  } catch (error: any) {
    return {
      error: error.message || 'Registration failed. Please try again.',
      fields: {...data, password: '', confirmPassword: ''},
    };
  }
}
```

### Pattern: Logout

**When to use:** Handle logout action

**File Location:** `app/routes/($locale).account_.logout.tsx`

```typescript
import {redirect} from 'react-router';
import type {Route} from './+types/account_.logout';

export async function action({context}: Route.ActionArgs) {
  const {customerAccount} = context;
  
  await customerAccount.logout();
  
  return redirect('/');
}

export async function loader({context}: Route.LoaderArgs) {
  const {customerAccount} = context;
  
  await customerAccount.logout();
  
  return redirect('/');
}
```

## Type/Model Definitions

```typescript
// app/lib/customer.server.ts

export interface CustomerAddress {
  id?: string;
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  territoryCode: string; // Province/State code (e.g., "CA", "NY")
  zoneCode?: string; // Country code (e.g., "US", "CA")
  zip: string;
  phoneNumber?: string;
}

export interface CustomerUpdateInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export interface OrdersQueryOptions {
  first?: number;
  last?: number;
  startCursor?: string;
  endCursor?: string;
  query?: string; // Filter query (e.g., "fulfillment_status:fulfilled")
}

export interface CustomerError {
  code?: string;
  field?: string[];
  message: string;
}

export interface CustomerOperationResult<T> {
  data?: T;
  errors?: CustomerError[];
  success: boolean;
}
```

## Common Operations

### Get Customer Details

**Purpose:** Fetch customer profile and addresses

**File:** `app/lib/customer.server.ts`

```typescript
import type {CustomerAccount} from '@shopify/hydrogen';
import {CUSTOMER_DETAILS_QUERY} from '~/graphql/customer-account/CustomerDetailsQuery';

export async function getCustomerDetails(
  customerAccount: CustomerAccount,
): Promise<CustomerOperationResult<any>> {
  try {
    const {data, errors} = await customerAccount.query(CUSTOMER_DETAILS_QUERY);

    if (errors?.length) {
      return {
        success: false,
        errors: errors.map((e) => ({message: e.message})),
      };
    }

    return {
      success: true,
      data: data?.customer,
    };
  } catch (error) {
    return {
      success: false,
      errors: [{message: 'Failed to fetch customer details'}],
    };
  }
}
```

**GraphQL Query:**

```typescript
// app/graphql/customer-account/CustomerDetailsQuery.ts
export const CUSTOMER_FRAGMENT = `#graphql
  fragment Customer on Customer {
    id
    firstName
    lastName
    emailAddress {
      emailAddress
    }
    phoneNumber {
      phoneNumber
    }
    defaultAddress {
      id
      firstName
      lastName
      address1
      address2
      city
      territoryCode
      zoneCode
      zip
      phoneNumber
    }
  }
` as const;

export const CUSTOMER_DETAILS_QUERY = `#graphql
  query CustomerDetails {
    customer {
      ...Customer
      addresses(first: 10) {
        nodes {
          id
          firstName
          lastName
          company
          address1
          address2
          city
          territoryCode
          zoneCode
          zip
          phoneNumber
        }
      }
    }
  }
  ${CUSTOMER_FRAGMENT}
` as const;
```

**Usage:**

```typescript
export async function loader({context}: Route.LoaderArgs) {
  const {customerAccount} = context;
  
  await requireCustomerAuth(customerAccount);
  
  const result = await getCustomerDetails(customerAccount);
  
  if (!result.success) {
    throw new Response('Failed to load profile', {status: 500});
  }
  
  return {customer: result.data};
}
```

### Update Customer Profile

**Purpose:** Update customer information (name, email, phone)

```typescript
export async function updateCustomerProfile(
  customerAccount: CustomerAccount,
  input: CustomerUpdateInput,
): Promise<CustomerOperationResult<any>> {
  try {
    const {data, errors} = await customerAccount.mutate(
      CUSTOMER_UPDATE_MUTATION,
      {
        variables: {
          customer: input,
        },
      },
    );

    if (errors?.length || data?.customerUpdate?.userErrors?.length) {
      return {
        success: false,
        errors: [
          ...(errors?.map((e) => ({message: e.message})) || []),
          ...(data?.customerUpdate?.userErrors || []),
        ],
      };
    }

    return {
      success: true,
      data: data?.customerUpdate?.customer,
    };
  } catch (error) {
    return {
      success: false,
      errors: [{message: 'Failed to update customer profile'}],
    };
  }
}
```

**GraphQL Mutation:**

```typescript
// app/graphql/customer-account/CustomerUpdateMutation.ts
export const CUSTOMER_UPDATE_MUTATION = `#graphql
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
```

### Get Customer Orders

**Purpose:** Fetch paginated order history with optional filtering

```typescript
export async function getCustomerOrders(
  customerAccount: CustomerAccount,
  options: OrdersQueryOptions = {},
): Promise<CustomerOperationResult<any>> {
  const {first = 10, last, startCursor, endCursor, query} = options;

  try {
    const {data, errors} = await customerAccount.query(CUSTOMER_ORDERS_QUERY, {
      variables: {
        first: last ? undefined : first,
        last,
        startCursor,
        endCursor,
        query,
      },
    });

    if (errors?.length) {
      return {
        success: false,
        errors: errors.map((e) => ({message: e.message})),
      };
    }

    return {
      success: true,
      data: {
        orders: data?.customer?.orders?.nodes || [],
        pageInfo: data?.customer?.orders?.pageInfo,
      },
    };
  } catch (error) {
    return {
      success: false,
      errors: [{message: 'Failed to fetch orders'}],
    };
  }
}
```

**GraphQL Query:**

```typescript
// app/graphql/customer-account/CustomerOrdersQuery.ts
export const CUSTOMER_ORDERS_QUERY = `#graphql
  query CustomerOrders(
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
    $query: String
  ) {
    customer {
      orders(
        first: $first
        last: $last
        after: $startCursor
        before: $endCursor
        query: $query
        sortKey: PROCESSED_AT
        reverse: true
      ) {
        nodes {
          id
          number
          processedAt
          financialStatus
          fulfillmentStatus
          totalPrice {
            amount
            currencyCode
          }
          lineItems(first: 10) {
            nodes {
              title
              quantity
              currentTotalPrice {
                amount
                currencyCode
              }
              image {
                url
                altText
                width
                height
              }
              customAttributes {
                key
                value
              }
            }
          }
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
      }
    }
  }
` as const;
```

**Usage with Filtering:**

```typescript
import {parseOrderFilters} from '~/lib/orderFilters';

export async function loader({context, request}: Route.LoaderArgs) {
  const {customerAccount} = context;
  
  await requireCustomerAuth(customerAccount);
  
  // Parse filters from URL search params
  const url = new URL(request.url);
  const filters = parseOrderFilters(url.searchParams);
  
  const result = await getCustomerOrders(customerAccount, {
    first: 20,
    query: filters.query, // e.g., "fulfillment_status:fulfilled"
  });
  
  return {
    orders: result.data?.orders || [],
    pageInfo: result.data?.pageInfo,
  };
}
```

### Create Customer Address

**Purpose:** Add a new shipping/billing address

```typescript
export async function createCustomerAddress(
  customerAccount: CustomerAccount,
  address: CustomerAddress,
  setAsDefault = false,
): Promise<CustomerOperationResult<any>> {
  try {
    const {data, errors} = await customerAccount.mutate(
      CREATE_ADDRESS_MUTATION,
      {
        variables: {
          address: {
            firstName: address.firstName,
            lastName: address.lastName,
            company: address.company,
            address1: address.address1,
            address2: address.address2,
            city: address.city,
            territoryCode: address.territoryCode,
            zoneCode: address.zoneCode,
            zip: address.zip,
            phoneNumber: address.phoneNumber,
          },
          defaultAddress: setAsDefault,
        },
      },
    );

    if (errors?.length || data?.customerAddressCreate?.userErrors?.length) {
      return {
        success: false,
        errors: [
          ...(errors?.map((e) => ({message: e.message})) || []),
          ...(data?.customerAddressCreate?.userErrors || []),
        ],
      };
    }

    return {
      success: true,
      data: data?.customerAddressCreate?.customerAddress,
    };
  } catch (error) {
    return {
      success: false,
      errors: [{message: 'Failed to create address'}],
    };
  }
}
```

**GraphQL Mutations:**

```typescript
// app/graphql/customer-account/CustomerAddressMutations.ts
export const CREATE_ADDRESS_MUTATION = `#graphql
  mutation CustomerAddressCreate(
    $address: CustomerAddressInput!
    $defaultAddress: Boolean
  ) {
    customerAddressCreate(
      address: $address
      defaultAddress: $defaultAddress
    ) {
      customerAddress {
        id
        firstName
        lastName
        address1
        city
        territoryCode
        zoneCode
        zip
      }
      userErrors {
        field
        message
        code
      }
    }
  }
` as const;

export const UPDATE_ADDRESS_MUTATION = `#graphql
  mutation CustomerAddressUpdate(
    $addressId: ID!
    $address: CustomerAddressInput!
    $defaultAddress: Boolean
  ) {
    customerAddressUpdate(
      addressId: $addressId
      address: $address
      defaultAddress: $defaultAddress
    ) {
      customerAddress {
        id
      }
      userErrors {
        field
        message
        code
      }
    }
  }
` as const;

export const DELETE_ADDRESS_MUTATION = `#graphql
  mutation CustomerAddressDelete($addressId: ID!) {
    customerAddressDelete(addressId: $addressId) {
      deletedAddressId
      userErrors {
        field
        message
        code
      }
    }
  }
` as const;
```

## Error Handling

```typescript
// Check for authentication errors
export function isAuthenticationError(errors: CustomerError[]): boolean {
  return errors.some(
    (error) =>
      error.code === 'UNAUTHORIZED' ||
      error.code === 'UNAUTHENTICATED' ||
      error.message?.toLowerCase().includes('authentication'),
  );
}

// Format errors for display
export function formatCustomerErrors(errors: CustomerError[]): string {
  if (!errors || errors.length === 0) {
    return 'An unknown error occurred';
  }

  return errors.map((error) => error.message).join('. ');
}

// Usage in action
export async function action({context, request}: Route.ActionArgs) {
  const {customerAccount} = context;
  
  const result = await updateCustomerProfile(customerAccount, {
    firstName: 'John',
    lastName: 'Doe',
  });
  
  if (!result.success) {
    if (isAuthenticationError(result.errors || [])) {
      return redirect('/account/login');
    }
    
    return {
      error: formatCustomerErrors(result.errors || []),
    };
  }
  
  return {success: true};
}
```

## Testing Patterns

```typescript
import {describe, it, expect, vi} from 'vitest';
import {getCustomerDetails} from '~/lib/customer.server';

describe('Customer API Helpers', () => {
  it('should fetch customer details successfully', async () => {
    const mockCustomerAccount = {
      query: vi.fn().mockResolvedValue({
        data: {
          customer: {
            id: 'gid://shopify/Customer/123',
            firstName: 'John',
            lastName: 'Doe',
            emailAddress: {emailAddress: 'john@example.com'},
          },
        },
        errors: [],
      }),
    };

    const result = await getCustomerDetails(mockCustomerAccount as any);

    expect(result.success).toBe(true);
    expect(result.data.firstName).toBe('John');
  });

  it('should handle errors gracefully', async () => {
    const mockCustomerAccount = {
      query: vi.fn().mockResolvedValue({
        data: null,
        errors: [{message: 'Network error'}],
      }),
    };

    const result = await getCustomerDetails(mockCustomerAccount as any);

    expect(result.success).toBe(false);
    expect(result.errors).toHaveLength(1);
  });
});
```

## Gotchas & Best Practices

- **DO:** Always use `requireCustomerAuth` for protected routes
- **DO:** Handle authentication errors with redirect to login
- **DO:** Validate form input before calling API
- **DO:** Return generic error messages for security (don't expose internal details)
- **DO:** Use customer operation result pattern for consistent error handling
- **AVOID:** Exposing customer data in public routes
- **AVOID:** Storing sensitive customer data in client-side state
- **AVOID:** Making unnecessary API calls - cache customer data in loader
- **AVOID:** Hardcoding redirect URLs - accept them as parameters
- **AVOID:** Showing detailed error codes to users (use generic messages)

## Related Skills

- `form-validation` - Zod schemas for customer forms
- `react-router-patterns` - Protected route patterns
