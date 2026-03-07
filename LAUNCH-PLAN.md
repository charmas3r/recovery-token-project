# Coinplugz Store Launch Plan

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
| 1 | ~~**Create client transfer store**~~ | ✅ DONE | Client transfer store created in Shopify Partner Dashboard with products, collections, and settings. |
| 2 | ~~**Update `.env` credentials for new store**~~ | ✅ DONE | `.env` and Oxygen env vars updated with new store credentials. |
| 3 | ~~**Migrate from Vercel to Oxygen**~~ | ✅ DONE | Removed `vercel.json`, `api/index.js`, Cache API polyfill. Deployed to Oxygen. (commit `ffdd458`) |
| 4 | ~~**Newsletter signup broken**~~ | ✅ DONE | `KLAVIYO_NEWSLETTER_LIST_ID` env var set. Graceful fallback added if Klaviyo is not fully configured. |
| 5 | ~~**51 hardcoded old-domain URLs**~~ | ✅ DONE | All `recoverytokenstore.com` URLs replaced with `coinplugz.com` across 13 route files. |
| 6 | ~~**Wrong domain in product schema**~~ | ✅ DONE | `recoverytoken.store` replaced with `coinplugz.com` in product route JSON-LD. |
| 7 | ~~**Hardcoded myshopify domain**~~ | ✅ DONE | Dead code constant removed; `env.PUBLIC_JUDGEME_SHOP_DOMAIN` was already used correctly. |
| 8 | ~~**Cart page title says "Hydrogen"**~~ | ✅ DONE | Updated to `"Cart | Coinplugz"`. |
| 9 | ~~**Old brand email exposed**~~ | ✅ DONE | Updated to `support@coinplugz.com` in FAQ data and contact page. |
| 10 | ~~**404 page is unstyled**~~ | ✅ DONE | Branded dark-themed error page with eyebrow text, large status code, descriptive message, and "Back to Home" CTA. |
| 11 | ~~**Missing `PUBLIC_STOREFRONT_ID`**~~ | ✅ DONE | Set during Oxygen migration. |

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
| **Product Q&A on PDP** | ✅ Done | Question/answer feature on product detail pages (commits `800876e`–`b7c4ee3`) |
| **QR Code Review Page** | ✅ Done | Static QR per product → `/review?product=<handle>` → review form → unique 25% discount code. Duplicate prevention via Judge.me email check. |

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
- [x] Create client transfer store + migrate products from dev store
- [x] Update `.env` credentials for new store
- [x] Migrate from Vercel to Oxygen (see section 3)
- [x] Set up Oxygen environment variables in Shopify Admin
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

1. ~~**Day 1**: EVAN creates client transfer store in Partner Dashboard, exports/imports products & collections from dev store~~ ✅
2. ~~**Day 1**: EVAN migrates from Vercel to Oxygen, updates `.env` credentials for new store~~ ✅
3. ~~**Day 1-3**: EVAN completes Product Q&A feature~~ ✅
4. **Next**: EVAN fixes release blocker bugs (#4–#11) + completes QR Code Review Page feature
5. **Next**: JESSE sets up accounts (Judge.me Awesome, Klaviyo list, domain email)
6. **Next**: EVAN adds GA4, cookie consent, builds proper 404 page, drafts legal policies
7. **Next**: EVAN transfers store ownership to JESSE → JESSE accepts + picks Shopify plan
8. **Next**: JESSE reviews/approves legal policies, configures shipping rates + payment processing
9. **Next**: Full end-to-end testing on Oxygen URL (all features, smoke test checklist)
10. **Last**: JESSE purchases custom domain → DNS setup → point to Oxygen → Google Search Console → announce
