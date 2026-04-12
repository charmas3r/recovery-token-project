/**
 * GenericSEOLandingTemplate — Tier A phrase-match SEO pages
 *
 * Used by: /milestone-tokens, /aa-sobriety-coins, /aa-sobriety-tokens,
 *          /aa-sober-chips, /na-sobriety-coins, /na-sober-chips,
 *          /alcoholics-anonymous-sobriety-coins, /narcotics-anonymous-coins,
 *          /sobriety-medallion, /recovery-chips
 *
 * Layout: Breadcrumbs → Hero (dual CTA) → Trust Bar → Intro Text
 *       → Product Showcase → CustomTokenFeatureBlock → Distinctive Section
 *       → FAQ → Related Pages → Final Dual-CTA
 *
 * Product-forward with custom-token surfaced prominently mid-page. Hero and
 * final CTA both offer "Shop" (primary) + "Or design your own" (secondary).
 */

import {Link} from 'react-router';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';
import {Breadcrumbs} from '~/components/ui/Breadcrumbs';
import {JsonLd} from '~/components/seo/JsonLd';
import {Button} from '~/components/ui/Button';
import {SEOProductCard} from '~/components/seo/SEOProductCard';
import {SEOFaqAccordion} from '~/components/seo/SEOFaqAccordion';
import {SEORelatedPages} from '~/components/seo/SEORelatedPages';
import {SEOTrustBar} from '~/components/seo/SEOTrustBar';
import {CustomTokenFeatureBlock} from '~/components/seo/CustomTokenFeatureBlock';
import {buildBreadcrumbList} from '~/lib/jsonld';
import type {SEOPage} from '~/data/seo-pages';

interface GenericSEOLandingTemplateProps {
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

export function GenericSEOLandingTemplate({
  page,
  products,
}: GenericSEOLandingTemplateProps) {
  const breadcrumbItems = [{label: page.title}];

  const breadcrumbSchema = buildBreadcrumbList([
    {name: 'Home', path: '/'},
    {name: page.title, path: `/${page.canonicalPath}`},
  ]);

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.title,
    description: page.metaDescription,
    url: `https://coinplugz.com/${page.canonicalPath}`,
  };

  // Split sections: first text section = intro (rendered mid-hero),
  // remaining text sections render below the CustomTokenFeatureBlock.
  const textSections = page.sections.filter((s) => s.type === 'text');
  const introSection = textSections[0];
  const distinctiveSections = textSections.slice(1);

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
              marginBottom: '2rem',
            }}
          >
            {page.heroDescription}
          </p>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '0.75rem',
            }}
          >
            <Link to={page.primaryCTA.href} prefetch="intent">
              <Button
                variant="primary"
                size="lg"
                className="!bg-accent !text-black"
              >
                {page.primaryCTA.label}
              </Button>
            </Link>
            <Link to="/custom-token" prefetch="intent">
              <Button
                variant="secondary"
                size="lg"
                className="!border-white/30 !text-white"
              >
                Or design your own
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <div className="container-standard">
        <SEOTrustBar />
      </div>

      {/* Intro text */}
      {introSection && (
        <div className="container-standard py-16">
          <section>
            {introSection.heading && (
              <h2 className="font-display text-subsection text-white mb-4">
                {introSection.heading}
              </h2>
            )}
            <div className="text-white/50 leading-relaxed max-w-3xl">
              {introSection.body.split('\n\n').map((paragraph, pIdx) => (
                <p key={pIdx} style={{marginBottom: '1.5rem'}}>
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Product Showcase */}
      {products.length > 0 && (
        <div className="container-standard pb-16">
          <section>
            <h2 className="font-display text-subsection text-white mb-8">
              Shop {page.title}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.slice(0, 4).map((product, pIdx) => (
                <SEOProductCard
                  key={product.id}
                  product={product}
                  loading={pIdx < 2 ? 'eager' : 'lazy'}
                />
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Custom Token Feature Block — mid-page, prominent */}
      <div className="container-standard pb-16">
        <CustomTokenFeatureBlock copy={page.customTokenBlock} />
      </div>

      {/* Distinctive content sections (history / terminology angle) */}
      {distinctiveSections.length > 0 && (
        <div className="container-standard pb-16 space-y-16">
          {distinctiveSections.map((section, index) => (
            <section key={index}>
              {section.heading && (
                <h2 className="font-display text-subsection text-white mb-4">
                  {section.heading}
                </h2>
              )}
              <div className="text-white/50 leading-relaxed max-w-3xl">
                {section.body.split('\n\n').map((paragraph, pIdx) => (
                  <p key={pIdx} style={{marginBottom: '1.5rem'}}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* FAQ */}
      {page.faq.length > 0 && (
        <div className="container-standard pb-16">
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
            Ready to shop {page.title}?
          </h2>
          <p
            style={{
              color: 'rgba(255,255,255,0.5)',
              marginBottom: '2rem',
              maxWidth: '32rem',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            Browse the collection or design a one-of-a-kind token that tells
            your own story.
          </p>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '0.75rem',
            }}
          >
            <Link to={page.primaryCTA.href} prefetch="intent">
              <Button
                variant="primary"
                size="lg"
                className="!bg-accent !text-black"
              >
                {page.primaryCTA.label}
              </Button>
            </Link>
            <Link to="/custom-token" prefetch="intent">
              <Button
                variant="secondary"
                size="lg"
                className="!border-white/30 !text-white"
              >
                Start Designing
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
