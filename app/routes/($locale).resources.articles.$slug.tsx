/**
 * Individual Article Page — /resources/articles/:slug
 *
 * Renders a single Token Heritage article with TOC sidebar,
 * reading progress, content blocks, and related articles.
 */

import {useLoaderData, Link} from 'react-router';
import type {MetaFunction} from 'react-router';
import type {Route} from './+types/resources.articles.$slug';
import {JsonLd} from '~/components/seo/JsonLd';
import {ArticleHero} from '~/components/resources/ArticleHero';
import {ArticleContent} from '~/components/resources/ArticleContent';
import {TableOfContents} from '~/components/resources/TableOfContents';
import {ReadingProgress} from '~/components/resources/ReadingProgress';
import {RelatedArticles} from '~/components/resources/RelatedArticles';
import {NewsletterCTA} from '~/components/resources/NewsletterCTA';
import {
  getArticleBySlug,
  getRelatedArticles,
  getHeadings,
  getAllGlossaryTerms,
} from '~/lib/sanity.queries';
import type {Article} from '~/data/articles';
import type {GlossaryTerm} from '~/data/glossary-terms';
import {buildMeta, SOCIAL_PROFILES} from '~/lib/meta';

export const meta: MetaFunction<typeof loader> = ({data}) => {
  if (!data?.article) {
    return [{title: 'Article Not Found — Custom Milestones'}];
  }
  const article = data.article as Article;
  return buildMeta({
    title: article.metaTitle,
    description: article.metaDescription,
    ogType: 'article',
    url: `/resources/articles/${article.slug}`,
    extra: [{name: 'keywords', content: article.keywords.join(', ')}],
  });
};

export async function loader({params}: Route.LoaderArgs) {
  const slug = params.slug;
  if (!slug) {
    throw new Response('Not Found', {status: 404});
  }
  const article = await getArticleBySlug(slug);
  if (!article) {
    throw new Response('Not Found', {status: 404});
  }
  const [related, allTerms] = await Promise.all([
    getRelatedArticles(article),
    article.relatedTerms?.length ? getAllGlossaryTerms() : Promise.resolve([]),
  ]);
  const headings = getHeadings(article);

  const relatedTerms = article.relatedTerms?.length
    ? (allTerms as GlossaryTerm[]).filter((t) =>
        article.relatedTerms!.includes(t.slug),
      )
    : [];

  return {article, related, headings, relatedTerms};
}

export default function ArticlePage() {
  const {article, related, headings, relatedTerms} =
    useLoaderData<typeof loader>();
  const typedArticle = article as Article;
  const typedRelated = related as Article[];
  const typedHeadings = headings as {id: string; text: string; level: 2 | 3}[];
  const typedTerms = relatedTerms as GlossaryTerm[];

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: typedArticle.title,
    description: typedArticle.metaDescription,
    datePublished: typedArticle.publishedAt,
    dateModified: typedArticle.updatedAt,
    url: `https://custommilestones.com/resources/articles/${typedArticle.slug}`,
    publisher: {
      '@type': 'Organization',
      name: 'Custom Milestones',
      url: 'https://custommilestones.com',
      sameAs: SOCIAL_PROFILES,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://custommilestones.com/resources/articles/${typedArticle.slug}`,
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
        item: 'https://custommilestones.com/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Resources',
        item: 'https://custommilestones.com/resources',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Articles',
        item: 'https://custommilestones.com/resources/articles',
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: typedArticle.title,
        item: `https://custommilestones.com/resources/articles/${typedArticle.slug}`,
      },
    ],
  };

  return (
    <div className="min-h-screen">
      <ReadingProgress />
      <JsonLd data={articleJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      {/* Hero */}
      <ArticleHero article={typedArticle} />

      {/* Article Body */}
      <section className="py-12 md:py-16">
        <div className="container-standard">
          <div className="lg:grid lg:grid-cols-[1fr_240px] lg:gap-12">
            {/* Main Content */}
            <div>
              {/* Mobile TOC */}
              <TableOfContents headings={typedHeadings} />
              <ArticleContent blocks={typedArticle.content} />

              {/* Newsletter CTA */}
              <div className="max-w-[640px] mx-auto">
                <NewsletterCTA />
              </div>
            </div>

            {/* Desktop TOC Sidebar */}
            <div className="hidden lg:block">
              <TableOfContents headings={typedHeadings} />
            </div>
          </div>
        </div>
      </section>

      {/* Related Glossary Terms */}
      {typedTerms.length > 0 && (
        <section className="container-standard" style={{paddingTop: '3rem', paddingBottom: '3rem'}}>
          <h2
            className="font-display text-subsection text-white"
            style={{marginBottom: '2rem'}}
          >
            Related Glossary Terms
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {typedTerms.map((term) => (
              <Link
                key={term.slug}
                to={`/resources/glossary/${term.slug}`}
                prefetch="intent"
                className="group block rounded-2xl border border-white/[0.08] hover:border-white/[0.15] transition-all duration-300 hover:-translate-y-1"
                style={{
                  background:
                    'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)',
                  padding: '1.5rem',
                }}
              >
                <h3 className="text-white font-bold group-hover:text-accent transition-colors" style={{marginBottom: '0.5rem'}}>
                  {term.name}
                </h3>
                <p className="text-white/50 text-sm line-clamp-2">
                  {term.definition}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Related Articles */}
      <RelatedArticles articles={typedRelated} />
    </div>
  );
}
