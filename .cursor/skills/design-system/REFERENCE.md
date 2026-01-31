# Design System Reference

## Overview

This reference provides advanced patterns, best practices, and industry standards for maintaining a cohesive design system. It complements the SKILL.md implementation patterns with deeper guidance on design system architecture, consistency enforcement, and performance optimization.

---

## Industry Best Practices

### 1. Design Token Architecture

**Single Source of Truth Pattern:**

Design tokens should cascade from abstract to specific:

```javascript
// tailwind.config.ts - Proper token hierarchy
export default {
  theme: {
    extend: {
      // 1. Base tokens (abstract)
      colors: {
        'brand-navy': '#1A202C',
        'brand-slate': '#4A5568',
        'brand-bronze': '#B8764F',
      },
      
      // 2. Semantic tokens (contextual)
      colors: {
        primary: '#1A202C',      // brand-navy
        secondary: '#4A5568',    // brand-slate
        accent: '#B8764F',       // brand-bronze
      },
      
      // 3. Component tokens (specific)
      colors: {
        'button-primary-bg': '#B8764F',    // accent
        'button-primary-text': '#FFFFFF',
        'heading-color': '#1A202C',        // primary
      },
    },
  },
};
```

**✅ DO: Use semantic naming**

```tsx
// Good - semantic and reusable
<button className="bg-accent text-white">Add to Cart</button>
<h1 className="text-primary">Welcome</h1>

// Bad - arbitrary and breaks design system
<button className="bg-[#B8764F] text-white">Add to Cart</button>
<h1 className="text-gray-900">Welcome</h1>
```

**❌ AVOID: Color by appearance**

```tsx
// Bad - what if bronze changes to silver?
<button className="bg-bronze">Click</button>

// Good - semantic meaning persists
<button className="bg-accent">Click</button>
```

---

### 2. Typography Scale Maintenance

**Modular Scale Principle:**

Using a consistent ratio (1.250 - Major Third) creates visual harmony:

```
12px × 1.250 = 15px (not used, jump to 16px)
16px × 1.250 = 20px ✓
20px × 1.250 = 25px (not used, jump to 28px)
28px × 1.250 = 35px (not used, jump to 36px)
36px × 1.250 = 45px (not used, jump to 48px)
```

**✅ DO: Stick to the scale**

```tsx
// Good - uses defined scale
<h1 className="text-hero">48px</h1>
<h2 className="text-page-title">36px</h2>
<h3 className="text-section">28px</h3>

// Bad - arbitrary size breaks harmony
<h2 className="text-[40px]">40px</h2>
```

**Font Loading Performance:**

```tsx
// app/root.tsx - Optimal font loading
export const links: LinksFunction = () => [
  {
    rel: 'preconnect',
    href: 'https://fonts.googleapis.com',
  },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@600;700&display=swap',
  },
];

// CSS - System font fallback
:root {
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
```

**Variable Fonts (Advanced):**

If using variable fonts, single file = all weights:

```tsx
// Single variable font file
@font-face {
  font-family: 'Inter Variable';
  font-style: normal;
  font-weight: 100 900;
  src: url('/fonts/Inter-Variable.woff2') format('woff2');
  font-display: swap;
}
```

---

### 3. Spacing System Consistency

**8px Grid System Benefits:**

- **Developer Efficiency:** Easy mental math (1rem = 16px = 2 units)
- **Design Consistency:** Visual rhythm across all components
- **Responsive Scaling:** Clean breakpoints at all sizes

**✅ DO: Use spacing tokens**

```tsx
// Good - consistent with system
<div className="p-md space-y-lg">
  <p>Content</p>
</div>

// Bad - arbitrary spacing
<div className="p-[14px] space-y-[26px]">
  <p>Content</p>
</div>
```

**Vertical Rhythm Pattern:**

```tsx
// Proper spacing hierarchy
<article className="space-y-2xl">
  {/* Between major sections: 48px */}
  
  <section className="space-y-lg">
    {/* Between section elements: 24px */}
    
    <h2 className="mb-md">Heading</h2>
    {/* After heading: 16px */}
    
    <div className="space-y-sm">
      {/* Between related paragraphs: 8px */}
      <p>Paragraph 1</p>
      <p>Paragraph 2</p>
    </div>
  </section>
</article>
```

---

### 4. Color Accessibility

**WCAG Contrast Requirements:**

| Level | Normal Text | Large Text (18px+) |
|-------|-------------|-------------------|
| AA | 4.5:1 | 3:1 |
| AAA | 7:1 | 4.5:1 |

**Testing Contrast:**

```bash
# Using Chrome DevTools
1. Inspect element
2. View "Accessibility" panel
3. Check "Contrast ratio"
4. Ensure meets WCAG AA minimum
```

**✅ DO: Meet contrast requirements**

```tsx
// Good - WCAG AA (16.1:1)
<p className="text-primary">Primary text on white</p>

// Good - WCAG AA (8.2:1)
<p className="text-secondary">Secondary text on white</p>

// Warning - Check contrast (4.5:1)
<a className="text-accent">Link text</a>

// Bad - Fails WCAG AA (2.1:1)
<p className="text-secondary/40">Too light text</p>
```

