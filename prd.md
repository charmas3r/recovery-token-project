# Product Requirements Document: Recovery Token Store

**Version**: 1.1  
**Date**: January 23, 2026  
**Status**: Approved - Phase 1a Scope

---

## 1. Executive Summary

Recovery Token Store is a premium ecommerce storefront selling **physical recovery tokens** that celebrate sobriety and abstinence milestones. Built on **Shopify Hydrogen** (Remix-based) and deployed to **Shopify Oxygen** (edge runtime), the store prioritizes excellent Core Web Vitals, beautiful UI, and tasteful, performant motion.

The target audience includes individuals in recovery celebrating personal milestones, as well as friends and family purchasing meaningful gifts. The brand must convey **trust, calm, and celebration**—users may visit during emotionally vulnerable moments, requiring an experience that feels supportive rather than transactional.

**MVP Goal (Phase 1a)**: Launch a fully functional, high-performance storefront where customers can browse recovery tokens by milestone, personalize their purchase with engraving, read verified customer reviews, complete checkout seamlessly, and manage their accounts with order history tracking to celebrate their recovery journey over time.

---

## 2. Mission

**Product Mission Statement**: Provide a dignified, trustworthy shopping experience that honors every recovery milestone—whether it's 24 hours or 20 years—with premium tokens and exceptional customer care.

**Core Principles**:

1. **Performance First**: Every design and technical decision optimizes for speed; slow sites feel broken to users in vulnerable moments
2. **Empathetic UX**: Error messages, loading states, and copy must be supportive, never punishing or blame-shifting
3. **Trust Through Transparency**: Clear policies, visible reviews, and straightforward pricing build confidence
4. **Accessibility as Default**: WCAG AA compliance minimum; recovery products serve all abilities
5. **Privacy & Discretion**: Respect that recovery purchases may be deeply personal

---

## 3. Design System & Visual Language

### Design Philosophy

The Recovery Token Store design system draws inspiration from premium travel gear aesthetics—clean, bold, and confident. The visual language prioritizes **clarity over cleverness**, using strong typography, generous white space, and intentional hierarchy to guide users through their milestone celebration journey.

**Core Design Principles**:
1. **Information Architecture First**: Every layout decision serves wayfinding and comprehension
2. **Visual Hierarchy as Navigation**: Size, weight, and contrast create a clear reading order
3. **Intentional White Space**: Breathing room reduces cognitive load and conveys premium quality
4. **Accessible by Default**: WCAG AA minimum, designed for all abilities and contexts
5. **Performance-Aware Design**: Every visual element optimized for fast loading

