# Product Q&A Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a customer Q&A section to product pages, tabbed alongside reviews, with question submission via Klaviyo and answer management via Shopify metafields.

**Architecture:** Product Q&A data stored as JSON in a Shopify product metafield (`custom.product_qa`), fetched via Storefront API. Customer questions submitted through a modal form, validated with Zod, and sent as Klaviyo events. Admin publishes answers by editing the metafield in Shopify admin. UI uses a tabbed Reviews/Questions interface.

**Tech Stack:** React Router, Zod, Radix UI Dialog, Klaviyo API, Shopify Storefront API metafields, Tailwind/inline styles (dark theme)

---

## Task 1: Add Question Form Validation Schema

**Files:**
- Modify: `app/lib/validation.ts` (after line 266, the `ReviewFormData` type export)

**Step 1: Add the schema**

Add the following after the `// PRODUCT REVIEWS` section (after line 266) in `app/lib/validation.ts`:

```typescript
// ============================================================================
// PRODUCT QUESTIONS (Q&A)
// ============================================================================

export const questionFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Please enter a valid email address'),
  question: z
    .string()
    .min(10, 'Question must be at least 10 characters')
    .max(1000, 'Question must be less than 1000 characters'),
  productHandle: z.string().min(1, 'Product handle is required'),
  productTitle: z.string().min(1, 'Product title is required'),
  honeypot: z.string().max(0).optional(),
});

export type QuestionFormData = z.infer<typeof questionFormSchema>;
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors related to validation.ts

**Step 3: Commit**

```bash
git add app/lib/validation.ts
git commit -m "feat(qa): add question form validation schema"
```

---

## Task 2: Create Question Submission Action Route

**Files:**
- Create: `app/routes/($locale).questions.submit.tsx`
- Reference: `app/routes/($locale).reviews.submit.tsx` (pattern to follow)
- Reference: `app/routes/($locale).contact.tsx` (Klaviyo event pattern)

**Step 1: Create the action route**

Create `app/routes/($locale).questions.submit.tsx`:

```typescript
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
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors (the `+types/questions.submit` type will be auto-generated on next build)

**Step 3: Commit**

```bash
git add app/routes/\(\$locale\).questions.submit.tsx
git commit -m "feat(qa): add question submission action route with Klaviyo"
```

---

## Task 3: Create Ask Question Modal Component

**Files:**
- Create: `app/components/qa/AskQuestionModal.tsx`
- Reference: `app/components/reviews/WriteReviewModal.tsx` (pattern to follow exactly)

**Step 1: Create the modal**

Create `app/components/qa/AskQuestionModal.tsx`. Follow the exact same Radix Dialog pattern as `WriteReviewModal.tsx`:

```typescript
/**
 * AskQuestionModal - Product question submission form
 *
 * Radix Dialog modal with name, email, question fields.
 * Follows WriteReviewModal pattern for consistency.
 */

import {useState, useEffect} from 'react';
import {useFetcher} from 'react-router';
import * as Dialog from '@radix-ui/react-dialog';
import {clsx} from 'clsx';
import {X, CheckCircle2, MessageCircleQuestion} from 'lucide-react';
import {Button} from '~/components/ui';

interface AskQuestionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productHandle: string;
  productTitle: string;
}

interface ActionData {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string | undefined>;
}

export function AskQuestionModal({
  open,
  onOpenChange,
  productHandle,
  productTitle,
}: AskQuestionModalProps) {
  const fetcher = useFetcher<ActionData>();

  const isSubmitting = fetcher.state !== 'idle';
  const isSuccess = fetcher.data?.success === true;
  const fieldErrors = fetcher.data?.fieldErrors;
  const serverError = fetcher.data?.error;

  // Reset form when modal closes
  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
  };

  // Auto-close after success
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => handleOpenChange(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  if (isSuccess) {
    return (
      <Dialog.Root open={open} onOpenChange={handleOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay
            className="fixed inset-0 bg-black/40"
            style={{zIndex: 9998}}
          />
          <Dialog.Content
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 9999,
              width: 'calc(100% - 2rem)',
              maxWidth: '28rem',
              backgroundColor: '#0A0A0A',
              borderRadius: '0.75rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              padding: '2.5rem 1.5rem',
              textAlign: 'center',
            }}
          >
            <Dialog.Title className="sr-only">Question Submitted</Dialog.Title>
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="w-16 h-16 text-green-500" />
            </div>
            <h3 className="font-display text-xl font-bold text-white mb-2">
              Question Submitted!
            </h3>
            <p className="text-body text-white/50">
              We&apos;ll review your question about{' '}
              <span className="font-semibold text-white">{productTitle}</span>{' '}
              and post an answer soon.
            </p>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 bg-black/40"
          style={{zIndex: 9998}}
        />
        <Dialog.Content
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 9999,
            width: 'calc(100% - 2rem)',
            maxWidth: '32rem',
            maxHeight: '90vh',
            overflowY: 'auto',
            backgroundColor: '#0A0A0A',
            borderRadius: '0.75rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          }}
          aria-describedby="ask-question-description"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/[0.08]">
            <Dialog.Title className="font-display text-lg font-bold text-white flex items-center gap-2">
              <MessageCircleQuestion className="w-5 h-5 text-accent" />
              Ask a Question
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className={clsx(
                  'p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.05]',
                  'transition-colors focus:outline-none focus:ring-2 focus:ring-accent',
                )}
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          {/* Body */}
          <fetcher.Form method="post" action="/questions/submit" className="p-4 space-y-5">
            {/* Hidden fields */}
            <input type="hidden" name="productHandle" value={productHandle} />
            <input type="hidden" name="productTitle" value={productTitle} />

            {/* Honeypot */}
            <div style={{position: 'absolute', left: '-9999px'}} aria-hidden="true">
              <label htmlFor="question-website">Website</label>
              <input
                type="text"
                id="question-website"
                name="website"
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            {/* Product name context */}
            <div className="bg-white/[0.05] rounded-lg p-3">
              <p className="font-semibold text-white text-sm">{productTitle}</p>
            </div>

            {/* Server error */}
            {serverError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
                {serverError}
              </div>
            )}

            {/* Question */}
            <div>
              <label
                htmlFor="question-text"
                className="block text-sm font-semibold text-white mb-2"
              >
                Your Question <span className="text-red-500">*</span>
              </label>
              <textarea
                id="question-text"
                name="question"
                rows={3}
                placeholder="What would you like to know about this product?"
                maxLength={1000}
                className={clsx(
                  'w-full px-3 py-2.5 rounded-lg border text-sm text-white bg-white/[0.05] resize-y',
                  'placeholder:text-white/25 transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-accent focus:bg-white/[0.08]',
                  fieldErrors?.question ? 'border-red-400' : 'border-white/[0.08]',
                )}
              />
              {fieldErrors?.question && (
                <p className="text-sm text-red-600 mt-1">{fieldErrors.question}</p>
              )}
            </div>

            {/* Name */}
            <div>
              <label
                htmlFor="question-name"
                className="block text-sm font-semibold text-white mb-2"
              >
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                id="question-name"
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
                htmlFor="question-email"
                className="block text-sm font-semibold text-white mb-2"
              >
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="question-email"
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
                We&apos;ll notify you when your question is answered. Your email will not be published.
              </p>
              {fieldErrors?.email && (
                <p className="text-sm text-red-600 mt-1">{fieldErrors.email}</p>
              )}
            </div>

            {/* Submit */}
            <div
              className="flex gap-3 pt-2"
              id="ask-question-description"
            >
              <Dialog.Close asChild>
                <Button
                  variant="secondary"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </Dialog.Close>
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Question'}
              </Button>
            </div>
          </fetcher.Form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`

**Step 3: Commit**

```bash
git add app/components/qa/AskQuestionModal.tsx
git commit -m "feat(qa): add AskQuestionModal component"
```

---

## Task 4: Create Q&A Display Section Component

**Files:**
- Create: `app/components/qa/QASection.tsx`

