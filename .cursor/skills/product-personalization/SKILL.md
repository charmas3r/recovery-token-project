# Product Personalization Skill

## Overview

This skill covers adding custom engraving and personalization to products using line item properties and cart attributes. Use this when implementing product customization, gift messages, or any customer-specific product modifications.

## Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| Validation | Zod | 4.3.6 |
| Cart | Shopify Storefront API | 2025-01 |
| UI | Radix UI Dialog | 1.1.15 |

## Directory Structure

```
app/
├── components/
│   └── product/
│       ├── EngravingForm.tsx         # Engraving input form
│       └── EngravingConfirmModal.tsx # Confirmation modal
├── lib/
│   └── validation.ts                 # Engraving schemas
└── routes/
    └── ($locale).products.$handle.tsx # Product page with engraving
```

## Core Patterns

### Pattern: Engraving Form with Validation

**When to use:** Allow customers to add custom text to products

**File Location:** `app/components/product/EngravingForm.tsx`

```typescript
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {engravingFormSchema, type EngravingFormData} from '~/lib/validation';
import {useState} from 'react';
import * as Dialog from '@radix-ui/react-dialog';

interface EngravingFormProps {
  onConfirm: (data: EngravingFormData) => void;
  productTitle: string;
  variantTitle: string;
}

export function EngravingForm({
  onConfirm,
  productTitle,
  variantTitle,
}: EngravingFormProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewText, setPreviewText] = useState('');
  
  const {
    register,
    handleSubmit,
    watch,
    formState: {errors},
  } = useForm<EngravingFormData>({
    resolver: zodResolver(engravingFormSchema),
    defaultValues: {
      engravingText: '',
      engravingNote: '',
      engravingConfirmed: false,
    },
  });
  
  const engravingText = watch('engravingText');
  
  const handlePreview = () => {
    setPreviewText(engravingText);
    setIsModalOpen(true);
  };
  
  const handleConfirm = (data: EngravingFormData) => {
    setIsModalOpen(false);
    onConfirm(data);
  };
  
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="engravingText" className="block text-sm font-medium mb-1">
          Engraving Text (Optional)
        </label>
        <input
          {...register('engravingText')}
          id="engravingText"
          type="text"
          maxLength={50}
          placeholder="e.g., Sarah M. - 1 Year - 03/15/2026"
          className="w-full px-3 py-2 border rounded-md"
        />
        <p className="text-sm text-gray-600 mt-1">
          {engravingText.length}/50 characters
        </p>
        {errors.engravingText && (
          <p className="text-sm text-red-600 mt-1">
            {errors.engravingText.message}
          </p>
        )}
      </div>
      
      <div>
        <label htmlFor="engravingNote" className="block text-sm font-medium mb-1">
          Private Note to Engraver (Optional)
        </label>
        <textarea
          {...register('engravingNote')}
          id="engravingNote"
          rows={3}
          maxLength={200}
          placeholder="Any special instructions (not visible on packing slip)"
          className="w-full px-3 py-2 border rounded-md"
        />
        {errors.engravingNote && (
          <p className="text-sm text-red-600 mt-1">
            {errors.engravingNote.message}
          </p>
        )}
      </div>
      
      {engravingText && (
        <button
          type="button"
          onClick={handlePreview}
          className="w-full py-2 bg-gray-100 text-gray-900 rounded-md hover:bg-gray-200"
        >
          Preview & Confirm Engraving
        </button>
      )}
      
      <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 max-w-md w-full">
            <Dialog.Title className="text-lg font-bold mb-4">
              Confirm Engraving
            </Dialog.Title>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Product</p>
                <p className="font-medium">{productTitle}</p>
                <p className="text-sm text-gray-600">{variantTitle}</p>
              </div>
              
              <div className="bg-gray-100 p-4 rounded-md text-center">
                <p className="text-sm text-gray-600 mb-2">Engraving Preview</p>
                <p className="font-serif text-xl">{previewText}</p>
              </div>
              
              <div className="bg-yellow-50 p-3 rounded-md">
                <p className="text-sm text-yellow-800">
                  ⚠️ Custom engraving is non-refundable. Please verify the text is correct.
                </p>
              </div>
              
              <form onSubmit={handleSubmit(handleConfirm)}>
                <label className="flex items-start gap-2 mb-4">
                  <input
                    {...register('engravingConfirmed')}
                    type="checkbox"
                    className="mt-1"
                  />
                  <span className="text-sm">
                    I confirm this engraving is correct and understand it cannot be changed or refunded
                  </span>
                </label>
                {errors.engravingConfirmed && (
                  <p className="text-sm text-red-600 mb-4">
                    {errors.engravingConfirmed.message}
                  </p>
                )}
                
                <div className="flex gap-2">
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      className="flex-1 py-2 border rounded-md hover:bg-gray-50"
                    >
                      Back & Edit
                    </button>
                  </Dialog.Close>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Confirm & Add to Cart
                  </button>
                </div>
              </form>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
```

### Pattern: Add to Cart with Line Item Properties

**When to use:** Include engraving text with cart item

