# Product Personalization Reference

## Industry Best Practices

### User Experience

**Preview Before Confirmation**
```typescript
// DO: Always show preview for non-refundable customization
export function EngravingForm() {
  const [showPreview, setShowPreview] = useState(false);
  const [engravingText, setEngravingText] = useState('');
  
  const handlePreview = () => {
    if (engravingText.trim()) {
      setShowPreview(true);
    }
  };
  
  return (
    <>
      <input value={engravingText} onChange={(e) => setEngravingText(e.target.value)} />
      <button onClick={handlePreview}>Preview Engraving</button>
      
      {showPreview && (
        <EngravingPreviewModal
          text={engravingText}
          onConfirm={handleConfirm}
        />
      )}
    </>
  );
}

// AVOID: Adding to cart without preview
<AddToCartButton lines={lines} /> // User can't review first
```

**Character Limits with Real-Time Feedback**
```typescript
// DO: Show remaining characters
export function EngravingInput() {
  const [text, setText] = useState('');
  const maxLength = 50;
  const remaining = maxLength - text.length;
  
  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, maxLength))}
        maxLength={maxLength}
      />
      <p className={remaining < 10 ? 'text-red-600' : 'text-gray-600'}>
        {remaining} characters remaining
      </p>
    </div>
  );
}
```

**Clear Non-Refundable Policy**
```typescript
// DO: Require explicit acknowledgment
const engravingConfirmedSchema = z
  .boolean()
  .refine(
    (val) => val === true,
    'You must confirm this engraving is correct and non-refundable'
  );

// In UI
<label className="flex items-start gap-2">
  <input type="checkbox" {...register('engravingConfirmed')} />
  <span className="text-sm">
    I confirm this engraving is correct and understand it is{' '}
    <strong>non-refundable and cannot be changed</strong> after placement.
  </span>
</label>
```

### Data Validation

**Restrict Special Characters**
```typescript
// DO: Limit to engraving-safe characters
const engravingTextSchema = z
  .string()
  .max(50, 'Maximum 50 characters')
  .regex(
    /^[a-zA-Z0-9\s\-.'&,]*$/,
    'Only letters, numbers, spaces, and basic punctuation (- . \' & ,) allowed'
  );

// AVOID: Allowing all characters
const engravingTextSchema = z.string().max(50); // Could include emojis, special chars
```

**Sanitize Input**
```typescript
import DOMPurify from 'isomorphic-dompurify';

// DO: Sanitize before storing
export function sanitizeEngravingText(text: string): string {
  // Remove HTML tags
  const clean = DOMPurify.sanitize(text, {ALLOWED_TAGS: []});
  
  // Remove extra whitespace
  return clean.trim().replace(/\s+/g, ' ');
}

// Usage
const sanitized = sanitizeEngravingText(formData.get('engravingText'));
```

### Attribute Naming Conventions

**Public vs Private Attributes**
```typescript
// Public attributes (visible on packing slip, order details)
const publicAttributes = [
  {key: 'Engraving', value: 'Sarah M. - 1 Year'},
  {key: 'Gift Message', value: 'Happy Anniversary!'},
];

// Private attributes (internal only, prefix with underscore)
const privateAttributes = [
  {key: '_engravingNote', value: 'Use script font'},
  {key: '_rushOrder', value: 'true'},
  {key: '_internalNote', value: 'Customer called about this'},
];

// Combined
const attributes = [...publicAttributes, ...privateAttributes];
```

## Performance Optimization

### Lazy Load Preview Modals

**Defer Modal Component**
```typescript
import {lazy, Suspense} from 'react';

// Lazy load modal (only when needed)
const EngravingPreviewModal = lazy(() => import('./EngravingPreviewModal'));

export function EngravingForm() {
  const [showPreview, setShowPreview] = useState(false);
  
  return (
    <>
      <input />
      <button onClick={() => setShowPreview(true)}>Preview</button>
      
      {showPreview && (
        <Suspense fallback={<div>Loading preview...</div>}>
          <EngravingPreviewModal onClose={() => setShowPreview(false)} />
        </Suspense>
      )}
    </>
  );
}
```

### Debounced Character Count

**Prevent Excessive Re-renders**
```typescript
import {useMemo} from 'react';

export function EngravingInput({maxLength = 50}: Props) {
  const [text, setText] = useState('');
  
  // Memoize character count
  const charInfo = useMemo(() => {
    const remaining = maxLength - text.length;
    const isNearLimit = remaining < 10;
    return {remaining, isNearLimit};
  }, [text.length, maxLength]);
  
  return (
    <div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} />
      <p className={charInfo.isNearLimit ? 'text-red-600' : 'text-gray-600'}>
        {charInfo.remaining} characters remaining
      </p>
    </div>
  );
}
```

## Security Considerations

### Validate Attribute Keys

