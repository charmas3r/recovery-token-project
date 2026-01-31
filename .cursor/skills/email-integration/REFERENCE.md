# Email Integration Reference

## Industry Best Practices

### Transactional vs Marketing Emails

**Transactional Emails (High Priority)**
```typescript
// DO: Immediate delivery, no marketing content
await resend.emails.send({
  from: 'orders@recoverytoken.store',
  to: customer.email,
  subject: `Order Confirmation #${order.number}`,
  html: renderOrderConfirmation(order),
  headers: {
    'X-Priority': '1', // High priority
    'X-Entity-Ref-ID': order.id, // For tracking
  },
});

// Examples:
// - Order confirmations
// - Password resets
// - Account verification
// - Shipping notifications
```

**Marketing Emails (Standard Priority)**
```typescript
// DO: Include unsubscribe link, respect preferences
await resend.emails.send({
  from: 'hello@recoverytoken.store',
  to: customer.email,
  subject: 'New Recovery Tokens Now Available',
  html: renderNewsletter(content),
  headers: {
    'List-Unsubscribe': '<https://recoverytoken.store/unsubscribe?token=xxx>',
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
  },
  tags: [
    {name: 'category', value: 'newsletter'},
  ],
});

// Examples:
// - Newsletters
// - Promotional offers
// - Product announcements
```

### Email Authentication

**SPF, DKIM, DMARC Setup**
```typescript
// DNS Records (configure with DNS provider)
// SPF: Specify authorized senders
// TXT @ "v=spf1 include:_spf.resend.com ~all"

// DKIM: Sign emails (Resend handles this)
// Resend provides DKIM keys to add to DNS

// DMARC: Policy for failed auth
// TXT _dmarc "v=DMARC1; p=quarantine; rua=mailto:dmarc@recoverytoken.store"

// Verify in code
export async function verifyEmailAuth() {
  const resend = getResendClient(env);
  const domain = await resend.domains.get('recoverytoken.store');
  
  console.log('SPF:', domain.status.spf); // 'verified'
  console.log('DKIM:', domain.status.dkim); // 'verified'
  console.log('DMARC:', domain.status.dmarc); // 'verified'
}
```

### Rate Limiting

**Prevent Spam**
```typescript
import {RateLimiter} from '@shopify/hydrogen';

const emailRateLimiter = new RateLimiter({
  max: 5, // 5 emails
  windowMs: 60000, // per minute
});

