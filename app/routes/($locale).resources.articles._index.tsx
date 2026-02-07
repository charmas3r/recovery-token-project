/**
 * Articles Hub Page — /resources/articles
 *
 * Lists all Token Heritage articles as cards.
 * Targets "recovery token articles" and related content queries.
 */

import {useLoaderData} from 'react-router';
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
import {getAllArticles, type Article} from '~/data/articles';

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
    articles: getAllArticles(),
  };
}

export default function ArticlesHubPage() {
  const {articles} = useLoaderData<typeof loader>();

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
              {label: 'Resources', href: '/resources/glossary'},
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
              Token Heritage
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
              Articles
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
              Explore the history, craftsmanship, and symbolism behind recovery
              tokens. Each article deepens your connection to the tradition.
            </p>
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-12 md:py-16">
        <div className="container-standard">
          <StaggerContainer
            className="grid md:grid-cols-2 gap-6"
            staggerDelay={0.1}
          >
            {(articles as Article[]).map((article) => (
              <StaggerItem key={article.id}>
                <ArticleCard article={article} />
              </StaggerItem>
            ))}
          </StaggerContainer>
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
