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

## 3. Target Users

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

## 4. MVP Scope

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

## 5. User Stories

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

## 6. Core Architecture & Patterns

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

## 7. Features

### 7.1 Product Display System

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

### 7.2 Personalization (Engraving)

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

### 7.3 Cart System

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

### 7.4 Reviews Integration (Judge.me)

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

### 7.5 Contact & Newsletter

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

### 7.6 SEO & Structured Data

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

### 7.7 Customer Account Management

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

### 7.8 Error Handling & Maintenance

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

## 8. Technology Stack

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

## 9. Security & Configuration

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

## 10. API Specification

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

## 11. Success Criteria

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

## 12. Implementation Phases

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

## 13. Future Considerations

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

## 14. Risks & Mitigations

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

## 15. Appendix

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
*Last updated: January 23, 2026 (Phase 1a scope confirmed)*