export async function action({request}: Route.ActionArgs) {
  const clientIp = request.headers.get('CF-Connecting-IP') || 'unknown';
  
  // Check rate limit
  const {allowed, remaining, resetTime} = await emailRateLimiter.check(
    `email:${clientIp}`
  );
  
  if (!allowed) {
    return json(
      {
        error: `Too many emails sent. Try again in ${Math.ceil((resetTime - Date.now()) / 1000)}s`,
      },
      {status: 429}
    );
  }
  
  // Send email
  await resend.emails.send({...});
  
  return {success: true, remaining};
}
```

## Email Template Best Practices

### HTML Email Structure

**Mobile-Responsive Templates**
```typescript
// DO: Use table-based layout for email clients
export function OrderConfirmationEmail({order}: Props) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
  <style>
    body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { background: #4f46e5; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; }
    .button { background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; }
    .footer { background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
    @media only screen and (max-width: 600px) {
      .content { padding: 10px; }
    }
  </style>
</head>
<body>
  <table class="container" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td class="header">
        <h1>Order Confirmation</h1>
      </td>
    </tr>
    <tr>
      <td class="content">
        <p>Thank you for your order, ${order.customer.name}!</p>
        <p>Order #${order.number}</p>
        
        <table width="100%" cellpadding="10" cellspacing="0" border="0">
          ${order.lineItems.map((item) => `
            <tr>
              <td>${item.title}</td>
              <td align="right">${item.quantity} × $${item.price}</td>
            </tr>
          `).join('')}
          <tr style="font-weight: bold; border-top: 2px solid #e5e7eb;">
            <td>Total</td>
            <td align="right">$${order.totalPrice}</td>
          </tr>
        </table>
        
        <p style="margin-top: 30px;">
          <a href="https://recoverytoken.store/account/orders/${order.id}" class="button">
            View Order Details
          </a>
        </p>
      </td>
    </tr>
    <tr>
      <td class="footer">
        <p>Recovery Token Store</p>
        <p>123 Main St, City, ST 12345</p>
        <p>
          <a href="https://recoverytoken.store">Visit Store</a> |
          <a href="https://recoverytoken.store/contact">Contact Us</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
```

### React Email (Advanced)

**Component-Based Templates**
```typescript
// emails/OrderConfirmation.tsx
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Row,
  Column,
  Heading,
  Text,
  Button,
  Hr,
  Img,
} from '@react-email/components';

interface OrderConfirmationProps {
  order: {
    number: string;
    customer: {name: string};
    lineItems: Array<{title: string; quantity: number; price: string}>;
    totalPrice: string;
  };
}

export function OrderConfirmation({order}: OrderConfirmationProps) {
  return (
    <Html>
      <Head />
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={styles.header}>
            <Img
              src="https://recoverytoken.store/logo.png"
              width="150"
              height="50"
              alt="Recovery Token Store"
            />
          </Section>
          
          {/* Content */}
          <Section style={styles.content}>
            <Heading as="h1">Thank you for your order!</Heading>
            <Text>Hi {order.customer.name},</Text>
            <Text>
              Your order #{order.number} has been confirmed and will ship soon.
            </Text>
            
            <Hr style={styles.divider} />
            
            {/* Order Items */}
            {order.lineItems.map((item, i) => (
              <Row key={i} style={styles.lineItem}>
                <Column>{item.title}</Column>
                <Column align="right">
                  {item.quantity} × ${item.price}
                </Column>
              </Row>
            ))}
            
            <Hr style={styles.divider} />
            
            <Row style={styles.total}>
              <Column><strong>Total</strong></Column>
              <Column align="right"><strong>${order.totalPrice}</strong></Column>
            </Row>
            
            <Button
              href={`https://recoverytoken.store/account/orders/${order.id}`}
              style={styles.button}
            >
              View Order Details
            </Button>
          </Section>
          
          {/* Footer */}
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              Recovery Token Store • 123 Main St • City, ST 12345
            </Text>
            <Text style={styles.footerText}>
              <a href="https://recoverytoken.store">Visit Store</a> •
              <a href="https://recoverytoken.store/contact">Contact Us</a>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: {
    backgroundColor: '#f6f9fc',
    fontFamily: 'Arial, sans-serif',
  },
  container: {
    margin: '0 auto',
    padding: '20px 0 48px',
    maxWidth: '600px',
  },
  header: {
    padding: '20px',
    textAlign: 'center' as const,
    backgroundColor: '#4f46e5',
  },
  content: {
    padding: '20px',
    backgroundColor: '#ffffff',
  },
  divider: {
    borderColor: '#e5e7eb',
    margin: '20px 0',
  },
  lineItem: {
    padding: '10px 0',
  },
  total: {
    padding: '10px 0',
    fontSize: '18px',
  },
  button: {
    backgroundColor: '#4f46e5',
    color: '#ffffff',
    padding: '12px 24px',
    borderRadius: '4px',
    textDecoration: 'none',
    display: 'inline-block',
    marginTop: '20px',
  },
  footer: {
    padding: '20px',
    backgroundColor: '#f3f4f6',
    textAlign: 'center' as const,
  },
  footerText: {
    fontSize: '12px',
    color: '#6b7280',
  },
};
```

## Security Considerations

### Input Validation

**Sanitize Email Content**
```typescript
import DOMPurify from 'isomorphic-dompurify';
import {z} from 'zod';

// DO: Validate and sanitize inputs
const contactFormSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  message: z.string().min(10).max(5000),
});

export async function action({request}: Route.ActionArgs) {
  const formData = await request.formData();
  
  const data = {
    name: String(formData.get('name')),
    email: String(formData.get('email')),
    message: String(formData.get('message')),
  };
  
  // Validate
  const validation = contactFormSchema.safeParse(data);
  if (!validation.success) {
    return {errors: formatZodErrors(validation.error)};
  }
  
  // Sanitize HTML (remove scripts, etc.)
  const sanitized = {
    ...validation.data,
    message: DOMPurify.sanitize(validation.data.message, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
      ALLOWED_ATTR: ['href'],
    }),
  };
  
  // Safe to send
  await resend.emails.send({
    from: 'noreply@recoverytoken.store',
    to: 'support@recoverytoken.store',
    replyTo: sanitized.email,
    subject: `Contact Form: ${sanitized.name}`,
    html: renderContactEmail(sanitized),
  });
}
```

### Prevent Email Injection

**Validate Email Headers**
```typescript
// DO: Validate email addresses
const emailSchema = z.string().email().refine(
  (email) => {
    // Reject emails with newlines (header injection)
    return !/[\r\n]/.test(email);
  },
  {message: 'Invalid email format'}
);

// AVOID: Direct user input in headers
const userEmail = formData.get('email'); // Could contain "\r\nBcc: attacker@evil.com"
await resend.emails.send({
  to: userEmail, // DANGEROUS!
  // ...
});
```

### API Key Protection

**Server-Only Code**
```typescript
// DO: Keep API keys server-side
// app/lib/resend.server.ts
export function getResendClient(env: Env) {
  if (!env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY not configured');
  }
  return new Resend(env.RESEND_API_KEY);
}

