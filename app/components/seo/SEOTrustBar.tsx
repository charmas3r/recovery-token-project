/**
 * SEOTrustBar
 *
 * Horizontal trust indicators bar shown on SEO landing pages.
 * Communicates quality, shipping, and satisfaction guarantees.
 */

import {Shield, Truck, Star} from 'lucide-react';

interface SEOTrustBarProps {
  className?: string;
}

export function SEOTrustBar({className = ''}: SEOTrustBarProps) {
  const items = [
    {icon: Star, label: 'Handcrafted Quality'},
    {icon: Truck, label: 'Free Shipping'},
    {icon: Shield, label: 'Satisfaction Guaranteed'},
  ];

  return (
    <div
      className={`flex flex-wrap items-center justify-center gap-8 py-6 border-y border-white/[0.08] ${className}`}
    >
      {items.map(({icon: Icon, label}) => (
        <div key={label} className="flex items-center gap-2 text-white/50">
          <Icon className="w-5 h-5 text-accent" />
          <span className="text-sm font-medium">{label}</span>
        </div>
      ))}
    </div>
  );
}
