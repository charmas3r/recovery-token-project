# Initial Project Research Doc — Recovery Token Store (Shopify Hydrogen → Oxygen)

Date: 2026-01-23

## Product summary
An ecommerce storefront selling **recovery tokens** (physical products) that celebrate sobriety/abstinence milestones. Built on **Shopify Hydrogen** (Remix-based) and deployed to **Oxygen** (Shopify edge runtime). Primary goals: **excellent Core Web Vitals**, **beautiful UI**, and **tasteful, performant motion**.

---

## Development workflow (Hydrogen setup & practices)

### Initial setup (Shopify CLI + Hydrogen)
Hydrogen projects are scaffolded and managed via **Shopify CLI**.

Typical bootstrap:
1. **Install Shopify CLI**: `npm install -g @shopify/cli`
2. **Create Hydrogen app**: `shopify hydrogen init` (or use a Hydrogen template/starter)
3. **Connect to Shopify store**: configure Storefront API credentials in `.env`

### Local development
- **`npm run dev`** (or `shopify hydrogen dev`): starts Vite dev server with HMR.
- **Mock data vs live store**: decide early whether to use a real Shopify store for dev or Shopify's mock.shop for initial UI work.
- **GraphQL playground**: use Shopify's GraphiQL or a standalone client to test Storefront API queries before integrating.

### Environment variables (required for local dev)
Create `.env` (gitignored) with:
- `PUBLIC_STOREFRONT_API_TOKEN`: Shopify Storefront API token (public, read-only)
- `PUBLIC_STORE_DOMAIN`: your `*.myshopify.com` domain
- `SESSION_SECRET`: for cart/session encryption
- Third-party keys: `JUDGEME_PUBLIC_TOKEN`, `RESEND_API_KEY`, CMS credentials, etc.

Suggestion: maintain a `.env.example` with placeholder values for the team.

### Storefront API versioning
- Shopify versions the Storefront API (e.g., `2024-10`, `2025-01`).
- Pin the version in your Hydrogen config (typically in the createStorefrontClient call).
- Plan periodic upgrades; Shopify provides migration guides for breaking changes.

### Deployment (Oxygen)
Hydrogen apps deploy to **Oxygen** via:
- **Shopify CLI**: `shopify hydrogen deploy` (manual)
- **GitHub integration**: connect repo to Shopify; auto-deploys on push to main (recommended for CI/CD)

Oxygen features:
- **Preview environments**: automatic preview URLs for PRs (if GitHub integration is enabled)
- **Edge caching**: configure cache headers in loaders; Oxygen respects standard HTTP caching
- **Environment variables**: set production secrets in Shopify admin (Hydrogen channel settings)

### Oxygen vs local differences
- **Edge runtime**: Oxygen runs on a V8 isolate (similar to Cloudflare Workers); avoid Node.js-specific APIs.
- **Cold starts**: typically very fast, but test performance-critical paths.
- **Logs**: view logs in Shopify admin (Hydrogen channel) or integrate external observability (Sentry).

### CI/CD recommendations
- **Lint + type-check**: run ESLint, TypeScript, and Prettier in CI before merge.
- **Unit tests**: Vitest for utilities/components.
- **E2E tests**: Playwright for critical paths (optional in CI; often run on-demand due to runtime).
- **Preview deploys**: use Oxygen's GitHub integration for PR previews; review UI changes before merging.

---

## Recommended tech stack (opinionated, Hydrogen-friendly)

### Platform & runtime
- **Shopify**: Products/variants, inventory, discounts, shipping, tax, checkout.
- **Hydrogen (Remix)**: Server-rendered React storefront with loaders/actions, nested routes, streaming, and built-in Storefront API patterns.
- **Oxygen**: Edge hosting for Hydrogen, with caching primitives and low latency.

### Language & tooling
- **TypeScript** (strict): enforce correctness across Storefront API responses and UI.
- **Vite** (Hydrogen default): fast dev + optimized builds.

### GraphQL + TypeScript (critical for Hydrogen DX)
For a type-safe Hydrogen storefront, you have two options for generating TypeScript types from Shopify's Storefront API schema.

Why this is critical:
- Hydrogen uses GraphQL heavily for all Storefront API queries.
- Without codegen, you lose type safety for product data, cart operations, and collections.
- Codegen auto-generates types from your actual queries, so TypeScript catches breaking changes.

**Option 1: Shopify CLI built-in (recommended for simplicity)**
- **`shopify hydrogen codegen`**: Shopify CLI now includes built-in type generation
- Generates types directly from your `.graphql` files
- Zero additional configuration if you follow Hydrogen conventions
- Best for standard Hydrogen patterns and getting started quickly

**Option 2: GraphQL Codegen (for advanced customization)**
If you need more control over type generation or custom plugins:
- **`@graphql-codegen/cli`**: core codegen tool
- **`@graphql-codegen/typescript`**: generates base TypeScript types
- **`@graphql-codegen/typescript-operations`**: generates types for your specific queries/mutations
- **`@graphql-codegen/typed-document-node`**: generates typed DocumentNode exports

**Decision guide**:
- Start with **Shopify CLI built-in** unless you have specific needs.
- Switch to manual GraphQL Codegen only if you need custom plugins, non-Shopify GraphQL sources, or advanced type transformations.

Typical workflow (either approach):
1. Write GraphQL queries in `.graphql` files (or colocate in components).
2. Run codegen to generate types (manual, watch mode, or pre-commit hook).
3. Import generated types in loaders/components for full type safety.

### Styling
- **Tailwind CSS**: best speed-to-quality ratio for storefront UI; good bundle characteristics when purged; easy to keep consistent spacing/typography.
- **clsx** + **tailwind-merge**: reliable conditional class composition without duplicates.

Alternative (if you prefer “typed styles”): **vanilla-extract** (excellent for large design systems, more setup).

### UI component strategy (best practice for modern storefronts)
Use **headless/primitives** + your own design tokens, rather than a heavy monolithic UI kit.

- **Radix UI** (primitives): accessibility-first popovers, dialogs, menus, tabs, etc.
- **shadcn/ui** approach (recommended): copy-in components built on Radix + Tailwind; you own the code, avoid vendor lock-in; easy to theme.
- **Icons**: **lucide-react** (small, consistent, widely used).

Notes:
- **Shopify Polaris** is great for *admin apps*, but usually not ideal for a bespoke storefront brand.
- Hydrogen already includes common storefront components; use them when they fit (e.g., SEO helpers, image optimization utilities).

### Animation & motion (performance first)
Principle: prefer **CSS transforms/opacity** and **Web Animations** for common interactions; use a JS animation library only when needed.

Recommended options:
- **Framer Motion**: best DX for route/page transitions, presence animations, shared layout; heavier bundle—use selectively.
- **Motion One** (`motion`): lightweight Web Animations API wrapper; great for micro-interactions.

Only if you need “hero”/marketing-level motion:
- **GSAP**: extremely capable; larger footprint and easier to overuse—keep behind route-based code-splitting.

Motion best practices:
- Animate **transform/opacity**, avoid layout thrash.
- Respect **`prefers-reduced-motion`** (provide reduced/no-motion variants).
- Avoid animating during SSR hydration (use `useEffect` gates when necessary).

### Data fetching, caching, and performance
- Storefront data via **Shopify Storefront API** (GraphQL).
- Use **Remix loaders** for server data and keep client state minimal.
- Lean on Oxygen/Hydrogen caching patterns:
  - cache product pages aggressively where safe (long TTL + revalidation strategy).
  - cache cart/checkout carefully (often private / short-lived).

Performance staples:
- Prefer route-based code splitting (heavy UI/animation code only on pages that need it).
- Use `prefetch="intent"` (or equivalent Hydrogen/Remix link prefetching) for snappy navigation.
- Use Shopify CDN images and responsive sizing; keep LCP image optimized.

### Cache-Control & Revalidation Strategy (critical for Oxygen)
Oxygen respects standard HTTP caching headers, but stale data is the biggest pain point in Hydrogen storefronts.

**Cache strategy by page type:**

Product Detail Pages (PDP):
```http
Cache-Control: public, max-age=3600, stale-while-revalidate=86400
```
- **Reasoning**: Product data changes infrequently (price/inventory updates are handled separately). Serve cached version for 1 hour, allow stale content for 24 hours while revalidating in background.
- **Stale data mitigation**: Use Shopify webhooks (product/update, inventory/update) to purge Oxygen cache when critical data changes.

Collection/Listing Pages:
```http
Cache-Control: public, max-age=1800, stale-while-revalidate=3600
```
- **Reasoning**: Collections change more frequently (new products, sorting). Cache for 30 minutes, revalidate within 1 hour.

