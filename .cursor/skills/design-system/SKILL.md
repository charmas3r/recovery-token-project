# Design System Skill

## Overview

This skill translates the Recovery Token Store design system (PRD Section 3) into implementation patterns. Use this whenever building or modifying UI components, layouts, or styling. The design is inspired by premium travel gear aesthetics—clean, bold, and confident with strong visual hierarchy.

**Core Philosophy:** Information Architecture First → Visual Hierarchy as Navigation → Intentional White Space

## Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| CSS Framework | Tailwind CSS | 4.1.6 |
| Fonts | Inter / Manrope | Latest |
| Icons | Lucide React | 0.563.0 |
| Animation | Motion One | Latest |

## Design Tokens

### Typography Scale (Major Third - 1.250 ratio)

**Tailwind Config:**

```javascript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      fontSize: {
        // Hero & Major Headings
        'hero': ['3rem', { lineHeight: '1.1', fontWeight: '700' }],      // 48px
        'page-title': ['2.25rem', { lineHeight: '1.2', fontWeight: '700' }], // 36px
        'section': ['1.75rem', { lineHeight: '1.3', fontWeight: '700' }],    // 28px
        'subsection': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }], // 20px
        
        // Body Text
        'body-lg': ['1.125rem', { lineHeight: '1.6', fontWeight: '400' }],   // 18px
        'body': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],          // 16px
        'body-sm': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],   // 14px
        'caption': ['0.75rem', { lineHeight: '1.4', fontWeight: '500' }],    // 12px
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Manrope', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
};
```

**Usage:**

```tsx
// Hero headline
<h1 className="font-display text-hero text-primary">
  Get Ready for Year-End Business Travel
</h1>

// Page title
<h1 className="font-display text-page-title text-primary">
  1 Year Sobriety Token
</h1>

// Section heading
<h2 className="font-display text-section text-primary">
  Browse Backpack Collection
</h2>

// Subsection heading
<h3 className="font-display text-subsection text-primary">
  Product Features
</h3>

// Body large (descriptions, intros)
<p className="text-body-lg text-secondary">
  Designed for adventures, this pack offers ample space...
</p>

// Body standard
<p className="text-body text-secondary">
  Shop our stylish backpack collection...
</p>

// Caption (metadata, badges)
<span className="text-caption font-medium text-secondary/60">
  In Stock • Ships in 2-3 days
</span>
```

### Color System

**Tailwind Config:**

```javascript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        // Primary colors
        primary: '#1A202C',      // Deep Navy - headings, primary text
        secondary: '#4A5568',    // Slate - body text, secondary elements
        accent: '#B8764F',       // Bronze/Copper - CTAs, links, milestone badges
        
        // Surface colors
        surface: '#F7FAFC',      // Cool Gray - backgrounds, cards
        'surface-dark': '#2D3748', // Dark surface - footer, overlays
        
        // Semantic colors
        success: '#38A169',      // Confirmation, in-stock
        warning: '#DD6B20',      // Important notices, low stock
        error: '#E53E3E',        // Error messages, required fields
      },
      opacity: {
        '85': '0.85',  // Body text
        '60': '0.60',  // Metadata
        '40': '0.40',  // Disabled states
      },
    },
  },
};
```

**Usage:**

```tsx
// Headings
<h1 className="text-primary">Headline</h1>

// Body text
<p className="text-secondary">Body content</p>

// Metadata
<span className="text-secondary/60">Last updated: Jan 30</span>

// CTA buttons
<button className="bg-accent text-white hover:bg-accent/90">
  Add to Cart
</button>

// Success message
<div className="bg-success/10 text-success border border-success/20">
  Item added successfully!
</div>

// Surface variation
<section className="bg-surface">
  <div className="bg-white rounded-lg">Card content</div>
</section>
```

### Spacing System (8px base unit)

**Tailwind Config:**

```javascript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      spacing: {
        'xs': '0.25rem',   // 4px
        'sm': '0.5rem',    // 8px
        'md': '1rem',      // 16px
        'lg': '1.5rem',    // 24px
        'xl': '2rem',      // 32px
        '2xl': '3rem',     // 48px
        '3xl': '4rem',     // 64px
        '4xl': '6rem',     // 96px
      },
    },
  },
};
```

**Usage:**

```tsx
// Tight spacing (form fields, icon padding)
<div className="p-xs">Icon container</div>

// Standard spacing (card padding, element spacing)
<div className="p-md space-y-md">
  <p>Content</p>
  <p>More content</p>
</div>

// Section spacing
<section className="py-2xl md:py-3xl">
  Section content
</section>

// Hero section
<section className="py-4xl">
  Hero content
</section>
```

