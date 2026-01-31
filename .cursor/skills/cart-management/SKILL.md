# Cart Management Skill

## Overview

This skill covers cart operations in Shopify Hydrogen using CartForm, cart queries, and optimistic UI updates. Use this when implementing add-to-cart, update quantities, remove items, or apply discount codes.

## Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| Cart API | Shopify Storefront API | 2025-01 |
| Cart Component | @shopify/hydrogen CartForm | 2025.7.3 |
| Optimistic UI | @shopify/hydrogen OptimisticCart | 2025.7.3 |

## Directory Structure

```
app/
├── components/
│   └── cart/
│       ├── CartMain.tsx          # Main cart component
│       ├── CartLineItem.tsx      # Individual cart item
│       ├── CartSummary.tsx       # Cart totals
│       └── AddToCartButton.tsx   # Add to cart button
├── lib/
│   └── fragments.ts              # CART_QUERY_FRAGMENT
└── routes/
    └── ($locale).cart.tsx        # Cart page
```

## Core Patterns

### Pattern: Add to Cart

**When to use:** Add items to cart with line item properties

**File Location:** `app/components/product/AddToCartButton.tsx`

```typescript
import {CartForm} from '@shopify/hydrogen';
import type {CartLineInput} from '@shopify/hydrogen/storefront-api-types';

interface AddToCartButtonProps {
  lines: CartLineInput[];
  analytics?: unknown;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

export function AddToCartButton({
  lines,
  analytics,
  disabled,
  onClick,
  children,
}: AddToCartButtonProps) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.LinesAdd}
      inputs={{lines}}
    >
      {(fetcher) => (
        <>
          <input
            type="hidden"
            name="analytics"
            value={JSON.stringify(analytics)}
          />
          <button
            type="submit"
            disabled={disabled ?? fetcher.state !== 'idle'}
            onClick={onClick}
            className="rounded-md bg-indigo-600 px-6 py-3 text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {children}
          </button>
        </>
      )}
    </CartForm>
  );
}
```

**Usage:**

```typescript
<AddToCartButton
  lines={[
    {
      merchandiseId: selectedVariant.id,
      quantity: 1,
      attributes: [
        {key: 'engravingText', value: 'Sarah M. - 1 Year'},
        {key: '_engravingNote', value: 'Private note for engraver'},
      ],
    },
  ]}
  onClick={() => {
    // Optional: Open cart drawer
    openCartAside();
  }}
>
  Add to Cart
</AddToCartButton>
```

### Pattern: Update Cart Line Quantity

**When to use:** Change quantity of items in cart

```typescript
import {CartForm} from '@shopify/hydrogen';

interface UpdateQuantityProps {
  lineId: string;
  quantity: number;
}

export function UpdateQuantity({lineId, quantity}: UpdateQuantityProps) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.LinesUpdate}
      inputs={{
        lines: [
          {
            id: lineId,
            quantity,
          },
        ],
      }}
    >
      {(fetcher) => (
        <button
          type="submit"
          disabled={fetcher.state !== 'idle'}
          className="px-2 py-1 border rounded"
        >
          Update to {quantity}
        </button>
      )}
    </CartForm>
  );
}
```

### Pattern: Remove from Cart

**When to use:** Delete items from cart

```typescript
import {CartForm} from '@shopify/hydrogen';

interface RemoveFromCartProps {
  lineIds: string[];
}

export function RemoveFromCart({lineIds}: RemoveFromCartProps) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.LinesRemove}
      inputs={{lineIds}}
    >
      {(fetcher) => (
        <button
          type="submit"
          disabled={fetcher.state !== 'idle'}
          className="text-red-600 hover:text-red-800"
        >
          Remove
        </button>
      )}
    </CartForm>
  );
}
```

### Pattern: Apply Discount Code

**When to use:** Add discount/promo codes to cart

