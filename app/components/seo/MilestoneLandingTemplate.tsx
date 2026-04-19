/**
 * MilestoneLandingTemplate — Template for milestone-specific SEO pages
 *
 * Used by: /1-year-sobriety-coin, /90-day-sobriety-coin, etc.
 * Layout: Hero → Significance → Products → Content → Milestone Nav → FAQ → Related → CTA
 */

import {Link} from 'react-router';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';
import {Breadcrumbs} from '~/components/ui/Breadcrumbs';
import {JsonLd} from '~/components/seo/JsonLd';
import {Button} from '~/components/ui/Button';
import {SEOProductCard} from '~/components/seo/SEOProductCard';
import {SEOFaqAccordion} from '~/components/seo/SEOFaqAccordion';
import {SEORelatedPages} from '~/components/seo/SEORelatedPages';
import {SEOMilestoneNav} from '~/components/seo/SEOMilestoneNav';
import {ReviewsCallout} from '~/components/reviews/ReviewsCallout';
import type {SEOPage} from '~/data/seo-pages';

interface MilestoneLandingTemplateProps {
  page: SEOPage;
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
}

export function MilestoneLandingTemplate({
  page,
  products,
}: MilestoneLandingTemplateProps) {
  const milestone = page.milestone!;

  const breadcrumbItems = [
    {label: 'Sobriety Milestones', href: '/sobriety-coins'},
    {label: page.title},
  ];

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://coinplugz.com/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Sobriety Milestones',
        item: 'https://coinplugz.com/sobriety-coins',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: page.title,
        item: `https://coinplugz.com/${page.canonicalPath}`,
      },
    ],
  };

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.title,
    description: page.metaDescription,
    url: `https://coinplugz.com/${page.canonicalPath}`,
  };

  return (
    <div className="min-h-screen">
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={webPageSchema} />

      {/* Hero */}
      <section className="container-standard pt-12 pb-8">
        <Breadcrumbs items={breadcrumbItems} className="mb-8" />
        <div
          style={{
            textAlign: 'center',
            maxWidth: '42rem',
            marginLeft: 'auto',
            marginRight: 'auto',
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
            {page.eyebrow}
          </span>
          <h1
            style={{
              fontFamily: 'var(--font-display, serif)',
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 700,
              color: '#FFFFFF',
              lineHeight: 1.1,
              marginBottom: '1rem',
            }}
          >
            {page.title}
          </h1>
          <p
            style={{
              fontSize: '1.125rem',
              lineHeight: 1.6,
              color: 'rgba(255,255,255,0.5)',
              maxWidth: '36rem',
              marginLeft: 'auto',
              marginRight: 'auto',
              marginBottom: '1rem',
            }}
          >
            {page.heroDescription}
          </p>
          {milestone.traditionalColor && (
            <span className="inline-block rounded-full bg-white/[0.05] border border-white/[0.08] px-4 py-1.5 text-sm text-white/60 mb-4">
              Traditional Color: {milestone.traditionalColor}
            </span>
          )}
          <div style={{marginTop: '1.5rem'}}>
            <Link to={page.primaryCTA.href} prefetch="intent">
              <Button
                variant="primary"
                size="lg"
                className="!bg-accent !text-black"
              >
                {page.primaryCTA.label}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Reviews Callout */}
      <div className="container-standard pt-4">
        <ReviewsCallout variant="banner" />
      </div>

      {/* Milestone Significance */}
      <section className="container-standard py-12">
        <div
          className="rounded-2xl border border-white/[0.08] p-8 md:p-12 max-w-3xl mx-auto"
          style={{
            background:
              'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)',
          }}
        >
          <h2 className="font-display text-subsection text-white mb-4">
            What {milestone.duration} Means
          </h2>
          <p className="text-white/50 leading-relaxed text-lg">
            {milestone.significance}
          </p>
        </div>
      </section>

      {/* Featured Products */}
      {products.length > 0 && (
        <section className="container-standard py-12">
          <h2
            className="font-display text-subsection text-white mb-8"
            style={{textAlign: 'center'}}
          >
            {milestone.duration} Recovery Tokens
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 4).map((product, idx) => (
              <SEOProductCard
                key={product.id}
                product={product}
                loading={idx < 2 ? 'eager' : 'lazy'}
              />
            ))}
          </div>
        </section>
      )}

      {/* Content Sections */}
      {page.sections.length > 0 && (
        <div className="container-standard py-12 space-y-12">
          {page.sections.map((section, index) => {
            if (section.type === 'text') {
              return (
                <section key={index}>
                  {section.heading && (
                    <h2 className="font-display text-subsection text-white mb-4">
                      {section.heading}
                    </h2>
                  )}
                  <div className="text-white/50 leading-relaxed max-w-3xl">
                    {section.body.split('\n\n').map((paragraph, pIdx) => (
                      <p key={pIdx} style={{marginBottom: '1.5rem'}}>{paragraph}</p>
                    ))}
                  </div>
                </section>
              );
            }
            return null;
          })}
        </div>
      )}

      {/* Milestone Navigation */}
      <div className="container-standard">
        <SEOMilestoneNav
          prevSlug={milestone.prevMilestoneSlug}
          nextSlug={milestone.nextMilestoneSlug}
        />
      </div>

      {/* FAQ */}
      {page.faq.length > 0 && (
        <div className="container-standard py-16">
          <SEOFaqAccordion items={page.faq} />
        </div>
      )}

      {/* Related Pages */}
      {page.relatedPageSlugs.length > 0 && (
        <div className="container-standard pb-16">
          <SEORelatedPages slugs={page.relatedPageSlugs} />
        </div>
      )}

      {/* Final CTA */}
      <section className="container-standard pb-20">
        <div
          className="rounded-2xl border border-white/[0.08] p-12"
          style={{
            background:
              'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)',
            textAlign: 'center',
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-display, serif)',
              fontSize: '1.875rem',
              fontWeight: 700,
              color: '#FFFFFF',
              marginBottom: '1rem',
            }}
          >
            Celebrate {milestone.duration} of Recovery
          </h2>
          <p
            style={{
              color: 'rgba(255,255,255,0.5)',
              marginBottom: '2rem',
              maxWidth: '28rem',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            Find the perfect token to mark this incredible milestone.
          </p>
          <Link to={page.primaryCTA.href} prefetch="intent">
            <Button
              variant="primary"
              size="lg"
              className="!bg-accent !text-black"
            >
              {page.primaryCTA.label}
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
