# Form Validation Skill

## Overview

This skill covers form validation using Zod schemas with react-hook-form for client-side validation and server-side validation in route actions. Use this when building any form (contact, newsletter, auth, account management, product personalization).

## Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| Validation Library | Zod | 4.3.6 |
| Form Management | react-hook-form | 7.71.1 |
| Form Resolver | @hookform/resolvers | 5.2.2 |
| UI Components | Radix UI Form | 0.1.8 |

## Directory Structure

```
app/
├── lib/
│   └── validation.ts         # Zod schemas for all forms
├── routes/
│   └── ($locale).*.tsx       # Routes with form actions
└── components/
    └── forms/
        └── *.tsx             # Form components
```

## Core Patterns

### Pattern: Server-Side Validation in Actions

**When to use:** Validate form submissions in route actions

**File Location:** Any route with a form action

```typescript
import {redirect} from 'react-router';
import type {Route} from './+types/contact';
import {contactFormSchema, formatZodErrors} from '~/lib/validation';

export async function action({request}: Route.ActionArgs) {
  const formData = await request.formData();
  
  const data = {
    name: String(formData.get('name') || ''),
    email: String(formData.get('email') || ''),
    subject: String(formData.get('subject') || ''),
    message: String(formData.get('message') || ''),
    honeypot: String(formData.get('honeypot') || ''),
  };
  
  // Validate with Zod
  const validation = contactFormSchema.safeParse(data);
  
  if (!validation.success) {
    return {
      errors: formatZodErrors(validation.error),
      fields: data,
    };
  }
  
  // Honeypot spam protection
  if (data.honeypot) {
    return {
      errors: {_form: 'Spam detected'},
      fields: data,
    };
  }
  
  // Process valid data
  try {
    await sendContactEmail(validation.data);
    return redirect('/contact?success=true');
  } catch (error) {
    return {
      errors: {_form: 'Failed to send message. Please try again.'},
      fields: data,
    };
  }
}
```

### Pattern: Client-Side Validation with react-hook-form

**When to use:** Provide immediate feedback in forms

**File Location:** Form components

```typescript
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {Form, useActionData, useNavigation} from 'react-router';
import {contactFormSchema, type ContactFormData} from '~/lib/validation';
import * as FormPrimitive from '@radix-ui/react-form';

export function ContactForm() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  
  const {
    register,
    handleSubmit,
    formState: {errors},
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: actionData?.fields || {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  return (
    <Form method="post" className="space-y-4">
      {actionData?.errors?._form && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{actionData.errors._form}</p>
        </div>
      )}
      
      <FormPrimitive.Field name="name">
        <FormPrimitive.Label className="block text-sm font-medium">
          Name
        </FormPrimitive.Label>
        <FormPrimitive.Control asChild>
          <input
            {...register('name')}
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300"
            disabled={isSubmitting}
          />
        </FormPrimitive.Control>
        {errors.name && (
          <FormPrimitive.Message className="mt-1 text-sm text-red-600">
            {errors.name.message}
          </FormPrimitive.Message>
        )}
        {actionData?.errors?.name && (
          <p className="mt-1 text-sm text-red-600">
            {actionData.errors.name}
          </p>
        )}
      </FormPrimitive.Field>
      
      <FormPrimitive.Field name="email">
        <FormPrimitive.Label className="block text-sm font-medium">
          Email
        </FormPrimitive.Label>
        <FormPrimitive.Control asChild>
          <input
            {...register('email')}
            type="email"
            className="mt-1 block w-full rounded-md border-gray-300"
            disabled={isSubmitting}
          />
        </FormPrimitive.Control>
        {errors.email && (
          <FormPrimitive.Message className="mt-1 text-sm text-red-600">
            {errors.email.message}
          </FormPrimitive.Message>
        )}
      </FormPrimitive.Field>
      
      {/* Honeypot field - hidden from users */}
      <input
        type="text"
        name="honeypot"
        tabIndex={-1}
        autoComplete="off"
        className="absolute left-[-9999px]"
      />
      
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </button>
    </Form>
  );
}
```

