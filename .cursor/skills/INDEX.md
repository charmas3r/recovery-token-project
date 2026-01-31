# Recovery Token Store - Skills Reference Index

**Last Updated:** January 30, 2026  
**Purpose:** Quick reference guide to all skill documentation and reference materials

---

## Quick Start for AI Agents

When implementing a feature:

1. **Read the SKILL.md** for implementation patterns and code examples
2. **Read the REFERENCE.md** for industry best practices, security, and advanced patterns
3. **Use Shopify MCP tools** for schema exploration and official documentation

---

## Skills Overview

| Skill | SKILL.md | REFERENCE.md | MCP Tools | Priority |
|-------|----------|--------------|-----------|----------|
| **design-system** | ✅ Complete | ✅ Complete | ❌ No | 🔴 Critical |
| **shopify-storefront-api** | ✅ Complete | ✅ Complete | ✅ Yes | 🔴 Critical |
| **shopify-customer-account-api** | ✅ Complete | ✅ Complete | ✅ Yes | 🔴 Critical |
| **react-router-patterns** | ✅ Complete | ✅ Complete | ❌ No | 🔴 Critical |
| **form-validation** | ✅ Complete | ✅ Complete | ❌ No | 🟡 High |
| **cart-management** | ✅ Complete | ✅ Complete | ✅ Yes | 🟡 High |
| **product-personalization** | ✅ Complete | ✅ Complete | ❌ No | 🟡 High |
| **graphql-queries** | ✅ Complete | ✅ Complete | ✅ Yes | 🟡 High |
| **ui-components** | ✅ Complete | ✅ Complete | ❌ No | 🟡 High |
| **seo-structured-data** | ✅ Complete | ✅ Complete | ❌ No | 🟢 Medium |
| **email-integration** | ✅ Complete | ✅ Complete | ❌ No | 🟢 Medium |
| **reviews-integration** | ✅ Complete | ✅ Complete | ❌ No | 🟢 Medium |

**Legend:**
- 🔴 Critical: Essential for core features
- 🟡 High: Important for product quality
- 🟢 Medium: Enhancement features

**Coverage Status:** ✅ 100% Complete - All 12 skills have both SKILL.md and REFERENCE.md

---

## Reference Documentation Available

### 0. Design System Reference (NEW - CRITICAL)
**File:** `.cursor/skills/design-system/REFERENCE.md`
**Rule:** `.cursor/rules/design-system.mdc`
- Typography scale, color system, spacing (8px grid)
- Component patterns, layout, responsive design
- Accessibility (WCAG AA), performance optimization
- **MUST READ BEFORE ANY UI WORK**

### 1. Shopify Storefront API Reference
**File:** `.cursor/skills/shopify-storefront-api/REFERENCE.md`
- GraphQL optimization, pagination, caching
- MCP integration (learn_shopify_api, introspect_graphql_schema)
- Performance (TTFB, images, batching)
- Security & advanced patterns

### 2. Shopify Customer Account API Reference
**File:** `.cursor/skills/shopify-customer-account-api/REFERENCE.md`
- OAuth 2.0, session management, password requirements
- Authentication & security (cookies, CSRF, privacy)
- GDPR compliance & audit logging
- MCP integration

### 3. Form Validation Reference
**File:** `.cursor/skills/form-validation/REFERENCE.md`
- Progressive enhancement, validation timing
- Zod best practices & composition
- Security (sanitization, rate limiting, honeypot)
- Accessibility & testing

### 4. React Router Patterns Reference
**File:** `.cursor/skills/react-router-patterns/REFERENCE.md`
- React Router v7 vs Remix distinctions
- Data loading, error handling, loading states
- Performance (prefetching, parallel fetching, cache headers)
- Protected routes & CSRF

### 5. Cart Management Reference
**File:** `.cursor/skills/cart-management/REFERENCE.md`
- Cart state management & persistence
- Optimistic UI updates & progressive enhancement
- Line item attributes preservation
- Performance optimization & security

### 6. Product Personalization Reference
**File:** `.cursor/skills/product-personalization/REFERENCE.md`
- UX best practices (preview, character limits)
- Input validation & sanitization
- Public vs private attributes
- Accessibility & testing

### 7. GraphQL Queries Reference
**File:** `.cursor/skills/graphql-queries/REFERENCE.md`
- Fragment-first approach & organization
- Pagination, error handling, type safety
- MCP integration for schema exploration
- Code generation & testing

### 8. SEO & Structured Data Reference
**File:** `.cursor/skills/seo-structured-data/REFERENCE.md`
- Meta tags priority & Schema.org patterns
- Breadcrumbs, product reviews, FAQ schema
- Sitemap generation & robots.txt
- Testing & validation