### Layout & Container Widths

**Tailwind Config:**

```javascript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      maxWidth: {
        'prose': '640px',    // Long-form content
        'standard': '1280px', // General pages
        'wide': '1440px',    // Homepage, visual-heavy
      },
    },
  },
};
```

**Usage:**

```tsx
// Standard container (most pages)
<div className="mx-auto max-w-standard px-md md:px-xl">
  {children}
</div>

// Prose container (About, policies)
<article className="mx-auto max-w-prose px-md">
  <p>Long-form content...</p>
</article>

// Wide container (homepage)
<div className="mx-auto max-w-wide px-md md:px-xl">
  {children}
</div>

// Full-bleed (hero images)
<div className="w-full">
  <img src="hero.jpg" className="w-full" />
</div>
```

## Component Patterns

### Button Component (Design System Applied)

```tsx
import {clsx} from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        // Base styles
        'rounded-md font-semibold transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        
        // Variants (per design system)
        {
          'bg-accent text-white hover:bg-accent/90 hover:scale-[1.02] shadow-sm':
            variant === 'primary',
          'border-2 border-accent text-accent hover:bg-accent/5':
            variant === 'secondary',
          'text-accent hover:bg-accent/5':
            variant === 'tertiary',
          'bg-error text-white hover:bg-error/90':
            variant === 'destructive',
        },
        
        // Sizes (minimum 44px touch target)
        {
          'px-md py-sm text-body-sm': size === 'sm',
          'px-xl py-md text-body h-11': size === 'md',    // 44px height
          'px-2xl py-lg text-body-lg h-12': size === 'lg',
        },
        
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
```

**Usage:**

```tsx
// Primary CTA
<Button variant="primary">Add to Cart</Button>

// Secondary action
<Button variant="secondary">Learn More</Button>

// Tertiary/text button
<Button variant="tertiary">Cancel</Button>

// Destructive action
<Button variant="destructive">Delete Address</Button>
```

### Card Component (Product Cards, Content Cards)

```tsx
interface CardProps {
  children: React.ReactNode;
  hover?: boolean;
  className?: string;
}

export function Card({children, hover = false, className}: CardProps) {
  return (
    <div
      className={clsx(
        'bg-white rounded-md overflow-hidden',
        'border border-surface-dark/10',
        hover && 'transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
        className,
      )}
    >
      {children}
    </div>
  );
}

// Product Card Pattern
export function ProductCard({product}: {product: Product}) {
  return (
    <Card hover>
      {/* Image (4:5 aspect ratio) */}
      <div className="aspect-[4/5] bg-surface relative overflow-hidden">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-400 hover:scale-105"
        />
      </div>
      
      {/* Content */}
      <div className="p-md space-y-xs">
        {/* Product name (2 lines max) */}
        <h3 className="text-subsection text-primary line-clamp-2">
          {product.title}
        </h3>
        
        {/* Rating */}
        <div className="flex items-center gap-xs">
          <div className="flex">
            {/* Stars */}
          </div>
          <span className="text-caption text-secondary/60">
            ({product.reviewCount})
          </span>
        </div>
        
        {/* Price */}
        <p className="text-body-lg font-bold text-accent">
          ${product.price}
        </p>
      </div>
    </Card>
  );
}
```

### Form Input (Design System Applied)

```tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export function Input({label, error, helperText, className, ...props}: InputProps) {
  return (
    <div className="space-y-xs">
      {/* Label */}
      <label className="block text-body-sm font-semibold text-primary">
        {label}
      </label>
      
      {/* Input */}
      <input
        className={clsx(
          'w-full h-11 px-md rounded-md border transition-colors',
          'text-body text-primary placeholder:text-secondary/40',
          'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1',
          error
            ? 'border-error focus:ring-error'
            : 'border-secondary/20 focus:border-accent',
          className,
        )}
        {...props}
      />
      
      {/* Helper text or error */}
      {(helperText || error) && (
        <p
          className={clsx(
            'text-body-sm',
            error ? 'text-error' : 'text-secondary/60',
          )}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
}
```

### Badge Component

```tsx
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'new' | 'sale' | 'in-stock' | 'low-stock' | 'neutral';
}

export function Badge({children, variant = 'neutral'}: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-md py-xs rounded-full',
        'text-caption font-medium',
        {
          'bg-accent/10 text-accent': variant === 'new',
          'bg-error/10 text-error': variant === 'sale',
          'bg-success/10 text-success': variant === 'in-stock',
          'bg-warning/10 text-warning': variant === 'low-stock',
          'bg-surface text-secondary': variant === 'neutral',
        },
      )}
    >
      {children}
    </span>
  );
}
```

