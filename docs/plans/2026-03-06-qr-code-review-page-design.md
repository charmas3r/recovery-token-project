# QR Code Review Page — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a QR-code-triggered review page that submits to Judge.me and rewards customers with a unique 25% discount code.

**Architecture:** New route `/review?product=<handle>` with a loader that fetches product data via Storefront API, and an action that validates the form, checks for duplicate reviews via Judge.me, submits the review, then creates a unique discount code via Shopify Admin API. The discount code is returned to the client and shown on a success screen with copy-to-clipboard.

**Tech Stack:** React Router, Shopify Storefront API, Shopify Admin API (GraphQL), Judge.me REST API, Zod validation, Tailwind v4

---

## Task 1: Add `hasExistingReview` to Judge.me client

**Files:**
- Modify: `app/lib/judgeme.server.ts`

**Step 1: Add the method to the client object**

Inside the `createJudgeMeClient` function's return object (after the `createReview` method, around line 237), add:

```typescript
    /**
     * Check if a review from a given email already exists for a product.
     * Uses private token to access reviewer emails.
     */
    async hasExistingReview(
      productExternalId: string,
      email: string,
    ): Promise<boolean> {
      if (!config.privateToken) {
        console.warn('Private token required for duplicate review check');
        return false;
      }

      const params = new URLSearchParams({
        shop_domain: config.shopDomain,
        api_token: config.privateToken,
        per_page: '100',
        page: '1',
      });

      const response = await fetch(`${baseUrl}/reviews?${params}`, {
        headers: {'Content-Type': 'application/json'},
      });

      if (!response.ok) {
        console.error('Judge.me review check failed:', response.status);
        return false;
      }

      const data = (await response.json()) as {
        reviews?: Array<{
          product_external_id: number;
          reviewer: {email: string};
          published: boolean;
          hidden: boolean;
          curated: string;
        }>;
      };

      const externalId = Number(productExternalId);
      const normalizedEmail = email.toLowerCase().trim();

      return (data.reviews || []).some(
        (r) =>
          r.product_external_id === externalId &&
          r.reviewer?.email?.toLowerCase().trim() === normalizedEmail &&
          r.published &&
          !r.hidden &&
          r.curated !== 'spam',
      );
    },
```

**Step 2: Verify build**

Run: `npm run typecheck`
Expected: No new errors

**Step 3: Commit**

```bash
git add app/lib/judgeme.server.ts
git commit -m "feat(reviews): add hasExistingReview to Judge.me client"
```

---

## Task 2: Add `createUniqueDiscountCode` to Shopify Admin

**Files:**
- Modify: `app/lib/shopify-admin.server.ts`

**Step 1: Add the discount code function**

Add at the end of `shopify-admin.server.ts`:

```typescript
// ---------------------------------------------------------------------------
// Public API — Discount code creation
// ---------------------------------------------------------------------------

/**
 * Generate a random alphanumeric code suffix.
 */
function generateCodeSuffix(length = 6): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I/1/O/0 for readability
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => chars[b % chars.length]).join('');
}

/**
 * Create a unique single-use 25%-off discount code via Shopify Admin API.
 *
 * @returns The discount code string (e.g. "THANKS-A3F9B2")
 */
export async function createUniqueDiscountCode(env: Env): Promise<string> {
  const code = `THANKS-${generateCodeSuffix()}`;

  const mutation = `#graphql
    mutation discountCodeBasicCreate($basicCodeDiscount: DiscountCodeBasicInput!) {
      discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
        codeDiscountNode {
          id
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const json = await adminQuery<{
    data: {
      discountCodeBasicCreate: {
        codeDiscountNode: {id: string} | null;
        userErrors: Array<{field: string[]; message: string}>;
      };
    };
  }>(env, mutation, {
    basicCodeDiscount: {
      title: `QR Review Reward - ${code}`,
      code,
      startsAt: new Date().toISOString(),
      usageLimit: 1,
      customerSelection: {
        all: true,
      },
      customerGets: {
        value: {
          percentage: 0.25,
        },
        items: {
          all: true,
        },
      },
    },
  });

  const {userErrors} = json.data.discountCodeBasicCreate;
  if (userErrors?.length) {
    throw new Error(
      `Shopify discount error: ${userErrors.map((e) => e.message).join(', ')}`,
    );
  }

  return code;
}
```

**Step 2: Verify build**

Run: `npm run typecheck`
Expected: No new errors

**Step 3: Commit**

```bash
git add app/lib/shopify-admin.server.ts
git commit -m "feat(reviews): add createUniqueDiscountCode via Shopify Admin API"
```

---

## Task 3: Add `qrReviewFormSchema` to validation

**Files:**
- Modify: `app/lib/validation.ts`

**Step 1: Add the schema**

After the `reviewFormSchema` section (around line 266), add:

```typescript
// ============================================================================
// QR CODE REVIEW (simplified — no photos, no quality pills)
// ============================================================================

export const qrReviewFormSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  productHandle: z.string().min(1, 'Product handle is required'),
  rating: z
    .number()
    .int()
    .min(1, 'Please select a rating')
    .max(5, 'Rating must be 5 or less'),
  title: z
    .string()
    .min(2, 'Headline must be at least 2 characters')
    .max(150, 'Headline must be less than 150 characters'),
  body: z
    .string()
    .min(10, 'Review must be at least 10 characters')
    .max(5000, 'Review must be less than 5000 characters'),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Please enter a valid email address'),
  honeypot: z.string().max(0).optional(),
});

