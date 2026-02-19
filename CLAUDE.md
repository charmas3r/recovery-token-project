# Recovery Token Store - Claude Code Reference

## Project Overview

Recovery Token Store is a premium Shopify Hydrogen storefront selling physical recovery tokens that celebrate sobriety milestones. The design prioritizes world-class aesthetics, performance, and emotional resonance.

**Tech Stack:** Hydrogen 2025.x | React Router v7 | TypeScript | Tailwind v4 | Radix UI | Shopify Storefront API

---

## Project Structure

```
recovery-token-store/
├── app/
│   ├── components/
│   │   ├── ui/                    # Reusable UI primitives
│   │   ├── product/               # Product components
│   │   ├── cart/                  # Cart components
│   │   ├── account/               # Account components
│   │   └── layout/                # Layout components
│   ├── lib/                       # Utilities and helpers
│   ├── routes/                    # Page routes
│   ├── graphql/                   # GraphQL queries/mutations
│   └── styles/
│       ├── tailwind.css           # Design tokens
│       ├── app.css               # Additional styles
│       └── reset.css             # Base reset
├── .cursor/
│   ├── skills/                   # AI skill documentation
│   └── rules/                    # AI enforcement rules
├── prd.md                        # Product requirements
├── DESIGN-SYSTEM.md             # Design patterns
└── server.ts                     # Server entry
```

---

## Code Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Components | PascalCase | `ProductCard.tsx`, `CartDrawer.tsx` |
| Functions | camelCase | `loadCriticalData`, `formatPrice` |
| Files (routes) | kebab-case | `($locale)._index.tsx` |
| Constants | SCREAMING_SNAKE | `FEATURED_COLLECTION_QUERY` |
| CSS Classes | Design tokens | `text-white`, `bg-white/[0.05]` |
| GraphQL | SCREAMING_SNAKE | `PRODUCT_QUERY`, `CART_FRAGMENT` |

**Import Organization:**
```typescript
// 1. React/React Router
import {Suspense} from 'react';
import {useLoaderData, Link} from 'react-router';

// 2. Third-party packages
import type {Route} from './+types/_index';

// 3. Internal components
import {Button} from '~/components/ui/Button';
import {ProductItem} from '~/components/product/ProductItem';

// 4. Utilities and types
import {formatPrice} from '~/lib/utils';
import type {Product} from 'storefrontapi.generated';
```

---

## Skills Reference

### When to Use Each Skill

**Always read the appropriate skill BEFORE implementing features:**

| Task | Skill Path | Priority |
|------|------------|----------|
| **Any UI/Styling Work** | `.cursor/skills/design-system/SKILL.md` | CRITICAL |
| Product pages, collections | `.cursor/skills/shopify-storefront-api/SKILL.md` | CRITICAL |
| Authentication, accounts | `.cursor/skills/shopify-customer-account-api/SKILL.md` | CRITICAL |
| Routes, loaders, actions | `.cursor/skills/react-router-patterns/SKILL.md` | CRITICAL |
| Form handling | `.cursor/skills/form-validation/SKILL.md` | HIGH |
| Cart operations | `.cursor/skills/cart-management/SKILL.md` | HIGH |
| Engraving, customization | `.cursor/skills/product-personalization/SKILL.md` | HIGH |
| GraphQL patterns | `.cursor/skills/graphql-queries/SKILL.md` | HIGH |
| UI components | `.cursor/skills/ui-components/SKILL.md` | HIGH |
| Animations | `.cursor/skills/framer-motion/SKILL.md` | HIGH |
| Meta tags, Schema.org | `.cursor/skills/seo-structured-data/SKILL.md` | MEDIUM |
| Klaviyo, newsletters | `.cursor/skills/email-integration/SKILL.md` | MEDIUM |
| Judge.me reviews | `.cursor/skills/reviews-integration/SKILL.md` | MEDIUM |

### Complete Skills List

All 13 skills have both SKILL.md (patterns) and REFERENCE.md (best practices):

**Foundation Skills:**
- `design-system` - Colors, typography, spacing, layout
- `framer-motion` - Animations, motion, micro-interactions

**Core Skills:**
- `shopify-storefront-api` - Product/collection data fetching
- `shopify-customer-account-api` - Authentication, accounts
- `form-validation` - Zod schemas, validation
- `react-router-patterns` - Routes, loaders, actions

**Commerce Skills:**
- `cart-management` - Cart operations
- `product-personalization` - Line item properties, engraving
- `graphql-queries` - Query structure, fragments

