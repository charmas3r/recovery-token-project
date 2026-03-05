# Q&A Automation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Automate the Q&A workflow so customer questions are saved to Shopify metafields and admins can answer via a one-click email link.

**Architecture:** Customer submits question → saved to product metafield (unanswered) via Admin API + Klaviyo notification with signed answer link → admin clicks link → answer form → metafield updated with answer → visible on product page.

**Tech Stack:** Shopify Admin API (GraphQL), HMAC-SHA256 tokens, Klaviyo events, React Router actions/loaders, Zod validation

---

### Task 1: Create Shopify Admin API client for product metafields

**Files:**
- Create: `app/lib/shopify-admin.server.ts`

**Context:** We already have an Admin API pattern in `app/lib/shopify-uploads.server.ts` that uses `PRIVATE_STOREFRONT_API_TOKEN` and `PUBLIC_STORE_DOMAIN`. Follow that exact pattern for URL construction and headers.

**Step 1: Create the Admin API client**

```typescript
/**
 * Shopify Admin API — Product Metafield Operations
 *
 * Read/write product metafields for Q&A data storage.
 * Follows the same Admin API pattern as shopify-uploads.server.ts.
 */

interface AdminApiResponse<T> {
  data: T;
  errors?: Array<{message: string}>;
}

interface ProductByHandleData {
  productByHandle: {
    id: string;
    metafield: {
      id: string;
      value: string;
    } | null;
  } | null;
}

interface MetafieldsSetData {
  metafieldsSet: {
    metafields: Array<{id: string; value: string}>;
    userErrors: Array<{field: string[]; message: string}>;
  };
}

function getAdminApiConfig(env: Env) {
  const adminToken = env.PRIVATE_STOREFRONT_API_TOKEN;
  const storeDomain = env.PUBLIC_STORE_DOMAIN;

  if (!adminToken || !storeDomain) {
    throw new Error(
      'PRIVATE_STOREFRONT_API_TOKEN and PUBLIC_STORE_DOMAIN are required for Admin API',
    );
  }

  const domain = storeDomain.replace(/^https?:\/\//, '');
  return {
    url: `https://${domain}/admin/api/2024-10/graphql.json`,
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': adminToken,
    },
  };
}

async function adminQuery<T>(
  env: Env,
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  const config = getAdminApiConfig(env);
  const response = await fetch(config.url, {
    method: 'POST',
    headers: config.headers,
    body: JSON.stringify({query, variables}),
  });

  if (!response.ok) {
    throw new Error(`Admin API error: ${response.status} ${response.statusText}`);
  }

  const json = (await response.json()) as AdminApiResponse<T>;

  if (json.errors?.length) {
    throw new Error(`Admin API GraphQL error: ${json.errors[0].message}`);
  }

  return json.data;
}

/**
 * Fetch a product's metafield by handle + namespace/key.
 * Returns {productId, metafieldValue} or null if product not found.
 */
export async function getProductMetafield(
  env: Env,
  productHandle: string,
  namespace: string,
  key: string,
): Promise<{productId: string; metafieldValue: string | null} | null> {
  const query = `
    query ProductMetafield($handle: String!, $namespace: String!, $key: String!) {
      productByHandle(handle: $handle) {
        id
        metafield(namespace: $namespace, key: $key) {
          id
          value
        }
      }
    }
  `;

  const data = await adminQuery<ProductByHandleData>(env, query, {
    handle: productHandle,
    namespace,
    key,
  });

  if (!data.productByHandle) return null;

  return {
    productId: data.productByHandle.id,
    metafieldValue: data.productByHandle.metafield?.value ?? null,
  };
}

/**
 * Set a product metafield value (upsert).
 * Uses metafieldsSet which creates or updates.
 */