Homepage/Marketing Pages:
```http
Cache-Control: public, max-age=600, stale-while-revalidate=1800
```
- **Reasoning**: Content changes frequently during campaigns. Cache for 10 minutes, revalidate within 30 minutes.

Cart/Checkout (user-specific):
```http
Cache-Control: private, max-age=0, must-revalidate
```
- **Reasoning**: Never cache user-specific data at the edge.

**Sub-request caching:**
- Use Hydrogen's `CacheNone()`, `CacheShort()`, `CacheLong()`, `CacheCustom()` utilities in loaders.
- Prefer `CacheLong()` for product queries that change infrequently.
- Use `CacheNone()` for cart/checkout and personalized content.

**Webhook-based cache purging (limited applicability):**
- **Important caveat**: Oxygen's full-page cache cannot be purged via webhooks for the deployed worker. Webhook-based purging works for your own application-layer caches (e.g., key-value stores, Redis) or GraphQL query caches, but not Oxygen's edge HTTP cache.
- If you need to invalidate data immediately, you must redeploy; otherwise, rely on TTL + stale-while-revalidate.
- Do NOT plan webhook purging as your primary cache invalidation strategy for Oxygen full-page cache.

**Primary production strategy (TTL + Stale-While-Revalidate):**
- **Recommended**: Rely on TTL-based caching with conservative max-age + stale-while-revalidate values as your primary mechanism.
- Use short TTL for frequently-changing content (homepage: 10 min; collections: 30 min; PDP: 1 hour).
- Stale-while-revalidate allows serving slightly stale content while background revalidation happens, improving resilience.
- This approach is simpler to reason about and doesn't require redeploys for cache invalidation.

**Shopify webhooks (optional, for app-layer caches only):**
- Set up Shopify webhooks (`products/update`, `products/delete`, `inventory_levels/update`) if you implement your own application-level caching layer (e.g., in-memory caches or external KV stores).
- Create a Remix action route (e.g., `/webhooks/shopify`) to validate webhook signatures and purge *your app's* caches.
- Do NOT rely on webhooks to purge Oxygen's edge cache; they won't affect it.

### Landing page video (Shopify Files) — recommended conventions
For this project, host landing videos in **Shopify Admin → Content → Files** and treat them like other CDN-served static assets.

Rules of thumb:
- **Poster-first**: the hero’s LCP should be an **optimized image poster**, not the video.
- **Lazy attach**: only load/attach the `<video>` when near viewport (or after first paint/idle).
- **Autoplay safely (background video only)**: `muted`, `playsInline`, `loop`, no audio UI.
- **Preload discipline**: default to `preload="none"` (or `"metadata"` if you must reduce start delay).
- **Reduced motion**: if `prefers-reduced-motion: reduce`, render poster only (or require click-to-play).
- **Encoding expectations** (since you’re optimizing manually): upload MP4 (H.264) as baseline; optionally add WebM as an additional source.

Practical implementation notes:
- Store the video URL in a **theme setting** or **metaobject** (so marketing can swap it without code).
- Render poster image via Shopify CDN image tooling; layer video behind text with a gradient overlay for contrast.
- Keep the file **short + low bitrate**; treat it as “motion texture”, not long-form content.

### Image & Video LCP Optimization (preventing layout shift & premium feel)

**The Challenge:**
Hydrogen's `<Image />` component is powerful, but without careful handling of aspect ratios and placeholders, you'll get Cumulative Layout Shift (CLS) and a janky loading experience.

**Critical implementation requirements:**

**1. Aspect Ratio Discipline (prevents CLS)**
- **Always** provide explicit `width` and `height` props to `<Image />` component
- This reserves space in the layout before the image loads
- Use Shopify's image metadata (available in Storefront API) to get dimensions

**2. Placeholder Strategy (premium feel during load)**

**Option A: Blurhash (recommended for premium feel)**
- Generate blurhash strings for product images (can be done server-side or at build time)
- Store blurhash in Shopify metafields or CMS
- Render blurhash placeholder before full image loads
- **Pros**: Looks premium, gives preview of image, smooth transition
- **Cons**: Requires blurhash generation step, slightly more complex

**Option B: Dominant Color (simpler alternative)**
- Extract dominant color from image (via image analysis tool or manually)
- Store hex color in Shopify metafields
- Show solid color background before image loads
- **Pros**: Simple, no additional dependencies, good enough for most use cases
- **Cons**: Less sophisticated than blurhash

**Option C: Low-Quality Image Placeholder (LQIP)**
- Generate ultra-small version of image (e.g., 20x20px)
- Base64 encode and inline in HTML
- Use as background while full image loads
- **Pros**: Shows actual image content, works without extra services
- **Cons**: Adds to initial HTML size, more processing

**3. Implementation Recommendations:**

**For Product Images (PDP, collection pages):**
- Use **Dominant Color** as baseline (quickest to implement)
- Upgrade to **Blurhash** when you have bandwidth (best premium feel)
- Store placeholder data in Shopify product metafields:
  - `custom.placeholder_blurhash` (string)
  - `custom.dominant_color` (color hex)

**For Hero/Marketing Images:**
- Use **Blurhash** for hero images (high visual impact area)
- Consider LQIP for editorial content images

**For Video Posters:**
- Use **Dominant Color** on video container before poster loads
- Optimize poster image aggressively (WebP, 1920x1080 max)
- Use `poster` attribute on `<video>` to show image before video plays

**4. LCP Optimization Checklist:**
- [ ] Hero image is optimized and served via Shopify CDN
- [ ] Hero image has explicit width/height to prevent CLS
- [ ] Hero image has placeholder (blurhash or dominant color)
- [ ] Hero image is preloaded in `<head>` (only if above fold)
- [ ] Non-critical images are lazy loaded (`loading="lazy"`)
- [ ] Video poster image is optimized and has placeholder
- [ ] Video only loads after user interaction or on idle
- [ ] All images have `alt` text for accessibility

**5. Testing:**
- Run Lighthouse and target LCP < 2.5s
- Check CLS < 0.1 (no layout shift during image load)
- Test on slow 3G to verify placeholder experience
- Verify `prefers-reduced-motion` disables video

### Site directory / sitemap (recommended v1)
Suggested URL structure (Hydrogen/Remix routes), organized to keep navigation simple and SEO-friendly.

Primary (top nav):
- Landing (Home): `/`
- Products (collection/listing): `/collections/:handle` (or a curated `/products` route if you prefer)
- Product detail pages (PDP): `/products/:handle`
- About us: `/about`
- Blog (index): `/blog`
- Blog (article): `/blog/:slug`
- Contact us: `/contact`

Trust + community:
- Customer reviews: `/reviews`
- Newsletter sign up: `/newsletter` (or embed sign-up sitewide and use `/newsletter` as a “manage preferences” landing page)

Support hub (footer + header utility):
- Customer service (hub): `/support`
- FAQ: `/support/faq`
- Shipping & returns: `/support/shipping-returns`

Legal (footer):
- Privacy Policy: `/policies/privacy-policy`
- Terms of Service: `/policies/terms-of-service`
- Refund Policy: `/policies/refund-policy`

Notes:
- Keep “Shipping & Returns” and “Refund Policy” distinct: one is operational guidance; the other is the legal policy.
- If you later add “Recovery resources” content, place it under `/resources` and keep `/blog` for brand/editorial.

### Forms, validation, and customizations
If you add personalization (engraving, milestone selection, gift notes):
- **react-hook-form**: fast, minimal re-renders.
- **zod**: schema validation for form inputs and server actions.

### Contact form (Resend) — recommended
For `/contact`, use a standard Remix/Hydrogen **server action** and send email via **Resend**.

Best-practice rules:
- **Server-side only**: never call Resend from the browser.
- **Validation**: validate payload with `zod` (required fields, max lengths).
- **Spam controls**: add a hidden “honeypot” field + basic rate limiting per IP; add Turnstile/hCaptcha only if needed.
- **Privacy**: don’t collect more than needed; avoid putting sensitive data in logs.
- **Analytics**: publish a custom conversion event like `contact_submitted` (consent-gated) for measurement.

### Newsletter (Resend Audiences/Broadcasts + React Email templates) — recommended
For newsletter signups and sends, use **Resend Audiences** (list management) + **Resend Broadcasts** (campaign sends), and build templates with **React Email**.

How it works (high level):
- Signup form (footer or `/newsletter`) posts to a Remix **action**.
- Server validates + anti-spam checks, then upserts the email into a **Resend Audience**.
- (Recommended) Send a **double opt-in** confirmation email (React Email template) to confirm subscription intent.
- Newsletters are sent as **Broadcasts** (via Resend UI or API), with built-in unsubscribe handling.

