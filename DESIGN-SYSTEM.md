# Recovery Token Store - Design System

## Overview

The Recovery Token Store design system creates world-class, impactful experiences. The design draws inspiration from premium travel gear aesthetics—clean, bold, and confident with strong visual hierarchy. Every design decision prioritizes **clarity, impact, and emotional resonance**.

**Core Philosophy:** Information Architecture First → Visual Hierarchy as Navigation → Intentional White Space → Emotional Impact

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

### Color System

| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#1A202C` | Headings, primary text, dark backgrounds |
| `secondary` | `#4A5568` | Body text, secondary elements |
| `accent` | `#B8764F` | CTAs, links, eyebrow text, highlights |
| `surface` | `#F7FAFC` | Light backgrounds, cards |
| `surface-dark` | `#2D3748` | Dark sections, footer |
| `success` | `#38A169` | Confirmation, in-stock |
| `warning` | `#DD6B20` | Important notices |
| `error` | `#E53E3E` | Error messages |
| `white` | `#FFFFFF` | Backgrounds, text on dark |

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

## World-Class Landing Page Patterns

### 1. Hero Section Pattern

The hero creates immediate visual impact with immersive design.

```tsx
<section className="relative bg-primary overflow-hidden">
  {/* Gradient overlay */}
  <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-surface-dark opacity-95" />
  
  <div className="container-wide relative z-10">
    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[60vh] py-12 lg:py-8">
      {/* Content Column */}
      <div className="text-center lg:text-left w-full">
        {/* Eyebrow */}
        <span className="inline-block text-accent text-caption uppercase tracking-[0.25em] font-semibold mb-6">
          Category Label
        </span>
        
        {/* Main Heading - White with accent highlight */}
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-[4.5rem] font-bold text-white leading-[1.05] tracking-tight mb-6">
          Main Headline
          <span className="block text-accent">Highlighted Word</span>
        </h1>
        
        {/* Subheading */}
        <p className="text-lg lg:text-xl text-white/80 leading-relaxed mb-10 lg:max-w-[32rem]">
          Supporting description text that reinforces the value proposition.
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
          <Button variant="primary" className="!bg-accent">Primary CTA</Button>
          <Button variant="secondary" className="!border-white/30 !text-white">Secondary CTA</Button>
        </div>
      </div>
      
      {/* Image Column with Glow */}
      <div className="relative flex items-center justify-center w-full">
        <div className="relative w-full max-w-[24rem] lg:max-w-[32rem]">
          <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-full scale-75" />
          <img src={image} alt="" className="relative w-full h-auto object-contain drop-shadow-2xl" />
        </div>
      </div>
    </div>
  </div>
  
  {/* Decorative wave divider */}
  <div className="absolute bottom-0 left-0 right-0">
    <svg viewBox="0 0 1440 120" fill="none" className="w-full h-auto">
      <path d="M0 120L60 110C120 100..." fill="#F7FAFC" />
    </svg>
  </div>
</section>
```

**Key Elements:**
- Dark background with gradient overlay
- Eyebrow text: uppercase, `text-caption`, `tracking-[0.25em]`, `text-accent`
- Headline: Multi-size responsive, accent color highlight
- Image with glow effect: `blur-3xl`, `bg-accent/20`
- Wave divider for smooth section transition

### 2. Trust Bar Pattern

Builds immediate credibility with key benefits.

```tsx
<section className="bg-surface py-10 md:py-12 border-b border-black/5">
  <div className="container-standard">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
      {features.map((feature) => (
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center text-accent">
            {feature.icon}
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-primary">
              {feature.title}
            </h3>
            <p className="text-sm text-secondary">
              {feature.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>
```

**Key Elements:**
- Light surface background
- Icon in accent-tinted circle
- Bold title + subtle description

### 3. Product Showcase Pattern

Features a product with flanking feature cards.

```tsx
<section className="py-20 md:py-28 bg-surface">
  <div className="container-standard">
    {/* Section Header */}
    <div className="text-center mb-16">
      <span className="inline-block text-accent text-caption uppercase tracking-[0.25em] font-semibold mb-4">
        Eyebrow
      </span>
      <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-primary leading-tight mb-6">
        Section Title
      </h2>
      <p className="text-body-lg text-secondary max-w-[42rem] mx-auto">
        Description text centered under the heading.
      </p>
    </div>
    
    {/* Three-column layout */}
    <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
      {/* Left Features */}
      <div className="lg:col-span-3 space-y-6">
        <FeatureCard align="right" />
        <FeatureCard align="right" />
      </div>
      
      {/* Center Product */}
      <div className="lg:col-span-6">
        <div className="relative mx-auto">
          <div className="absolute inset-4 bg-white rounded-full shadow-inner" />
          <img src={product} className="relative w-full h-auto" />
        </div>
      </div>
      
      {/* Right Features */}
      <div className="lg:col-span-3 space-y-6">
        <FeatureCard align="left" />
        <FeatureCard align="left" />
      </div>
    </div>
  </div>
</section>
```

### 4. Feature Card Pattern

```tsx
<div className={`bg-white rounded-xl p-6 shadow-sm border border-black/5 ${
  align === 'right' ? 'lg:text-right' : 'lg:text-left'
}`}>
  <div className={`flex items-center gap-3 mb-3 ${
    align === 'right' ? 'lg:flex-row-reverse' : ''
  }`}>
    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
      {icon}
    </div>
    <h3 className="font-display text-base font-bold text-primary">{title}</h3>
  </div>
  <p className="text-body-sm text-secondary leading-relaxed">{description}</p>
</div>
```

