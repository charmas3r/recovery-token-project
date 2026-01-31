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

## Design Tokens Reference

### Typography Classes

```tsx
// Headings (use font-display)
<h1 className="font-display text-hero text-primary">Hero Headline</h1>
<h1 className="font-display text-page-title text-primary">Page Title</h1>
<h2 className="font-display text-section text-primary">Section Heading</h2>
<h3 className="font-display text-subsection text-primary">Subsection</h3>

// Body text
<p className="text-body-lg text-secondary">Large body text</p>
<p className="text-body text-secondary">Standard body text</p>
<span className="text-body-sm text-secondary">Small text</span>
<span className="text-caption text-secondary">Caption text</span>

// Responsive typography
<h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-[4.5rem]">Responsive</h1>
```

### Color Classes

```tsx
// Text colors
<div className="text-primary">Deep Navy text</div>
<div className="text-secondary">Slate text</div>
<div className="text-accent">Bronze/Copper text</div>
<div className="text-white">White text</div>
<div className="text-white/80">80% opacity white</div>

// Background colors
<div className="bg-primary">Dark navy background</div>
<div className="bg-surface">Light gray background</div>
<div className="bg-surface-dark">Dark surface</div>
<div className="bg-accent">Accent background</div>
<div className="bg-accent/10">10% accent tint</div>
<div className="bg-white">White background</div>

// Semantic colors
<div className="text-success">Success green</div>
<div className="text-warning">Warning orange</div>
<div className="text-error">Error red</div>
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
// Standard page container
<div className="container-standard">Max 1280px, centered, responsive padding</div>

// Wide container (homepage)
<div className="container-wide">Max 1440px, centered, responsive padding</div>

// Prose container (long-form content)
<div className="container-prose">Max 640px, centered</div>
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

**Key Properties:**
- `text-accent` - Bronze/copper color
- `text-caption` - 12px, medium weight
- `uppercase` - All caps
- `tracking-[0.25em]` - Wide letter spacing
- `font-semibold` - 600 weight
- `mb-4` or `mb-6` - Bottom margin before heading

### 2. Hero Section Pattern

```tsx
function HeroSection() {
  return (
    <section className="relative bg-primary overflow-hidden">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-surface-dark opacity-95" />
      
      <div className="container-wide relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[60vh] py-12 lg:py-8">
          {/* Content Column */}
          <div className="order-2 lg:order-1 text-center lg:text-left w-full">
            {/* Eyebrow */}
            <span className="inline-block text-accent text-caption uppercase tracking-[0.25em] font-semibold mb-6">
              Category Label
            </span>
            
            {/* Main Heading */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-[4.5rem] font-bold text-white leading-[1.05] tracking-tight mb-6">
              Main Headline
              <span className="block text-accent">Highlighted Word</span>
            </h1>
            
            {/* Subheading */}
            <p className="text-lg lg:text-xl text-white/80 leading-relaxed mb-10 lg:max-w-[32rem]">
              Supporting description with 80% opacity white.
            </p>
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button variant="primary" className="!bg-accent !text-white">
                Primary CTA
              </Button>
              <Button variant="secondary" className="!border-white/30 !text-white hover:!bg-white/10">
                Secondary CTA
              </Button>
            </div>
          </div>
          
          {/* Image Column */}
          <div className="order-1 lg:order-2 relative flex items-center justify-center w-full">
            <div className="relative w-full max-w-[24rem] sm:max-w-[28rem] lg:max-w-[32rem]">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-full scale-75" />
              <img
                src={imageSrc}
                alt="Description"
                className="relative w-full h-auto object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Wave divider */}
      <WaveDivider />
    </section>
  );
}
```

### 3. Trust Bar Pattern

```tsx
function TrustBar() {
  const features = [
    { icon: <ShippingIcon />, title: 'Free Shipping', description: 'On orders over $50' },
    { icon: <QualityIcon />, title: 'Premium Quality', description: 'Hand-crafted' },
    { icon: <SecureIcon />, title: 'Secure Checkout', description: '256-bit encryption' },
    { icon: <SupportIcon />, title: '5-Star Support', description: "We're here to help" },
  ];

  return (
    <section className="bg-surface py-10 md:py-12 border-b border-black/5">
      <div className="container-standard">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
          {features.map((feature) => (
            <div key={feature.title} className="flex items-center gap-4">
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
  );
}
```

### 4. Section Header Pattern

```tsx
<div className="text-center mb-16">
  <span className="inline-block text-accent text-caption uppercase tracking-[0.25em] font-semibold mb-4">
    Eyebrow Text
  </span>
  <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-primary leading-tight mb-6">
    Section Title
  </h2>
  <p className="text-body-lg text-secondary max-w-[42rem] mx-auto">
    Supporting description text that provides context.
  </p>
</div>
```

### 5. Feature Card Pattern

```tsx
function FeatureCard({ icon, title, description, align = 'left' }) {
  return (
    <div className={`bg-white rounded-xl p-6 shadow-sm border border-black/5 ${
      align === 'right' ? 'lg:text-right' : 'lg:text-left'
    }`}>
      <div className={`flex items-center gap-3 mb-3 ${
        align === 'right' ? 'lg:flex-row-reverse' : ''
      }`}>
        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent flex-shrink-0">
          {icon}
        </div>
        <h3 className="font-display text-base font-bold text-primary">
          {title}
        </h3>
      </div>
      <p className="text-body-sm text-secondary leading-relaxed">
        {description}
      </p>
    </div>
  );
}
```

### 6. Product Showcase Pattern (3-column)

```tsx
<div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
  {/* Left features */}
  <div className="lg:col-span-3 space-y-6 order-2 lg:order-1">
    <FeatureCard align="right" />
    <FeatureCard align="right" />
  </div>
  
  {/* Center product */}
  <div className="lg:col-span-6 order-1 lg:order-2">
    <div className="relative mx-auto max-w-md lg:max-w-full">
      <div className="absolute inset-4 bg-white rounded-full shadow-inner" />
      <img src={product} className="relative w-full h-auto object-contain" />
    </div>
  </div>
  
  {/* Right features */}
  <div className="lg:col-span-3 space-y-6 order-3">
    <FeatureCard align="left" />
    <FeatureCard align="left" />
  </div>
</div>
```

### 7. Testimonial Card Pattern

```tsx
function TestimonialCard({ quote, author, role, avatar }) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-black/5 relative">
      {/* Quote icon */}
      <div className="absolute -top-4 left-8 w-8 h-8 bg-accent rounded-full flex items-center justify-center">
        <QuoteIcon className="w-4 h-4 text-white" />
      </div>
      
      <p className="text-body text-secondary leading-relaxed mb-6 pt-2">
        "{quote}"
      </p>
      
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-display font-bold">
          {avatar}
        </div>
        <div>
          <div className="font-display font-bold text-primary">{author}</div>
          <div className="text-caption text-accent">{role}</div>
        </div>
      </div>
    </div>
  );
}
```

### 8. Brand Story Section Pattern

```tsx
function BrandStory() {
  return (
    <section className="py-20 md:py-28 bg-primary text-white relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60'...")`,
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
              Our Mission
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6">
              Section Headline
            </h2>
            <p className="text-lg text-white/80 leading-relaxed mb-6">First paragraph...</p>
            <p className="text-lg text-white/80 leading-relaxed mb-8">Second paragraph...</p>
            
            {/* Stats row */}
            <div className="flex flex-wrap gap-8">
              <div>
                <div className="text-3xl font-display font-bold text-accent">100%</div>
                <p className="text-sm text-white/60">Stat label</p>
              </div>
              <div>
                <div className="text-3xl font-display font-bold text-accent">5★</div>
                <p className="text-sm text-white/60">Stat label</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

### 9. Final CTA Section Pattern

```tsx
function FinalCTA() {
  return (
    <section className="py-20 md:py-24 bg-white">
      <div className="container-standard">
        <div className="bg-gradient-to-br from-primary to-surface-dark rounded-3xl p-10 md:p-16 text-center relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 max-w-[42rem] mx-auto px-4">
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
              CTA Headline
            </h2>
            <p className="text-lg text-white/80 mb-10">
              Supporting text that drives action.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="primary" className="!bg-accent !text-white !px-12">
                Primary CTA
              </Button>
              <Button variant="secondary" className="!border-white/30 !text-white">
                Secondary CTA
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

---

## Common UI Patterns

### Button Styling on Dark Backgrounds

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

### Image Glow Effect

```tsx
<div className="relative">
  <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-full scale-75" />
  <img src={image} className="relative w-full h-auto drop-shadow-2xl" />
</div>
```

### Wave Divider

```tsx
function WaveDivider({ fillColor = '#F7FAFC' }) {
  return (
    <div className="absolute bottom-0 left-0 right-0">
      <svg viewBox="0 0 1440 120" fill="none" className="w-full h-auto">
        <path 
          d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" 
          fill={fillColor}
        />
      </svg>
    </div>
  );
}
```

### Products Grid

```tsx
<div className="products-grid">
  {products.map((product) => (
    <ProductItem key={product.id} product={product} />
  ))}
</div>
```

### Loading Skeleton

```tsx
function ProductsGridSkeleton() {
  return (
    <div className="products-grid">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[4/5] bg-surface rounded-lg" />
          <div className="p-4 space-y-3">
            <div className="h-5 bg-surface rounded w-3/4" />
            <div className="h-5 bg-surface rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

## Section Backgrounds

Alternate backgrounds for visual rhythm:

| Section | Background |
|---------|------------|
| Hero | `bg-primary` with gradient |
| Trust Bar | `bg-surface` |
| Product Showcase | `bg-surface` |
| Featured Products | `bg-white` |
| Brand Story | `bg-primary` |
| Testimonials | `bg-surface` |
| Final CTA | `bg-white` with gradient card |

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