export type QRReviewFormData = z.infer<typeof qrReviewFormSchema>;
```

**Step 2: Commit**

```bash
git add app/lib/validation.ts
git commit -m "feat(reviews): add qrReviewFormSchema for QR review page"
```

---

## Task 4: Create the review route

**Files:**
- Create: `app/routes/($locale).review.tsx`

**Step 1: Create the route file**

This is the main deliverable. The file contains:
- `meta` — page title and description
- `loader` — fetches product by handle from Storefront API query param
- `action` — validates form, checks duplicate, creates review, creates discount code
- `ReviewPage` component — product card + inline review form
- Success state — shows discount code with copy button

```typescript
/**
 * QR Code Review Page
 *
 * Customers scan a QR code shipped with their order, land here,
 * submit a review, and receive a unique 25% discount code.
 *
 * URL: /review?product=<product-handle>
 */

import {useState, useCallback} from 'react';
import {useLoaderData, useActionData, Form, useNavigation, Link} from 'react-router';
import type {Route} from './+types/review';
import {qrReviewFormSchema, formatZodErrors} from '~/lib/validation';
import {getJudgeMeClient, extractProductId} from '~/lib/judgeme.server';
import {createUniqueDiscountCode} from '~/lib/shopify-admin.server';
import {StarRatingInput} from '~/components/reviews/StarRatingInput';
import {clsx} from 'clsx';
import {CheckCircle2, Copy, Check, AlertCircle} from 'lucide-react';
import {Button} from '~/components/ui';
import {buildMeta} from '~/lib/meta';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

export const meta: Route.MetaFunction = ({data}) => {
  const productTitle = data?.product?.title;
  return buildMeta({
    title: productTitle
      ? `Review ${productTitle} | Coinplugz`
      : 'Leave a Review | Coinplugz',
    description:
      'Share your experience and receive a discount on your next order.',
  });
};

// ---------------------------------------------------------------------------
// Loader — fetch product by handle
// ---------------------------------------------------------------------------

const REVIEW_PRODUCT_QUERY = `#graphql
  query ReviewProduct($handle: String!) {
    product(handle: $handle) {
      id
      title
      handle
      featuredImage {
        url
        altText
        width
        height
      }
    }
  }
` as const;

export async function loader({request, context}: Route.LoaderArgs) {
  const url = new URL(request.url);
  const handle = url.searchParams.get('product');

  if (!handle) {
    return {product: null, error: 'missing-product'};
  }

  const {product} = await context.storefront.query(REVIEW_PRODUCT_QUERY, {
    variables: {handle},
  });

  if (!product) {
    return {product: null, error: 'not-found'};
  }

  return {product, error: null};
}

// ---------------------------------------------------------------------------
// Action — validate, check duplicate, create review, create discount
// ---------------------------------------------------------------------------

interface ActionData {
  success?: boolean;
  discountCode?: string;
  duplicate?: boolean;
  error?: string;
  fieldErrors?: Record<string, string | undefined>;
}

