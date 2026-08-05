# reCAPTCHA v3 on the Contact Form

**Date:** 2026-08-05
**Status:** Approved

## Problem

The site owner is receiving spam through the storefront's public forms. The only
defense today is a honeypot field (a hidden `website` input) on `/contact`,
`/newsletter`, `/questions/submit`, and `/reviews/submit`. There is no captcha and
no rate limiting anywhere in the app.

Honeypots stop naive bots that fill every field they find. They do nothing against
a bot that posts a crafted request directly to the action URL.

## Scope

`/contact` only.

The newsletter, product Q&A, and review endpoints keep their existing honeypot and
are not modified. The honeypot also stays on `/contact` — it is free and catches a
different class of bot than reCAPTCHA does.

### Explicitly out of scope

`/questions/submit` writes attacker-controlled text into a Shopify product
metafield that renders on public product pages, making it a content-injection and
SEO-damage vector rather than mere inbox noise. It is the higher-severity endpoint
but was scoped out of this pass by the owner. Recorded here so the decision is
traceable.

## Design

### 1. `app/lib/recaptcha.server.ts` (new)

The single module that talks to Google. Exports:

```ts
verifyRecaptcha(env, token, expectedAction, remoteIp): Promise<RecaptchaResult>
```

It POSTs to `https://www.google.com/recaptcha/api/siteverify` with the secret key
and the client token, then applies three checks in order:

1. `success === true` — the token is well-formed, unexpired, and issued for this
   secret.
2. `action === expectedAction` — without this check, a bot can harvest a
   high-scoring token from any other page using the same site key and replay it
   against `/contact`.
3. `score >= MIN_SCORE` (0.5).

The return type is a discriminated union (`{ok: true, score}` /
`{ok: false, reason, score?}`) so a caller cannot accidentally treat a failure as a
pass. Every verification logs its score so the threshold can be tuned against real
traffic without guesswork.

### 2. `app/routes/($locale).contact.tsx`

Three changes:

- **Add a `loader`** returning `PUBLIC_RECAPTCHA_SITE_KEY`. The route has no loader
  today. Putting the key here rather than in `root.tsx` keeps it out of every other
  page's payload.
- **Client:** load `https://www.google.com/recaptcha/api.js?render=<siteKey>` on
  mount, then call `grecaptcha.execute(siteKey, {action: 'contact'})` at submit
  time and inject the resulting token into the submitted form data.
- **Action:** call `verifyRecaptcha` after the honeypot check and *before* the
  Klaviyo call, so a blocked submission never costs an outbound API request.

### 3. `app/entry.server.tsx` — CSP

`createContentSecurityPolicy` is called with an explicit `scriptSrc`, which
*replaces* Hydrogen's default rather than extending it. Omitting this step makes
reCAPTCHA fail silently in production while working fine in any environment
without CSP.

- `scriptSrc` += `https://www.google.com`, `https://www.gstatic.com`
- `frameSrc` += `https://www.google.com` — v3 still mounts a hidden anchor iframe,
  and `frameSrc` is currently empty outside the `/studio` route
- `imgSrc` += `https://www.gstatic.com`

### 4. `env.d.ts` and `.env`

`PUBLIC_RECAPTCHA_SITE_KEY` and `RECAPTCHA_SECRET_KEY`, both declared optional to
match the existing convention for integration keys in this codebase.

## Failure behavior

| Condition | Result | Rationale |
|---|---|---|
| Score < 0.5, action mismatch, or malformed token | Blocked, error shown | The chosen threshold (Google's default) |
| Token missing from submission | Blocked, error shown | A bot posting directly to `/contact` sends no token; this is the main attack being closed |
| Keys not configured | Accepted, console warning | Matches the existing Klaviyo-not-configured path in the same action; a missing env var on deploy must not take down the contact form |
| Google unreachable or returns 5xx | Accepted, error logged | A Google outage silently costing real customer inquiries is worse than a few spam messages arriving |

### Known tradeoff

Privacy extensions (uBlock Origin, Firefox strict mode, Brave) block reCAPTCHA.
Those users receive no token and are therefore blocked. Blocking on a missing token
is what gives this feature its value — a bot simply omits the field — but it is not
free.

Mitigation: the error message names the likely cause and points at the
`support@custommilestones.com` mailto already present on the page, so a blocked
human retains a path to the business.

## Legal requirement

reCAPTCHA's terms of service require either the visible badge or an equivalent
disclosure. The floating badge clashes with the dark theme, so it is hidden via CSS
and replaced with the standard disclosure text beneath the submit button, linking
Google's Privacy Policy and Terms of Service. Styled as `text-white/40` helper text
per the design system.

## Verification

The repository has no test runner configured (only `eslint-plugin-jest`; zero test
files exist), so verification is typecheck, lint, and manual exercise:

- `npm run typecheck`
- `npm run lint`
- Submit as a normal user — passes, Klaviyo event fires
- Submit with the reCAPTCHA script blocked — blocked, actionable error shown
- `curl -X POST /contact` with no token — blocked
- Watch the browser console for CSP violations, the likeliest silent failure mode

## Limitations

reCAPTCHA v3 scores browser-session behavior. It does not stop human-driven spam
farms or a determined operator driving a real browser. If spam persists after this
ships and the messages read as hand-written, per-IP rate limiting on the action is
the more effective next control.

## Owner setup required

Register the site at <https://www.google.com/recaptcha/admin> as **reCAPTCHA v3**,
add the production domain plus `localhost`, then set `PUBLIC_RECAPTCHA_SITE_KEY`
and `RECAPTCHA_SECRET_KEY` in `.env` for local development and in the Oxygen
environment variables in the Shopify admin for deployed environments.

Until those are set, the contact form continues to work with honeypot-only
protection and logs a warning.
