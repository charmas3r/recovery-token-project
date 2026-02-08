/**
 * Individual Article Page — /resources/articles/:slug
 *
 * Renders a single Token Heritage article with TOC sidebar,
 * reading progress, content blocks, and related articles.
 */

import {useLoaderData} from 'react-router';
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
} from '~/lib/sanity.queries';
import type {Article} from '~/data/articles';

export const meta: MetaFunction<typeof loader> = ({data}) => {
  if (!data?.article) {
    return [{title: 'Article Not Found — Recovery Token Store'}];
  }
  const article = data.article as Article;
  return [
    {title: article.metaTitle},
    {name: 'description', content: article.metaDescription},
    {property: 'og:title', content: article.metaTitle},
    {property: 'og:description', content: article.metaDescription},
    {property: 'og:type', content: 'article'},
    {
      property: 'og:url',
      content: `https://recoverytokenstore.com/resources/articles/${article.slug}`,
    },
    {name: 'twitter:card', content: 'summary_large_image'},
    {name: 'twitter:title', content: article.metaTitle},
    {name: 'twitter:description', content: article.metaDescription},
    {name: 'keywords', content: article.keywords.join(', ')},
  ];
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
  const related = await getRelatedArticles(article);
  const headings = getHeadings(article);
  return {article, related, headings};
}

export default function ArticlePage() {
  const {article, related, headings} = useLoaderData<typeof loader>();
  const typedArticle = article as Article;
  const typedRelated = related as Article[];
  const typedHeadings = headings as {id: string; text: string; level: 2 | 3}[];

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: typedArticle.title,
    description: typedArticle.metaDescription,
    datePublished: typedArticle.publishedAt,
    dateModified: typedArticle.updatedAt,
    url: `https://recoverytokenstore.com/resources/articles/${typedArticle.slug}`,
    publisher: {
      '@type': 'Organization',
      name: 'Recovery Token Store',
      url: 'https://recoverytokenstore.com',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://recoverytokenstore.com/resources/articles/${typedArticle.slug}`,
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
      {
        '@type': 'ListItem',
        position: 4,
        name: typedArticle.title,
        item: `https://recoverytokenstore.com/resources/articles/${typedArticle.slug}`,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-white">
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

      {/* Related Articles */}
      <RelatedArticles articles={typedRelated} />
    </div>
  );
}
