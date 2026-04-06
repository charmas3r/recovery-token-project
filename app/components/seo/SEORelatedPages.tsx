/**
 * SEORelatedPages
 *
 * Grid of internal link cards to other SEO pages. Accepts an array of
 * page slugs and resolves them via getSEOPage for display.
 */

import {Link} from 'react-router';
import {getSEOPage} from '~/data/seo-pages';

interface SEORelatedPagesProps {
  slugs: string[];
  className?: string;
}

export function SEORelatedPages({slugs, className = ''}: SEORelatedPagesProps) {
  const pages = slugs
    .map((slug) => getSEOPage(slug))
    .filter(Boolean);

  if (pages.length === 0) return null;

  return (
    <section className={className}>
      <h2
        className="font-display text-subsection text-white mb-8"
        style={{textAlign: 'center'}}
      >
        Related Pages
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {pages.map((page) => (
          <Link
            key={page!.slug}
            to={`/${page!.canonicalPath}`}
            prefetch="intent"
            className="group block rounded-2xl border border-white/[0.08] hover:border-white/[0.15] p-6 transition-all duration-300 hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            style={{
              background:
                'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)',
            }}
          >
            <span className="inline-block text-accent text-caption uppercase tracking-[0.25em] font-semibold mb-2">
              {page!.eyebrow}
            </span>
            <h3 className="text-white font-bold text-lg mb-2 group-hover:text-accent transition-colors">
              {page!.title}
            </h3>
            <p className="text-white/50 text-sm line-clamp-2">
              {page!.heroDescription}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
