/**
 * TrustBadges Component - Design System
 * 
 * Trust indicators for product pages
 * @see .cursor/skills/design-system/SKILL.md
 */

import {Truck, ShieldCheck, RefreshCw, Award} from 'lucide-react';

interface TrustBadge {
  icon: React.ReactNode;
  label: string;
}

const badges: TrustBadge[] = [
  {icon: <Truck className="w-5 h-5" />, label: 'Free shipping over $50'},
  {icon: <ShieldCheck className="w-5 h-5" />, label: 'Secure checkout'},
  {icon: <RefreshCw className="w-5 h-5" />, label: '30-day returns'},
  {icon: <Award className="w-5 h-5" />, label: 'Premium quality'},
];

export function TrustBadges({className = ''}: {className?: string}) {
  return (
    <div className={`grid grid-cols-2 gap-3 ${className}`}>
      {badges.map((badge) => (
        <div
          key={badge.label}
          className="flex items-center gap-2 text-body-sm text-secondary"
        >
          <span className="text-accent">{badge.icon}</span>
          <span>{badge.label}</span>
        </div>
      ))}
    </div>
  );
}
