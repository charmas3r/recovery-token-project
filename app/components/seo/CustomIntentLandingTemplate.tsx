/**
 * CustomIntentLandingTemplate — Tier B custom-intent SEO pages
 *
 * Used by: /custom-recovery-token, /custom-aa-coins, /custom-na-coins,
 *          /custom-sobriety-medallion, /personalized-recovery-tokens
 *
 * Layout: Breadcrumbs → Hero (primary CTA → /custom-token)
 *       → CustomTokenFeatureBlock (hero-adjacent) → Two-Paths Explanation
 *       → Distinctive Section → Product Showcase (secondary "Or shop ready-made")
 *       → FAQ → Related Pages → Final CTA (/custom-token)
 *
 * Custom-token-forward. Products are shown but framed as a fallback for
 * visitors who don't want to go through the design flow.
 */

import {Link} from 'react-router';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';
import {Breadcrumbs} from '~/components/ui/Breadcrumbs';
import {JsonLd} from '~/components/seo/JsonLd';
import {Button} from '~/components/ui/Button';
import {SEOProductCard} from '~/components/seo/SEOProductCard';
import {SEOFaqAccordion} from '~/components/seo/SEOFaqAccordion';
import {SEORelatedPages} from '~/components/seo/SEORelatedPages';
import {CustomTokenFeatureBlock} from '~/components/seo/CustomTokenFeatureBlock';
import {ReviewsCallout} from '~/components/reviews/ReviewsCallout';
import {buildBreadcrumbList} from '~/lib/jsonld';
import type {SEOPage} from '~/data/seo-pages';

interface CustomIntentLandingTemplateProps {
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

export function CustomIntentLandingTemplate({
  page,
  products,
}: CustomIntentLandingTemplateProps) {
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

  const textSections = page.sections.filter((s) => s.type === 'text');

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
          <Link to="/custom-token" prefetch="intent">
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

      {/* Custom Token Feature Block — directly below hero */}
      <div className="container-standard pb-16">
        <CustomTokenFeatureBlock copy={page.customTokenBlock} />
      </div>

      {/* Reviews Callout */}
      <div className="container-standard pb-16">
        <ReviewsCallout variant="banner" />
      </div>

      {/* Text sections — the two-paths explanation and distinctive content */}
      {textSections.length > 0 && (
        <div className="container-standard pb-16 space-y-16">
          {textSections.map((section, index) => (
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

      {/* Product Showcase — secondary, labeled "Or shop ready-made" */}
      {products.length > 0 && (
        <div className="container-standard pb-16">
          <section>
            <h2 className="font-display text-subsection text-white mb-2">
              Or shop ready-made
            </h2>
            <p className="text-white/40 text-sm mb-8 max-w-2xl">
              Prefer something off the shelf? Browse our handcrafted collection
              — every token is built to the same premium standard as our custom
              work.
            </p>
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
            Ready to start designing?
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
            Your story deserves a token made for it — not pulled from a catalog.
            The custom flow takes about 5 minutes.
          </p>
          <Link to="/custom-token" prefetch="intent">
            <Button
              variant="primary"
              size="lg"
              className="!bg-accent !text-black"
            >
              Start Designing
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