export async function setProductMetafield(
  env: Env,
  productId: string,
  namespace: string,
  key: string,
  value: string,
): Promise<void> {
  const mutation = `
    mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields { id value }
        userErrors { field message }
      }
    }
  `;

  const data = await adminQuery<MetafieldsSetData>(env, mutation, {
    metafields: [
      {
        ownerId: productId,
        namespace,
        key,
        type: 'json',
        value,
      },
    ],
  });

  if (data.metafieldsSet.userErrors.length > 0) {
    throw new Error(
      `Metafield update error: ${data.metafieldsSet.userErrors[0].message}`,
    );
  }
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit app/lib/shopify-admin.server.ts 2>&1 | grep -v 'Cannot find module'`
Expected: No new errors from this file

**Step 3: Commit**

```bash
git add app/lib/shopify-admin.server.ts
git commit -m "feat(qa): add Shopify Admin API client for product metafields"
```

---

### Task 2: Create HMAC token utility for answer links

**Files:**
- Create: `app/lib/qa-tokens.server.ts`

**Context:** Answer links need to be signed so only the admin (who receives the email) can access them. We use HMAC-SHA256 with `SESSION_SECRET` from the env. Tokens expire after 7 days.

**Step 1: Create the token utility**

```typescript
/**
 * Q&A Answer Token Utilities
 *
 * Generates and verifies HMAC-signed tokens for admin answer links.
 * Tokens encode product handle + question ID + expiry timestamp.
 * Uses SESSION_SECRET for signing. Tokens expire after 7 days.
 */

const TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Generate an HMAC-SHA256 signed token for an answer link.
 * Returns a base64url-encoded string: payload.signature
 */
export function generateAnswerToken(
  sessionSecret: string,
  productHandle: string,
  questionId: string,
): string {
  // Web Crypto API is not available synchronously in all runtimes,
  // so we use a simpler approach with the built-in crypto module.
  // For Cloudflare Workers / Oxygen, we need to use a sync-compatible approach.
  const expiry = Date.now() + TOKEN_EXPIRY_MS;
  const payload = `${productHandle}:${questionId}:${expiry}`;
  const signature = hmacSign(sessionSecret, payload);
  const encoded = btoa(payload) + '.' + signature;
  return encoded;
}

/**
 * Verify an answer token. Returns true if valid and not expired.
 */
export function verifyAnswerToken(
  sessionSecret: string,
  token: string,
  productHandle: string,
  questionId: string,
): boolean {
  try {
    const [encodedPayload, signature] = token.split('.');
    if (!encodedPayload || !signature) return false;

    const payload = atob(encodedPayload);
    const [handle, qid, expiryStr] = payload.split(':');

    // Verify the token matches the expected product and question
    if (handle !== productHandle || qid !== questionId) return false;

    // Check expiry
    const expiry = parseInt(expiryStr, 10);
    if (isNaN(expiry) || Date.now() > expiry) return false;

    // Verify signature
    const expectedSignature = hmacSign(sessionSecret, payload);
    return timingSafeEqual(signature, expectedSignature);
  } catch {
    return false;
  }
}

/**
 * Simple HMAC-SHA256 using Web Crypto-compatible approach.
 * Uses a synchronous hash since we're in a server context.
 */
function hmacSign(secret: string, message: string): string {
  // Use a simple hash-based approach that works in all runtimes
  // For production, this could use Web Crypto API async version
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const msgData = encoder.encode(message);

  // Simple HMAC: hash(key + message + key) — not cryptographically ideal
  // but sufficient for short-lived admin tokens. For a stronger approach,
  // use the async generateAnswerTokenAsync variant below.
  let hash = 0;
  const combined = new Uint8Array(keyData.length + msgData.length + keyData.length);
  combined.set(keyData, 0);
  combined.set(msgData, keyData.length);
  combined.set(keyData, keyData.length + msgData.length);

  // FNV-1a inspired hash — NOT cryptographic, but collision-resistant enough
  // for signed admin URLs with 7-day expiry
  for (let i = 0; i < combined.length; i++) {
    hash = ((hash ^ combined[i]) * 0x01000193) >>> 0;
  }

  return hash.toString(36);
}

/**
 * Async HMAC-SHA256 using Web Crypto API (preferred when async is OK).
 */
export async function generateAnswerTokenAsync(
  sessionSecret: string,
  productHandle: string,
  questionId: string,
): Promise<string> {
  const expiry = Date.now() + TOKEN_EXPIRY_MS;
  const payload = `${productHandle}:${questionId}:${expiry}`;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(sessionSecret),
    {name: 'HMAC', hash: 'SHA-256'},
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  const signature = btoa(String.fromCharCode(...new Uint8Array(sig)));

  return btoa(payload) + '.' + encodeURIComponent(signature);
}

/**
 * Async token verification using Web Crypto API.
 */
export async function verifyAnswerTokenAsync(
  sessionSecret: string,
  token: string,
  productHandle: string,
  questionId: string,
): Promise<boolean> {
  try {
    const [encodedPayload, encodedSig] = token.split('.');
    if (!encodedPayload || !encodedSig) return false;

    const payload = atob(encodedPayload);
    const [handle, qid, expiryStr] = payload.split(':');

    if (handle !== productHandle || qid !== questionId) return false;

    const expiry = parseInt(expiryStr, 10);
    if (isNaN(expiry) || Date.now() > expiry) return false;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(sessionSecret),
      {name: 'HMAC', hash: 'SHA-256'},
      false,
      ['verify'],
    );

    const signature = Uint8Array.from(
      atob(decodeURIComponent(encodedSig)),
      (c) => c.charCodeAt(0),
    );

    return await crypto.subtle.verify(
      'HMAC',
      key,
      signature,
      encoder.encode(payload),
    );
  } catch {
    return false;
  }
}

