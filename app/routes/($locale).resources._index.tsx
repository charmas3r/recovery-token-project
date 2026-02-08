/**
 * Resources Hub Page — /resources
 *
 * Central hub for all recovery resources: articles, glossary, and milestone calculator.
 * Features search, category cards, and featured articles.
 */

import {useState, useMemo} from 'react';
import {useLoaderData, Link} from 'react-router';
import type {MetaFunction} from 'react-router';
import {FileText, BookOpen, Calculator, Search, ArrowRight} from 'lucide-react';
import {Breadcrumbs} from '~/components/ui/Breadcrumbs';
import {JsonLd} from '~/components/seo/JsonLd';
import {ResourcesNav} from '~/components/resources/ResourcesNav';
import {ArticleCard} from '~/components/resources/ArticleCard';
import {Button} from '~/components/ui/Button';
import {Badge} from '~/components/ui/Badge';
import {
  FadeUp,
  StaggerContainer,
  StaggerItem,
} from '~/components/ui/Animations';
import {inputStyles} from '~/components/ui/Input';
import {getAllArticles, getAllGlossaryTerms} from '~/lib/sanity.queries';
import type {Article} from '~/data/articles';
import type {GlossaryTerm} from '~/data/glossary-terms';

export const meta: MetaFunction = () => {
  return [
    {title: 'Recovery Resources — Recovery Token Store'},
    {
      name: 'description',
      content:
        'Explore recovery articles, a comprehensive glossary, and an interactive milestone calculator. Free resources to support your recovery journey.',
    },
    {
      property: 'og:title',
      content: 'Recovery Resources — Recovery Token Store',
    },
    {
      property: 'og:description',
      content:
        'Explore recovery articles, a comprehensive glossary, and an interactive milestone calculator.',
    },
    {property: 'og:type', content: 'website'},
    {name: 'twitter:card', content: 'summary_large_image'},
  ];
};

export async function loader() {
  const [articles, glossaryTerms] = await Promise.all([
    getAllArticles(),
    getAllGlossaryTerms(),
  ]);
  return {
    articles,
    articleCount: articles.length,
    termCount: glossaryTerms.length,
    glossaryTerms,
  };
}

type SearchResult =
  | {type: 'article'; item: Article}
  | {type: 'glossary'; item: GlossaryTerm};

