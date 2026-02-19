# Design System Skill

## When to Use This Skill

Use this skill when:
- Building or modifying UI components
- Creating new pages or sections
- Implementing landing page patterns
- Working with colors, typography, or spacing
- Ensuring design consistency

**Always read this skill before making UI changes.**

---

## Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| CSS Framework | Tailwind CSS | 4.x |
| Fonts | Inter / Manrope | Latest |
| Icons | Lucide React | 0.563.0+ |
| Config | `app/styles/tailwind.css` | - |

---

## CRITICAL: Dark Theme

The entire site uses a dark-first theme. **Never use white backgrounds for cards or pages. Never use shadows.**

**`text-primary` resolves to `#000000` (BLACK) — invisible on dark backgrounds. Always use `text-white` for headings and visible text.**

---

## Design Tokens Reference

### Typography Classes

```tsx
// Headings (use font-display + text-white)
<h1 className="font-display text-hero text-white">Hero Headline</h1>
<h1 className="font-display text-page-title text-white">Page Title</h1>
<h2 className="font-display text-section text-white">Section Heading</h2>
<h3 className="font-display text-subsection text-white">Subsection</h3>

// Body text (use text-white/50)
<p className="text-body-lg text-white/50">Large body text</p>
<p className="text-body text-white/50">Standard body text</p>
<span className="text-body-sm text-white/40">Small text</span>
<span className="text-caption text-white/40">Caption text</span>

// Responsive typography
<h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-[4.5rem]">Responsive</h1>
```

### Color Classes

```tsx
// Text colors (dark theme)
<div className="text-white">Primary heading text</div>
<div className="text-white/50">Body text (50% opacity)</div>
<div className="text-white/40">Secondary/helper text</div>
<div className="text-accent">Accent text (yellow/bronze)</div>

// Background colors (dark theme)
<div className="bg-black">Page background (or body default)</div>
<div className="bg-white/[0.05]">Subtle elevated area</div>
<div className="bg-white/[0.03]">Very subtle bg</div>
<div className="bg-accent/10">10% accent tint</div>

// Card backgrounds (inline style)
<div style={{background: 'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)'}}>
  Dark gradient card
</div>

// Borders (dark theme)
<div className="border-white/[0.08]">Standard border</div>
<div className="hover:border-white/[0.15]">Hover border</div>

// Semantic colors
<div className="text-success">Success green</div>
<div className="text-warning">Warning orange</div>
<div className="text-error">Error red</div>
<div className="bg-success/10">Success background</div>
<div className="bg-error/10">Error background</div>
```

### Spacing Classes

```tsx
// Padding
<div className="p-xs">4px</div>
<div className="p-sm">8px</div>
<div className="p-md">16px</div>
<div className="p-lg">24px</div>
<div className="p-xl">32px</div>
<div className="p-2xl">48px</div>
<div className="p-3xl">64px</div>
<div className="p-4xl">96px</div>

// Section padding (responsive)
<section className="py-20 md:py-28">Content</section>
<section className="py-10 md:py-12">Tight section</section>

// Gaps
<div className="gap-4">16px gap</div>
<div className="gap-6">24px gap</div>
<div className="gap-8">32px gap</div>
<div className="gap-12">48px gap</div>
```

### Container Classes

```tsx
<div className="container-standard">Max 1280px, centered, responsive padding</div>
<div className="container-wide">Max 1440px, centered, responsive padding</div>
<div className="container-prose">Max 640px, centered</div>
```

### Centering Text in Max-Width Containers

**CRITICAL PATTERN:** When centering text inside a max-width container, separate concerns:

```tsx
// CORRECT - Separate container centering from text centering
<div className="max-w-[42rem] mx-auto">
  <p className="text-body-lg text-white/50 text-center">
    Your centered text content here.
  </p>
</div>
```

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

## World-Class Landing Page Patterns

### 1. Eyebrow Text Pattern

Used before every section heading:

```tsx
<span className="inline-block text-accent text-caption uppercase tracking-[0.25em] font-semibold mb-4">
  Category Label
</span>
```

### 2. Hero Section Pattern

```tsx
<section className="relative bg-black overflow-hidden">
  <div className="container-wide relative z-10">
    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[60vh] py-12 lg:py-8">
      <div className="order-2 lg:order-1 text-center lg:text-left w-full">
        <span className="inline-block text-accent text-caption uppercase tracking-[0.25em] font-semibold mb-6">
          Category Label
        </span>
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-[4.5rem] font-bold text-white leading-[1.05] tracking-tight mb-6">
          Main Headline
        </h1>
        <p className="text-lg lg:text-xl text-white/50 leading-relaxed mb-10 lg:max-w-[32rem]">
          Supporting description.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
          <Button variant="primary" className="!bg-accent !text-white">Primary CTA</Button>
          <Button variant="secondary" className="!border-white/30 !text-white hover:!bg-white/10">Secondary CTA</Button>
        </div>
      </div>
      <div className="order-1 lg:order-2 relative flex items-center justify-center w-full">
        <div className="relative w-full max-w-[24rem] sm:max-w-[28rem] lg:max-w-[32rem]">
          <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-full scale-75" />
          <img src={imageSrc} alt="" className="relative w-full h-auto object-contain" />
        </div>
      </div>
    </div>
  </div>
</section>
```

### 3. Section Header Pattern

