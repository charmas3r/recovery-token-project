/**
 * Admin Q&A Answer Page
 *
 * Standalone utility route (not under ($locale) prefix) where admins
 * land after clicking the answer link in a Klaviyo notification email.
 * Verifies HMAC token, displays the question, and provides a form to
 * publish an official answer to the product Q&A metafield.
 */

import {useLoaderData, useActionData, Form, useNavigation} from 'react-router';
import {verifyAnswerToken} from '~/lib/qa-tokens.server';
import {
  getProductQAFromStorefront,
  setProductMetafield,
} from '~/lib/shopify-admin.server';
import type {QAItem} from '~/components/qa/QASection';

// ---------------------------------------------------------------------------
// Loader
// ---------------------------------------------------------------------------

export async function loader({
  request,
  context,
}: {
  request: Request;
  context: any;
}) {
  const url = new URL(request.url);
  const productHandle = url.searchParams.get('product');
  const questionId = url.searchParams.get('qid');
  const token = url.searchParams.get('token');

  if (!productHandle || !questionId || !token) {
    throw new Response('Missing required parameters', {status: 400});
  }

  const sessionSecret: string = context.env.SESSION_SECRET;

  const valid = await verifyAnswerToken(
    sessionSecret,
    token,
    productHandle,
    questionId,
  );
  if (!valid) {
    throw new Response(
      'This link has expired or is invalid. Please request a new answer link.',
      {status: 403},
    );
  }

  const result = await getProductQAFromStorefront(
    context.storefront,
    productHandle,
  );
  if (!result || !result.metafieldValue) {
    throw new Response('Product or Q&A data not found.', {status: 404});
  }

  const questions = JSON.parse(result.metafieldValue) as QAItem[];
  const question = questions.find((q) => q.id === questionId);
  if (!question) {
    throw new Response('Question not found.', {status: 404});
  }

  const productTitle = productHandle
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return {
    productHandle,
    productTitle,
    questionId,
    question,
    token,
  };
}

// ---------------------------------------------------------------------------
// Action
// ---------------------------------------------------------------------------

export async function action({
  request,
  context,
}: {
  request: Request;
  context: any;
}) {
  const formData = await request.formData();
  const productHandle = formData.get('productHandle') as string;
  const questionId = formData.get('questionId') as string;
  const token = formData.get('token') as string;
  const answer = (formData.get('answer') as string)?.trim();

  if (!answer || answer.length < 10) {
    return {error: 'Answer must be at least 10 characters.'};
  }

  const sessionSecret: string = context.env.SESSION_SECRET;
  const valid = await verifyAnswerToken(
    sessionSecret,
    token,
    productHandle,
    questionId,
  );
  if (!valid) {
    return {
      error:
        'Link expired or invalid. Please request a new answer link from the notification email.',
    };
  }

  const result = await getProductQAFromStorefront(
    context.storefront,
    productHandle,
  );
  if (!result || !result.metafieldValue) {
    return {error: 'Product or Q&A data not found.'};
  }

  const questions = JSON.parse(result.metafieldValue) as QAItem[];
  const questionIndex = questions.findIndex((q) => q.id === questionId);
  if (questionIndex === -1) {
    return {error: 'Question not found.'};
  }

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  questions[questionIndex] = {
    ...questions[questionIndex],
    answer,
    answeredAt: today,
  };

  await setProductMetafield(
    context.env,
    result.productId,
    'custom',
    'product_qa',
    JSON.stringify(questions),
  );

  return {success: true};
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AdminQAAnswer() {
  const {productHandle, productTitle, questionId, question, token} =
    useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  const success = actionData && 'success' in actionData && actionData.success;
  const error = (actionData && 'error' in actionData ? actionData.error : null) ?? null;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '36rem',
          borderRadius: '1rem',
          border: '1px solid rgba(255,255,255,0.08)',
          overflow: 'hidden',
          background:
            'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)',
        }}
      >
        {success ? <SuccessView /> : <AnswerForm
          productHandle={productHandle}
          productTitle={productTitle}
          questionId={questionId}
          question={question}
          token={token}
          error={error}
          isSubmitting={isSubmitting}
        />}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Success view
// ---------------------------------------------------------------------------