**Enhancement Skills:**
- `seo-structured-data` - Meta tags, Schema.org
- `ui-components` - UI primitives, Radix UI
- `email-integration` - Klaviyo email & marketing
- `reviews-integration` - Judge.me API

**Skills Index:** `.cursor/skills/INDEX.md`

### Active Rules

| Rule | File | When Applied |
|------|------|--------------|
| **Design System** | `.cursor/rules/design-system.mdc` | All UI work |
| **React Router** | `.cursor/rules/hydrogen-react-router.mdc` | All routing |

---

## Design System (CRITICAL)

**Before ANY UI work, read:** `.cursor/skills/design-system/SKILL.md` + `.cursor/skills/design-system/REFERENCE.md`

**CRITICAL: Dark theme site-wide.** `text-primary` is `#000000` (black) = invisible on dark backgrounds. Always use `text-white` for headings.

### Typography

```tsx
// Headings (always use font-display + text-white)
<h1 className="font-display text-hero text-white">Hero</h1>
<h2 className="font-display text-section text-white">Section</h2>
<h3 className="font-display text-subsection text-white">Subsection</h3>

// Body text
<p className="text-body-lg text-white/50">Large body</p>
<p className="text-body text-white/50">Standard body</p>
```

### Colors (Dark Theme)

```tsx
// Text
text-white         // Primary heading text
text-white/50      // Body text
text-white/40      // Helper/secondary text
text-accent        // #B8764F or #FFFF93 - Accent

// Backgrounds
bg-black           // Page background (or body default)
bg-white/[0.05]    // Subtle elevated area
bg-white/[0.03]    // Very subtle elevation

// Card backgrounds (inline style)
style={{background: 'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)'}}

// Borders
border-white/[0.08]  // Standard border
hover:border-white/[0.15]  // Hover state
```

### Spacing (8px grid)

```tsx
p-xs   // 4px
p-sm   // 8px
p-md   // 16px
p-lg   // 24px
p-xl   // 32px
p-2xl  // 48px
p-3xl  // 64px
```

### Required Patterns

**Eyebrow Text (before section headers):**
```tsx
<span className="inline-block text-accent text-caption uppercase tracking-[0.25em] font-semibold mb-4">
  Category
</span>
```

**Dark Card:**
```tsx
<div
  className="rounded-2xl border border-white/[0.08] hover:border-white/[0.15] transition-colors"
  style={{background: 'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)'}}
>
  <h3 className="text-white font-bold">Title</h3>
  <p className="text-white/50">Body</p>
</div>
```

**Buttons on Dark Backgrounds:**
```tsx
<Button variant="primary" className="!bg-accent !text-white">Primary</Button>
<Button variant="secondary" className="!border-white/30 !text-white">Secondary</Button>
```

**Image Glow Effect:**
```tsx
<div className="relative">
  <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-full scale-75" />
  <img src={image} className="relative" />
</div>
```

---

## React Router Patterns

**NEVER use `@remix-run/*` imports. ALWAYS use `react-router`.**

### Correct Imports

```tsx
// CORRECT
import {useLoaderData, Link, Form, useActionData} from 'react-router';
import type {Route} from './+types/_index';

// WRONG - Never use
import {...} from '@remix-run/react';
import {...} from 'react-router-dom';
```

### Route Pattern

```tsx
// app/routes/($locale)._index.tsx
import {useLoaderData} from 'react-router';
import type {Route} from './+types/_index';

export async function loader(args: Route.LoaderArgs) {
  const criticalData = await loadCriticalData(args);
  const deferredData = loadDeferredData(args);
  return {...criticalData, ...deferredData};
}

export default function Page() {
  const data = useLoaderData<typeof loader>();
  return <div>...</div>;
}
```

---

## GraphQL Patterns

**Read:** `.cursor/skills/graphql-queries/SKILL.md` + `.cursor/skills/graphql-queries/REFERENCE.md`

### Query Structure

