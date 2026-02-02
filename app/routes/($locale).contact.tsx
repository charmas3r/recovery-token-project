/**
 * Contact Page
 *
 * Contact form with Klaviyo integration for email notifications.
 * Includes honeypot spam protection and server-side validation.
 *
 * @see prd.md Section 8.5
 */

import {useState} from 'react';
import {Form, useActionData, useNavigation} from 'react-router';
import type {Route} from './+types/contact';
import {clsx} from 'clsx';
import {CheckCircle, AlertCircle} from 'lucide-react';
import {Button} from '~/components/ui/Button';
import {Input, Textarea, inputStyles, textareaStyles} from '~/components/ui/Input';
import {contactFormSchema, formatZodErrors} from '~/lib/validation';
import {getKlaviyoClient, KlaviyoError} from '~/lib/klaviyo.server';

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'Contact Us | Recovery Token Store'},
    {
      name: 'description',
      content:
        'Have questions about recovery tokens or your order? We\'re here to help. Reach out to our supportive team.',
    },
  ];
};

interface ActionData {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string | undefined>;
}

export async function action({request, context}: Route.ActionArgs): Promise<ActionData> {
  const formData = await request.formData();

  const data = {
    name: formData.get('name')?.toString() || '',
    email: formData.get('email')?.toString() || '',
    subject: formData.get('subject')?.toString() || '',
    message: formData.get('message')?.toString() || '',
    honeypot: formData.get('website')?.toString() || '', // Honeypot field
  };

  // Honeypot check - if filled, likely a bot
  if (data.honeypot) {
    // Silently return success to not tip off bots
    return {success: true};
  }

  // Validate form data
  const result = contactFormSchema.safeParse(data);

  if (!result.success) {
    return {
      fieldErrors: formatZodErrors(result.error),
    };
  }

  // Send to Klaviyo
  try {
    const klaviyo = getKlaviyoClient(context.env);

    await klaviyo.createEvent({
      event: 'Contact Form Submitted',
      email: result.data.email,
      firstName: result.data.name.split(' ')[0],
      lastName: result.data.name.split(' ').slice(1).join(' ') || undefined,
      properties: {
        subject: result.data.subject,
        message: result.data.message,
        submitted_at: new Date().toISOString(),
        source: 'Website Contact Form',
      },
      // Unique ID to prevent duplicate submissions
      uniqueId: `contact-${result.data.email}-${Date.now()}`,
    });

    return {success: true};
  } catch (error) {
    console.error('Klaviyo error:', error);

    if (error instanceof KlaviyoError) {
      return {
        error: 'We couldn\'t send your message right now. Please try again later.',
      };
    }

    // If Klaviyo is not configured, still accept the form
    // (for development/testing without Klaviyo)
    if (error instanceof Error && error.message.includes('not set')) {
      console.warn('Klaviyo not configured, form submission logged only');
      console.log('Contact form submission:', result.data);
      return {success: true};
    }

    return {
      error: 'Something went wrong. Please try again or email us directly.',
    };
  }
}

