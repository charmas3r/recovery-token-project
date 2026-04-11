# SEO: Canonicals + BreadcrumbList Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the two highest-impact technical SEO gaps on the Coinplugz storefront — emit absolute `<link rel="canonical">` on every public route, and emit `BreadcrumbList` JSON-LD on the commerce routes that currently lack it (product, collection, blog, article, page, custom-token landing).

**Architecture:** Two small additive helpers plus per-route wiring:

1. **`buildMeta` extension (`app/lib/meta.ts`)** — add a `canonical` option that accepts a root-relative path (or absolute URL) and emits a `{tagName: 'link', rel: 'canonical', href: '...'}` entry. Centralises canonical handling so routes just pass a path. Existing `url` handling is reused (canonical defaults to `url` when not supplied).
2. **`buildBreadcrumbList` helper (`app/lib/jsonld.ts`)** — pure function returning a Schema.org `BreadcrumbList` object. Routes build a small `[{name, path}]` array and pipe it to `<JsonLd data={buildBreadcrumbList(trail)} />`. Also used to DRY the ~11 inline BreadcrumbList objects already living in the `about/`, `resources/`, `support/`, `reviews` routes.

No structural refactor of `JsonLd`, no root-loader changes, no env var plumbing. Site URL is hardcoded to `https://coinplugz.com` inside `meta.ts` and `jsonld.ts` — matches the existing pattern in `products.$handle.tsx:511` and `support.faq.tsx:80`. Can be promoted to an env var in a follow-up.

**Tech Stack:** Hydrogen 2025 / React Router v7 / TypeScript / Schema.org JSON-LD

**Out of scope (intentional — do not expand):**
- **FAQPage JSON-LD** — already emitted by `app/components/seo/SEOFaqAccordion.tsx` (used by all three SEO landing templates) and inline at `app/routes/($locale).support.faq.tsx:59`. A verification step is included at the end to confirm these are still wired up.
- **hreflang alternates** — requires multi-locale plumbing from the root loader; separate plan.
- **`WebSite` + `SearchAction` schema** — separate plan.
- **`Article` / `BlogPosting` schema** on `blogs.$blogHandle.$articleHandle.tsx` and `resources.articles.$slug.tsx` — tempting to bundle, but needs `datePublished` / `dateModified` / `author` data wiring. Separate plan.
- **`noindex` for funnel pages** (`cart`, `search`, `custom-token/we-design/*`, `custom-token/you-design/*`, `account/*`) — robots.txt already blocks most of these. Separate plan if needed.
- **Refactoring existing inline `BreadcrumbList` objects** on about/resources/support/reviews to the new helper — included as Task 10 (optional polish). Can be skipped to ship faster.

---

## File Structure

**Create:**
- `app/lib/jsonld.ts` — `buildBreadcrumbList()` helper (pure, no React)

**Modify:**
- `app/lib/meta.ts` — add `canonical` option to `buildMeta` + `SITE_URL` constant
- `app/routes/($locale)._index.tsx` — canonical
- `app/routes/($locale).products.$handle.tsx` — canonical via buildMeta (remove inline one) + BreadcrumbList JSON-LD
- `app/routes/($locale).collections._index.tsx` — canonical + BreadcrumbList
- `app/routes/($locale).collections.$handle.tsx` — canonical + BreadcrumbList
- `app/routes/($locale).collections.all.tsx` — canonical + BreadcrumbList
- `app/routes/($locale).blogs._index.tsx` — canonical + BreadcrumbList
- `app/routes/($locale).blogs.$blogHandle._index.tsx` — canonical + BreadcrumbList
- `app/routes/($locale).blogs.$blogHandle.$articleHandle.tsx` — canonical + BreadcrumbList
- `app/routes/($locale).pages.$handle.tsx` — canonical + BreadcrumbList
- `app/routes/($locale).custom-token._index.tsx` — add `meta` export with canonical + BreadcrumbList
- `app/routes/($locale).policies.$handle.tsx` — canonical
- `app/routes/($locale).about._index.tsx`, `.about.our-story.tsx`, `.about.testimonials.tsx`, `.about.why-tokens-matter.tsx` — canonical (one-liner each)
- `app/routes/($locale).resources._index.tsx`, `.resources.articles._index.tsx`, `.resources.articles.$slug.tsx`, `.resources.glossary._index.tsx`, `.resources.milestone-calculator.tsx` — canonical
- `app/routes/($locale).support._index.tsx`, `.support.faq.tsx`, `.support.shipping-returns.tsx` — canonical
- `app/routes/($locale).reviews.tsx` — canonical
- `app/routes/($locale).contact.tsx` — canonical

**Test strategy:** This project has no test harness for route meta. Verification is:
1. `npm run typecheck` must pass after each task.
2. `npm run dev`, open each touched route, View Source, and confirm the `<link rel="canonical" ...>` and `<script type="application/ld+json">` tags are present and well-formed.
3. Spot-check with Google's Rich Results Test (https://search.google.com/test/rich-results) on a deployed preview before shipping — captured in the final task.