```tsx
<div className="text-center mb-16">
  <span className="inline-block text-accent text-caption uppercase tracking-[0.25em] font-semibold mb-4">
    Eyebrow Text
  </span>
  <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
    Section Title
  </h2>
  <p className="text-body-lg text-white/50 max-w-[42rem] mx-auto">
    Supporting description text that provides context.
  </p>
</div>
```

### 4. Form Inputs (Dark Theme)

```tsx
// Standard input
<input className="w-full h-12 px-4 rounded-lg bg-white/[0.05] text-white placeholder:text-white/25 focus:bg-white/[0.08] focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all" />

// Label
<label className="block text-body-sm font-medium text-white mb-2">Label</label>

// Error state
<input className="ring-2 ring-error/30 bg-error/10" />
<p className="text-body-sm text-error">Error message</p>
```

### 5. Button Styling on Dark Backgrounds

```tsx
// Primary button (accent colored)
<Button variant="primary" className="!bg-accent !text-white !border-accent hover:!bg-accent/90">
  Shop Now
</Button>

// Secondary button (white outline)
<Button variant="secondary" className="!border-white/30 !text-white hover:!bg-white/10">
  Learn More
</Button>
```

### 6. Image Glow Effect

```tsx
<div className="relative">
  <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-full scale-75" />
  <img src={image} className="relative w-full h-auto" />
</div>
```

### 7. Product Detail Page Layout

**Two-Column Sticky Layout:**

```tsx
<div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
  <div>
    <ProductGallery images={product.images.nodes} selectedImage={selectedVariant?.image} />
  </div>
  <div className="lg:sticky lg:top-24 lg:self-start space-y-6">
    <span className="inline-block text-accent text-caption uppercase tracking-[0.25em] font-semibold">
      Product Category
    </span>
    <h1 className="font-display text-3xl md:text-4xl font-bold text-white leading-tight">
      Product Name
    </h1>
    <ProductForm productOptions={options} selectedVariant={variant} />
    <TrustBadges className="pt-4 border-t border-white/[0.08]" />
    <div className="pt-6 border-t border-white/[0.08]">
      <h2 className="font-display text-lg font-bold text-white mb-4">About This Product</h2>
      <div className="text-body text-white/50 leading-relaxed prose prose-invert prose-sm"
        dangerouslySetInnerHTML={{__html: descriptionHtml}} />
    </div>
  </div>
</div>
```

### 8. Loading Skeleton (Dark Theme)

```tsx
function ProductsGridSkeleton() {
  return (
    <div className="products-grid">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[4/5] bg-white/[0.05] rounded-lg" />
          <div className="p-4 space-y-3">
            <div className="h-5 bg-white/[0.05] rounded w-3/4" />
            <div className="h-5 bg-white/[0.05] rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

## Section Backgrounds

All sections use dark backgrounds:

| Section | Background |
|---------|------------|
| Hero | `bg-black` |
| Content sections | `bg-black` (body default) |
| Cards | Dark gradient + `border-white/[0.08]` |
| Elevated areas | `bg-white/[0.03]` or `bg-white/[0.05]` |

---

## Responsive Design

### Mobile-First Breakpoints

```tsx
// Text sizing
<h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-[4.5rem]">

// Layout
<div className="grid lg:grid-cols-2 gap-8 lg:gap-12">

// Visibility
<div className="hidden md:block">Desktop only</div>
<div className="md:hidden">Mobile only</div>

// Alignment
<div className="text-center lg:text-left">

// Order
<div className="order-2 lg:order-1">Content first on desktop</div>
```

---

## Known Issues & Workarounds

### Tailwind Classes Not Applying in Suspense/Deferred Content

**Symptoms:**
- Text breaking on every word (single word per line)
- Text appearing left-aligned when `text-center` is applied

**Solution - Use Inline Styles as Fallback:**

```tsx
// RELIABLE - Inline styles for Suspense boundaries
<div style={{padding: '3rem 1rem', textAlign: 'center', width: '100%'}}>
  <h3 style={{
    fontSize: 'clamp(1.5rem, 4vw, 1.875rem)',
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: '1rem',
    textAlign: 'center'
  }}>
    Heading Text
  </h3>
  <p style={{
    fontSize: '1.125rem',
    color: 'rgba(255,255,255,0.5)',
    maxWidth: '32rem',
    marginLeft: 'auto',
    marginRight: 'auto',
    textAlign: 'center',
    lineHeight: 1.6
  }}>
    Description text.
  </p>
</div>
```

**Design Token Values for Inline Styles:**

| Token | CSS Value |
|-------|-----------|
| Heading text | `color: '#FFFFFF'` |
| Body text | `color: 'rgba(255,255,255,0.5)'` |
| Accent text | `color: '#B8764F'` or `color: '#FFFF93'` |
| Card bg | `background: 'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)'` |
| `font-display` | `fontFamily: 'Manrope, sans-serif'` |

---

## Accessibility Checklist

- [ ] Focus states on all interactive elements
- [ ] Touch targets minimum 44x44px
- [ ] Color contrast WCAG AA (4.5:1 body, 3:1 UI)
- [ ] `prefers-reduced-motion` respected
- [ ] ARIA labels on icon buttons
- [ ] Semantic HTML elements
- [ ] Alt text on images

---

## Related Skills

- **ui-components** - Base component primitives
- **react-router-patterns** - Page layouts and routing
- **product-personalization** - Dialog patterns
- **cart-management** - Drawer/aside patterns

---

## Related Documentation

- **PRD Section 3** - Design System source of truth
- **DESIGN-SYSTEM.md** - Full pattern documentation
- **design-system.mdc** - Enforcement rules
