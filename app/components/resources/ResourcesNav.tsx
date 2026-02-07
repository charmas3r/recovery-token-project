/**
 * ResourcesNav - Pill-style navigation between resource pages
 */

import {Link, useLocation} from 'react-router';
import {clsx} from 'clsx';

const RESOURCE_LINKS = [
  {label: 'Glossary', href: '/resources/glossary'},
  {label: 'Milestone Calculator', href: '/resources/milestone-calculator'},
  {label: 'Articles', href: '/resources/articles'},
];

export function ResourcesNav() {
  const location = useLocation();

  return (
    <nav aria-label="Resources" className="flex flex-wrap gap-2">
      {RESOURCE_LINKS.map((link) => {
        const isActive = location.pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            to={link.href}
            className={clsx(
              'inline-flex items-center px-4 py-2 rounded-full text-body-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-accent text-white shadow-sm'
                : 'bg-surface text-secondary hover:bg-surface/80 hover:text-primary',
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
