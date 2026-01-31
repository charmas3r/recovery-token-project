# Recovery Token Store - Skill Tree Structure

**Last Updated:** January 30, 2026  
**Status:** ✅ Validated & Production Ready

---

## Skill Tree Overview

```
Recovery Token Store Skills (11 Total)
├── Infrastructure Layer (4 skills)
│   ├── shopify-storefront-api      # Public Shopify data
│   ├── shopify-customer-account-api # Customer authentication
│   ├── graphql-queries              # Query composition
│   └── email-integration            # Resend email service
│
├── Feature Layer (4 skills)
│   ├── cart-management              # Shopping cart operations
│   ├── product-personalization      # Engraving & customization
│   ├── reviews-integration          # Judge.me reviews
│   └── seo-structured-data          # SEO & Schema.org
│
├── Application Layer (1 skill)
│   └── react-router-patterns        # Routing & data loading
│
└── Cross-Cutting Layer (2 skills)
    ├── form-validation              # Zod validation schemas
    └── ui-components                # Radix UI primitives
```

---

## Skill Dependency Map

### Infrastructure Skills

**shopify-storefront-api**
- Used by: cart-management, product-personalization, reviews-integration, seo-structured-data
- Uses: graphql-queries (for query patterns)
- Purpose: Execute Shopify API queries in loaders

**shopify-customer-account-api**
- Used by: react-router-patterns (protected routes), email-integration
- Uses: form-validation (for customer forms)
- Purpose: Customer authentication and profile management

**graphql-queries**
- Used by: shopify-storefront-api, shopify-customer-account-api
- Independent: Provides patterns for query composition
- Purpose: GraphQL query structure and fragments

**email-integration**
- Used by: Contact forms, newsletter, order confirmations
- Uses: form-validation
- Purpose: Send transactional and marketing emails

---

### Feature Skills

**cart-management**
- Used by: Product pages, cart page, checkout flow
- Uses: shopify-storefront-api, product-personalization, react-router-patterns
- Purpose: Shopping cart CRUD operations

**product-personalization**
- Used by: Product pages, cart display
- Uses: form-validation, cart-management, ui-components
- Purpose: Engraving and product customization

**reviews-integration**
- Used by: Product pages, SEO schema
- Uses: shopify-storefront-api, seo-structured-data, ui-components
- Purpose: Display Judge.me reviews and ratings

**seo-structured-data**
- Used by: All public pages
- Uses: react-router-patterns, shopify-storefront-api, reviews-integration
- Purpose: SEO meta tags and Schema.org markup

---

### Application Layer

**react-router-patterns**
- Used by: All routes
- Uses: shopify-storefront-api, shopify-customer-account-api, form-validation
- Purpose: Route structure, loaders, actions, protected routes

---

### Cross-Cutting Skills

**form-validation**
- Used by: All forms (contact, newsletter, auth, account, engraving)
- Uses: react-router-patterns (for actions)
- Purpose: Zod schemas and validation helpers

**ui-components**
- Used by: All UI features
- Independent: Provides reusable UI primitives
- Purpose: Radix UI components and Tailwind patterns

---

## Skill Usage Matrix

| Skill | Products | Cart | Account | Reviews | Contact | Newsletter | SEO |
|-------|----------|------|---------|---------|---------|------------|-----|
| shopify-storefront-api | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ |
| shopify-customer-account-api | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ |
| graphql-queries | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| react-router-patterns | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| cart-management | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| product-personalization | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| reviews-integration | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| seo-structured-data | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ |
| form-validation | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ | ❌ |
| ui-components | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| email-integration | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ | ❌ |

---

## Common Implementation Patterns

### Pattern 1: Product Detail Page
```
Skills needed:
1. shopify-storefront-api → Fetch product data
2. graphql-queries → Define product query
3. product-personalization → Engraving form
4. cart-management → Add to cart
5. reviews-integration → Display reviews
6. seo-structured-data → Product schema
7. ui-components → UI primitives
```

### Pattern 2: Customer Account Page
```
Skills needed:
1. shopify-customer-account-api → Fetch customer data
2. react-router-patterns → Protected route
3. form-validation → Profile forms
4. ui-components → Form components
```

### Pattern 3: Shopping Cart
```
Skills needed:
1. cart-management → Cart operations
2. shopify-storefront-api → Cart queries
3. product-personalization → Display engraving
4. ui-components → Cart drawer
5. react-router-patterns → Cart actions
```

### Pattern 4: Contact Form
```
Skills needed:
1. form-validation → Form schema
2. email-integration → Send email
3. react-router-patterns → Form action
4. ui-components → Form UI
```

---

## Skill Complexity Ratings

| Skill | Complexity | Patterns | Lines of Code | Learning Curve |
|-------|------------|----------|---------------|----------------|
| ui-components | Medium | 8 | ~470 | Moderate |
| form-validation | Low | 10 | ~654 | Easy |
| react-router-patterns | Medium | 8 | ~591 | Moderate |
| cart-management | Medium | 7 | ~657 | Moderate |
| shopify-storefront-api | High | 10 | ~573 | Steep |
| shopify-customer-account-api | High | 8 | ~800 | Steep |
| graphql-queries | Medium | 6 | ~514 | Moderate |
| product-personalization | Medium | 6 | ~629 | Moderate |
| seo-structured-data | Low | 7 | ~465 | Easy |
| email-integration | Low | 4 | ~312 | Easy |
| reviews-integration | Low | 5 | ~374 | Easy |

---

## Quick Reference Guide

### For Product Features
Start with: `shopify-storefront-api`, `graphql-queries`, `react-router-patterns`

### For Customer Features  
Start with: `shopify-customer-account-api`, `form-validation`, `react-router-patterns`

### For Forms
Start with: `form-validation`, `ui-components`, `react-router-patterns`

### For Cart/Checkout
Start with: `cart-management`, `shopify-storefront-api`, `product-personalization`

### For SEO
Start with: `seo-structured-data`, `react-router-patterns`

### For Third-Party Integrations
- Reviews: `reviews-integration`
- Email: `email-integration`

---

## Skill Coverage by PRD Feature

| PRD Feature | Required Skills |
|-------------|-----------------|
| Product Browsing | shopify-storefront-api, graphql-queries, react-router-patterns, ui-components |
| Product Detail Pages | shopify-storefront-api, graphql-queries, react-router-patterns, seo-structured-data, reviews-integration, ui-components |
| Shopping Cart | cart-management, shopify-storefront-api, react-router-patterns, ui-components |
| Product Engraving | product-personalization, form-validation, cart-management, ui-components |
| Customer Registration | shopify-customer-account-api, form-validation, react-router-patterns, email-integration |
| Customer Login | shopify-customer-account-api, form-validation, react-router-patterns |
| Order History | shopify-customer-account-api, react-router-patterns, ui-components |
| Profile Management | shopify-customer-account-api, form-validation, react-router-patterns, ui-components |
| Address Book | shopify-customer-account-api, form-validation, react-router-patterns, ui-components |
| Contact Form | form-validation, email-integration, react-router-patterns, ui-components |
| Newsletter Signup | form-validation, email-integration, react-router-patterns |
| Reviews Display | reviews-integration, shopify-storefront-api, seo-structured-data, ui-components |
| SEO Implementation | seo-structured-data, react-router-patterns, shopify-storefront-api |

---

## Validation Status

✅ **All skills validated**
✅ **No circular dependencies**
✅ **Clear separation of concerns**
✅ **Production ready**

**Last Validation:** January 30, 2026
**Validation Report:** `.cursor/docs/skill-tree-validation.md`