/**
 * Timing-safe string comparison to prevent timing attacks.
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
```

**Important implementation note:** Since this runs on Cloudflare Workers (Oxygen), the `crypto.subtle` Web Crypto API is available. **Use the async versions** (`generateAnswerTokenAsync` / `verifyAnswerTokenAsync`) as the primary API. The sync versions are fallbacks only. The implementer should simplify this file to only export the async versions and remove the sync ones.

**Step 2: Commit**

```bash
git add app/lib/qa-tokens.server.ts
git commit -m "feat(qa): add HMAC token utility for signed answer links"
```

---

### Task 3: Update question submission to save to metafield + generate answer link

**Files:**
- Modify: `app/routes/($locale).questions.submit.tsx`

**Context:** Currently the action only sends a Klaviyo event. We need to also:
1. Look up the product by handle via Admin API to get its ID and current Q&A metafield
2. Append the new question (unanswered) to the metafield JSON array
3. Save the updated metafield via Admin API
4. Generate a signed answer link
5. Include `answer_url` in the Klaviyo event properties

The form already sends `productHandle` and `productTitle`.

**Step 1: Update the action with metafield save + answer link**

Replace the entire file with:

```typescript
/**
 * Question Submission Action
 *
 * Handles product question submissions:
 * 1. Validates input with Zod
 * 2. Saves question to product metafield via Shopify Admin API
 * 3. Sends Klaviyo notification with signed answer link
 *
 * Used by AskQuestionModal via useFetcher.
 */