```typescript
import {AddToCartButton} from '~/components/product/AddToCartButton';
import {useState} from 'react';
import {EngravingForm} from '~/components/product/EngravingForm';
import type {EngravingFormData} from '~/lib/validation';

export default function ProductForm({product, selectedVariant}) {
  const [engravingData, setEngravingData] = useState<EngravingFormData | null>(null);
  const [showEngraving, setShowEngraving] = useState(false);
  
  const handleEngravingConfirm = (data: EngravingFormData) => {
    setEngravingData(data);
    // Trigger add to cart
  };
  
  // Build line item with attributes
  const lines = [
    {
      merchandiseId: selectedVariant.id,
      quantity: 1,
      attributes: engravingData?.engravingText
        ? [
            {key: 'Engraving', value: engravingData.engravingText},
            // Use underscore prefix to hide from packing slip
            ...(engravingData.engravingNote
              ? [{key: '_engravingNote', value: engravingData.engravingNote}]
              : []),
          ]
        : [],
    },
  ];
  
  return (
    <div>
      <label className="flex items-center gap-2 mb-4">
        <input
          type="checkbox"
          checked={showEngraving}
          onChange={(e) => setShowEngraving(e.target.checked)}
        />
        <span>Add custom engraving (+$0.00)</span>
      </label>
      
      {showEngraving && (
        <EngravingForm
          onConfirm={handleEngravingConfirm}
          productTitle={product.title}
          variantTitle={selectedVariant.title}
        />
      )}
      
      {(!showEngraving || engravingData?.engravingConfirmed) && (
        <AddToCartButton lines={lines}>
          Add to Cart
        </AddToCartButton>
      )}
    </div>
  );
}
```

### Pattern: Display Engraving in Cart

**When to use:** Show personalization details in cart

**File Location:** `app/components/cart/CartLineItem.tsx`

```typescript
import type {CartLine} from '@shopify/hydrogen/storefront-api-types';

interface CartLineItemProps {
  line: CartLine;
}

export function CartLineItem({line}: CartLineItemProps) {
  // Extract engraving attribute
  const engravingAttr = line.attributes?.find(
    (attr) => attr.key === 'Engraving',
  );
  
  return (
    <div className="flex gap-4 py-4 border-b">
      <img
        src={line.merchandise.image?.url}
        alt={line.merchandise.image?.altText || ''}
        className="w-20 h-20 object-cover rounded"
      />
      
      <div className="flex-1">
        <h3 className="font-medium">{line.merchandise.product.title}</h3>
        <p className="text-sm text-gray-600">{line.merchandise.title}</p>
        
        {engravingAttr && (
          <div className="mt-2 p-2 bg-blue-50 rounded">
            <p className="text-sm text-blue-900">
              <strong>Engraving:</strong> {engravingAttr.value}
            </p>
          </div>
        )}
        
        <div className="flex items-center gap-2 mt-2">
          <UpdateQuantity lineId={line.id} quantity={line.quantity} />
          <RemoveFromCart lineIds={[line.id]} />
        </div>
      </div>
      
      <div className="text-right">
        <p className="font-medium">${line.cost.totalAmount.amount}</p>
        <p className="text-sm text-gray-600">
          ${line.cost.amountPerQuantity.amount} each
        </p>
      </div>
    </div>
  );
}
```

### Pattern: Gift Message (Cart Attributes)

**When to use:** Add gift message to entire order

```typescript
import {CartForm} from '@shopify/hydrogen';
import {useState} from 'react';
import {giftMessageSchema} from '~/lib/validation';

export function GiftMessageForm() {
  const [isGift, setIsGift] = useState(false);
  const [message, setMessage] = useState('');
  const [recipientName, setRecipientName] = useState('');
  
  return (
    <div className="space-y-4">
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={isGift}
          onChange={(e) => setIsGift(e.target.checked)}
        />
        <span>This is a gift</span>
      </label>
      
      {isGift && (
        <CartForm
          route="/cart"
          action={CartForm.ACTIONS.AttributesUpdateUnstructured}
          inputs={{
            attributes: [
              {key: 'isGift', value: 'true'},
              {key: 'giftMessage', value: message},
              {key: 'giftRecipientName', value: recipientName},
            ],
          }}
        >
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Recipient Name
              </label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Gift Message (max 500 characters)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={500}
                rows={4}
                className="w-full px-3 py-2 border rounded-md"
              />
              <p className="text-sm text-gray-600 mt-1">
                {message.length}/500 characters
              </p>
            </div>
            
            <button
              type="submit"
              className="w-full py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Save Gift Options
            </button>
          </div>
        </CartForm>
      )}
    </div>
  );
}
```

## Type/Model Definitions

