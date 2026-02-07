/**
 * ArticleCard - Card component for article listings
 *
 * Matches GlossaryTermCard styling (rounded-2xl, shadow-sm, border).
 * Used on the articles hub page and related articles sections.
 */

import {Link} from 'react-router';
import {ArrowRight, Clock} from 'lucide-react';
import {Badge} from '~/components/ui/Badge';
import type {Article} from '~/data/articles';

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({article}: ArticleCardProps) {
  return (
    <Link
      to={`/resources/articles/${article.slug}`}
      className="block bg-white rounded-2xl p-6 shadow-sm border border-black/5 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 group"
    >
      <div className="flex items-center gap-3 mb-3">
        <Badge variant="new">{article.category}</Badge>
        <span className="flex items-center gap-1 text-caption text-secondary">
          <Clock className="w-3.5 h-3.5" />
          {article.readTime} min read
        </span>
      </div>

      <h3 className="font-display text-lg font-bold text-primary mb-2 line-clamp-2 group-hover:text-accent transition-colors">
        {article.title}
      </h3>

      <p className="text-body text-secondary leading-relaxed mb-4 line-clamp-3">
        {article.excerpt}
      </p>

      <span className="inline-flex items-center gap-1.5 text-body-sm font-medium text-accent group-hover:text-accent/80 transition-colors">
        Read article
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
