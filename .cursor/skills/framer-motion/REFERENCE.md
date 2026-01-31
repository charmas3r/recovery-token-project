# Framer Motion Reference

## Complete API Reference

### Animation Component Props

#### Common Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `''` | CSS classes to apply |
| `delay` | `number` | `0` | Animation delay in seconds |
| `once` | `boolean` | `true` | Only animate once on scroll |

---

## Animation Components

### FadeUp

Fades in content while sliding up from below.

```tsx
interface FadeUpProps {
  children: ReactNode;
  className?: string;
  delay?: number;      // Default: 0
  once?: boolean;      // Default: true
}
```

**Example:**
```tsx
<FadeUp delay={0.2} once={true}>
  <div>Content fades up when scrolling into view</div>
</FadeUp>
```

**Animation Details:**
- Initial: `opacity: 0, y: 30`
- Final: `opacity: 1, y: 0`
- Duration: 0.6s
- Easing: `[0.22, 1, 0.36, 1]`

---

### FadeIn

Simple fade in without movement.

```tsx
interface FadeInProps {
  children: ReactNode;
  className?: string;
  delay?: number;      // Default: 0
  once?: boolean;      // Default: true
}
```

**Example:**
```tsx
<FadeIn>
  <img src={image} alt="Fades in" />
</FadeIn>
```

**Animation Details:**
- Initial: `opacity: 0`
- Final: `opacity: 1`
- Duration: 0.5s
- Easing: `easeOut`

---

### SlideIn

Slides content in from a specified direction.

```tsx
interface SlideInProps {
  children: ReactNode;
  className?: string;
  delay?: number;                              // Default: 0
  once?: boolean;                              // Default: true
  direction?: 'left' | 'right' | 'up' | 'down'; // Default: 'left'
}
```

**Example:**
```tsx
<SlideIn direction="right" delay={0.1}>
  <div>Slides in from the right</div>
</SlideIn>
```

**Animation Details:**
- Initial offset: 40px from direction
- Duration: 0.6s
- Easing: `[0.22, 1, 0.36, 1]`

---

### ScaleIn

Scales content up from smaller size.

```tsx
interface ScaleInProps {
  children: ReactNode;
  className?: string;
  delay?: number;      // Default: 0
  once?: boolean;      // Default: true
}
```

**Example:**
```tsx
<ScaleIn>
  <div className="card">Card scales up when visible</div>
</ScaleIn>
```

**Animation Details:**
- Initial: `opacity: 0, scale: 0.9`
- Final: `opacity: 1, scale: 1`
- Duration: 0.5s
- Easing: `[0.22, 1, 0.36, 1]`

---

### StaggerContainer

Container for staggered child animations.

```tsx
interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;   // Default: 0.1
  initialDelay?: number;   // Default: 0.1
  once?: boolean;          // Default: true
}
```

**Example:**
```tsx
<StaggerContainer staggerDelay={0.15} initialDelay={0.2}>
  <StaggerItem>First item</StaggerItem>
  <StaggerItem>Second item (appears 0.15s later)</StaggerItem>
  <StaggerItem>Third item (appears 0.30s later)</StaggerItem>
</StaggerContainer>
```

---

### StaggerItem

Child item within a StaggerContainer.

```tsx
interface StaggerItemProps {
  children: ReactNode;
  className?: string;
}
```

**Example:**
```tsx
<StaggerContainer>
  {items.map((item) => (
    <StaggerItem key={item.id}>
      <Card>{item.content}</Card>
    </StaggerItem>
  ))}
</StaggerContainer>
```

**Animation Details:**
- Uses `fadeUp` variant
- Timing controlled by parent container

---

### HeroContent

Container for hero section content with staggered entrance.

```tsx
interface HeroContentProps {
  children: ReactNode;
  className?: string;
}
```

**Example:**
```tsx
<HeroContent>
  <HeroItem>Eyebrow</HeroItem>
  <HeroItem>Main Headline</HeroItem>
  <HeroItem>Description</HeroItem>
  <HeroItem>CTA Buttons</HeroItem>
</HeroContent>
```

**Animation Details:**
- Stagger delay: 0.15s
- Initial delay: 0.2s
- Triggers on page load (not scroll)

---

### HeroItem

Child item within HeroContent.

```tsx
interface HeroItemProps {
  children: ReactNode;
  className?: string;
}
```

**Animation Details:**
- Initial: `opacity: 0, y: 40`
- Final: `opacity: 1, y: 0`
- Duration: 0.8s
- Easing: `[0.22, 1, 0.36, 1]`

---

### HeroImage

Hero image with entrance animation.

```tsx
interface HeroImageProps {
  children: ReactNode;
  className?: string;
}
```