---

## Task 1: Extend `buildMeta` with canonical support

**Files:**
- Modify: `app/lib/meta.ts` (full rewrite — file is 58 lines)

- [ ] **Step 1: Replace `app/lib/meta.ts` with the new version**

```ts
const SITE_NAME = 'Coinplugz';
const SITE_URL = 'https://coinplugz.com';
const DEFAULT_OG_IMAGE =
  'https://cdn.shopify.com/s/files/1/0980/8330/7822/files/og-image.webp?v=1773774508';
const DEFAULT_DESCRIPTION =
  'Premium hand-crafted recovery tokens celebrating sobriety milestones.';

interface BuildMetaOptions {
  title: string;
  description?: string;
  ogImage?: string;
  ogImageWidth?: string;
  ogImageHeight?: string;
  ogType?: string;
  url?: string;
  canonical?: string;
  noIndex?: boolean;
  extra?: Array<Record<string, string>>;
}

/**
 * Resolve an absolute URL from a root-relative path or pass-through an
 * already-absolute URL. Strips a trailing slash except at the site root.
 */
function resolveUrl(value?: string): string | undefined {
  if (!value) return undefined;
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }
  const path = value.startsWith('/') ? value : `/${value}`;
  const full = `${SITE_URL}${path}`;
  return full.length > SITE_URL.length + 1 && full.endsWith('/')
    ? full.slice(0, -1)
    : full;
}

export function buildMeta({
  title,
  description = DEFAULT_DESCRIPTION,
  ogImage = DEFAULT_OG_IMAGE,
  ogImageWidth = '1200',
  ogImageHeight = '630',
  ogType = 'website',
  url,
  canonical,
  noIndex,
  extra = [],
}: BuildMetaOptions) {
  const absoluteUrl = resolveUrl(url);
  const absoluteCanonical = resolveUrl(canonical) ?? absoluteUrl;

  const meta: Array<Record<string, string>> = [
    {title},
    {name: 'description', content: description},
    {property: 'og:title', content: title},
    {property: 'og:description', content: description},
    {property: 'og:image', content: ogImage},
    {property: 'og:image:width', content: ogImageWidth},
    {property: 'og:image:height', content: ogImageHeight},
    {property: 'og:type', content: ogType},
    {property: 'og:site_name', content: SITE_NAME},
    {name: 'twitter:card', content: 'summary_large_image'},
    {name: 'twitter:title', content: title},
    {name: 'twitter:description', content: description},
    {name: 'twitter:image', content: ogImage},
  ];

  if (absoluteUrl) {
    meta.push({property: 'og:url', content: absoluteUrl});
  }

  if (absoluteCanonical) {
    meta.push({
      tagName: 'link',
      rel: 'canonical',
      href: absoluteCanonical,
    });
  }

  if (noIndex) {
    meta.push({name: 'robots', content: 'noindex,nofollow'});
  }

  meta.push(...extra);

  return meta;
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: PASS. Note: existing `extra` entries emitting `{tagName: 'link', rel: 'canonical', href: ...}` in `products.$handle.tsx` will now be duplicated at runtime — that's fine for this task because Task 4 removes the inline one before the combination reaches production.

- [ ] **Step 3: Commit**

```bash
git add app/lib/meta.ts
git commit -m "feat(seo): add canonical URL support to buildMeta helper"
```

---

## Task 2: Create `BreadcrumbList` JSON-LD helper

**Files:**
- Create: `app/lib/jsonld.ts`

- [ ] **Step 1: Create `app/lib/jsonld.ts`**

```ts
/**
 * Schema.org JSON-LD builders.
 * Pure functions — callers pipe the result into <JsonLd data={...} />.
 */

const SITE_URL = 'https://coinplugz.com';

export interface BreadcrumbItem {
  name: string;
  path: string;
}

/**
 * Build a Schema.org BreadcrumbList object for JSON-LD output.
 *
 * The caller is responsible for including the `Home` entry as the first item
 * when appropriate — the function does not prepend it for you, so the
 * breadcrumb trail stays under the caller's control and matches the visible UI.
 */
export function buildBreadcrumbList(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path.startsWith('/') ? item.path : `/${item.path}`}`,
    })),
  };
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add app/lib/jsonld.ts
git commit -m "feat(seo): add BreadcrumbList JSON-LD helper"
```

---

## Task 3: Canonical on homepage + custom-token landing

**Files:**
- Modify: `app/routes/($locale)._index.tsx`
- Modify: `app/routes/($locale).custom-token._index.tsx`

- [ ] **Step 1: Update homepage meta (`app/routes/($locale)._index.tsx:210-222`)**

Replace:

```ts
export const meta: Route.MetaFunction = ({data}) => {
  if (data?.seoPage) {
    return buildMeta({
      title: data.seoPage.metaTitle,
      description: data.seoPage.metaDescription,
    });
  }
  return buildMeta({
    title: 'Coinplugz | Premium Recovery Tokens for Every Milestone',
    description:
      'Premium hand-crafted recovery tokens celebrating sobriety milestones. Honor every step of your journey with tokens made to last a lifetime.',
  });
};
```

