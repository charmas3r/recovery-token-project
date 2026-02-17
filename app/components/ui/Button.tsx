/**
 * Button Component - Design System
 * 
 * Follows Recovery Token Store design system specifications
 * Elevated card appearance with subtle border
 * @see .cursor/skills/design-system/SKILL.md
 * @see prd.md Section 3
 */

import {clsx} from 'clsx';
import type {ComponentPropsWithoutRef, ElementType, ReactNode} from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonBaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  className?: string;
}

type ButtonProps<T extends ElementType = 'button'> = ButtonBaseProps & {
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, keyof ButtonBaseProps | 'as'>;

export function Button<T extends ElementType = 'button'>({
  variant = 'primary',
  size = 'md',
  as,
  className,
  children,
  ...props
}: ButtonProps<T>) {
  const Component = as || 'button';

  return (
    <Component
      className={clsx(
        // Base styles - Dark minimalist
        'inline-flex items-center justify-center',
        'font-semibold rounded-xl',
        'transition-all duration-200',
        'disabled:opacity-40 disabled:cursor-not-allowed',

        // Focus state (design system required)
        'focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-black',

        // Variants — Dark theme (Resend-inspired)
        {
          // Primary - Dark pill with subtle border glow
          'bg-white/[0.1] text-white border border-white/[0.15] hover:bg-white/[0.15] hover:border-white/[0.25] active:bg-white/[0.08]':
            variant === 'primary',

          // Secondary - Plain text, no background, no border (matches body text)
          'bg-transparent text-white/[0.45] border border-transparent hover:text-white/70':
            variant === 'secondary',

          // Tertiary - Transparent, white/50 text
          'bg-transparent text-white/50 border border-transparent hover:text-white/80':
            variant === 'tertiary',

          // Destructive - Error color with subtle border
          'bg-error text-white border border-error/80 hover:bg-error/90 active:bg-error/80':
            variant === 'destructive',
        },
        
        // Sizes (minimum 44px touch target for md/lg)
        {
          'px-4 py-2 text-sm h-9': size === 'sm',          // 36px height
          'px-6 py-3 text-base h-11': size === 'md',       // 44px height (touch target)
          'px-8 py-4 text-lg h-12': size === 'lg',         // 48px height
        },
        
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
