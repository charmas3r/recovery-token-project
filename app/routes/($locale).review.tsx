/**
 * QR Code Review Page — /review?product=<product-handle>
 *
 * Standalone review form that customers land on after scanning a QR code
 * shipped with their order. Submitting a review rewards the customer with
 * a unique 25%-off discount code for their next purchase.
 *
 * Mobile-first, dark theme, no authentication required.
 */

import {useState, useCallback} from 'react';
import {useLoaderData, useActionData, Form, useNavigation, Link} from 'react-router';
import type {Route} from './+types/review';
import {qrReviewFormSchema, formatZodErrors} from '~/lib/validation';
import {getJudgeMeClient} from '~/lib/judgeme.server';
import {extractProductId} from '~/lib/judgeme';
import {createUniqueDiscountCode} from '~/lib/shopify-admin.server';
import {StarRatingInput} from '~/components/reviews/StarRatingInput';
import {clsx} from 'clsx';
import {CheckCircle2, Copy, Check, AlertCircle} from 'lucide-react';
import {Button} from '~/components/ui';
import {buildMeta} from '~/lib/meta';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ActionData {
  success?: boolean;
  discountCode?: string;
  duplicate?: boolean;
  error?: string;
  fieldErrors?: Record<string, string | undefined>;
}

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

export const meta: Route.MetaFunction = () => {
  return buildMeta({
    title: 'Leave a Review — Coinplugz',
    description:
      'Share your experience with your recovery token and receive a 25% discount code for your next order.',
    noIndex: true,
  });
};

// ---------------------------------------------------------------------------
// GraphQL
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

// ---------------------------------------------------------------------------
// Loader
// ---------------------------------------------------------------------------

export async function loader({request, context}: Route.LoaderArgs) {
  const url = new URL(request.url);
  const handle = url.searchParams.get('product');

  if (!handle) {
    return {product: null, error: 'missing-product' as const};
  }

  const {product} = await context.storefront.query(REVIEW_PRODUCT_QUERY, {
    variables: {handle},
  });

  if (!product) {
    return {product: null, error: 'not-found' as const};
  }

  return {product, error: null};
}

// ---------------------------------------------------------------------------
// Action
// ---------------------------------------------------------------------------

export async function action({request, context}: Route.ActionArgs): Promise<ActionData> {
  const formData = await request.formData();

  // Honeypot check
  const honeypot = formData.get('website')?.toString() || '';
  if (honeypot) {
    return {success: true, discountCode: 'THANKS-XXXXXX'};
  }

  const rawData = {
    productId: formData.get('productId')?.toString() || '',
    productHandle: formData.get('productHandle')?.toString() || '',
    rating: Number(formData.get('rating') || 0),
    title: formData.get('title')?.toString() || '',
    body: formData.get('body')?.toString() || '',
    name: formData.get('name')?.toString() || '',
    email: formData.get('email')?.toString() || '',
    honeypot: '',
  };

  // Validate
  const result = qrReviewFormSchema.safeParse(rawData);
  if (!result.success) {
    return {fieldErrors: formatZodErrors(result.error)};
  }

  const {productId, email, name, rating, title, body} = result.data;
  const judgeme = getJudgeMeClient(context.env);

  // Duplicate check
  try {
    const alreadyReviewed = await judgeme.hasExistingReview(productId, email);
    if (alreadyReviewed) {
      return {duplicate: true};
    }
  } catch (err) {
    console.error('Duplicate review check failed:', err);
    // Continue — better to allow a possible duplicate than block a real review
  }

  // Create review
  try {
    await judgeme.createReview({
      product_id: productId,
      email,
      name,
      rating,
      title,
      body,
    });
  } catch (err) {
    console.error('Failed to create review:', err);
    return {error: 'Something went wrong submitting your review. Please try again.'};
  }

  // Create discount code (non-critical — review success is more important)
  let discountCode: string | undefined;
  try {
    discountCode = await createUniqueDiscountCode(context.env);
  } catch (err) {
    console.error('Failed to create discount code:', err);
    // Review still succeeded, just no discount code
  }

  return {success: true, discountCode};
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function QRReviewPage() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();

  const isSubmitting = navigation.state === 'submitting';

  // Action states take precedence
  if (actionData?.duplicate) {
    return <AlreadyReviewed />;
  }

  if (actionData?.success) {
    return <ReviewSuccess discountCode={actionData.discountCode} />;
  }

  // Loader error states
  if (loaderData.error || !loaderData.product) {
    return <ProductNotFound error={loaderData.error || 'not-found'} />;
  }

  return (
    <ReviewForm
      product={loaderData.product}
      isSubmitting={isSubmitting}
      actionData={actionData || undefined}
    />
  );
}

