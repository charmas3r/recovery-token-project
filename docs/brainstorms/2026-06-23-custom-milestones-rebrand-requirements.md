# Custom Milestones Rebrand & Vertical Wedge — Requirements

**Date:** 2026-06-23
**Status:** Requirements (ready for `/ce-plan`)
**Type:** Deep — product (repositioning + redesign + go-to-market foundation)

---

## Problem & context

The storefront (currently **Coinplugz**, coinplugz.com — itself a prior rename from "Recovery Token Store") is generating **zero sales**. The binding constraint, established in this brainstorm, is **lack of traffic** — not poor conversion of existing traffic.

What the code review surfaced:
- **SEO machinery is already strong:** 78 content-rich landing entries in `app/data/seo-pages.ts`, each with FAQ + breadcrumb + webPage schema, internal linking via `relatedPageSlugs`, a working sitemap (`sitemap.*` routes), clean `[robots.txt].tsx`, and single-segment routing (`/sobriety-coins` → `app/routes/($locale)._index.tsx` via `getSEOPage`).
- **The site was likely never fully indexed:** Google Search Console was never verified and the sitemap never submitted (`LAUNCH-PLAN.md`).
- **The current name is actively harmful:** "Coinplugz" — "plugz" reads as drug-dealer slang — is semantically toxic for a *sobriety/recovery* brand, both to humans and to Google's topical understanding.
- **No measurement exists:** `app/root.tsx` contains no GA4, GTM, or Meta Pixel — paid acquisition currently cannot be run or optimized.

The owner has purchased the **Custom Milestones** domain and wants to reposition around a vertical wedge: **custom engraving for milestone moments, typically purchased as a gift for someone else.** Acquisition will be multi-channel: **organic SEO + Meta ads + influencers/social.**

## Product thesis

Custom Milestones is an **umbrella brand for custom-engraved milestone coins given as gifts**, anchored by its only validated demand (recovery/sobriety) and expanding into adjacent commemorative niches that reuse the same engravable product. The rebrand earns its cost not as cosmetics but as **topical + trust realignment** ("milestone / custom / engraving" matches target keywords; "Custom Milestones" is brand-safe where "Coinplugz" is not). Growth comes from widening organic SEO surface area while paid/social drive immediate, gift-framed, conversion-optimized traffic.

## Outcomes (what success looks like)

- The site presents as **Custom Milestones** on a clean domain, with no residual "Coinplugz" branding or the green electric-"C" mark.
- The domain is **migrated correctly** (301s + GSC change-of-address) with all canonicals/JSON-LD/OG/sitemap on the new origin.
- **GA4 + Meta Pixel (+ Conversions API)** are live, so all three channels can be measured and ads optimized.
- The homepage converts **cold gift-buyer traffic** with a recovery-first, gift-framed hero and clear path into the engraving funnel.
- Existing recovery SEO pages render under the new brand and are submitted for indexing.

## Decisions locked

| Decision | Choice |
|---|---|
| Brand scope | **Milestone umbrella** (recovery + commemorative + gift milestones) |
| Product reality | **Same engravable blank coins** serve every niche; no new SKUs required to launch niches |
| Homepage lead | **Recovery-first, gift-framed**, under the umbrella brand |
| Domain timing | **Migrate now** (near-zero authority to lose) |
| Wave 1 focus | **Foundation + recovery-first redesign** before niche breadth |
| Target niches (Wave 2) | Commemorative (general), Military/challenge coins, Memorial/in-memory, Retirement & career |
| Acquisition | Organic SEO (compounding) + Meta ads + influencers/social (immediate) |

## Scope boundaries