Best-practice rules:
- **Consent copy**: make newsletter intent explicit (“Get product drops and recovery stories”).
- **Double opt-in**: strongly recommended to reduce spam/complaints and improve deliverability.
- **Unsubscribe**: always include unsubscribe in marketing emails (Resend provides `RESEND_UNSUBSCRIBE_URL` for broadcasts).
- **Server-side only**: audience updates and sends happen server-side (no client API keys).
- **Analytics**: publish `newsletter_signup` and (if double opt-in) `newsletter_confirmed` as custom conversion events (consent-gated).

### Search, filtering, merchandising
- Shopify built-ins: collections, product tags, product metafields/metaobjects.
- Predictive search: Shopify’s predictive search endpoints (Hydrogen supports common patterns).

### Analytics (headless best practice: Shopify Web Pixels + Customer Privacy API)
Best practice for Hydrogen/Oxygen is to use **Hydrogen analytics** (the `Analytics` / `Analytics.Provider` pattern) so tracking:
- flows through **Shopify’s Web Pixels ecosystem** (clean integrations vs tag-soup)
- respects **Shopify Customer Privacy** consent by default

Recommended stack:
- **Shopify Customer Privacy API** (consent + cookie categories)
- **Shopify Web Pixels** (first-party event pipeline)
- **GA4** (and other ad pixels) connected via Shopify where possible
- Optional: **Segment** only if you truly need multi-destination governance; otherwise keep it simple

Implementation principles:
- Track core events via Hydrogen’s analytics context (page/product/cart events) rather than ad-hoc `gtag()` calls.
- Gate analytics/marketing on consent (analytics vs marketing categories).
- Keep third-party scripts minimal and **deferred**; avoid loading GTM above-the-fold on the landing page.
- Validate by inspecting Shopify analytics network calls (Hydrogen docs reference `monorail-*` endpoints) and confirming events fire only after consent.

Baseline event coverage:
- `page_viewed`
- `product_viewed`
- `product_added_to_cart` / `product_removed_from_cart`
- `cart_viewed` / `cart_updated`
- `checkout_started` (handoff to checkout domain)

### Observability & analytics (storefront appropriate)
- **Sentry** (optional but recommended): error reporting for edge + client.
- **Shopify Web Pixels** + GA4 (as needed): follow Shopify’s customer privacy/consent model.
- Keep marketing scripts delayed/conditional; prioritize CWV.

### Testing & quality gates
- **Vitest**: unit tests for utilities and small components.
- **Playwright**: E2E critical paths (browse → PDP → add to cart → checkout handoff).
- **ESLint** + **Prettier**: consistent code style and catch common issues early.

### Standard storefront concerns (Hydrogen best practices checklist)

Commerce UX essentials:
- **Cart UX**: cart drawer/mini-cart, clear error states, quantity updates, remove, “continue shopping”, persistent cart icon.
- **Discounts**: decide where discounts are applied (cart vs checkout); display applied discount lines and error messaging.
- **Checkout handoff**: consistent “Proceed to checkout” path and a clear expectation that checkout happens on Shopify’s checkout domain.
- **Search/collections**: sorting, filtering, pagination, empty states, “no results” guidance.
- **Errors**: branded `404`/`500` with Remix error boundaries; graceful Storefront API error handling.

### Error Boundary Granularity (Graceful Degradation Strategy)

**The Problem:**
If a third-party service (Judge.me reviews, CMS, analytics) goes down, you don't want the entire page to crash. Without component-level error boundaries, a single failed API call can white-screen the entire storefront.

**Critical Scenarios:**
- Judge.me API is down → PDP should still render without reviews section
- CMS API timeout → Homepage should show fallback content, not blank page
- Shopify Storefront API rate limit → Show cached/stale data, not error page
- Image CDN failure → Show placeholder, not broken page
- Third-party script fails to load → Site continues functioning

**Error Boundary Hierarchy:**

**Level 1: Root Error Boundary (Catch-All)**
```tsx
// app/root.tsx
export function ErrorBoundary() {
  const error = useRouteError();
  
  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return <NotFoundPage />;
    }
    if (error.status === 503) {
      return <MaintenanceMode />;
    }
  }
  
  // Unexpected errors - still branded, helpful
  return (
    <html>
      <body>
        <Header />
        <ErrorPage 
          title="Something went wrong"
          message="We're working on it. Please try refreshing the page."
          supportEmail="support@example.com"
        />
        <Footer />
      </body>
    </html>
  );
}
```

**Level 2: Route-Level Error Boundaries**
```tsx
// app/routes/products.$handle.tsx (PDP)
export function ErrorBoundary() {
  return (
    <div>
      <Header />
      <ProductNotFound />
      <Footer />
    </div>
  );
}
```

**Level 3: Component-Level Error Boundaries (Critical for Third-Party Widgets)**

For components that depend on external services, wrap in error boundaries:

```tsx
// app/components/ReviewsWidget.tsx
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';

export function ReviewsWidget({ productId }: { productId: string }) {
  return (
    <ReactErrorBoundary
      fallback={<ReviewsFallback />}
      onError={(error) => {
        // Log to Sentry/monitoring
        console.error('Reviews widget failed:', error);
      }}
    >
      <JudgeMeWidget productId={productId} />
    </ReactErrorBoundary>
  );
}

function ReviewsFallback() {
  return (
    <div className="reviews-fallback">
      <p>Reviews temporarily unavailable.</p>
      <a href="/reviews">View all customer reviews →</a>
    </div>
  );
}
```

**Critical Components Requiring Error Boundaries:**

1. **Reviews Widget (Judge.me)**
   - Fallback: Hide widget or show "Reviews temporarily unavailable"
   - Impact: PDP still usable for purchases

2. **CMS Content Blocks**
   - Fallback: Show cached version or skip section
   - Impact: Homepage/marketing pages still navigable

3. **Analytics/Tracking Scripts**
   - Fallback: Silent failure, log error
   - Impact: Site continues working, just no analytics for that session

4. **Newsletter Signup**
   - Fallback: Show "Try again later" message
   - Impact: User can still browse and purchase

5. **Personalization Features**
   - Fallback: Show default/unpersonalized experience
   - Impact: Core shopping flow unaffected

6. **Third-Party Embeds** (social feeds, testimonials)
   - Fallback: Hide section or show static content
   - Impact: Page loads without waiting for external service

**Storefront API Error Handling (Special Case):**

Shopify Storefront API errors need different handling:

```tsx
// app/lib/storefront-error-handler.ts
export async function safeStorefrontQuery<T>(
  storefront: Storefront,
  query: string,
  options?: { cache?: CacheLong }
): Promise<T | null> {
  try {
    const response = await storefront.query(query, options);
    return response;
  } catch (error) {
    // Log to monitoring
    console.error('Storefront API error:', error);
    
    // Don't crash - return null and handle gracefully
    return null;
  }
}

// Usage in loader
export async function loader({ context }: LoaderArgs) {
  const product = await safeStorefrontQuery(
    context.storefront,
    PRODUCT_QUERY
  );
  
  if (!product) {
    // Fallback: try cache, show stale data, or 404
    throw new Response('Product not found', { status: 404 });
  }
  
  return { product };
}
```

**Fallback Strategies by Component Type:**

| Component Type | Fallback Strategy | User Impact |
|----------------|-------------------|-------------|
| Reviews | Hide section or show "Temporarily unavailable" | Can still purchase |
| CMS Content | Show cached/default content | Slightly stale content |
| Analytics | Silent failure, log error | No tracking for session |
| Newsletter | Disable form, show message | Can't subscribe temporarily |
| Personalization | Show default experience | No custom recommendations |
| Product Images | Show placeholder/blurhash | Can still see product details |
| Navigation | Show cached/static menu | Can still navigate |

**Implementation Best Practices:**

1. **Use react-error-boundary package**: More flexible than Remix's built-in boundaries
   ```bash
   npm install react-error-boundary
   ```

2. **Log errors to monitoring**: Always capture errors for debugging
   ```tsx
   onError={(error, errorInfo) => {
     Sentry.captureException(error, { extra: errorInfo });
   }}
   ```

3. **Reset state on retry**: Allow users to retry failed components
   ```tsx
   <ErrorBoundary
     fallbackRender={({ resetErrorBoundary }) => (
       <div>
         <p>Something went wrong.</p>
         <button onClick={resetErrorBoundary}>Try again</button>
       </div>
     )}
   >
   ```

4. **Test error scenarios**: Simulate API failures in development
   ```tsx
   // In development, force error to test boundary
   if (process.env.NODE_ENV === 'development' && forceError) {
     throw new Error('Test error boundary');
   }
   ```

5. **Provide helpful fallbacks**: Don't just show generic "Error" message
   - Explain what feature is unavailable
   - Offer alternative action (contact support, view cached content)
   - Maintain site navigation and branding

**Recovery-Specific Error Messaging:**

