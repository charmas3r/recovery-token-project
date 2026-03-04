# Product Q&A Feature Design

## Overview

Add a Questions & Answers section to the product detail page, tabbed alongside existing reviews. Customers can submit questions via a form; the store admin reviews and publishes answers via Shopify product metafields. Submissions trigger Klaviyo notifications.

## Requirements

- Customer-facing question submission form on product pages
- Admin-only answers (managed in Shopify admin)
- Tabbed UI: Reviews tab + Questions tab (sharing one section)
- Dark theme, matching existing review cards aesthetic
- Klaviyo notification on new question submission

## Data Model

**Shopify product metafield:** `custom.product_qa` (type: `json`)

```json
[
  {
    "id": "q1",
    "question": "Can I get this engraved with a custom date?",
    "askedBy": "Sarah M.",
    "askedAt": "2026-02-15",
    "answer": "Yes! Select the engraving option when adding to cart.",
    "answeredAt": "2026-02-16"
  }
]
```

- Managed in Shopify admin via product metafield editor
- Only entries with both `question` and `answer` display on storefront
- Fetched via Storefront API in product loader (added to PRODUCT_QUERY metafields)

## Architecture

### Display Flow

```
Product Loader (server)
  → Storefront API: product.metafields[custom.product_qa]
  → Parse JSON → filter to answered questions
  → Pass to ProductReviewsSection (now tabbed)
```

### Submission Flow

```
AskQuestionModal (client form)
  → useFetcher POST → /questions/submit action route
  → Zod validation + honeypot check
  → Klaviyo createEvent("Product Question Submitted")
  → Admin gets notified → adds Q&A to metafield in Shopify admin
```

## UI Design

### Tabbed Section

The existing `ProductReviewsSection` becomes a tabbed container:

**Tab bar:** Two pill-style tabs at section top
- "Reviews (12)" / "Questions (3)" with count badges
- Active tab: `bg-white/[0.08]` with accent bottom border
- Inactive tab: `text-white/50` with `hover:text-white/70`

**Tab 1 — Reviews:** Current reviews content (unchanged)

**Tab 2 — Questions:** Accordion-style Q&A cards
- Question text + asker name + date
- Expandable answer with "Official Response" badge
- "Ask a Question" button at top-right

### Q&A Card Design

```
┌──────────────────────────────────────────┐
│ Q  Can I get this engraved?              │
│    Sarah M. · Feb 15, 2026               │
│                                          │
│ A  Yes! Select the engraving option...   │
│    ✓ Official Response · Feb 16, 2026    │
└──────────────────────────────────────────┘
```

- Dark gradient card (`linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)`)
- `border-white/[0.08]` border
- Question in `text-white`, answer in `text-white/50`
- "Q" and "A" labels with accent color

### Ask a Question Modal

Same pattern as `WriteReviewModal`:
- Fields: Name, Email, Question (textarea)
- Honeypot spam protection
- Zod validation
- Success state: "Your question has been submitted! We'll notify you when it's answered."

### Empty State

"No questions yet — be the first to ask about this product!"
with "Ask a Question" CTA button.

## Files

| File | Action | Purpose |
|------|--------|---------|
| `app/routes/($locale).products.$handle.tsx` | Modify | Add metafield to PRODUCT_QUERY, add tabs to reviews section, pass Q&A data |
| `app/components/qa/QASection.tsx` | Create | Q&A accordion display + empty state |
| `app/components/qa/AskQuestionModal.tsx` | Create | Question submission modal |
| `app/routes/($locale).questions.submit.tsx` | Create | Action route: validate + send Klaviyo event |
| `app/lib/validation.ts` | Modify | Add `questionFormSchema` |

## Validation Schema

```typescript
const questionFormSchema = z.object({
  name: z.string().min(2, 'Name is required').max(100),
  email: z.string().email('Valid email required'),
  question: z.string().min(10, 'Question must be at least 10 characters').max(1000),
  productHandle: z.string().min(1),
  productTitle: z.string().min(1),
  honeypot: z.string().max(0, 'Bot detected'),
});
```

## Klaviyo Event

```typescript
klaviyo.createEvent({
  event: 'Product Question Submitted',
  email: data.email,
  firstName: data.name.split(' ')[0],
  properties: {
    product_title: data.productTitle,
    product_handle: data.productHandle,
    question: data.question,
    submitted_at: new Date().toISOString(),
    source: 'Product Page Q&A',
  },
  uniqueId: `question-${data.email}-${Date.now()}`,
});
```

## Shopify Admin Setup Required

1. Create product metafield definition:
   - Namespace: `custom`
   - Key: `product_qa`
   - Type: `json`
2. Set up Klaviyo flow triggered by "Product Question Submitted" event
3. Add Q&A entries to products via metafield editor

## Trade-offs

- **Manual answer workflow:** Admin must add answers to metafield manually. This is intentional — ensures quality and brand consistency.
- **No real-time question display:** Submitted questions don't appear until admin publishes answer. Avoids moderation complexity.
- **JSON metafield limits:** Shopify metafields have a 512KB limit. Sufficient for ~500+ Q&A entries per product.