### In scope — Wave 1
1. **Brand swap** — `app/lib/meta.ts` (`SITE_NAME`=`Custom Milestones`, `SITE_URL`=`https://custommilestones.com`, ideally a shared `BRAND` constant), new logo replacing `app/components/layout/CoinPlugzLogo.tsx` + `Header.tsx` (direction: **clean, balanced, customization as the theme** — retire the green electric-"C"), 98 inline "Coinplugz" mentions in `seo-pages.ts`, `faq.ts`, contact/404/cart copy, og:site_name, support email.
2. **Domain migration** — `custommilestones.com` canonical on Oxygen, coinplugz.com serving 301s; replace 68 `coinplugz.com` URLs across 25 files (incl. `app/lib/jsonld.ts`); verify robots/sitemap emit new origin; GSC verify + sitemap submit + Change of Address.
6. **Ad-landing template** — a lightweight, conversion-shaped landing template (distinct from the content-deep SEO templates) for cold paid/social traffic: fast load, one gift-framed value prop, prominent CTA into `custom-token`, trust/reviews, minimal nav. Reuse where sensible (e.g. `SEOTrustBar`, `ReviewsCallout`) but keep it lean. Used as the destination for initial Meta/influencer campaigns.
3. **Tracking** — GA4 + Meta Pixel in `app/root.tsx` (respect existing consent banner), Meta Conversions API for server-side purchase events.
4. **Homepage redesign** — `app/routes/($locale)._index.tsx`: recovery-first, gift-buyer-as-protagonist hero, umbrella nav, reviews trust (`ReviewsCallout`), single clear offer into `custom-token` funnel; preserve the `getSEOPage` slug-routing branch; conversion-shaped for cold paid traffic; follow `CLAUDE.md` design-system rules.
5. **Indexing hygiene** — canonicals/JSON-LD/OG on new domain; submit sitemap; spot-check sample slugs.

### Deferred for later (Wave 2/3)
- Niche landing pages (`commemorative-coin-engraving`, `military-challenge-coins`, `memorial-coins`, `retirement-coins` + a niche hub) as new `seo-pages.ts` entries reusing `CommercialLandingTemplate`/`CustomIntentLandingTemplate`; each with unique deep content + gift-framed conversion variant.
- Channel activation: Meta campaigns, influencer/social kit, retargeting.
- New SKUs/finishes specific to non-recovery niches (only if data later justifies).

### Outside this product's identity
- Becoming a generic all-occasion print/merch shop — the wedge is **milestone gifting via engraved coins**, not arbitrary customization.
- Recovery-explicit messaging in **paid creative/landing pages** — kept to organic SEO surfaces to stay within Meta ad policy.

## Success criteria

- `grep -ri coinplugz app/` returns nothing; no green-"C" logo anywhere.
- `npm run typecheck` + `npm run lint` clean.
- Homepage renders new brand, gift-framed hero, reviews, CTA into `custom-token`.
- A sample SEO slug (e.g. `/sobriety-coins`) still renders via `getSEOPage` with new brand + new-domain canonical/JSON-LD.
- GA4 + Meta Pixel fire (verified via Pixel Helper / network); canonical/og:url/JSON-LD all use new domain; `/sitemap.xml` + `/robots.txt` emit new origin.
- Post-deploy: a coinplugz.com URL 301s to the new domain; GSC shows new property verified + sitemap submitted.

## Dependencies & assumptions

- **Confirmed:** new domain is `custommilestones.com`.
- **Assumption:** the existing engravable coin SKUs are suitable for all four niches (owner-confirmed "same blank coins"). Niche conversion ahead of any niche-specific product is acceptable.
- **Dependency (ops, outside code):** owner completes Shopify domain assignment, GSC verification, Meta Business/ad-account + Pixel ID, and store-transfer items still open in `LAUNCH-PLAN.md`.
- **Risk — domain migration:** must use 301s + GSC Change of Address or rankings/equity (small as they are) are lost; doing it now is the lowest-cost moment.
- **Risk — Meta ad policy:** addiction/recovery ads are restricted; gift-framing on paid surfaces is mandatory, not optional.
- **Risk — SEO timeline:** organic compounds slowly; paid + influencer carry early traffic, which raises the importance of the tracking + conversion work in Wave 1.

## Approaches considered

- **Foundation + recovery-first redesign first (chosen)** — fix indexing/tracking/domain + rebrand the proven funnel before adding breadth. Lowest risk, fastest measurable signal.
- **Breadth-first (rejected)** — build all niche landings immediately. Premature scaling: pages rank slowly and the core funnel is still unproven.
- **Everything at once (rejected)** — highest scope/risk, slowest to first signal.
- **Rebrand site but stay on coinplugz.com (rejected)** — builds future authority on a name to be abandoned; migration only gets costlier later.

## Resolved (previously open)

- **Domain:** `custommilestones.com`.
- **Logo:** clean, balanced, leaning into **customization** as the theme (retire the green electric-"C").
- **Ad-landing template:** yes — build a dedicated lightweight conversion landing template in Wave 1 (see In scope #6) for paid/social traffic, separate from the content-deep SEO pages.

---

*Handoff: feed to `/ce-plan` for Wave 1 implementation planning. Wave 2 (niche landings) and Wave 3 (channel activation) are separate planning passes.*