With:

```ts
export const meta: Route.MetaFunction = ({data, params}) => {
  // ($locale) is used as an SEO slug on the home route — when present, the
  // canonical should be the slug path, not '/'.
  const canonical = params.locale ? `/${params.locale}` : '/';

  if (data?.seoPage) {
    return buildMeta({
      title: data.seoPage.metaTitle,
      description: data.seoPage.metaDescription,
      canonical,
    });
  }
  return buildMeta({
    title: 'Coinplugz | Premium Recovery Tokens for Every Milestone',
    description:
      'Premium hand-crafted recovery tokens celebrating sobriety milestones. Honor every step of your journey with tokens made to last a lifetime.',
    canonical: '/',
  });
};
```

- [ ] **Step 2: Add meta export to `app/routes/($locale).custom-token._index.tsx`**

At the top of the file, after the existing imports (currently `updateCustomTokenSession`, etc.), add:

```ts
import {buildMeta} from '~/lib/meta';
```

Then, after the `action` export and before `export default function CustomTokenLanding`, add:

```ts
export const meta: Route.MetaFunction = () => {
  return buildMeta({
    title: 'Create Your Own Token | Custom Recovery Tokens | Coinplugz',
    description:
      'Design a custom recovery token with our guided wizard — choose materials, engraving, and occasion for a one-of-a-kind sobriety milestone keepsake.',
    canonical: '/custom-token',
  });
};
```

You will also need to import the `Route` type at the top:

```ts
import type {Route} from './+types/($locale).custom-token._index';
```

Note: the existing import on line 2 is already `import type {Route} from './+types/($locale).custom-token._index';` — confirm and reuse it, do not duplicate.

- [ ] **Step 3: Typecheck + manual verification**

Run: `npm run typecheck`
Expected: PASS.

Run: `npm run dev`
Open: `http://localhost:3000/` — View Source, confirm `<link rel="canonical" href="https://coinplugz.com/">`.
Open: `http://localhost:3000/custom-token` — View Source, confirm `<link rel="canonical" href="https://coinplugz.com/custom-token">`.

- [ ] **Step 4: Commit**

```bash
git add "app/routes/(\$locale)._index.tsx" "app/routes/(\$locale).custom-token._index.tsx"
git commit -m "feat(seo): emit canonical on homepage and custom-token landing"
```

---

## Task 4: Product PDP — canonical through buildMeta + BreadcrumbList JSON-LD

**Files:**
- Modify: `app/routes/($locale).products.$handle.tsx`

Current state: canonical is emitted via an inline `extra: [{tagName: 'link', rel: 'canonical', href: \`/products/${product.handle}\`}, ...]` block (relative URL — wrong). Product schema already exists but `BreadcrumbList` does not.

- [ ] **Step 1: Switch canonical to the `buildMeta` param**

Replace the `meta` export at `app/routes/($locale).products.$handle.tsx:36-65`:

```ts
export const meta: Route.MetaFunction = ({data}) => {
  const product = data?.product;

  if (!product) {
    return [{title: 'Product Not Found'}];
  }

  return buildMeta({
    title: `${product.title} | Coinplugz`,
    description: product.description,
    ogImage: product.selectedOrFirstAvailableVariant?.image?.url || undefined,
    ogType: 'product',
    url: `/products/${product.handle}`,
    extra: [
      {
        tagName: 'link',
        rel: 'canonical',
        href: `/products/${product.handle}`,
      },
      {
        property: 'product:price:amount',
        content: product.selectedOrFirstAvailableVariant?.price.amount,
      },
      {
        property: 'product:price:currency',
        content: product.selectedOrFirstAvailableVariant?.price.currencyCode,
      },
    ],
  });
};
```

With:

```ts
export const meta: Route.MetaFunction = ({data}) => {
  const product = data?.product;

  if (!product) {
    return [{title: 'Product Not Found'}];
  }

  return buildMeta({
    title: `${product.title} | Coinplugz`,
    description: product.description,
    ogImage: product.selectedOrFirstAvailableVariant?.image?.url || undefined,
    ogType: 'product',
    url: `/products/${product.handle}`,
    canonical: `/products/${product.handle}`,
    extra: [
      {
        property: 'product:price:amount',
        content: product.selectedOrFirstAvailableVariant?.price.amount,
      },
      {
        property: 'product:price:currency',
        content: product.selectedOrFirstAvailableVariant?.price.currencyCode,
      },
    ],
  });
};
```

Diff summary: the `{tagName: 'link', rel: 'canonical', href: ...}` entry is removed from `extra`, and a top-level `canonical: \`/products/${product.handle}\`` is added. `buildMeta` now produces the absolute canonical.

- [ ] **Step 2: Add `BreadcrumbList` JSON-LD**

At the top of the file, add the import:

```ts
import {buildBreadcrumbList} from '~/lib/jsonld';
```

