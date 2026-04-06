/**
 * GlossaryTermCard - Individual term card with name, category badge, definition
 */

import {Link} from 'react-router';
import {ArrowRight} from 'lucide-react';
import {Badge} from '~/components/ui/Badge';
import type {GlossaryTerm} from '~/data/glossary-terms';
import {getSEOPage} from '~/data/seo-pages';

interface GlossaryTermCardProps {
  term: GlossaryTerm;
}

export function GlossaryTermCard({term}: GlossaryTermCardProps) {
  const detailPage = getSEOPage(`resources/glossary/${term.slug}`);

  const cardContent = (
    <div className="rounded-2xl p-6 border border-white/[0.08] transition-colors duration-200 hover:border-white/[0.15]" style={{background: 'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)'}}>
      <div className="flex items-start justify-between gap-4 mb-3">
        <h3
          id={`term-${term.slug}`}
          className="font-display text-lg font-bold text-white"
        >
          {term.name}
        </h3>
        <Badge variant="neutral" className="shrink-0">
          {term.category}
        </Badge>
      </div>

      <p className="text-body text-white/50 leading-relaxed mb-4">
        {term.definition}
      </p>

      {detailPage ? (
        <span className="inline-flex items-center gap-1.5 text-body-sm font-medium text-accent">
          Read more →
        </span>
      ) : term.productLink ? (
        <Link
          to={term.productLink.href}
          className="inline-flex items-center gap-1.5 text-body-sm font-medium text-accent hover:text-accent/80 transition-colors group"
        >
          {term.productLink.label}
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      ) : null}
    </div>
  );

  if (detailPage) {
    return (
      <Link to={`/${detailPage.canonicalPath}`} className="block group hover:no-underline">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