### 5. Brand Story Section Pattern

Two-column layout with stats overlay.

```tsx
<section className="py-20 md:py-28 bg-primary text-white relative overflow-hidden">
  {/* Background pattern */}
  <div className="absolute inset-0 opacity-5">
    <div className="absolute inset-0" style={{
      backgroundImage: `url("data:image/svg+xml,...")`,
    }} />
  </div>
  
  <div className="container-standard relative z-10">
    <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
      {/* Image with stat overlay */}
      <div className="relative">
        <div className="relative rounded-2xl overflow-hidden shadow-2xl">
          <img src={image} className="w-full h-auto object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/50 to-transparent" />
        </div>
        
        {/* Floating stat card */}
        <div className="absolute -bottom-6 -right-6 md:right-8 bg-white rounded-xl p-6 shadow-xl max-w-[200px]">
          <div className="text-4xl font-display font-bold text-accent mb-1">10K+</div>
          <p className="text-sm text-secondary">Stat description</p>
        </div>
      </div>
      
      {/* Content */}
      <div>
        <span className="inline-block text-accent text-caption uppercase tracking-[0.25em] font-semibold mb-4">
          Eyebrow
        </span>
        <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6">
          Section Headline
        </h2>
        <p className="text-lg text-white/80 leading-relaxed mb-8">
          Body content...
        </p>
        
        {/* Stats row */}
        <div className="flex flex-wrap gap-8">
          <div>
            <div className="text-3xl font-display font-bold text-accent">100%</div>
            <p className="text-sm text-white/60">Stat label</p>
          </div>
          {/* More stats */}
        </div>
      </div>
    </div>
  </div>
</section>
```

### 6. Testimonials Section Pattern

```tsx
<section className="py-20 md:py-28 bg-surface">
  <div className="container-standard">
    {/* Header */}
    <div className="text-center mb-16">
      <span className="inline-block text-accent text-caption uppercase tracking-[0.25em] font-semibold mb-4">
        Testimonials
      </span>
      <h2 className="font-display text-3xl md:text-4xl font-bold text-primary">
        Stories That Inspire
      </h2>
    </div>
    
    {/* Cards Grid */}
    <div className="grid md:grid-cols-3 gap-8">
      {testimonials.map((t) => (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-black/5 relative">
          {/* Quote icon */}
          <div className="absolute -top-4 left-8 w-8 h-8 bg-accent rounded-full flex items-center justify-center">
            <QuoteIcon />
          </div>
          
          <p className="text-body text-secondary leading-relaxed mb-6 pt-2">
            "{t.quote}"
          </p>
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-display font-bold">
              {t.avatar}
            </div>
            <div>
              <div className="font-display font-bold text-primary">{t.author}</div>
              <div className="text-caption text-accent">{t.role}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>
```

### 7. Final CTA Section Pattern

```tsx
<section className="py-20 md:py-24 bg-white">
  <div className="container-standard">
    <div className="bg-gradient-to-br from-primary to-surface-dark rounded-3xl p-10 md:p-16 text-center relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />
      
      <div className="relative z-10 max-w-[42rem] mx-auto px-4">
        <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
          Call to Action Headline
        </h2>
        <p className="text-lg text-white/80 mb-10">
          Supporting text that drives urgency.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button className="!bg-accent">Primary CTA</Button>
          <Button className="!border-white/30 !text-white">Secondary CTA</Button>
        </div>
      </div>
    </div>
  </div>
</section>
```

---

## Section Alternation Pattern

Alternate backgrounds for visual rhythm:

```tsx
<HeroSection />           {/* bg-primary */}
<TrustBar />              {/* bg-surface */}
<ProductShowcase />       {/* bg-surface */}
<FeaturedProducts />      {/* bg-white */}
<BrandStory />            {/* bg-primary */}
<TestimonialsSection />   {/* bg-surface */}
<FinalCTA />              {/* bg-white with gradient card */}
```

---

## Component Guidelines

### Button Variants

```tsx
// Primary - Accent background
<Button variant="primary" className="!bg-accent !text-white">Shop Now</Button>

// Secondary on dark - White border/text
<Button variant="secondary" className="!border-white/30 !text-white">Learn More</Button>

// Secondary on light - Default accent styling
<Button variant="secondary">View Details</Button>
```

### Eyebrow Text Pattern

Used consistently across all sections:

```tsx
<span className="inline-block text-accent text-caption uppercase tracking-[0.25em] font-semibold mb-4">
  Category Label
</span>
```

### Image Glow Effect

For hero/featured images:

```tsx
<div className="relative">
  <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-full scale-75" />
  <img src={image} className="relative drop-shadow-2xl" />
</div>
```

### Stats Display

```tsx
<div className="text-3xl font-display font-bold text-accent">100%</div>
<p className="text-sm text-white/60">Stat label</p>
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

- [ ] All colors use design tokens (no arbitrary hex values)
- [ ] Typography uses scale classes (no arbitrary font sizes)
- [ ] Spacing follows 8px grid (no arbitrary values)
- [ ] Eyebrow text uses standard pattern
- [ ] Section headers centered with proper spacing
- [ ] Images have aspect ratios set
- [ ] Focus states on all interactive elements
- [ ] Touch targets minimum 44px
- [ ] Responsive at mobile, tablet, desktop
- [ ] Animations respect reduced motion

---

**Last Updated:** January 31, 2026
