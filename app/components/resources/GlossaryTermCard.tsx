/**
 * GlossaryTermCard - Individual term card with name, category badge, definition
 */

import {Link} from 'react-router';
import {ArrowRight} from 'lucide-react';
import {Badge} from '~/components/ui/Badge';
import type {GlossaryTerm} from '~/data/glossary-terms';

interface GlossaryTermCardProps {
  term: GlossaryTerm;
}

export function GlossaryTermCard({term}: GlossaryTermCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-black/5 transition-shadow duration-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-4 mb-3">
        <h3
          id={`term-${term.slug}`}
          className="font-display text-lg font-bold text-primary"
        >
          {term.name}
        </h3>
        <Badge variant="neutral" className="shrink-0">
          {term.category}
        </Badge>
      </div>

      <p className="text-body text-secondary leading-relaxed mb-4">
        {term.definition}
      </p>

      {term.productLink && (
        <Link
          to={term.productLink.href}
          className="inline-flex items-center gap-1.5 text-body-sm font-medium text-accent hover:text-accent/80 transition-colors group"
        >
          {term.productLink.label}
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
