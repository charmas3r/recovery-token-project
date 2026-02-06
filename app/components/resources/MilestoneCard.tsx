/**
 * MilestoneCard - Card for achieved/upcoming milestones
 */

import {Link} from 'react-router';
import {ArrowRight} from 'lucide-react';
import type {MilestoneDefinition} from '~/data/milestones';

interface MilestoneCardProps {
  emoji: string;
  label: string;
  description: string;
  dateLabel: string;
  shopLink?: MilestoneDefinition['shopLink'];
  variant?: 'achieved' | 'next';
}

export function MilestoneCard({
  emoji,
  label,
  description,
  dateLabel,
  shopLink,
  variant = 'achieved',
}: MilestoneCardProps) {
  const isNext = variant === 'next';

  return (
    <div
      className={`rounded-2xl p-6 transition-shadow duration-200 hover:shadow-md ${
        isNext
          ? 'bg-accent/5 border-2 border-accent shadow-sm'
          : 'bg-white border border-black/5 shadow-sm'
      }`}
    >
      <div className="flex items-start gap-4">
        <span className="text-3xl shrink-0" role="img" aria-hidden="true">
          {emoji}
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-lg font-bold text-primary">
            {label}
          </h3>
          <p className="text-body-sm text-secondary mt-1">{description}</p>
          <p
            className={`text-body-sm font-medium mt-2 ${
              isNext ? 'text-accent' : 'text-secondary/70'
            }`}
          >
            {dateLabel}
          </p>
          {shopLink && (
            <Link
              to={shopLink.href}
              className="inline-flex items-center gap-1.5 text-body-sm font-medium text-accent hover:text-accent/80 transition-colors mt-3 group"
            >
              {shopLink.label}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