**Prevent Attribute Injection**
```typescript
// DO: Whitelist allowed attribute keys
const ALLOWED_ATTRIBUTE_KEYS = [
  'Engraving',
  'Gift Message',
  'Recipient Name',
  '_engravingNote',
  '_specialInstructions',
] as const;

type AllowedAttributeKey = typeof ALLOWED_ATTRIBUTE_KEYS[number];

const attributeSchema = z.object({
  key: z.enum(ALLOWED_ATTRIBUTE_KEYS),
  value: z.string().max(500),
});

// Validate before adding to cart
const validation = z.array(attributeSchema).safeParse(attributes);
if (!validation.success) {
  return {error: 'Invalid attributes'};
}
```

### XSS Prevention

**Escape User Input**
```typescript
// DO: Escape when displaying
import {escapeHtml} from '~/lib/utils';

export function CartLineItem({line}: Props) {
  const engraving = line.attributes?.find(a => a.key === 'Engraving');
  
  return (
    <div>
      {engraving && (
        <p className="engraving">
          <strong>Engraving:</strong>{' '}
          {escapeHtml(engraving.value)} {/* Escaped! */}
        </p>
      )}
    </div>
  );
}

// AVOID: Directly rendering
<p dangerouslySetInnerHTML={{__html: engraving.value}} /> // XSS risk!
```

### Length Limits Enforcement

**Server-Side Validation**
```typescript
// DO: Validate on server (can't trust client)
export async function action({request}: Route.ActionArgs) {
  const formData = await request.formData();
  const engravingText = String(formData.get('engravingText'));
  
  // Server-side validation
  if (engravingText.length > 50) {
    return {
      error: 'Engraving text too long (max 50 characters)',
      field: 'engravingText',
    };
  }
  
  // Additional checks
  if (!/^[a-zA-Z0-9\s\-.'&,]*$/.test(engravingText)) {
    return {
      error: 'Invalid characters in engraving text',
      field: 'engravingText',
    };
  }
  
  // Safe to proceed
}
```

## Advanced Patterns

### Multi-Line Engraving

**Handle Multiple Lines**
```typescript
const multiLineEngravingSchema = z.object({
  line1: z.string().max(25, 'Line 1: max 25 characters'),
  line2: z.string().max(25, 'Line 2: max 25 characters'),
  line3: z.string().max(25, 'Line 3: max 25 characters').optional(),
});

// Store as single attribute
const engravingValue = [
  data.line1,
  data.line2,
  data.line3,
].filter(Boolean).join('\n');

const attributes = [
  {key: 'Engraving', value: engravingValue},
];
```

### Font/Style Selection

**Additional Customization Options**
```typescript
const engravingSchema = z.object({
  text: z.string().max(50),
  font: z.enum(['script', 'print', 'serif']),
  size: z.enum(['small', 'medium', 'large']),
});

// Store as separate attributes
const attributes = [
  {key: 'Engraving', value: data.text},
  {key: '_engravingFont', value: data.font},
  {key: '_engravingSize', value: data.size},
];
```

### Image Upload for Custom Design

**Handle Custom Graphics**
```typescript
// Upload image first (separate route)
export async function action({request}: Route.ActionArgs) {
  const formData = await request.formData();
  const image = formData.get('image') as File;
  
  // Validate image
  if (!image || !image.type.startsWith('image/')) {
    return {error: 'Invalid image file'};
  }
  
  if (image.size > 5 * 1024 * 1024) { // 5MB
    return {error: 'Image too large (max 5MB)'};
  }
  
  // Upload to CDN (e.g., Cloudflare R2, AWS S3)
  const imageUrl = await uploadImage(image);
  
  // Store URL as attribute
  return {imageUrl};
}

// Then add to cart with image URL
const attributes = [
  {key: '_customDesignUrl', value: imageUrl},
];
```

### Conditional Personalization

**Show Based on Product Type**
```typescript
export default function ProductForm({product}: Props) {
  // Check if product supports engraving
  const supportsEngraving = product.tags?.includes('engravable');
  const supportsGiftMessage = product.productType === 'Gift';
  
  return (
    <div>
      {supportsEngraving && <EngravingForm />}
      {supportsGiftMessage && <GiftMessageForm />}
      
      <AddToCartButton />
    </div>
  );
}
```

## Common Pitfalls & Solutions

### Problem: Lost Personalization on Cart Update

**Symptom:** Engraving disappears when quantity changes

**Solution:** Preserve attributes in update
```typescript
// WRONG: Missing attributes
const lines = [{
  id: line.id,
  quantity: newQuantity,
}];

// RIGHT: Include attributes
const lines = [{
  id: line.id,
  quantity: newQuantity,
  attributes: line.attributes, // Preserve!
}];
```

### Problem: Character Count Mismatch

**Symptom:** Server rejects text that client allowed

