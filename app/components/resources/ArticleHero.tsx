/**
 * ArticleHero - Article header with breadcrumbs, nav, title, and meta
 *
 * Follows the same header pattern as the glossary page:
 * bg-surface, Breadcrumbs, ResourcesNav, centered title with inline styles.
 */

import {Calendar, Clock} from 'lucide-react';
import {Breadcrumbs} from '~/components/ui/Breadcrumbs';
import {Badge} from '~/components/ui/Badge';
import {ResourcesNav} from '~/components/resources/ResourcesNav';
import type {Article} from '~/data/articles';

interface ArticleHeroProps {
  article: Article;
}

export function ArticleHero({article}: ArticleHeroProps) {
  const publishDate = new Date(article.publishedAt).toLocaleDateString(
    'en-US',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    },
  );

  return (
    <section className="bg-surface py-12 md:py-16">
      <div className="container-standard">
        <Breadcrumbs
          items={[
            {label: 'Resources', href: '/resources'},
            {label: 'Articles', href: '/resources/articles'},
            {label: article.title},
          ]}
          className="mb-6"
        />

        <ResourcesNav />

        <div
          style={{
            marginTop: '2.5rem',
            maxWidth: '42rem',
            marginLeft: 'auto',
            marginRight: 'auto',
            textAlign: 'center',
          }}
        >
          <div style={{marginBottom: '1rem'}}>
            <Badge variant="new">{article.category}</Badge>
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-display, serif)',
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 700,
              color: '#1A202C',
              lineHeight: 1.1,
              marginBottom: '1rem',
            }}
          >
            {article.title}
          </h1>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1.5rem',
              fontSize: '0.875rem',
              color: '#4A5568',
            }}
          >
            <span
              style={{display: 'flex', alignItems: 'center', gap: '0.375rem'}}
            >
              <Calendar size={16} />
              {publishDate}
            </span>
            <span
              style={{display: 'flex', alignItems: 'center', gap: '0.375rem'}}
            >
              <Clock size={16} />
              {article.readTime} min read
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
