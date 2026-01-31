# SCOPE OF WORK

**Project**: Recovery Token Store - Shopify Hydrogen Storefront  
**Client**: [Client Name]  
**Contractor**: [Contractor Name]  
**Effective Date**: January 26, 2026  
**Delivery Timeline**: 6 weeks from effective date  
**Project Completion Date**: March 9, 2026

---

## 1. PROJECT OVERVIEW

Contractor will develop and deploy a premium ecommerce storefront for Recovery Token Store using Shopify Hydrogen (React Router v7), deployed to Shopify Oxygen. The storefront will enable customers to browse physical recovery tokens by milestone, personalize purchases with engraving, and manage their accounts with order history tracking.

---

## 2. DELIVERABLES & FEATURES

### 2.1 Core Commerce Functionality
- Product browsing by milestone collection (24 hours, 30 days, 90 days, 6 months, 1+ years)
- Product detail pages with variant selection and high-quality imagery
- Shopping cart with add/update/remove functionality
- Cart drawer with real-time updates
- Discount code application
- Checkout handoff to Shopify's hosted checkout
- Guest checkout and registered customer checkout support

### 2.2 Personalization & Engraving
- Engraving form with character validation (50 character limit)
- Live preview of engraving text
- Mandatory confirmation modal before add-to-cart with:
  - Visual preview of engraved text
  - Non-refundable acknowledgment checkbox
  - Clear confirmation workflow
- Line item properties for engraving stored in cart and checkout

### 2.3 Customer Account Management
- User registration and login (Shopify Customer Account API)
- Password reset flow via email
- Account dashboard with customer information
- Order history list with filtering by status
- Detailed order view with all line items and engraving details
- Reorder functionality from order history
- Profile management (name, email, password updates)
- Address book (add, edit, delete, set default shipping address)
- Protected route middleware for account pages
- Secure session management with HTTP-only cookies

### 2.4 Trust & Social Proof
- Judge.me reviews integration on product detail pages
- Dedicated reviews page
- Schema.org structured data (Product, Review, Organization, BreadcrumbList)
- Trust badges (secure checkout, return policy)
- Error boundaries for graceful degradation

### 2.5 Content Pages
- Homepage with hero section, featured products, and brand story
- About/Mission page
- Contact form with Resend integration
- FAQ page
- Support hub (shipping/returns information)
- Legal pages (privacy policy, terms of service, refund policy)

### 2.6 Email & Newsletter
- Contact form submission emails via Resend
- Newsletter signup with double opt-in (Resend Audiences)
- Account-related email templates (welcome, password reset)

### 2.7 Technical Foundation
- TypeScript with GraphQL code generation
- Tailwind CSS styling with brand tokens
- Edge caching strategy for optimal performance
- Core Web Vitals optimization (LCP < 2.5s, CLS < 0.1)
- Error boundaries for graceful error handling
- SEO fundamentals (meta tags, sitemaps, robots.txt, OpenGraph)
- Responsive design (mobile, tablet, desktop)
- WCAG 2.1 AA accessibility compliance
- Security headers and HTTPS enforcement
- Production-ready SESSION_SECRET configuration

---

## 3. TECHNICAL SPECIFICATIONS

**Stack**:
- Shopify Hydrogen (React Router v7-based)
- TypeScript 5.x
- Tailwind CSS 3.x
- Radix UI for accessible components
- Vite bundler
- Shopify Oxygen (edge hosting)

**Third-Party Integrations**:
- Shopify Storefront API
- Shopify Customer Account API
- Judge.me (Awesome plan) for reviews
- Resend for transactional and marketing email

**Performance Targets**:
- Largest Contentful Paint (LCP): < 2.5 seconds
- Cumulative Layout Shift (CLS): < 0.1
- Interaction to Next Paint (INP): < 200ms
- Lighthouse Performance Score: 90+
- Lighthouse Accessibility Score: 100

---

## 4. DELIVERY SCHEDULE

**Week 1-2**: Core commerce foundation
- Project scaffolding and Shopify integration
- Product listing and detail pages
- Cart implementation with drawer component
- Basic responsive styling

**Week 3-4**: Personalization and accounts
- Engraving form with validation and confirmation modal
- Customer authentication system (login, registration, password reset)
- Account dashboard and profile management
- Address book functionality

**Week 5**: Reviews, content, and polish
- Judge.me integration with error handling
- Content pages (About, Contact, FAQ, Legal)
- Email integration (Resend)
- Newsletter signup

**Week 6**: Testing, optimization, and deployment
- Order history and reorder functionality
- Performance optimization and Core Web Vitals tuning
- Cross-browser and device testing
- Security audit and production environment setup
- Production deployment to Shopify Oxygen