```typescript
import {CartForm, useOptimisticCart} from '@shopify/hydrogen';
import {useState} from 'react';

export function DiscountCode() {
  const [code, setCode] = useState('');
  const cart = useOptimisticCart();
  
  return (
    <div>
      <CartForm
        route="/cart"
        action={CartForm.ACTIONS.DiscountCodesUpdate}
        inputs={{
          discountCodes: [code],
        }}
      >
        {(fetcher) => (
          <div className="flex gap-2">
            <input
              type="text"
              name="discountCode"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Discount code"
              className="flex-1 px-3 py-2 border rounded"
            />
            <button
              type="submit"
              disabled={!code || fetcher.state !== 'idle'}
              className="px-4 py-2 bg-gray-800 text-white rounded"
            >
              Apply
            </button>
          </div>
        )}
      </CartForm>
      
      {/* Show applied discounts */}
      {cart?.discountCodes?.map((discount) => (
        <div key={discount.code} className="mt-2 flex items-center gap-2">
          <span className="text-green-600">
            {discount.code} {discount.applicable ? '✓' : '(invalid)'}
          </span>
          {discount.applicable && (
            <CartForm
              route="/cart"
              action={CartForm.ACTIONS.DiscountCodesUpdate}
              inputs={{discountCodes: []}}
            >
              <button type="submit" className="text-red-600 text-sm">
                Remove
              </button>
            </CartForm>
          )}
        </div>
      ))}
    </div>
  );
}
```

### Pattern: Cart Drawer/Aside

**When to use:** Show cart in a slide-out panel

**File Location:** `app/components/layout/Aside.tsx`

```typescript
import {Await, useLocation} from 'react-router';
import {Suspense} from 'react';

interface AsideProps {
  cart: Promise<CartQueryData | null>;
  isOpen: boolean;
  onClose: () => void;
}

export function CartAside({cart, isOpen, onClose}: AsideProps) {
  const location = useLocation();
  
  // Close drawer on navigation
  useEffect(() => {
    onClose();
  }, [location.pathname]);
  
  if (!isOpen) return null;
  
  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Shopping Cart</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded"
          >
            ✕
          </button>
        </div>
        
        <Suspense fallback={<CartSkeleton />}>
          <Await resolve={cart}>
            {(resolvedCart) => (
              <CartMain cart={resolvedCart} onClose={onClose} />
            )}
          </Await>
        </Suspense>
      </div>
    </>
  );
}
```

### Pattern: Cart Query

**When to use:** Fetch cart data in loader

**File Location:** `app/routes/($locale).cart.tsx`

```typescript
import type {Route} from './+types/cart';

export async function loader({context}: Route.LoaderArgs) {
  const {cart} = context;
  
  // Get cart from Hydrogen context
  const cartData = await cart.get();
  
  return {cart: cartData};
}

export default function CartPage() {
  const {cart} = useLoaderData<typeof loader>();
  
  if (!cart || cart.totalQuantity === 0) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <Link to="/collections/all" className="text-indigo-600">
          Continue Shopping
        </Link>
      </div>
    );
  }
  
  return (
    <div>
      <h1>Shopping Cart ({cart.totalQuantity} items)</h1>
      
      {cart.lines.nodes.map((line) => (
        <CartLineItem key={line.id} line={line} />
      ))}
      
      <CartSummary cart={cart} />
      
      <a href={cart.checkoutUrl} className="block w-full py-3 bg-indigo-600 text-white text-center rounded">
        Proceed to Checkout
      </a>
    </div>
  );
}
```

## Type/Model Definitions

```typescript
// Cart types from Shopify Storefront API
import type {
  Cart,
  CartLine,
  CartLineInput,
  CartLineUpdateInput,
  MoneyV2,
} from '@shopify/hydrogen/storefront-api-types';

// Line item with attributes
interface CartLineWithAttributes extends CartLineInput {
  merchandiseId: string;
  quantity: number;
  attributes?: Array<{
    key: string;
    value: string;
  }>;
}

// Cart attributes for gift messages, etc.
interface CartAttributes {
  key: string;
  value: string;
}
```

## Common Operations

### Get Cart

```typescript
export async function loader({context}: Route.LoaderArgs) {
  const {cart} = context;
  
  const cartData = await cart.get();
  
  return {cart: cartData};
}
```

### Create Cart with Items

```typescript
import {redirect} from 'react-router';

export async function action({context, request}: Route.ActionArgs) {
  const {cart} = context;
  const formData = await request.formData();
  
  const cartId = await cart.create({
    lines: [
      {
        merchandiseId: formData.get('variantId'),
        quantity: 1,
      },
    ],
  });
  
  // Set cart ID in cookies
  const headers = cart.setCartId(cartId);
  
  return redirect('/cart', {headers});
}
```

### Update Cart Attributes