## Layout Patterns

### Hero Section Pattern

```tsx
export function HeroSection({
  headline,
  subheadline,
  ctaText,
  ctaHref,
  imageSrc,
}: HeroProps) {
  return (
    <section className="relative bg-surface-dark text-white overflow-hidden">
      <div className="mx-auto max-w-wide px-md md:px-xl py-4xl">
        <div className="grid md:grid-cols-2 gap-xl items-center">
          {/* Left content */}
          <div className="space-y-lg">
            <h1 className="font-display text-hero">
              {headline}
            </h1>
            
            <p className="text-body-lg opacity-85">
              {subheadline}
            </p>
            
            <Button variant="primary" size="lg" asChild>
              <a href={ctaHref}>{ctaText}</a>
            </Button>
          </div>
          
          {/* Right image (60% width on desktop) */}
          <div className="relative">
            <img
              src={imageSrc}
              alt=""
              className="w-full rounded-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
```

### Product Grid Pattern

```tsx
export function ProductGrid({products}: {products: Product[]}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-lg">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### Feature Section Pattern

```tsx
export function FeatureSection({
  heading,
  description,
  features,
}: FeatureSectionProps) {
  return (
    <section className="py-3xl">
      <div className="mx-auto max-w-standard px-md md:px-xl">
        {/* Heading */}
        <div className="text-center space-y-md mb-2xl">
          <h2 className="font-display text-section text-primary">
            {heading}
          </h2>
          <p className="text-body-lg text-secondary max-w-prose mx-auto">
            {description}
          </p>
        </div>
        
        {/* Features grid */}
        <div className="grid md:grid-cols-3 gap-xl">
          {features.map((feature) => (
            <div key={feature.title} className="text-center space-y-md">
              {/* Icon */}
              <div className="mx-auto w-12 h-12 flex items-center justify-center bg-accent/10 rounded-lg">
                {feature.icon}
              </div>
              
              {/* Title */}
              <h3 className="font-display text-subsection text-primary">
                {feature.title}
              </h3>
              
              {/* Description */}
              <p className="text-body text-secondary">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

### Section Alternation Pattern (White/Gray backgrounds)

```tsx
export function AlternatingSections() {
  return (
    <>
      {/* White section */}
      <section className="bg-white py-3xl">
        <div className="mx-auto max-w-standard px-md md:px-xl">
          Content
        </div>
      </section>
      
      {/* Gray section */}
      <section className="bg-surface py-3xl">
        <div className="mx-auto max-w-standard px-md md:px-xl">
          Content
        </div>
      </section>
      
      {/* White section */}
      <section className="bg-white py-3xl">
        <div className="mx-auto max-w-standard px-md md:px-xl">
          Content
        </div>
      </section>
    </>
  );
}
```

## Responsive Design Patterns

### Breakpoints (Mobile-First)

```tsx
// Tailwind default breakpoints (already mobile-first)
// sm: 640px
// md: 768px
// lg: 1024px
// xl: 1280px
// 2xl: 1536px

// Typography responsive
<h1 className="text-page-title md:text-hero">
  Responsive Headline
</h1>

// Grid responsive
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-lg">
  {/* Products */}
</div>

// Spacing responsive
<section className="py-2xl md:py-3xl">
  {/* Section content */}
</section>

// Container padding responsive
<div className="px-md md:px-xl lg:px-2xl">
  {/* Content */}
</div>
```

### Mobile-Specific Patterns

```tsx
// Bottom sticky CTA (mobile PDP)
<div className="fixed bottom-0 left-0 right-0 p-md bg-white border-t md:hidden">
  <Button variant="primary" className="w-full">
    Add to Cart
  </Button>
</div>

// Mobile navigation toggle
<button className="md:hidden p-sm">
  <Menu className="w-6 h-6" />
</button>

// Desktop-only hover effects
<div className="hover:scale-105 md:transition-transform">
  {/* Only animates on desktop */}
</div>
```

## Animation Patterns

### Micro-interactions

```tsx
// Button hover (design system spec)
<button className="
  transition-all duration-200
  hover:scale-[1.02]
  active:scale-[0.98]
">
  Click me
</button>

// Cart drawer slide-in
<aside className="
  fixed right-0 top-0 bottom-0 w-96
  bg-white shadow-2xl
  transform transition-transform duration-400 ease-out
  data-[state=closed]:translate-x-full
  data-[state=open]:translate-x-0
">
  Cart content
</aside>

// Image hover zoom
<div className="overflow-hidden">
  <img
    className="transition-transform duration-400 hover:scale-105"
    src={imageSrc}
  />
</div>

// Fade in on mount
<div className="animate-in fade-in duration-300">
  Content
</div>
```

### Respect Reduced Motion

```tsx
// Add to globals
<style jsx global>{`
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`}</style>
```

## Accessibility Patterns

### Focus States (Design System Spec)

```tsx
// All interactive elements need focus
<button className="
  focus:outline-none
  focus:ring-2
  focus:ring-accent
  focus:ring-offset-2
">
  Interactive element
</button>

// Custom focus for cards
<a className="
  block rounded-md
  focus:outline-none
  focus:ring-2
  focus:ring-accent
  focus:ring-offset-2
">
  Card content
</a>
```

### Semantic HTML

```tsx
// ✅ DO: Use semantic elements
<header>...</header>
<nav>...</nav>
<main>...</main>
<article>...</article>
<aside>...</aside>
<footer>...</footer>

// ❌ AVOID: Generic divs for structure
<div className="header">...</div>
<div className="nav">...</div>
```

### ARIA Labels

```tsx
// Icon buttons need labels
<button aria-label="Close menu">
  <X className="w-5 h-5" />
</button>

// Badge with semantic info
<span className="badge" aria-label="New product">
  New
</span>
```

## Loading States

### Skeleton Patterns

```tsx
// Product card skeleton (matches design)
export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Image skeleton (4:5 aspect) */}
      <div className="aspect-[4/5] bg-surface rounded-md" />
      
      {/* Text skeletons */}
      <div className="p-md space-y-xs">
        <div className="h-6 bg-surface rounded w-3/4" />
        <div className="h-4 bg-surface rounded w-1/2" />
        <div className="h-6 bg-surface rounded w-1/4 mt-md" />
      </div>
    </div>
  );
}

// Section skeleton
export function SectionSkeleton() {
  return (
    <div className="py-3xl">
      <div className="mx-auto max-w-standard px-md md:px-xl">
        {/* Heading skeleton */}
        <div className="h-10 bg-surface rounded w-1/3 mx-auto mb-2xl" />
        
        {/* Grid skeleton */}
        <div className="grid md:grid-cols-3 gap-xl">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-md">
              <div className="h-12 w-12 bg-surface rounded-lg mx-auto" />
              <div className="h-6 bg-surface rounded w-2/3 mx-auto" />
              <div className="h-4 bg-surface rounded w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

## Design System Checklist

Before committing UI work, verify:

- [ ] Colors use design tokens (`text-primary`, `bg-accent`, etc.)
- [ ] Typography uses design scale (`text-hero`, `text-section`, etc.)
- [ ] Spacing follows 8px system (`p-md`, `space-y-lg`, etc.)
- [ ] Interactive elements are minimum 44px touch target
- [ ] Focus states are visible with 2px accent ring
- [ ] Responsive at all breakpoints (mobile, tablet, desktop)
- [ ] Animations respect `prefers-reduced-motion`
- [ ] WCAG AA contrast (4.5:1 body, 3:1 UI elements)
- [ ] Images have aspect ratios set (prevent CLS)
- [ ] Loading states match content layout

## Gotchas & Best Practices

### DO:
- **Reference the design system first** before creating any UI
- **Use design tokens** instead of arbitrary values
- **Follow the hierarchy** (48px → 36px → 28px → 20px scale)
- **Maintain consistent spacing** (8px base unit)
- **Test on mobile first**, then enhance for desktop
- **Use semantic HTML** for structure
- **Provide focus indicators** for keyboard navigation

### AVOID:
- ❌ Arbitrary colors (`text-gray-500` → use `text-secondary`)
- ❌ Arbitrary sizes (`text-[17px]` → use `text-body-lg`)
- ❌ Inconsistent spacing (`p-3.5` → use `p-md` or `p-lg`)
- ❌ Small touch targets (< 44px on mobile)
- ❌ Missing focus states on interactive elements
- ❌ Using `div` for buttons (`<div onClick>` → `<button>`)
- ❌ Hardcoding breakpoint values

## Related Skills

- `ui-components` - Base component primitives
- `react-router-patterns` - Page layout and routing
- `product-personalization` - Dialog patterns
- `cart-management` - Drawer/aside patterns

## Related Documentation

- **PRD Section 3:** Design System & Visual Language (source of truth)
- **Design Rule:** `.cursor/rules/design-system.mdc` (enforcement)
