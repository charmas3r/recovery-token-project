/**
 * Articles Hub Page — /resources/articles
 *
 * Lists all articles as cards with category filter pills.
 * Supports ?category= URL param for deep linking (e.g. from Design Spotlights).
 */

import {useState, useMemo} from 'react';
import {useLoaderData, useSearchParams} from 'react-router';
import type {MetaFunction} from 'react-router';
import {Breadcrumbs} from '~/components/ui/Breadcrumbs';
import {JsonLd} from '~/components/seo/JsonLd';
import {ResourcesNav} from '~/components/resources/ResourcesNav';
import {ArticleCard} from '~/components/resources/ArticleCard';
import {Button} from '~/components/ui/Button';
import {Link} from 'react-router';
import {
  StaggerContainer,
  StaggerItem,
} from '~/components/ui/Animations';
import {getAllArticles} from '~/lib/sanity.queries';
import type {Article, ArticleCategory} from '~/data/articles';
import {ARTICLE_CATEGORIES} from '~/data/articles';
import {clsx} from 'clsx';

export const meta: MetaFunction = () => {
  return [
    {title: 'Recovery Token Articles — Recovery Token Store'},
    {
      name: 'description',
      content:
        'Explore articles about recovery token history, craftsmanship, symbolism, and traditions. Learn about AA chips, sobriety coins, and the heritage behind every token.',
    },
    {property: 'og:title', content: 'Recovery Token Articles — Recovery Token Store'},
    {property: 'og:description', content: 'Explore articles about recovery token history, craftsmanship, symbolism, and traditions.'},
    {property: 'og:type', content: 'website'},
    {name: 'twitter:card', content: 'summary_large_image'},
  ];
};

export async function loader() {
  return {
    articles: await getAllArticles(),
  };
}

const CATEGORY_HEADER: Record<
  ArticleCategory,
  {eyebrow: string; title: string; description: string}
> = {
  'Token Heritage': {
    eyebrow: 'Token Heritage',
    title: 'Heritage Articles',
    description:
      'Explore the history, craftsmanship, and symbolism behind recovery tokens. Each article deepens your connection to the tradition.',
  },
  'Recovery Guides': {
    eyebrow: 'Recovery Guides',
    title: 'Recovery Guides',
    description:
      'Practical guidance and insights to support your recovery journey, from milestone celebrations to daily practices.',
  },
  'Design Spotlight': {
    eyebrow: 'Design Spotlights',
    title: 'Inside Our Designs',
    description:
      'Deep dives into individual token designs — the history, meaning, symbolism, and craftsmanship behind each one.',
  },
};

const DEFAULT_HEADER = {
  eyebrow: 'Token Heritage',
  title: 'Articles',
  description:
    'Explore the history, craftsmanship, and symbolism behind recovery tokens. Each article deepens your connection to the tradition.',
};