**Color Blindness Considerations:**

- **Never use color alone** to convey information
- **Always pair with icons or text** for status

```tsx
// Bad - color only
<span className="text-success">Available</span>
<span className="text-error">Sold Out</span>

// Good - color + icon + text
<span className="flex items-center gap-xs text-success">
  <CheckCircle className="w-4 h-4" />
  Available
</span>
<span className="flex items-center gap-xs text-error">
  <XCircle className="w-4 h-4" />
  Sold Out
</span>
```

---

### 5. Component Composition Patterns

**Compound Components:**

```tsx
// Flexible, composable pattern
export const Card = ({children}: {children: React.ReactNode}) => (
  <div className="bg-white rounded-md border border-surface-dark/10">
    {children}
  </div>
);

Card.Image = ({src, alt}: {src: string; alt: string}) => (
  <img src={src} alt={alt} className="aspect-[4/5] object-cover" />
);

Card.Content = ({children}: {children: React.ReactNode}) => (
  <div className="p-md space-y-xs">{children}</div>
);

Card.Title = ({children}: {children: React.ReactNode}) => (
  <h3 className="text-subsection text-primary">{children}</h3>
);

// Usage - full control
<Card>
  <Card.Image src="..." alt="..." />
  <Card.Content>
    <Card.Title>Product Name</Card.Title>
    <p className="text-body-sm">Description</p>
  </Card.Content>
</Card>
```

**Polymorphic Components:**

```tsx
// Button that can render as different elements
type ButtonProps<T extends React.ElementType = 'button'> = {
  as?: T;
  children: React.ReactNode;
} & React.ComponentPropsWithoutRef<T>;

export function Button<T extends React.ElementType = 'button'>({
  as,
  children,
  className,
  ...props
}: ButtonProps<T>) {
  const Component = as || 'button';
  
  return (
    <Component
      className={cn('btn-base', className)}
      {...props}
    >
      {children}
    </Component>
  );
}

// Usage - renders as link
<Button as="a" href="/products">
  Shop Now
</Button>
```

---

## Security Considerations

### 1. Injection Prevention in Dynamic Styles

**❌ AVOID: User input in class names**

```tsx
// Dangerous - XSS vulnerability
<div className={userInput}>Content</div>

// Dangerous - class injection
<div className={`bg-${userColor}`}>Content</div>
```

**✅ DO: Whitelist allowed values**

```tsx
// Safe - controlled mapping
const colorMap = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  red: 'bg-red-500',
};

<div className={colorMap[userInput] || colorMap.blue}>
  Content
</div>
```

### 2. CSS Custom Properties Safety

**✅ DO: Sanitize dynamic CSS variables**

```tsx
// Safe - numeric value validation
function setThemeColor(hue: number) {
  if (hue < 0 || hue > 360) return;
  
  document.documentElement.style.setProperty(
    '--theme-hue',
    String(hue)
  );
}
```

---

## Performance Optimization

### 1. CSS Bundle Size Management

**Tailwind PurgeCSS Configuration:**

```javascript
// tailwind.config.ts
export default {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
  ],
  safelist: [
    // Only if dynamically generated
    'bg-success',
    'bg-warning',
    'bg-error',
  ],
};
```

**Measure Bundle Impact:**

```bash
# Build and analyze
npm run build

# Check CSS size
ls -lh build/assets/*.css

# Target: < 50KB gzipped for entire site CSS
```

### 2. Critical CSS Extraction

**Inline Critical Styles:**

```tsx
// app/root.tsx
export function links() {
  return [
    // Critical CSS inline in <head>
    {
      rel: 'stylesheet',
      href: criticalStylesUrl,
    },
  ];
}
```

### 3. Animation Performance

**✅ DO: Use transform & opacity only**

```tsx
// Good - GPU-accelerated
<div className="transition-transform hover:scale-105">
  Content
</div>

// Bad - triggers layout recalc
<div className="transition-all hover:w-[400px]">
  Content
</div>
```

**Animation Budget:**

- **Critical path:** 0 animations
- **After interactive:** < 200ms simple, < 400ms complex
- **Total animated elements:** < 10 simultaneously

---

## Responsive Design Patterns

### 1. Container Queries (Future)

When container queries have better support:

```css
/* Future: Component-level responsive */
.card-container {
  container-type: inline-size;
}

@container (min-width: 400px) {
  .card-title {
    font-size: 1.25rem;
  }
}
```

For now, use traditional breakpoints:

```tsx
<h3 className="text-body md:text-subsection lg:text-section">
  Responsive Title
</h3>
```

### 2. Fluid Typography

**Clamp for Smooth Scaling:**

```css
/* Scales smoothly between breakpoints */
h1 {
  font-size: clamp(2rem, 5vw, 3rem);
}
```

**Tailwind Implementation:**

```javascript
// tailwind.config.ts
fontSize: {
  'fluid-hero': 'clamp(2.25rem, 5vw, 3rem)',
  'fluid-section': 'clamp(1.5rem, 3vw, 1.75rem)',
}
```