(Keep it grouped with the existing `import {JsonLd} from '~/components/seo/JsonLd';`.)

Then, inside the default component function, immediately after the existing `breadcrumbItems` array at `app/routes/($locale).products.$handle.tsx:487-490`, add:

```ts
  // Build BreadcrumbList JSON-LD mirroring the visible breadcrumb trail.
  const breadcrumbSchema = buildBreadcrumbList([
    {name: 'Home', path: '/'},
    {name: 'Shop', path: '/collections/all'},
    {name: title, path: `/products/${product.handle}`},
  ]);
```

Then, in the JSX, find the existing `<JsonLd data={productSchema} />` at `app/routes/($locale).products.$handle.tsx:525` and add a second `<JsonLd>` below it:

```tsx
      {/* JSON-LD Structured Data */}
      <JsonLd data={productSchema} />
      <JsonLd data={breadcrumbSchema} />
```

- [ ] **Step 3: Typecheck + manual verification**

Run: `npm run typecheck`
Expected: PASS.

Run: `npm run dev`
Open: `http://localhost:3000/products/<any-handle>` — View Source, confirm:
  1. Exactly one `<link rel="canonical" href="https://coinplugz.com/products/<handle>">`.
  2. Two `<script type="application/ld+json">` blocks — one `Product`, one `BreadcrumbList` with three items (Home → Shop → product title).

- [ ] **Step 4: Commit**

```bash
git add "app/routes/(\$locale).products.\$handle.tsx"
git commit -m "feat(seo): absolute canonical and BreadcrumbList JSON-LD on product PDP"
```

---

## Task 5: Collection routes — canonical + BreadcrumbList

**Files:**
- Modify: `app/routes/($locale).collections._index.tsx`
- Modify: `app/routes/($locale).collections.$handle.tsx`
- Modify: `app/routes/($locale).collections.all.tsx`

- [ ] **Step 1: `collections._index.tsx` — update meta**

Replace `app/routes/($locale).collections._index.tsx:8-14`:

```ts
export const meta: Route.MetaFunction = () => {
  return buildMeta({
    title: 'Collections | Coinplugz',
    description:
      'Browse our curated collections of premium recovery tokens for every milestone.',
  });
};
```

With:

```ts
export const meta: Route.MetaFunction = () => {
  return buildMeta({
    title: 'Collections | Coinplugz',
    description:
      'Browse our curated collections of premium recovery tokens for every milestone.',
    canonical: '/collections',
  });
};
```

- [ ] **Step 2: `collections._index.tsx` — add BreadcrumbList JSON-LD**

Add imports at the top of the file (after existing imports):

```ts
import {JsonLd} from '~/components/seo/JsonLd';
import {buildBreadcrumbList} from '~/lib/jsonld';
```

Inside the default exported component, as the very first child of the returned JSX, add:

```tsx
<JsonLd
  data={buildBreadcrumbList([
    {name: 'Home', path: '/'},
    {name: 'Collections', path: '/collections'},
  ])}
/>
```

- [ ] **Step 3: `collections.$handle.tsx` — update meta**

Replace `app/routes/($locale).collections.$handle.tsx:10-17`:

```ts
export const meta: Route.MetaFunction = ({data}) => {
  const title = data?.collection?.title
    ? `${data.collection.title} Collection | Coinplugz`
    : 'Collection | Coinplugz';
  const description = data?.collection?.description || undefined;
  const ogImage = data?.collection?.image?.url || undefined;
  return buildMeta({title, description, ogImage});
};
```

With:

```ts
export const meta: Route.MetaFunction = ({data}) => {
  const handle = data?.collection?.handle;
  const title = data?.collection?.title
    ? `${data.collection.title} Collection | Coinplugz`
    : 'Collection | Coinplugz';
  const description = data?.collection?.description || undefined;
  const ogImage = data?.collection?.image?.url || undefined;
  return buildMeta({
    title,
    description,
    ogImage,
    canonical: handle ? `/collections/${handle}` : undefined,
  });
};
```

- [ ] **Step 4: `collections.$handle.tsx` — add BreadcrumbList JSON-LD**

Add imports at the top (after existing imports):

```ts
import {JsonLd} from '~/components/seo/JsonLd';
import {buildBreadcrumbList} from '~/lib/jsonld';
```

Inside the default exported `Collection` component, read the collection from loader data (it already does — `const {collection} = useLoaderData<typeof loader>();`). As the first child of the returned JSX, add:

```tsx
<JsonLd
  data={buildBreadcrumbList([
    {name: 'Home', path: '/'},
    {name: 'Collections', path: '/collections'},
    {name: collection.title, path: `/collections/${collection.handle}`},
  ])}
/>
```

- [ ] **Step 5: `collections.all.tsx` — update meta**

Replace `app/routes/($locale).collections.all.tsx:11-17`:

```ts
export const meta: Route.MetaFunction = () => {
  return buildMeta({
    title: 'All Products | Coinplugz',
    description:
      'Browse our full collection of premium recovery tokens celebrating sobriety milestones.',
  });
};
```

