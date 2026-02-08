/**
 * Shipping & Returns Page — /support/shipping-returns
 *
 * Comprehensive shipping methods, policies, and return information.
 */

import {Link} from 'react-router';
import type {MetaFunction} from 'react-router';
import {Truck, Package, Clock, Globe, Check, ArrowRight} from 'lucide-react';
import {Breadcrumbs} from '~/components/ui/Breadcrumbs';
import {JsonLd} from '~/components/seo/JsonLd';
import {Button} from '~/components/ui/Button';
import {FadeUp} from '~/components/ui/Animations';
import {
  SHIPPING_METHODS,
  FREE_SHIPPING_THRESHOLD,
  PROCESSING_INFO,
  INTERNATIONAL_SHIPPING,
  RETURN_POLICY,
  REFUND_INFO,
  EXCHANGE_INFO,
  DAMAGED_ITEMS,
  type PolicySection,
} from '~/data/shipping-returns';

export const meta: MetaFunction = () => {
  return [
    {title: 'Shipping & Returns — Recovery Token Store'},
    {
      name: 'description',
      content:
        'Free shipping on orders over $75. Standard, expedited, and overnight options. Easy 30-day returns for non-personalized items. Learn about our full shipping and return policies.',
    },
    {
      property: 'og:title',
      content: 'Shipping & Returns — Recovery Token Store',
    },
    {
      property: 'og:description',
      content:
        'Free shipping over $75. Standard, expedited, and overnight options. Easy 30-day returns.',
    },
    {property: 'og:type', content: 'website'},
    {name: 'twitter:card', content: 'summary_large_image'},
  ];
};

function PolicySectionBlock({section}: {section: PolicySection}) {
  return (
    <div className="mb-8 last:mb-0">
      <h3 className="font-display text-lg font-bold text-primary mb-4">
        {section.title}
      </h3>
      <ul className="space-y-3">
        {section.content.map((item, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <span className="text-secondary leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ShippingReturnsPage() {
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
        name: 'Support',
        item: 'https://recoverytokenstore.com/support',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Shipping & Returns',
        item: 'https://recoverytokenstore.com/support/shipping-returns',
      },
    ],
  };

  return (
    <div className="min-h-screen bg-white">
      <JsonLd data={breadcrumbJsonLd} />

      {/* Header Section */}
      <section className="bg-surface py-12 md:py-16">
        <div className="container-standard">
          <Breadcrumbs
            items={[
              {label: 'Support', href: '/support'},
              {label: 'Shipping & Returns'},
            ]}
            className="mb-6"
          />

          <div
            style={{
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
              Shipping &amp; Returns
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
              Delivery &amp; Return Policies
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
              Everything you need to know about getting your tokens delivered
              and our hassle-free return process.
            </p>
          </div>
        </div>
      </section>

      {/* Free Shipping Banner */}
      <section className="py-6 bg-accent/5 border-b border-accent/10">
        <div className="container-standard">
          <div className="flex items-center justify-center gap-3">
            <Truck className="w-5 h-5 text-accent" />
            <p className="text-center font-medium text-primary">
              Free standard shipping on all US orders over ${FREE_SHIPPING_THRESHOLD}
            </p>
          </div>
        </div>
      </section>

      {/* Shipping Methods */}
      <section className="py-12 md:py-16">
        <div className="container-standard" style={{maxWidth: '56rem'}}>
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
                Shipping Options
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
                Choose Your Delivery Speed
              </h2>
            </div>
          </FadeUp>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1.5rem',
            }}
          >
            {SHIPPING_METHODS.map((method) => {
              const IconComponent =
                method.id === 'overnight'
                  ? Clock
                  : method.id === 'expedited'
                    ? Package
                    : Truck;
              return (
                <div key={method.id} className="bg-white rounded-2xl p-6 shadow-sm border border-black/5 h-full">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{backgroundColor: '#B8764F15'}}
                  >
                    <IconComponent
                      className="w-6 h-6"
                      style={{color: '#B8764F'}}
                    />
                  </div>
                  <h3 className="font-display text-lg font-bold text-primary mb-1">
                    {method.name}
                  </h3>
                  <p className="text-accent font-semibold text-sm mb-2">
                    {method.deliveryTime}
                  </p>
                  <p className="text-secondary text-sm leading-relaxed mb-3">
                    {method.description}
                  </p>
                  <p className="font-bold text-primary text-lg">
                    {method.price}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Processing & International */}
      <section className="py-12 md:py-16 bg-surface">
        <div className="container-standard" style={{maxWidth: '48rem'}}>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '3rem'}}>
            <FadeUp>
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{backgroundColor: '#B8764F15'}}
                >
                  <Clock className="w-5 h-5" style={{color: '#B8764F'}} />
                </div>
                <div>
                  <PolicySectionBlock section={PROCESSING_INFO} />
                </div>
              </div>
            </FadeUp>
            <FadeUp>
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{backgroundColor: '#2D6A4F15'}}
                >
                  <Globe className="w-5 h-5" style={{color: '#2D6A4F'}} />
                </div>
                <div>
                  <PolicySectionBlock section={INTERNATIONAL_SHIPPING} />
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* Returns Section */}
      <section className="py-12 md:py-16">
        <div className="container-standard" style={{maxWidth: '48rem'}}>
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
                Hassle-Free Returns
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
                Our Return &amp; Exchange Policy
              </h2>
            </div>
          </FadeUp>

          <div className="space-y-2">
            <FadeUp>
              <PolicySectionBlock section={RETURN_POLICY} />
            </FadeUp>
            <FadeUp>
              <PolicySectionBlock section={REFUND_INFO} />
            </FadeUp>
            <FadeUp>
              <PolicySectionBlock section={EXCHANGE_INFO} />
            </FadeUp>
            <FadeUp>
              <PolicySectionBlock section={DAMAGED_ITEMS} />
            </FadeUp>
          </div>
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
            Need More Help?
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
            Questions About Your Order?
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
            Our support team is ready to help with any shipping or return
            questions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <Button variant="primary" size="lg">
                Contact Us
              </Button>
            </Link>
            <Link to="/support/faq">
              <Button variant="secondary" size="lg">
                Browse FAQ
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
