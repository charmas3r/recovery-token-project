# Email Integration Skill

## Overview

This skill covers email integration using Resend for transactional emails, contact forms, and newsletter signups. Use this when implementing email functionality in the Recovery Token Store.

## Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| Email Service | Resend | Latest |
| Email Templates | React Email (optional) | Latest |

## Directory Structure

```
app/
├── lib/
│   └── resend.server.ts        # Resend client and helpers
├── routes/
│   ├── ($locale).contact.tsx   # Contact form with email
│   └── ($locale).newsletter.tsx # Newsletter signup
└── emails/ (optional)
    ├── ContactFormEmail.tsx
    └── WelcomeEmail.tsx
```

## Core Patterns

### Pattern: Initialize Resend Client

**File Location:** `app/lib/resend.server.ts`

```typescript
import {Resend} from 'resend';

// Initialize Resend client
export function createResendClient(apiKey: string) {
  return new Resend(apiKey);
}

// Get client from context
export function getResendClient(env: Env) {
  if (!env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not set');
  }
  return createResendClient(env.RESEND_API_KEY);
}
```

### Pattern: Send Contact Form Email

**When to use:** Handle contact form submissions

```typescript
import type {Route} from './+types/contact';
import {getResendClient} from '~/lib/resend.server';
import {contactFormSchema} from '~/lib/validation';

export async function action({request, context}: Route.ActionArgs) {
  const formData = await request.formData();
  
  const data = {
    name: String(formData.get('name') || ''),
    email: String(formData.get('email') || ''),
    subject: String(formData.get('subject') || ''),
    message: String(formData.get('message') || ''),
  };
  
  // Validate
  const validation = contactFormSchema.safeParse(data);
  if (!validation.success) {
    return {errors: formatZodErrors(validation.error), fields: data};
  }
  
  // Send email via Resend
  try {
    const resend = getResendClient(context.env);
    
    await resend.emails.send({
      from: 'Recovery Token Store <noreply@recoverytoken.store>',
      to: 'support@recoverytoken.store',
      replyTo: data.email,
      subject: `Contact Form: ${data.subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>From:</strong> ${data.name} (${data.email})</p>
        <p><strong>Subject:</strong> ${data.subject}</p>
        <p><strong>Message:</strong></p>
        <p>${data.message}</p>
      `,
    });
    
    return redirect('/contact?success=true');
  } catch (error) {
    console.error('Failed to send email:', error);
    return {
      errors: {_form: 'Failed to send message. Please try again.'},
      fields: data,
    };
  }
}
```

### Pattern: Newsletter Signup

**When to use:** Add contacts to email list

```typescript
export async function action({request, context}: Route.ActionArgs) {
  const formData = await request.formData();
  const email = String(formData.get('email') || '');
  
  // Validate
  const validation = newsletterSignupSchema.safeParse({
    email,
    consent: formData.get('consent') === 'on',
  });
  
  if (!validation.success) {
    return {errors: formatZodErrors(validation.error)};
  }
  
  try {
    const resend = getResendClient(context.env);
    
    // Add to audience (mailing list)
    await resend.contacts.create({
      email: validation.data.email,
      audienceId: context.env.RESEND_AUDIENCE_ID,
      unsubscribed: false,
    });
    
    // Send welcome email
    await resend.emails.send({
      from: 'Recovery Token Store <hello@recoverytoken.store>',
      to: validation.data.email,
      subject: 'Welcome to Recovery Token Store',
      html: `
        <h1>Welcome!</h1>
        <p>Thank you for subscribing to our newsletter.</p>
        <p>You'll receive updates about new products and inspiring recovery stories.</p>
      `,
    });
    
    return {success: true};
  } catch (error) {
    console.error('Newsletter signup failed:', error);
    return {
      errors: {_form: 'Failed to subscribe. Please try again.'},
    };
  }
}
```

### Pattern: Order Confirmation Email

**When to use:** Send order confirmations (via webhook)

```typescript
interface OrderData {
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  lineItems: Array<{
    title: string;
    quantity: number;
    price: string;
  }>;
  totalPrice: string;
}

export async function sendOrderConfirmation(
  resend: Resend,
  orderData: OrderData,
) {
  await resend.emails.send({
    from: 'Recovery Token Store <orders@recoverytoken.store>',
    to: orderData.customerEmail,
    subject: `Order Confirmation #${orderData.orderNumber}`,
    html: `
      <h1>Thank you for your order, ${orderData.customerName}!</h1>
      <p>Order #${orderData.orderNumber}</p>
      
      <h2>Order Summary</h2>
      <ul>
        ${orderData.lineItems.map((item) => `
          <li>${item.title} - Quantity: ${item.quantity} - ${item.price}</li>
        `).join('')}
      </ul>
      
      <p><strong>Total:</strong> ${orderData.totalPrice}</p>
      
      <p>You'll receive a shipping confirmation once your order ships.</p>
    `,
  });
}
```

## Environment Variables

```env
# .env
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_AUDIENCE_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

## Email Templates (Optional)

Using React Email for better templates:

```typescript
// emails/ContactFormEmail.tsx
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
} from '@react-email/components';

interface ContactFormEmailProps {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export function ContactFormEmail({
  name,
  email,
  subject,
  message,
}: ContactFormEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{backgroundColor: '#f6f9fc', fontFamily: 'Arial, sans-serif'}}>
        <Container style={{margin: '0 auto', padding: '20px 0 48px'}}>
          <Heading style={{fontSize: '24px', fontWeight: 'bold'}}>
            New Contact Form Submission
          </Heading>
          
          <Section>
            <Text><strong>From:</strong> {name} ({email})</Text>
            <Text><strong>Subject:</strong> {subject}</Text>
            <Text><strong>Message:</strong></Text>
            <Text>{message}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
```

**Usage with React Email:**

```typescript
import {render} from '@react-email/render';
import {ContactFormEmail} from '~/emails/ContactFormEmail';

await resend.emails.send({
  from: 'noreply@recoverytoken.store',
  to: 'support@recoverytoken.store',
  subject: `Contact Form: ${data.subject}`,
  html: render(ContactFormEmail(data)),
});
```

## Testing Patterns

```typescript
import {describe, it, expect, vi} from 'vitest';

describe('Email Integration', () => {
  it('should send contact form email', async () => {
    const mockResend = {
      emails: {
        send: vi.fn().mockResolvedValue({id: 'email-123'}),
      },
    };
    
    const result = await mockResend.emails.send({
      from: 'noreply@test.com',
      to: 'support@test.com',
      subject: 'Test',
      html: '<p>Test</p>',
    });
    
    expect(mockResend.emails.send).toHaveBeenCalled();
    expect(result.id).toBe('email-123');
  });
});
```

## Gotchas & Best Practices

- **DO:** Use environment variables for API keys
- **DO:** Set proper "from" addresses (verified domains)
- **DO:** Include unsubscribe links in marketing emails
- **DO:** Handle errors gracefully (email sending can fail)
- **DO:** Log email failures for monitoring
- **AVOID:** Exposing API keys in client code
- **AVOID:** Sending emails synchronously (can block responses)
- **AVOID:** Hardcoding email addresses
- **AVOID:** Forgetting to validate email addresses
- **AVOID:** Sending too many emails (rate limits)

## Related Skills

- `form-validation` - Contact/newsletter form schemas
- `react-router-patterns` - Form actions for email
- `shopify-customer-account-api` - Customer email data