Remember: users may be in vulnerable moments. Error messages should be supportive, not stressful.

```tsx
// ❌ Bad: Technical and alarming
<div>Error: API request failed with status 500</div>

// ✅ Good: Calm and actionable
<div>
  <p>We're having trouble loading reviews right now.</p>
  <p>Your shopping experience isn't affected—you can still browse and purchase.</p>
  <a href="/support">Need help? Contact us</a>
</div>
```

**Testing Error Boundaries:**

1. **Simulate API failures**:
   ```tsx
   // Add to .env.local for testing
   FORCE_JUDGEME_ERROR=true
   ```

2. **Network throttling**: Test with slow/unreliable connections

3. **Third-party service mocks**: Use MSW to simulate service failures

4. **Browser DevTools**: Throw errors manually to test boundaries
   ```js
   // In browser console
   window.forceError = true
   ```

**Monitoring & Alerting:**

- **Track error rates per component**: Know which third-party services are unreliable
- **Set alerts for error spikes**: E.g., "Reviews widget failing for 10+ users in 5 min"
- **Regular error reviews**: Weekly check of Sentry/error logs to identify patterns
- **Failover plans**: Document what to do when each service goes down

Customer accounts (US-only now; decide scope early):
- **Baseline**: guest checkout + order confirmation flows handled by Shopify checkout.
- Optional: **Customer Accounts** (login, order history, addresses) if you want post-purchase self-serve.

SEO & crawlability (must-have):
- **Per-route SEO**: title/meta, canonical URLs, OpenGraph/Twitter cards.
- **Structured data**: `Product`, `BreadcrumbList`, and review/rating markup (Judge.me + storefront).
- **Sitemap + robots**: include collections/products + key content pages; ensure policies are indexed appropriately.

### SEO & GEO (Generative Engine Optimization) Strategy
For a recovery-focused ecommerce site, **trust signals are everything**. Standard meta tags aren't enough—you need robust **Schema.org (JSON-LD)** markup for both traditional SEO and AI search optimization.

**Critical Schema.org types to implement:**

**1. Product Schema (PDP) — Required**
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "1 Year Sobriety Token",
  "description": "...",
  "image": ["..."],
  "brand": {
    "@type": "Brand",
    "name": "Recovery Token Store"
  },
  "offers": {
    "@type": "Offer",
    "price": "29.99",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock",
    "url": "https://example.com/products/1-year-token"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "127"
  }
}
```
- **Integration point**: Generate in PDP loader from Shopify product + Judge.me review data
- **Why it matters**: Rich snippets in Google, product understanding for AI search

**2. Review Schema (PDP) — Required for trust**
```json
{
  "@context": "https://schema.org",
  "@type": "Review",
  "itemReviewed": {
    "@type": "Product",
    "name": "1 Year Sobriety Token"
  },
  "author": {
    "@type": "Person",
    "name": "John D."
  },
  "reviewRating": {
    "@type": "Rating",
    "ratingValue": "5",
    "bestRating": "5"
  },
  "reviewBody": "This token helped me celebrate my milestone..."
}
```
- **Integration point**: Judge.me should provide this, but verify implementation
- **Why it matters**: Star ratings in search results, social proof for AI summaries

**3. Organization Schema (root.tsx) — Required for brand trust**
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Recovery Token Store",
  "url": "https://example.com",
  "logo": "https://example.com/logo.png",
  "sameAs": [
    "https://instagram.com/...",
    "https://facebook.com/..."
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "Customer Service",
    "email": "support@example.com"
  }
}
```
- **Integration point**: Add to root layout or SEO component
- **Why it matters**: Brand knowledge graph, trust signals for AI search

**4. BreadcrumbList Schema (all pages with nav hierarchy) — Required**
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://example.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Products",
      "item": "https://example.com/collections/all"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "1 Year Token",
      "item": "https://example.com/products/1-year-token"
    }
  ]
}
```
- **Integration point**: Generate dynamically in each route's loader based on URL path
- **Why it matters**: Breadcrumb navigation in search results, page hierarchy understanding

**5. FAQ Schema (support pages, PDP if FAQs exist) — Recommended**
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What milestones do you offer?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We offer tokens for 24 hours, 30 days, 90 days, 6 months, 1 year..."
      }
    }
  ]
}
```
- **Integration point**: FAQ pages, PDP "common questions" sections
- **Why it matters**: Featured snippets, direct answers in AI search

**GEO (AI Search Optimization) specific tactics:**
- **Explicit milestone definitions**: Include structured data that explicitly links tokens to specific recovery milestones
  - Example: Add `additionalProperty` to Product schema: `"milestone": "365 days sober"`
- **Recovery-specific terminology**: Use recovery community language in descriptions and schema
  - Example: "sobriety", "recovery journey", "milestone celebration", "abstinence anniversary"
- **Contextual relationships**: Link products to broader recovery concepts in content
  - Example: Blog posts about "celebrating 1 year sober" should reference 1-year token product
- **Authority signals**: Ensure Organization schema includes partnerships, certifications, or recovery community endorsements if applicable

**Implementation checklist:**
1. Create reusable `<JsonLd>` component for `root.tsx` and route-specific structured data
2. Generate Product + Review schema in PDP loader (Shopify + Judge.me data)
3. Generate BreadcrumbList schema in all routes with navigation hierarchy
4. Add Organization schema to root layout
5. Add FAQ schema to support pages and PDP if applicable
6. Validate all schema with Google's Rich Results Test and Schema.org validator
7. Monitor Google Search Console for rich snippet eligibility

### Redirect Strategy (SEO Debt Prevention)

**The Problem:**
When product handles change in Shopify (e.g., `/products/old-name` → `/products/new-name`), Hydrogen doesn't automatically follow Shopify's internal redirect table. Without a redirect strategy, you'll return 404s for old URLs, losing SEO juice and frustrating users with bookmarked links.

**Critical Scenarios:**
- Product handle changes in Shopify admin
- Collection handle changes
- Page URL restructuring
- Migration from previous storefront (legacy URLs)
- External links/bookmarks pointing to old URLs

**Implementation Strategy:**

**Option 1: Redirect Loader in root.tsx (Recommended for Production)**

Create a redirect lookup that queries Shopify's URL Redirects API before rendering 404s:

```tsx
// app/root.tsx (or dedicated redirect loader)
export async function loader({ request, context }: LoaderArgs) {
  const { pathname } = new URL(request.url);
  
  // Only check redirects for potential 404s (not homepage, assets, etc.)
  if (pathname !== '/' && !pathname.startsWith('/_') && !pathname.includes('.')) {
    const redirect = await context.storefront.query(URL_REDIRECTS_QUERY, {
      variables: { query: `path:${pathname}` }
    });
    
    if (redirect?.urlRedirects?.edges?.[0]?.node?.target) {
      const target = redirect.urlRedirects.edges[0].node.target;
      throw redirect(target, 301); // Permanent redirect
    }
  }
  
  // Continue with normal root loader...
}
```

**GraphQL Query for URL Redirects:**
```graphql
query UrlRedirects($query: String!) {
  urlRedirects(first: 1, query: $query) {
    edges {
      node {
        id
        path
        target
      }
    }
  }
}
```

**Option 2: 404 Handler with Redirect Fallback**

In your 404 error boundary, check for redirects before showing the 404 page:

```tsx
// app/routes/$.tsx (catch-all 404 route)
export async function loader({ request, context }: LoaderArgs) {
  const { pathname } = new URL(request.url);
  
  // Check Shopify URL Redirects
  const redirect = await context.storefront.query(URL_REDIRECTS_QUERY, {
    variables: { query: `path:${pathname}` }
  });
  
  if (redirect?.urlRedirects?.edges?.[0]?.node?.target) {
    const target = redirect.urlRedirects.edges[0].node.target;
    throw redirect(target, 301);
  }
  
  // No redirect found, render 404
  throw new Response('Not Found', { status: 404 });
}
```

**Best Practices:**

1. **Cache redirect lookups**: Add caching to avoid repeated Storefront API calls
   ```tsx
   const cacheKey = `redirect:${pathname}`;
   // Use Oxygen cache or in-memory cache
   ```

2. **Handle internal vs external redirects**:
   - Internal: `/products/old-name` → `/products/new-name` (use Remix `redirect()`)
   - External: Check if target is external domain and handle appropriately

3. **Logging**: Log redirect hits for debugging and analytics
   ```tsx
   console.log(`Redirect: ${pathname} → ${target}`);
   ```

4. **Performance**: Only check redirects for routes that don't match existing handlers
   - Don't check for homepage, assets, or valid routes
   - Use route-level checks to minimize API calls

5. **Migration redirects**: For site migrations, bulk import redirects into Shopify admin:
   - Shopify Admin → Navigation → URL Redirects
   - Or use Shopify Admin API to programmatically create redirects