**Reference**: [Nexura Travel Gear Ecommerce](https://dribbble.com/shots/25142615-Nexura-Travel-Gear-Ecommerce-Website) - exemplifies the clean, structured approach we're emulating.

---

### Information Architecture

**Site Structure** (3-level hierarchy maximum):

```
Home
├── Shop
│   ├── All Products
│   ├── By Milestone
│   │   ├── 24 Hours
│   │   ├── 30 Days
│   │   ├── 90 Days
│   │   ├── 6 Months
│   │   └── 1+ Years
│   └── By Material
│       ├── Bronze
│       ├── Silver
│       └── Gold
├── About
│   ├── Our Story
│   ├── Why Tokens Matter
│   └── Testimonials
├── Support
│   ├── FAQ
│   ├── Shipping & Returns
│   └── Contact Us
├── Reviews
└── Account
    ├── Dashboard
    ├── Orders
    ├── Profile
    └── Addresses
```

**Navigation Hierarchy**:
1. **Primary Navigation** (Header): Shop, About, Reviews, Support, Account
2. **Secondary Navigation** (Footer): Policies, Newsletter, Social, Contact
3. **Utility Navigation** (Header Right): Search, Cart, Account Menu
4. **Contextual Navigation** (In-page): Breadcrumbs, Related Products, Quick Links

**Wayfinding Strategies**:
- **Breadcrumbs**: Every non-homepage view shows path (Home > Shop > 1 Year Tokens > Bronze Token)
- **Active State Indicators**: Current page/section visually distinct in navigation
- **Persistent Cart Icon**: Badge count always visible, immediate feedback on add-to-cart
- **Progress Indicators**: Clear steps for engraving confirmation, checkout handoff
- **Back-to-Top**: Appears after 2 viewport scrolls on long pages

---

### Visual Hierarchy System

**Typography Scale** (Major Third - 1.250 ratio):

| Element | Size | Weight | Line Height | Usage |
|---------|------|--------|-------------|-------|
| **Hero Headline** | 48px (3rem) | 700 (Bold) | 1.1 | Homepage hero, major section headers |
| **Page Title** | 36px (2.25rem) | 700 (Bold) | 1.2 | PDP product name, collection titles |
| **Section Heading** | 28px (1.75rem) | 700 (Bold) | 1.3 | Feature sections, "Browse by Milestone" |
| **Subsection Heading** | 20px (1.25rem) | 600 (SemiBold) | 1.4 | Product card titles, form section headers |
| **Body Large** | 18px (1.125rem) | 400 (Regular) | 1.6 | Product descriptions, intro paragraphs |
| **Body** | 16px (1rem) | 400 (Regular) | 1.6 | General body text, form labels |
| **Body Small** | 14px (0.875rem) | 400 (Regular) | 1.5 | Metadata, timestamps, disclaimers |
| **Caption** | 12px (0.75rem) | 500 (Medium) | 1.4 | Helper text, badges, tags |

**Font Families**:
- **Primary (Headings & UI)**: `Inter` or `Manrope` - geometric sans-serif, excellent legibility
- **Secondary (Body)**: `Inter` - same family for cohesion, or `Outfit` for slightly warmer feel
- **Monospace (Technical)**: `JetBrains Mono` - order numbers, SKUs (if needed)

**Visual Weight Distribution**:

```
┌─────────────────────────────────────────┐
│  HERO HEADLINE (700, 48px)              │  ← Maximum visual weight
│  Supporting text (400, 18px)            │  ← 40% weight drop
│  [Primary CTA]                          │  ← Strong color contrast
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Section Heading (700, 28px)            │  ← Clear section start
│                                         │
│  ┌───────────┐  ┌───────────┐          │
│  │  Product  │  │  Product  │          │  ← Equal visual weight
│  │  Image    │  │  Image    │          │
│  │           │  │           │          │
│  │  Title    │  │  Title    │          │  ← Secondary weight
│  │  $200     │  │  $200     │          │  ← Tertiary (price emphasis)
│  └───────────┘  └───────────┘          │
└─────────────────────────────────────────┘
```

**Hierarchy Techniques**:
1. **Size Contrast**: Minimum 1.25x difference between adjacent hierarchy levels
2. **Weight Contrast**: 700 (headings) vs 400 (body) creates clear distinction
3. **Color Contrast**: Headings at 100% opacity, body at 85%, metadata at 60%
4. **Spatial Contrast**: 2-3x more space above headings than below
5. **Grouping**: Related elements have less space between them than unrelated elements

**Content Prioritization** (Order of Visual Attention):

**Homepage**:
1. Hero headline + CTA
2. Social proof (80+ products, 120K customers)
3. Featured product image
4. Milestone collection links
5. Trust indicators (Free Shipping, Secure Checkout)
6. Newsletter signup
7. Footer navigation

**Product Detail Page**:
1. Product image (60% of viewport on load)
2. Product name + milestone
3. Star rating + review count
4. Price
5. Engraving CTA
6. Add to Cart button
7. Product description
8. Reviews section
9. Related products

---

### Color System

**Primary Palette** (Inspired by Nexura - monochromatic with strategic accents):

| Color | Hex | Usage | Contrast Ratio (on white) |
|-------|-----|-------|---------------------------|
| **Primary (Deep Navy)** | `#1A202C` | Primary text, headings, navigation | 16.1:1 (AAA) |
| **Secondary (Slate)** | `#4A5568` | Body text, secondary elements | 8.2:1 (AAA) |
| **Accent (Bronze/Copper)** | `#B8764F` | CTAs, links, milestone badges | 4.5:1 (AA) |
| **Surface (Cool Gray)** | `#F7FAFC` | Backgrounds, cards, alternating sections | N/A |
| **Surface Dark** | `#2D3748` | Footer, dark mode (future), image overlays | N/A |
| **White** | `#FFFFFF` | Primary background, card backgrounds | N/A |
| **Success** | `#38A169` | Confirmation messages, in-stock badges | 4.6:1 (AA) |
| **Warning** | `#DD6B20` | Important notices, low stock warnings | 4.5:1 (AA) |
| **Error** | `#E53E3E` | Error messages, required fields | 4.5:1 (AA) |

**Opacity Scale** (for hierarchy):
- 100%: Primary headings, critical actions
- 85%: Body text, secondary actions
- 60%: Metadata, timestamps, helper text
- 40%: Disabled states, placeholder text
- 10%: Dividers, subtle borders

**Color Application Rules**:
1. **High Contrast Text**: All body text minimum 4.5:1, headings 7:1+
2. **CTA Prominence**: Accent color reserved for primary actions only
3. **Surface Variation**: Alternate between white and cool gray to define sections
4. **Dark Backgrounds**: White text at 90-95% opacity (softer on eyes than pure white)
5. **Semantic Color**: Success/warning/error colors only for status, never decoration

---

### Layout & Grid System

**Grid Structure** (12-column responsive grid):

```
Mobile (< 768px):
┌─────────────────────┐
│  [12-col span]      │  ← Full width
│  (Single column)    │
└─────────────────────┘

Tablet (768px - 1023px):
┌───────────┬───────────┐
│  [6-col]  │  [6-col]  │  ← 2-column
└───────────┴───────────┘

Desktop (1024px+):
┌─────┬─────┬─────┬─────┐
│ [3] │ [3] │ [3] │ [3] │  ← 4-column (products)
└─────┴─────┴─────┴─────┘

PDP Desktop:
┌─────────────┬──────────┐
│   [7-col]   │  [5-col] │  ← Image : Details
│   Gallery   │  Form    │
└─────────────┴──────────┘
```

**Spacing System** (8px base unit):

| Token | Value | Usage |
|-------|-------|-------|
| `xs` | 4px (0.25rem) | Icon padding, tight inline elements |
| `sm` | 8px (0.5rem) | Button padding Y, form field padding |
| `md` | 16px (1rem) | Element spacing, card padding |
| `lg` | 24px (1.5rem) | Component spacing, section padding mobile |
| `xl` | 32px (2rem) | Between components, section padding tablet |
| `2xl` | 48px (3rem) | Between major sections |
| `3xl` | 64px (4rem) | Section padding desktop |
| `4xl` | 96px (6rem) | Hero section padding |

**Container Widths**:
- **Narrow (prose)**: 640px - long-form content (About, policies)
- **Standard**: 1280px - general pages (collections, PDP)
- **Wide**: 1440px - homepage, visual-heavy sections
- **Full-bleed**: 100vw - hero images, dark sections for contrast

**Layout Patterns**:

**1. Hero Section** (Homepage, Collection Pages):
```
┌────────────────────────────────────────────┐
│ ╔════════════════════════════════════════╗ │
│ ║                                        ║ │
│ ║  HEADLINE (Left-aligned)               ║ │
│ ║  Subhead                               ║ │
│ ║  [Primary CTA]                         ║ │
│ ║                                        ║ │
│ ║          [Hero Image - Right 60%]     ║ │
│ ║                                        ║ │
│ ╚════════════════════════════════════════╝ │
└────────────────────────────────────────────┘
```

**2. Product Grid** (Collection Pages):
```
┌────┬────┬────┬────┐
│ 🖼️ │ 🖼️ │ 🖼️ │ 🖼️ │  ← Product images (aspect ratio 4:5)
│Name│Name│Name│Name│  ← Product name (2 lines max)
│★★★★│★★★★│★★★★│★★★★│  ← Rating
│$200│$200│$200│$200│  ← Price (bold, accent color)
└────┴────┴────┴────┘
```

**3. Feature Section** (Homepage):
```
┌──────────────────────────────────────┐
│  SECTION HEADING                     │
│  Description text                    │
│                                      │
│  ┌─────────┐  ┌─────────┐  ┌───────┐│
│  │  Icon   │  │  Icon   │  │ Icon  ││
│  │  Title  │  │  Title  │  │ Title ││
│  │  Text   │  │  Text   │  │ Text  ││
│  └─────────┘  └─────────┘  └───────┘│
└──────────────────────────────────────┘
```

---

### Component Design Patterns

**Buttons**:

| Type | Style | Usage |
|------|-------|-------|
| **Primary** | Solid accent color, white text, 600 weight | Add to Cart, Checkout, Submit |
| **Secondary** | Outline accent color, accent text | Continue Shopping, Learn More |
| **Tertiary** | No border, accent text | Cancel, Back, Edit |
| **Destructive** | Solid error color | Delete, Remove |

**Button Anatomy**:
- Height: 44px (minimum touch target)
- Padding: 16px horizontal, 12px vertical
- Border radius: 6px
- Font: 600 weight, 16px
- Hover: Darken 10%, scale 1.02, subtle shadow
- Active: Darken 15%, scale 0.98

**Cards** (Product Cards, Order Cards):
```
┌─────────────────────┐
│                     │
│   [Image 4:5]       │  ← Hover: subtle lift + shadow
│                     │
├─────────────────────┤
│ Product Name        │  ← 2 lines, truncate after
│ ★★★★☆ (24)         │  ← Rating + count
│ $200                │  ← Bold, accent color
├─────────────────────┤
│ 🛒 Add to Cart      │  ← Appears on hover (desktop)
└─────────────────────┘
```

**Forms**:
- Label: Above input, 14px, 600 weight
- Input: 44px height, 16px text, 1px border
- Focus: Accent color border, subtle glow
- Error: Error color border, message below in error color
- Success: Success color border, checkmark icon

**Badges & Tags**:
- Pill shape (9999px border radius)
- Small text (12px, 500 weight)
- Semantic colors: New (accent), Sale (error), In Stock (success)
- Low contrast: 10% opacity background, full opacity text

---

### Interaction Design

**Micro-interactions**:
1. **Add to Cart**: Button → Loading spinner → Success checkmark → Cart badge bounces
2. **Image Gallery**: Thumbnail click → Main image crossfade (300ms)
3. **Quantity Input**: +/- buttons scale on tap, number animates
4. **Cart Drawer**: Slides from right (400ms ease-out), backdrop fades in
5. **Form Validation**: Real-time after first blur, debounced 500ms

**Loading States**:
- **Skeleton Screens**: Gray blocks match content dimensions (cards, text lines)
- **Spinners**: Only for unpredictable actions (form submission)
- **Progress Bars**: Stepped checkout progress indicator
- **Optimistic UI**: Cart updates immediately, reconciles in background

**Hover States** (Desktop only):
- **Links**: Underline appears (200ms ease)
- **Buttons**: Scale 1.02, brightness +10%, shadow depth +1
- **Product Cards**: Lift 4px, shadow intensity +20%, "Add to Cart" appears
- **Images**: Slight zoom (1.05x, 400ms ease-out)

**Accessibility Features**:
- **Focus Indicators**: 2px accent color outline, 2px offset
- **Skip Links**: "Skip to main content" (visible on focus)
- **ARIA Labels**: All icon buttons, complex interactions
- **Keyboard Navigation**: Tab order follows visual hierarchy
- **Reduced Motion**: Disable animations when `prefers-reduced-motion: reduce`

---

### Responsive Design Breakpoints

| Breakpoint | Width | Layout Changes |
|------------|-------|----------------|
| **Mobile** | < 640px | Single column, stacked navigation, full-width CTAs |
| **Tablet** | 640px - 1023px | 2-column grid, collapsible navigation, side-by-side forms |
| **Desktop** | 1024px - 1439px | 4-column grid, full navigation, hover interactions |
| **Wide** | 1440px+ | Same as desktop, increased max-width, more white space |

**Mobile-First Enhancements**:
- **Bottom Sheet**: Cart drawer slides from bottom on mobile
- **Sticky CTA**: Add to Cart button sticks to bottom on PDP scroll
- **Touch Targets**: Minimum 44x44px, increased spacing between tappable elements
- **Collapsible Sections**: FAQ, product details accordion on mobile
- **Horizontal Scroll**: Related products carousel (with scroll indicators)

---

### Performance-Aware Design Decisions

**Image Strategy**:
- **Dominant Color Placeholders**: Prevents CLS, extracted from product images
- **Aspect Ratio Boxes**: Reserve space before image loads (4:5 for products, 16:9 for hero)
- **Lazy Loading**: Below-fold images load on scroll proximity
- **Responsive Sizes**: `srcset` with 320w, 640w, 1024w, 1280w, 1920w
- **Format**: WebP with JPEG fallback via Shopify CDN

**Animation Budget**:
- **Critical Path**: No animations blocking LCP (hero image, headline)
- **Deferred**: Cart drawer, modals animate after page interactive
- **GPU-Accelerated**: Only `transform` and `opacity` properties animated
- **Duration**: 200-400ms (feels immediate), 600ms max (complex transitions)
- **Easing**: `ease-out` for entrances, `ease-in` for exits, `ease-in-out` for continuous

**Font Loading**:
- **System Font Fallback**: `-apple-system, BlinkMacSystemFont, "Segoe UI"` while loading
- **Font Display**: `font-display: swap` - show text immediately
- **Subset**: Only Latin character set (reduce file size 60%+)
- **Variable Fonts**: Single file for multiple weights (if using variable font)

---

### Design Quality Checklist

**Before Launch**:
- [ ] All text meets WCAG AA contrast (4.5:1 body, 3:1 UI)
- [ ] All interactive elements minimum 44x44px
- [ ] Focus indicators visible on all focusable elements
- [ ] No horizontal scroll at any breakpoint
- [ ] Images have explicit width/height (prevent CLS)
- [ ] Animations respect `prefers-reduced-motion`
- [ ] Typography scale is consistent (no arbitrary sizes)
- [ ] Spacing follows 8px base unit system
- [ ] All icons have accessible labels
- [ ] Forms have clear error states with helpful messages
- [ ] Loading states for all async actions
- [ ] Empty states for carts, orders, search (not just blank)
- [ ] 404 and error pages are branded and helpful

---

## 4. Target Users

### Primary Persona: The Milestone Celebrant
- **Who**: Individuals in recovery (alcohol, substance, or behavioral) celebrating a personal milestone
- **Technical Comfort**: Moderate; comfortable with standard ecommerce flows
- **Key Needs**: 
  - Find the right token for their specific milestone (24 hours, 30 days, 90 days, 6 months, 1 year, etc.)
  - Personalize with engraving (name, date, custom message)
  - Trust the quality and legitimacy of the product
  - Complete purchase quickly and privately
- **Pain Points**: 
  - Generic ecommerce experiences that feel cold or transactional
  - Unclear shipping timelines for time-sensitive milestone celebrations
  - Fear of judgment or data privacy concerns

### Secondary Persona: The Supportive Gift-Giver
- **Who**: Friends, family members, sponsors purchasing tokens as gifts
- **Technical Comfort**: Varies widely
- **Key Needs**:
  - Understand milestone significance without being in recovery themselves
  - Ship to different address with gift messaging
  - Discreet packaging that doesn't reveal contents
- **Pain Points**:
  - Uncertainty about which milestone to select
  - Concern about appropriateness of gift

### Technical User Persona: Site Administrator
- **Who**: Store owner/operator managing products, orders, and content
- **Key Needs**:
  - Update product information and pricing in Shopify admin
  - View and moderate reviews via Judge.me
  - Monitor site performance and errors
  - Manage email campaigns via Resend

---

## 5. MVP Scope

### In Scope (Core Functionality)

**Commerce Core**:
- ✅ Product browsing by milestone collection (24 hours, 30 days, 90 days, 6 months, 1+ years)
- ✅ Product detail pages with variant selection (milestone, material/finish)
- ✅ Cart with add/update/remove functionality
- ✅ Cart drawer/mini-cart with real-time updates
- ✅ Checkout handoff to Shopify's hosted checkout
- ✅ Guest checkout (no account required)
- ✅ Registered customer checkout with saved addresses
- ✅ Discount code application

**Personalization**:
- ✅ Line item properties for engraving text (character limit, validation)
- ✅ Engraving confirmation modal with live preview before add-to-cart
- ✅ Cart attributes for gift messages
- ✅ Clear display of personalization in cart summary

**Trust & Social Proof**:
- ✅ Judge.me reviews integration (PDP + dedicated reviews page)
- ✅ Schema.org structured data (Product, Review, Organization, BreadcrumbList)
- ✅ Trust badges (secure checkout, return policy)
- ✅ Customer testimonials display

**Content Pages**:
- ✅ Homepage with hero, featured products, brand story
- ✅ About/Mission page
- ✅ Contact form (Resend integration)
- ✅ FAQ page
- ✅ Support hub (shipping/returns, customer service)
- ✅ Legal pages (privacy, terms, refund policy)

**Email & Newsletter**:
- ✅ Contact form submission emails via Resend
- ✅ Newsletter signup with double opt-in (Resend Audiences)

**Customer Accounts**:
- ✅ User registration and login (Shopify Customer Account API)
- ✅ Password reset flow
- ✅ Account dashboard with profile information
- ✅ Order history with detailed order views
- ✅ Reorder functionality from order history
- ✅ Profile management (name, email, password updates)
- ✅ Address book (add, edit, delete, set default)
- ✅ Protected account routes with authentication middleware
- ✅ Session management with secure cookies
- ✅ Account-related email notifications

**Technical Foundation**:
- ✅ Shopify Hydrogen + Oxygen deployment
- ✅ TypeScript with GraphQL codegen
- ✅ Tailwind CSS styling
- ✅ Edge caching strategy (TTL + stale-while-revalidate)
- ✅ Core Web Vitals optimization (LCP < 2.5s, CLS < 0.1)
- ✅ Error boundaries for graceful degradation
- ✅ SEO fundamentals (meta tags, sitemaps, robots.txt)

### Out of Scope (Future Phases)

**Deferred to Phase 2**:
- ❌ Headless CMS integration (Sanity/Contentful)
- ❌ Blog functionality
- ❌ Recovery resources content section
- ❌ Advanced search with filters
- ❌ Gift flow with milestone date capture

**Deferred to Phase 3**:
- ❌ International shipping / multi-currency
- ❌ Subscription/recurring orders
- ❌ Loyalty/rewards program
- ❌ Wishlist/favorites functionality
- ❌ A/B testing framework
- ❌ Advanced analytics dashboards
- ❌ Social login integrations (Google, Facebook, Apple)
- ❌ Two-factor authentication (2FA)

**Explicitly Out of Scope**:
- ❌ Custom checkout (using Shopify's hosted checkout)
- ❌ Mobile native apps
- ❌ Marketplace features (multiple sellers)
- ❌ Wholesale/B2B functionality

---

## 6. User Stories

### Primary User Stories

**US-1: Browse by Milestone**
> As a recovery celebrant, I want to browse tokens by milestone duration, so that I can find the exact token for my achievement.
- *Example*: User clicks "1 Year" collection and sees all 1-year token variants (different materials, finishes)

**US-2: View Product Details**
> As a shopper, I want to see detailed product photos, materials, and dimensions, so that I know exactly what I'm purchasing.
- *Example*: User views PDP with multiple product images, zoom functionality, material specifications, and sizing info

**US-3: Add Custom Engraving**
> As a milestone celebrant, I want to add a custom engraving to my token, so that it becomes a meaningful personal keepsake.
- *Example*: User enters "Sarah M. - 1 Year - 03/15/2026" in engraving field, sees live preview, confirms accuracy before adding to cart

**US-4: Read Customer Reviews**
> As a first-time buyer, I want to read reviews from other customers, so that I can trust the product quality.
- *Example*: User scrolls to reviews section on PDP, sees verified buyer badges, filters by milestone

**US-5: Complete Purchase**
> As a customer, I want to complete my purchase quickly with clear shipping information, so that I receive my token in time for my celebration.
- *Example*: User adds to cart, reviews order in cart drawer, proceeds to Shopify checkout, receives confirmation email

**US-6: Send as Gift**
> As a gift-giver, I want to ship to a different address with a gift message, so that I can surprise someone celebrating their milestone.
- *Example*: User selects "Send as gift" option, enters recipient address, adds personalized gift message

**US-7: Contact Support**
> As a customer with questions, I want to easily contact support, so that I can get help before or after my purchase.
- *Example*: User navigates to Contact page, fills out form, receives automated confirmation and timely response

**US-8: Subscribe to Newsletter**
> As an interested visitor, I want to subscribe to the newsletter, so that I can learn about new products and recovery stories.
- *Example*: User enters email in footer signup, receives double opt-in confirmation, confirms subscription

**US-9: Create Account**
> As a customer, I want to create an account, so that I can track my orders and save my information for future purchases.
- *Example*: User completes registration form with email/password, receives welcome email, is automatically logged in

**US-10: View Order History**
> As a returning customer, I want to view my past orders, so that I can track my recovery milestones and reorder tokens.
- *Example*: User logs into account, navigates to order history, sees list of all purchases with dates and milestone details

**US-11: Reorder Previous Purchase**
> As a milestone celebrant, I want to quickly reorder a token from my history, so that I can gift it to someone else or replace a lost token.
- *Example*: User views order detail page, clicks "Reorder", all items are added to cart with original engraving details

**US-12: Manage Saved Addresses**
> As a frequent customer, I want to save multiple addresses, so that I can easily ship to different locations (home, work, friends).
- *Example*: User adds new address in address book, sets it as default, uses it during next checkout

### Technical User Stories

**TUS-1: Manage Products**
> As a store admin, I want to update product information in Shopify admin, so that the storefront reflects current inventory and pricing.

**TUS-2: Moderate Reviews**
> As a store admin, I want to moderate customer reviews via Judge.me dashboard, so that I can maintain quality social proof.

**TUS-3: Monitor Site Health**
> As a store admin, I want to receive alerts when errors occur, so that I can address issues before customers are affected.

---

## 7. Core Architecture & Patterns

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        User's Browser                          │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Shopify Oxygen (Edge)                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Hydrogen (Remix) Application                │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │  │
│  │  │   Routes    │  │   Loaders   │  │   Actions   │      │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘      │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  Shopify APIs   │  │    Judge.me     │  │     Resend      │
│  - Storefront   │  │  Reviews API    │  │   Email API     │
│  - Cart         │  │                 │  │                 │
│  - Checkout     │  │                 │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

### Directory Structure

```
recovery-token-store/
├── app/
│   ├── components/
│   │   ├── cart/
│   │   │   ├── CartDrawer.tsx
│   │   │   ├── CartLineItem.tsx
│   │   │   └── CartSummary.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Navigation.tsx
│   │   │   └── AccountMenu.tsx
│   │   ├── product/
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductGallery.tsx
│   │   │   ├── ProductForm.tsx
│   │   │   ├── EngravingForm.tsx
│   │   │   └── EngravingConfirmModal.tsx
│   │   ├── account/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   ├── PasswordResetForm.tsx
│   │   │   ├── ProfileForm.tsx
│   │   │   ├── AddressForm.tsx
│   │   │   ├── OrderCard.tsx
│   │   │   ├── OrderDetail.tsx
│   │   │   └── MilestoneTimeline.tsx
│   │   ├── reviews/
│   │   │   ├── ReviewsWidget.tsx
│   │   │   ├── RatingBadge.tsx
│   │   │   └── ReviewsFallback.tsx
│   │   ├── ui/
│   │   │   └── (Radix-based primitives)
│   │   └── seo/
│   │       ├── JsonLd.tsx
│   │       └── MetaTags.tsx
│   ├── lib/
│   │   ├── storefront.server.ts
│   │   ├── customer.server.ts
│   │   ├── session.server.ts
│   │   ├── judgeme.server.ts
│   │   ├── resend.server.ts
│   │   ├── cache.ts
│   │   └── validation.ts
│   ├── routes/
│   │   ├── _index.tsx (homepage)
│   │   ├── products.$handle.tsx (PDP)
│   │   ├── collections.$handle.tsx
│   │   ├── cart.tsx
│   │   ├── about.tsx
│   │   ├── contact.tsx
│   │   ├── reviews.tsx
│   │   ├── newsletter.tsx
│   │   ├── account/
│   │   │   ├── _layout.tsx (protected route wrapper)
│   │   │   ├── _index.tsx (dashboard)
│   │   │   ├── login.tsx
│   │   │   ├── register.tsx
│   │   │   ├── recover.tsx (forgot password)
│   │   │   ├── reset.$token.tsx
│   │   │   ├── profile.tsx
│   │   │   ├── addresses.tsx
│   │   │   ├── orders._index.tsx (order history)
│   │   │   └── orders.$orderId.tsx (order detail)
│   │   ├── support/
│   │   │   ├── _index.tsx
│   │   │   ├── faq.tsx
│   │   │   └── shipping-returns.tsx
│   │   ├── policies/
│   │   │   ├── privacy-policy.tsx
│   │   │   ├── terms-of-service.tsx
│   │   │   └── refund-policy.tsx
│   │   └── webhooks/
│   │       └── shopify.tsx
│   ├── graphql/
│   │   ├── queries/
│   │   └── mutations/
│   ├── styles/
│   │   └── tailwind.css
│   └── root.tsx
├── public/
├── storefrontapi.generated.d.ts
├── tailwind.config.ts
├── vite.config.ts
└── package.json
```

### Key Design Patterns

**1. Server-First Data Fetching**
- All critical data fetched in Remix loaders (server-side)
- Cart state managed via Shopify Cart API (cookie-persisted cart ID)
- Client-side state kept minimal

**2. Optimistic UI Updates**
- Cart mutations show immediate feedback
- Server reconciliation happens in background
- Error states gracefully revert

**3. Progressive Enhancement**
- Core functionality works without JavaScript
- Reviews widget loads lazily after page interactive
- Animations respect `prefers-reduced-motion`

**4. Error Boundary Hierarchy**
- Root-level: Branded 404/500 pages
- Route-level: Page-specific error handling
- Component-level: Third-party widget failures (Judge.me)

**5. Cache Strategy by Content Type**
- PDP: `max-age=3600, stale-while-revalidate=86400`
- Collections: `max-age=1800, stale-while-revalidate=3600`
- Homepage: `max-age=600, stale-while-revalidate=1800`
- Cart/Checkout: `private, max-age=0`

---

## 8. Features

### 8.1 Product Display System

**Purpose**: Display recovery tokens with milestone-specific information and imagery

**Key Features**:
- Collection pages organized by milestone duration
- Product detail pages with:
  - High-quality image gallery with zoom
  - Variant selector (milestone, material, finish)
  - Price display with sale pricing support
  - Inventory/availability status
  - Shipping estimates
  - Trust badges and return policy

**Technical Notes**:
- Images served via Shopify CDN with responsive sizing
- Dominant color placeholders prevent CLS
- Blurhash for hero images (premium loading feel)
- Lazy loading for below-fold images

### 8.2 Personalization (Engraving)

**Purpose**: Allow customers to add custom engraving to tokens

**Key Features**:
- Text input with character limit (50 characters)
- Allowed character validation (alphanumeric + basic punctuation)
- Live preview showing text as it will appear on token
- **Confirmation modal (REQUIRED)** before add-to-cart:
  - Product name + milestone variant
  - Live engraving preview
  - Non-refundable warning: "Custom engraving is non-refundable"
  - Checkbox confirmation: "I confirm this engraving is correct"
  - "Back & Edit" and "Confirm & Add to Cart" buttons
- Line item properties stored with cart item
- Clear display in cart drawer and checkout

**Private Note Option**:
- Optional "Private note to engraver" field
- Uses underscore prefix (`_engravingNote`) to hide from packing slip
- Allows context like "This is for my 2-year anniversary"

### 8.3 Cart System

**Purpose**: Manage shopping cart with real-time updates

**Key Features**:
- Cart drawer (slide-out panel) for quick access
- Line item display with:
  - Product image and title
  - Variant details
  - Engraving text (if applicable)
  - Quantity controls
  - Remove item action
  - Line item total
- Cart summary:
  - Subtotal
  - Discount code input
  - Applied discounts display
  - Shipping estimate (if calculable)
- Persistent cart (cookie-based cart ID)
- "Continue Shopping" and "Proceed to Checkout" CTAs

**Technical Implementation**:
- Uses Hydrogen's `CartForm` for mutations
- Optimistic UI updates during mutations
- Error handling for out-of-stock, invalid quantities
- Cart icon in header shows item count badge

### 8.4 Reviews Integration (Judge.me)

**Purpose**: Display verified customer reviews for social proof

**Key Features**:
- Rating badge near product title (server-rendered for SEO)
- Full reviews widget below product details (lazy-loaded)
- Dedicated `/reviews` page with all reviews
- Filter by milestone (if metadata available)
- Review Schema.org markup for rich snippets

**Error Handling**:
- Wrapped in error boundary
- Fallback: "Reviews temporarily unavailable" message
- PDP remains fully functional if Judge.me fails

### 8.5 Contact & Newsletter

**Contact Form**:
- Fields: Name, email, subject, message
- Server-side validation with Zod
- Honeypot spam protection
- Resend API for email delivery
- Success/error feedback with empathetic messaging

**Newsletter Signup**:
- Footer signup form
- Double opt-in flow (Resend Audiences)
- Clear consent copy: "Get product drops and recovery stories"
- Unsubscribe link in all marketing emails

### 8.6 SEO & Structured Data

**Schema.org Types**:
- `Product` (PDP): name, description, image, offers, aggregateRating
- `Review` (via Judge.me): itemReviewed, author, reviewRating, reviewBody
- `Organization` (root): name, logo, contactPoint, sameAs
- `BreadcrumbList` (all pages): navigation hierarchy
- `FAQPage` (support): question/answer pairs

**Meta Tags**:
- Per-route title, description, canonical URL
- OpenGraph and Twitter Card tags
- Robots directives

### 8.7 Customer Account Management

**Purpose**: Enable customers to create accounts, manage their profile, and track their recovery journey through order history

**Authentication Features**:
- Registration with email/password
- Login with credential validation
- Password reset via email link
- Secure session management (HTTP-only cookies)
- Protected route middleware
- Logout with session cleanup

**Account Dashboard**:
- Welcome message with customer name
- Quick stats (total orders, account since date)
- Recent orders preview
- Navigation to key account sections
- Recovery journey celebration messaging

**Order History**:
- Paginated list of all orders
- Order details: number, date, status, items, total
- Status filtering (Fulfilled, Pending, Cancelled)
- Order detail view with:
  - Complete item list with engraving details
  - Shipping and billing addresses
  - Payment method (last 4 digits)
  - Tracking information (if available)
- "Reorder" functionality to add past items to cart
- Milestone journey visualization

**Profile Management**:
- Edit name, email, phone
- Change password (requires current password)
- Form validation with helpful error messages
- Success/error feedback

**Address Book**:
- Add new addresses with full validation
- Edit existing addresses
- Delete unused addresses
- Set default shipping address
- Pre-fill checkout with saved addresses

**Technical Implementation**:
- Shopify Customer Account API integration
- GraphQL queries: `customer`, `customerOrders`, `customerAddresses`
- GraphQL mutations: `customerCreate`, `customerAccessTokenCreate`, `customerUpdate`, etc.
- Session token encryption and renewal
- CSRF protection on all forms
- Rate limiting on authentication endpoints
- Privacy-focused error messages

### 8.8 Error Handling & Maintenance

**Error Boundaries**:
- Root: Branded error page with support contact
- Route: Context-specific error recovery
- Component: Graceful degradation for third-party services

**Maintenance Mode**:
- Shopify metaobject toggle for instant enable/disable
- 503 status with branded maintenance page
- Clear messaging with estimated return time
- Admin bypass option for testing

---

## 9. Technology Stack

### Core Platform
| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Commerce Platform | Shopify | Latest | Products, checkout, orders |
| Storefront Framework | Hydrogen | 2024.x | React-based storefront |
| Runtime | Remix | Latest (via Hydrogen) | Server-side rendering |
| Hosting | Oxygen | N/A (managed) | Edge deployment |

### Language & Build
| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Language | TypeScript | 5.x | Type safety |
| Bundler | Vite | Latest (via Hydrogen) | Fast builds, HMR |
| GraphQL Codegen | Shopify CLI | Built-in | Type generation |

### Styling & UI
| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| CSS Framework | Tailwind CSS | 3.x | Utility-first styling |
| Class Utilities | clsx, tailwind-merge | Latest | Conditional classes |
| UI Primitives | Radix UI | Latest | Accessible components |
| Icons | Lucide React | Latest | Consistent iconography |

### Animation
| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Micro-interactions | Motion One (`motion`) | Latest | Lightweight animations |
| Page Transitions | Framer Motion | Latest | Route animations (if needed) |

### Forms & Validation
| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Form Management | react-hook-form | 7.x | Form state |
| Schema Validation | Zod | 3.x | Input validation |

### Third-Party Services
| Component | Technology | Purpose |
|-----------|------------|---------|
| Reviews | Judge.me (Awesome plan) | Product reviews |
| Transactional Email | Resend | Contact form, confirmations |
| Marketing Email | Resend Audiences/Broadcasts | Newsletter |
| Email Templates | React Email | Template authoring |

### Testing & Quality
| Component | Technology | Purpose |
|-----------|------------|---------|
| Unit Tests | Vitest | Component/utility tests |
| Component Tests | Testing Library | React component tests |
| E2E Tests | Playwright | Critical path testing |
| Linting | ESLint | Code quality |
| Formatting | Prettier | Code style |

### Optional/Future
| Component | Technology | Purpose |
|-----------|------------|---------|
| Error Monitoring | Sentry | Error tracking |
| Image Placeholders | react-blurhash | Premium loading |
| CMS | Sanity/Contentful | Editorial content (Phase 2) |

---

## 10. Security & Configuration

### Authentication & Authorization

**Storefront (Public & Authenticated)**:
- **Guest Checkout**: No account required for purchase
- **Customer Accounts**: Optional registration and login via Shopify Customer Account API
- **Session Management**: Secure HTTP-only cookies for session persistence
- **Protected Routes**: Account pages require authentication
- **Cart Persistence**: Cart persisted for both guest and authenticated users
- **Password Requirements**: Minimum 8 characters (Shopify default)
- **Password Reset**: Email-based reset flow via Shopify Customer API

**Admin**:
- Shopify Admin for product/order/customer management
- Judge.me dashboard for review moderation
- Resend dashboard for email management

### Environment Variables

**Required for Local Development**:
```env
# Shopify Storefront API
PUBLIC_STOREFRONT_API_TOKEN=<storefront-api-token>
PUBLIC_STORE_DOMAIN=<store>.myshopify.com
SESSION_SECRET=<random-secret-for-sessions>

# Shopify Customer Account API (for authentication)
CUSTOMER_ACCOUNT_API_CLIENT_ID=<customer-api-client-id>
CUSTOMER_ACCOUNT_API_CLIENT_SECRET=<customer-api-client-secret>

# Judge.me
JUDGEME_SHOP_DOMAIN=<store>.myshopify.com
JUDGEME_PUBLIC_TOKEN=<judgeme-public-token>
JUDGEME_CDN_HOST=https://cdn.judge.me

# Resend
RESEND_API_KEY=<resend-api-key>
```

**Production (Oxygen)**:
- Set via Shopify Admin → Hydrogen channel settings
- Never commit secrets to repository

### Security Headers

```http
Content-Security-Policy: default-src 'self'; script-src 'self' https://cdn.judge.me; style-src 'self' 'unsafe-inline'; img-src 'self' https://cdn.shopify.com data:;
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
```

### Security Scope

**In Scope for Phase 1a**:
- ✅ HTTPS everywhere (Oxygen default)
- ✅ Input validation (Zod schemas)
- ✅ CSRF protection (Remix forms)
- ✅ Rate limiting on public forms (contact, newsletter, auth)
- ✅ Honeypot spam protection
- ✅ Secure cookie handling (HTTP-only, Secure, SameSite)
- ✅ Customer authentication (Shopify Customer Account API)
- ✅ Session token encryption
- ✅ Password hashing (handled by Shopify)
- ✅ Protected route middleware
- ✅ Privacy-focused error messages

**Out of Scope for Phase 1a**:
- ❌ Two-factor authentication (2FA)
- ❌ Social login (Google, Facebook, Apple)
- ❌ Advanced bot protection (Turnstile/hCaptcha)
- ❌ Account deletion self-service
- ❌ PCI compliance (handled by Shopify Checkout)

### Deployment

**Environments**:
- **Development**: Local (`npm run dev`)
- **Preview**: Auto-generated for PRs via GitHub integration
- **Production**: Oxygen edge deployment

**CI/CD Pipeline**:
1. PR opened → Lint, type-check, unit tests
2. Tests pass → Preview deployment generated
3. PR merged to main → Production deployment
4. Post-deploy → Smoke tests, Lighthouse audit

---

## 11. API Specification

### Shopify Storefront API

**Base Configuration**:
- API Version: `2025-01` (or latest stable)
- Endpoint: `https://{store}.myshopify.com/api/{version}/graphql.json`
- Authentication: Storefront API token (public, read-only)

**Key Queries**:

```graphql
# Product Detail
query Product($handle: String!) {
  product(handle: $handle) {
    id
    title
    description
    handle
    images(first: 10) {
      nodes {
        url
        altText
        width
        height
      }
    }
    variants(first: 50) {
      nodes {
        id
        title
        price {
          amount
          currencyCode
        }
        availableForSale
        selectedOptions {
          name
          value
        }
      }
    }
    metafields(identifiers: [
      { namespace: "custom", key: "dominant_color" }
    ]) {
      key
      value
    }
  }
}
```

**Key Mutations**:

```graphql
# Add to Cart with Line Item Properties
mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
  cartLinesAdd(cartId: $cartId, lines: $lines) {
    cart {
      id
      lines(first: 100) {
        nodes {
          id
          merchandise {
            ... on ProductVariant {
              id
              title
            }
          }
          attributes {
            key
            value
          }
          quantity
        }
      }
    }
    userErrors {
      field
      message
    }
  }
}
```

### Judge.me API

**Endpoints**:
- Product reviews: `GET /api/v1/reviews`
- Rating summary: `GET /api/v1/widgets/product_review`

**Headers**:
```http
Authorization: Bearer {JUDGEME_PUBLIC_TOKEN}
Content-Type: application/json
```

### Shopify Customer Account API

**Login Mutation**:
```graphql
mutation CustomerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
  customerAccessTokenCreate(input: $input) {
    customerAccessToken {
      accessToken
      expiresAt
    }
    customerUserErrors {
      code
      field
      message
    }
  }
}
```

**Get Customer Data**:
```graphql
query Customer($customerAccessToken: String!) {
  customer(customerAccessToken: $customerAccessToken) {
    id
    firstName
    lastName
    email
    phone
    defaultAddress {
      id
      address1
      city
      province
      zip
      country
    }
  }
}
```

**Get Order History**:
```graphql
query CustomerOrders($customerAccessToken: String!, $first: Int!) {
  customer(customerAccessToken: $customerAccessToken) {
    orders(first: $first) {
      nodes {
        id
        orderNumber
        processedAt
        totalPrice {
          amount
          currencyCode
        }
        financialStatus
        fulfillmentStatus
        lineItems(first: 10) {
          nodes {
            title
            variant {
              image {
                url
              }
            }
            customAttributes {
              key
              value
            }
          }
        }
      }
    }
  }
}
```

### Resend API

**Send Email** (Contact Form):
```typescript
await resend.emails.send({
  from: 'noreply@recoverytoken.store',
  to: 'support@recoverytoken.store',
  subject: `Contact Form: ${subject}`,
  react: ContactFormEmail({ name, email, message }),
});
```

**Send Account Email** (Welcome, Password Reset):
```typescript
await resend.emails.send({
  from: 'noreply@recoverytoken.store',
  to: customerEmail,
  subject: 'Welcome to Recovery Token Store',
  react: WelcomeEmail({ firstName }),
});
```

**Add to Audience** (Newsletter):
```typescript
await resend.contacts.create({
  email: subscriberEmail,
  audienceId: NEWSLETTER_AUDIENCE_ID,
  unsubscribed: false,
});
```

---

## 12. Success Criteria

### MVP Success Definition

The MVP is successful when:
1. Customers can complete the full purchase journey without errors
2. Site performance meets Core Web Vitals targets
3. Reviews are visible and build trust
4. Contact/newsletter forms function correctly
5. Mobile experience is polished and accessible

### Measurable KPIs

| Metric | Target | Measurement Method | Threshold |
|--------|--------|-------------------|-----------|
| **LCP (Largest Contentful Paint)** | < 2.5s | Lighthouse CI, Real User Monitoring | Fail: > 4.0s |
| **CLS (Cumulative Layout Shift)** | < 0.1 | Lighthouse CI, RUM | Fail: > 0.25 |
| **INP (Interaction to Next Paint)** | < 200ms | RUM | Fail: > 500ms |
| **Checkout Conversion Rate** | > 2.5% | Shopify Analytics | Warning: < 1.5% |
| **Cart Abandonment Rate** | < 70% | Shopify Analytics | Warning: > 80% |
| **Mobile Bounce Rate** | < 50% | GA4 | Warning: > 60% |
| **Page Error Rate** | < 0.1% | Sentry | Alert: > 1% |
| **Contact Form Completion** | > 80% | Custom event tracking | Warning: < 60% |
| **Newsletter Signup Rate** | > 1% of visitors | Resend + GA4 | N/A |
| **Review Widget Load Success** | > 99% | Error boundary tracking | Alert: < 95% |

**Telemetry Implementation**:
- Hydrogen Analytics Provider for standard ecommerce events
- Custom events via `Analytics.CustomEvent`:
  - `engraving_started` - User begins engraving form
  - `engraving_confirmed` - User confirms engraving modal
  - `contact_submitted` - Contact form success
  - `newsletter_signup` - Newsletter subscription
  - `account_created` - User completes registration
  - `login_success` - User successfully logs in
  - `order_history_viewed` - User views order history
  - `reorder_clicked` - User initiates reorder from history
  - `address_added` - User adds new address
- Consent-gated tracking (Shopify Customer Privacy API)
- Real User Monitoring via GA4 or custom implementation

### Functional Requirements

**Core Commerce**:
- ✅ Homepage loads with hero, featured products, brand messaging
- ✅ Collection pages display filtered products by milestone
- ✅ PDP shows all product details, variants, and reviews
- ✅ Engraving form validates input and shows preview
- ✅ Engraving confirmation modal enforces user acknowledgment
- ✅ Cart drawer shows all items with personalization details
- ✅ Discount codes can be applied and display correctly
- ✅ Checkout handoff passes cart and personalization to Shopify
- ✅ Contact form sends email and shows confirmation
- ✅ Newsletter signup triggers double opt-in flow

**Customer Accounts**:
- ✅ Users can create accounts with email/password
- ✅ Login validates credentials and creates session
- ✅ Password reset flow sends email and allows reset
- ✅ Account dashboard displays customer information
- ✅ Order history shows all past purchases
- ✅ Order detail page displays complete order information
- ✅ Reorder button adds past items to cart
- ✅ Profile can be edited and saved
- ✅ Addresses can be added, edited, deleted, and set as default
- ✅ Protected routes redirect unauthenticated users to login
- ✅ Session persists across navigation
- ✅ Logout clears session appropriately

**Technical**:
- ✅ All pages render Schema.org structured data
- ✅ 404 and error pages are branded and helpful
- ✅ Site is fully navigable via keyboard
- ✅ Reduced motion preference disables animations
- ✅ Guest checkout works without account

### Quality Indicators

- Lighthouse Performance Score: 90+
- Lighthouse Accessibility Score: 100
- Lighthouse Best Practices: 100
- Lighthouse SEO: 100
- Zero critical accessibility violations (axe DevTools)
- All forms pass validation without JavaScript
- Site remains functional if Judge.me fails

---

## 13. Implementation Phases

**Selected Scope**: Phase 1a (MVP + Customer Accounts & Order History)

### Phase 1.1: Foundation ("Golden Path")

**Goal**: Core purchase flow working end-to-end

**Timeline**: 3-4 weeks

**Deliverables**:
- ✅ Project scaffolding (Shopify CLI, Hydrogen, Oxygen)
- ✅ Basic routing structure
- ✅ Shopify Storefront API integration
- ✅ GraphQL codegen setup
- ✅ Product listing and detail pages
- ✅ Cart implementation (add/update/remove)
- ✅ Cart drawer component
- ✅ Checkout handoff
- ✅ Core styling (Tailwind, brand tokens)
- ✅ Basic SEO (meta tags)
- ✅ Responsive design (mobile-first)

**Validation**:
- E2E test: Browse → Add to Cart → Checkout (Playwright)
- Manual testing on iOS Safari, Android Chrome, Desktop Chrome/Firefox
- Lighthouse audit: LCP < 2.5s, CLS < 0.1

---

### Phase 1.2: Trust Layer

**Goal**: Build credibility with reviews and social proof

**Timeline**: 3-4 weeks

**Deliverables**:
- ✅ Judge.me integration (PDP + reviews page)
- ✅ Server-side rating badge (SEO)
- ✅ Lazy-loaded reviews widget
- ✅ Error boundary for reviews
- ✅ Schema.org structured data:
  - Product, Review, Organization, BreadcrumbList, FAQ
- ✅ Engraving form with validation
- ✅ Engraving confirmation modal
- ✅ Line item properties in cart
- ✅ Contact form (Resend)
- ✅ Newsletter signup (Resend Audiences)
- ✅ Empathetic error messaging
- ✅ Trust badges and return policy display

**Validation**:
- Google Rich Results Test (all schema types)
- Accessibility audit (axe, keyboard nav)
- Review display under various states (loading, error, empty)
- Engraving flow user testing

---

### Phase 1.3: Performance Polish

**Goal**: Optimize for Core Web Vitals and premium UX

**Timeline**: 2-3 weeks

**Deliverables**:
- ✅ Cache-Control headers by page type
- ✅ Image optimization:
  - Dominant color placeholders
  - Explicit aspect ratios
  - Lazy loading
- ✅ Hero image optimization (preload, blurhash)
- ✅ Route-based code splitting
- ✅ Prefetch on intent (link hover)
- ✅ Animation polish:
  - Cart drawer transitions
  - Button hover states
  - `prefers-reduced-motion` support
- ✅ Maintenance mode capability
- ✅ URL redirect handling

**Validation**:
- Lighthouse CI (all scores 90+)
- WebPageTest (3G mobile)
- No CLS during image/content load
- Verify caching headers in production

---

### Phase 1a: Customer Accounts & Order History

**Goal**: Enable customer authentication, profile management, and order history tracking

**Timeline**: 2.5-3.5 weeks

**Deliverables**:
- ✅ Authentication system (login/registration/password reset)
- ✅ Session management with secure cookies
- ✅ Account dashboard
- ✅ Order history list page
- ✅ Order detail page with reorder functionality
- ✅ Profile management (edit name, email, password)
- ✅ Address book (add, edit, delete, set default)
- ✅ Protected route middleware
- ✅ Account menu in header
- ✅ Milestone journey visualization
- ✅ Account-related email templates

**Validation**:
- E2E tests for all account flows
- Security testing (session management, unauthorized access)
- Password reset flow end-to-end
- Mobile responsiveness for account pages
- Accessibility audit for new pages
- Performance impact assessment

**Total Phase 1a Timeline**: 10.5-14.5 weeks

---

### Future Phases (Not in Current Scope)

**Phase 2: Personalization & Content Enhancement**
- Gift flow with milestone date capture
- Headless CMS integration (Sanity/Contentful)
- Blog functionality
- Recovery resources section
- Enhanced About page with CMS content

**Phase 3: Advanced Features**
- Wishlist/favorites functionality
- Advanced analytics dashboards
- Error monitoring (Sentry)
- A/B testing framework
- International expansion (multi-currency, localization)
- Loyalty/rewards program
- Subscription orders

---

## 14. Future Considerations

### Post-MVP Enhancements

**Product Expansion**:
- Token bundles (milestone sets)
- Gift boxes and premium packaging options
- Subscription for milestone tokens (annual delivery)

**Personalization**:
- Photo engraving/etching
- Multiple font options
- Token display cases and accessories

**Community Features**:
- User-generated milestone stories
- Community reviews with milestone context
- Recovery journey timeline visualization

**Marketing & Growth**:
- Referral program
- Sponsor gifting program (bulk orders)
- Corporate/organization accounts

### Integration Opportunities

- **Recovery Apps**: Partner with sobriety tracking apps for milestone notifications
- **Support Organizations**: Wholesale/partner pricing for AA/NA chapters
- **Gift Registries**: Integration with milestone celebration registries

### Technical Roadmap

- **Performance**: Edge-cached personalized recommendations
- **International**: Multi-currency, translated content
- **Mobile**: PWA capabilities for repeat customers
- **Analytics**: Custom dashboard for recovery-specific metrics

---

## 15. Risks & Mitigations

### Risk 1: Judge.me Widget Reliability

**Risk**: Third-party widget failures causing user experience issues
**Impact**: Medium - Loss of social proof, potential conversion impact
**Mitigation**:
- Implement robust error boundaries
- Server-side fallback for rating badge
- Monitor widget load success rate
- Document fallback messaging

### Risk 2: Engraving Errors and Refunds

**Risk**: Customers claiming engraving errors to request refunds
**Impact**: High - Revenue loss, customer service burden
**Mitigation**:
- Mandatory confirmation modal with preview
- Non-refundable acknowledgment checkbox
- Audit trail of confirmation (timestamp, text snapshot)
- Clear policy in terms of service
- Quality preview that matches final product

### Risk 3: Performance Degradation

**Risk**: Third-party scripts or images impacting Core Web Vitals
**Impact**: High - SEO ranking, conversion rates
**Mitigation**:
- Strict performance budgets in CI
- Lazy load all non-critical resources
- Image optimization pipeline
- Regular Lighthouse audits
- Alert on performance regression

### Risk 4: Cart/Checkout Data Loss

**Risk**: Cart data lost during session or checkout handoff
**Impact**: High - Direct revenue loss
**Mitigation**:
- Server-side cart persistence (Shopify Cart API)
- Cookie-based cart ID
- Comprehensive error handling
- Monitor cart abandonment patterns

### Risk 5: Sensitive Content Handling

**Risk**: Recovery-related purchases may be sensitive; privacy concerns
**Impact**: Medium - Brand trust, legal considerations
**Mitigation**:
- Discreet packaging options
- Clear privacy policy
- Minimal data collection
- Secure cookie handling
- No judgment in marketing communications

---

## 16. Pre-Launch Security Checklist

### 🚨 CRITICAL: Production Security Requirements

These items are **MANDATORY** before launching to production. Failure to complete these tasks will result in security vulnerabilities.

#### 1. SESSION_SECRET Configuration (BLOCKER)

**Status**: ⚠️ **MUST BE COMPLETED BEFORE LAUNCH**

**Issue**: Development is currently using a weak SESSION_SECRET (`lucid-dev-secret`). This is **NOT SECURE** for production use.

**Required Action**:

1. **Generate a cryptographically secure SESSION_SECRET**:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

2. **Update production environment variables**:
   - **Vercel**: Add to Environment Variables in project settings
   - **Oxygen**: Add via Shopify Admin → Hydrogen channel settings
   - **Never** commit the production secret to the repository

3. **Verify the secret is unique and strong**:
   - Minimum 32 bytes (256 bits) of entropy
   - Must be different from development secret
   - Should be different across environments (production, staging, preview)

**Why This Matters**:
- `SESSION_SECRET` is used to encrypt session cookies containing customer authentication tokens
- A weak or public secret allows attackers to forge session cookies and impersonate users
- This could lead to unauthorized access to customer accounts, orders, and personal information

**Timeline**: ✅ **Complete this BEFORE first production deployment**

#### 2. Environment Variable Audit

Before launch, verify all environment variables are properly configured:

**Local Development (`.env`)**:
```env
SESSION_SECRET="lucid-dev-secret"  # ✅ OK for local dev only
```

**Production (Vercel/Oxygen)**:
```env
SESSION_SECRET="<STRONG_UNIQUE_SECRET_HERE>"  # 🚨 MUST be different!
```

**Checklist**:
- [ ] Production `SESSION_SECRET` is cryptographically secure (32+ bytes)
- [ ] Production secret is different from development secret
- [ ] Secret is stored securely in hosting platform (never in code)
- [ ] All team members understand not to share/commit production secrets
- [ ] Secrets rotation plan documented (recommend: rotate quarterly)

#### 3. HTTPS Enforcement

**Requirement**: All production traffic must use HTTPS

- [ ] SSL/TLS certificate configured on hosting platform
- [ ] HTTP requests automatically redirect to HTTPS
- [ ] `Secure` flag set on all cookies (handled by Hydrogen)
- [ ] HSTS header configured (max-age=31536000)

#### 4. Customer Account API Configuration

- [ ] Customer Account API credentials verified in Shopify Admin
- [ ] Allowed domains configured for production URL
- [ ] Callback URLs properly set for authentication flow
- [ ] Test authentication flow on production domain before launch

#### 5. Security Headers

Verify these security headers are configured:

```http
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: [configured for your domain]
```

#### 6. API Token Security

- [ ] Storefront API tokens have minimal required permissions
- [ ] No admin API tokens exposed to frontend
- [ ] Private tokens (e.g., `PRIVATE_STOREFRONT_API_TOKEN`) never sent to client
- [ ] All API tokens rotated if ever committed to version control

#### 7. Rate Limiting

- [ ] Rate limiting configured on authentication endpoints
- [ ] Contact form has rate limiting and honeypot protection
- [ ] Newsletter signup protected against abuse

---

### Pre-Launch Testing Checklist

Before launching, complete these security tests:

- [ ] Attempt to access protected routes without authentication
- [ ] Verify session cookies are HTTP-only and Secure
- [ ] Test password reset flow end-to-end
- [ ] Verify CSRF protection on all forms
- [ ] Run security audit: `npm audit`
- [ ] Test with invalid/expired session tokens
- [ ] Verify sensitive data not logged in production

---

### Emergency Contacts & Procedures

**If a security issue is discovered post-launch**:

1. **Rotate compromised secrets immediately**
2. **Invalidate all active sessions** (force re-authentication)
3. **Review access logs** for suspicious activity
4. **Notify affected customers** if data was accessed
5. **Document incident** and update security procedures

**Security Response Team**:
- Technical Lead: [Contact Info]
- Store Owner: [Contact Info]
- Shopify Support: [Partner Dashboard]

---

## 17. Appendix

### Related Documents

- [Initial Project Research Doc](/.cursor/docs/references/initial-project-research-doc.md) - Technical research and recommendations
- [Phase 1a Scope of Work](/sow-phase-1a.md) - Detailed implementation scope and timeline (selected option)
- [Technology Comparison](/technology-comparison.md) - Hydrogen vs. Liquid comparison and decision rationale

### Key Dependencies

| Dependency | Documentation | Notes |
|------------|--------------|-------|
| Shopify Hydrogen | [docs.shopify.com/hydrogen](https://shopify.dev/docs/custom-storefronts/hydrogen) | Primary framework |
| Remix | [remix.run/docs](https://remix.run/docs) | Routing, loaders, actions |
| Tailwind CSS | [tailwindcss.com/docs](https://tailwindcss.com/docs) | Styling |
| Radix UI | [radix-ui.com](https://www.radix-ui.com) | Accessible primitives |
| Judge.me | [judge.me/help](https://judge.me/help) | Reviews integration |
| Resend | [resend.com/docs](https://resend.com/docs) | Email API |
| React Email | [react.email](https://react.email) | Email templates |

### Glossary

| Term | Definition |
|------|------------|
| **Milestone** | A recovery achievement duration (24 hours, 30 days, 90 days, 6 months, 1 year, etc.) |
| **Token** | Physical commemorative item celebrating a recovery milestone |
| **Line Item Property** | Custom data attached to individual cart items (e.g., engraving text) |
| **Cart Attribute** | Custom data attached to entire cart/order (e.g., gift message) |
| **PDP** | Product Detail Page |
| **CWV** | Core Web Vitals (LCP, CLS, INP) |
| **Oxygen** | Shopify's edge hosting platform for Hydrogen |
| **Loader** | Remix server-side function that fetches data for a route |
| **Action** | Remix server-side function that handles form submissions |

---

*Document created: January 23, 2026*  
*Last updated: January 30, 2026 (Added Design System & Visual Language - Section 3)*