```typescript
// app/lib/validation.ts

export const engravingFormSchema = z.object({
  engravingText: z
    .string()
    .max(50, 'Engraving text must be 50 characters or less')
    .regex(
      /^[a-zA-Z0-9\s\-.'&,]*$/,
      'Engraving can only contain letters, numbers, spaces, and basic punctuation (- . \' & ,)',
    )
    .optional()
    .or(z.literal('')),
  engravingNote: z
    .string()
    .max(200, 'Private note must be 200 characters or less')
    .optional()
    .or(z.literal('')),
  engravingConfirmed: z
    .boolean()
    .refine((val) => val === true, 'You must confirm the engraving is correct'),
});

export type EngravingFormData = z.infer<typeof engravingFormSchema>;

export const giftMessageSchema = z.object({
  isGift: z.boolean(),
  giftMessage: z
    .string()
    .max(500, 'Gift message must be 500 characters or less')
    .optional()
    .or(z.literal('')),
  giftRecipientName: z
    .string()
    .max(100, 'Recipient name must be 100 characters or less')
    .optional()
    .or(z.literal('')),
});

export type GiftMessageData = z.infer<typeof giftMessageSchema>;
```

## Common Operations

### Line Item Attributes Structure

```typescript
// Line item properties (per cart item)
const attributes = [
  {key: 'Engraving', value: 'Sarah M. - 1 Year - 03/15/2026'},
  {key: '_engravingNote', value: 'Please use cursive font'}, // Underscore prefix hides from packing slip
];

// Add to cart with attributes
const lines = [
  {
    merchandiseId: variantId,
    quantity: 1,
    attributes,
  },
];
```

### Cart Attributes Structure

```typescript
// Cart attributes (for entire order)
const cartAttributes = [
  {key: 'isGift', value: 'true'},
  {key: 'giftMessage', value: 'Happy 1 Year!'},
  {key: 'giftRecipientName', value: 'John Doe'},
];

// Update cart attributes
<CartForm
  route="/cart"
  action={CartForm.ACTIONS.AttributesUpdateUnstructured}
  inputs={{attributes: cartAttributes}}
>
  <button type="submit">Save</button>
</CartForm>
```

### Private vs Public Attributes

```typescript
// Public attribute (visible on packing slip and order details)
{key: 'Engraving', value: 'Custom text'}

// Private attribute (internal only, not on packing slip)
{key: '_engravingNote', value: 'Internal note'}
{key: '_specialInstructions', value: 'Handle with care'}
```

## Validation Patterns

### Character Limits

```typescript
// Engraving: 50 characters max
const engravingText = z.string().max(50);

// Gift message: 500 characters max
const giftMessage = z.string().max(500);

// Private note: 200 characters max
const engravingNote = z.string().max(200);
```

### Allowed Characters

```typescript
// Alphanumeric + basic punctuation only
const engravingText = z
  .string()
  .regex(
    /^[a-zA-Z0-9\s\-.'&,]*$/,
    'Only letters, numbers, spaces, and basic punctuation allowed',
  );
```

### Required Confirmation

```typescript
const engravingConfirmed = z
  .boolean()
  .refine(
    (val) => val === true,
    'You must confirm the engraving is correct',
  );
```

## Error Handling

```typescript
// Handle validation errors
const validation = engravingFormSchema.safeParse(data);

if (!validation.success) {
  return {
    errors: formatZodErrors(validation.error),
    fields: data,
  };
}

// Handle missing confirmation
if (!data.engravingConfirmed) {
  return {
    error: 'Please confirm the engraving before adding to cart',
  };
}
```

## Testing Patterns

```typescript
import {describe, it, expect} from 'vitest';
import {engravingFormSchema} from '~/lib/validation';

describe('Engraving Validation', () => {
  it('should accept valid engraving text', () => {
    const data = {
      engravingText: 'Sarah M. - 1 Year',
      engravingNote: '',
      engravingConfirmed: true,
    };
    
    const result = engravingFormSchema.safeParse(data);
    expect(result.success).toBe(true);
  });
  
  it('should reject text over 50 characters', () => {
    const data = {
      engravingText: 'A'.repeat(51),
      engravingNote: '',
      engravingConfirmed: true,
    };
    
    const result = engravingFormSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
  
  it('should reject special characters', () => {
    const data = {
      engravingText: 'Test @ #$%',
      engravingNote: '',
      engravingConfirmed: true,
    };
    
    const result = engravingFormSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
  
  it('should require confirmation', () => {
    const data = {
      engravingText: 'Sarah M.',
      engravingNote: '',
      engravingConfirmed: false,
    };
    
    const result = engravingFormSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});
```

## Gotchas & Best Practices

- **DO:** Show preview before confirmation
- **DO:** Require explicit confirmation for non-refundable items
- **DO:** Use underscore prefix (_) for private notes/attributes
- **DO:** Display engraving in cart for customer review
- **DO:** Validate character limits and allowed characters
- **DO:** Show character count as user types
- **AVOID:** Allowing special characters that could break engraving machines
- **AVOID:** Skipping confirmation modal for custom items
- **AVOID:** Hiding engraving details in cart summary
- **AVOID:** Making engraving required (should be optional)
- **AVOID:** Forgetting to preserve attributes when updating quantity

## Related Skills

- `form-validation` - Zod schemas for engraving
- `cart-management` - Line item attributes
- `ui-components` - Confirmation modals with Radix Dialog
- `shopify-storefront-api` - Cart attribute mutations
