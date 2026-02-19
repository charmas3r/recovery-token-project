# Recovery Token Store - Design System

## Overview

The Recovery Token Store design system creates world-class, impactful experiences with a **premium dark minimalist aesthetic**. The design uses black backgrounds, white text, yellow accents, and gradient cards — inspired by high-end fashion and luxury e-commerce. Every design decision prioritizes **clarity, impact, and emotional resonance**.

**Core Philosophy:** Dark-first design → Visual hierarchy through light-on-dark contrast → Intentional breathing room → Emotional impact

---

## Quick Reference

| Resource | Location | Purpose |
|----------|----------|---------|
| **PRD Design Section** | `prd.md` (Section 3) | Source of truth |
| **Design Skill** | `.cursor/skills/design-system/SKILL.md` | Implementation patterns |
| **Design Rule** | `.cursor/rules/design-system.mdc` | Enforcement rules |
| **Tailwind Config** | `app/styles/tailwind.css` | Design tokens |

---

## Design Tokens

### Typography Scale (Major Third - 1.250 ratio)

| Token | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| `text-hero` | 48px | 700 | 1.1 | Homepage hero headlines |
| `text-page-title` | 36px | 700 | 1.2 | Page titles, product names |
| `text-section` | 28px | 700 | 1.3 | Section headings |
| `text-subsection` | 20px | 600 | 1.4 | Feature titles, card headings |
| `text-body-lg` | 18px | 400 | 1.6 | Descriptions, intro paragraphs |
| `text-body` | 16px | 400 | 1.6 | General body text |
| `text-body-sm` | 14px | 400 | 1.5 | Metadata, helper text |
| `text-caption` | 12px | 500 | 1.4 | Badges, eyebrow text |

**Font Families:**
- `font-display` - Manrope (headings, display text)
- `font-sans` - Inter (body text)

### Color System (Dark Theme)

| Token | Hex / Value | Usage |
|-------|-------------|-------|
| `primary` | `#000000` | **WARNING: Black — invisible on dark bg. Use `text-white` for headings.** |
| `secondary` | `#888888` | Body text fallback — prefer `text-white/50` |
| `accent` | `#FFFF93` | Yellow — CTAs, links, eyebrow text, highlights |
| `accent` (bronze) | `#B8764F` | Bronze — product details, some eyebrows |
| `surface` | `#0A0A0A` | Dark surface for cards/sections |
| `surface-dark` | `#2D3748` | Darker sections |
| `success` | `#38A169` | Confirmation, in-stock |
| `warning` | `#DD6B20` | Important notices |
| `error` | `#E53E3E` | Error messages |
| `white` | `#FFFFFF` | Primary text color on dark backgrounds |

**Critical:** `text-primary` resolves to black text — invisible on black backgrounds. Always use `text-white` for headings and visible text.

### Dark Theme Patterns

| Element | Pattern |
|---------|---------|
| Page background | `bg-black` or body default (black) |
| Card background | `style={{background: 'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)'}}` |
| Card border | `border border-white/[0.08]` |
| Card hover | `hover:border-white/[0.15]` (no shadows) |
| Heading text | `text-white` |
| Body text | `text-white/50` |
| Accent (yellow) | `#FFFF93` for CTAs/badges |
| Accent (bronze) | `#B8764F` for product details |
| Dividers | `border-white/[0.08]` |
| Input bg | `bg-white/[0.05]`, focus: `bg-white/[0.08]` |
| Shadows | None — use borders instead |
| Sticky navs | `bg-black/95 backdrop-blur-sm` |

### Spacing System (8px Grid)

| Token | Value | Usage |
|-------|-------|-------|
| `xs` | 4px | Icon padding, tight spacing |
| `sm` | 8px | Small gaps, button padding |
| `md` | 16px | Standard padding, element spacing |
| `lg` | 24px | Component spacing, card padding |
| `xl` | 32px | Between components |
| `2xl` | 48px | Between sections |
| `3xl` | 64px | Large section padding |
| `4xl` | 96px | Hero section padding |

### Container Widths

| Class | Width | Usage |
|-------|-------|-------|
| `.container-prose` | 640px | Long-form content, policies |
| `.container-standard` | 1280px | General pages, collections |
| `.container-wide` | 1440px | Homepage, visual-heavy pages |

---

## Dark Theme Card Patterns

### Standard Card

```tsx
<div
  className="rounded-2xl border border-white/[0.08] hover:border-white/[0.15] transition-colors"
  style={{background: 'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)'}}
>
  <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
  <div className="p-6">
    <h3 className="font-display text-lg font-bold text-white">{title}</h3>
    <p className="text-body text-white/50">{description}</p>
  </div>
</div>
```

### Feature Card