With:

```ts
export const meta: Route.MetaFunction = () => {
  return buildMeta({
    title: 'All Products | Coinplugz',
    description:
      'Browse our full collection of premium recovery tokens celebrating sobriety milestones.',
    canonical: '/collections/all',
  });
};
```

- [ ] **Step 6: `collections.all.tsx` — add BreadcrumbList JSON-LD**

Add imports at the top (after existing imports):

```ts
import {JsonLd} from '~/components/seo/JsonLd';
import {buildBreadcrumbList} from '~/lib/jsonld';
```

As the first child of the default component's returned JSX:

```tsx
<JsonLd
  data={buildBreadcrumbList([
    {name: 'Home', path: '/'},
    {name: 'Collections', path: '/collections'},
    {name: 'All Products', path: '/collections/all'},
  ])}
/>
```

- [ ] **Step 7: Typecheck + manual verification**

Run: `npm run typecheck`
Expected: PASS.

Run: `npm run dev`. Verify each of `/collections`, `/collections/all`, `/collections/<any-handle>`:
  1. Exactly one `<link rel="canonical" ...>` with the absolute URL.
  2. One `BreadcrumbList` JSON-LD block.

- [ ] **Step 8: Commit**

```bash
git add "app/routes/(\$locale).collections*.tsx"
git commit -m "feat(seo): canonical and BreadcrumbList JSON-LD on collection routes"
```

---

## Task 6: Blog / article routes — canonical + BreadcrumbList

**Files:**
- Modify: `app/routes/($locale).blogs._index.tsx`
- Modify: `app/routes/($locale).blogs.$blogHandle._index.tsx`
- Modify: `app/routes/($locale).blogs.$blogHandle.$articleHandle.tsx`

- [ ] **Step 1: `blogs._index.tsx` — update meta + add BreadcrumbList**

Replace `app/routes/($locale).blogs._index.tsx:10-16`:

```ts
export const meta: Route.MetaFunction = () => {
  return buildMeta({
    title: 'Blog | Coinplugz',
    description:
      'Stories, guides, and insights about recovery milestones and the journey of sobriety.',
  });
};
```

With:

```ts
export const meta: Route.MetaFunction = () => {
  return buildMeta({
    title: 'Blog | Coinplugz',
    description:
      'Stories, guides, and insights about recovery milestones and the journey of sobriety.',
    canonical: '/blogs',
  });
};
```

Add imports at the top:

```ts
import {JsonLd} from '~/components/seo/JsonLd';
import {buildBreadcrumbList} from '~/lib/jsonld';
```

As the first child of the default component's returned JSX:

```tsx
<JsonLd
  data={buildBreadcrumbList([
    {name: 'Home', path: '/'},
    {name: 'Blog', path: '/blogs'},
  ])}
/>
```

- [ ] **Step 2: `blogs.$blogHandle._index.tsx` — update meta**

Replace `app/routes/($locale).blogs.$blogHandle._index.tsx:9-14`:

```ts
export const meta: Route.MetaFunction = ({data}) => {
  const title = data?.blog?.title
    ? `${data.blog.title} | Coinplugz`
    : 'Blog | Coinplugz';
  return buildMeta({title});
};
```

With:

```ts
export const meta: Route.MetaFunction = ({data}) => {
  const handle = data?.blog?.handle;
  const title = data?.blog?.title
    ? `${data.blog.title} | Coinplugz`
    : 'Blog | Coinplugz';
  return buildMeta({
    title,
    canonical: handle ? `/blogs/${handle}` : undefined,
  });
};
```

- [ ] **Step 3: `blogs.$blogHandle._index.tsx` — add BreadcrumbList**

Add imports at the top:

```ts
import {JsonLd} from '~/components/seo/JsonLd';
import {buildBreadcrumbList} from '~/lib/jsonld';
```

Inside the default component (which reads `blog` from loader data), as the first child of the returned JSX:

```tsx
<JsonLd
  data={buildBreadcrumbList([
    {name: 'Home', path: '/'},
    {name: 'Blog', path: '/blogs'},
    {name: blog.title, path: `/blogs/${blog.handle}`},
  ])}
/>
```

(Confirm the loader data variable is called `blog` before writing; if the component destructures `const {blog} = useLoaderData<typeof loader>();`, no change needed. Otherwise rename to match.)

- [ ] **Step 4: `blogs.$blogHandle.$articleHandle.tsx` — update meta**

Replace `app/routes/($locale).blogs.$blogHandle.$articleHandle.tsx:7-20`:

```ts
export const meta: Route.MetaFunction = ({data}) => {
  const article = data?.article;
  const title = article?.title
    ? `${article.title} | Coinplugz`
    : 'Article | Coinplugz';
  return buildMeta({
    title,
    description: article?.contentHtml
      ? article.contentHtml.replace(/<[^>]*>/g, '').slice(0, 160)
      : undefined,
    ogImage: article?.image?.url || undefined,
    ogType: 'article',
  });
};
```

