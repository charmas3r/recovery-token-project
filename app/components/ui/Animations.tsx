'use client';

import {
  motion,
  useReducedMotion,
  type Variants,
} from 'framer-motion';
import {type ReactNode} from 'react';

/**
 * Animation Variants - Reusable animation presets
 */

// Fade up animation for scroll reveal
export const fadeUp: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1], // Custom ease out
    },
  },
};

// Fade in animation (no movement)
export const fadeIn: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

// Scale up animation
export const scaleUp: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

// Slide in from left
export const slideInLeft: Variants = {
  hidden: {
    opacity: 0,
    x: -40,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

// Slide in from right
export const slideInRight: Variants = {
  hidden: {
    opacity: 0,
    x: 40,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

// Container for staggered children
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

// Fast stagger for lists
export const fastStaggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};

// Hero animation variants
export const heroTextVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 40,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export const heroImageVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.85,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 1,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

// Float animation for decorative elements
export const floatAnimation: Variants = {
  initial: {y: 0},
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Glow pulse animation
export const glowPulse: Variants = {
  initial: {opacity: 0.2, scale: 0.75},
  animate: {
    opacity: [0.2, 0.4, 0.2],
    scale: [0.75, 0.85, 0.75],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

/**
 * Animation Components
 */

interface MotionWrapperProps {
  children: ReactNode;
  className?: string;
  variants?: Variants;
  delay?: number;
  once?: boolean;
}

/**
 * FadeUp - Fade up animation on scroll
 */
export function FadeUp({
  children,
  className = '',
  delay = 0,
  once = true,
}: MotionWrapperProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{once, margin: '-50px'}}
      variants={{
        hidden: {opacity: 0, y: 30},
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.6,
            delay,
            ease: [0.22, 1, 0.36, 1],
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * FadeIn - Simple fade animation on scroll
 */
export function FadeIn({
  children,
  className = '',
  delay = 0,
  once = true,
}: MotionWrapperProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{once, margin: '-50px'}}
      variants={{
        hidden: {opacity: 0},
        visible: {
          opacity: 1,
          transition: {
            duration: 0.5,
            delay,
            ease: 'easeOut',
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * SlideIn - Slide in from direction
 */
export function SlideIn({
  children,
  className = '',
  delay = 0,
  once = true,
  direction = 'left',
}: MotionWrapperProps & {direction?: 'left' | 'right' | 'up' | 'down'}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const directionMap = {
    left: {x: -40, y: 0},
    right: {x: 40, y: 0},
    up: {x: 0, y: 40},
    down: {x: 0, y: -40},
  };

  const offset = directionMap[direction];

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{once, margin: '-50px'}}
      variants={{
        hidden: {opacity: 0, ...offset},
        visible: {
          opacity: 1,
          x: 0,
          y: 0,
          transition: {
            duration: 0.6,
            delay,
            ease: [0.22, 1, 0.36, 1],
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * ScaleIn - Scale up animation
 */
export function ScaleIn({
  children,
  className = '',
  delay = 0,
  once = true,
}: MotionWrapperProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{once, margin: '-50px'}}
      variants={{
        hidden: {opacity: 0, scale: 0.9},
        visible: {
          opacity: 1,
          scale: 1,
          transition: {
            duration: 0.5,
            delay,
            ease: [0.22, 1, 0.36, 1],
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * StaggerContainer - Container for staggered children animations
 */
export function StaggerContainer({
  children,
  className = '',
  staggerDelay = 0.1,
  initialDelay = 0.1,
  once = true,
}: MotionWrapperProps & {staggerDelay?: number; initialDelay?: number}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{once, margin: '-50px'}}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: initialDelay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * StaggerItem - Item within a stagger container
 */
export function StaggerItem({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div className={className} variants={fadeUp}>
      {children}
    </motion.div>
  );
}

/**
 * HeroContent - Optimized hero content animation
 */
export function HeroContent({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.15,
            delayChildren: 0.2,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * HeroItem - Item within hero content
 */
export function HeroItem({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div className={className} variants={heroTextVariants}>
      {children}
    </motion.div>
  );
}

/**
 * HeroImage - Hero image with entrance animation
 */
export function HeroImage({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={heroImageVariants}
    >
      {children}
    </motion.div>
  );
}

/**
 * Float - Floating animation for decorative elements
 */
export function Float({
  children,
  className = '',
  duration = 6,
  distance = 10,
}: {
  children: ReactNode;
  className?: string;
  duration?: number;
  distance?: number;
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      animate={{
        y: [-distance, distance, -distance],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * GlowPulse - Pulsing glow effect
 */
export function GlowPulse({
  children,
  className = '',
}: {
  children?: ReactNode;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      animate={{
        opacity: [0.2, 0.4, 0.2],
        scale: [0.75, 0.85, 0.75],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * HoverScale - Scale on hover
 */
export function HoverScale({
  children,
  className = '',
  scale = 1.02,
}: {
  children: ReactNode;
  className?: string;
  scale?: number;
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      whileHover={{scale}}
      whileTap={{scale: 0.98}}
      transition={{duration: 0.2}}
    >
      {children}
    </motion.div>
  );
}

/**
 * HoverLift - Lift up on hover
 */
export function HoverLift({
  children,
  className = '',
  lift = -4,
}: {
  children: ReactNode;
  className?: string;
  lift?: number;
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      whileHover={{y: lift}}
      transition={{duration: 0.2}}
    >
      {children}
    </motion.div>
  );
}

/**
 * CountUp - Animated number counter
 */
export function CountUp({
  end,
  duration = 2,
  suffix = '',
  className = '',
}: {
  end: number;
  duration?: number;
  suffix?: string;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <span className={className}>
        {end}
        {suffix}
      </span>
    );
  }

  return (
    <motion.span
      className={className}
      initial={{opacity: 0}}
      whileInView={{opacity: 1}}
      viewport={{once: true}}
    >
      <motion.span
        initial={{opacity: 0}}
        whileInView={{opacity: 1}}
        viewport={{once: true}}
        onViewportEnter={(entry) => {
          const target = entry?.target as HTMLElement;
          if (target) {
            let start = 0;
            const endValue = end;
            const incrementTime = (duration * 1000) / endValue;

            const timer = setInterval(() => {
              start += 1;
              target.textContent = `${Math.min(start, endValue)}${suffix}`;
              if (start >= endValue) {
                clearInterval(timer);
              }
            }, incrementTime);
          }
        }}
      >
        0{suffix}
      </motion.span>
    </motion.span>
  );
}

/**
 * ParallaxScroll - Subtle parallax effect on scroll
 */
export function ParallaxScroll({
  children,
  className = '',
  offset = 50,
}: {
  children: ReactNode;
  className?: string;
  offset?: number;
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{y: offset}}
      whileInView={{y: 0}}
      viewport={{once: false}}
      transition={{
        duration: 0.8,
        ease: 'easeOut',
      }}
    >
      {children}
    </motion.div>
  );
}

// Export motion for direct use
export {motion};
