/**
 * Newsletter Signup Action
 *
 * Handles newsletter subscriptions via Klaviyo Lists API.
 * Used by the Footer newsletter form via useFetcher.
 *
 * @see prd.md Section 8.5
 */

import type {Route} from './+types/newsletter';
import {newsletterSignupSchema, formatZodErrors} from '~/lib/validation';
import {getKlaviyoClient, KlaviyoError} from '~/lib/klaviyo.server';

interface ActionData {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string | undefined>;
}

export async function action({request, context}: Route.ActionArgs): Promise<ActionData> {
  const formData = await request.formData();

  const data = {
    email: formData.get('email')?.toString() || '',
    consent: formData.get('consent') === 'true',
    honeypot: formData.get('website')?.toString() || '', // Honeypot field
  };

  // Honeypot check - if filled, likely a bot
  if (data.honeypot) {
    // Silently return success to not tip off bots
    return {success: true};
  }

  // Validate form data
  const result = newsletterSignupSchema.safeParse(data);

  if (!result.success) {
    return {
      fieldErrors: formatZodErrors(result.error),
    };
  }

  // Subscribe to Klaviyo newsletter list
  try {
    const klaviyo = getKlaviyoClient(context.env);

    await klaviyo.subscribeToNewsletter(result.data.email, {
      source: 'Website Footer',
    });

    return {success: true};
  } catch (error) {
    console.error('Klaviyo newsletter error:', error);

    if (error instanceof KlaviyoError) {
      // Check for specific errors like already subscribed
      if (error.statusCode === 409) {
        // Already subscribed is still a success from user perspective
        return {success: true};
      }
      return {
        error: 'Couldn\'t subscribe right now. Please try again later.',
      };
    }

    // If Klaviyo is not configured, still accept the form
    // (for development/testing without Klaviyo)
    if (error instanceof Error && error.message.includes('not configured')) {
      console.warn('Klaviyo newsletter not configured, subscription logged only');
      console.log('Newsletter signup:', result.data.email);
      return {success: true};
    }

    return {
      error: 'Something went wrong. Please try again.',
    };
  }
}

// This route is action-only, no page to render
export function loader() {
  return new Response('Method not allowed', {status: 405});
}