With:

```ts
export const meta: Route.MetaFunction = ({data, params}) => {
  const article = data?.article;
  const title = article?.title
    ? `${article.title} | Coinplugz`
    : 'Article | Coinplugz';
  const canonical =
    params.blogHandle && params.articleHandle
      ? `/blogs/${params.blogHandle}/${params.articleHandle}`
      : undefined;
  return buildMeta({
    title,
    description: article?.contentHtml
      ? article.contentHtml.replace(/<[^>]*>/g, '').slice(0, 160)
      : undefined,
    ogImage: article?.image?.url || undefined,
    ogType: 'article',
    canonical,
  });
};
```

- [ ] **Step 5: `blogs.$blogHandle.$articleHandle.tsx` — add BreadcrumbList**

Add imports at the top:

```ts
import {JsonLd} from '~/components/seo/JsonLd';
import {buildBreadcrumbList} from '~/lib/jsonld';
```

Inside the default component (which reads `article` and the params), as the first child of the returned JSX:

```tsx
<JsonLd
  data={buildBreadcrumbList([
    {name: 'Home', path: '/'},
    {name: 'Blog', path: '/blogs'},
    {name: article.title, path: `/blogs/${params.blogHandle}/${params.articleHandle}`},
  ])}
/>
```

If the default component does not currently destructure `params` from `useParams()`, add:

```ts
import {useParams} from 'react-router';
```

and inside the component:

```ts
const params = useParams();
```

- [ ] **Step 6: Typecheck + manual verification**

Run: `npm run typecheck`
Expected: PASS.

Run: `npm run dev`. Verify:
  - `/blogs`
  - `/blogs/<any-blog>`
  - `/blogs/<any-blog>/<any-article>`

each have the canonical tag and a `BreadcrumbList` JSON-LD block.

- [ ] **Step 7: Commit**

```bash
git add "app/routes/(\$locale).blogs*.tsx"
git commit -m "feat(seo): canonical and BreadcrumbList JSON-LD on blog and article routes"
```

---

## Task 7: `pages.$handle.tsx` + `policies.$handle.tsx` — canonical + BreadcrumbList

**Files:**
- Modify: `app/routes/($locale).pages.$handle.tsx`
- Modify: `app/routes/($locale).policies.$handle.tsx`

- [ ] **Step 1: `pages.$handle.tsx` — update meta**

Replace `app/routes/($locale).pages.$handle.tsx:6-11`:

```ts
export const meta: Route.MetaFunction = ({data}) => {
  const title = data?.page?.title
    ? `${data.page.title} | Coinplugz`
    : 'Coinplugz';
  return buildMeta({title});
};
```

With:

```ts
export const meta: Route.MetaFunction = ({data, params}) => {
  const title = data?.page?.title
    ? `${data.page.title} | Coinplugz`
    : 'Coinplugz';
  return buildMeta({
    title,
    canonical: params.handle ? `/pages/${params.handle}` : undefined,
  });
};
```

- [ ] **Step 2: `pages.$handle.tsx` — add BreadcrumbList**

Add imports at the top:

```ts
import {JsonLd} from '~/components/seo/JsonLd';
import {buildBreadcrumbList} from '~/lib/jsonld';
```

Inside the default component (which reads `page` from loader data), as the first child of the returned JSX:

```tsx
<JsonLd
  data={buildBreadcrumbList([
    {name: 'Home', path: '/'},
    {name: page.title, path: `/pages/${page.handle}`},
  ])}
/>
```

- [ ] **Step 3: `policies.$handle.tsx` — update meta**

Replace `app/routes/($locale).policies.$handle.tsx:11-16`:

```ts
export const meta: Route.MetaFunction = ({data}) => {
  const title = data?.policy?.title
    ? `${data.policy.title} | Coinplugz`
    : 'Policy | Coinplugz';
  return buildMeta({title});
};
```

With:

```ts
export const meta: Route.MetaFunction = ({data, params}) => {
  const title = data?.policy?.title
    ? `${data.policy.title} | Coinplugz`
    : 'Policy | Coinplugz';
  return buildMeta({
    title,
    canonical: params.handle ? `/policies/${params.handle}` : undefined,
  });
};
```

- [ ] **Step 4: Typecheck + manual verification**

Run: `npm run typecheck`
Expected: PASS.

Run: `npm run dev`. Verify `/pages/<handle>` and `/policies/<handle>` have correct canonicals, and that `/pages/<handle>` has a `BreadcrumbList` JSON-LD.

- [ ] **Step 5: Commit**

```bash
git add "app/routes/(\$locale).pages.\$handle.tsx" "app/routes/(\$locale).policies.\$handle.tsx"
git commit -m "feat(seo): canonical on pages and policies, BreadcrumbList on pages"
```

---

## Task 8: Canonical batch — about / resources / support / reviews / contact

This is a mechanical one-line addition to 13 routes. All of them already use `buildMeta({...})`. Each change is: add `canonical: '<path>'` as the last field in the `buildMeta({})` call.