```typescript
const PRODUCT_QUERY = `#graphql
  fragment ProductFragment on Product {
    id
    title
    handle
    featuredImage {
      url
      altText
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
  }
  query Product($handle: String!) {
    product(handle: $handle) {
      ...ProductFragment
    }
  }
` as const;
```

### Using Storefront API

```typescript
const {product} = await context.storefront.query(PRODUCT_QUERY, {
  variables: {handle},
  cache: CacheLong(),
});
```

---

## Component Patterns

### Button Component

```tsx
import {Button} from '~/components/ui/Button';

// Variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="tertiary">Tertiary</Button>
<Button variant="destructive">Delete</Button>

// Sizes (md/lg meet 44px touch target)
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
```

### Card Component (Dark Gradient)

```tsx
import {Card} from '~/components/ui/Card';

// Card uses dark gradient bg + border-white/[0.08] automatically
<Card hover>
  <Card.Image src={image} alt={title} aspectRatio="4/5" />
  <Card.Content>
    <Card.Title>{title}</Card.Title>   {/* text-white */}
    <Card.Price>{price}</Card.Price>
  </Card.Content>
</Card>
```

---

## Cart Management

**Read:** `.cursor/skills/cart-management/SKILL.md` + `.cursor/skills/cart-management/REFERENCE.md`

```tsx
import {CartForm} from '@shopify/hydrogen';

// Add to cart
<CartForm
  route="/cart"
  action={CartForm.ACTIONS.LinesAdd}
  inputs={{lines: [{merchandiseId: variantId, quantity: 1}]}}
>
  <Button type="submit">Add to Cart</Button>
</CartForm>
```

---

## Form Validation

**Read:** `.cursor/skills/form-validation/SKILL.md` + `.cursor/skills/form-validation/REFERENCE.md`

```typescript
import {z} from 'zod';

const ContactSchema = z.object({
  name: z.string().min(2, 'Name required'),
  email: z.string().email('Valid email required'),
  message: z.string().min(10, 'Message too short'),
});
```

---

## Framer Motion Animations

**Read:** `.cursor/skills/framer-motion/SKILL.md` (patterns) + `.cursor/skills/framer-motion/REFERENCE.md` (API reference)

### Animation Components

```tsx
import {
  FadeUp,
  SlideIn,
  ScaleIn,
  StaggerContainer,
  StaggerItem,
  HeroContent,
  HeroItem,
  HoverScale,
  HoverLift,
  motion,
} from '~/components/ui/Animations';
```

### Common Patterns

**Scroll Reveal:**
```tsx
<FadeUp>
  <h2>Section Title</h2>
</FadeUp>
```

**Staggered Lists:**
```tsx
<StaggerContainer staggerDelay={0.1}>
  {items.map((item) => (
    <StaggerItem key={item.id}>
      <Card>{item.content}</Card>
    </StaggerItem>
  ))}
</StaggerContainer>
```

**Hero Animations:**
```tsx
<HeroContent>
  <HeroItem><span className="eyebrow">Eyebrow</span></HeroItem>
  <HeroItem><h1>Headline</h1></HeroItem>
  <HeroItem><Button>CTA</Button></HeroItem>
</HeroContent>
```

**Hover Effects:**
```tsx
<HoverLift lift={-6}>
  <Card>Lifts on hover</Card>
</HoverLift>

<motion.button whileHover={{scale: 1.02}} whileTap={{scale: 0.98}}>
  Animated Button
</motion.button>
```

**Important:** All animations automatically respect `prefers-reduced-motion`.

---

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PUBLIC_STOREFRONT_API_TOKEN` | Storefront API token | Yes |
| `PUBLIC_STORE_DOMAIN` | Store domain | Yes |
| `SESSION_SECRET` | Session encryption | Yes |
| `KLAVIYO_PRIVATE_API_KEY` | Klaviyo API key | Yes |
| `KLAVIYO_NEWSLETTER_LIST_ID` | Newsletter list ID | Yes |
| `JUDGEME_PUBLIC_TOKEN` | Reviews token | Yes |

---

## Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run typecheck        # Type checking
npm run lint             # ESLint

# GraphQL
npm run codegen          # Generate types
```

---

## Checklists

### File Creation Checklist

- [ ] Read appropriate skill documentation first
- [ ] Follow naming conventions (PascalCase components, kebab-case routes)
- [ ] Use design system tokens (no arbitrary colors/sizes)
- [ ] Include proper TypeScript types
- [ ] Add error boundaries where needed
- [ ] Ensure accessibility (ARIA labels, focus states)

### Code Review Checklist

- [ ] Dark theme: `text-white` for headings (never `text-primary`)
- [ ] Dark theme: `text-white/50` for body text (never `text-secondary`)
- [ ] Dark theme: Dark gradient cards (never `bg-white` cards or shadows)
- [ ] Dark theme: `border-white/[0.08]` (never `border-black/*`)
- [ ] Eyebrow text on section headers
- [ ] Buttons styled correctly on dark backgrounds
- [ ] Focus states on all interactive elements
- [ ] Touch targets minimum 44px
- [ ] Responsive at all breakpoints
- [ ] React Router imports (not Remix)
- [ ] Proper error handling

### UI Checklist

- [ ] Colors: Use dark theme tokens only (`text-white`, `text-white/50`, `bg-white/[0.05]`)
- [ ] No `bg-white` cards, no `shadow-sm`/`shadow-lg`
- [ ] Typography: Use scale classes only
- [ ] Spacing: Use 8px system only
- [ ] Images: Have aspect ratios set
- [ ] Animations: Use Framer Motion components from `~/components/ui/Animations`
- [ ] Animations: Respect reduced motion (handled automatically by components)
- [ ] Contrast: WCAG AA minimum
- [ ] **Suspense/Motion content: Use inline styles for centered text in Suspense, Await, or FadeUp/motion wrappers** (see below)

### Tailwind in Suspense/Await/Motion Boundaries (CRITICAL)

Tailwind classes may NOT apply correctly in components rendered inside `<Suspense>`, `<Await>`, or **Framer Motion wrappers** (`FadeUp`, `FadeIn`, `ScaleIn`, `StaggerContainer`, etc.). **Always use inline styles for any text block that needs centering or controlled width.**

**Affected contexts:**
- `<Suspense>` / `<Await>` boundaries
- `<FadeUp>`, `<FadeIn>`, `<ScaleIn>`, `<SlideIn>` animation wrappers
- Any Framer Motion `motion.div` that wraps multi-line text content

**Symptoms:**
- Text breaking on every word (one word per line)
- Text left-aligned when `text-center` is applied
- `mx-auto` or `max-w-*` not working
- Eyebrow text, headings, and descriptions misaligned

**Rule: NEVER wrap page header text (eyebrow + h1/h2 + description paragraph) in `FadeUp` or other motion wrappers.** Use plain `<div>` with inline styles instead.

**Solution:** Use inline styles for all centered/constrained text:

```tsx
// CORRECT — inline styles for page headers and centered text blocks:
<div style={{textAlign: 'center', maxWidth: '42rem', marginLeft: 'auto', marginRight: 'auto'}}>
  <span style={{display: 'inline-block', color: '#B8764F', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.25em', fontWeight: 600, marginBottom: '1rem'}}>
    Eyebrow Text
  </span>
  <h1 style={{fontFamily: 'var(--font-display, serif)', fontSize: '3rem', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.1, marginBottom: '1rem'}}>
    Page Heading
  </h1>
  <p style={{fontSize: '1.125rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.5)', maxWidth: '36rem', marginLeft: 'auto', marginRight: 'auto'}}>
    Description paragraph that stays properly centered.
  </p>
</div>

// WRONG — Tailwind classes inside FadeUp will break:
<FadeUp className="text-center max-w-2xl mx-auto">
  <h1 className="font-display text-hero text-primary">Heading</h1>
  <p className="text-body-lg text-secondary">This text will break one word per line!</p>
</FadeUp>
```

**When FadeUp IS safe:** Wrapping a single short element (a heading, a card, a button) is fine. The issue occurs with multi-line text content that needs centering or `max-width` constraints.

See `.cursor/skills/design-system/SKILL.md` for full token values.

---

## Quick Reference Links

| Resource | Location |
|----------|----------|
| PRD | `prd.md` |
| Design System | `DESIGN-SYSTEM.md` |
| Skills Index | `.cursor/skills/INDEX.md` |
| Animations | `app/components/ui/Animations.tsx` |
| Tailwind Config | `app/styles/tailwind.css` |
| Type Definitions | `storefrontapi.generated.d.ts` |

---

## Summary

1. **Dark theme everywhere** - `text-white` headings, `text-white/50` body, dark gradient cards, no shadows
2. **Never use `text-primary` for headings** - It's `#000000` = invisible on dark backgrounds
3. **Read skills before implementing** - Always check relevant SKILL.md + REFERENCE.md documentation
4. **Use design tokens** - No arbitrary colors, sizes, or spacing
5. **Follow React Router patterns** - Never use Remix imports
6. **Include eyebrow text** - Every section header needs one
7. **Add animations** - Use Framer Motion components from `~/components/ui/Animations`
8. **Ensure accessibility** - Focus states, touch targets, ARIA labels, reduced motion
9. **Be responsive** - Test at mobile, tablet, desktop
10. **Use inline styles for centered text** - Tailwind breaks inside `<Suspense>`, `<Await>`, and Framer Motion wrappers (`FadeUp`, etc.); always use inline styles for page headers, descriptions, and any centered/constrained text blocks
