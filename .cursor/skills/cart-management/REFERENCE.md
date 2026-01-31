# Cart Management Reference

## Industry Best Practices

### Cart State Management

**Progressive Enhancement First**
```typescript
// DO: Use CartForm for all mutations (works without JS)
<CartForm route="/cart" action={CartForm.ACTIONS.LinesAdd} inputs={{lines}}>
  <button type="submit">Add to Cart</button>
</CartForm>

// AVOID: Client-side cart state only
const [cart, setCart] = useState([]);
const addToCart = (item) => setCart([...cart, item]); // Won't persist
```

**Optimistic UI Updates**
```typescript
import {useOptimisticCart} from '@shopify/hydrogen';

// DO: Use optimistic cart for immediate feedback
export function CartBadge() {
  const cart = useOptimisticCart(); // Updates immediately
  
  return (
    <span>{cart?.totalQuantity || 0}</span>
  );
}

// AVOID: Waiting for server response
export function CartBadge() {
  const {cart} = useLoaderData(); // Stale until revalidation
  return <span>{cart?.totalQuantity || 0}</span>;
}
```

### Cart Persistence

**Cookie-Based Cart ID**
```typescript
// app/lib/context.ts
export async function createHydrogenRouterContext(request, env, executionContext) {
  const cart = createCartHandler({
    storefront,
    // Cart ID persisted in HTTP-only cookie
    getCartId: cartHandler.getCartId,
    setCartId: cartHandler.setCartId,
  });
  
  return {cart, /* ... */};
}

// Cart survives page refresh, browser restart
// Security: HTTP-only cookie prevents XSS access
```

**Cart Expiration Handling**
```typescript
// Best Practice: Check cart validity
export async function loader({context}: Route.LoaderArgs) {
  const {cart} = context;
  
  try {
    const cartData = await cart.get();
    
    // Cart expired or invalid
    if (!cartData || cartData.lines.nodes.length === 0) {
      // Clear invalid cart ID
      const headers = cart.setCartId('');
      return {cart: null, headers};
    }
    
    return {cart: cartData};
  } catch (error) {
    // Handle cart API errors
    console.error('Cart fetch failed:', error);
    return {cart: null};
  }
}
```

### Line Item Attributes

**Preserving Custom Data**
```typescript
// DO: Preserve attributes on quantity update
<CartForm
  route="/cart"
  action={CartForm.ACTIONS.LinesUpdate}
  inputs={{
    lines: [{
      id: line.id,
      quantity: newQuantity,
      // Preserve attributes (engraving, etc.)
      attributes: line.attributes,
    }],
  }}
>
  <button type="submit">Update</button>
</CartForm>

// AVOID: Losing attributes
<CartForm
  route="/cart"
  action={CartForm.ACTIONS.LinesUpdate}
  inputs={{
    lines: [{
      id: line.id,
      quantity: newQuantity,
      // Missing attributes - will be cleared!
    }],
  }}
>
  <button type="submit">Update</button>
</CartForm>
```

## Performance Optimization

### Cart Query Fragment Optimization

**Minimal Fields in Badge**
```typescript
// For cart badge (header)
const CART_BADGE_FRAGMENT = `#graphql
  fragment CartBadge on Cart {
    id
    totalQuantity
  }
` as const;

// Full cart only on cart page
const CART_FULL_FRAGMENT = `#graphql
  fragment CartFull on Cart {
    ...CartBadge
    lines(first: 250) {
      nodes {
        ...CartLine
      }
    }
    cost {
      subtotalAmount { ...Money }
      totalAmount { ...Money }
    }
    discountCodes {
      code
      applicable
    }
  }
  ${CART_BADGE_FRAGMENT}
  ${CART_LINE_FRAGMENT}
` as const;
```

### Lazy Loading Cart Drawer

**Defer Cart Data**
```typescript
// app/root.tsx loader
export async function loader({context}: Route.LoaderArgs) {
  const {cart} = context;
  
  return {
    // Don't await cart - defer loading
    cart: cart.get(), // Promise
  };
}

// In component
export function Layout() {
  const {cart} = useLoaderData<typeof loader>();
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  return (
    <>
      <Header onCartClick={() => setIsCartOpen(true)} />
      
      {/* Only load cart when opened */}
      {isCartOpen && (
        <Suspense fallback={<CartSkeleton />}>
          <Await resolve={cart}>
            {(resolvedCart) => (
              <CartDrawer cart={resolvedCart} onClose={() => setIsCartOpen(false)} />
            )}
          </Await>
        </Suspense>
      )}
    </>
  );
}
```

### Debounced Quantity Updates