### Pattern: Inline Field Validation

**When to use:** Validate single fields on blur or change

```typescript
import {validateField, contactFormSchema} from '~/lib/validation';
import {useState} from 'react';

export function EmailInput() {
  const [error, setError] = useState<string | null>(null);
  
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const emailSchema = contactFormSchema.shape.email;
    const validationError = validateField(emailSchema, value);
    setError(validationError);
  };
  
  return (
    <div>
      <input
        type="email"
        name="email"
        onBlur={handleBlur}
        className="block w-full rounded-md border-gray-300"
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
```

## Type/Model Definitions

All validation schemas are defined in `app/lib/validation.ts`:

```typescript
import {z} from 'zod';

// Contact Form
export const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Please enter a valid email address'),
  subject: z
    .string()
    .min(3, 'Subject must be at least 3 characters')
    .max(200, 'Subject must be less than 200 characters'),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message must be less than 2000 characters'),
  honeypot: z.string().max(0).optional(),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

// Newsletter Signup
export const newsletterSignupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  consent: z
    .boolean()
    .refine((val) => val === true, 'You must consent to receive emails'),
  honeypot: z.string().max(0).optional(),
});

export type NewsletterSignupData = z.infer<typeof newsletterSignupSchema>;

// Login
export const loginFormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormData = z.infer<typeof loginFormSchema>;

// Registration
export const registerFormSchema = z.object({
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters'),
  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    ),
  confirmPassword: z.string(),
  acceptsMarketing: z.boolean().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type RegisterFormData = z.infer<typeof registerFormSchema>;

// Password Reset
export const passwordResetRequestSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const passwordResetSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    ),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// Profile Update
export const profileUpdateSchema = z.object({
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters'),
  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number')
    .optional()
    .or(z.literal('')),
});

export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;

// Address Form
export const addressFormSchema = z.object({
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters'),
  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters'),
  company: z
    .string()
    .max(100, 'Company name must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  address1: z
    .string()
    .min(3, 'Address must be at least 3 characters')
    .max(100, 'Address must be less than 100 characters'),
  address2: z
    .string()
    .max(100, 'Address line 2 must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  city: z
    .string()
    .min(2, 'City must be at least 2 characters')
    .max(50, 'City must be less than 50 characters'),
  country: z.string().min(2, 'Please select a country'),
  province: z.string().min(2, 'Please select a state/province'),
  zip: z
    .string()
    .min(3, 'ZIP/Postal code must be at least 3 characters')
    .max(10, 'ZIP/Postal code must be less than 10 characters'),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number')
    .optional()
    .or(z.literal('')),
  isDefault: z.boolean().optional(),
});

export type AddressFormData = z.infer<typeof addressFormSchema>;

// Engraving (Product Personalization)
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

// Gift Message (Cart Attributes)
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

### Format Zod Errors for Form Display

**Purpose:** Convert Zod validation errors to field-level error object

```typescript
export function formatZodErrors(
  error: z.ZodError,
): Record<string, string | undefined> {
  const fieldErrors: Record<string, string | undefined> = {};
  error.issues.forEach((err) => {
    const path = err.path.join('.');
    if (path) {
      fieldErrors[path] = err.message;
    }
  });
  return fieldErrors;
}
```

**Usage:**

```typescript
const validation = contactFormSchema.safeParse(data);

if (!validation.success) {
  return {
    errors: formatZodErrors(validation.error),
    fields: data,
  };
}
```

### Validate Single Field

**Purpose:** Validate a single field value

```typescript
export function validateField<T>(
  schema: z.ZodSchema<T>,
  value: unknown,
): string | null {
  const result = schema.safeParse(value);
  if (!result.success) {
    return result.error.issues[0]?.message || 'Invalid input';
  }
  return null;
}
```

**Usage:**

```typescript
const emailSchema = contactFormSchema.shape.email;
const error = validateField(emailSchema, 'invalid-email');
// Returns: "Please enter a valid email address"
```

## Validation Patterns

### Password Strength Validation

```typescript
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password must be less than 100 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  );
```

### Optional Fields with Empty String Support

```typescript
const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number')
  .optional()
  .or(z.literal('')); // Allow empty string
