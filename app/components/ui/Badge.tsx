/**
 * Badge Component - Design System
 * 
 * Follows Recovery Token Store design system specifications
 * @see .cursor/skills/design-system/SKILL.md
 * @see prd.md Section 3
 */

import {clsx} from 'clsx';
import type {ReactNode} from 'react';

type BadgeVariant = 'new' | 'sale' | 'in-stock' | 'low-stock' | 'neutral' | 'success' | 'warning' | 'error';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({children, variant = 'neutral', className}: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-3 py-1 rounded-full',
        'text-caption font-medium',
        {
          'bg-accent/10 text-accent': variant === 'new',
          'bg-error/10 text-error': variant === 'sale',
          'bg-success/10 text-success': variant === 'in-stock' || variant === 'success',
          'bg-warning/10 text-warning': variant === 'low-stock' || variant === 'warning',
          'bg-surface text-secondary': variant === 'neutral',
        },
        className,
      )}
    >
      {children}
    </span>
  );
}