**Prevent Excessive API Calls**
```typescript
import {useFetcher} from 'react-router';
import {useEffect, useState} from 'react';
import {useDebouncedCallback} from 'use-debounce';

export function QuantitySelector({lineId, initialQuantity}: Props) {
  const fetcher = useFetcher();
  const [quantity, setQuantity] = useState(initialQuantity);
  
  // Debounce API calls
  const debouncedUpdate = useDebouncedCallback((qty: number) => {
    fetcher.submit(
      {
        cartAction: CartForm.ACTIONS.LinesUpdate,
        lines: JSON.stringify([{id: lineId, quantity: qty}]),
      },
      {method: 'POST', action: '/cart'},
    );
  }, 500); // 500ms delay
  
  const handleChange = (newQty: number) => {
    setQuantity(newQty); // Immediate UI update
    debouncedUpdate(newQty); // Debounced API call
  };
  
  return (
    <input
      type="number"
      value={quantity}
      onChange={(e) => handleChange(Number(e.target.value))}
      min={1}
    />
  );
}
```

## Security Considerations

### Cart Tampering Prevention

**Server-Side Price Validation**
```typescript
// DO: Never trust client-side prices
export async function action({context, request}: Route.ActionArgs) {
  const {cart, storefront} = context;
  const formData = await request.formData();
  
  const variantId = String(formData.get('variantId'));
  
  // Fetch real price from Shopify
  const {product} = await storefront.query(PRODUCT_VARIANT_QUERY, {
    variables: {id: variantId},
  });
  
  // Add to cart (Shopify validates price)
  await cart.addLines([{
    merchandiseId: variantId,
    quantity: 1,
  }]);
  
  // AVOID: Accepting price from form data
  // const price = formData.get('price'); // Never use this
}
```

### Input Sanitization for Attributes

**Validate Line Item Attributes**
```typescript
import {z} from 'zod';

// Define allowed attributes
const lineItemAttributeSchema = z.object({
  key: z.enum(['Engraving', 'GiftMessage', '_note']),
  value: z.string().max(500).regex(/^[a-zA-Z0-9\s\-.'&,]*$/),
});

export async function action({request}: Route.ActionArgs) {
  const formData = await request.formData();
  const attributes = JSON.parse(String(formData.get('attributes')));
  
  // Validate attributes
  const validation = z.array(lineItemAttributeSchema).safeParse(attributes);
  
  if (!validation.success) {
    return {error: 'Invalid attributes'};
  }
  
  // Safe to add to cart
  await cart.addLines([{
    merchandiseId: variantId,
    quantity: 1,
    attributes: validation.data,
  }]);
}
```

### Rate Limiting Cart Actions

**Prevent Cart Abuse**
```typescript
// app/lib/rate-limit.server.ts
import {RateLimiter} from '@shopify/hydrogen';

export const cartActionLimiter = new RateLimiter({
  max: 10, // 10 requests
  windowMs: 60000, // per minute
});

export async function action({request, context}: Route.ActionArgs) {
  const clientIp = request.headers.get('CF-Connecting-IP') || 'unknown';
  
  // Check rate limit
  const {allowed, remaining} = await cartActionLimiter.check(clientIp);
  
  if (!allowed) {
    return json(
      {error: 'Too many cart actions. Please wait a moment.'},
      {status: 429},
    );
  }
  
  // Process cart action
  // ...
}
```

## Advanced Patterns

### Multi-Currency Support

**Currency Selection**
```typescript
// Hydrogen automatically uses @inContext for currency
export async function loader({context}: Route.LoaderArgs) {
  const {cart, i18n} = context;
  
  // Cart prices automatically in customer's currency
  const cartData = await cart.get();
  
  // Currency from i18n context
  console.log(i18n.currency); // 'USD', 'EUR', etc.
  
  return {cart: cartData, currency: i18n.currency};
}
```

### Cart Merging (Anonymous to Authenticated)

**Merge Guest Cart on Login**
```typescript
export async function action({context, request}: Route.ActionArgs) {
  const {cart, customerAccount} = context;
  const formData = await request.formData();
  
  // Customer logs in
  const authResult = await customerAccount.login({
    email: String(formData.get('email')),
    password: String(formData.get('password')),
  });
  
  if (authResult.success) {
    // Update cart buyer identity
    const guestCartId = await cart.getCartId();
    
    if (guestCartId) {
      await cart.updateBuyerIdentity({
        customerAccessToken: authResult.customerAccessToken,
      });
    }
  }
  
  return redirect('/account');
}
```

### Cart Notes

**Order-Level Notes**
```typescript
<CartForm
  route="/cart"
  action={CartForm.ACTIONS.NoteUpdate}
  inputs={{
    note: 'Please gift wrap this order',
  }}
>
  <textarea name="note" placeholder="Special instructions" />
  <button type="submit">Save Note</button>
</CartForm>
```

### Buy Now vs Add to Cart

**Direct Checkout**
```typescript
export function BuyNowButton({variantId}: {variantId: string}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.LinesAdd}
      inputs={{
        lines: [{merchandiseId: variantId, quantity: 1}],
      }}
    >
      {(fetcher) => (
        <>
          <input type="hidden" name="redirectTo" value="/checkout" />
          <button
            type="submit"
            disabled={fetcher.state !== 'idle'}
          >
            Buy Now
          </button>
        </>
      )}
    </CartForm>
  );
}

// Handle redirect in action
export async function action({context, request}: Route.ActionArgs) {
  const formData = await request.formData();
  const redirectTo = String(formData.get('redirectTo') || '/cart');
  
  // Add to cart
  await cart.addLines(/* ... */);
  
  return redirect(redirectTo);
}
```