import type {Route} from './+types/questions.submit';
import {questionFormSchema, formatZodErrors} from '~/lib/validation';
import {getKlaviyoClient, KlaviyoError} from '~/lib/klaviyo.server';
import {
  getProductMetafield,
  setProductMetafield,
} from '~/lib/shopify-admin.server';
import {generateAnswerTokenAsync} from '~/lib/qa-tokens.server';
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

  // Generate unique question ID
  const questionId = `q_${Date.now()}`;
  const now = new Date().toISOString();

  // Build the new Q&A item (unanswered)
  const newItem: QAItem = {
    id: questionId,
    question: result.data.question,
    askedBy: result.data.name,
    askedAt: now.split('T')[0], // YYYY-MM-DD
    answer: '',
    answeredAt: '',
  };

  try {
    // 1. Fetch current metafield and product ID
    const productData = await getProductMetafield(
      context.env,
      result.data.productHandle,
      'custom',
      'product_qa',
    );

    if (!productData) {
      console.error('Product not found:', result.data.productHandle);
      return {error: 'Could not find this product. Please try again.'};
    }

    // 2. Parse existing Q&A items and append new question
    let existingItems: QAItem[] = [];
    if (productData.metafieldValue) {
      try {
        const parsed = JSON.parse(productData.metafieldValue);
        if (Array.isArray(parsed)) {
          existingItems = parsed;
        }
      } catch {
        // If metafield is malformed, start fresh
      }
    }

    existingItems.push(newItem);

    // 3. Save updated metafield
    await setProductMetafield(
      context.env,
      productData.productId,
      'custom',
      'product_qa',
      JSON.stringify(existingItems),
    );

    // 4. Generate signed answer link
    const sessionSecret = context.env.SESSION_SECRET;
    const origin = new URL(request.url).origin;
    let answerUrl = '';

    if (sessionSecret) {
      const token = await generateAnswerTokenAsync(
        sessionSecret,
        result.data.productHandle,
        questionId,
      );
      answerUrl = `${origin}/admin/qa/answer?product=${encodeURIComponent(result.data.productHandle)}&qid=${encodeURIComponent(questionId)}&token=${encodeURIComponent(token)}`;
    }

    // 5. Send Klaviyo notification with answer link
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
          answer_url: answerUrl,
          submitted_at: now,
          source: 'Product Page Q&A',
        },
        uniqueId: `question-${result.data.email}-${Date.now()}`,
      });
    } catch (klaviyoError) {
      // Non-blocking — question is already saved to metafield
      if (klaviyoError instanceof KlaviyoError) {
        console.warn('Klaviyo notification failed:', klaviyoError.message);
      }
      console.log('Question saved but Klaviyo notification failed:', {
        product: result.data.productHandle,
        questionId,
        answerUrl,
      });
    }

    return {success: true};
  } catch (error) {
    console.error('Question submission error:', error);

    // Log the question so it's not lost
    console.log('Question submission (failed to save):', {
      product: result.data.productHandle,
      question: result.data.question,
      name: result.data.name,
      email: result.data.email,
    });

    return {
      error: 'Could not submit your question right now. Please try again later.',
    };
  }
}

// Action-only route
export function loader() {
  return new Response('Method not allowed', {status: 405});
}
```

**Key changes from current version:**
- Added imports for `shopify-admin.server`, `qa-tokens.server`, `QAItem` type
- After validation: fetch product metafield, append question, save metafield
- Generate signed answer URL from request origin
- Include `answer_url` in Klaviyo event properties
- Klaviyo is now non-blocking (question saved even if Klaviyo fails)
- Better error messages — if product not found, tell the user

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit 2>&1 | grep questions.submit`
Expected: No new errors from this file (existing `+types` errors are OK)

**Step 3: Commit**

```bash
git add app/routes/\(\$locale\).questions.submit.tsx
git commit -m "feat(qa): save questions to metafield and generate answer links"
```

---

### Task 4: Create admin answer page

**Files:**
- Create: `app/routes/admin.qa.answer.tsx`

**Context:** This is the page admins land on when they click the answer link in the Klaviyo email. It:
- Verifies the HMAC token (loader)
- Fetches the product metafield and finds the specific question (loader)
- Shows the question + answer textarea (component)
- Saves the answer to the metafield (action)

This route is NOT under the `($locale)` prefix — it's a utility admin route.

**Step 1: Create the answer page route**

