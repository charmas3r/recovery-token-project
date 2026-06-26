# Conversion Strategy — GA4 Event Tracking & CRO

This document is the tracking contract and the plan for turning the GA4 data into
conversion lift. It reflects the events the storefront **actually fires** as of the
`claude/analytics-event-tracking-audit-yuu458` branch (verified live where reachable).

## How the tracking works (architecture)

GA4 receives events through two paths, both consent-gated by `MarketingScripts.tsx`
(`window.gtag` is only defined after analytics consent, so everything below no-ops until
the visitor consents):

- **Ecommerce funnel** — `app/components/analytics/GoogleAnalytics.tsx` mirrors the
  PostHog bridge: it subscribes to Hydrogen's auto-published analytics events and maps
  each to a GA4 recommended event. `app/lib/ga4.ts` (`trackEvent`, `toGa4Items`) is the
  single chokepoint for `window.gtag`.
- **Custom actions** — UI flows call `trackEvent(name, params)` at their client-side
  success/trigger points.
- **`page_view`** — single-sourced in `MarketingScripts.tsx` (do not also emit from the
  bridge; that would double-count).

---

## Event dictionary (the tracking contract)

### Ecommerce funnel (GA4 recommended events)
| Event | Trigger | Key params | Status |
|---|---|---|---|
| `page_view` | every route change | `page_path` | MarketingScripts (existing) |
| `view_item` | product page view | `items[]`, `value`, `currency` | ✓ live-verified |
| `view_item_list` | collection / `/collections/all` view | `item_list_id`, `item_list_name` | ✓ live-verified |
| `search` / `view_search_results` | search performed | `search_term`, `result_count` | wired |
| `view_cart` | cart aside opened | `items[]`, `value`, `currency` | ✓ live-verified (1×/open in prod) |
| `add_to_cart` | add to cart | `items[]` (added line), `value`, `currency` | ✓ live-verified (fires once) |
| `remove_from_cart` | cart quantity decreased | `items[]`, `value`, `currency` | wired (cart_updated, decrease only) |
| `begin_checkout` | checkout CTA click | `items[]`, `value`, `currency` | ✓ live-verified |
| `purchase` | — | — | **NOT storefront-fireable** — see "Purchase tracking" |

### Custom action events
| Event | Trigger | Params | Status |
|---|---|---|---|
| `custom_token_start` | custom-token path chosen | `{path}` (we-design/you-design) | ✓ live-verified |
| `custom_token_step` | each wizard step advanced | `{path, step}` | wired (10 steps) |
| `newsletter_signup` | newsletter success (footer + article) | `{location}` | wired |
| `generate_lead` | contact form success | — | wired |
| `add_to_wishlist` / `remove_from_wishlist` | wishlist heart toggle | `{item_id, item_name}` | wired |
| `personalization_applied` | engraving confirmed | `{item_id}` | wired |
| `submit_review` / `submit_question` | review/question submitted | — | wired |
| `login` / `sign_up` | — | — | **NOT wired** — auth is an off-site OAuth redirect with no client trigger; capture server-side (see below) |

---

## Purchase tracking (the missing funnel step)

Checkout and the thank-you page run on Shopify's domain, so storefront code **cannot**
fire `purchase`. Close the funnel inside the same GA4 property by enabling one of:

1. **Shopify Customer Events (web pixel)** — Settings → Customer events → add a custom
   pixel that forwards `checkout_completed` to GA4 as `purchase` using the **same**
   `PUBLIC_GA4_MEASUREMENT_ID`. This is the recommended path: it captures real order value
   and items at the moment of purchase.
2. **Google & YouTube sales channel** — connects the GA4 property and auto-configures
   purchase + conversion tracking.

Use the same measurement ID so `begin_checkout → purchase` is one continuous funnel.
`login`/`sign_up` are best captured here too (Shopify customer events), not from the
storefront.

---

## Funnels to build in GA4 (Explore → Funnel exploration)

1. **Primary purchase funnel**
   `view_item → add_to_cart → view_cart → begin_checkout → purchase`
   Watch the **`begin_checkout → purchase`** step closely — it spans the off-domain
   hand-off and is historically the biggest leak.

2. **Custom-token funnel** (high-intent, high-margin)
   `custom_token_start → custom_token_step (×N) → add_to_cart → purchase`
   Break down by `path` (we-design vs you-design). Use `custom_token_step`'s `step` param
   to find which step abandons.

3. **Engagement → conversion**
   `newsletter_signup` / `add_to_wishlist` as leading indicators; segment later purchasers
   by whether they hit these.

---

## Common-path analysis

- **Path exploration** (Explore → Path exploration): start from `session_start` or
  `view_item` and read the most common next steps; start from `begin_checkout` going
  backward to see what precedes intent.
- **Landing-page paths**: ad-landing routes are `noindex`; segment their journeys
  separately from organic.
- Use the `page_view` stream + the event stream together — events tell you *what*, the
  page path tells you *where*.

---

## Prioritized CRO actions (experiment backlog)

Ranked by expected impact × inverse effort. Each is a hypothesis to validate against the
new data before building.

| # | Hypothesis (validate in GA4 first) | Experiment | Impact | Effort |
|---|---|---|---|---|
| 1 | `begin_checkout → purchase` leaks (off-domain hand-off) | Enable Shopify purchase tracking, then A/B express-checkout / trust reinforcement on the cart | High | Low |
| 2 | Custom-token wizard abandons at a specific `step` | Identify the drop step via `custom_token_step`, then simplify that step (fewer fields, clearer copy) | High | Med |
| 3 | Engraving friction suppresses `add_to_cart` | Compare add-to-cart rate for products with vs without engraving; streamline `personalization_applied` flow | Med | Med |
| 4 | `view_item → add_to_cart` weak on certain products | Surface reviews/trust badges above the fold on low-converting PDPs | Med | Low |
| 5 | `view_cart`/`begin_checkout` gap | Reduce cart→checkout friction (shipping clarity, fewer steps) | Med | Low |
| 6 | Wishlist/newsletter signups don't convert later | Lifecycle email targeting `add_to_wishlist` + `newsletter_signup` segments | Med | Med |

**Working method:** read the funnels weekly, pick the largest drop-off, form a hypothesis,
ship one change, measure the same funnel step. The event contract above is what makes each
of these measurable.

---

## Verification checklist (for QA / future changes)

- GA4 DebugView (or Network `g/collect`, `en=` param) shows each event with its params.
- No events fire before analytics consent (gtag undefined → `trackEvent` no-ops).
- Exactly one `page_view` per navigation.
- `add_to_cart` fires once per add (no `cart_updated` duplicate); `view_cart` once per open.
- PostHog events unchanged (regression check on `PostHogAnalytics.tsx`).
- After enabling Shopify purchase tracking: `begin_checkout → purchase` completes in GA4.