// ---------------------------------------------------------------------------
// Product Not Found
// ---------------------------------------------------------------------------

function ProductNotFound({error}: {error: string}) {
  const isMissing = error === 'missing-product';

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div
        style={{
          textAlign: 'center',
          maxWidth: '28rem',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        <div className="flex justify-center mb-6">
          <AlertCircle className="w-16 h-16 text-white/30" />
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-display, serif)',
            fontSize: '1.75rem',
            fontWeight: 700,
            color: '#FFFFFF',
            lineHeight: 1.2,
            marginBottom: '0.75rem',
          }}
        >
          {isMissing ? 'Missing Product' : 'Product Not Found'}
        </h1>
        <p
          style={{
            fontSize: '1rem',
            lineHeight: 1.6,
            color: 'rgba(255,255,255,0.5)',
            marginBottom: '2rem',
          }}
        >
          {isMissing
            ? 'This review link is missing the product information. Please scan the QR code on your order insert again.'
            : 'We couldn\'t find the product associated with this review link. It may have been removed from our store.'}
        </p>
        <Link to="/">
          <Button variant="primary" size="lg" className="!bg-accent !text-white">
            Visit Our Store
          </Button>
        </Link>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Already Reviewed
// ---------------------------------------------------------------------------

function AlreadyReviewed() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div
        style={{
          textAlign: 'center',
          maxWidth: '28rem',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        <div className="flex justify-center mb-6">
          <AlertCircle className="w-16 h-16" style={{color: '#B8764F'}} />
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-display, serif)',
            fontSize: '1.75rem',
            fontWeight: 700,
            color: '#FFFFFF',
            lineHeight: 1.2,
            marginBottom: '0.75rem',
          }}
        >
          Already Reviewed
        </h1>
        <p
          style={{
            fontSize: '1rem',
            lineHeight: 1.6,
            color: 'rgba(255,255,255,0.5)',
            marginBottom: '2rem',
          }}
        >
          It looks like you&apos;ve already submitted a review for this product. Thank you for sharing your experience — your feedback means the world to us.
        </p>
        <Link to="/">
          <Button variant="primary" size="lg" className="!bg-accent !text-white">
            Continue Shopping
          </Button>
        </Link>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Review Success
// ---------------------------------------------------------------------------

