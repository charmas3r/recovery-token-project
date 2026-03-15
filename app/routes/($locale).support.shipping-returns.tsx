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
import {buildMeta} from '~/lib/meta';

export const meta: MetaFunction = () => {
  return buildMeta({
    title: 'Shipping & Returns — Coinplugz',
    description:
      'Free shipping on orders over $70. Standard, expedited, and overnight options. Easy 30-day returns for non-personalized items. Learn about our full shipping and return policies.',
  });
};

function PolicySectionBlock({section}: {section: PolicySection}) {
  return (
    <div className="mb-8 last:mb-0">
      <h3 className="font-display text-lg font-bold text-white mb-4">
        {section.title}
      </h3>
      <ul className="space-y-3">
        {section.content.map((item, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <span className="text-white/50 leading-relaxed">{item}</span>
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
        item: 'https://coinplugz.com/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Support',
        item: 'https://coinplugz.com/support',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Shipping & Returns',
        item: 'https://coinplugz.com/support/shipping-returns',
      },
    ],
  };

  return (
    <div className="min-h-screen">
      <JsonLd data={breadcrumbJsonLd} />

      {/* Header Section */}
      <section className="bg-white/[0.03] py-12 md:py-16">
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
                color: '#FFFF93',
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
                fontWeight: 700,
                color: '#FFFFFF',
                lineHeight: 1.1,
                marginBottom: '1rem',
              }}
              className="text-[2rem] md:text-[3rem]"
            >
              Delivery &amp; Return Policies
            </h1>
            <p
              style={{
                fontSize: '1.125rem',
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.5)',
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
            <p className="text-center font-medium text-white">
              Free standard shipping on all US orders over ${FREE_SHIPPING_THRESHOLD}
            </p>
          </div>
        </div>
      </section>

      {/* Shipping Methods */}
      <section className="py-12 md:py-16">
        <div className="container-standard" style={{maxWidth: '56rem'}}>
          <div
            style={{
              textAlign: 'center',
              marginBottom: '2.5rem',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                color: '#FFFF93',
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
                color: '#FFFFFF',
                lineHeight: 1.3,
              }}
            >
              Choose Your Delivery Speed
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gap: '1.5rem',
            }}
            className="grid-cols-1 md:grid-cols-3"
          >
            {SHIPPING_METHODS.map((method) => {
              const IconComponent =
                method.id === 'overnight'
                  ? Clock
                  : method.id === 'expedited'
                    ? Package
                    : Truck;
              return (
                <div key={method.id} className="rounded-2xl p-6 border border-white/[0.08] h-full" style={{background: 'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)'}}>
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{backgroundColor: '#FFFF9315'}}
                  >
                    <IconComponent
                      className="w-6 h-6"
                      style={{color: '#FFFF93'}}
                    />
                  </div>
                  <h3 className="font-display text-lg font-bold text-white mb-1">
                    {method.name}
                  </h3>
                  <p className="text-accent font-semibold text-sm mb-2">
                    {method.deliveryTime}
                  </p>
                  <p className="text-white/50 text-sm leading-relaxed mb-3">
                    {method.description}
                  </p>
                  <p className="font-bold text-white text-lg">
                    {method.price}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Processing & International */}
      <section className="py-12 md:py-16 bg-white/[0.03]">
        <div className="container-standard" style={{maxWidth: '48rem'}}>
          <div style={{display: 'grid', gap: '3rem'}} className="grid-cols-1 md:grid-cols-2">
            <div className="flex items-start gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{backgroundColor: '#FFFF9315'}}
              >
                <Clock className="w-5 h-5" style={{color: '#FFFF93'}} />
              </div>
              <div>
                <PolicySectionBlock section={PROCESSING_INFO} />
              </div>
            </div>
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
          </div>
        </div>
      </section>

      {/* Returns Section */}
      <section className="py-12 md:py-16">
        <div className="container-standard" style={{maxWidth: '48rem'}}>
          <div
            style={{
              textAlign: 'center',
              marginBottom: '2.5rem',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                color: '#FFFF93',
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
                color: '#FFFFFF',
                lineHeight: 1.3,
              }}
            >
              Our Return &amp; Exchange Policy
            </h2>
          </div>

          <div className="space-y-2">
            <PolicySectionBlock section={RETURN_POLICY} />
            <PolicySectionBlock section={REFUND_INFO} />
            <PolicySectionBlock section={EXCHANGE_INFO} />
            <PolicySectionBlock section={DAMAGED_ITEMS} />
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 md:py-20 bg-white/[0.03]">
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
              color: '#FFFF93',
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
              color: '#FFFFFF',
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
              color: 'rgba(255,255,255,0.5)',
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