---

## Testing Patterns

### 1. Visual Regression Testing

**Chromatic Integration:**

```typescript
// .storybook/preview.tsx
export const decorators = [
  (Story) => (
    <div className="font-sans">
      <Story />
    </div>
  ),
];

// Button.stories.tsx
export const AllVariants = () => (
  <div className="space-y-md">
    <Button variant="primary">Primary</Button>
    <Button variant="secondary">Secondary</Button>
    <Button variant="tertiary">Tertiary</Button>
  </div>
);
```

### 2. Accessibility Testing

**Automated Tests:**

```typescript
// button.test.tsx
import {render} from '@testing-library/react';
import {axe, toHaveNoViolations} from 'jest-axe';

expect.extend(toHaveNoViolations);

test('Button has no accessibility violations', async () => {
  const {container} = render(<Button>Click me</Button>);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

**Manual Checklist:**

- [ ] Navigate with keyboard only
- [ ] Test with screen reader (VoiceOver/NVDA)
- [ ] Verify focus indicators visible
- [ ] Check color contrast (Chrome DevTools)
- [ ] Test with 200% zoom
- [ ] Verify text scales with browser settings

### 3. Design Token Tests

**Validate Token Consistency:**

```typescript
// tokens.test.ts
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '../tailwind.config';

const fullConfig = resolveConfig(tailwindConfig);

test('Primary color matches brand guidelines', () => {
  const primary = fullConfig.theme.colors.primary;
  expect(primary).toBe('#1A202C');
});

test('Spacing follows 8px system', () => {
  const spacing = fullConfig.theme.spacing;
  expect(spacing.md).toBe('1rem'); // 16px
  expect(spacing.lg).toBe('1.5rem'); // 24px
});
```

---

## Common Pitfalls & Solutions

### Pitfall 1: Arbitrary Values Creep

**Problem:** Developers use one-off values instead of tokens

```tsx
// Bad - arbitrary value
<div className="mt-[18px] text-[19px]">Content</div>
```

**Solution:** Pre-commit hook to detect arbitrary values

```javascript
// .husky/pre-commit
npx eslint --plugin tailwindcss --rule 'tailwindcss/no-arbitrary-value: error'
```

### Pitfall 2: Inconsistent Component Variants

**Problem:** Different buttons look similar but behave differently

**Solution:** Enforce variant patterns in code review

```tsx
// Good - clear variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>

// Bad - custom classes everywhere
<button className="bg-blue-500 hover:bg-blue-600">Custom</button>
```

### Pitfall 3: Missing Dark Mode Preparation

**Problem:** Design system doesn't consider future dark mode

**Solution:** Use semantic tokens from the start

```tsx
// Good - semantic, easy to dark mode later
<div className="bg-surface text-primary">
  Content
</div>

// Bad - hardcoded light colors
<div className="bg-white text-gray-900">
  Content
</div>
```

---

## Design System Evolution

### Version Control Strategy

**Document Changes:**

```markdown
# CHANGELOG.md

## [2.0.0] - 2026-02-15
### Breaking Changes
- Changed accent color from #B8764F to #C89060 for better contrast

### Added
- New `text-body-xs` token (14px) for dense layouts

### Deprecated
- `text-small` → Use `text-body-sm` instead
```

### Migration Guide Pattern

```tsx
// migration-v2.md

// v1.x (old)
<button className="bg-blue-600">Click</button>

// v2.0 (new)
<Button variant="primary">Click</Button>

// Codemod available:
npx @recovery-token/codemod v1-to-v2
```

---

## Documentation Standards

### Component Documentation Template

```tsx
/**
 * Button component following Recovery Token Store design system
 * 
 * @see Design System: PRD Section 3
 * @see Skill: .cursor/skills/design-system/SKILL.md
 * 
 * @example
 * // Primary CTA
 * <Button variant="primary">Add to Cart</Button>
 * 
 * @example
 * // Secondary action
 * <Button variant="secondary">Learn More</Button>
 */
export function Button({variant = 'primary', ...props}: ButtonProps) {
  // Implementation
}
```

---

## Resources

### Design System References

- [Material Design System](https://m3.material.io/) - Google's design system
- [Polaris](https://polaris.shopify.com/) - Shopify's design system
- [Radix Themes](https://www.radix-ui.com/themes/docs/overview/getting-started) - Radix design system
- [Tailwind UI](https://tailwindui.com/) - Component examples

### Tools

- **Figma**: Design system management
- **Storybook**: Component documentation
- **Chromatic**: Visual regression testing
- **axe DevTools**: Accessibility testing
- **Contrast**: Color contrast checker

### Books

- *Design Systems* by Alla Kholmatova
- *Atomic Design* by Brad Frost
- *Refactoring UI* by Adam Wathan & Steve Schoger

---

## Related Documentation

- **PRD Section 3:** Design System & Visual Language (source of truth)
- **SKILL.md:** Implementation patterns and code examples
- **Design Rule:** `.cursor/rules/design-system.mdc` (enforcement)
- **UI Components Skill:** Base component primitives