## Common Pitfalls & Solutions

### Problem: Cart Badge Not Updating

**Symptom:** Cart badge shows old quantity after adding items

**Solution:** Ensure optimistic cart is used
```typescript
// WRONG: Using loader data
export function CartBadge() {
  const {cart} = useLoaderData(); // Stale
  return <span>{cart?.totalQuantity}</span>;
}

// RIGHT: Using optimistic cart
import {useOptimisticCart} from '@shopify/hydrogen';

export function CartBadge() {
  const cart = useOptimisticCart(); // Always fresh
  return <span>{cart?.totalQuantity || 0}</span>;
}
```

### Problem: Lost Line Item Attributes

**Symptom:** Engraving text disappears when updating quantity

**Solution:** Always preserve attributes
```typescript
// Include existing attributes
const lines = [{
  id: line.id,
  quantity: newQuantity,
  attributes: line.attributes, // Preserve!
}];
```

### Problem: Cart Drawer Stays Open on Navigation

**Symptom:** Drawer doesn't close when user clicks link

**Solution:** Close on location change
```typescript
import {useLocation} from 'react-router';
import {useEffect} from 'react';

export function CartDrawer({isOpen, onClose}: Props) {
  const location = useLocation();
  
  // Close drawer on navigation
  useEffect(() => {
    onClose();
  }, [location.pathname]);
  
  // ...
}
```

### Problem: Cart Checkout URL Changes

**Symptom:** Checkout URL outdated after cart update

**Solution:** Always fetch fresh cart
```typescript
export async function loader({context}: Route.LoaderArgs) {
  const {cart} = context;
  
  // Get latest cart (includes updated checkoutUrl)
  const cartData = await cart.get();
  
  return {cart: cartData};
}

// In component
<a href={cart.checkoutUrl}>Checkout</a>
```

## MCP Integration

### Using Shopify MCP for Cart Queries

**Explore Cart Schema**
```typescript
// Use introspect_graphql_schema MCP tool
{
  "api": "storefront",
  "types": ["Cart", "CartLine", "CartLineInput"]
}

// Discover available cart fields and mutations
```

**Learn Cart Best Practices**
```typescript
// Use learn_shopify_api MCP tool
{
  "topic": "cart management",
  "context": "I need to implement cart functionality in Shopify Hydrogen"
}

// Get official guidance on:
// - Cart API patterns
// - Cart mutations
// - Cart attribute handling
```

**Search Cart Documentation**
```typescript
// Use search_docs_chunks MCP tool
{
  "query": "cartLinesAdd mutation examples",
  "max_results": 5
}

// Find code examples and best practices
```

## Troubleshooting

### Debug Cart State

**Inspect Cart Object**
```typescript
export async function loader({context}: Route.LoaderArgs) {
  const {cart} = context;
  const cartData = await cart.get();
  
  // Log full cart for debugging
  console.log('Cart State:', JSON.stringify(cartData, null, 2));
  console.log('Cart ID:', cartData?.id);
  console.log('Total Quantity:', cartData?.totalQuantity);
  console.log('Lines:', cartData?.lines.nodes.length);
  
  return {cart: cartData};
}
```

### Cart API Errors

**Handle GraphQL Errors**
```typescript
try {
  await cart.addLines([{merchandiseId: variantId, quantity: 1}]);
} catch (error) {
  // Log error details
  console.error('Cart error:', {
    message: error.message,
    graphQLErrors: error.graphQLErrors,
    networkError: error.networkError,
  });
  
  // User-friendly message
  return {
    error: 'Unable to add item to cart. Please try again.',
  };
}
```

### Testing Cart Operations

**Mock Cart Context**
```typescript
import {describe, it, expect, vi} from 'vitest';

describe('Cart Operations', () => {
  it('should add item to cart', async () => {
    const mockCart = {
      addLines: vi.fn().mockResolvedValue({
        id: 'cart-123',
        totalQuantity: 1,
      }),
    };
    
    const result = await mockCart.addLines([
      {merchandiseId: 'variant-1', quantity: 1},
    ]);
    
    expect(mockCart.addLines).toHaveBeenCalled();
    expect(result.totalQuantity).toBe(1);
  });
});
```

## Migration Notes

### From Remix to React Router

```typescript
// OLD (Remix)
import {CartForm} from '@shopify/hydrogen';
import {useLoaderData} from '@remix-run/react';

// NEW (React Router v7)
import {CartForm} from '@shopify/hydrogen';
import {useLoaderData} from 'react-router';

// CartForm API remains the same
// Only import path changes
```

## Related Resources

- Shopify Storefront API Cart Docs: https://shopify.dev/docs/api/storefront/latest/objects/Cart
- Hydrogen Cart Handler: https://shopify.dev/docs/api/hydrogen/2025-01/utilities/createcarthandler
- Optimistic UI Guide: https://reactrouter.com/en/main/guides/optimistic-ui
- React Router Forms: https://reactrouter.com/en/main/components/form