**Solution:** Use same validation on client and server
```typescript
// Shared validation schema
// app/lib/validation.ts
export const engravingTextSchema = z.string().max(50);

// Client (form)
const {register, formState: {errors}} = useForm({
  resolver: zodResolver(z.object({
    engravingText: engravingTextSchema, // Same schema
  })),
});

// Server (action)
const validation = engravingTextSchema.safeParse(formData.get('engravingText'));
```

### Problem: Preview Font Doesn't Match

**Symptom:** Preview shows wrong font style

**Solution:** Use CSS that matches engraving machine
```typescript
// DO: Match actual engraving output
<div
  className="engraving-preview"
  style={{
    fontFamily: 'Playfair Display, serif', // Matches engraver
    fontSize: '24px',
    letterSpacing: '0.05em',
  }}
>
  {engravingText}
</div>

// AVOID: Generic font
<div style={{fontFamily: 'Arial'}}>
  {engravingText}
</div>
```

### Problem: Attributes Not on Packing Slip

**Symptom:** Warehouse can't see engraving text

**Solution:** Use public attributes (no underscore)
```typescript
// WRONG: Private attribute (hidden from packing slip)
{key: '_engraving', value: 'Sarah M.'}

// RIGHT: Public attribute (visible on packing slip)
{key: 'Engraving', value: 'Sarah M.'}
```

## Testing Patterns

### Validation Testing

```typescript
import {describe, it, expect} from 'vitest';
import {engravingFormSchema} from '~/lib/validation';

describe('Engraving Validation', () => {
  it('should accept valid engraving', () => {
    const result = engravingFormSchema.safeParse({
      engravingText: 'Sarah M. - 1 Year',
      engravingNote: '',
      engravingConfirmed: true,
    });
    
    expect(result.success).toBe(true);
  });
  
  it('should reject text over limit', () => {
    const result = engravingFormSchema.safeParse({
      engravingText: 'A'.repeat(51),
      engravingNote: '',
      engravingConfirmed: true,
    });
    
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toContain('50 characters');
  });
  
  it('should reject special characters', () => {
    const result = engravingFormSchema.safeParse({
      engravingText: 'Test <script>alert("xss")</script>',
      engravingNote: '',
      engravingConfirmed: true,
    });
    
    expect(result.success).toBe(false);
  });
  
  it('should require confirmation', () => {
    const result = engravingFormSchema.safeParse({
      engravingText: 'Test',
      engravingNote: '',
      engravingConfirmed: false,
    });
    
    expect(result.success).toBe(false);
  });
});
```

### Component Testing

```typescript
import {render, screen, fireEvent} from '@testing-library/react';
import {EngravingForm} from '~/components/product/EngravingForm';

describe('EngravingForm', () => {
  it('should show character count', () => {
    render(<EngravingForm onConfirm={() => {}} productTitle="Token" variantTitle="1 Year" />);
    
    const input = screen.getByLabelText(/engraving text/i);
    fireEvent.change(input, {target: {value: 'Test'}});
    
    expect(screen.getByText('4/50 characters')).toBeInTheDocument();
  });
  
  it('should enable preview when text entered', () => {
    render(<EngravingForm onConfirm={() => {}} productTitle="Token" variantTitle="1 Year" />);
    
    const input = screen.getByLabelText(/engraving text/i);
    const previewBtn = screen.getByText(/preview/i);
    
    expect(previewBtn).toBeDisabled();
    
    fireEvent.change(input, {target: {value: 'Test'}});
    
    expect(previewBtn).toBeEnabled();
  });
});
```

## Accessibility

### Screen Reader Support

```typescript
// DO: Provide clear labels and ARIA
<div>
  <label htmlFor="engraving-text" className="block font-medium">
    Engraving Text (Optional)
  </label>
  <input
    id="engraving-text"
    aria-describedby="engraving-help engraving-error"
    aria-invalid={!!error}
    maxLength={50}
  />
  <p id="engraving-help" className="text-sm text-gray-600">
    Maximum 50 characters. Only letters, numbers, and basic punctuation allowed.
  </p>
  {error && (
    <p id="engraving-error" role="alert" className="text-sm text-red-600">
      {error}
    </p>
  )}
</div>
```

### Keyboard Navigation

```typescript
// DO: Support keyboard-only users
export function EngravingPreviewModal({onClose, onConfirm}: Props) {
  useEffect(() => {
    // Trap focus in modal
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);
  
  return (
    <Dialog.Root open onOpenChange={onClose}>
      <Dialog.Content>
        {/* Focusable elements */}
        <button onClick={onClose} aria-label="Close">×</button>
        <button onClick={onConfirm}>Confirm</button>
      </Dialog.Content>
    </Dialog.Root>
  );
}
```

## Related Resources

- Shopify Line Item Properties: https://shopify.dev/docs/api/liquid/objects/line_item#line_item-properties
- Cart Attributes: https://shopify.dev/docs/api/storefront/latest/mutations/cartAttributesUpdate
- Zod Schema Validation: https://zod.dev/
- React Hook Form: https://react-hook-form.com/
