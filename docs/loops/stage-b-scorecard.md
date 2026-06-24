# Stage B — Tracking Install — Scorecard

**Target:** Add GA4 + Meta Pixel (consent-gated, env-driven, graceful no-op when unset) + standard storefront events + CSP fix, in `app/root.tsx`.
**Max iterations:** 9 · **Accept:** in-scope gates pass AND weighted quality ≥ 4.0 (no dim < 3).
**Dominant rubric items:** gates G1, G5, G6.

| In-scope gate | Meaning |
|---|---|
| G1 | typecheck + lint: no NEW errors |
| G5 | GA4 + Meta Pixel present in `root.tsx`, consent-gated, fire when env IDs are configured (no-op when absent); env-driven, not hardcoded |
| G6 | site loads with no NEW console/CSP errors; CSP must NOT block the storefront, fonts, PostHog, GA, or Meta |

**Env vars introduced (user populates later):** `PUBLIC_GA4_MEASUREMENT_ID`, `PUBLIC_META_PIXEL_ID`, (`META_CONVERSIONS_API_TOKEN` — secret, only if server-side events are wired).

**Architecture note:** Hydrogen checkout is off-domain (Shopify), so the storefront fires PageView/ViewContent/AddToCart/InitiateCheckout. **Purchase conversion is an ops task** (Shopify Meta/Google sales channel or Customer Events), NOT faked in storefront code.

---

<!-- Iterations appended below -->