**Step 1: Create the Q&A display component**

Create `app/components/qa/QASection.tsx`:

```typescript
/**
 * QASection - Product Q&A display with accordion cards
 *
 * Displays answered questions from Shopify metafield data.
 * Matches dark theme card design from ProductReviewsGrid.
 */

import {useState} from 'react';
import {ChevronDown, MessageCircleQuestion, ShieldCheck} from 'lucide-react';
import {clsx} from 'clsx';

export interface QAItem {
  id: string;
  question: string;
  askedBy: string;
  askedAt: string;
  answer: string;
  answeredAt: string;
}

interface QASectionProps {
  questions: QAItem[];
  onAskQuestion: () => void;
}

/**
 * Parse and validate Q&A JSON from metafield
 */
export function parseQAMetafield(value: string | null | undefined): QAItem[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item: unknown): item is QAItem =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as QAItem).id === 'string' &&
        typeof (item as QAItem).question === 'string' &&
        typeof (item as QAItem).answer === 'string' &&
        (item as QAItem).answer.length > 0,
    );
  } catch {
    return [];
  }
}

function formatDate(dateString: string) {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

export function QASection({questions, onAskQuestion}: QASectionProps) {
  if (questions.length === 0) {
    return <QAEmptyState onAskQuestion={onAskQuestion} />;
  }

  return (
    <div>
      {/* Ask button */}
      <div className="flex justify-end mb-6">
        <button
          type="button"
          onClick={onAskQuestion}
          className={clsx(
            'inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold',
            'border border-white/[0.15] text-white hover:border-accent/40 hover:text-accent',
            'transition-colors focus:outline-none focus:ring-2 focus:ring-accent',
          )}
        >
          <MessageCircleQuestion className="w-4 h-4" />
          Ask a Question
        </button>
      </div>

      {/* Q&A Cards */}
      <div className="space-y-4">
        {questions.map((item, index) => (
          <QACard key={item.id} item={item} index={index} />
        ))}
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function QACard({item, index}: {item: QAItem; index: number}) {
  const [expanded, setExpanded] = useState(index === 0); // First one open by default

  return (
    <div
      className="rounded-2xl border border-white/[0.08] hover:border-white/[0.15] transition-all duration-300 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)',
        animation: 'fadeInUp 0.5s ease-out forwards',
        animationDelay: `${index * 100}ms`,
        opacity: 0,
      }}
    >
      {/* Question (always visible, clickable) */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-6 flex items-start gap-4 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent"
        aria-expanded={expanded}
      >
        {/* Q label */}
        <span
          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
          style={{backgroundColor: 'rgba(0,242,96,0.15)', color: '#00F260'}}
        >
          Q
        </span>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-base leading-snug">
            {item.question}
          </p>
          <p className="text-xs text-white/40 mt-1.5">
            {item.askedBy} &middot; {formatDate(item.askedAt)}
          </p>
        </div>

        {/* Chevron */}
        <ChevronDown
          className={clsx(
            'w-5 h-5 text-white/40 flex-shrink-0 transition-transform duration-200 mt-1',
            expanded && 'rotate-180',
          )}
        />
      </button>

      {/* Answer (expandable) */}
      {expanded && (
        <div className="px-6 pb-6 pt-0 flex items-start gap-4 border-t border-white/[0.05]">
          {/* A label */}
          <span
            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mt-4"
            style={{backgroundColor: 'rgba(184,118,79,0.15)', color: '#B8764F'}}
          >
            A
          </span>

          <div className="flex-1 min-w-0 pt-4">
            <p className="text-white/60 text-sm leading-relaxed">
              {item.answer}
            </p>
            <div className="flex items-center gap-1.5 mt-2">
              <ShieldCheck className="w-3.5 h-3.5 text-accent flex-shrink-0" />
              <span className="text-xs text-accent font-medium">
                Official Response
              </span>
              {item.answeredAt && (
                <span className="text-xs text-white/30">
                  &middot; {formatDate(item.answeredAt)}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function QAEmptyState({onAskQuestion}: {onAskQuestion: () => void}) {
  return (
    <div style={{padding: '3rem 1rem', textAlign: 'center', width: '100%'}}>
      <div style={{marginBottom: '1.5rem'}}>
        <MessageCircleQuestion
          style={{
            width: '3rem',
            height: '3rem',
            color: 'rgba(255,255,255,0.25)',
            margin: '0 auto',
          }}
        />
      </div>
      <h3
        style={{
          fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
          fontWeight: 'bold',
          color: '#FFFFFF',
          marginBottom: '0.75rem',
          textAlign: 'center',
        }}
      >
        Have a Question?
      </h3>
      <p
        style={{
          fontSize: '1rem',
          color: 'rgba(255,255,255,0.5)',
          marginBottom: '1.5rem',
          maxWidth: '28rem',
          marginLeft: 'auto',
          marginRight: 'auto',
          textAlign: 'center',
          lineHeight: 1.6,
        }}
      >
        No questions yet — be the first to ask about this product!
      </p>
      <button
        type="button"
        onClick={onAskQuestion}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1.75rem',
          backgroundColor: '#00F260',
          color: '#000000',
          borderRadius: '9999px',
          fontSize: '0.9375rem',
          fontWeight: 600,
          border: 'none',
          cursor: 'pointer',
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '0.85';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '1';
        }}
      >
        Ask a Question
      </button>
    </div>
  );
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`