```

### Conditional Validation

```typescript
const schema = z.object({
  isGift: z.boolean(),
  giftMessage: z.string().optional(),
}).refine(
  (data) => {
    // If isGift is true, giftMessage must be provided
    if (data.isGift) {
      return data.giftMessage && data.giftMessage.length > 0;
    }
    return true;
  },
  {
    message: 'Gift message is required when sending as gift',
    path: ['giftMessage'],
  },
);
```

### Password Confirmation

```typescript
const schema = z.object({
  password: z.string().min(8),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'], // Error appears on confirmPassword field
});
```

### Honeypot Spam Protection

```typescript
const schema = z.object({
  email: z.string().email(),
  honeypot: z.string().max(0).optional(), // Must be empty
});

// In action
if (data.honeypot) {
  return {errors: {_form: 'Spam detected'}};
}
```

## Error Handling

### Display Field-Level Errors

```typescript
<FormPrimitive.Field name="email">
  <FormPrimitive.Label>Email</FormPrimitive.Label>
  <FormPrimitive.Control asChild>
    <input {...register('email')} type="email" />
  </FormPrimitive.Control>
  
  {/* Client-side error from react-hook-form */}
  {errors.email && (
    <FormPrimitive.Message className="text-sm text-red-600">
      {errors.email.message}
    </FormPrimitive.Message>
  )}
  
  {/* Server-side error from action */}
  {actionData?.errors?.email && (
    <p className="text-sm text-red-600">
      {actionData.errors.email}
    </p>
  )}
</FormPrimitive.Field>
```

### Display Form-Level Errors

```typescript
{actionData?.errors?._form && (
  <div className="rounded-md bg-red-50 p-4">
    <p className="text-sm text-red-800">
      {actionData.errors._form}
    </p>
  </div>
)}
```

## Testing Patterns

```typescript
import {describe, it, expect} from 'vitest';
import {contactFormSchema, formatZodErrors} from '~/lib/validation';

describe('Contact Form Validation', () => {
  it('should validate correct data', () => {
    const data = {
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Question',
      message: 'This is a test message',
    };
    
    const result = contactFormSchema.safeParse(data);
    expect(result.success).toBe(true);
  });
  
  it('should reject invalid email', () => {
    const data = {
      name: 'John Doe',
      email: 'invalid-email',
      subject: 'Question',
      message: 'This is a test message',
    };
    
    const result = contactFormSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = formatZodErrors(result.error);
      expect(errors.email).toBe('Please enter a valid email address');
    }
  });
  
  it('should reject short names', () => {
    const data = {
      name: 'J',
      email: 'john@example.com',
      subject: 'Question',
      message: 'This is a test message',
    };
    
    const result = contactFormSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});
```

## Gotchas & Best Practices

- **DO:** Validate on both client and server (never trust client-only validation)
- **DO:** Use consistent error messages across similar fields
- **DO:** Provide specific, actionable error messages
- **DO:** Use honeypot fields for spam protection (hidden from users)
- **DO:** Preserve form values on validation errors
- **DO:** Disable submit button during submission
- **AVOID:** Showing technical error details to users
- **AVOID:** Using only client-side validation (security risk)
- **AVOID:** Vague error messages like "Invalid input"
- **AVOID:** Exposing sensitive validation logic (e.g., password requirements that help attackers)
- **AVOID:** Validating on every keystroke (use blur or debounce)

## Related Skills

- `react-router-patterns` - Form actions and data handling
- `ui-components` - Radix UI Form components
- `shopify-customer-account-api` - Customer form submissions
- `product-personalization` - Engraving validation
