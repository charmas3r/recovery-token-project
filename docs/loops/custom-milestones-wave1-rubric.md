# Custom Milestones Wave 1 — Evaluative Rubric & Generator/Evaluator Loop

**Date:** 2026-06-23
**Drives:** `docs/brainstorms/2026-06-23-custom-milestones-rebrand-requirements.md`
**Pattern:** Generator agent → Evaluator agent → loop until acceptance gates pass or max iterations reached.

---

## How the loop works

```
                ┌─────────────────────────────────────────┐
                │  Orchestrator (main session)             │
                │  - holds requirements doc + rubric       │
                │  - runs the loop, owns stop conditions   │
                └───────────────┬─────────────────────────┘
                                │  iteration N
                 ┌──────────────▼──────────────┐
                 │ GENERATOR agent              │
                 │ implements/improves code     │
                 │ against requirements +       │
                 │ evaluator feedback from N-1  │
                 └──────────────┬──────────────┘
                                │ produces diff + self-report
                 ┌──────────────▼──────────────┐
                 │ EVALUATOR agent (fresh ctx)  │
                 │ 1. runs HARD GATES (binary)  │
                 │ 2. scores QUALITY dims (0-5) │
                 │ 3. emits scorecard + fixes   │
                 └──────────────┬──────────────┘
                                │ scorecard
                 ┌──────────────▼──────────────┐
                 │ Stop? accept / iterate / halt│
                 └──────────────────────────────┘
```

- **Generator** never grades its own work. **Evaluator** runs with **fresh context** each iteration (sees the diff + rubric + prior scorecard, not the generator's reasoning) to avoid anchoring.
- Each iteration appends a scorecard to `docs/loops/<component>-scorecard.md` so progress (and plateaus) are visible.
- The evaluator's feedback must be **specific and actionable** (file:line + what to change), not vibes — that feedback is the only thing carried into the next generator run.

## Model tiers

| Role | Model | Why |
|---|---|---|
| Generator | Sonnet (escalate homepage/ad-landing to Opus) | Volume implementation; design-heavy targets get the stronger model |
| Evaluator | Opus | Judgment + critical review; a strong, skeptical grader prevents score inflation |
| Orchestrator | (this session) | Owns loop control, stop conditions, human checkpoints |

## Stop conditions (any one halts the loop)

1. **Accept** — all hard gates pass AND weighted quality ≥ **4.0 / 5.0** AND no single quality dimension < **3**.
2. **Max iterations** — **9** per component. Hand back to human with the latest scorecard.
3. **Plateau** — weighted score fails to improve by ≥0.25 across **2 consecutive** iterations → halt and escalate (the loop is stuck; needs human input).
4. **Hard-gate regression** — if a previously-passing hard gate breaks, that iteration is rejected and fed back immediately.

---

## HARD GATES (binary — all must pass; not scored, just verified)

| # | Gate | How the evaluator verifies |
|---|---|---|
| G1 | Build clean | `npm run typecheck` and `npm run lint` exit 0 |
| G2 | No legacy brand | `grep -ri coinplugz app/` returns nothing; no `CoinPlugzLogo` import; no `#00ff78` green-C mark |
| G3 | Domain correct | no `coinplugz.com` strings in `app/`; canonical, `og:url`, JSON-LD (`app/lib/jsonld.ts`), and sitemap/robots origin all = `custommilestones.com` |
| G4 | SEO routing intact | `/sobriety-coins`, a milestone slug, and a `/resources/glossary/*` term still render via `getSEOPage` with FAQ/breadcrumb/webPage schema and correct canonical |
| G5 | Tracking live | GA4 + Meta Pixel present in `app/root.tsx`, consent-gated (respect `withPrivacyBanner`), and fire on page load (verified live via Pixel Helper / network) |
| G6 | No runtime errors | homepage, ad-landing, and a sample PDP load with zero console errors at mobile + desktop widths |

## QUALITY DIMENSIONS (scored 0–5, weighted; drive iteration)

Scale anchors: **0** absent · **1** major gaps · **3** acceptable/shippable · **5** excellent.

| # | Dimension | Weight | What "5" looks like |
|---|---|---|---|
| Q1 | Homepage positioning | 3 | Recovery-first + unmistakably gift-framed (buyer-for-someone-else is the protagonist); umbrella brand clear; future niches discoverable but not co-equal |
| Q2 | Design-system compliance | 3 | Dark-theme tokens only; `text-white` headings (never `text-primary`); inline styles for centered text in `FadeUp`/`Suspense`/motion; eyebrows on sections; ≥44px touch targets; WCAG AA; per `CLAUDE.md` |
| Q3 | Conversion craft | 3 | One clear value prop above the fold; prominent CTA into `custom-token`; reviews/trust surfaced (`ReviewsCallout`); friction-free path to engraving |
| Q4 | Ad-landing leanness + Meta safety | 2 | Fast, minimal nav, single gift-framed offer; **no addiction/recovery-explicit claims** (Meta ad policy); shareable OG |
| Q5 | Logo quality | 2 | Clean, balanced, leans into **customization** as the theme; works at header + favicon scale; brand-safe |
| Q6 | Responsive polish | 2 | No layout breakage mobile/tablet/desktop; imagery has aspect ratios; motion respects reduced-motion |
| Q7 | SEO/meta quality | 2 | Titles/descriptions compelling + keyword-aligned; structured data valid; internal linking (`relatedPageSlugs`) preserved |

**Weighted score** = Σ(score × weight) / Σ(weight). Acceptance needs ≥4.0 with no dimension < 3.

---

## Scope: staged loops (recommended)

Running one loop over all of Wave 1 dilutes the rubric and slows convergence. Stage into bounded targets, each with its own scorecard. Mechanical-heavy stages converge in 1–2 iterations; design stages use the full budget.

| Stage | Target | Dominant rubric items |
|---|---|---|
| A | Brand + domain swap (`meta.ts`, logo, 98 mentions, 68 URLs, jsonld) | G1–G4, Q5, Q7 |
| B | Tracking install (`root.tsx`: GA4 + Pixel + CAPI) | G1, G5, G6 |
| C | Homepage redesign (`($locale)._index.tsx`) | Q1–Q3, Q6, G4, G6 |
| D | Ad-landing template (new component/route) | Q4, Q3, Q6, G6 |

Stages A→B are gate-dominated (fast). C→D are quality-dominated (where the loop earns its keep).

## Per-iteration scorecard format (appended to `docs/loops/<stage>-scorecard.md`)

```
## Iteration N — <stage> — <timestamp>
Hard gates: G1 ✅ G2 ✅ G3 ❌ (coinplugz.com in app/lib/jsonld.ts:42) ...
Quality: Q1 4 · Q2 3 · Q3 4 · Q5 5 · Q7 4 → weighted 3.9
Verdict: ITERATE
Top fixes for next run:
1. jsonld.ts:42 — replace coinplugz.com → custommilestones.com (gate G3)
2. Hero copy still product-first; reframe around the gift recipient (Q1)
3. CTA below fold on mobile 375px; raise above fold (Q3)
```

## Human checkpoints

- Before Stage C/D start (design-heavy): confirm visual direction once, so the loop isn't iterating toward the wrong aesthetic.
- On any **halt** (max-iter or plateau): review scorecard, decide continue / adjust rubric / take over.
- Final acceptance of each stage is surfaced for human sign-off before merge.