**Redirect Management Workflow:**

1. **Before changing handles in Shopify**:
   - Document old URL
   - Change handle in Shopify admin
   - Shopify automatically creates redirect in URL Redirects table
   - Hydrogen picks up redirect via Storefront API

2. **For bulk migrations**:
   - Export old URLs from previous site
   - Map to new Hydrogen URLs
   - Bulk import via Shopify Admin API or CSV import

3. **Monitoring**:
   - Track 404s in analytics/Sentry
   - Set up alerts for 404 spikes
   - Review Google Search Console for crawl errors
   - Regularly audit redirect table for outdated entries

**Testing Redirects:**

```bash
# Test redirect lookup
curl -I https://your-site.com/products/old-handle
# Should return: HTTP/1.1 301 Moved Permanently
# Location: https://your-site.com/products/new-handle

# Test 404 (no redirect exists)
curl -I https://your-site.com/products/nonexistent
# Should return: HTTP/1.1 404 Not Found
```

**Performance Considerations:**

- Redirect lookups add latency to 404 responses
- Cache redirect results to minimize Storefront API calls
- Consider preloading common redirects at build time (if using SSG for some routes)
- Monitor redirect API usage to avoid rate limits

**When to Skip Redirect Lookup:**

- Valid route matches (Remix already handled it)
- Static assets (`.js`, `.css`, `.png`, etc.)
- API routes or webhooks
- Intentional 404s (e.g., `/test-404`)

US-only scope (for now):
- Keep a single **country/currency** configuration (US / USD) and defer i18n/multi-currency.
- Still format money/dates consistently and keep localization hooks in mind for future expansion.

Security & compliance basics:
- **Security headers**: CSP (especially with Judge.me + analytics), HSTS, X-Content-Type-Options, Referrer-Policy.
- **Bot/spam posture**: rate limit public actions (contact/newsletter), honeypots, optional Turnstile/hCaptcha as needed.
- **Accessibility**: keyboard nav, focus management (Radix), reduced motion, color contrast, form labels/errors.

Operational hygiene:
- **Environments**: dev/staging/prod with separate API keys and content.
- **CI/CD**: preview deployments for PRs, automated checks (lint/test), and a release checklist.
- **Performance budgets**: explicit CWV targets (LCP/INP/CLS) and rules about third-party scripts (defer + route-split).


### Global Maintenance Mode & Kill Switches

**The Problem:**
You need a way to put the site in "Maintenance Mode" (e.g., during major inventory updates, emergency fixes, or scheduled maintenance) without requiring a code deployment to Oxygen.

**Why This Matters:**
- **Emergency response**: Quickly disable site during critical issues (payment gateway down, inventory corruption)
- **Planned maintenance**: Scheduled updates that require taking the site offline temporarily
- **Feature flags**: Gradually roll out features or quickly disable problematic ones
- **No deployment delay**: Oxygen deployments take time; kill switches are instant

**Implementation Options:**

**Option 1: Shopify Metaobject (Recommended - No Code Deployment Required)**
- Create "Site Settings" metaobject in Shopify admin with fields for maintenance mode, message, estimated end time
- Query metaobject in root.tsx loader
- Conditionally render maintenance overlay based on metaobject state
- **Pros**: Instant toggle via Shopify admin, no deployment needed
- **Cons**: Adds Storefront API query overhead

**Option 2: Environment Variable Toggle**
- Use `MAINTENANCE_MODE` env var in Oxygen settings
- **Pros**: Simple, no query overhead
- **Cons**: Requires redeploying to Oxygen to toggle (slower)

**Option 3: Hybrid Approach (Best of Both Worlds)**
- Use env var for planned maintenance
- Use metaobject for emergency toggles
- Check both in root loader

**Maintenance Mode UI Requirements:**

1. **HTTP 503 status**: Return `503 Service Unavailable` for proper SEO handling
2. **Clear messaging**: Explain why site is down and when it'll be back
3. **Brand consistency**: Use brand colors, logo, tone
4. **Contact information**: Always provide support email/phone
5. **Retry-After header**: Include estimated downtime

**Feature Flags (Granular Control):**

Beyond site-wide maintenance, implement feature flags for granular control:
- `reviews_widget`: Toggle Judge.me widget on/off
- `personalization`: Toggle engraving features
- `newsletter_signup`: Toggle newsletter functionality
- `new_checkout_flow`: A/B test or safely roll out new features

Store as JSON in metaobject field and read in components to conditionally render features.

**Emergency Response Workflow:**

1. Incident detected → Quick decision: full maintenance or feature kill switch?
2. Toggle metaobject in Shopify admin (instant)
3. Monitor to confirm active
4. Fix issue behind scenes
5. Test in staging
6. Toggle off maintenance
7. Verify site working

**Caching Considerations:**

- Set short cache TTL during maintenance (`max-age=60`)
- Ensure Oxygen cache respects 503 status
- Use query params for cache-busting when testing toggles

**Admin Bypass (Optional):**

Allow admin access during maintenance via bypass token in query params (`?bypass=SECRET_TOKEN`).

**Monitoring:**

- Alert when maintenance mode enabled (prevent forgetting to disable)
- Track maintenance duration in analytics
- Log maintenance events for incident review

---

## “Beautiful + fast” storefront UI guidelines (for this brand)
- Define brand tokens early: color palette, typography scale, spacing, radii, shadows.
- Use **1–2 fonts max** (optimize loading; subset if possible).
- Keep homepage “hero” simple: one strong message, one CTA, one product focus.
- Make product pages conversion-focused: clear milestone variants, personalization options, shipping/returns, and social proof.

---

## Recovery-Specific UI/UX Guidelines (critical for this niche)

> **Core Principle**: In the recovery space, users may be visiting during high-stress, emotionally vulnerable moments. The UI shouldn't just be "beautiful"—it needs to be **calm, supportive, and trustworthy**.

### 1. Color & Contrast (WCAG AA minimum)

