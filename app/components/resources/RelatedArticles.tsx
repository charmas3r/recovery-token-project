/**
 * RelatedArticles - Grid of 3 related article cards
 *
 * Shown at the bottom of individual article pages to encourage
 * further reading and improve internal linking.
 */

import {ArticleCard} from '~/components/resources/ArticleCard';
import {
  StaggerContainer,
  StaggerItem,
} from '~/components/ui/Animations';
import type {Article} from '~/data/articles';

interface RelatedArticlesProps {
  articles: Article[];
}

export function RelatedArticles({articles}: RelatedArticlesProps) {
  if (articles.length === 0) return null;

  return (
    <section className="py-16 md:py-20 bg-surface">
      <div className="container-standard">
        <div
          style={{
            textAlign: 'center',
            maxWidth: '42rem',
            marginLeft: 'auto',
            marginRight: 'auto',
            marginBottom: '2.5rem',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              color: '#B8764F',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.25em',
              fontWeight: 600,
              marginBottom: '1rem',
            }}
          >
            Keep Reading
          </span>
          <h2
            style={{
              fontFamily: 'var(--font-display, serif)',
              fontSize: '1.75rem',
              fontWeight: 700,
              color: '#1A202C',
              lineHeight: 1.3,
            }}
          >
            Related Articles
          </h2>
        </div>

        <StaggerContainer
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          staggerDelay={0.1}
        >
          {articles.slice(0, 3).map((article) => (
            <StaggerItem key={article.id}>
              <ArticleCard article={article} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