export async function action({
  request,
  context,
}: Route.ActionArgs): Promise<ActionData> {
  const formData = await request.formData();

  const data = {
    productId: formData.get('productId')?.toString() || '',
    productHandle: formData.get('productHandle')?.toString() || '',
    rating: parseInt(formData.get('rating')?.toString() || '0', 10),
    title: formData.get('title')?.toString() || '',
    body: formData.get('body')?.toString() || '',
    name: formData.get('name')?.toString() || '',
    email: formData.get('email')?.toString() || '',
    honeypot: formData.get('website')?.toString() || '',
  };

  // Honeypot check — pretend success
  if (data.honeypot) {
    return {success: true, discountCode: ''};
  }

  // Validate form
  const result = qrReviewFormSchema.safeParse(data);
  if (!result.success) {
    return {fieldErrors: formatZodErrors(result.error)};
  }

  const {env} = context;

  try {
    const judgeme = getJudgeMeClient(env);
    const externalId = extractProductId(result.data.productId);

    // Check for duplicate review
    const alreadyReviewed = await judgeme.hasExistingReview(
      externalId,
      result.data.email,
    );

    if (alreadyReviewed) {
      return {duplicate: true};
    }

    // Submit review to Judge.me
    await judgeme.createReview({
      product_id: externalId,
      email: result.data.email,
      name: result.data.name,
      rating: result.data.rating,
      title: result.data.title,
      body: result.data.body,
    });

    // Create unique discount code
    let discountCode = '';
    try {
      discountCode = await createUniqueDiscountCode(env);
    } catch (discountError) {
      console.error('Failed to create discount code:', discountError);
      // Review was submitted successfully — don't fail the whole request
    }

    return {success: true, discountCode};
  } catch (error) {
    console.error('QR review submission error:', error);

    if (
      error instanceof Error &&
      error.message.includes('not configured')
    ) {
      console.warn('Judge.me not configured, review logged only');
      return {success: true, discountCode: ''};
    }

    return {
      error: 'Could not submit your review right now. Please try again later.',
    };
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ReviewPage() {
  const {product, error: loaderError} = useLoaderData<typeof loader>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  if (loaderError || !product) {
    return <ProductNotFound reason={loaderError} />;
  }

  if (actionData?.duplicate) {
    return <AlreadyReviewed productTitle={product.title} />;
  }

  if (actionData?.success) {
    return (
      <ReviewSuccess
        productTitle={product.title}
        discountCode={actionData.discountCode || ''}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-lg mx-auto px-4 py-12">
        {/* Header */}
        <div style={{textAlign: 'center', marginBottom: '2rem'}}>
          <span
            style={{
              display: 'inline-block',
              color: '#B8764F',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.25em',
              fontWeight: 600,
              marginBottom: '0.5rem',
            }}
          >
            Share Your Experience
          </span>
          <h1
            style={{
              fontFamily: 'var(--font-display, serif)',
              fontSize: '1.875rem',
              fontWeight: 700,
              color: '#FFFFFF',
              lineHeight: 1.1,
            }}
          >
            Leave a Review
          </h1>
        </div>

        {/* Product Card */}
        <div
          className="rounded-2xl border border-white/[0.08] overflow-hidden mb-8"
          style={{
            background:
              'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)',
          }}
        >
          <div className="flex items-center gap-4 p-4">
            {product.featuredImage && (
              <img
                src={product.featuredImage.url}
                alt={product.featuredImage.altText || product.title}
                width={80}
                height={80}
                className="w-20 h-20 rounded-lg object-cover"
              />
            )}
            <div>
              <h2 className="font-display text-lg font-bold text-white">
                {product.title}
              </h2>
              <p className="text-sm text-white/40">
                How was your experience with this token?
              </p>
            </div>
          </div>
        </div>

        {/* Review Form */}
        <ReviewForm
          productId={product.id}
          productHandle={product.handle}
          isSubmitting={isSubmitting}
          fieldErrors={actionData?.fieldErrors}
          serverError={actionData?.error}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ReviewForm({
  productId,
  productHandle,
  isSubmitting,
  fieldErrors,
  serverError,
}: {
  productId: string;
  productHandle: string;
  isSubmitting: boolean;
  fieldErrors?: Record<string, string | undefined>;
  serverError?: string;
}) {
  const [rating, setRating] = useState(0);

  return (
    <Form method="post">
      {/* Hidden fields */}
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="productHandle" value={productHandle} />
      <input type="hidden" name="rating" value={rating} />

      {/* Honeypot */}
      <div style={{position: 'absolute', left: '-9999px'}} aria-hidden="true">
        <label htmlFor="qr-website">Website</label>
        <input
          type="text"
          id="qr-website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="space-y-5">
        {/* Server error */}
        {serverError && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
            {serverError}
          </div>
        )}

        {/* Star Rating */}
        <div>
          <label className="block text-sm font-semibold text-white mb-2">
            Rating <span className="text-red-500">*</span>
          </label>
          <StarRatingInput
            value={rating}
            onChange={setRating}
            error={fieldErrors?.rating}
          />
        </div>

        {/* Headline */}
        <div>
          <label
            htmlFor="qr-review-title"
            className="block text-sm font-semibold text-white mb-2"
          >
            Headline <span className="text-red-500">*</span>
          </label>
          <input
            id="qr-review-title"
            name="title"
            type="text"
            placeholder="Summarize your experience"
            maxLength={150}
            className={clsx(
              'w-full px-3 py-2.5 rounded-lg border text-sm text-white bg-white/[0.05]',
              'placeholder:text-white/25 transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-accent focus:bg-white/[0.08]',
              fieldErrors?.title ? 'border-red-400' : 'border-white/[0.08]',
            )}
          />
          {fieldErrors?.title && (
            <p className="text-sm text-red-600 mt-1">{fieldErrors.title}</p>
          )}
        </div>

        {/* Review Body */}
        <div>
          <label
            htmlFor="qr-review-body"
            className="block text-sm font-semibold text-white mb-2"
          >
            Your Review <span className="text-red-500">*</span>
          </label>
          <textarea
            id="qr-review-body"
            name="body"
            rows={4}
            placeholder="What did you think of this token? How does it feel in your hand?"
            maxLength={5000}
            className={clsx(
              'w-full px-3 py-2.5 rounded-lg border text-sm text-white bg-white/[0.05] resize-y',
              'placeholder:text-white/25 transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-accent focus:bg-white/[0.08]',
              fieldErrors?.body ? 'border-red-400' : 'border-white/[0.08]',
            )}
          />
          {fieldErrors?.body && (
            <p className="text-sm text-red-600 mt-1">{fieldErrors.body}</p>
          )}
        </div>

        {/* Name */}
        <div>
          <label
            htmlFor="qr-review-name"
            className="block text-sm font-semibold text-white mb-2"
          >
            Your Name <span className="text-red-500">*</span>
          </label>
          <input
            id="qr-review-name"
            name="name"
            type="text"
            placeholder="How should we display your name?"
            maxLength={100}
            className={clsx(
              'w-full px-3 py-2.5 rounded-lg border text-sm text-white bg-white/[0.05]',
              'placeholder:text-white/25 transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-accent focus:bg-white/[0.08]',
              fieldErrors?.name ? 'border-red-400' : 'border-white/[0.08]',
            )}
          />
          {fieldErrors?.name && (
            <p className="text-sm text-red-600 mt-1">{fieldErrors.name}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="qr-review-email"
            className="block text-sm font-semibold text-white mb-2"
          >
            Email <span className="text-red-500">*</span>
          </label>
          <input
            id="qr-review-email"
            name="email"
            type="email"
            placeholder="your@email.com"
            className={clsx(
              'w-full px-3 py-2.5 rounded-lg border text-sm text-white bg-white/[0.05]',
              'placeholder:text-white/25 transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-accent focus:bg-white/[0.08]',
              fieldErrors?.email ? 'border-red-400' : 'border-white/[0.08]',
            )}
          />
          <p className="text-xs text-white/40 mt-1">
            Use the same email you ordered with for a verified purchase badge.
          </p>
          {fieldErrors?.email && (
            <p className="text-sm text-red-600 mt-1">{fieldErrors.email}</p>
          )}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          variant="primary"
          className="w-full !bg-accent !text-white"
          disabled={isSubmitting || rating === 0}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </Button>

        <p className="text-xs text-white/30 text-center">
          Submit a review and receive a 25% discount code for your next order.
        </p>
      </div>
    </Form>
  );
}

function ReviewSuccess({
  productTitle,
  discountCode,
}: {
  productTitle: string;
  discountCode: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    if (!discountCode) return;
    navigator.clipboard.writeText(discountCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [discountCode]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div
        className="max-w-md w-full rounded-2xl border border-white/[0.08] p-8"
        style={{
          background:
            'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)',
          textAlign: 'center',
        }}
      >
        <div className="flex justify-center mb-4">
          <CheckCircle2 className="w-16 h-16 text-green-500" />
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-display, serif)',
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#FFFFFF',
            marginBottom: '0.5rem',
          }}
        >
          Thank You!
        </h1>
        <p className="text-body text-white/50 mb-6">
          Your review for{' '}
          <span className="font-semibold text-white">{productTitle}</span>{' '}
          has been submitted.
        </p>

        {discountCode && (
          <div className="mb-6">
            <p className="text-sm text-white/40 mb-3">
              Here's your 25% discount for your next order:
            </p>
            <div className="flex items-center justify-center gap-2 bg-white/[0.05] border border-white/[0.08] rounded-xl p-4">
              <span className="text-2xl font-bold text-accent tracking-wider font-mono">
                {discountCode}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.05] transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
                aria-label="Copy discount code"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-green-500" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>
            </div>
            {copied && (
              <p className="text-xs text-green-500 mt-2">
                Copied to clipboard!
              </p>
            )}
          </div>
        )}

        <Link
          to="/"
          className="inline-block text-sm text-accent hover:text-accent/80 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

function AlreadyReviewed({productTitle}: {productTitle: string}) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div
        className="max-w-md w-full rounded-2xl border border-white/[0.08] p-8"
        style={{
          background:
            'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)',
          textAlign: 'center',
        }}
      >
        <div className="flex justify-center mb-4">
          <AlertCircle className="w-16 h-16 text-accent" />
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-display, serif)',
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#FFFFFF',
            marginBottom: '0.5rem',
          }}
        >
          Already Reviewed
        </h1>
        <p className="text-body text-white/50 mb-6">
          You've already submitted a review for{' '}
          <span className="font-semibold text-white">{productTitle}</span>.
          Thank you for your feedback!
        </p>
        <Link
          to="/"
          className="inline-block text-sm text-accent hover:text-accent/80 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

function ProductNotFound({reason}: {reason?: string | null}) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div
        className="max-w-md w-full rounded-2xl border border-white/[0.08] p-8"
        style={{
          background:
            'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-display, serif)',
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#FFFFFF',
            marginBottom: '0.5rem',
          }}
        >
          {reason === 'missing-product' ? 'Missing Product' : 'Product Not Found'}
        </h1>
        <p className="text-body text-white/50 mb-6">
          {reason === 'missing-product'
            ? 'This review link appears to be incomplete. Please scan the QR code again.'
            : 'We couldn\'t find the product you\'re looking for.'}
        </p>
        <Link
          to="/"
          className="inline-block text-sm text-accent hover:text-accent/80 transition-colors"
        >
          Visit Our Store
        </Link>
      </div>
    </div>
  );
}
```

**Step 2: Verify build**

Run: `npm run typecheck`
Expected: No errors

**Step 3: Manual test**

1. Run `npm run dev`
2. Visit `/review` — should show "Missing Product" state
3. Visit `/review?product=invalid-handle` — should show "Product Not Found" state
4. Visit `/review?product=<valid-handle>` — should show product card + review form
5. Submit a review — should show success screen with discount code (if Admin API is configured)

**Step 4: Commit**

```bash
git add app/routes/\(\$locale\).review.tsx
git commit -m "feat(reviews): add QR code review page with discount code reward"
```

---

## Task 5: Update LAUNCH-PLAN.md

**Files:**
- Modify: `LAUNCH-PLAN.md`

**Step 1: Update the QR Code Review Page status**

Change the status from `Planned` to `Done` in the in-progress features table (line 97):

```markdown
| **QR Code Review Page** | Done | QR code per product -> customer scans -> review form -> unique 25% discount code. Route: `/review?product=<handle>` |
```

**Step 2: Commit**

```bash
git add LAUNCH-PLAN.md
git commit -m "docs: mark QR Code Review Page as done in launch plan"
```

---

## Summary of Files

| Action | File |
|--------|------|
| Modify | `app/lib/judgeme.server.ts` — add `hasExistingReview` method |
| Modify | `app/lib/shopify-admin.server.ts` — add `createUniqueDiscountCode` function |
| Modify | `app/lib/validation.ts` — add `qrReviewFormSchema` |
| Create | `app/routes/($locale).review.tsx` — full review page route |
| Modify | `LAUNCH-PLAN.md` — update status |

## Admin API Scope Requirement

The `discountCodeBasicCreate` mutation requires the `write_discounts` scope on the Admin API access token (`PRIVATE_STOREFRONT_API_TOKEN`). Verify this scope is enabled in the Shopify app configuration. If not, add it in the Shopify Partner Dashboard under the app's API scopes.