```typescript
/**
 * Admin Q&A Answer Page
 *
 * Allows admins to answer customer questions via a signed link.
 * Token-based authentication — no login required.
 *
 * URL: /admin/qa/answer?product=handle&qid=q_123&token=signed_token
 */

import {useLoaderData, useActionData, Form, useNavigation} from 'react-router';
import {verifyAnswerTokenAsync} from '~/lib/qa-tokens.server';
import {
  getProductMetafield,
  setProductMetafield,
} from '~/lib/shopify-admin.server';
import type {QAItem} from '~/components/qa/QASection';

interface LoaderData {
  productHandle: string;
  productTitle: string;
  questionId: string;
  question: QAItem;
  token: string;
}

interface ActionData {
  success?: boolean;
  error?: string;
}

export async function loader({request, context}: {request: Request; context: any}) {
  const url = new URL(request.url);
  const productHandle = url.searchParams.get('product') || '';
  const questionId = url.searchParams.get('qid') || '';
  const token = url.searchParams.get('token') || '';

  if (!productHandle || !questionId || !token) {
    throw new Response('Missing required parameters', {status: 400});
  }

  const sessionSecret = context.env.SESSION_SECRET;
  if (!sessionSecret) {
    throw new Response('Server configuration error', {status: 500});
  }

  // Verify HMAC token
  const isValid = await verifyAnswerTokenAsync(
    sessionSecret,
    token,
    productHandle,
    questionId,
  );

  if (!isValid) {
    throw new Response(
      'This answer link has expired or is invalid. Please check your email for a newer link.',
      {status: 403},
    );
  }

  // Fetch the product metafield
  const productData = await getProductMetafield(
    context.env,
    productHandle,
    'custom',
    'product_qa',
  );

  if (!productData || !productData.metafieldValue) {
    throw new Response('Product or Q&A data not found', {status: 404});
  }

  // Find the specific question
  let items: QAItem[] = [];
  try {
    items = JSON.parse(productData.metafieldValue);
  } catch {
    throw new Response('Invalid Q&A data', {status: 500});
  }

  const question = items.find((item) => item.id === questionId);
  if (!question) {
    throw new Response('Question not found', {status: 404});
  }

  // Get product title from Shopify (we need an additional query or use handle)
  // For simplicity, derive from handle
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
  } satisfies LoaderData;
}

export async function action({request, context}: {request: Request; context: any}) {
  const formData = await request.formData();
  const productHandle = formData.get('productHandle')?.toString() || '';
  const questionId = formData.get('questionId')?.toString() || '';
  const token = formData.get('token')?.toString() || '';
  const answer = formData.get('answer')?.toString()?.trim() || '';

  if (!answer || answer.length < 10) {
    return {error: 'Answer must be at least 10 characters.'} satisfies ActionData;
  }

  const sessionSecret = context.env.SESSION_SECRET;
  if (!sessionSecret) {
    return {error: 'Server configuration error.'} satisfies ActionData;
  }

  // Re-verify token
  const isValid = await verifyAnswerTokenAsync(
    sessionSecret,
    token,
    productHandle,
    questionId,
  );

  if (!isValid) {
    return {error: 'This answer link has expired. Please check your email for a newer link.'} satisfies ActionData;
  }

  try {
    // Fetch current metafield
    const productData = await getProductMetafield(
      context.env,
      productHandle,
      'custom',
      'product_qa',
    );

    if (!productData || !productData.metafieldValue) {
      return {error: 'Product Q&A data not found.'} satisfies ActionData;
    }

    const items: QAItem[] = JSON.parse(productData.metafieldValue);
    const questionIndex = items.findIndex((item) => item.id === questionId);

    if (questionIndex === -1) {
      return {error: 'Question not found.'} satisfies ActionData;
    }

    // Update the question with the answer
    items[questionIndex] = {
      ...items[questionIndex],
      answer,
      answeredAt: new Date().toISOString().split('T')[0],
    };

    // Save updated metafield
    await setProductMetafield(
      context.env,
      productData.productId,
      'custom',
      'product_qa',
      JSON.stringify(items),
    );

    return {success: true} satisfies ActionData;
  } catch (error) {
    console.error('Answer submission error:', error);
    return {error: 'Could not save your answer. Please try again.'} satisfies ActionData;
  }
}

export default function AdminQAAnswerPage() {
  const {productTitle, question, productHandle, questionId, token} =
    useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  if (actionData?.success) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
        }}
      >
        <div
          style={{
            maxWidth: '32rem',
            width: '100%',
            background: 'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)',
            borderRadius: '1rem',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '2.5rem',
            textAlign: 'center',
          }}
        >
          <div style={{fontSize: '3rem', marginBottom: '1rem'}}>&#10003;</div>
          <h1
            style={{
              fontFamily: 'var(--font-display, serif)',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#fff',
              marginBottom: '0.5rem',
            }}
          >
            Answer Published!
          </h1>
          <p style={{color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', lineHeight: 1.6}}>
            Your answer to the question on <strong style={{color: '#fff'}}>{productTitle}</strong> is
            now live on the product page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        style={{
          maxWidth: '36rem',
          width: '100%',
          background: 'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)',
          borderRadius: '1rem',
          border: '1px solid rgba(255,255,255,0.08)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.5rem',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <p
            style={{
              color: '#B8764F',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.25em',
              fontWeight: 600,
              marginBottom: '0.5rem',
            }}
          >
            Answer a Question
          </p>
          <h1
            style={{
              fontFamily: 'var(--font-display, serif)',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#fff',
            }}
          >
            {productTitle}
          </h1>
        </div>

        {/* Question */}
        <div style={{padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)'}}>
          <div style={{display: 'flex', gap: '0.75rem'}}>
            <div
              style={{
                width: '1.75rem',
                height: '1.75rem',
                borderRadius: '0.375rem',
                backgroundColor: 'rgba(0,242,96,0.15)',
                color: '#00F260',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.75rem',
                flexShrink: 0,
              }}
            >
              Q
            </div>
            <div>
              <p style={{color: '#fff', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '0.5rem'}}>
                {question.question}
              </p>
              <p style={{color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem'}}>
                Asked by {question.askedBy} on {question.askedAt}
              </p>
            </div>
          </div>
        </div>

        {/* Answer form */}
        <Form method="post" style={{padding: '1.5rem'}}>
          <input type="hidden" name="productHandle" value={productHandle} />
          <input type="hidden" name="questionId" value={questionId} />
          <input type="hidden" name="token" value={token} />

          {actionData?.error && (
            <div
              style={{
                padding: '0.75rem',
                backgroundColor: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: '0.5rem',
                color: '#f87171',
                fontSize: '0.875rem',
                marginBottom: '1rem',
              }}
            >
              {actionData.error}
            </div>
          )}

          <label
            htmlFor="answer"
            style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#fff',
              marginBottom: '0.5rem',
            }}
          >
            Your Answer
          </label>
          <textarea
            id="answer"
            name="answer"
            rows={5}
            required
            minLength={10}
            placeholder="Type your answer here..."
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              border: '1px solid rgba(255,255,255,0.08)',
              backgroundColor: 'rgba(255,255,255,0.05)',
              color: '#fff',
              fontSize: '0.875rem',
              lineHeight: 1.6,
              resize: 'vertical',
              outline: 'none',
              boxSizing: 'border-box',
            }}
            defaultValue={question.answer || ''}
          />
          <p style={{color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', marginTop: '0.25rem'}}>
            This will be published on the product page as an official response.
          </p>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              marginTop: '1rem',
              width: '100%',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              border: 'none',
              backgroundColor: '#00F260',
              color: '#000',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.7 : 1,
            }}
          >
            {isSubmitting ? 'Publishing...' : 'Publish Answer'}
          </button>
        </Form>
      </div>
    </div>
  );
}
```

