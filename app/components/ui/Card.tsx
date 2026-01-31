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
        'bg-white rounded-md overflow-hidden',
        'border border-surface-dark/10',
        hover && [
          'transition-all duration-300',
          'hover:shadow-lg hover:-translate-y-1',
        ],
        className,
      )}
    >
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
        'bg-surface relative overflow-hidden',
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
    <h3 className={clsx('text-subsection text-primary line-clamp-2', className)}>
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
    <p className={clsx('text-body-sm text-secondary line-clamp-2', className)}>
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