function SuccessView() {
  return (
    <div style={{padding: '3rem 2rem', textAlign: 'center'}}>
      <div
        style={{
          width: '4rem',
          height: '4rem',
          borderRadius: '50%',
          backgroundColor: 'rgba(0,242,96,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          fontSize: '1.75rem',
        }}
      >
        ✓
      </div>
      <h1
        style={{
          color: '#fff',
          fontSize: '1.5rem',
          fontWeight: 700,
          marginBottom: '0.75rem',
        }}
      >
        Answer Published!
      </h1>
      <p
        style={{
          color: 'rgba(255,255,255,0.5)',
          fontSize: '1rem',
          lineHeight: 1.6,
          maxWidth: '28rem',
          margin: '0 auto',
        }}
      >
        Your answer is now live on the product page. Customers will be able to
        see it immediately.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Answer form
// ---------------------------------------------------------------------------

function AnswerForm({
  productHandle,
  productTitle,
  questionId,
  question,
  token,
  error,
  isSubmitting,
}: {
  productHandle: string;
  productTitle: string;
  questionId: string;
  question: QAItem;
  token: string;
  error: string | null;
  isSubmitting: boolean;
}) {
  return (
    <>
      {/* Header */}
      <div
        style={{
          padding: '2rem 2rem 1.5rem',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            color: '#B8764F',
            fontSize: '0.75rem',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.25em',
            fontWeight: 600,
            marginBottom: '0.5rem',
          }}
        >
          Answer a Question
        </span>
        <h1
          style={{
            color: '#fff',
            fontSize: '1.5rem',
            fontWeight: 700,
            margin: 0,
          }}
        >
          {productTitle}
        </h1>
      </div>

      {/* Question display */}
      <div
        style={{
          padding: '1.5rem 2rem',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div style={{display: 'flex', alignItems: 'flex-start', gap: '0.75rem'}}>
          <span
            style={{
              flexShrink: 0,
              width: '2rem',
              height: '2rem',
              borderRadius: '50%',
              backgroundColor: 'rgba(0,242,96,0.15)',
              color: '#00F260',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.875rem',
              fontWeight: 700,
            }}
          >
            Q
          </span>
          <div style={{flex: 1, minWidth: 0}}>
            <p
              style={{
                color: '#fff',
                fontSize: '1rem',
                fontWeight: 600,
                lineHeight: 1.5,
                margin: '0 0 0.375rem 0',
              }}
            >
              {question.question}
            </p>
            <p
              style={{
                color: 'rgba(255,255,255,0.4)',
                fontSize: '0.75rem',
                margin: 0,
              }}
            >
              {question.askedBy} &middot; {question.askedAt}
            </p>
          </div>
        </div>
      </div>

      {/* Answer form */}
      <div style={{padding: '1.5rem 2rem 2rem'}}>
        {error && (
          <div
            style={{
              backgroundColor: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(248,113,113,0.3)',
              borderRadius: '0.5rem',
              padding: '0.75rem 1rem',
              marginBottom: '1rem',
              color: '#f87171',
              fontSize: '0.875rem',
            }}
          >
            {error}
          </div>
        )}

        <Form method="post">
          <input type="hidden" name="productHandle" value={productHandle} />
          <input type="hidden" name="questionId" value={questionId} />
          <input type="hidden" name="token" value={token} />

          <label
            htmlFor="answer"
            style={{
              display: 'block',
              color: '#fff',
              fontSize: '0.875rem',
              fontWeight: 600,
              marginBottom: '0.5rem',
            }}
          >
            Your Answer
          </label>
          <textarea
            id="answer"
            name="answer"
            rows={5}
            minLength={10}
            required
            defaultValue={question.answer || ''}
            placeholder="Type your answer here..."
            style={{
              width: '100%',
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '0.5rem',
              padding: '0.75rem 1rem',
              color: '#fff',
              fontSize: '0.9375rem',
              lineHeight: 1.6,
              resize: 'vertical' as const,
              outline: 'none',
              boxSizing: 'border-box' as const,
              fontFamily: 'inherit',
            }}
          />
          <p
            style={{
              color: 'rgba(255,255,255,0.4)',
              fontSize: '0.75rem',
              marginTop: '0.5rem',
              marginBottom: '1.25rem',
              lineHeight: 1.5,
            }}
          >
            This will be published on the product page as an official response.
          </p>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.75rem',
              backgroundColor: isSubmitting ? 'rgba(0,242,96,0.6)' : '#00F260',
              color: '#000',
              borderRadius: '0.5rem',
              fontSize: '0.9375rem',
              fontWeight: 700,
              border: 'none',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              transition: 'opacity 0.2s',
              width: '100%',
            }}
          >
            {isSubmitting ? 'Publishing...' : 'Publish Answer'}
          </button>
        </Form>
      </div>
    </>
  );
}
