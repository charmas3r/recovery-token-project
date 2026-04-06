/**
 * SEOMilestoneNav
 *
 * Prev/next milestone navigation for SEO landing pages.
 * Accepts optional slugs and resolves page metadata for display.
 */

import {Link} from 'react-router';
import {ChevronLeft, ChevronRight} from 'lucide-react';
import {getSEOPage} from '~/data/seo-pages';

interface SEOMilestoneNavProps {
  prevSlug?: string;
  nextSlug?: string;
  className?: string;
}

export function SEOMilestoneNav({
  prevSlug,
  nextSlug,
  className = '',
}: SEOMilestoneNavProps) {
  const prev = prevSlug ? getSEOPage(prevSlug) : undefined;
  const next = nextSlug ? getSEOPage(nextSlug) : undefined;

  if (!prev && !next) return null;

  return (
    <nav
      aria-label="Milestone navigation"
      className={`flex items-center justify-between gap-4 py-8 border-t border-white/[0.08] ${className}`}
    >
      {prev ? (
        <Link
          to={`/${prev.canonicalPath}`}
          prefetch="intent"
          className="flex items-center gap-2 text-white/50 hover:text-accent transition-colors group"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <div>
            <span className="text-xs uppercase tracking-wider block">
              Previous
            </span>
            <span className="text-white font-medium">{prev.title}</span>
          </div>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link
          to={`/${next.canonicalPath}`}
          prefetch="intent"
          className="flex items-center gap-2 text-white/50 hover:text-accent transition-colors text-right group"
        >
          <div>
            <span className="text-xs uppercase tracking-wider block">
              Next
            </span>
            <span className="text-white font-medium">{next.title}</span>
          </div>
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      ) : (
        <div />
      )}
    </nav>
  );
}