**Step 3: Commit**

```bash
git add app/components/qa/QASection.tsx
git commit -m "feat(qa): add QASection display component with accordion cards"
```

---

## Task 5: Add Metafield to Product GraphQL Query

**Files:**
- Modify: `app/routes/($locale).products.$handle.tsx` (PRODUCT_FRAGMENT at line 1528)

**Step 1: Add metafields to PRODUCT_FRAGMENT**

In `app/routes/($locale).products.$handle.tsx`, find the `PRODUCT_FRAGMENT` (line 1528). Add metafields request inside the `fragment Product on Product` block, after the `seo` block (around line 1578):

Find this in the fragment:
```graphql
    seo {
      description
      title
    }
```

Add after it (before the closing `}` of the Product fragment):
```graphql
    metafields(identifiers: [{namespace: "custom", key: "product_qa"}]) {
      key
      value
      type
    }
```

So the end of the fragment looks like:
```graphql
    seo {
      description
      title
    }
    metafields(identifiers: [{namespace: "custom", key: "product_qa"}]) {
      key
      value
      type
    }
  }
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`

**Step 3: Commit**

```bash
git add app/routes/\(\$locale\).products.\$handle.tsx
git commit -m "feat(qa): add product_qa metafield to product GraphQL query"
```

---

## Task 6: Integrate Tabs + Q&A into Product Page

This is the largest task. It modifies the product page to:
1. Parse Q&A metafield data
2. Add tab state (Reviews / Questions)
3. Wrap existing reviews and new Q&A in a tabbed interface
4. Wire up the AskQuestionModal

**Files:**
- Modify: `app/routes/($locale).products.$handle.tsx`

**Step 1: Add imports**

At the top of the file, add these imports (alongside existing imports around line 27-30):

```typescript
import {AskQuestionModal} from '~/components/qa/AskQuestionModal';
import {QASection, parseQAMetafield} from '~/components/qa/QASection';
```

**Step 2: Parse Q&A data in the Product component**

In the `Product()` component (line 435), after the existing `const productId = extractProductId(product.id);` line (line 472), add:

```typescript
  // Parse Q&A data from product metafield
  const qaMetafield = product.metafields?.find(
    (m: {key: string; value: string} | null) => m?.key === 'product_qa',
  );
  const qaItems = parseQAMetafield(qaMetafield?.value);

  // Q&A modal state
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
```

**Step 3: Update the Suspense/Await block for reviews to include Q&A and tabs**

Replace the existing Reviews Section block (lines 615-637) and pass Q&A props to `ProductReviewsSection`. The `<Suspense>` / `<Await>` block at line 615-637 currently renders `<ProductReviewsSection>`. Update it to also pass Q&A data:

Replace:
```tsx
              <ProductReviewsSection
                hasReviews={!!hasReviews}
                reviews={hasReviews ? resolvedReviews.reviews : []}
                rating={reviewsSummary?.rating ?? 0}
                reviewCount={actualCount || (reviewsSummary?.reviewCount ?? 0)}
                productTitle={title}
                onWriteReview={() => setReviewModalOpen(true)}
              />
```

With:
```tsx
              <ProductReviewsSection
                hasReviews={!!hasReviews}
                reviews={hasReviews ? resolvedReviews.reviews : []}
                rating={reviewsSummary?.rating ?? 0}
                reviewCount={actualCount || (reviewsSummary?.reviewCount ?? 0)}
                productTitle={title}
                onWriteReview={() => setReviewModalOpen(true)}
                qaItems={qaItems}
                onAskQuestion={() => setQuestionModalOpen(true)}
              />
```

**Step 4: Add AskQuestionModal to the page**

Right after the existing `<WriteReviewModal>` block (around line 666), add:

```tsx
      {/* Ask Question Modal */}
      <AskQuestionModal
        open={questionModalOpen}
        onOpenChange={setQuestionModalOpen}
        productHandle={product.handle}
        productTitle={title}
      />
```

**Step 5: Update ProductReviewsSection to support tabs**

Update the `ProductReviewsSection` component (line 1024) to accept Q&A props and render tabs. This is the most substantial change.

Update the component's interface and add tab state. The current signature is:
```typescript
function ProductReviewsSection({
  hasReviews,
  reviews,
  rating,
  reviewCount,
  productTitle,
  onWriteReview,
}: {
  hasReviews: boolean;
  reviews: ProductReview[];
  rating: number;
  reviewCount: number;
  productTitle: string;
  onWriteReview: () => void;
}) {
```

Change it to:
```typescript
function ProductReviewsSection({
  hasReviews,
  reviews,
  rating,
  reviewCount,
  productTitle,
  onWriteReview,
  qaItems = [],
  onAskQuestion,
}: {
  hasReviews: boolean;
  reviews: ProductReview[];
  rating: number;
  reviewCount: number;
  productTitle: string;
  onWriteReview: () => void;
  qaItems?: QAItem[];
  onAskQuestion?: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'reviews' | 'questions'>('reviews');
```

Note: You'll need to import `QAItem` type. Add at the top of the file or use the import that was added in Step 1.

**Step 6: Add tab bar UI inside ProductReviewsSection**

Inside `ProductReviewsSection`, for **both** the empty state and the has-reviews branches, add a tab bar right after the eyebrow text ("Testimonials" / "Ratings & Reviews"). The tab bar should appear inside the `<section>` tag, after the section header content.

Add this tab bar component inside the section, just before the reviews content or empty state content:

```tsx
        {/* Tab bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0.25rem',
          marginBottom: '2.5rem',
          padding: '0.25rem',
          backgroundColor: 'rgba(255,255,255,0.03)',
          borderRadius: '9999px',
          maxWidth: '20rem',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            style={{
              flex: 1,
              padding: '0.625rem 1.25rem',
              borderRadius: '9999px',
              fontSize: '0.875rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              backgroundColor: activeTab === 'reviews' ? 'rgba(255,255,255,0.08)' : 'transparent',
              color: activeTab === 'reviews' ? '#FFFFFF' : 'rgba(255,255,255,0.5)',
            }}
          >
            Reviews{reviewCount > 0 ? ` (${reviewCount})` : ''}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('questions')}
            style={{
              flex: 1,
              padding: '0.625rem 1.25rem',
              borderRadius: '9999px',
              fontSize: '0.875rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              backgroundColor: activeTab === 'questions' ? 'rgba(255,255,255,0.08)' : 'transparent',
              color: activeTab === 'questions' ? '#FFFFFF' : 'rgba(255,255,255,0.5)',
            }}
          >
            Questions{qaItems.length > 0 ? ` (${qaItems.length})` : ''}
          </button>
        </div>
```