### 9. UI Components Reference
**File:** `.cursor/skills/ui-components/REFERENCE.md`
- Component design principles (composition, polymorphism)
- Accessibility (ARIA, keyboard navigation, focus management)
- Tailwind CSS best practices
- Radix UI patterns & performance

### 10. Email Integration Reference
**File:** `.cursor/skills/email-integration/REFERENCE.md`
- Transactional vs marketing emails
- Email authentication (SPF, DKIM, DMARC)
- Rate limiting & security
- Template best practices with React Email

### 11. Reviews Integration Reference
**File:** `.cursor/skills/reviews-integration/REFERENCE.md`
- Judge.me API integration patterns
- SEO with Schema.org reviews
- Performance optimization & caching
- Error handling & graceful degradation

---

## Using Shopify MCP Server Tools

### Available MCP Tools

**1. learn_shopify_api**
- **Purpose:** Initialize API context and get conversationId
- **Must call first:** Required before all other MCP tools
- **APIs Available:** admin, storefront-graphql, customer, hydrogen, and more

**2. introspect_graphql_schema**
- **Purpose:** Explore GraphQL schema fields, queries, mutations
- **When to use:** Discovering available fields, checking field names, seeing mutation signatures
- **Requires:** conversationId from learn_shopify_api

**3. search_docs_chunks**
- **Purpose:** Search Shopify documentation for specific topics
- **When to use:** Finding implementation examples, best practices, official guidance
- **Requires:** conversationId from learn_shopify_api

### MCP Workflow Pattern

```
┌─────────────────────────────────────────┐
│ 1. Call learn_shopify_api              │
│    → Get conversationId                 │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│ 2. Call introspect_graphql_schema       │
│    → Discover available fields          │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│ 3. Call search_docs_chunks              │
│    → Get implementation examples        │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│ 4. Implement using SKILL.md patterns   │
│    + REFERENCE.md best practices        │
└─────────────────────────────────────────┘
```

### Example: Implementing Customer Login

```
Step 1: learn_shopify_api
  api: "customer"
  → Returns: {conversationId: "uuid"}

Step 2: introspect_graphql_schema
  conversationId: "uuid"
  query: "login"
  api: "customer"
  → Discover: customerAccessTokenCreate mutation

Step 3: search_docs_chunks
  conversationId: "uuid"
  prompt: "customer login with Hydrogen"
  → Get: Official implementation guide

Step 4: Implement
  - Read: .cursor/skills/shopify-customer-account-api/SKILL.md
  - Read: .cursor/skills/shopify-customer-account-api/REFERENCE.md
  - Copy patterns, apply best practices
```

---

## Feature Implementation Guide

### For Product Features

**Skills Needed:**
1. `design-system` - Colors, typography, spacing, layout (READ FIRST)
2. `shopify-storefront-api` - Data fetching
3. `graphql-queries` - Query structure
4. `react-router-patterns` - Route setup
5. `ui-components` - UI primitives

**References to Read:**
- shopify-storefront-api/REFERENCE.md (performance, caching)
- react-router-patterns/REFERENCE.md (data loading patterns)

**MCP Tools:**
- learn_shopify_api(api: "storefront-graphql")
- introspect_graphql_schema(query: "product")

---

### For Customer Features

**Skills Needed:**
1. `design-system` - Colors, typography, spacing, forms (READ FIRST)
2. `shopify-customer-account-api` - Authentication
3. `form-validation` - Form schemas
4. `react-router-patterns` - Protected routes
5. `ui-components` - Form UI

**References to Read:**
- shopify-customer-account-api/REFERENCE.md (security, OAuth)
- form-validation/REFERENCE.md (validation, accessibility)

**MCP Tools:**
- learn_shopify_api(api: "customer")
- introspect_graphql_schema(query: "customer")

---

### For Forms

**Skills Needed:**
1. `design-system` - Form styling, inputs, buttons (READ FIRST)
2. `form-validation` - Zod schemas
3. `react-router-patterns` - Form actions
4. `ui-components` - Form components

**References to Read:**
- form-validation/REFERENCE.md (security, accessibility)
- react-router-patterns/REFERENCE.md (CSRF protection)

**MCP Tools:**
- None required (client-side validation)

---

### For Cart/Checkout

**Skills Needed:**
1. `design-system` - Drawer, cards, buttons (READ FIRST)
2. `cart-management` - Cart operations
3. `shopify-storefront-api` - Cart queries
4. `product-personalization` - Line item properties
5. `ui-components` - Cart drawer

**References to Read:**
- shopify-storefront-api/REFERENCE.md (cart caching)

**MCP Tools:**
- learn_shopify_api(api: "storefront-graphql")
- introspect_graphql_schema(query: "cart")

---

## Best Practices Summary

