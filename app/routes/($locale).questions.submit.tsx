/**
 * Question Submission Action
 *
 * Handles product question submissions:
 * 1. Validates form data with Zod
 * 2. Looks up the product via Admin API and reads the current Q&A metafield
 * 3. Appends a new unanswered question to the metafield JSON array
 * 4. Saves the updated metafield via Admin API
 * 5. Generates a signed answer link using HMAC tokens
 * 6. Sends a Klaviyo event (non-blocking — failure doesn't affect the user)
 * 7. Returns success
 *
 * Used by AskQuestionModal via useFetcher.
 */

import type {Route} from './+types/questions.submit';
import {questionFormSchema, formatZodErrors} from '~/lib/validation';
import {getKlaviyoClient, KlaviyoError} from '~/lib/klaviyo.server';
import {getProductMetafield, setProductMetafield} from '~/lib/shopify-admin.server';
import {generateAnswerToken} from '~/lib/qa-tokens.server';
import type {QAItem} from '~/components/qa/QASection';

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

  const {name, email, question, productHandle, productTitle} = result.data;

  // -----------------------------------------------------------------------
  // 1. Look up the product and read the current Q&A metafield
  // -----------------------------------------------------------------------
  let productId: string;
  let existingQuestions: QAItem[];

  try {
    const metafieldResult = await getProductMetafield(
      context.env,
      productHandle,
      'custom',
      'qa_items',
    );

    if (!metafieldResult) {
      return {error: 'Could not find this product. Please try again.'};
    }

    productId = metafieldResult.productId;

    // Parse existing metafield value, or start with empty array
    try {
      existingQuestions = metafieldResult.metafieldValue
        ? JSON.parse(metafieldResult.metafieldValue)
        : [];
    } catch {
      existingQuestions = [];
    }
  } catch (error) {
    console.error('[questions.submit] Admin API lookup failed:', error);
    return {error: 'Something went wrong. Please try again later.'};
  }

  // -----------------------------------------------------------------------
  // 2. Build the new question and append it
  // -----------------------------------------------------------------------
  const questionId = `q_${Date.now()}`;
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  const newQuestion: QAItem = {
    id: questionId,
    question,
    askedBy: name,
    askedAt: today,
    answer: '',
    answeredAt: '',
  };

  const updatedQuestions = [...existingQuestions, newQuestion];

  // -----------------------------------------------------------------------
  // 3. Save the updated metafield via Admin API
  // -----------------------------------------------------------------------
  try {
    await setProductMetafield(
      context.env,
      productId,
      'custom',
      'qa_items',
      JSON.stringify(updatedQuestions),
    );
  } catch (error) {
    console.error('[questions.submit] Admin API metafield save failed:', error);
    return {error: 'Something went wrong saving your question. Please try again later.'};
  }

  // -----------------------------------------------------------------------
  // 4. Generate a signed answer link
  // -----------------------------------------------------------------------
  const origin = new URL(request.url).origin;
  const sessionSecret = context.env.SESSION_SECRET;
  const token = await generateAnswerToken(sessionSecret, productHandle, questionId);
  const answerUrl = `${origin}/admin/qa/answer?product=${productHandle}&qid=${questionId}&token=${token}`;

  // -----------------------------------------------------------------------
  // 5. Send Klaviyo event (non-blocking)
  // -----------------------------------------------------------------------
  try {
    const klaviyo = getKlaviyoClient(context.env);

    await klaviyo.createEvent({
      event: 'Product Question Submitted',
      email,
      firstName: name.split(' ')[0],
      lastName: name.split(' ').slice(1).join(' ') || undefined,
      properties: {
        product_title: productTitle,
        product_handle: productHandle,
        question,
        customer_name: name,
        submitted_at: new Date().toISOString(),
        source: 'Product Page Q&A',
        answer_url: answerUrl,
      },
      uniqueId: `question-${email}-${Date.now()}`,
    });
  } catch (error) {
    // Non-blocking: question is already saved to metafield
    if (error instanceof KlaviyoError) {
      console.warn('[questions.submit] Klaviyo error (non-blocking):', error.message);
    } else {
      console.error('[questions.submit] Klaviyo error (non-blocking):', error);
    }
  }

  return {success: true};
}

// Action-only route
export function loader() {
  return new Response('Method not allowed', {status: 405});
}
