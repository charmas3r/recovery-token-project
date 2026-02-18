/**
 * ArticleCard - Card component for article listings
 *
 * Dark theme card with gradient background and subtle borders.
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
      className="block rounded-2xl p-6 border border-white/[0.08] transition-all duration-200 hover:border-white/[0.15] hover:-translate-y-1 group"
      style={{background: 'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)'}}
    >
      <div className="flex items-center gap-3 mb-3">
        <Badge variant="new">{article.category}</Badge>
        <span className="flex items-center gap-1 text-caption text-white/40">
          <Clock className="w-3.5 h-3.5" />
          {article.readTime} min read
        </span>
      </div>

      <h3 className="font-display text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-accent transition-colors">
        {article.title}
      </h3>

      <p className="text-body text-white/50 leading-relaxed mb-4 line-clamp-3">
        {article.excerpt}
      </p>

      <span className="inline-flex items-center gap-1.5 text-body-sm font-medium text-accent group-hover:text-accent/80 transition-colors">
        Read article
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