**Example:**
```tsx
<HeroImage>
  <img src={heroImage} alt="Hero product" />
</HeroImage>
```

**Animation Details:**
- Initial: `opacity: 0, scale: 0.85, y: 20`
- Final: `opacity: 1, scale: 1, y: 0`
- Duration: 1s
- Easing: `[0.22, 1, 0.36, 1]`

---

### HoverScale

Scales element on hover.

```tsx
interface HoverScaleProps {
  children: ReactNode;
  className?: string;
  scale?: number;      // Default: 1.02
}
```

**Example:**
```tsx
<HoverScale scale={1.05}>
  <Card>Scales up on hover</Card>
</HoverScale>
```

**Animation Details:**
- Hover: scales to specified value
- Tap: scales to 0.98
- Duration: 0.2s

---

### HoverLift

Lifts element up on hover.

```tsx
interface HoverLiftProps {
  children: ReactNode;
  className?: string;
  lift?: number;       // Default: -4 (negative = up)
}
```

**Example:**
```tsx
<HoverLift lift={-8}>
  <ProductCard product={product} />
</HoverLift>
```

**Animation Details:**
- Hover: translates Y by specified pixels
- Duration: 0.2s

---

### GlowPulse

Creates pulsing glow effect for decorative elements.

```tsx
interface GlowPulseProps {
  children?: ReactNode;
  className?: string;
}
```

**Example:**
```tsx
<div className="relative">
  <GlowPulse className="absolute inset-0 bg-accent/20 blur-3xl rounded-full" />
  <img src={product} className="relative" />
</div>
```

**Animation Details:**
- Opacity: oscillates between 0.2 and 0.4
- Scale: oscillates between 0.75 and 0.85
- Duration: 4s
- Loops infinitely

---

### Float

Creates floating animation for decorative elements.

```tsx
interface FloatProps {
  children: ReactNode;
  className?: string;
  duration?: number;   // Default: 6
  distance?: number;   // Default: 10
}
```

**Example:**
```tsx
<Float duration={5} distance={8}>
  <img src={floatingElement} />
</Float>
```

---

## Animation Variants

Pre-defined animation variants for direct use with `motion` components.

### fadeUp

```tsx
import {fadeUp} from '~/components/ui/Animations';

<motion.div variants={fadeUp}>Content</motion.div>
```

### fadeIn

```tsx
import {fadeIn} from '~/components/ui/Animations';

<motion.div variants={fadeIn}>Content</motion.div>
```

### scaleUp

```tsx
import {scaleUp} from '~/components/ui/Animations';

<motion.div variants={scaleUp}>Content</motion.div>
```

### slideInLeft / slideInRight

```tsx
import {slideInLeft, slideInRight} from '~/components/ui/Animations';

<motion.div variants={slideInLeft}>From left</motion.div>
<motion.div variants={slideInRight}>From right</motion.div>
```

### staggerContainer / fastStaggerContainer

```tsx
import {staggerContainer, fastStaggerContainer} from '~/components/ui/Animations';

<motion.div variants={staggerContainer}>
  <motion.div variants={fadeUp}>Item 1</motion.div>
  <motion.div variants={fadeUp}>Item 2</motion.div>
</motion.div>
```

### heroTextVariants / heroImageVariants

```tsx
import {heroTextVariants, heroImageVariants} from '~/components/ui/Animations';

<motion.div variants={heroTextVariants}>Hero text</motion.div>
<motion.div variants={heroImageVariants}>Hero image</motion.div>
```

### floatAnimation / glowPulse

```tsx
import {floatAnimation, glowPulse} from '~/components/ui/Animations';

<motion.div 
  variants={floatAnimation}
  initial="initial"
  animate="animate"
>
  Floating element
</motion.div>
```

---

## Direct Motion API

### Basic Animation

```tsx
<motion.div
  initial={{opacity: 0, y: 20}}
  animate={{opacity: 1, y: 0}}
  transition={{duration: 0.5}}
>
  Content
</motion.div>
```

### Scroll-Triggered Animation

```tsx
<motion.div
  initial={{opacity: 0}}
  whileInView={{opacity: 1}}
  viewport={{once: true, margin: '-50px'}}
>
  Content
</motion.div>
```

### Hover/Tap Interactions

```tsx
<motion.button
  whileHover={{scale: 1.05}}
  whileTap={{scale: 0.95}}
  transition={{duration: 0.2}}
>
  Button
</motion.button>
```

### Infinite Animations

```tsx
<motion.div
  animate={{
    y: [-10, 10, -10],
    rotate: [0, 5, 0, -5, 0],
  }}
  transition={{
    duration: 4,
    repeat: Infinity,
    ease: 'easeInOut',
  }}
>
  Floating element
</motion.div>
```