**Step 7: Conditionally render reviews or Q&A based on active tab**

After the tab bar, wrap the existing reviews content in an `{activeTab === 'reviews' && (...)}` block, and add the Q&A section in an `{activeTab === 'questions' && (...)}` block.

For the **has-reviews** branch (the `return` that renders the rating header + reviews grid), the structure becomes:

```tsx
    {/* Tab content */}
    {activeTab === 'reviews' && (
      <>
        {/* Existing: Rating header card + reviews grid + "Write a Review" button */}
        {/* Keep all existing reviews content here unchanged */}
      </>
    )}

    {activeTab === 'questions' && (
      <div className="container-standard">
        <QASection
          questions={qaItems}
          onAskQuestion={onAskQuestion ?? (() => {})}
        />
      </div>
    )}
```

For the **empty state** branch (no reviews), similarly wrap the empty state content and add the Q&A tab:

```tsx
    {activeTab === 'reviews' && (
      <>
        {/* Existing empty state content */}
      </>
    )}

    {activeTab === 'questions' && (
      <div className="container-standard">
        <QASection
          questions={qaItems}
          onAskQuestion={onAskQuestion ?? (() => {})}
        />
      </div>
    )}
```

**Step 8: Verify it compiles and run dev server**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Run: `npm run dev` and check the product page in the browser

**Step 9: Commit**

```bash
git add app/routes/\(\$locale\).products.\$handle.tsx
git commit -m "feat(qa): integrate tabbed Reviews/Questions UI on product page"
```

---

## Task 7: Visual QA and Polish

**Files:**
- Possibly modify: any of the above files for spacing/styling fixes

**Step 1: Manual testing checklist**

Open a product page in the browser and verify:

1. Tab bar renders below the section header with "Reviews" and "Questions" tabs
2. Clicking "Questions" tab shows the Q&A empty state (since no metafield data exists yet)
3. "Ask a Question" button opens the modal
4. Modal form validates correctly (try submitting empty, then with valid data)
5. After submission, success message appears
6. "Reviews" tab still shows existing reviews correctly
7. Tab counts display correctly
8. Mobile responsive — tabs stack properly on small screens

**Step 2: Fix any visual issues found**

Apply any spacing, color, or layout fixes.

**Step 3: Final commit**

```bash
git add -A
git commit -m "fix(qa): visual polish and spacing adjustments"
```

---

## Shopify Admin Setup (Manual — Not Code)

After deployment, the store admin needs to:

1. **Create the metafield definition** in Shopify Admin:
   - Go to Settings → Custom data → Products → Add definition
   - Namespace: `custom`, Key: `product_qa`, Type: `JSON`

2. **Add test Q&A data** to a product:
   - Edit a product → Metafields → `product_qa`
   - Paste JSON:
   ```json
   [{"id":"q1","question":"Can I get this engraved with a custom date?","askedBy":"Sarah M.","askedAt":"2026-02-15","answer":"Yes! Select the engraving option when adding to cart. You can add any date or short message up to 50 characters.","answeredAt":"2026-02-16"},{"id":"q2","question":"What material is this made from?","askedBy":"Mike R.","askedAt":"2026-02-20","answer":"Our recovery tokens are made from premium zinc alloy with an antique finish. Each token weighs approximately 1 oz and measures 1.5 inches in diameter.","answeredAt":"2026-02-21"}]
   ```

3. **Set up Klaviyo flow** triggered by "Product Question Submitted" metric to get email notifications when customers submit questions.

---

## Summary

| Task | Description | Key Files |
|------|-------------|-----------|
| 1 | Validation schema | `validation.ts` |
| 2 | Submission action route | `questions.submit.tsx` |
| 3 | Ask Question modal | `AskQuestionModal.tsx` |
| 4 | Q&A display component | `QASection.tsx` |
| 5 | GraphQL metafield query | `products.$handle.tsx` |
| 6 | Tab integration on product page | `products.$handle.tsx` |
| 7 | Visual QA and polish | Various |
