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
        // Base styles - Elevated card appearance
        'inline-flex items-center justify-center',
        'font-semibold rounded-lg',
        'transition-all duration-200',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        
        // Elevated card shadow effect
        'shadow-[0_2px_8px_rgba(0,0,0,0.08)]',
        'hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)]',
        'active:shadow-[0_1px_4px_rgba(0,0,0,0.08)]',
        
        // Focus state (design system required)
        'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2',
        
        // Variants (per design system)
        {
          // Primary - Accent background, white text, subtle border
          'bg-accent text-white border border-accent/80 hover:bg-accent/90 hover:-translate-y-0.5 active:translate-y-0':
            variant === 'primary',
          
          // Secondary - White background, subtle border, primary text
          'bg-white text-primary border border-black/10 hover:border-black/20 hover:-translate-y-0.5 active:translate-y-0':
            variant === 'secondary',
          
          // Tertiary - Transparent with subtle border on hover
          'bg-transparent text-primary border border-transparent hover:border-black/10 hover:bg-white/50':
            variant === 'tertiary',
          
          // Destructive - Error color with subtle border
          'bg-error text-white border border-error/80 hover:bg-error/90 hover:-translate-y-0.5 active:translate-y-0':
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