export default function ContactPage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleBlur = (field: string) => {
    setTouched((prev) => ({...prev, [field]: true}));
  };

  // Show success state
  if (actionData?.success) {
    return (
      <div style={{minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 1rem'}}>
        <div style={{maxWidth: '28rem', width: '100%', textAlign: 'center'}}>
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 style={{fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: '#1A202C', marginBottom: '1rem'}}>
            Message Sent
          </h1>
          <p style={{fontSize: '1.125rem', color: '#4A5568', marginBottom: '2rem', lineHeight: 1.6}}>
            Thank you for reaching out. We've received your message and will get back to you within 1-2 business days.
          </p>
          <p style={{fontSize: '1rem', color: '#718096', lineHeight: 1.6}}>
            Your journey matters to us, and we're honored to be part of it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{padding: '4rem 1rem', maxWidth: '56rem', margin: '0 auto'}}>
      {/* Header - using inline styles to ensure proper rendering */}
      <div style={{textAlign: 'center', marginBottom: '3rem'}}>
        <span style={{display: 'inline-block', color: '#B8764F', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.25em', fontWeight: 600, marginBottom: '1rem'}}>
          Get in Touch
        </span>
        <h1 style={{fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 700, color: '#1A202C', marginBottom: '1rem', lineHeight: 1.1}}>
          Contact Us
        </h1>
        <p style={{fontSize: '1.125rem', color: '#4A5568', maxWidth: '40rem', margin: '0 auto', lineHeight: 1.6}}>
          Have questions about our recovery tokens, your order, or just want to share your story? We're here to listen and help.
        </p>
      </div>

      {/* Contact Form */}
      <div style={{maxWidth: '32rem', margin: '0 auto'}}>
        <Form method="post" action="/contact" className="space-y-6">
          {/* General error */}
          {actionData?.error && (
            <div className="p-4 rounded-lg bg-red-50 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-body text-red-700">{actionData.error}</p>
            </div>
          )}

          {/* Name Field */}
          <div className="space-y-2">
            <label htmlFor="name" className="block text-body-sm font-medium text-primary">
              Your Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              autoComplete="name"
              placeholder="Sarah Mitchell"
              onBlur={() => handleBlur('name')}
              className={clsx(
                inputStyles.base,
                inputStyles.text,
                inputStyles.focus,
                inputStyles.disabled,
                touched.name && actionData?.fieldErrors?.name && inputStyles.error,
              )}
            />
            {touched.name && actionData?.fieldErrors?.name && (
              <p className="text-body-sm text-red-600">{actionData.fieldErrors.name}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-body-sm font-medium text-primary">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="sarah@example.com"
              onBlur={() => handleBlur('email')}
              className={clsx(
                inputStyles.base,
                inputStyles.text,
                inputStyles.focus,
                inputStyles.disabled,
                touched.email && actionData?.fieldErrors?.email && inputStyles.error,
              )}
            />
            {touched.email && actionData?.fieldErrors?.email && (
              <p className="text-body-sm text-red-600">{actionData.fieldErrors.email}</p>
            )}
          </div>

          {/* Subject Field */}
          <div className="space-y-2">
            <label htmlFor="subject" className="block text-body-sm font-medium text-primary">
              Subject
            </label>
            <input
              id="subject"
              name="subject"
              type="text"
              required
              placeholder="Question about my order"
              onBlur={() => handleBlur('subject')}
              className={clsx(
                inputStyles.base,
                inputStyles.text,
                inputStyles.focus,
                inputStyles.disabled,
                touched.subject && actionData?.fieldErrors?.subject && inputStyles.error,
              )}
            />
            {touched.subject && actionData?.fieldErrors?.subject && (
              <p className="text-body-sm text-red-600">{actionData.fieldErrors.subject}</p>
            )}
          </div>

          {/* Message Field */}
          <div className="space-y-2">
            <label htmlFor="message" className="block text-body-sm font-medium text-primary">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={5}
              placeholder="Tell us how we can help..."
              onBlur={() => handleBlur('message')}
              className={clsx(
                textareaStyles.base,
                textareaStyles.text,
                textareaStyles.focus,
                textareaStyles.disabled,
                touched.message && actionData?.fieldErrors?.message && textareaStyles.error,
              )}
            />
            {touched.message && actionData?.fieldErrors?.message && (
              <p className="text-body-sm text-red-600">{actionData.fieldErrors.message}</p>
            )}
          </div>

          {/* Honeypot - hidden from users, visible to bots */}
          <div className="hidden" aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input
              id="website"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </Button>
          </div>
        </Form>

        {/* Additional Contact Info */}
        <div style={{marginTop: '3rem', paddingTop: '3rem', borderTop: '1px solid rgba(0,0,0,0.1)'}}>
          <div style={{textAlign: 'center'}}>
            <p style={{fontSize: '1rem', color: '#4A5568', marginBottom: '0.5rem'}}>
              Prefer email?
            </p>
            <a
              href="mailto:support@recoverytokenstore.com"
              style={{fontSize: '1.125rem', color: '#B8764F', fontWeight: 500}}
              className="hover:underline"
            >
              support@recoverytokenstore.com
            </a>
          </div>

          <div style={{marginTop: '1.5rem', textAlign: 'center'}}>
            <p style={{fontSize: '0.875rem', color: '#718096', lineHeight: 1.6}}>
              We typically respond within 1-2 business days. Your privacy and discretion are important to us.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
