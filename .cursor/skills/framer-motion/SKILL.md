# Framer Motion Animations Skill

## When to Use This Skill

Use this skill when:
- Adding entrance/reveal animations to page sections
- Implementing scroll-triggered animations
- Creating hover/tap interactions
- Building staggered animations for lists/grids
- Adding micro-interactions to UI elements
- Implementing parallax or floating effects

**Always respect `prefers-reduced-motion` accessibility setting.**

---

## Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| Animation Library | Framer Motion | 11.x |
| Framework | React | 18.x |
| CSS Framework | Tailwind CSS | 4.x |

---

## Quick Start

### Import Animation Components

```tsx
import {
  FadeUp,
  FadeIn,
  SlideIn,
  ScaleIn,
  StaggerContainer,
  StaggerItem,
  HeroContent,
  HeroItem,
  HeroImage,
  HoverScale,
  HoverLift,
  GlowPulse,
  motion,
} from '~/components/ui/Animations';
```

---

## Core Animation Patterns

### 1. Scroll Reveal - FadeUp

Most common pattern for revealing content as user scrolls.

```tsx
<FadeUp>
  <h2 className="font-display text-section text-primary">
    Section Title
  </h2>
</FadeUp>
```

**With delay:**
```tsx
<FadeUp delay={0.2}>
  <p className="text-body text-secondary">
    Supporting content appears slightly after heading
  </p>
</FadeUp>
```

### 2. Slide In from Direction

```tsx
<SlideIn direction="left">
  <div>Content slides in from left</div>
</SlideIn>

<SlideIn direction="right" delay={0.1}>
  <div>Content slides in from right</div>
</SlideIn>

<SlideIn direction="up">
  <div>Content slides up</div>
</SlideIn>
```

### 3. Scale Animation

```tsx
<ScaleIn>
  <div className="card">
    Card scales up when entering viewport
  </div>
</ScaleIn>
```

### 4. Staggered Children (Lists/Grids)

```tsx
<StaggerContainer staggerDelay={0.1}>
  {items.map((item) => (
    <StaggerItem key={item.id}>
      <Card>{item.content}</Card>
    </StaggerItem>
  ))}
</StaggerContainer>
```

**Custom stagger timing:**
```tsx
<StaggerContainer staggerDelay={0.15} initialDelay={0.2}>
  {features.map((feature) => (
    <StaggerItem key={feature.id}>
      <FeatureCard feature={feature} />
    </StaggerItem>
  ))}
</StaggerContainer>
```

### 5. Hero Section Animation

```tsx
<HeroContent>
  <HeroItem>
    <span className="eyebrow">Eyebrow Text</span>
  </HeroItem>
  <HeroItem>
    <h1 className="hero-title">Main Headline</h1>
  </HeroItem>
  <HeroItem>
    <p className="hero-description">Supporting text</p>
  </HeroItem>
  <HeroItem>
    <Button>CTA Button</Button>
  </HeroItem>
</HeroContent>

<HeroImage>
  <img src={heroImage} alt="Hero" />
</HeroImage>
```

### 6. Hover Interactions

**Scale on hover:**
```tsx
<HoverScale scale={1.02}>
  <Card>
    Card scales slightly on hover
  </Card>
</HoverScale>
```

**Lift on hover:**
```tsx
<HoverLift lift={-8}>
  <ProductCard product={product} />
</HoverLift>
```

### 7. Decorative Animations

**Floating effect:**
```tsx
<motion.img
  src={tokenImage}
  animate={{y: [-5, 5, -5]}}
  transition={{
    duration: 6,
    repeat: Infinity,
    ease: 'easeInOut',
  }}
/>
```

**Pulsing glow:**
```tsx
<GlowPulse className="absolute inset-0 bg-accent/20 blur-3xl rounded-full" />
```

---

## Direct Motion Usage

For custom animations, use the `motion` component directly:

```tsx
import {motion} from '~/components/ui/Animations';

<motion.div
  initial={{opacity: 0, y: 20}}
  whileInView={{opacity: 1, y: 0}}
  viewport={{once: true, margin: '-50px'}}
  transition={{duration: 0.6, ease: [0.22, 1, 0.36, 1]}}
>
  Custom animated content
</motion.div>
```

**Button hover:**
```tsx
<motion.button
  whileHover={{scale: 1.02}}
  whileTap={{scale: 0.98}}
  transition={{duration: 0.2}}
>
  Animated Button
</motion.button>
```

