/**
 * Card Component - Design System
 * 
 * Follows Recovery Token Store design system specifications
 * @see .cursor/skills/design-system/SKILL.md
 * @see prd.md Section 3
 */

import {clsx} from 'clsx';
import type {ReactNode} from 'react';

interface CardProps {
  children: ReactNode;
  hover?: boolean;
  className?: string;
}

export function Card({children, hover = false, className}: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-md overflow-hidden',
        'border border-white/[0.08]',
        hover && [
          'transition-all duration-300',
          'hover:border-white/[0.15] hover:-translate-y-1',
        ],
        className,
      )}
      style={{background: 'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)'}}
    >
      {/* Top-edge shine */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
      {children}
    </div>
  );
}

/**
 * Compound Components for Card Structure
 */

Card.Image = function CardImage({
  src,
  alt,
  aspectRatio = '4/5',
  className,
}: {
  src: string;
  alt: string;
  aspectRatio?: '4/5' | '16/9' | '1/1';
  className?: string;
}) {
  const aspectClasses = {
    '4/5': 'aspect-[4/5]',
    '16/9': 'aspect-video',
    '1/1': 'aspect-square',
  };

  return (
    <div
      className={clsx(
        aspectClasses[aspectRatio],
        'bg-black/40 relative overflow-hidden',
        className,
      )}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-400 hover:scale-105"
        loading="lazy"
      />
    </div>
  );
};

Card.Content = function CardContent({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx('p-4 space-y-2', className)}>
      {children}
    </div>
  );
};

Card.Title = function CardTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h3 className={clsx('text-subsection text-white line-clamp-2', className)}>
      {children}
    </h3>
  );
};

Card.Description = function CardDescription({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={clsx('text-body-sm text-white/50 line-clamp-2', className)}>
      {children}
    </p>
  );
};

Card.Price = function CardPrice({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={clsx('text-body-lg font-bold text-accent', className)}>
      {children}
    </p>
  );
};
