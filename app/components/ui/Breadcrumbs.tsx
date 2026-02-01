/**
 * Breadcrumbs Component - Design System
 * 
 * Navigation breadcrumbs following Recovery Token Store design patterns
 * @see .cursor/skills/design-system/SKILL.md
 */

import {Link} from 'react-router';
import {ChevronRight} from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({items, className = ''}: BreadcrumbsProps) {
  return (
    <nav 
      aria-label="Breadcrumb" 
      className={`flex items-center gap-2 text-body-sm ${className}`}
    >
      <Link 
        to="/" 
        className="text-secondary hover:text-accent transition-colors"
      >
        Home
      </Link>
      
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-secondary/50" />
          {item.href ? (
            <Link 
              to={item.href} 
              className="text-secondary hover:text-accent transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-primary font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