// AVOID: Exposing keys to client
// ❌ Don't do this
const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY); // Exposed to browser!
```

## Error Handling

### Graceful Failures

**Don't Block User Experience**
```typescript
// DO: Handle email failures gracefully
export async function action({request, context}: Route.ActionArgs) {
  const {cart} = context;
  
  // Process order first
  const order = await createOrder(cart);
  
  // Email is secondary - don't fail order if email fails
  try {
    await sendOrderConfirmation(order);
  } catch (error) {
    // Log error for monitoring
    console.error('Failed to send order confirmation:', error);
    
    // Queue for retry (optional)
    await queueEmailRetry('order-confirmation', order.id);
    
    // Don't throw - order still succeeded
  }
  
  return redirect(`/account/orders/${order.id}?emailPending=true`);
}
```

### Retry Logic

**Exponential Backoff**
```typescript
async function sendEmailWithRetry(emailData: EmailData, maxRetries = 3) {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await resend.emails.send(emailData);
      return result; // Success
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on validation errors
      if (error.message.includes('validation')) {
        throw error;
      }
      
      // Wait before retry (exponential backoff)
      const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  
  // All retries failed
  throw lastError;
}
```

## Performance Optimization

### Async Email Sending

**Don't Block Responses**
```typescript
// DO: Send emails asynchronously
export async function action({request}: Route.ActionArgs) {
  const formData = await request.formData();
  
  // Validate immediately
  const validation = contactFormSchema.safeParse(formData);
  if (!validation.success) {
    return {errors: validation.error};
  }
  
  // Send email in background (don't await)
  sendContactEmail(validation.data).catch((error) => {
    console.error('Email failed:', error);
  });
  
  // Return immediately
  return redirect('/contact?success=true');
}

// AVOID: Blocking on email
await resend.emails.send({...}); // Adds 500-1000ms to response time
return redirect('/contact?success=true');
```

### Batch Emails

**Send Multiple Emails Efficiently**
```typescript
// DO: Use batch API
const emailPromises = customers.map((customer) =>
  resend.emails.send({
    from: 'hello@recoverytoken.store',
    to: customer.email,
    subject: 'Newsletter',
    html: renderNewsletter(customer),
  })
);

// Send in parallel
const results = await Promise.allSettled(emailPromises);

// Handle results
const succeeded = results.filter((r) => r.status === 'fulfilled').length;
const failed = results.filter((r) => r.status === 'rejected').length;
console.log(`Sent ${succeeded}/${customers.length} emails`);
```

## Testing Patterns

### Mock Email Service

```typescript
import {describe, it, expect, vi} from 'vitest';

describe('Contact Form Email', () => {
  it('should send email with correct data', async () => {
    const mockResend = {
      emails: {
        send: vi.fn().mockResolvedValue({id: 'email-123'}),
      },
    };
    
    await sendContactEmail(mockResend, {
      name: 'John Doe',
      email: 'john@example.com',
      message: 'Test message',
    });
    
    expect(mockResend.emails.send).toHaveBeenCalledWith({
      from: 'Recovery Token Store <noreply@recoverytoken.store>',
      to: 'support@recoverytoken.store',
      replyTo: 'john@example.com',
      subject: 'Contact Form: John Doe',
      html: expect.stringContaining('Test message'),
    });
  });
  
  it('should handle email failures gracefully', async () => {
    const mockResend = {
      emails: {
        send: vi.fn().mockRejectedValue(new Error('SMTP error')),
      },
    };
    
    // Should not throw
    await expect(
      sendContactEmail(mockResend, validData)
    ).resolves.not.toThrow();
  });
});
```

## Compliance

### GDPR Compliance

**Email Consent**
```typescript
// DO: Require explicit consent
const newsletterSignupSchema = z.object({
  email: z.string().email(),
  consent: z.literal(true).refine(
    (val) => val === true,
    {message: 'You must consent to receive emails'}
  ),
  consentTimestamp: z.date().default(() => new Date()),
  consentIp: z.string().ip(),
});

// Store consent
await db.emailConsent.create({
  data: {
    email: data.email,
    consentedAt: data.consentTimestamp,
    ipAddress: data.consentIp,
    source: 'newsletter-signup',
  },
});
```

**Unsubscribe Handling**
```typescript
// DO: One-click unsubscribe
export async function action({request}: Route.ActionArgs) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  
  // Verify token
  const subscription = await verifyUnsubscribeToken(token);
  
  // Unsubscribe immediately
  await resend.contacts.remove({
    email: subscription.email,
    audienceId: env.RESEND_AUDIENCE_ID,
  });
  
  return {success: true};
}
```

## Related Resources

- Resend Documentation: https://resend.com/docs
- React Email: https://react.email/docs
- Email Authentication (SPF/DKIM/DMARC): https://www.cloudflare.com/learning/email-security/
- CAN-SPAM Act: https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business
