# Coin-plugz Store Launch Plan

**Created**: 2026-03-04
**Status**: Pre-launch

## Legend
- **EVAN** = EVANeloper tasks
- **JESSE** = Store JESSE / business tasks
- **BOTH** = Collaboration needed

---

## 1. RELEASE BLOCKERS (Must fix before launch)

### EVAN: Store Migration + Code Fixes

| # | Issue | Severity | Details |
|---|-------|----------|---------|
| 1 | **Create client transfer store** | CRITICAL | Current dev store cannot be transferred. EVAN creates a new **client transfer store** in Shopify Partner Dashboard. Recreate products, collections, and settings. Once ready, transfer ownership to JESSE — he picks a Shopify plan and EVAN earns Partner recurring revenue share. |
| 2 | **Update `.env` credentials for new store** | CRITICAL | New store = new `PUBLIC_STOREFRONT_API_TOKEN`, `PRIVATE_STOREFRONT_API_TOKEN`, `PUBLIC_STORE_DOMAIN`, `PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID`, `SHOP_ID`, `PUBLIC_STOREFRONT_ID`. All must be updated in `.env` and Oxygen env vars. |
| 3 | **Migrate from Vercel to Oxygen** | CRITICAL | The project uses Vercel with a hacky edge function wrapper + Cache API polyfill. Hydrogen is built for Oxygen. Migration: connect repo in Shopify Admin → set env vars → remove `vercel.json`, `api/index.js`, Vercel build steps. Eliminates hosting cost and CSP/checkout issues. |
| 4 | **Newsletter signup broken** | CRITICAL | `KLAVIYO_NEWSLETTER_LIST_ID` is commented out in `.env`. Any user submitting the newsletter form gets an error. Uncomment it and add to Oxygen env vars. |
| 5 | **51 hardcoded old-domain URLs** | HIGH | `recoverytokenstore.com` is hardcoded in JSON-LD structured data across ~15 route files. Google will index the wrong canonical URLs. Need to replace with the actual production domain (or make dynamic from `request.url`). |
| 6 | **Wrong domain in product schema** | HIGH | `recoverytoken.store` hardcoded in product route JSON-LD (line 499). |
| 7 | **Hardcoded myshopify domain** | MEDIUM | `recovery-token-store.myshopify.com` on product route line 1489 for Judge.me fallback — should use `env.PUBLIC_JUDGEME_SHOP_DOMAIN`. |
| 8 | **Cart page title says "Hydrogen"** | MEDIUM | `($locale).cart.tsx` line 8: `"Hydrogen | Cart"` → `"Cart | Coin-plugz"` |
| 9 | **Old brand email exposed** | MEDIUM | `support@recoverytokenstore.com` in FAQ data and contact page — needs updating to new domain email. |
| 10 | **404 page is unstyled** | MEDIUM | Catch-all route renders `null`; root `ErrorBoundary` shows plain "Oops" div with no navigation or branding. |
| 11 | **Missing `PUBLIC_STOREFRONT_ID`** | MEDIUM | Needed for Shopify analytics attribution. Add to `.env` and Oxygen env vars. |

### BOTH: Shopify Admin Setup (on new client transfer store)

| # | Task | Who | Details |
|---|------|-----|---------|
| 12 | **Recreate products & collections** | EVAN | Copy over all products, variants, images, pricing, and collections from dev store to the new client transfer store. Use Shopify CSV export/import or the Admin API. |
| 13 | **Legal policies** | BOTH | EVAN drafts Privacy Policy, Terms of Service, Refund Policy, and Shipping Policy. JESSE reviews and approves. Publish in Shopify Admin → Settings → Policies. The `/policies` routes pull directly from Shopify. |
| 14 | **Configure shipping rates** | JESSE | Set up shipping zones, rates, and delivery estimates in Shopify Admin. |
| 15 | **Set up payment processing** | JESSE | Activate Shopify Payments (or your payment provider) after transfer. Test with real/test transactions. |
| 16 | **Transfer store to JESSE** | EVAN | Partner Dashboard → Stores → Actions → Transfer ownership. JESSE accepts and picks a Shopify plan. |
| 17 | **Test checkout end-to-end** | BOTH | Place a test order through the full flow: browse → add to cart → checkout → payment → order confirmation. Verify engraving line properties carry through. |