### Spring Physics

```tsx
<motion.div
  animate={{scale: 1}}
  initial={{scale: 0}}
  transition={{
    type: 'spring',
    stiffness: 200,
    damping: 20,
  }}
>
  Bouncy entrance
</motion.div>
```

---

## Viewport Options

```tsx
<motion.div
  whileInView={{opacity: 1}}
  viewport={{
    once: true,        // Only animate once
    margin: '-50px',   // Trigger 50px before entering
    amount: 0.5,       // Trigger when 50% visible
    root: containerRef // Custom scroll container
  }}
>
  Content
</motion.div>
```

---

## Transition Options

```tsx
<motion.div
  transition={{
    duration: 0.6,              // Animation duration
    delay: 0.2,                 // Start delay
    ease: [0.22, 1, 0.36, 1],   // Custom cubic bezier
    ease: 'easeOut',            // Named easing
    type: 'spring',             // Spring physics
    stiffness: 200,             // Spring stiffness
    damping: 20,                // Spring damping
    mass: 1,                    // Spring mass
    repeat: Infinity,           // Loop count
    repeatType: 'reverse',      // How to repeat
    repeatDelay: 1,             // Delay between loops
  }}
>
  Content
</motion.div>
```

---

## useReducedMotion Hook

```tsx
import {useReducedMotion} from 'framer-motion';

function MyComponent() {
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <motion.div
      animate={shouldReduceMotion ? {} : {y: [-5, 5, -5]}}
      transition={shouldReduceMotion ? {} : {
        duration: 3,
        repeat: Infinity,
      }}
    >
      Content
    </motion.div>
  );
}
```

---

## Complete Landing Page Example

```tsx
import {
  FadeUp,
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

export default function LandingPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-primary">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <HeroContent>
            <HeroItem>
              <span className="eyebrow">Eyebrow</span>
            </HeroItem>
            <HeroItem>
              <h1>Main Headline</h1>
            </HeroItem>
            <HeroItem>
              <p>Description</p>
            </HeroItem>
            <HeroItem>
              <motion.button whileHover={{scale: 1.02}} whileTap={{scale: 0.98}}>
                CTA Button
              </motion.button>
            </HeroItem>
          </HeroContent>
          
          <HeroImage>
            <div className="relative">
              <GlowPulse className="absolute inset-0 bg-accent/20 blur-3xl" />
              <motion.img
                src={heroImage}
                animate={{y: [-5, 5, -5]}}
                transition={{duration: 6, repeat: Infinity}}
              />
            </div>
          </HeroImage>
        </div>
      </section>

      {/* Features Section */}
      <section>
        <FadeUp className="text-center mb-16">
          <span className="eyebrow">Features</span>
          <h2>Section Title</h2>
        </FadeUp>
        
        <StaggerContainer className="grid md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <StaggerItem key={feature.id}>
              <HoverLift lift={-6}>
                <FeatureCard feature={feature} />
              </HoverLift>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* Two Column Section */}
      <section>
        <div className="grid lg:grid-cols-2 gap-12">
          <SlideIn direction="left">
            <img src={image} alt="Description" />
          </SlideIn>
          <SlideIn direction="right">
            <div>
              <h2>Content</h2>
              <p>Description</p>
            </div>
          </SlideIn>
        </div>
      </section>

      {/* CTA Section */}
      <section>
        <ScaleIn>
          <div className="bg-primary rounded-3xl p-16 text-center relative">
            <motion.div 
              className="absolute bg-accent/10 rounded-full blur-3xl"
              animate={{scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1]}}
              transition={{duration: 6, repeat: Infinity}}
            />
            <FadeUp className="relative z-10">
              <h2>CTA Headline</h2>
              <motion.button whileHover={{scale: 1.05}}>
                Action
              </motion.button>
            </FadeUp>
          </div>
        </ScaleIn>
      </section>
    </div>
  );
}
```

---

## Troubleshooting

### Animation not triggering
- Check `viewport` margin setting
- Ensure parent has proper height
- Verify component is in DOM

### Jank/stuttering
- Use `transform` properties only
- Avoid animating `width`, `height`, `margin`
- Check for layout thrashing

### SSR hydration mismatch
- Add `'use client'` directive
- Use `suppressHydrationWarning` if needed

### Accessibility issues
- Always wrap in `useReducedMotion` check
- Test with "Reduce motion" system setting

---

## Related Documentation

- [Framer Motion Docs](https://www.framer.com/motion/)
- [React Animation Patterns](https://www.framer.com/motion/animation/)
- [Accessibility Guidelines](https://www.framer.com/motion/accessibility/)