```tsx
<div
  className="rounded-xl p-6 border border-white/[0.08] hover:border-white/[0.15] transition-colors"
  style={{background: 'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)'}}
>
  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent mb-3">
    {icon}
  </div>
  <h3 className="font-display text-base font-bold text-white">{title}</h3>
  <p className="text-body-sm text-white/50 leading-relaxed">{description}</p>
</div>
```

### Testimonial Card

```tsx
<div
  className="rounded-2xl p-8 border border-white/[0.08] relative"
  style={{background: 'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)'}}
>
  <div className="absolute -top-4 left-8 w-8 h-8 bg-accent rounded-full flex items-center justify-center">
    <QuoteIcon className="w-4 h-4 text-black" />
  </div>
  <p className="text-body text-white/50 leading-relaxed mb-6 pt-2">"{quote}"</p>
  <div className="flex items-center gap-4">
    <div className="w-12 h-12 rounded-full bg-white/[0.08] flex items-center justify-center text-white font-display font-bold">
      {avatar}
    </div>
    <div>
      <div className="font-display font-bold text-white">{author}</div>
      <div className="text-caption text-accent">{role}</div>
    </div>
  </div>
</div>
```

---

## Section Patterns

### Hero Section

```tsx
<section className="relative bg-black overflow-hidden">
  <div className="container-wide relative z-10">
    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[60vh] py-12 lg:py-8">
      <div className="text-center lg:text-left w-full">
        <span className="inline-block text-accent text-caption uppercase tracking-[0.25em] font-semibold mb-6">
          Category Label
        </span>
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-[4.5rem] font-bold text-white leading-[1.05] tracking-tight mb-6">
          Main Headline
        </h1>
        <p className="text-lg lg:text-xl text-white/50 leading-relaxed mb-10 lg:max-w-[32rem]">
          Supporting description text.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
          <Button variant="primary" className="!bg-accent !text-black">Primary CTA</Button>
          <Button variant="secondary" className="!border-white/30 !text-white">Secondary CTA</Button>
        </div>
      </div>
      <div className="relative flex items-center justify-center w-full">
        <div className="relative w-full max-w-[24rem] lg:max-w-[32rem]">
          <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-full scale-75" />
          <img src={image} alt="" className="relative w-full h-auto object-contain" />
        </div>
      </div>
    </div>
  </div>
</section>
```

### Section Header

```tsx
<div className="text-center mb-16">
  <span className="inline-block text-accent text-caption uppercase tracking-[0.25em] font-semibold mb-4">
    Eyebrow Text
  </span>
  <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
    Section Title
  </h2>
  <p className="text-body-lg text-white/50 max-w-[42rem] mx-auto">
    Description text centered under the heading.
  </p>
</div>
```

### Section Background Alternation

All sections use dark backgrounds:

| Section Type | Background |
|--------------|------------|
| Hero | `bg-black` |
| Content sections | `bg-black` (body default) |
| Cards | Dark gradient with `border-white/[0.08]` |
| Elevated areas | `bg-white/[0.03]` or `bg-white/[0.05]` |

---

## Form Inputs (Dark Theme)

```tsx
// Text input
<input className="w-full h-12 px-4 rounded-lg bg-white/[0.05] text-white placeholder:text-white/25 focus:bg-white/[0.08] focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all" />

// Label
<label className="block text-body-sm font-medium text-white mb-2">Label</label>

// Helper text
<p className="text-body-sm text-white/40">Helper text</p>

// Error state
<input className="ring-2 ring-error/30 bg-error/10" />
<p className="text-body-sm text-error">Error message</p>
```

---

## Accessibility Requirements

- **Focus States:** 2px accent ring on all interactive elements
- **Touch Targets:** Minimum 44x44px
- **Color Contrast:** WCAG AA minimum (4.5:1 body, 3:1 UI)
- **Reduced Motion:** Animations respect `prefers-reduced-motion`
- **ARIA Labels:** All icon buttons have accessible labels
- **Semantic HTML:** Use proper elements (header, nav, main, section, etc.)

---

## Pre-Commit Checklist

- [ ] All text uses `text-white` (not `text-primary`) for headings on dark backgrounds
- [ ] Cards use dark gradient background + `border-white/[0.08]` (no `bg-white`, no shadows)
- [ ] Typography uses scale classes (no arbitrary font sizes)
- [ ] Spacing follows 8px grid (no arbitrary values)
- [ ] Eyebrow text uses standard pattern
- [ ] Inputs use `bg-white/[0.05]` (not `bg-surface` or `bg-white`)
- [ ] No `shadow-sm`, `shadow-lg`, or `shadow-md` — use borders only
- [ ] Focus states on all interactive elements
- [ ] Touch targets minimum 44px
- [ ] Responsive at mobile, tablet, desktop
- [ ] Animations respect reduced motion

---

**Last Updated:** February 18, 2026