---

## 2. ACCOUNTS & SUBSCRIPTIONS NEEDED

### JESSE: Must set up before launch

| Service | What's Needed                                                                                                                                     | Cost Estimate | Status |
|---------|---------------------------------------------------------------------------------------------------------------------------------------------------|---------------|--------|
| **Accept store transfer** | EVAN initiates transfer from Partner Dashboard. JESSE receives email → creates Shopify account (or logs in) → accepts store → picks a plan. At minimum Basic Shopify ($39/mo). Hydrogen + Oxygen requires Storefront API access. | $39-399/mo | [ ] Accept transfer + pick plan |
| **Custom Domain** | Purchase `coinplugz.com` (or preferred domain) from a registrar (Porkbun, Namecheap, Cloudflare, Google Domains) | ~$12/yr | [ ] Needed |
| **Email for domain** | `support@coinplugz.com` (or whatever domain). Needed for contact page, transactional emails, Klaviyo sender. | Varies | [ ] Needed |

### EVAN: Must set up before launch

| Service | What's Needed | Cost Estimate | Status |
|---------|--------------|---------------|--------|
| **Judge.me Awesome Plan** | Install Judge.me app on client transfer store **before** transfer. Subscribe to Awesome plan ($15/mo) for full API access, custom forms, Q&A, review coupons. After transfer, billing rolls over to JESSE's Shopify account. | $15/mo | [ ] Install + subscribe |
| **Klaviyo App** | Install Klaviyo app on client transfer store **before** transfer. Configure API key and newsletter list ID. Free up to 250 contacts. After transfer, billing rolls over to JESSE's Shopify account. | Free to start | [ ] Install + configure list |
| **Sanity CMS** | Articles/glossary powered by Sanity. Free tier (3 users, 500k API requests/mo) likely sufficient to start. | $0 | [ ] Verify project exists |
| **Google Search Console** | Verify domain ownership, submit sitemap, monitor indexing. Free. | $0 | [ ] Needed |
| **Google Analytics (GA4)** | Create GA4 property, add tracking tag to `root.tsx`. No analytics beyond Shopify built-in currently. | $0 | [ ] Not integrated yet |

---

## 3. OXYGEN MIGRATION & DOMAIN SETUP

### Migrate to Oxygen (EVAN)

| Step | Details |
|------|---------|
| Connect repo to Oxygen | On the new client transfer store: Shopify Admin → Settings → Hydrogen → Connect GitHub repo |
| Set environment variables | Add all env vars in Shopify Admin → Hydrogen → Environment variables |
| Remove Vercel artifacts | Delete `vercel.json`, `api/index.js`, Vercel-specific build scripts |
| Remove Cache API polyfill | The `api/index.js` edge wrapper with Cache polyfill is no longer needed — Oxygen has native support |
| Verify `hydrogenPreset()` | Already configured in `react-router.config.ts` — this was designed for Oxygen, should work as-is |
| Test deployment | Trigger a deploy, verify preview URL works end-to-end |

### Domain Setup (BOTH)

| Step | Who | Details |
|------|-----|---------|
| Purchase domain | JESSE | Buy `coinplugz.com` (or preferred) |
| Add domain in Shopify | JESSE | Shopify Admin → Settings → Domains → add custom domain |
| Update DNS records | JESSE/EVAN | Point domain to Shopify per their DNS instructions |
| SSL certificate | AUTO | Shopify provisions SSL automatically |
| Assign domain to Hydrogen channel | JESSE | In Shopify Admin, route the custom domain to the Hydrogen storefront |
| Fix hardcoded URLs in code | EVAN | Replace all `recoverytokenstore.com` references with new domain |

---

## 4. IN-PROGRESS FEATURES

| Feature | Status | Notes |
|---------|--------|-------|
| **Product Q&A on PDP** | In progress | Question/answer feature on product detail pages |
| **QR Code Review Page** | Planned | QR codes ship with orders; customer scans → review page with optional discount incentive |

### QR Code Review Feature — Open Questions
- **Discount mechanism**: Auto-generated per customer, or shared code revealed after submission?
- **QR code generation**: At fulfillment time (app/script), or static inserts pointing to `/reviews/submit?order={id}`?
- **Review verification**: Should QR link tie to a specific order/product for verified-purchase badge?