**Icon spin on hover:**
```tsx
<motion.div
  whileHover={{scale: 1.1, rotate: 5}}
  transition={{duration: 0.2}}
>
  <Icon />
</motion.div>
```

---

## Landing Page Section Patterns

### Section Header Pattern

```tsx
<FadeUp className="text-center mb-16">
  <span className="inline-block text-accent text-caption uppercase tracking-[0.25em] font-semibold mb-4">
    Eyebrow Text
  </span>
  <h2 className="font-display text-section text-primary mb-6">
    Section Title
  </h2>
  <p className="text-body-lg text-secondary max-w-[42rem] mx-auto">
    Supporting description text.
  </p>
</FadeUp>
```

### Feature Grid Pattern

```tsx
<StaggerContainer className="grid md:grid-cols-3 gap-8" staggerDelay={0.15}>
  {features.map((feature) => (
    <StaggerItem key={feature.id}>
      <HoverLift lift={-6}>
        <FeatureCard feature={feature} />
      </HoverLift>
    </StaggerItem>
  ))}
</StaggerContainer>
```

### Two-Column Layout Pattern

```tsx
<div className="grid lg:grid-cols-2 gap-12 items-center">
  <SlideIn direction="left">
    <img src={image} alt="Description" />
  </SlideIn>
  
  <SlideIn direction="right">
    <div>
      <h2>Content Title</h2>
      <p>Description text</p>
    </div>
  </SlideIn>
</div>
```

### CTA Card Pattern

```tsx
<ScaleIn>
  <div className="bg-primary rounded-3xl p-16 text-center relative overflow-hidden">
    {/* Animated background decorations */}
    <motion.div 
      className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl"
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.1, 0.2, 0.1],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
    
    <FadeUp className="relative z-10">
      <h2>CTA Headline</h2>
      <Button>Action</Button>
    </FadeUp>
  </div>
</ScaleIn>
```

---

## Animation Timing

### Recommended Durations

| Animation Type | Duration | Use Case |
|---------------|----------|----------|
| Hover/Tap | 0.2s | Button interactions |
| Fade In | 0.5s | Simple reveals |
| Fade Up | 0.6s | Scroll reveals |
| Hero | 0.8s | Initial load |
| Scale | 0.5s | Card reveals |
| Stagger delay | 0.1-0.15s | List items |

### Custom Easing

```tsx
// Project's standard ease curve
ease: [0.22, 1, 0.36, 1]

// Built-in easings
ease: 'easeOut'
ease: 'easeInOut'

// Spring physics
transition: {type: 'spring', stiffness: 200, damping: 20}
```

---

## Accessibility

All animation components automatically respect `prefers-reduced-motion`:

```tsx
const shouldReduceMotion = useReducedMotion();

if (shouldReduceMotion) {
  return <div className={className}>{children}</div>;
}

return (
  <motion.div
    // ... animations
  >
    {children}
  </motion.div>
);
```

**Manual check:**
```tsx
import {useReducedMotion} from 'framer-motion';

function MyComponent() {
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <motion.div
      animate={shouldReduceMotion ? {} : {y: [-5, 5, -5]}}
    >
      Content
    </motion.div>
  );
}
```

---

## Performance Tips

1. **Use `viewport={{once: true}}`** - Animate only once on scroll
2. **Avoid animating layout** - Prefer `opacity`, `transform` properties
3. **Use `will-change` sparingly** - Only for complex animations
4. **Batch animations** - Group related animations together
5. **Lazy load heavy animations** - Defer non-critical animations

---

## Common Pitfalls

| Problem | Solution |
|---------|----------|
| Animation jank | Use `transform` instead of `margin`/`padding` |
| Flash of content | Set `initial` state properly |
| Animation on every scroll | Use `viewport={{once: true}}` |
| SSR mismatch | Use `'use client'` directive |
| Accessibility ignored | Always check `useReducedMotion()` |

---

## Related Skills

- **design-system** - Typography and spacing tokens
- **ui-components** - Base component primitives
- **react-router-patterns** - Page layouts

---

## Related Files

- **Animation Components:** `app/components/ui/Animations.tsx`
- **Landing Page:** `app/routes/($locale)._index.tsx`
- **Design System:** `DESIGN-SYSTEM.md`
