# Form Validation - Reference Documentation

**Last Updated:** January 30, 2026  
**Skill:** form-validation  
**Purpose:** Validation best practices, security patterns, accessibility

---

## Industry Best Practices

### 1. Progressive Enhancement

**Forms Should Work Without JavaScript**

```typescript
// ✅ GOOD: Progressive enhancement with React Router Form
import {Form} from 'react-router';

export function ContactForm() {
  return (
    <Form method="post"> {/* Works without JS */}
      <input type="email" name="email" required />
      <button type="submit">Submit</button>
    </Form>
  );
}

// ❌ BAD: Client-only form submission
<form onSubmit={handleSubmit}> {/* Requires JS */}
  <input type="email" value={email} onChange={setEmail} />
  <button onClick={submit}>Submit</button>
</form>
```

### 2. Validation Timing

**Industry Standard: Validate on Blur + Submit**

```typescript
// ✅ GOOD: Validate on blur (not every keystroke)
<input
  type="email"
  {...register('email')}
  onBlur={() => trigger('email')} // Validate when user leaves field
/>

// ❌ BAD: Validate on every keystroke (annoying)
<input
  type="email"
  onChange={(e) => validateEmail(e.target.value)}
/>
```

### 3. Error Message Best Practices

**WCAG Guidelines: Clear, Specific, Actionable**

```typescript
// ✅ GOOD: Specific, actionable error messages
'Email must be a valid email address (e.g., name@example.com)'
'Password must be at least 8 characters with 1 uppercase and 1 number'
'Phone number must be 10 digits (e.g., 555-123-4567)'

// ❌ BAD: Vague error messages
'Invalid input'
'Error'
'Please fix'
```

### 4. Honeypot Spam Protection

**Simple, Effective Bot Detection**

```typescript
// ✅ GOOD: Hidden honeypot field
<input
  type="text"
  name="honeypot"
  tabIndex={-1}
  autoComplete="off"
  className="absolute left-[-9999px]"
  aria-hidden="true"
/>

// Server validation
if (formData.get('honeypot')) {
  return {error: 'Spam detected'};
}

// ❌ BAD: No bot protection
// Forms without honeypots get spammed heavily
```

## Zod Best Practices

### 1. Composition & Reusability

```typescript
// ✅ GOOD: Reusable schemas
const emailSchema = z.string().email('Invalid email address');
const nameSchema = z.string().min(2).max(50);

const userSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
});

// ❌ BAD: Duplicate validation logic
const userSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  email: z.string().email(),
});
```

### 2. Custom Error Messages

```typescript
// ✅ GOOD: User-friendly custom messages
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain uppercase, lowercase, and a number'
  );

// ❌ BAD: Default Zod messages (technical)
const passwordSchema = z
  .string()
  .min(8) // "String must contain at least 8 character(s)"
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/); // "Invalid"
```

### 3. Conditional Validation

```typescript
// ✅ GOOD: Cross-field validation
const schema = z.object({
  isGift: z.boolean(),
  giftMessage: z.string().optional(),
}).refine(
  (data) => {
    // If gift, message required
    if (data.isGift && !data.giftMessage) {
      return false;
    }
    return true;
  },
  {
    message: 'Gift message is required when sending as gift',
    path: ['giftMessage'],
  }
);
```

## Security Best Practices

### 1. Input Sanitization

```typescript
// ✅ GOOD: Whitelist allowed characters
const engravingSchema = z
  .string()
  .max(50)
  .regex(
    /^[a-zA-Z0-9\s\-.'&,]*$/,
    'Only letters, numbers, spaces, and basic punctuation allowed'
  );

// ❌ BAD: Allowing all characters
const badSchema = z.string().max(50);
// Could allow: <script>alert('xss')</script>
```

### 2. SQL Injection Prevention

**Note:** Shopify APIs handle this, but for custom backends:

```typescript
// ✅ GOOD: Parameterized queries (ORM handles this)
const email = validatedData.email; // Already validated by Zod
await db.user.findUnique({ where: { email } });

// ❌ BAD: String concatenation (never do this)
const query = `SELECT * FROM users WHERE email = '${email}'`;
// Vulnerable to: ' OR '1'='1
```

### 3. Rate Limiting Form Submissions

```typescript
// Track submission attempts
const RATE_LIMIT = 5; // attempts
const WINDOW = 60 * 1000; // 1 minute

async function checkRateLimit(email: string): Promise<boolean> {
  const attempts = await getSubmissionAttempts(email);
  
  if (attempts >= RATE_LIMIT) {
    return false; // Too many attempts
  }
  
  await incrementAttempts(email);
  return true;
}

export async function action({request}: Route.ActionArgs) {
  const formData = await request.formData();
  const email = String(formData.get('email'));
  
  // Check rate limit
  const allowed = await checkRateLimit(email);
  if (!allowed) {
    return {
      error: 'Too many attempts. Please try again in 1 minute.',
    };
  }
  
  // Process form...
}
```

## Accessibility Best Practices

### 1. Associating Labels with Inputs

