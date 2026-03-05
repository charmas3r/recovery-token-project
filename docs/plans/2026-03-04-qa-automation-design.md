# Q&A Automation Design

## Goal

Automate the product Q&A workflow so admins can answer customer questions from their email inbox via a one-click answer link, instead of manually editing Shopify metafields.

## Architecture

When a customer submits a question:

1. **Save** the question (unanswered) to the product's `custom.product_qa` metafield via Shopify Admin API
2. **Notify** admin via Klaviyo event, including a signed answer link
3. Admin clicks the link, lands on a simple answer form
4. Submitting the answer updates the metafield via Admin API
5. The answered question appears on the product page on next load

## Data Flow

```
Customer submits question
        │
        ▼
questions.submit action
   ├── Validate with Zod
   ├── Save to product metafield (unanswered, via Admin API)
   └── Send Klaviyo event (includes answer link with HMAC-signed token)
        │
        ▼
Admin gets email notification
   └── Clicks answer link:
       /admin/qa/answer?product=handle&qid=q_abc123&token=hmac_signature
        │
        ▼
Answer page
   ├── Verify HMAC token (rejects expired/tampered links)
   ├── Fetch current metafield via Admin API
   ├── Display question + answer textarea
   └── Submit → Update metafield with answer via Admin API
        │
        ▼
Answer visible on product page (QASection filters to answered-only)
```

## Components

### New Files

1. **`app/lib/shopify-admin.server.ts`** — Shopify Admin API client
   - `getProductMetafield(productHandle, namespace, key)` — fetch current metafield value
   - `setProductMetafield(productId, namespace, key, value)` — upsert metafield
   - Uses existing `PRIVATE_STOREFRONT_API_TOKEN` and `PUBLIC_STORE_DOMAIN`

2. **`app/lib/qa-tokens.server.ts`** — HMAC token generation/verification
   - `generateAnswerToken(productHandle, questionId)` — creates signed URL token
   - `verifyAnswerToken(token, productHandle, questionId)` — verifies token validity
   - Uses `SESSION_SECRET` for HMAC-SHA256 signing
   - Tokens expire after 7 days

3. **`app/routes/admin.qa.answer.tsx`** — Admin answer page
   - **Loader:** Verify HMAC token, fetch product metafield, find the question by ID
   - **Action:** Validate answer text, update metafield with answer + timestamp
   - **UI:** Simple dark-themed form showing product name, customer question, answer textarea
   - No login required — signed URL is authentication

### Modified Files

4. **`app/routes/($locale).questions.submit.tsx`** — Enhanced submission
   - After validation, save question to product metafield via Admin API
   - Generate signed answer link
   - Include answer link URL in Klaviyo event properties
   - Question stored as unanswered (empty `answer` field)

### Unchanged

5. **`app/components/qa/QASection.tsx`** — No changes needed
   - Already filters to only display items with non-empty `answer`

## Metafield Data Format

Unchanged from current design. Unanswered questions have empty `answer`:

```json
[
  {
    "id": "q_1709568000000",
    "question": "What size is this token?",
    "askedBy": "Sarah",
    "askedAt": "2026-03-04",
    "answer": "",
    "answeredAt": ""
  },
  {
    "id": "q_1709481600000",
    "question": "Can I customize the engraving?",
    "askedBy": "Mike",
    "askedAt": "2026-03-03",
    "answer": "Yes! You can add years, name, and clean date.",
    "answeredAt": "2026-03-03"
  }
]
```

## Security

- Answer links use HMAC-SHA256 signed with `SESSION_SECRET`
- Token payload: product handle + question ID + expiry timestamp
- Tokens expire after 7 days
- Links are scoped to a single product and single question
- No additional login or auth system required

## Klaviyo Event Properties

The `Product Question Submitted` event will include:

| Property | Example |
|----------|---------|
| `product_title` | The Mandala Token |
| `product_handle` | the-mandala-token |
| `question` | What size is this token? |
| `customer_name` | Sarah |
| `answer_url` | https://yourstore.com/admin/qa/answer?product=the-mandala-token&qid=q_123&token=abc |
| `submitted_at` | 2026-03-04T12:00:00Z |

The Klaviyo flow email template should include the `answer_url` as a button/link.

## Answer Page UI

Minimal dark-themed page matching site design:
- Product name header
- Customer name and question displayed
- Textarea for answer (min 10 chars)
- Submit button
- Success state confirming the answer is live
- Error state if token is expired/invalid

## Decisions

- **Hidden until answered**: Unanswered questions are stored but not displayed
- **Signed URL auth**: No login system — HMAC token is the access control
- **7-day expiry**: Answer links expire after a week (question stays in metafield, admin can request new link or edit in Shopify)
- **Admin API via existing token**: Uses `PRIVATE_STOREFRONT_API_TOKEN` already available