function ReviewSuccess({discountCode}: {discountCode?: string}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    if (!discountCode) return;
    navigator.clipboard.writeText(discountCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }, [discountCode]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div
        style={{
          textAlign: 'center',
          maxWidth: '28rem',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        <div className="flex justify-center mb-6">
          <CheckCircle2 className="w-16 h-16 text-green-500" />
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-display, serif)',
            fontSize: '2rem',
            fontWeight: 700,
            color: '#FFFFFF',
            lineHeight: 1.2,
            marginBottom: '0.75rem',
          }}
        >
          Thank You!
        </h1>
        <p
          style={{
            fontSize: '1rem',
            lineHeight: 1.6,
            color: 'rgba(255,255,255,0.5)',
            marginBottom: '2rem',
          }}
        >
          Your review has been submitted and will appear after moderation. We truly appreciate you sharing your experience.
        </p>

        {discountCode && (
          <div
            className="rounded-2xl border border-white/[0.08] p-6 mb-8"
            style={{
              background:
                'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)',
            }}
          >
            <p
              style={{
                fontSize: '0.875rem',
                color: 'rgba(255,255,255,0.5)',
                marginBottom: '0.75rem',
              }}
            >
              Your 25% discount code for your next order:
            </p>
            <div className="flex items-center justify-center gap-3">
              <code
                style={{
                  fontFamily: 'monospace',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  letterSpacing: '0.05em',
                }}
              >
                {discountCode}
              </code>
              <button
                type="button"
                onClick={handleCopy}
                className={clsx(
                  'p-2 rounded-lg transition-colors',
                  'hover:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-accent',
                  copied ? 'text-green-400' : 'text-white/40 hover:text-white',
                )}
                aria-label={copied ? 'Copied' : 'Copy discount code'}
              >
                {copied ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        )}

        <Link to="/">
          <Button variant="primary" size="lg" className="!bg-accent !text-white">
            Continue Shopping
          </Button>
        </Link>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Review Form
// ---------------------------------------------------------------------------

interface ReviewFormProps {
  product: {
    id: string;
    title: string;
    handle: string;
    featuredImage?: {
      url: string;
      altText?: string | null;
      width?: number | null;
      height?: number | null;
    } | null;
  };
  isSubmitting: boolean;
  actionData?: ActionData;
}

function ReviewForm({product, isSubmitting, actionData}: ReviewFormProps) {
  const [rating, setRating] = useState(0);

  const fieldErrors = actionData?.fieldErrors;
  const serverError = actionData?.error;
  const numericProductId = extractProductId(product.id);

  return (
    <div className="min-h-screen py-12 md:py-16 px-6">
      <div
        style={{
          maxWidth: '32rem',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        {/* Page Header */}
        <div style={{textAlign: 'center', marginBottom: '2rem'}}>
          <span
            style={{
              display: 'inline-block',
              color: '#B8764F',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.25em',
              fontWeight: 600,
              marginBottom: '1rem',
            }}
          >
            Share Your Experience
          </span>
          <h1
            style={{
              fontFamily: 'var(--font-display, serif)',
              fontSize: '2rem',
              fontWeight: 700,
              color: '#FFFFFF',
              lineHeight: 1.2,
              marginBottom: '0.75rem',
            }}
          >
            Write a Review
          </h1>
          <p
            style={{
              fontSize: '1rem',
              lineHeight: 1.6,
              color: 'rgba(255,255,255,0.5)',
            }}
          >
            Tell us what you think. Your honest feedback helps our community.
          </p>
        </div>

        {/* Product Card */}
        <div
          className="rounded-2xl border border-white/[0.08] p-4 mb-8 flex items-center gap-4"
          style={{
            background:
              'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)',
          }}
        >
          {product.featuredImage?.url && (
            <img
              src={product.featuredImage.url}
              alt={product.featuredImage.altText || product.title}
              width={80}
              height={80}
              className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
            />
          )}
          <div className="min-w-0">
            <p
              style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'rgba(255,255,255,0.4)',
                marginBottom: '0.25rem',
              }}
            >
              Reviewing
            </p>
            <h2
              style={{
                fontFamily: 'var(--font-display, serif)',
                fontSize: '1.125rem',
                fontWeight: 700,
                color: '#FFFFFF',
                lineHeight: 1.3,
              }}
            >
              {product.title}
            </h2>
          </div>
        </div>

        {/* Review Form */}
        <div
          className="rounded-2xl border border-white/[0.08]"
          style={{
            background:
              'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)',
          }}
        >
          <Form method="post" className="p-6 space-y-5">
            {/* Hidden fields */}
            <input type="hidden" name="productId" value={numericProductId} />
            <input type="hidden" name="productHandle" value={product.handle} />
            <input type="hidden" name="rating" value={rating} />

            {/* Honeypot */}
            <div
              style={{position: 'absolute', left: '-9999px'}}
              aria-hidden="true"
            >
              <label htmlFor="qr-review-website">Website</label>
              <input
                type="text"
                id="qr-review-website"
                name="website"
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

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
                  fieldErrors?.title
                    ? 'border-red-400'
                    : 'border-white/[0.08]',
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
                  fieldErrors?.body
                    ? 'border-red-400'
                    : 'border-white/[0.08]',
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
                  fieldErrors?.name
                    ? 'border-red-400'
                    : 'border-white/[0.08]',
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
                  fieldErrors?.email
                    ? 'border-red-400'
                    : 'border-white/[0.08]',
                )}
              />
              <p className="text-xs text-white/40 mt-1">
                Use the same email you ordered with for a verified purchase badge.
              </p>
              {fieldErrors?.email && (
                <p className="text-sm text-red-600 mt-1">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Submit */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="!bg-accent !text-white w-full"
                disabled={isSubmitting || rating === 0}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </Button>
              <p
                style={{
                  fontSize: '0.75rem',
                  lineHeight: 1.5,
                  color: 'rgba(255,255,255,0.4)',
                  textAlign: 'center',
                  marginTop: '0.75rem',
                }}
              >
                Submit a review and receive a 25% discount code for your next order.
              </p>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