```typescript
<CartForm
  route="/cart"
  action={CartForm.ACTIONS.AttributesUpdateUnstructured}
  inputs={{
    attributes: [
      {key: 'isGift', value: 'true'},
      {key: 'giftMessage', value: 'Happy 1 Year Anniversary!'},
    ],
  }}
>
  <button type="submit">Save Gift Options</button>
</CartForm>
```

## Cart Fragment

**File Location:** `app/lib/fragments.ts`

```typescript
export const CART_QUERY_FRAGMENT = `#graphql
  fragment Money on MoneyV2 {
    currencyCode
    amount
  }
  
  fragment CartLine on CartLine {
    id
    quantity
    attributes {
      key
      value
    }
    cost {
      totalAmount {
        ...Money
      }
      amountPerQuantity {
        ...Money
      }
      compareAtAmountPerQuantity {
        ...Money
      }
    }
    merchandise {
      ... on ProductVariant {
        id
        availableForSale
        compareAtPrice {
          ...Money
        }
        price {
          ...Money
        }
        requiresShipping
        title
        image {
          id
          url
          altText
          width
          height
        }
        product {
          handle
          title
          id
          vendor
        }
        selectedOptions {
          name
          value
        }
      }
    }
  }
  
  fragment CartApiQuery on Cart {
    updatedAt
    id
    appliedGiftCards {
      id
      lastCharacters
      amountUsed {
        ...Money
      }
    }
    checkoutUrl
    totalQuantity
    buyerIdentity {
      countryCode
      customer {
        id
        email
        firstName
        lastName
        displayName
      }
      email
      phone
    }
    lines(first: $numCartLines) {
      nodes {
        ...CartLine
      }
    }
    cost {
      subtotalAmount {
        ...Money
      }
      totalAmount {
        ...Money
      }
      totalDutyAmount {
        ...Money
      }
      totalTaxAmount {
        ...Money
      }
    }
    note
    attributes {
      key
      value
    }
    discountCodes {
      code
      applicable
    }
  }
` as const;
```

## Optimistic UI

```typescript
import {useOptimisticCart} from '@shopify/hydrogen';

export function CartBadge() {
  const cart = useOptimisticCart();
  
  return (
    <button className="relative">
      <ShoppingBagIcon />
      {cart?.totalQuantity > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {cart.totalQuantity}
        </span>
      )}
    </button>
  );
}
```

## Error Handling

```typescript
export function CartMain({cart}: {cart: Cart | null}) {
  if (!cart) {
    return (
      <div className="p-4">
        <p>Unable to load cart. Please try again.</p>
      </div>
    );
  }
  
  if (cart.totalQuantity === 0) {
    return (
      <div className="p-4">
        <p>Your cart is empty</p>
        <Link to="/collections/all">Continue Shopping</Link>
      </div>
    );
  }
  
  return (
    <div>
      {/* Cart contents */}
    </div>
  );
}
```

## Testing Patterns

```typescript
import {describe, it, expect, vi} from 'vitest';

describe('Cart Operations', () => {
  it('should add item to cart', async () => {
    const mockCart = {
      get: vi.fn().mockResolvedValue({
        id: 'cart-123',
        totalQuantity: 1,
        lines: {
          nodes: [
            {
              id: 'line-1',
              quantity: 1,
              merchandise: {
                id: 'variant-1',
                product: {title: '1 Year Token'},
              },
            },
          ],
        },
      }),
    };
    
    const result = await mockCart.get();
    
    expect(result.totalQuantity).toBe(1);
    expect(result.lines.nodes[0].merchandise.product.title).toBe('1 Year Token');
  });
});
```

## Gotchas & Best Practices

- **DO:** Use CartForm for all cart mutations (progressive enhancement)
- **DO:** Show loading states during cart operations
- **DO:** Use optimistic UI for immediate feedback
- **DO:** Handle empty cart states
- **DO:** Preserve line item attributes (engraving, etc.)
- **DO:** Close cart drawer on navigation
- **AVOID:** Mutating cart in client-side state (use CartForm)
- **AVOID:** Blocking UI during cart updates
- **AVOID:** Losing cart data on page refresh (cookie-persisted cart ID)
- **AVOID:** Forgetting to disable buttons during submission
- **AVOID:** Not validating line item properties before adding to cart

## Related Skills

- `shopify-storefront-api` - Cart queries
- `product-personalization` - Line item properties
- `react-router-patterns` - Cart actions
- `ui-components` - Cart drawer/aside
