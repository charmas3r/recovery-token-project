# Stage D — Ad-Landing Template — Scorecard

**Target:** A lean, conversion-shaped, Meta-ad-safe landing system for cold paid/social traffic — distinct from the content-deep SEO pages. Reusable + data-driven (`/lp/$handle`), minimal chrome, seeded with one recovery-gift landing.
**Max iterations:** 9 · **Accept:** in-scope gates pass AND weighted quality ≥ 4.0 (no dim < 3).
**Dominant rubric items:** Q4 (leanness + Meta safety), Q3 (conversion craft), Q6 (responsive) + gates G1, G6.

| In-scope gate | Meaning |
|---|---|
| G1 | typecheck + lint: no NEW errors |
| G6 | landing route loads with no NEW console errors at mobile + desktop |

**Locked direction:** data-driven `/lp/$handle` route + small landings data file; minimal chrome (logo + CTA, no full nav/footer); dark premium; ONE seeded recovery-gift landing; dominant CTA into `custom-token`; **Meta-ad-safe copy (gift framing, NO addiction/recovery-explicit claims)**; trust/reviews + gift reassurance; fast.

---

<!-- Iterations appended below -->

## Iteration 1 — Stage D (ad-landing template) — 2026-06-24 — orchestrator-verified

*(Generator delivered; evaluator step completed by orchestrator via Bash + live Playwright, given subagent delivery flakiness this session.)*

**Files created:** `app/routes/($locale).lp.$handle.tsx` (data-driven route, 404 on bad handle, `noIndex` fallback), `app/data/ad-landings.ts` (typed `AdLanding` schema + Meta-policy doc note + seeded `recovery-gift`), `app/components/landing/AdLandingTemplate.tsx` (lean template). **Modified:** `app/root.tsx` — added `isLanding` (`/lp/*`) branch that renders `<Outlet/>` with no global nav/footer (mirrors `/studio`).

**Hard gates:**
- **G1 ✅** typecheck shows no errors referencing the Stage D files; `eslint` on the three new files clean.
- **G6 ✅** Live console on `/lp/recovery-gift` = only the KNOWN pre-existing set (CSP blocks Google Fonts, `consent.checkoutDomain` / `PUBLIC_CHECKOUT_DOMAIN`, PostHog connect blocked by CSP — the latter retry-loops, inflating the count). No NEW error types; notably no `<div> in <p>` hydration error (no ProductItem/Money on this route). These clear with Stage B's CSP fix + env ops.

**Quality (live Playwright):**
- **Q4 Leanness + Meta safety — 5.** `document.querySelectorAll` confirms **headerCount=1, footerCount=1, navCount=0** → minimal chrome, NO double-chrome (the `isLanding` strip works). Single gift-framed offer; copy is Meta-ad-safe (gift framing, no "addiction"/treatment/clinical language; the lone recovery reference is a customer gift story). `noIndex` keeps it out of organic SERPs (no dup-content with SEO pages).
- **Q3 Conversion craft — 5.** Primary "Design their coin" CTA at **375×667 measured top=512, bottom=560 → above the fold**; bg `rgb(255,255,147)` + color `rgb(0,0,0)` = `#FFFF93`+black ≈ **20:1 (AAA)**; posts into `/custom-token?index`. Trust bar + rating reassurance under CTA, how-it-works (3 steps), gift reassurance, testimonial, short FAQ, repeated final CTA.
- **Q6 Responsive — 5.** Inline styles + `clamp()` typography + flex/grid with `sm:` breakpoints; 375 verified clean and above-fold; no fixed-width overflow.

**Weighted = (5×3 + 5×2 + 5×2)/7 = 35/7 = 5.0** → **ACCEPT.** Screenshot: `stage-d-lp-375-abovefold.png`.

### 🔴 Cross-stage regression caught & fixed during this stage
The flaky **Stage B generator reverted `app/root.tsx` to HEAD**, silently undoing Stage A's brand fix in that file (the JSON-LD Organization). Detected here: `root.tsx:250-251` had reverted to `name: 'Coinplugz'` / `url: 'https://coinplugz.com'` (`grep -ri coinplugz app/` = 2). Orchestrator fixed both lines → Custom Milestones / custommilestones.com; **`grep -ri coinplugz app/` now = 0** (Stage A gates G2/G3 restored). Lesson: a hard-gate regression check should re-run `grep coinplugz app/` after any stage that touches `root.tsx`.

## ✅ STAGE D ACCEPTED — orchestrator sign-off
Reusable `/lp/$handle` ad-landing system + seeded `recovery-gift` landing: minimal-chrome, above-the-fold AAA-contrast CTA into the engraving funnel, Meta-ad-safe, `noindex`. Weighted 5.0, gates pass. Note: footer policy links (`/policies/privacy-policy`, `/policies/refund-policy`) depend on Shopify policies being published (pending in LAUNCH-PLAN); `/pages/contact` may need a Shopify page or repoint to `/contact`.