### Always Read Both SKILL.md and REFERENCE.md

**SKILL.md provides:**
- Implementation patterns
- Copy-pasteable code
- Type definitions
- Common operations
- Basic gotchas

**REFERENCE.md provides:**
- Industry best practices
- Security considerations
- Performance optimization
- Advanced patterns
- Troubleshooting
- Compliance (GDPR, accessibility)

### Use MCP Tools for Discovery

**Before implementing:**
1. Use MCP tools to explore schema
2. Get official Shopify documentation
3. Understand available fields/mutations
4. See official examples

**Don't:**
- Search the web for Shopify info (may be outdated)
- Guess at field names
- Assume API structure

### Follow Security Best Practices

**Always:**
- Validate inputs server-side
- Use React Router Form (CSRF protection)
- Implement rate limiting
- Use secure cookies
- Never expose private tokens
- Log security events

### Optimize Performance

**Always:**
- Defer non-critical data
- Use proper cache headers
- Prefetch likely navigation
- Parallel data fetching
- Show loading states
- Implement error boundaries

---

## Documentation Standards

All REFERENCE.md files follow consistent standards:

**Required Sections:**
1. Industry Best Practices section
2. Security Considerations section
3. Performance Optimization section
4. Common Pitfalls & Solutions section
5. Testing Patterns section
6. MCP Integration section (where applicable)

**Format Standards:**
- Clear, hierarchical headings
- ✅ DO / ❌ AVOID code examples
- Complete, copy-pasteable code
- Links to external resources
- Consistent with SKILL.md language

**Quality Standards:**
- Real-world examples from production systems
- Security-first approach
- Performance-conscious patterns
- Accessibility considerations
- GDPR compliance where relevant

---

## Resources

### Official Documentation
- [Shopify Storefront API](https://shopify.dev/docs/api/storefront)
- [Shopify Customer Account API](https://shopify.dev/docs/api/customer)
- [Hydrogen Documentation](https://shopify.dev/docs/custom-storefronts/hydrogen)
- [React Router v7](https://reactrouter.com/)

### Industry Standards
- [OWASP Security](https://owasp.org/)
- [Web.dev Performance](https://web.dev/performance/)
- [WCAG Accessibility](https://www.w3.org/WAI/WCAG21/quickref/)
- [GraphQL Best Practices](https://graphql.org/learn/best-practices/)

### Compliance
- [GDPR Guidelines](https://gdpr.eu/)
- [NIST Password Guidelines](https://pages.nist.gov/800-63-3/)

---

## Version History

- **v1.0** (Jan 30, 2026): Initial release
  - 4 complete REFERENCE.md files
  - 11 complete SKILL.md files
  - MCP tool integration guide
  - Feature implementation guides

- **v2.0** (Jan 30, 2026): Complete reference documentation
  - ✅ All 11 skills now have REFERENCE.md files
  - ✅ Comprehensive coverage of industry best practices
  - ✅ Security, performance, and accessibility guidance
  - ✅ Testing patterns and troubleshooting sections
  - ✅ MCP integration where applicable

- **v3.0** (Jan 30, 2026): Design System Integration
  - ✅ Added `design-system` skill (SKILL.md + REFERENCE.md)
  - ✅ Added `.cursor/rules/design-system.mdc` enforcement rule
  - ✅ Design system now mandatory for all UI work
  - ✅ Connected PRD Section 3 to implementation patterns
  - ✅ Updated all feature guides to include design-system first

- **v4.0** (Jan 31, 2026): World-Class Landing Page Patterns
  - ✅ Updated design-system SKILL.md with stunning landing page patterns
  - ✅ Updated DESIGN-SYSTEM.md with hero, trust bar, showcase sections
  - ✅ Added eyebrow text, image glow, wave divider patterns
  - ✅ Added testimonial cards, brand story, final CTA patterns
  - ✅ Created comprehensive `.cursorrules` project rule
  - ✅ All skills/rules properly referenced in project rule

**Status:** ✅ Production Ready - 100% Documentation Coverage

**Reference Documentation Includes:**
- **Foundation Skills (1):** design-system (typography, colors, spacing, layout, landing page patterns)
- **Core Skills (4):** shopify-storefront-api, shopify-customer-account-api, form-validation, react-router-patterns
- **Commerce Skills (3):** cart-management, product-personalization, graphql-queries
- **Enhancement Skills (4):** seo-structured-data, ui-components, email-integration, reviews-integration

**Total Documentation:**
- 12 SKILL.md files (implementation patterns)
- 12 REFERENCE.md files (best practices & security)
- 1 INDEX.md (quick reference guide)
- 2 rules (.mdc files for enforcement)
- 1 .cursorrules (comprehensive project rule)
- **Total: 28 comprehensive documentation files**