---

## 5. PRE-LAUNCH CHECKLIST

### Content & Branding (JESSE)
- [ ] All product titles, descriptions, and images finalized
- [ ] Collection descriptions written
- [ ] "About" / "Our Story" content reviewed for accuracy
- [ ] FAQ answers reviewed and complete
- [ ] Shipping & returns policy content accurate
- [ ] Legal policies drafted by EVAN, reviewed/approved by JESSE, published in Shopify Admin
- [ ] Support email address created and monitored
- [ ] Social media accounts created (for OG tags, links)

### Technical (EVAN)
- [ ] Fix all 9 release blocker bugs above
- [ ] Add Google Analytics / GA4 (tag in root.tsx)
- [ ] Consider adding cookie consent banner (`withPrivacyBanner: true` — currently `false`)
- [ ] Run Lighthouse audit on key pages (homepage, PDP, collection)
- [ ] Test all forms: contact, newsletter, review submission
- [ ] Test cart + checkout flow end-to-end on production
- [ ] Test customer login/signup/account pages
- [ ] Test on mobile (iOS Safari, Android Chrome)
- [ ] Verify sitemap.xml renders correctly (`/sitemap.xml`)
- [ ] Verify robots.txt is correct (`/robots.txt`)
- [ ] Submit sitemap to Google Search Console
- [ ] Create client transfer store + migrate products from dev store
- [ ] Update `.env` credentials for new store
- [ ] Migrate from Vercel to Oxygen (see section 3)
- [ ] Set up Oxygen environment variables in Shopify Admin
- [ ] Transfer store to JESSE
- [ ] Remove development screenshot files from repo root

### SEO (EVAN + JESSE)
- [ ] All page titles and meta descriptions reviewed
- [ ] OG images set (currently using Shopify CDN default — consider custom)
- [ ] JSON-LD structured data pointing to correct domain
- [ ] Google Search Console verified and sitemap submitted
- [ ] Check for broken links across the site

### Post-Deploy Smoke Test (BOTH)
- [ ] Homepage loads, hero displays correctly
- [ ] Product pages show images, pricing, variants, reviews
- [ ] Add to cart works
- [ ] Checkout completes (test transaction)
- [ ] Customer account login/signup works
- [ ] Contact form sends to Klaviyo
- [ ] Newsletter signup works
- [ ] Search returns results
- [ ] 404 page shows branded error
- [ ] All pages accessible on mobile

---

## 6. NICE-TO-HAVE BEFORE LAUNCH

| Item | Who | Impact |
|------|-----|--------|
| Meta Pixel / Facebook Ads tracking | EVAN | Needed if running paid ads at launch |
| Email transactional templates in Klaviyo | JESSE | Order confirmation, shipping notification customization |
| Custom OG share image | JESSE/EVAN | Better social sharing appearance |
| Remove "coming soon" from account profile | EVAN | Minor polish |
| Create `.env.example` for documentation | EVAN | Developer experience |
| Performance audit & bundle optimization | EVAN | Check framer-motion tree-shaking |
| Cancel/delete Vercel project | EVAN | After confirming Oxygen is stable, tear down the old Vercel deployment |

---

## 7. SUGGESTED LAUNCH SEQUENCE

1. **Day 1**: EVAN creates client transfer store in Partner Dashboard, exports/imports products & collections from dev store
2. **Day 1**: JESSE sets up accounts (Judge.me Awesome, Klaviyo list, domain email) + purchases domain
3. **Day 1-2**: EVAN migrates from Vercel to Oxygen, updates `.env` credentials for new store, fixes release blocker bugs
4. **Day 1-3**: EVAN completes Product Q&A feature + QR Code Review Page feature
5. **Day 2-3**: EVAN adds GA4, cookie consent, builds proper 404 page, drafts legal policies
6. **Day 3**: EVAN transfers store ownership to JESSE → JESSE accepts + picks Shopify plan + configures DNS
7. **Day 3-4**: JESSE reviews/approves legal policies, configures shipping rates + payment processing
8. **Day 4-5**: Full end-to-end testing on Oxygen deployment (all features)
9. **Day 5-6**: Smoke test checklist completed by both parties
10. **Day 7**: Point production domain, submit to Google Search Console, announce