**Accessibility Requirements:**
- Ensure text/background color combinations meet **WCAG AA standards** (4.5:1 for normal text, 3:1 for large text)
- **Critical for your coral palette**: If using coral (#F1877E) from the brand, verify contrast ratios:
  - Coral on white background: May not meet contrast requirements for body text
  - Solution: Use coral for decorative elements, large headings, or buttons with proper contrast
  - For functional text (body copy, form labels, "Add to Cart"): use darker colors that meet accessibility standards

**Color Psychology for Recovery:**
- **Calm, trustworthy palette**: Blues, greens, soft neutrals
- **Avoid**: Aggressive reds, harsh blacks, overly vibrant colors that create visual stress
- **Use coral strategically**: Accent color for milestone achievements, celebration moments, not for critical functional elements

**Testing:**
- Use WebAIM Contrast Checker or similar tools
- Test with browser accessibility tools
- Verify readability in different lighting conditions (bright sun, dim room)

### 2. Empathetic Micro-Copy & Error States

Standard ecommerce error messages are too transactional for this context. Every piece of copy should feel supportive, never punishing.

**Standard vs Empathetic Error Messages:**

| Scenario | ❌ Standard Copy | ✅ Empathetic Copy |
|----------|------------------|---------------------|
| Payment failed | "Payment declined. Try again." | "We weren't able to process your payment. No worries—your cart is saved. Would you like to try a different payment method?" |
| Out of stock | "This item is out of stock." | "We're temporarily out of this milestone token. We're working to restock soon—add your email below and we'll let you know when it's available." |
| Invalid promo code | "Invalid coupon code." | "We couldn't find that discount code. Double-check the spelling, or contact us if you need help." |
| Form validation | "Required field." | "We'll need this information to process your order." |
| Shipping delay | "Delayed shipment." | "Your order is taking a bit longer than expected. We're on it and will keep you updated." |

**Tone Guidelines:**
- **Never blame the user**: "We couldn't process" vs "You entered an invalid"
- **Always offer a path forward**: What can they do next?
- **Acknowledge emotions without being condescending**: "No worries" > "Don't panic"
- **Be specific**: "We'll email you in 2-3 days" > "We'll get back to you soon"

### 3. Loading States & Perceived Performance

Users in vulnerable states have less patience for unclear interactions.

**Best Practices:**
- **Never use generic spinners for important actions**: "Adding to cart..." > spinner only
- **Progress indicators**: For multi-step processes (personalization, checkout), show progress
- **Optimistic UI**: Show immediate feedback, reconcile with server in background
- **Skeleton screens**: Better than blank white pages during page transitions

**Example Loading States:**
```tsx
// Good: Specific, reassuring message
<button disabled>
  Adding to cart...
</button>

// Better: Shows what's happening
<button disabled>
  Saving your custom engraving...
</button>

// Best: Includes time expectation
<div>
  Processing your order... (usually takes 10-15 seconds)
</div>
```

### 4. Trust Signals & Social Proof

Recovery purchases are often deeply personal and first-time buyers need extra reassurance.

**Essential Trust Elements:**
- **Reviews with context**: Highlight reviews that mention specific milestones or recovery journeys
- **Security badges**: SSL, secure checkout, privacy-focused messaging
- **Return policy**: Make it prominently visible and reassuring ("30-day satisfaction guarantee")
- **Shipping transparency**: Clear delivery timelines, tracking information
- **About/Mission**: Visible link to brand story and recovery community connection
- **Contact information**: Easy to find, multiple channels (email, phone if applicable)

**Review Display Strategy:**
- Prioritize reviews that mention recovery milestones and emotional impact
- Include reviewer's milestone (if they shared it): "Celebrating 1 year" badge on review
- Allow filtering by milestone: "See reviews from other 90-day celebrants"

### 5. Checkout & Payment Experience

**Minimize Friction:**
- **Guest checkout**: Don't force account creation before purchase
- **Address validation**: Help fix errors, don't just reject
- **Multiple payment methods**: Credit card, PayPal, Apple Pay, Google Pay
- **Save cart**: If user abandons, save cart and offer to resume via email

**Reassuring Elements:**
- Show security badges near payment fields
- "Your information is secure" messaging
- Order summary always visible during checkout
- Clear refund/return policy link

### 6. Mobile-First Design (critical consideration)

Many users may be browsing during moments of reflection or stress, often on mobile devices.

**Mobile Priorities:**
- **Thumb-friendly touch targets**: Minimum 44x44px for all interactive elements
- **Simple navigation**: Hamburger menu or bottom nav, not complex dropdowns
- **Readable font sizes**: 16px minimum for body text (prevents zoom on iOS)
- **Form optimization**: Proper input types (tel, email), autofill support, minimal required fields
- **Fast performance**: Mobile users may be on slow connections; prioritize speed

### 7. Accessibility Beyond WCAG

**Keyboard Navigation:**
- All interactive elements reachable via Tab
- Visible focus indicators (don't remove outline)
- Skip navigation links for screen readers

**Screen Reader Support:**
- Semantic HTML (proper heading hierarchy)
- Alt text for all images (especially product photos)
- ARIA labels for interactive elements
- Announce dynamic content changes (cart updates, form errors)

**Reduced Motion:**
- Respect `prefers-reduced-motion` media query
- Disable autoplay videos, parallax, complex animations
- Maintain functionality without motion

### 8. Privacy & Discretion

Some customers may value privacy around their recovery purchases.

**Considerations:**
- **Discreet packaging**: Mention if packaging doesn't indicate contents
- **Gift options**: "Send as a gift" with separate shipping address
- **Order history privacy**: If implementing customer accounts, ensure secure login
- **Email preferences**: Let users choose frequency and type of emails
- **No judgment in abandoned cart emails**: Don't pressure, just remind and offer help

### 9. Content Tone & Messaging

**Do:**
- Celebrate milestones without being over-the-top
- Use recovery community language appropriately ("one day at a time," "progress not perfection")
- Focus on personal growth and achievement
- Offer resources (blog posts, community links) without being preachy

**Don't:**
- Make assumptions about user's recovery path (AA vs other programs vs solo)
- Use medical or clinical language unless appropriate
- Oversell or use high-pressure tactics
- Minimize anyone's milestone ("just" 30 days)

### 10. Performance as UX (especially for this audience)

Slow sites feel broken. For users in vulnerable states, technical problems can be disproportionately frustrating.

**Non-Negotiable Performance Targets:**
- **LCP < 2.5s**: Hero image/content loads quickly
- **FID/INP < 100ms**: Interactions feel instant
- **CLS < 0.1**: No layout shift (especially during form entry)
- **Time to Interactive < 3.5s**: Site is usable quickly

**Testing:**
- Test on slow 3G connections (Mobile)
- Test on older devices (not just latest iPhone/Pixel)
- Monitor real user metrics via RUM (Real User Monitoring)

---

## Architecture notes specific to recovery tokens
- Products likely map to “milestones” as variants (e.g., 30 days, 90 days, 1 year), plus material/finish options.
- Personalization can be implemented via:
  - **variant options** (preferred when it affects price/sku/inventory), and/or
  - **line item properties** (engraving text, gift message).
- Consider using **metaobjects** to manage milestone copy and educational content (what the token represents, care instructions, etc.) without a separate CMS.

### Personalization Strategy (Line Item Properties & Cart Attributes)

For recovery tokens, personalization (engraving, gift notes, private messages) is likely a key feature. Here's how to implement it properly in Hydrogen.

**Line Item Properties vs Cart Attributes:**
- **Line Item Properties**: Attached to individual products in the cart (e.g., engraving text per token)
- **Cart Attributes**: Attached to the entire cart/order (e.g., gift wrapping, shipping notes)

**Implementation Approach:**

**1. Line Item Properties (for engraving/personalization per product)**
- Add custom fields on PDP that submit as line item properties
- Validation: Enforce character limits (e.g., 50 chars for engraving) and character set (alphanumeric + basic punctuation)
- Pricing: If engraving costs extra, create a separate "Engraving Service" product or adjust line item price via cart transforms (Shopify Functions)
- Private notes: Prefix property keys with underscore (`_privateNote`) to hide from packing slips (Shopify convention)
- Display in cart: Show line item properties in cart drawer/mini-cart so users can review before checkout

**2. Cart Attributes (for order-level customization)**
- Add fields that apply to the entire order (gift message, delivery instructions)
- Use `CartForm.ACTIONS.AttributesUpdateInput` to update cart attributes
- Display in cart summary/checkout handoff

**3. Validation & Error Handling**
- Client-side validation: Character limits, allowed characters, required fields
- Server-side validation: Always re-validate in Remix actions to prevent manipulation
- Clear error messaging: "Engraving must be 50 characters or less"

**4. Cart Display Considerations**
- Display engraving text below product title in cart
- Show character count/limit while editing
- Allow editing or removing properties without removing entire line item
- Show visual distinction between public (appears on packing slip) and private properties

**5. Recovery-Specific Personalization Ideas**

**"Private Note to Engraver":**
- Allow customers to add context for the engraver without it appearing on the packing slip
- Example: "This is for my 2-year sobriety anniversary on March 15th"
- Use `_engravingNote` property (underscore prefix = private)

**"Milestone Date":**
- Optional field to capture the actual milestone date
- Could be used for:
  - Including a congratulatory note in the package
  - Future email follow-ups (if stored in customer metafields)
  - Analytics (anonymized milestone distribution)

**"Gift Recipient":**
- If purchased as a gift, allow adding recipient name
- Could trigger different packaging or include a special card

**6. Operational Considerations**
- **Order Processing**: Ensure your fulfillment team has clear visibility of line item properties and cart attributes in Shopify admin
- **Engraving Workflow**: Consider whether engraving happens in-house or via third-party (affects lead time messaging)
- **Error Handling**: If an engraving request is problematic (inappropriate content, technical issues), have a process to contact customer before fulfilling
- **Quality Control**: Set up admin notifications for orders with personalization to ensure review before shipping

**7. Confirmation & Legal Gate (CRITICAL for recovery context)**

**The Problem**: Recovery customers are in emotionally vulnerable states. A typo in engraving (e.g., "1 Year" → "10 Years") or accidental milestone selection followed by a refund refusal creates trust damage and negative reviews. This gate prevents costly customer service issues.

**Confirmation Modal (Required before adding to cart):**

The engraving form must gate the "Add to Cart" button with a confirmation modal that displays:
- Product name + milestone variant selected (e.g., "1 Year Sobriety Token")
- **Live preview of engraved text** as it will appear on the physical token
- Clear warning box: "⚠️ Custom engraving is non-refundable. Once your order is placed, the engraving cannot be changed."
- Optional checkbox: "I confirm this engraving is correct"
- Two buttons: "← Back & Edit" and "✓ Confirm & Add to Cart"

**Recovery-Appropriate Messaging**:
- Tone: "We want to make sure your token is exactly what you need."
- Avoid: Technical language, blame ("you entered"), urgency pressure
- Include: Clear explanation of next steps after confirmation

**Implementation Details**:

1. **Before displaying modal**:
   - Validate engraving text on client-side (character limits, allowed characters)
   - Generate visual preview (simulate token appearance with actual engraving text)
   - Show font, size, and positioning as it will appear

2. **In the modal**:
   - Render the preview prominently (make the text easy to spot errors like "1" vs "l", "0" vs "O")
   - Make the warning visually distinct (use color, icon, bold text)
   - Non-refundable statement must be clear and unambiguous (for compliance)

3. **After confirmation**:
   - Store confirmation timestamp + user action in order notes (Shopify)
   - Log the engraving text, preview image, and acceptance timestamp for audit trail
   - Pass validated data to cart mutation

4. **Optional enhancements**:
   - Detect common typos at submission (1 vs 10, 30 vs 300, etc.) and highlight them
   - Show character count as user types: "15 / 50 characters"
   - Allow toggling between preview formats (how it looks on token + how it appears in order)

**Phase 1.1 Requirement**: This is NOT optional. The confirmation gate must be functional before any engraving orders go live. Test extensively with real users to ensure the preview accurately represents the final token appearance.

---

## Cart implementation strategy (critical Hydrogen architecture decision)

Hydrogen provides built-in cart utilities and patterns. Here's the recommended approach:

### Use Hydrogen's built-in cart system (recommended)
- **Shopify Cart API**: server-side cart state managed via Shopify's Cart API (not custom localStorage-only).
- **`CartForm` component**: Hydrogen's form component for add-to-cart, update quantity, remove actions.
- **Cart query in root loader**: fetch cart in `root.tsx` loader and pass to `Analytics.Provider`.
- **Cart persistence**: cart ID stored in a cookie; survives page reloads and works across devices when user is logged in.

### Key components & hooks you'll use
- **`CartForm`**: handles mutations (add/update/remove) via Remix actions.
- **`useOptimisticCart`** (or similar pattern): optimistic UI updates while mutations are in flight.
- **`cart` from Remix context**: access cart state in any route/component.

### Cart drawer/mini-cart UX pattern
- **Trigger**: "Add to cart" success → open cart drawer (or show toast + keep user on page).
- **Drawer component**: Radix Dialog or Sheet, shows line items, quantities, subtotal, discount codes, "Proceed to checkout".
- **Persistent cart icon**: header shows cart item count badge; click opens drawer.

### Important implementation notes
- **Mutations happen server-side**: CartForm posts to a Remix action that calls Shopify Cart API, then revalidates.
- **Optimistic updates**: show changes immediately in UI, then reconcile with server response.
- **Error handling**: display clear errors for out-of-stock, max quantity, invalid discount codes.
- **Cart abandonment**: cart ID in cookie means you can re-engage users (email, retargeting) even if they don't check out.

### Discount codes
- Apply via `CartForm` mutation to `cartDiscountCodesUpdate`.
- Display applied discounts in cart summary.
- Show error if code is invalid/expired.

---

## Content strategy: Shopify metaobjects vs a custom headless CMS

### What Shopify metaobjects are (and when they shine)
**Metaobjects** are Shopify-native, structured content types you define in the Shopify admin (think: “Milestone”, “Token Material”, “FAQ Item”, “Testimonial”). They work especially well when your content is tightly coupled to commerce.

Strengths:
- **Native to Shopify**: no extra service to run, secure by default, managed in Shopify admin.
- **Structured content**: field-based models (strings, rich text, references, files/media, etc.) reduce “CMS freeform chaos”.
- **Storefront API access**: easy to fetch alongside products/collections in Hydrogen loaders.
- **Commerce adjacency**: great for content that relates to products (milestone descriptions, care instructions, packaging options, authenticity notes).
- **Performance simplicity**: one platform to query; fewer external network calls; straightforward edge caching.

Limitations:
- **Editorial workflow**: typically less flexible than a dedicated CMS for complex publishing workflows (advanced roles, staged content, scheduling, approvals).
- **Preview/experimentation**: preview and content staging can be more limited compared to CMS tooling.
- **Content-rich sites**: if you want lots of long-form editorial content (stories, guides, blog, recovery resources), the authoring experience may feel constrained.

### What a headless CMS provides (and when it’s worth it)
A headless CMS (e.g., **Sanity**, **Contentful**) becomes your primary editorial system. Shopify remains your commerce system.

Strengths:
- **Best-in-class authoring**: rich text, media workflows, custom editors, structured references, reusable blocks.
- **Publishing workflows**: drafts, approvals, scheduled publishing, granular roles/permissions.
- **Preview**: strong real-time preview tooling for content-heavy pages and campaigns.
- **Omnichannel content**: reuse content across web, email, social, mobile apps, etc.
- **Marketing agility**: landing pages, campaigns, and storytelling without engineering involvement.

Trade-offs:
- **More moving parts**: another vendor, auth, environments, migrations, backups, and operational complexity.
- **Performance risk**: additional upstream calls (Shopify + CMS). Mitigate with edge caching, build-time hydration, and careful query discipline.
- **Source of truth decisions**: you must decide what lives in Shopify vs CMS and keep the boundary clean.

### Recommended approach for this project: Hybrid from day 1 (clean separation)
For this storefront, the best balance of **brand storytelling + commerce correctness + performance** is a **hybrid model**:
- **Shopify remains the source of truth for all product/commerce data** (and any structured content that directly drives purchase decisions).
- **A headless CMS owns editorial/marketing content** (brand story, campaigns, long-form content, recovery resources), where authoring/preview/workflows matter.

Keep the boundary strict so you don’t create “two sources of truth” for the same concept.

### Source of truth map (what lives where)
Shopify (product + purchase-critical):
- Products, variants, price, inventory, discounts, shipping/checkout
- PDP-specific structured info that must stay in lockstep with the product (materials/finish, sizing, care, authenticity)
- Milestone options if they map to variants/SKUs (e.g., 30 days vs 1 year) or pricing
- Any data you need to guarantee correctness at checkout time

CMS (editorial + marketing):
- Homepage narrative modules, campaign landing pages
- About / mission / founder story, press
- Blog/guides/recovery resources (long-form content)
- Brand tone system: testimonials/stories (if not used as purchase-critical structured data)
- Content experiments, seasonal collections storytelling

### How they link together (important implementation detail)
Use a stable identifier to associate CMS content with Shopify entities:
- Prefer storing **Shopify product handle or product GID** in CMS documents that reference products.
- Avoid duplicating product fields (title/price/variants) in the CMS; render those from Shopify at request time.

### Hydrogen/Oxygen performance rules for hybrid
- Fetch Shopify + CMS **server-side in loaders**, then cache at the edge where safe.
- Use **one combined loader** per page where possible to avoid waterfalls.
- For marketing pages: cache aggressively (long TTL + revalidation strategy).
- For PDP/cart: cache carefully (short-lived/private where needed), but keep non-user-specific CMS content cacheable.

Hydrogen/Oxygen implementation note:
- Prefer **server-side fetching in loaders** for both Shopify + CMS, then cache at the edge where safe.
- Avoid “client-side CMS fetch on page load” for critical pages (hurts LCP and increases waterfall risk).

---

## Reviews strategy (Judge.me) — recommended for headless Hydrogen
We will use **Judge.me** for product reviews (verified buyer, moderation, SEO snippets), integrated directly into Hydrogen.

Why this is best practice vs a custom reviews backend (e.g., Supabase):
- Reviews are naturally tied to **orders** (verified buyer), need **spam control/moderation**, and benefit from **SEO markup**.
- Judge.me provides the operational tooling and deliverability (review request emails) that you’d otherwise need to build/maintain.

**Critical robustness note**: The official `@judgeme/shopify-hydrogen` package is client-side only and has not received recent updates (last publish ~2 years ago). Treat reviews as a **progressive enhancement**, not a critical path feature.

Implementation approach (progressive enhancement strategy):
- **Server-side fallback**: Render a minimal rating badge + review count server-side from Judge.me API in the PDP loader (for SEO and instant display).
- **Client-side widget (lazy-loaded)**: Load the full Judge.me widget JS only when needed, deferred to after page interactive.
- **Error boundary protection**: Wrap the reviews widget in `react-error-boundary` to gracefully handle widget failures. If Judge.me script fails to load or API is down, show fallback message: "Reviews temporarily unavailable" (PDP remains fully functional).
- **Testing recommendation**: Before shipping to production, thoroughly test Judge.me widget loading under various network conditions (slow 3G, offline, timeouts) and verify error boundaries catch failures correctly.

Configuration basics (env vars / secrets):
- `JUDGEME_SHOP_DOMAIN` (your `*.myshopify.com` domain registered with Judge.me)
- `JUDGEME_PUBLIC_TOKEN` (public API token for read/widget)
- `JUDGEME_CDN_HOST` (typically `https://cdn.judge.me`)

Page placement:
- PDP: server-side rating badge near title + full review widget below details (lazy-loaded).
- `/reviews`: use a Judge.me "all reviews"/carousel-style widget + optionally a curated testimonials section (CMS/metaobjects).

Performance rules:
- Avoid loading Judge.me scripts above-the-fold; lazy-load after page interactive.
- Use route-based code splitting so review widgets only ship on PDP and `/reviews`.
- Do NOT block PDP render on Judge.me widget load; widget is an enhancement, not required for conversion.

---

## Site owner concerns (services, setup, and ongoing costs)
This section is a practical checklist of third-party services you’ll likely need, plus typical cost drivers. Exact pricing changes over time—treat these as **planning ranges** and verify before purchase.

Required (core storefront):
- **Shopify plan**: required for products, checkout, admin, and the storefront APIs.
  - **Cost driver**: Shopify subscription + payment processing fees.
- **Oxygen hosting**: typically **included with Hydrogen** (no separate hosting bill); you still pay the Shopify plan.
- **Domain + DNS**: connect a custom domain to Shopify.
  - **Cost range**: typically low annual domain cost, plus DNS if using a paid provider.

Recommended (this project’s choices):
- **Reviews**: **Judge.me Awesome plan** (commonly used for headless widgets/features).
  - **Cost reference**: Judge.me Awesome is commonly cited around **$15/mo**.
- **Transactional email + newsletters**: **Resend**
  - **Cost drivers**: monthly plan tier + volume + contact list size for marketing emails (Audiences/Broadcasts).
- **Email templates**: **React Email** (code-level templates; no direct cost, but engineering time).

Optional (commonly added as you scale):
- **CMS for editorial** (hybrid model): **Sanity** or **Contentful**
  - **Cost drivers**: seats, API usage, asset bandwidth, preview environments.
- **Error monitoring**: **Sentry**
  - **Cost drivers**: event volume, performance monitoring, team size.
- **Support/helpdesk**: Gorgias/Zendesk/Help Scout (only if you want ticketing workflows vs inbox-based support).
- **Fraud/chargeback tools**, **returns portal**, **shipping automation**, etc. (usually Shopify apps).

Operational reminders:
- **Privacy/consent**: ensure cookie/consent settings are configured for US requirements and any future expansion (GDPR/CCPA considerations).
- **Email deliverability**: set up SPF/DKIM/DMARC for your sending domain (Resend guides this).
- **Content security policy**: third-party widgets/pixels may require CSP updates; treat this as ongoing maintenance.

## Suggested “v1” library list (short)
- Core: `@shopify/hydrogen`, `react`, `react-dom`, `typescript`
- GraphQL + TypeScript: Start with Shopify CLI built-in `shopify hydrogen codegen`, or add `@graphql-codegen/cli`, `@graphql-codegen/typescript`, `@graphql-codegen/typescript-operations`, `@graphql-codegen/typed-document-node` for advanced needs
- Styling: `tailwindcss`, `clsx`, `tailwind-merge`
- UI primitives: `@radix-ui/react-*` (as needed), `lucide-react`
- Motion: `motion` (default), add `framer-motion` only if route/page transitions require it
- Forms/validation: `react-hook-form`, `zod`
- Email (contact form): `resend`
- Email templates: `react-email` (and `@react-email/components`)
- Reviews: `@judgeme/shopify-hydrogen`
- Image placeholders (optional): `react-blurhash` or `blurhash` (for premium loading experience)
- Testing: `vitest`, `@testing-library/react`, `playwright`
- Observability (optional): `@sentry/remix` (or the Hydrogen-compatible Sentry package set)

---

## Suggested Implementation Roadmap (phased approach)

Rather than treating all features as equal priority, this phased approach focuses on getting a high-quality foundation before adding sophistication.

### Phase 1.1: The "Golden Path" (Foundation)
**Goal**: Get the core purchase flow working perfectly, end-to-end.

**Focus**: Home → PDP → Add to Cart → Checkout handoff

**Deliverables:**
- [ ] Project setup (Shopify CLI, Hydrogen, Oxygen connection)
- [ ] Basic routing structure (home, collections, PDP, cart)
- [ ] Shopify Storefront API integration (products, variants, cart)
- [ ] Cart implementation (add/update/remove, cart drawer)
- [ ] Checkout handoff to Shopify checkout
- [ ] Basic SEO (meta tags, OpenGraph)
- [ ] Core styling (Tailwind, brand tokens, responsive)
- [ ] GraphQL Codegen setup (type safety)

**Testing:**
- Playwright E2E test: Happy path from homepage to checkout
- Manual testing on mobile + desktop
- Lighthouse audit: Core Web Vitals targets (LCP < 2.5s, CLS < 0.1)

**Success Criteria**: A customer can browse, add a product to cart, and check out without errors.

---

### Phase 1.2: The "Trust Layer" (Credibility)
**Goal**: Build trust signals that convert first-time visitors into customers.

**Focus**: Reviews, social proof, trust badges, Schema.org, empathetic UX

**Deliverables:**
- [ ] Judge.me integration (reviews on PDP and `/reviews` page)
- [ ] Schema.org structured data:
  - [ ] Product schema (PDP)
  - [ ] Review schema (via Judge.me)
  - [ ] Organization schema (root layout)
  - [ ] BreadcrumbList schema (all pages)
  - [ ] FAQ schema (support pages)
- [ ] Recovery-specific UI polish:
  - [ ] Empathetic error messaging
  - [ ] WCAG AA contrast verification
  - [ ] Loading states with context
  - [ ] Trust signals (return policy, security badges)
- [ ] Contact form (Resend integration)
- [ ] Newsletter signup (Resend Audiences, double opt-in)

**Testing:**
- Google Rich Results Test (validate all schema)
- Accessibility audit (axe DevTools, manual keyboard nav)
- Social proof validation (reviews display correctly)

**Success Criteria**: First-time visitors can see social proof, understand the brand's credibility, and feel confident purchasing.

---

### Phase 1.3: Performance Polish (Speed & UX)
**Goal**: Optimize for Core Web Vitals and premium user experience.

**Focus**: Caching, image optimization, placeholder strategies, reduced motion

**Deliverables:**
- [ ] Cache-Control strategy implementation:
  - [ ] PDP: `public, max-age=3600, stale-while-revalidate=86400`
  - [ ] Collections: `public, max-age=1800, stale-while-revalidate=3600`
  - [ ] Homepage: `public, max-age=600, stale-while-revalidate=1800`
- [ ] Image optimization:
  - [ ] Dominant color placeholders for product images
  - [ ] Blurhash for hero images
  - [ ] Explicit aspect ratios to prevent CLS
  - [ ] Lazy loading for below-fold images
- [ ] Video optimization (if applicable):
  - [ ] Poster-first approach
  - [ ] Lazy video loading
  - [ ] Reduced motion fallback
- [ ] Shopify webhook setup (optional):
  - [ ] `products/update` webhook for cache purging
  - [ ] `inventory_levels/update` webhook
- [ ] Animation polish:
  - [ ] Route transitions (if using Framer Motion)
  - [ ] Micro-interactions (hover states, button feedback)
  - [ ] Respect `prefers-reduced-motion`

**Testing:**
- Lighthouse CI in production
- WebPageTest on 3G/4G connections
- CLS testing (no layout shift during image load)
- Oxygen edge caching verification

**Success Criteria**: Lighthouse scores: Performance 90+, Accessibility 100, Best Practices 100, SEO 100. Real-world LCP < 2.5s, CLS < 0.1.

---

### Phase 2: Personalization & Content (Enhancement)
**Goal**: Add personalization features and editorial content capabilities.

**Focus**: Engraving, CMS integration, blog, milestone-specific content

**Deliverables:**
- [ ] Line item properties for engraving
- [ ] Cart attributes for gift messages
- [ ] Validation for personalization fields
- [ ] Display of line item properties in cart/drawer
- [ ] CMS integration (Sanity or Contentful)
- [ ] Blog functionality
- [ ] About/Mission page with CMS content
- [ ] Recovery resources section

**Success Criteria**: Customers can add custom engraving and see it reflected in their cart. Editorial content is manageable without engineering involvement.

---

### Phase 3: Advanced Features (Optimization)
**Goal**: Layer in advanced features based on actual user behavior.

**Focus**: Customer accounts, advanced analytics, experimentation

**Deliverables:**
- [ ] Customer accounts (optional, if needed)
- [ ] Order history
- [ ] Saved addresses
- [ ] Advanced analytics (Sentry, custom events)
- [ ] A/B testing framework (if needed)
- [ ] Additional payment methods
- [ ] International expansion (if needed)

**Success Criteria**: Features driven by real user needs and analytics insights.

---

## Open decisions / next research questions
1. Personalization: do tokens need engraving, custom packaging, or bundles?
2. Content strategy: pick a CMS (Sanity vs Contentful) for editorial content, and define the Shopify ↔ CMS linking identifier (handle vs GID).
3. Animation ambition: micro-interactions only, or marketing-level scroll-based motion on landing pages.
4. Design system depth: shadcn-style component ownership vs fully custom components from primitives.
5. Accounts scope (US-only): guest-only vs Customer Accounts (order history, addresses) for v1.