**Files and exact canonical values:**

| Route file | Canonical path |
|---|---|
| `app/routes/($locale).about._index.tsx` | `/about` |
| `app/routes/($locale).about.our-story.tsx` | `/about/our-story` |
| `app/routes/($locale).about.testimonials.tsx` | `/about/testimonials` |
| `app/routes/($locale).about.why-tokens-matter.tsx` | `/about/why-tokens-matter` |
| `app/routes/($locale).resources._index.tsx` | `/resources` |
| `app/routes/($locale).resources.articles._index.tsx` | `/resources/articles` |
| `app/routes/($locale).resources.articles.$slug.tsx` | `/resources/articles/${params.slug}` (use `({data, params})` signature) |
| `app/routes/($locale).resources.glossary._index.tsx` | `/resources/glossary` |
| `app/routes/($locale).resources.milestone-calculator.tsx` | `/resources/milestone-calculator` |
| `app/routes/($locale).support._index.tsx` | `/support` |
| `app/routes/($locale).support.faq.tsx` | `/support/faq` |
| `app/routes/($locale).support.shipping-returns.tsx` | `/support/shipping-returns` |
| `app/routes/($locale).reviews.tsx` | `/reviews` |
| `app/routes/($locale).contact.tsx` | `/contact` |

- [ ] **Step 1: Apply the `canonical:` addition to every file above**

For each file in the table, open it, find the existing `buildMeta({...})` call inside the exported `meta` function, and add a `canonical: '<path>'` entry as the last field of that object literal.

Example — **`app/routes/($locale).about._index.tsx`**: find the existing `return buildMeta({title: '...', description: '...'});` and turn it into:

```ts
return buildMeta({
  title: '...',
  description: '...',
  canonical: '/about',
});
```

Example — **`app/routes/($locale).resources.articles.$slug.tsx`**: if the meta signature is currently `({data}) => { ... }`, change it to `({data, params}) => { ... }` and add:

```ts
canonical: params.slug ? `/resources/articles/${params.slug}` : undefined,
```

- [ ] **Step 2: Verify no route was missed**

Run: `Grep "buildMeta\(" app/routes/\\($locale\\).about*.tsx app/routes/\\($locale\\).resources*.tsx app/routes/\\($locale\\).support*.tsx app/routes/\\($locale\\).reviews.tsx app/routes/\\($locale\\).contact.tsx`

Expected: every matching `buildMeta({...})` call contains a `canonical:` entry.

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 4: Spot-check in dev**

Run: `npm run dev`. Open at least three routes from the table (e.g., `/about`, `/support/faq`, `/resources/milestone-calculator`). View Source, confirm the canonical matches the expected absolute URL.

- [ ] **Step 5: Commit**

```bash
git add "app/routes/(\$locale).about*.tsx" "app/routes/(\$locale).resources*.tsx" "app/routes/(\$locale).support*.tsx" "app/routes/(\$locale).reviews.tsx" "app/routes/(\$locale).contact.tsx"
git commit -m "feat(seo): emit canonical URLs on about, resources, support, reviews, contact"
```

---

## Task 9: Verify FAQPage JSON-LD is still present (no code change expected)

**Files:** none modified — verification only.

`FAQPage` is already emitted by two paths:
1. `app/components/seo/SEOFaqAccordion.tsx:20-31` (used by `MilestoneLandingTemplate`, `CommercialLandingTemplate`, `GlossaryDetailTemplate`).
2. Inline at `app/routes/($locale).support.faq.tsx:59-70`.

This task just confirms none of the previous tasks regressed that output.

- [ ] **Step 1: Grep for `FAQPage`**

Run: `Grep "@type.*FAQPage" app/`
Expected: at least two matches — one in `SEOFaqAccordion.tsx`, one in `support.faq.tsx`.

- [ ] **Step 2: Manual verification**

Run: `npm run dev`. Open `http://localhost:3000/support/faq` — View Source, confirm one `<script type="application/ld+json">` block contains `"@type":"FAQPage"` with a populated `mainEntity` array.

Open one SEO landing page (check `app/data/seo-pages.ts` for a valid slug — try `http://localhost:3000/recovery-tokens` or whatever slug is live). Confirm the same.

- [ ] **Step 3: If FAQPage is missing from `support/faq`, stop and investigate**

Do not continue until resolved. The expected baseline is: both paths emit FAQPage unchanged from before this plan.

No commit for this task.

---

## Task 10 (optional polish): DRY existing inline BreadcrumbList objects to use the helper

These routes already have inline `BreadcrumbList` JSON-LD literals. Refactor to use `buildBreadcrumbList()` so there's one source of truth.

