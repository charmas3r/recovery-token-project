/**
 * GlossaryDetailTemplate — Template for individual glossary term pages
 *
 * Used by: /resources/glossary/sobriety-coin, etc.
 * Layout: Breadcrumb → Definition → Extended Content → Products → FAQ → Related Terms → Back link
 */

import {Link} from 'react-router';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';
import {Breadcrumbs} from '~/components/ui/Breadcrumbs';
import {JsonLd} from '~/components/seo/JsonLd';
import {Button} from '~/components/ui/Button';
import {SEOProductCard} from '~/components/seo/SEOProductCard';
import {SEOFaqAccordion} from '~/components/seo/SEOFaqAccordion';
import {getSEOPage} from '~/data/seo-pages';
import type {SEOPage} from '~/data/seo-pages';
import type {GlossaryTerm} from '~/data/glossary-terms';

interface RelatedArticle {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: number;
}

interface GlossaryDetailTemplateProps {
  page: SEOPage;
  sanityTerm: GlossaryTerm;
  products: Array<{
    id: string;
    handle: string;
    title: string;
    featuredImage?: {
      id?: string;
      altText?: string | null;
      url: string;
      width?: number;
      height?: number;
    } | null;
    priceRange: {
      minVariantPrice: MoneyV2;
    };
  }>;
  relatedArticles?: RelatedArticle[];
}

export function GlossaryDetailTemplate({
  page,
  sanityTerm,
  products,
  relatedArticles = [],
}: GlossaryDetailTemplateProps) {
  const glossary = page.glossary!;

  const breadcrumbItems = [
    {label: 'Resources', href: '/resources'},
    {label: 'Glossary', href: '/resources/glossary'},
    {label: sanityTerm.name},
  ];

  const breadcrumbSchema = {
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
        name: 'Glossary',
        item: 'https://custommilestones.com/resources/glossary',
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: sanityTerm.name,
        item: `https://custommilestones.com/${page.canonicalPath}`,
      },
    ],
  };

  const definedTermSchema = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    name: sanityTerm.name,
    description: sanityTerm.definition,
    inDefinedTermSet: 'https://custommilestones.com/resources/glossary',
  };

  const relatedTermPages = glossary.relatedTermSlugs
    .map((slug) => getSEOPage(`resources/glossary/${slug}`))
    .filter(Boolean);

  return (
    <div className="min-h-screen">
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={definedTermSchema} />

      {/* Header */}
      <section className="container-standard pt-12 pb-8">
        <Breadcrumbs items={breadcrumbItems} className="mb-8" />
        <div style={{maxWidth: '42rem'}}>
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
            {glossary.category}
          </span>
          <h1
            style={{
              fontFamily: 'var(--font-display, serif)',
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 700,
              color: '#FFFFFF',
              lineHeight: 1.1,
              marginBottom: '1.5rem',
            }}
          >
            {sanityTerm.name}
          </h1>
          <p className="text-lg text-white/60 leading-relaxed border-l-2 border-accent" style={{paddingLeft: '1.5rem'}}>
            {sanityTerm.definition}
          </p>
        </div>
      </section>

      {/* Extended Content */}
      <section className="container-standard py-12">
        <div className="text-white/50 leading-relaxed max-w-3xl">
          {glossary.extendedContent.split('\n\n').map((paragraph, idx) => (
            <p key={idx} style={{marginBottom: '1.5rem'}}>{paragraph}</p>
          ))}
        </div>
      </section>

      {/* Related Products */}
      {products.length > 0 && (
        <section className="container-standard py-12">
          <h2 className="font-display text-subsection text-white" style={{marginBottom: '2rem'}}>
            Shop {sanityTerm.name}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
            {products.slice(0, 2).map((product, idx) => (
              <SEOProductCard
                key={product.id}
                product={product}
                loading={idx === 0 ? 'eager' : 'lazy'}
              />
            ))}
          </div>
          {page.primaryCTA && (
            <div className="mt-8">
              <Link to={page.primaryCTA.href} prefetch="intent">
                <Button
                  variant="secondary"
                  className="!border-white/30 !text-white"
                >
                  {page.primaryCTA.label} &rarr;
                </Button>
              </Link>
            </div>
          )}
        </section>
      )}

      {/* FAQ */}
      {page.faq.length > 0 && (
        <div className="container-standard py-12">
          <SEOFaqAccordion items={page.faq} />
        </div>
      )}

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="container-standard" style={{paddingTop: '3rem', paddingBottom: '3rem'}}>
          <h2
            className="font-display text-subsection text-white"
            style={{marginBottom: '2rem'}}
          >
            Articles About {sanityTerm.name}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedArticles.slice(0, 3).map((article) => (
              <Link
                key={article.slug}
                to={`/resources/articles/${article.slug}`}
                prefetch="intent"
                className="group block rounded-2xl border border-white/[0.08] hover:border-white/[0.15] transition-all duration-300 hover:-translate-y-1"
                style={{
                  background:
                    'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)',
                  padding: '1.5rem',
                }}
              >
                <span
                  className="text-accent uppercase tracking-wider font-semibold"
                  style={{fontSize: '0.65rem', display: 'block', marginBottom: '0.5rem'}}
                >
                  {article.category} · {article.readTime} min read
                </span>
                <h3
                  className="text-white font-bold group-hover:text-accent transition-colors"
                  style={{marginBottom: '0.5rem'}}
                >
                  {article.title}
                </h3>
                <p className="text-white/50 text-sm line-clamp-2">
                  {article.excerpt}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Related Terms */}
      {relatedTermPages.length > 0 && (
        <section className="container-standard py-12">
          <h2 className="font-display text-subsection text-white" style={{marginBottom: '2rem'}}>
            Related Terms
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedTermPages.map((relPage) => (
              <Link
                key={relPage!.slug}
                to={`/${relPage!.canonicalPath}`}
                prefetch="intent"
                className="group block rounded-2xl border border-white/[0.08] hover:border-white/[0.15] p-6 transition-all duration-300 hover:-translate-y-1"
                style={{
                  background:
                    'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)',
                }}
              >
                <h3 className="text-white font-bold mb-2 group-hover:text-accent transition-colors">
                  {relPage!.title}
                </h3>
                <p className="text-white/50 text-sm line-clamp-2">
                  {relPage!.heroDescription}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Back to Glossary */}
      <div className="container-standard pb-20">
        <Link
          to="/resources/glossary"
          className="inline-flex items-center gap-2 text-white/50 hover:text-accent transition-colors"
        >
          &larr; Back to Glossary
        </Link>
      </div>
    </div>
  );
}