export default function ArticlesHubPage() {
  const {articles} = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read initial category from URL
  const initialCategory = searchParams.get('category') as ArticleCategory | null;
  const [activeCategory, setActiveCategory] = useState<ArticleCategory | null>(
    initialCategory && ARTICLE_CATEGORIES.includes(initialCategory)
      ? initialCategory
      : null,
  );

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const cat of ARTICLE_CATEGORIES) {
      counts[cat] = (articles as Article[]).filter((a) => a.category === cat).length;
    }
    return counts;
  }, [articles]);

  // Filtered articles
  const filteredArticles = useMemo(() => {
    if (!activeCategory) return articles as Article[];
    return (articles as Article[]).filter((a) => a.category === activeCategory);
  }, [articles, activeCategory]);

  // Header content changes based on active category
  const header = activeCategory
    ? CATEGORY_HEADER[activeCategory]
    : DEFAULT_HEADER;

  function handleCategoryChange(category: ArticleCategory | null) {
    setActiveCategory(category);
    if (category) {
      setSearchParams({category}, {replace: true});
    } else {
      setSearchParams({}, {replace: true});
    }
  }

  const collectionPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Recovery Token Articles',
    description:
      'Articles about recovery token history, craftsmanship, symbolism, and traditions.',
    url: 'https://recoverytokenstore.com/resources/articles',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: (articles as Article[]).map((article, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `https://recoverytokenstore.com/resources/articles/${article.slug}`,
        name: article.title,
      })),
    },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://recoverytokenstore.com/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Resources',
        item: 'https://recoverytokenstore.com/resources',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Articles',
        item: 'https://recoverytokenstore.com/resources/articles',
      },
    ],
  };

  return (
    <div className="min-h-screen bg-white">
      <JsonLd data={collectionPageJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      {/* Header Section */}
      <section className="bg-surface py-12 md:py-16">
        <div className="container-standard">
          <Breadcrumbs
            items={[
              {label: 'Resources', href: '/resources'},
              {label: 'Articles'},
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
              {header.eyebrow}
            </span>
            <h1
              style={{
                fontFamily: 'var(--font-display, serif)',
                fontSize: '3rem',
                fontWeight: 700,
                color: '#1A202C',
                lineHeight: 1.1,
                marginBottom: '1rem',
              }}
            >
              {header.title}
            </h1>
            <p
              style={{
                fontSize: '1.125rem',
                lineHeight: 1.6,
                color: '#4A5568',
                maxWidth: '36rem',
                marginLeft: 'auto',
                marginRight: 'auto',
              }}
            >
              {header.description}
            </p>
          </div>
        </div>
      </section>

      {/* Category Filter Pills */}
      <section className="sticky top-0 z-10 bg-white border-b border-black/5 py-4">
        <div className="container-standard">
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => handleCategoryChange(null)}
              className={clsx(
                'inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                !activeCategory
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-surface text-secondary hover:bg-surface/80 hover:text-primary',
              )}
            >
              All ({(articles as Article[]).length})
            </button>
            {ARTICLE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={clsx(
                  'inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                  activeCategory === cat
                    ? 'bg-accent text-white shadow-sm'
                    : 'bg-surface text-secondary hover:bg-surface/80 hover:text-primary',
                )}
              >
                {cat} ({categoryCounts[cat] || 0})
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-12 md:py-16">
        <div className="container-standard">
          {filteredArticles.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '3rem 1rem',
                maxWidth: '28rem',
                marginLeft: 'auto',
                marginRight: 'auto',
              }}
            >
              <p
                style={{
                  fontSize: '1.125rem',
                  color: '#4A5568',
                  marginBottom: '1rem',
                }}
              >
                No articles found in this category yet.
              </p>
              <button
                onClick={() => handleCategoryChange(null)}
                className="text-accent hover:text-accent/80 font-medium transition-colors"
              >
                View all articles
              </button>
            </div>
          ) : (
            <StaggerContainer
              key={activeCategory || 'all'}
              className="grid md:grid-cols-2 gap-6"
              staggerDelay={0.1}
            >
              {filteredArticles.map((article) => (
                <StaggerItem key={article.id}>
                  <ArticleCard article={article} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 md:py-20 bg-surface">
        <div
          style={{
            maxWidth: '1280px',
            marginLeft: 'auto',
            marginRight: 'auto',
            paddingLeft: '1.5rem',
            paddingRight: '1.5rem',
            textAlign: 'center',
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
            Explore More
          </span>
          <h2
            style={{
              fontFamily: 'var(--font-display, serif)',
              fontSize: '1.75rem',
              fontWeight: 700,
              color: '#1A202C',
              lineHeight: 1.3,
              marginBottom: '1rem',
            }}
          >
            Continue Your Journey
          </h2>
          <p
            style={{
              fontSize: '1.125rem',
              lineHeight: 1.6,
              color: '#4A5568',
              maxWidth: '36rem',
              marginLeft: 'auto',
              marginRight: 'auto',
              marginBottom: '2rem',
            }}
          >
            Look up recovery terms in our glossary or find the perfect token to
            celebrate your milestone.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/resources/glossary">
              <Button variant="primary" size="lg">
                Browse the Glossary
              </Button>
            </Link>
            <Link to="/collections">
              <Button variant="secondary" size="lg">
                Shop Recovery Tokens
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
