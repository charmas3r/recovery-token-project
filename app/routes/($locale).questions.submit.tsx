/**
 * Question Submission Action
 *
 * Handles product question submissions via Klaviyo event.
 * Used by AskQuestionModal via useFetcher.
 */

import type {Route} from './+types/questions.submit';
import {questionFormSchema, formatZodErrors} from '~/lib/validation';
import {getKlaviyoClient, KlaviyoError} from '~/lib/klaviyo.server';

interface ActionData {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string | undefined>;
}

export async function action({
  request,
  context,
}: Route.ActionArgs): Promise<ActionData> {
  const formData = await request.formData();

  const data = {
    name: formData.get('name')?.toString() || '',
    email: formData.get('email')?.toString() || '',
    question: formData.get('question')?.toString() || '',
    productHandle: formData.get('productHandle')?.toString() || '',
    productTitle: formData.get('productTitle')?.toString() || '',
    honeypot: formData.get('website')?.toString() || '',
  };

  // Honeypot check
  if (data.honeypot) {
    return {success: true};
  }

  // Validate form fields
  const result = questionFormSchema.safeParse(data);
  if (!result.success) {
    return {fieldErrors: formatZodErrors(result.error)};
  }

  try {
    const klaviyo = getKlaviyoClient(context.env);

    await klaviyo.createEvent({
      event: 'Product Question Submitted',
      email: result.data.email,
      firstName: result.data.name.split(' ')[0],
      lastName: result.data.name.split(' ').slice(1).join(' ') || undefined,
      properties: {
        product_title: result.data.productTitle,
        product_handle: result.data.productHandle,
        question: result.data.question,
        customer_name: result.data.name,
        submitted_at: new Date().toISOString(),
        source: 'Product Page Q&A',
      },
      uniqueId: `question-${result.data.email}-${Date.now()}`,
    });

    return {success: true};
  } catch (error) {
    console.error('Question submission error:', error);

    if (error instanceof KlaviyoError) {
      console.warn('Klaviyo error submitting question:', error.message);
    }

    // Log the question even if Klaviyo fails
    console.log('Question submission:', {
      product: result.data.productHandle,
      question: result.data.question,
      name: result.data.name,
      email: result.data.email,
    });

    return {success: true}; // Don't fail the user if Klaviyo is down
  }
}

// Action-only route
export function loader() {
  return new Response('Method not allowed', {status: 405});
}