```typescript
// ✅ GOOD: Explicit label association
<Form.Field name="email">
  <Form.Label htmlFor="email">Email Address</Form.Label>
  <Form.Control asChild>
    <input id="email" type="email" {...register('email')} />
  </Form.Control>
</Form.Field>

// ❌ BAD: No label or implicit association
<input type="email" placeholder="Email" />
```

### 2. Error Announcement

```typescript
// ✅ GOOD: aria-live for dynamic errors
<Form.Message
  className="text-red-600"
  role="alert"
  aria-live="polite"
>
  {error.message}
</Form.Message>

// ✅ GOOD: aria-invalid on inputs with errors
<input
  type="email"
  {...register('email')}
  aria-invalid={errors.email ? 'true' : 'false'}
  aria-describedby={errors.email ? 'email-error' : undefined}
/>
{errors.email && (
  <span id="email-error">{errors.email.message}</span>
)}
```

### 3. Focus Management

```typescript
// ✅ GOOD: Focus first error on submit
import {useEffect, useRef} from 'react';

export function MyForm() {
  const firstErrorRef = useRef<HTMLInputElement>(null);
  const {formState: {errors}} = useForm();
  
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      firstErrorRef.current?.focus();
    }
  }, [errors]);
  
  return (
    <form>
      <input
        ref={errors.email ? firstErrorRef : null}
        {...register('email')}
      />
    </form>
  );
}
```

## Performance Optimization

### 1. Debounced Validation

```typescript
// ✅ GOOD: Debounce async validation
import {useDebouncedCallback} from 'use-debounce';

const checkEmailAvailability = useDebouncedCallback(
  async (email: string) => {
    const available = await fetch(`/api/check-email?email=${email}`);
    return available.json();
  },
  500 // Wait 500ms after typing stops
);
```

### 2. Conditional Schema Parsing

```typescript
// ✅ GOOD: Only validate relevant fields
const schema = conditionalSchema.pick({
  email: true,
  password: isNewUser ? true : undefined,
  confirmPassword: isNewUser ? true : undefined,
});
```

## Common Patterns

### Pattern: Multi-Step Form

```typescript
const step1Schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const step2Schema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
});

const step3Schema = z.object({
  address1: z.string().min(3),
  city: z.string().min(2),
  zip: z.string().min(3),
});

// Validate progressively
export function MultiStepForm() {
  const [step, setStep] = useState(1);
  
  const currentSchema = 
    step === 1 ? step1Schema :
    step === 2 ? step2Schema :
    step3Schema;
  
  const {handleSubmit} = useForm({
    resolver: zodResolver(currentSchema),
  });
  
  const onSubmit = async (data) => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Final submission
      await submitForm(allData);
    }
  };
}
```

### Pattern: Dynamic Field Validation

```typescript
// Engraving: Only validate if checkbox checked
const schema = z.object({
  addEngraving: z.boolean(),
  engravingText: z.string().optional(),
}).refine(
  (data) => {
    if (data.addEngraving) {
      return data.engravingText && data.engravingText.length > 0;
    }
    return true;
  },
  {
    message: 'Engraving text required when engraving is selected',
    path: ['engravingText'],
  }
);
```

## Testing Validation

```typescript
import {describe, it, expect} from 'vitest';
import {contactFormSchema} from '~/lib/validation';

describe('Contact Form Validation', () => {
  it('should accept valid data', () => {
    const data = {
      name: 'John Doe',
      email: 'john@example.com',
      message: 'Test message',
    };
    
    const result = contactFormSchema.safeParse(data);
    expect(result.success).toBe(true);
  });
  
  it('should reject invalid email', () => {
    const data = {
      name: 'John Doe',
      email: 'invalid-email',
      message: 'Test',
    };
    
    const result = contactFormSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['email']);
    }
  });
  
  it('should reject short messages', () => {
    const data = {
      name: 'John',
      email: 'john@example.com',
      message: 'Hi',
    };
    
    const result = contactFormSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});
```

## Quick Reference

### Common Zod Patterns

```typescript
// Email
z.string().email('Invalid email')

// Required string with length
z.string().min(2).max(100)

// Optional field (accepts empty string)
z.string().optional().or(z.literal(''))

// Phone number
z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone')

// Password
z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)

// Boolean checkbox
z.boolean().refine(val => val === true, 'Must be checked')

// Number range
z.number().min(1).max(100)

// Enum/Select
z.enum(['option1', 'option2', 'option3'])

// URL
z.string().url('Invalid URL')

// Date
z.string().datetime() // ISO 8601
z.coerce.date() // Convert string to Date

// Conditional
z.object({...}).refine((data) => condition, {message, path})

// Transform
z.string().transform((val) => val.trim())
```

### Validation Checklist

- [ ] Server-side validation (never trust client)
- [ ] Client-side validation (better UX)
- [ ] Clear, specific error messages
- [ ] Honeypot for spam protection
- [ ] Rate limiting on submissions
- [ ] Accessible error announcements
- [ ] Focus management on errors
- [ ] Progressive enhancement (works without JS)
- [ ] Input sanitization
- [ ] CSRF protection (use React Router Form)

---

**Additional Resources:**
- [Zod Documentation](https://zod.dev/)
- [WCAG Form Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/error-identification.html)
- [OWASP Input Validation](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)
