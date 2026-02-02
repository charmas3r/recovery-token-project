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
import {Mail, MessageSquare, User, FileText, CheckCircle, AlertCircle} from 'lucide-react';
import {Button} from '~/components/ui/Button';
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
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
          <h1 className="font-display text-section text-primary mb-4">
            Message Sent
          </h1>
          <p className="text-body-lg text-secondary mb-8">
            Thank you for reaching out. We've received your message and will get
            back to you within 1-2 business days.
          </p>
          <p className="text-body text-secondary/70">
            Your journey matters to us, and we're honored to be part of it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-3xl px-md max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-2xl">
        <span className="inline-block text-accent text-caption uppercase tracking-[0.25em] font-semibold mb-4">
          Get in Touch
        </span>
        <h1 className="font-display text-hero text-primary mb-4">
          Contact Us
        </h1>
        <p className="text-body-lg text-secondary max-w-2xl mx-auto">
          Have questions about our recovery tokens, your order, or just want to
          share your story? We're here to listen and help.
        </p>
      </div>

      {/* Contact Form */}
      <div className="max-w-xl mx-auto">
        <Form method="post" className="space-y-lg">
          {/* General error */}
          {actionData?.error && (
            <div className="p-md rounded-lg bg-error/10 border border-error/20 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
              <p className="text-body text-error">{actionData.error}</p>
            </div>
          )}

          {/* Name Field */}
          <div className="space-y-1">
            <label
              htmlFor="name"
              className="flex items-center gap-2 text-body-sm font-semibold text-primary"
            >
              <User className="w-4 h-4 text-secondary" />
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
                'w-full h-11 px-4 rounded-md border transition-colors',
                'text-body text-primary placeholder:text-secondary/50',
                'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1',
                touched.name && actionData?.fieldErrors?.name
                  ? 'border-error focus:ring-error'
                  : 'border-black/10 focus:border-accent',
              )}
            />
            {touched.name && actionData?.fieldErrors?.name && (
              <p className="text-body-sm text-error">
                {actionData.fieldErrors.name}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-1">
            <label
              htmlFor="email"
              className="flex items-center gap-2 text-body-sm font-semibold text-primary"
            >
              <Mail className="w-4 h-4 text-secondary" />
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
                'w-full h-11 px-4 rounded-md border transition-colors',
                'text-body text-primary placeholder:text-secondary/50',
                'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1',
                touched.email && actionData?.fieldErrors?.email
                  ? 'border-error focus:ring-error'
                  : 'border-black/10 focus:border-accent',
              )}
            />
            {touched.email && actionData?.fieldErrors?.email && (
              <p className="text-body-sm text-error">
                {actionData.fieldErrors.email}
              </p>
            )}
          </div>

          {/* Subject Field */}
          <div className="space-y-1">
            <label
              htmlFor="subject"
              className="flex items-center gap-2 text-body-sm font-semibold text-primary"
            >
              <FileText className="w-4 h-4 text-secondary" />
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
                'w-full h-11 px-4 rounded-md border transition-colors',
                'text-body text-primary placeholder:text-secondary/50',
                'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1',
                touched.subject && actionData?.fieldErrors?.subject
                  ? 'border-error focus:ring-error'
                  : 'border-black/10 focus:border-accent',
              )}
            />
            {touched.subject && actionData?.fieldErrors?.subject && (
              <p className="text-body-sm text-error">
                {actionData.fieldErrors.subject}
              </p>
            )}
          </div>

          {/* Message Field */}
          <div className="space-y-1">
            <label
              htmlFor="message"
              className="flex items-center gap-2 text-body-sm font-semibold text-primary"
            >
              <MessageSquare className="w-4 h-4 text-secondary" />
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
                'w-full px-4 py-3 rounded-md border transition-colors resize-none',
                'text-body text-primary placeholder:text-secondary/50',
                'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1',
                touched.message && actionData?.fieldErrors?.message
                  ? 'border-error focus:ring-error'
                  : 'border-black/10 focus:border-accent',
              )}
            />
            {touched.message && actionData?.fieldErrors?.message && (
              <p className="text-body-sm text-error">
                {actionData.fieldErrors.message}
              </p>
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
          <div className="pt-md">
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
        <div className="mt-2xl pt-2xl border-t border-black/10">
          <div className="text-center">
            <p className="text-body text-secondary mb-2">
              Prefer email?
            </p>
            <a
              href="mailto:support@recoverytokenstore.com"
              className="text-body-lg text-accent hover:underline font-medium"
            >
              support@recoverytokenstore.com
            </a>
          </div>

          <div className="mt-lg text-center">
            <p className="text-body-sm text-secondary/70">
              We typically respond within 1-2 business days. Your privacy and
              discretion are important to us.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