---

## 5. EXPLICITLY OUT OF SCOPE

The following items are **NOT INCLUDED** in this 6-week scope of work and will require separate agreements:

### 5.1 Deferred Features
- ❌ Headless CMS integration (Sanity/Contentful)
- ❌ Blog functionality
- ❌ Recovery resources content section
- ❌ Advanced search with filters and faceting
- ❌ Gift flow with milestone date capture
- ❌ Wishlist/favorites functionality
- ❌ Loyalty or rewards program
- ❌ Subscription/recurring orders
- ❌ A/B testing framework
- ❌ Advanced analytics dashboards
- ❌ Social login integrations (Google, Facebook, Apple)
- ❌ Two-factor authentication (2FA)

### 5.2 Technical Exclusions
- ❌ Custom checkout page (using Shopify hosted checkout)
- ❌ Mobile native applications (iOS/Android)
- ❌ Marketplace features (multiple sellers)
- ❌ Wholesale/B2B functionality
- ❌ International shipping logic or multi-currency support
- ❌ Advanced bot protection (Turnstile/hCaptcha)
- ❌ Third-party analytics platform integration beyond basic Google Analytics

### 5.3 Content & Design
- ❌ Product photography or image editing
- ❌ Copywriting for product descriptions or marketing pages
- ❌ Brand identity design (logo, color palette, typography)
- ❌ Custom illustration or icon design beyond Lucide React library
- ❌ Video production or editing

### 5.4 Ongoing Services
- ❌ Hosting fees (Shopify Oxygen subscription)
- ❌ Domain registration or DNS management
- ❌ SSL certificate procurement
- ❌ Post-launch maintenance or support (requires separate retainer)
- ❌ Content updates or product data entry
- ❌ Email marketing campaigns or design
- ❌ Customer service or order fulfillment support

---

## 6. CLIENT RESPONSIBILITIES

Client agrees to provide the following within **3 business days** of contract signing to avoid timeline delays:

1. **Shopify Store Access**: Admin credentials and API tokens
2. **Brand Assets**: Logo, color palette, font files (if custom)
3. **Content**: Copy for homepage, About page, FAQ, legal pages
4. **Product Data**: Product descriptions, images, pricing, and variants
5. **Third-Party Accounts**: Judge.me account setup, Resend account with API key
6. **Environment Configuration**: Production domain, DNS access, necessary credentials
7. **Timely Feedback**: Review and approval of deliverables within 2 business days

---

## 7. ACCEPTANCE CRITERIA

The project will be considered complete and accepted when:

1. All features in Section 2 (Deliverables & Features) are functional in production
2. Site passes Core Web Vitals performance targets (Section 3)
3. All pages are responsive across mobile, tablet, and desktop devices
4. Site passes WCAG 2.1 AA accessibility audit (zero critical violations)
5. End-to-end purchase flow tested successfully (browse → cart → checkout)
6. Customer account flows tested successfully (registration → login → order history → profile management)
7. Production deployment completed with secure SESSION_SECRET configuration

Client will have **5 business days** from delivery notification to test and provide written acceptance or a detailed list of defects that prevent acceptance criteria from being met.

---

## 8. PAYMENT TERMS

**Total Project Fee**: $[AMOUNT]

**Payment Schedule**:
- 50% ($[AMOUNT]) due upon contract signing
- 50% ($[AMOUNT]) due upon client acceptance and production deployment

Payments shall be made via [Payment Method] within [Number] days of invoice date.

---

## 9. WARRANTY & SUPPORT

Contractor warrants that all deliverables will be free from defects in functionality for **30 days** following client acceptance. Defects reported within this period will be corrected at no additional charge.

Post-warranty support and maintenance require a separate maintenance agreement.

---

## 10. CHANGE ORDERS

Any changes to the scope defined in this document must be requested in writing and will require a change order specifying:
- Description of requested changes
- Impact on timeline and budget
- Updated delivery date

Both parties must sign the change order before work proceeds on out-of-scope items.

---

## 11. INTELLECTUAL PROPERTY

Upon final payment, Client will own all custom code, components, and design assets created specifically for this project. Contractor retains rights to reuse general-purpose code patterns, utilities, and open-source components.

---

## 12. SIGNATURES

**CLIENT**  
Signature: ___________________________  
Name: [Client Name]  
Date: ___________________________

**CONTRACTOR**  
Signature: ___________________________  
Name: [Contractor Name]  
Date: ___________________________

---

*This scope of work represents the complete agreement between the parties regarding the described work and supersedes all prior discussions and agreements.*
