# Shopify Customer Account API - Reference Documentation

**Last Updated:** January 30, 2026  
**Skill:** shopify-customer-account-api  
**Purpose:** Authentication best practices, security patterns, and MCP integration

---

## Table of Contents

1. [Industry Best Practices](#industry-best-practices)
2. [Authentication & Security](#authentication--security)
3. [Shopify MCP Server Integration](#shopify-mcp-server-integration)
4. [Common Patterns](#common-patterns)
5. [Privacy & Compliance](#privacy--compliance)
6. [Performance Optimization](#performance-optimization)
7. [Troubleshooting Guide](#troubleshooting-guide)

---

## Industry Best Practices

### 1. Authentication Flow Best Practices

**Industry Standard: OAuth 2.0 with PKCE**

Shopify Customer Account API uses OAuth 2.0 with PKCE (Proof Key for Code Exchange) for enhanced security.

```typescript
// Hydrogen handles OAuth automatically via customerAccount.login()
export async function action({context}: Route.ActionArgs) {
  const {customerAccount} = context;
  
  try {
    // ✅ GOOD: Let Hydrogen handle OAuth flow
    await customerAccount.login();
    // Hydrogen redirects to Shopify OAuth, handles callback
  } catch (error) {
    return {error: 'Authentication failed'};
  }
}

// ❌ BAD: Don't implement custom OAuth flow
// Hydrogen's implementation is secure and maintained
```

**OAuth Best Practices:**
- Use secure, HTTP-only cookies for session tokens
- Implement CSRF protection (Hydrogen does this)
- Set appropriate cookie expiration (refresh tokens)
- Never store tokens in localStorage (XSS risk)

### 2. Session Management

**Industry Standard: Short-Lived Sessions with Refresh**

```typescript
// ✅ GOOD: Check authentication status
export async function loader({context, request}: Route.LoaderArgs) {
  const {customerAccount} = context;
  
  const isLoggedIn = await customerAccount.isLoggedIn();
  
  if (!isLoggedIn) {
    // Redirect to login with return URL
    return redirect(`/account/login?redirect=${encodeURIComponent(request.url)}`);
  }
  
  // User is authenticated
  const result = await getCustomerDetails(customerAccount);
  return {customer: result.data};
}
```

**Session Best Practices:**
- Keep sessions short (30 minutes recommended)
- Implement "remember me" with refresh tokens
- Clear sessions on logout (server-side + client-side)
- Monitor for suspicious session activity
- Implement concurrent session limits if needed

### 3. Password Requirements

**Industry Standard (NIST Guidelines):**

```typescript
// ✅ GOOD: Strong but user-friendly password rules
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain uppercase, lowercase, and number'
  );

// ❌ BAD: Too restrictive (frustrates users)
const badPasswordSchema = z
  .string()
  .min(16) // Too long
  .regex(/^(?=.*[!@#$%])/) // Required special chars
  .regex(/^(?=.*[A-Z]{2,})/) // Multiple uppercase
```

**Password Best Practices (NIST):**
- Minimum 8 characters (not more than 12)
- Don't require special characters (user choice)
- Don't force periodic changes (only on breach)
- Allow paste functionality
- Check against breached password databases
- Use bcrypt/argon2 for hashing (Shopify handles this)

### 4. Account Lockout Protection

**Protect Against Brute Force Attacks**

```typescript
// Implement rate limiting on login attempts
const LOGIN_ATTEMPT_LIMIT = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

// Store in Redis or similar
interface LoginAttempt {
  email: string;
  attempts: number;
  lastAttempt: number;
  lockedUntil?: number;
}

async function checkLoginAttempts(email: string): Promise<boolean> {
  const attempts = await getLoginAttempts(email);
  
  if (attempts.lockedUntil && Date.now() < attempts.lockedUntil) {
    return false; // Account locked
  }
  
  if (attempts.attempts >= LOGIN_ATTEMPT_LIMIT) {
    // Lock account
    await setAccountLocked(email, Date.now() + LOCKOUT_DURATION);
    return false;
  }
  
  return true; // Can proceed
}
```

---

## Authentication & Security

### 1. Secure Cookie Configuration

**Production Cookie Settings**

```typescript
// In server.ts or session configuration
export const sessionConfig = {
  cookie: {
    name: '__session',
    httpOnly: true, // ✅ Prevent XSS
    secure: process.env.NODE_ENV === 'production', // ✅ HTTPS only
    sameSite: 'lax' as const, // ✅ CSRF protection
    maxAge: 30 * 60, // 30 minutes
    path: '/',
    domain: process.env.COOKIE_DOMAIN,
  },
  secrets: [process.env.SESSION_SECRET!],
};

// ❌ BAD: Insecure cookie settings
const badConfig = {
  cookie: {
    httpOnly: false, // Vulnerable to XSS!
    secure: false, // Works over HTTP
    sameSite: 'none', // No CSRF protection
  },
};
```

### 2. CSRF Protection

**Industry Standard: Double-Submit Cookie Pattern**

```typescript
// Hydrogen's Form component includes CSRF protection
import {Form} from 'react-router';

export default function LoginForm() {
  return (
    <Form method="post">
      {/* ✅ GOOD: Hydrogen Form handles CSRF automatically */}
      <input type="email" name="email" />
      <input type="password" name="password" />
      <button type="submit">Login</button>
    </Form>
  );
}

// ❌ BAD: Custom form without CSRF protection
<form method="post" action="/account/login">
  <input type="email" name="email" />
  <button type="submit">Login</button>
</form>
```

### 3. Privacy-Focused Error Messages

**Don't Leak User Information**

```typescript
// ✅ GOOD: Generic error messages
export async function action({request}: Route.ActionArgs) {
  const formData = await request.formData();
  const email = String(formData.get('email'));
  
  // Check if account exists
  const accountExists = await checkAccountExists(email);
  
  if (!accountExists) {
    // Don't reveal account doesn't exist
    return {
      error: 'Invalid email or password',
      // NOT: "Account not found"
    };
  }
  
  // Attempt login...
}

// ❌ BAD: Reveals account existence
if (!accountExists) {
  return {error: 'No account found with that email'};
  // Attacker can enumerate accounts!
}
```

**Privacy Error Message Examples:**
- ✅ "Invalid email or password" (doesn't reveal which)
- ✅ "Authentication failed" (generic)
- ❌ "Password incorrect" (reveals account exists)
- ❌ "Account not found" (reveals account doesn't exist)

### 4. Multi-Factor Authentication (Future Enhancement)

**Preparation for 2FA Implementation**

```typescript
// Structure for future 2FA support
interface CustomerSession {
  customerId: string;
  email: string;
  isAuthenticated: boolean;
  mfaRequired: boolean; // Future: require 2FA
  mfaVerified: boolean; // Future: 2FA completed
}

// Protected route with MFA check
export async function requireMFA(session: CustomerSession) {
  if (session.mfaRequired && !session.mfaVerified) {
    throw redirect('/account/verify-mfa');
  }
}
```

---

## Shopify MCP Server Integration

### Using MCP Tools for Customer API

**1. Initialize Customer API Context**
```typescript
// Use Shopify MCP server to explore Customer Account API
// learn_shopify_api(api: "customer")
//
// Returns: { conversationId: "uuid" }
```

**2. Introspect Customer Schema**
```typescript
// Find available customer queries and mutations
// introspect_graphql_schema(
//   conversationId: "from-learn-tool",
//   query: "customer",
//   filter: ["queries", "mutations"],
//   api: "customer"
// )
//
// Common queries: customer, customerAddresses, customerOrders
// Common mutations: customerCreate, customerUpdate, customerAddressCreate
```

**3. Search Customer API Documentation**
```typescript
// Get implementation examples
// search_docs_chunks(
//   conversationId: "from-learn-tool",
//   prompt: "How to implement customer login with Hydrogen"
// )
```

### MCP Workflow Example

**Scenario: Implement Password Reset**

```
1. learn_shopify_api(api: "customer")
   → Get conversationId

2. introspect_graphql_schema(
     conversationId: "...",
     query: "password",
     api: "customer"
   )
   → Discover customerRecover, customerReset mutations

3. search_docs_chunks(
     conversationId: "...",
     prompt: "customer password reset flow Hydrogen"
   )
   → Get official implementation guide

4. Implement based on discovered mutations + docs
```

---

## Common Patterns

### 1. Protected Route Pattern

**Standard Implementation**

```typescript
import {requireCustomerAuth} from '~/lib/customer.server';

export async function loader({context, request}: Route.LoaderArgs) {
  const {customerAccount} = context;
  
  // ✅ Redirects to login if not authenticated
  await requireCustomerAuth(customerAccount, request.url);
  
  // User is authenticated - proceed
  const result = await getCustomerDetails(customerAccount);
  
  if (!result.success) {
    throw new Response('Failed to load account', {status: 500});
  }
  
  return {customer: result.data};
}
```

### 2. Conditional UI Based on Auth Status

```typescript
export async function loader({context}: Route.LoaderArgs) {
  const {customerAccount} = context;
  const isLoggedIn = await customerAccount.isLoggedIn();
  
  return {isLoggedIn};
}

export default function Header() {
  const {isLoggedIn} = useLoaderData<typeof loader>();
  
  return (
    <header>
      {isLoggedIn ? (
        <Link to="/account">My Account</Link>
      ) : (
        <Link to="/account/login">Sign In</Link>
      )}
    </header>
  );
}
```

### 3. Graceful Auth Failure Handling

```typescript
export async function loader({context}: Route.LoaderArgs) {
  const {customerAccount} = context;
  
  try {
    const isLoggedIn = await customerAccount.isLoggedIn();
    
    if (!isLoggedIn) {
      return {customer: null, isLoggedIn: false};
    }
    
    const result = await getCustomerDetails(customerAccount);
    
    if (!result.success) {
      // Log error but don't break page
      console.error('Customer details fetch failed', result.errors);
      return {customer: null, isLoggedIn: true, error: true};
    }
    
    return {customer: result.data, isLoggedIn: true};
  } catch (error) {
    // Network error, API down, etc.
    console.error('Auth check failed', error);
    return {customer: null, isLoggedIn: false, error: true};
  }
}
```

---

## Privacy & Compliance

### 1. GDPR Compliance

**Right to Access (Data Export)**

```typescript
export async function action({context}: Route.ActionArgs) {
  const {customerAccount} = context;
  
  await requireCustomerAuth(customerAccount);
  
  // Gather all customer data
  const customerData = await getCustomerDetails(customerAccount);
  const orders = await getCustomerOrders(customerAccount);
  const addresses = await getCustomerAddresses(customerAccount);
  
  // Format as downloadable JSON
  const exportData = {
    profile: customerData.data,
    orders: orders.data,
    addresses: addresses.data,
    exportedAt: new Date().toISOString(),
  };
  
  return new Response(JSON.stringify(exportData, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="customer-data.json"',
    },
  });
}
```

**Right to be Forgotten (Account Deletion)**

```typescript
// Note: Shopify handles deletion via Admin API
// Customer Account API doesn't support self-deletion
// Provide UI to request deletion, process via support

export async function action({context}: Route.ActionArgs) {
  const {customerAccount, env} = context;
  
  await requireCustomerAuth(customerAccount);
  
  const customer = await getCustomerDetails(customerAccount);
  
  // Send deletion request to support/admin
  await sendEmail({
    to: env.ADMIN_EMAIL,
    subject: 'Customer Account Deletion Request',
    body: `Customer ${customer.data.email} has requested account deletion.`,
  });
  
  return {
    success: true,
    message: 'Your deletion request has been received. We will process it within 30 days.',
  };
}
```

### 2. Data Minimization

**Only Query What You Need**

```typescript
// ✅ GOOD: Minimal data query
export const CUSTOMER_SUMMARY_QUERY = `#graphql
  query CustomerSummary {
    customer {
      firstName
      lastName
      emailAddress { emailAddress }
    }
  }
` as const;

// ❌ BAD: Querying unnecessary data
export const CUSTOMER_FULL_QUERY = `#graphql
  query Customer {
    customer {
      firstName
      lastName
      emailAddress { emailAddress }
      phoneNumber { phoneNumber }
      defaultAddress { /* full address */ }
      addresses(first: 100) { /* all addresses */ }
      orders(first: 100) { /* all orders */ }
      metafields(first: 100) { /* all metafields */ }
    }
  }
` as const;
```

### 3. Audit Logging

**Track Sensitive Operations**

```typescript
interface AuditLog {
  customerId: string;
  action: string;
  timestamp: number;
  ipAddress: string;
  userAgent: string;
  success: boolean;
}

async function logAuditEvent(
  event: Omit<AuditLog, 'timestamp'>,
): Promise<void> {
  const log: AuditLog = {
    ...event,
    timestamp: Date.now(),
  };
  
  // Store in database or logging service
  await storeAuditLog(log);
}

// Usage example
export async function action({request, context}: Route.ActionArgs) {
  const {customerAccount} = context;
  
  // Perform sensitive operation
  const result = await updateCustomerProfile(customerAccount, {
    email: 'newemail@example.com',
  });
  
  // Log the operation
  await logAuditEvent({
    customerId: result.data.id,
    action: 'email_change',
    ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
    success: result.success,
  });
}
```

---

## Performance Optimization

### 1. Cache Customer Data Appropriately

```typescript
// ✅ GOOD: Cache customer data in loader
export async function loader({context}: Route.LoaderArgs) {
  const {customerAccount} = context;
  
  await requireCustomerAuth(customerAccount);
  
  // Cache customer details (infrequently changing)
  const customer = await getCustomerDetails(customerAccount);
  
  return {customer: customer.data};
}

// In component, data is already fetched
export default function AccountDashboard() {
  const {customer} = useLoaderData<typeof loader>();
  // No client-side fetching needed!
}

// ❌ BAD: Fetching in useEffect (client-side)
export default function AccountDashboard() {
  const [customer, setCustomer] = useState(null);
  
  useEffect(() => {
    fetch('/api/customer').then(/* ... */);
  }, []);
}
```

### 2. Parallel Data Fetching

```typescript
// ✅ GOOD: Fetch customer data in parallel
export async function loader({context}: Route.LoaderArgs) {
  const {customerAccount} = context;
  
  await requireCustomerAuth(customerAccount);
  
  const [customerResult, ordersResult, addressesResult] = await Promise.all([
    getCustomerDetails(customerAccount),
    getCustomerOrders(customerAccount, {first: 5}),
    getCustomerAddresses(customerAccount),
  ]);
  
  return {
    customer: customerResult.data,
    orders: ordersResult.data,
    addresses: addressesResult.data,
  };
}
```

### 3. Pagination for Large Datasets

```typescript
// ✅ GOOD: Paginate order history
export async function loader({context, request}: Route.LoaderArgs) {
  const {customerAccount} = context;
  
  await requireCustomerAuth(customerAccount);
  
  const url = new URL(request.url);
  const cursor = url.searchParams.get('cursor');
  
  const result = await getCustomerOrders(customerAccount, {
    first: 20,
    startCursor: cursor || undefined,
  });
  
  return {
    orders: result.data.orders,
    pageInfo: result.data.pageInfo,
  };
}
```

---

## Troubleshooting Guide

### Issue 1: "Unauthorized" Errors

**Symptoms:** Customer API returns 401/403 errors

**Causes & Solutions:**

1. **Session expired**
   ```typescript
   // Check session validity
   const isLoggedIn = await customerAccount.isLoggedIn();
   if (!isLoggedIn) {
     return redirect('/account/login');
   }
   ```

2. **Wrong API credentials**
   ```env
   # Verify environment variables
   CUSTOMER_ACCOUNT_API_CLIENT_ID=xxxxx
   CUSTOMER_ACCOUNT_API_CLIENT_SECRET=xxxxx
   ```

3. **Cookie issues**
   ```typescript
   // Check cookie settings
   // Ensure secure: true in production
   // Ensure sameSite: 'lax'
   ```

### Issue 2: Login Redirect Loop

**Symptoms:** Redirects between login and protected route

**Causes & Solutions:**

1. **Incorrect redirect URL handling**
   ```typescript
   // ✅ GOOD: Preserve redirect URL
   export async function loader({request}: Route.LoaderArgs) {
     const url = new URL(request.url);
     const redirectTo = url.searchParams.get('redirect') || '/account';
     return {redirectTo};
   }
   ```

2. **Session not persisting**
   ```typescript
   // Check that you're returning headers from login
   await customerAccount.login();
   // Hydrogen handles redirect with session cookies
   ```

### Issue 3: Slow Customer Queries

**Symptoms:** Account pages load slowly

**Optimization Steps:**

1. **Reduce query complexity**
   - Only query fields you need
   - Paginate large lists (orders, addresses)
   - Avoid nested queries

2. **Implement caching**
   - Cache customer details (changes infrequently)
   - Use loader data (server-side caching)
   - Consider Redis for session data

3. **Parallel data fetching**
   - Use Promise.all() for independent queries
   - Defer non-critical data

---

## Quick Reference

### Essential Mutations

```graphql
# Customer Registration
mutation CustomerCreate($input: CustomerCreateInput!) {
  customerCreate(input: $input) {
    customer { id email }
    userErrors { field message }
  }
}

# Customer Login (handled by Hydrogen)
# Use: await customerAccount.login()

# Update Profile
mutation CustomerUpdate($customer: CustomerUpdateInput!) {
  customerUpdate(input: {customer: $customer}) {
    customer { id firstName lastName }
    userErrors { field message }
  }
}

# Create Address
mutation CustomerAddressCreate($address: CustomerAddressInput!, $defaultAddress: Boolean) {
  customerAddressCreate(address: $address, defaultAddress: $defaultAddress) {
    customerAddress { id }
    userErrors { field message }
  }
}
```

### Security Checklist

- [ ] Use secure, HTTP-only cookies
- [ ] Implement CSRF protection
- [ ] Generic error messages (no info leakage)
- [ ] Rate limit login attempts
- [ ] Strong SESSION_SECRET (32+ bytes)
- [ ] HTTPS in production
- [ ] Logout clears all session data
- [ ] Protected routes require auth
- [ ] Validate all user inputs
- [ ] Audit log sensitive operations

---

**Additional Resources:**
- [Shopify Customer Account API](https://shopify.dev/docs/api/customer)
- [OWASP Authentication Cheatsheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [NIST Digital Identity Guidelines](https://pages.nist.gov/800-63-3/)
- [GDPR Compliance Guide](https://gdpr.eu/)