export default function ResourcesHubPage() {
  const {articles, articleCount, termCount, glossaryTerms} =
    useLoaderData<typeof loader>();
  const [searchQuery, setSearchQuery] = useState('');

  // Featured articles: most recent 4
  const featuredArticles = (articles as Article[]).slice(-4).reverse();

  // Search results
  const searchResults = useMemo<SearchResult[]>(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const results: SearchResult[] = [];

    // Search articles
    for (const article of articles as Article[]) {
      if (
        article.title.toLowerCase().includes(q) ||
        article.excerpt.toLowerCase().includes(q)
      ) {
        results.push({type: 'article', item: article});
      }
    }

    // Search glossary terms
    for (const term of glossaryTerms as GlossaryTerm[]) {
      if (
        term.name.toLowerCase().includes(q) ||
        term.definition.toLowerCase().includes(q)
      ) {
        results.push({type: 'glossary', item: term});
      }
    }

    return results;
  }, [searchQuery, articles, glossaryTerms]);

  const articleResults = searchResults.filter((r) => r.type === 'article');
  const glossaryResults = searchResults.filter((r) => r.type === 'glossary');
  const hasSearchQuery = searchQuery.trim().length > 0;

  // Schema.org structured data
  const jsonLdData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Recovery Resources',
    description:
      'Articles, glossary, and tools for the recovery community. Free resources to support your sobriety journey.',
    url: 'https://recoverytokenstore.com/resources',
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
    ],
  };

  const CATEGORY_CARDS = [
    {
      title: 'Articles',
      description:
        'Deep dives into token history, design symbolism, and recovery traditions.',
      icon: FileText,
      href: '/resources/articles',
      stat: `${articleCount} Articles`,
      color: '#B8764F',
    },
    {
      title: 'Recovery Glossary',
      description:
        'Definitions of sobriety coins, AA chips, clean time, and 30+ recovery terms.',
      icon: BookOpen,
      href: '/resources/glossary',
      stat: `${termCount} Terms`,
      color: '#2D6A4F',
    },
    {
      title: 'Milestone Calculator',
      description:
        'Enter your sobriety date and see milestones achieved and upcoming.',
      icon: Calculator,
      href: '/resources/milestone-calculator',
      stat: 'Interactive Tool',
      color: '#4A5568',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <JsonLd data={jsonLdData} />
      <JsonLd data={breadcrumbJsonLd} />

      {/* Header Section */}
      <section className="bg-surface py-12 md:py-16">
        <div className="container-standard">
          <Breadcrumbs items={[{label: 'Resources'}]} className="mb-6" />

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
              Recovery Resources
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
              Learn, Explore & Celebrate
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
              Articles, tools, and a comprehensive glossary to deepen your
              understanding of recovery traditions and celebrate your milestones.
            </p>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-8 md:py-10 border-b border-black/5">
        <div className="container-standard">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary/50" />
              <input
                type="text"
                placeholder="Search articles and glossary terms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`${inputStyles.base} ${inputStyles.text} ${inputStyles.focus} !pl-12 !h-14 !rounded-xl`}
                aria-label="Search resources"
              />
            </div>

            {/* Search Results */}
            {hasSearchQuery && (
              <div className="mt-6">
                {searchResults.length === 0 ? (
                  <p className="text-center text-secondary py-4">
                    No results found for &ldquo;{searchQuery}&rdquo;
                  </p>
                ) : (
                  <div className="space-y-6">
                    {articleResults.length > 0 && (
                      <div>
                        <h3 className="text-body-sm font-semibold text-secondary uppercase tracking-wider mb-3">
                          Articles ({articleResults.length})
                        </h3>
                        <div className="space-y-2">
                          {articleResults.map((r) => {
                            const article = r.item as Article;
                            return (
                              <Link
                                key={article.id}
                                to={`/resources/articles/${article.slug}`}
                                className="flex items-start gap-3 p-3 rounded-xl hover:bg-surface/50 transition-colors group"
                              >
                                <FileText className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                                <div>
                                  <p className="font-medium text-primary group-hover:text-accent transition-colors">
                                    {article.title}
                                  </p>
                                  <p className="text-body-sm text-secondary line-clamp-1">
                                    {article.excerpt}
                                  </p>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {glossaryResults.length > 0 && (
                      <div>
                        <h3 className="text-body-sm font-semibold text-secondary uppercase tracking-wider mb-3">
                          Glossary Terms ({glossaryResults.length})
                        </h3>
                        <div className="space-y-2">
                          {glossaryResults.map((r) => {
                            const term = r.item as GlossaryTerm;
                            return (
                              <Link
                                key={term.id}
                                to={`/resources/glossary#${term.id}`}
                                className="flex items-start gap-3 p-3 rounded-xl hover:bg-surface/50 transition-colors group"
                              >
                                <BookOpen className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                                <div>
                                  <p className="font-medium text-primary group-hover:text-accent transition-colors">
                                    {term.name}
                                  </p>
                                  <p className="text-body-sm text-secondary line-clamp-1">
                                    {term.definition}
                                  </p>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Category Cards */}
      <section className="py-12 md:py-16">
        <div className="container-standard">
          <FadeUp>
            <div
              style={{
                textAlign: 'center',
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
                  marginBottom: '0.75rem',
                }}
              >
                Browse by Category
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
                Explore Our Resources
              </h2>
            </div>
          </FadeUp>

          <StaggerContainer
            className="grid md:grid-cols-3 gap-6"
            staggerDelay={0.1}
          >
            {CATEGORY_CARDS.map((card) => (
              <StaggerItem key={card.title}>
                <Link
                  to={card.href}
                  className="block bg-white rounded-2xl p-6 shadow-sm border border-black/5 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 group h-full"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{backgroundColor: `${card.color}15`}}
                    >
                      <card.icon
                        className="w-5 h-5"
                        style={{color: card.color}}
                      />
                    </div>
                    <Badge variant="new">{card.stat}</Badge>
                  </div>

                  <h3 className="font-display text-lg font-bold text-primary mb-2 group-hover:text-accent transition-colors">
                    {card.title}
                  </h3>

                  <p className="text-body text-secondary leading-relaxed mb-4">
                    {card.description}
                  </p>

                  <span className="inline-flex items-center gap-1.5 text-body-sm font-medium text-accent group-hover:text-accent/80 transition-colors">
                    Explore
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Featured Articles */}
      <section className="py-12 md:py-16 bg-surface">
        <div className="container-standard">
          <FadeUp>
            <div
              style={{
                textAlign: 'center',
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
                  marginBottom: '0.75rem',
                }}
              >
                Latest Articles
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
                Featured Reading
              </h2>
            </div>
          </FadeUp>

          <StaggerContainer
            className="grid md:grid-cols-2 gap-6"
            staggerDelay={0.1}
          >
            {featuredArticles.map((article) => (
              <StaggerItem key={(article as Article).id}>
                <ArticleCard article={article as Article} />
              </StaggerItem>
            ))}
          </StaggerContainer>

          <div className="text-center mt-8">
            <Link to="/resources/articles">
              <Button variant="secondary" size="lg">
                View All Articles
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 md:py-20">
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
            Ready to Celebrate?
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
            Honor Your Milestone
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
            Every day of recovery is an achievement worth celebrating. Find the
            perfect token to mark your journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/collections">
              <Button variant="primary" size="lg">
                Shop Recovery Tokens
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="secondary" size="lg">
                Get in Touch
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