**Files:**
- `app/routes/($locale).about._index.tsx`
- `app/routes/($locale).about.our-story.tsx`
- `app/routes/($locale).about.testimonials.tsx`
- `app/routes/($locale).about.why-tokens-matter.tsx`
- `app/routes/($locale).resources._index.tsx`
- `app/routes/($locale).resources.articles._index.tsx`
- `app/routes/($locale).resources.articles.$slug.tsx`
- `app/routes/($locale).resources.glossary._index.tsx`
- `app/routes/($locale).resources.milestone-calculator.tsx`
- `app/routes/($locale).support._index.tsx`
- `app/routes/($locale).support.faq.tsx`
- `app/routes/($locale).support.shipping-returns.tsx`
- `app/routes/($locale).reviews.tsx`
- `app/components/seo/MilestoneLandingTemplate.tsx`
- `app/components/seo/CommercialLandingTemplate.tsx`
- `app/components/seo/GlossaryDetailTemplate.tsx`

- [ ] **Step 1: Replace each inline `BreadcrumbList` literal**

For each file, find the block that builds a `breadcrumbJsonLd` (or similarly named) object of the shape:

```ts
const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {'@type': 'ListItem', position: 1, name: 'Home', item: 'https://coinplugz.com/'},
    /* ... */
  ],
};
```

Replace it with:

```ts
const breadcrumbJsonLd = buildBreadcrumbList([
  {name: 'Home', path: '/'},
  /* ...translate each inline itemListElement entry to {name, path}... */
]);
```

Add the import at the top of the file:

```ts
import {buildBreadcrumbList} from '~/lib/jsonld';
```

**Important:** Preserve the exact order and names of items. The helper prepends `https://coinplugz.com` to each `path`, so drop the host prefix from the existing inline URLs.

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 3: Spot-check three routes in dev**

Run: `npm run dev`. Open three different routes from the list (e.g., `/about`, `/support/faq`, `/resources/articles`). View Source and confirm the `BreadcrumbList` JSON-LD output is byte-identical to what it was before the refactor (same items, same absolute URLs, same positions).

- [ ] **Step 4: Commit**

```bash
git add "app/routes/(\$locale).about*.tsx" "app/routes/(\$locale).resources*.tsx" "app/routes/(\$locale).support*.tsx" "app/routes/(\$locale).reviews.tsx" "app/components/seo/*Template.tsx"
git commit -m "refactor(seo): use buildBreadcrumbList helper on routes with inline BreadcrumbList JSON-LD"
```

---

## Task 11: Full-site verification + Rich Results Test

**Files:** none — QA only.

- [ ] **Step 1: Run typecheck + build**

```bash
npm run typecheck
npm run build
```

Expected: both PASS with no new warnings.

- [ ] **Step 2: Dev smoke test**

Run: `npm run dev`. Walk every canonical target:

1. `/`
2. `/products/<any-handle>`
3. `/collections`, `/collections/all`, `/collections/<any-handle>`
4. `/blogs`, `/blogs/<any-blog>`, `/blogs/<any-blog>/<any-article>`
5. `/pages/<any-handle>`
6. `/custom-token`
7. `/policies/<any-handle>`
8. `/about`, `/about/our-story`, `/about/testimonials`, `/about/why-tokens-matter`
9. `/resources`, `/resources/articles`, `/resources/articles/<slug>`, `/resources/glossary`, `/resources/milestone-calculator`
10. `/support`, `/support/faq`, `/support/shipping-returns`
11. `/reviews`, `/contact`

On each, confirm in View Source:
  - Exactly one `<link rel="canonical" href="https://coinplugz.com/...">` pointing to the absolute URL that matches the path.
  - No duplicate canonical tags.
  - The `og:url` value is an absolute URL (not relative).

On pages that should have BreadcrumbList JSON-LD (commerce routes touched in Tasks 4-7), confirm one `<script type="application/ld+json">` contains a valid `BreadcrumbList`.

- [ ] **Step 3: Google Rich Results Test (on a deployed preview)**

Deploy to your Oxygen preview environment. For each of the five page types below, paste the preview URL into https://search.google.com/test/rich-results and confirm:

1. Product detail page → `Product` + `BreadcrumbList` detected, no errors.
2. Collection detail page → `BreadcrumbList` detected, no errors.
3. Article page → `BreadcrumbList` detected, no errors.
4. FAQ page (`/support/faq`) → `FAQPage` + `BreadcrumbList` detected, no errors.
5. SEO landing page (any slug from `app/data/seo-pages.ts`) → `BreadcrumbList` + `FAQPage` detected, no errors.

- [ ] **Step 4: Google Search Console resubmission**

If Search Console is configured for the site, resubmit the sitemap (`https://coinplugz.com/sitemap.xml`) so Google picks up the new canonicals on its next crawl. Not strictly required — Google will also pick them up organically — but speeds up reindex.

- [ ] **Step 5: Final commit (docs only, if any cleanup)**

If you discovered any edge cases during smoke testing that need a fix, commit them here. Otherwise no commit.

---

## Rollback plan

Every task is a single self-contained commit. If any task regresses a route's SEO output, `git revert <sha>` of that commit is safe — no commit in this plan depends on state from a later commit. Tasks 1 and 2 (the helpers) are additive; reverting them requires first reverting all routes that import them.