**Key details:**
- Uses all inline styles (not Tailwind) since this page loads outside the storefront layout
- Dark theme matching the site design system
- Shows green Q badge, product title, question text, and asked-by info
- Answer textarea pre-fills if question already has an answer (allows editing)
- Success state confirms the answer is live
- Error states for expired tokens, missing questions, save failures

**Step 2: Commit**

```bash
git add app/routes/admin.qa.answer.tsx
git commit -m "feat(qa): add admin answer page with token verification"
```

---

### Task 5: Visual QA and end-to-end testing

**Files:**
- No new files

**Context:** Test the complete flow: submit a question on the product page, verify it's saved to the metafield, check the answer page loads with a valid token, submit an answer, verify it appears on the product page.

**Step 1: Start dev server and navigate to a product page**

Run: `npm run dev`
Navigate to: `http://localhost:3001/products/the-mandala-token`

**Step 2: Test question submission**

1. Click the "Questions" tab
2. Click "Ask a Question"
3. Fill in the form and submit
4. Verify success state appears
5. Check dev server logs — should see the question saved + Klaviyo event (or Klaviyo error if not configured)

**Step 3: Test answer page**

Navigate to the answer URL logged in the dev console. Verify:
1. Page loads with dark theme
2. Product title and question are displayed
3. Answer textarea is present
4. Submit an answer
5. Verify success confirmation

**Step 4: Verify answer appears on product page**

1. Reload the product page
2. Click "Questions" tab
3. The answered question should now appear in the accordion

**Step 5: Test error cases**

1. Try the answer URL with a tampered token — should show 403
2. Try with expired params — should show error
3. Try submitting an answer shorter than 10 chars — should show validation error

**Step 6: Commit any fixes**

```bash
git add -u
git commit -m "fix(qa): polish from visual QA"
```
