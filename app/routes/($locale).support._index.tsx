/**
 * Support Hub Page — /support
 *
 * Central hub for customer support: FAQ, Shipping & Returns, and Contact.
 */

import {Link} from 'react-router';
import type {MetaFunction} from 'react-router';
import {HelpCircle, Truck, Mail, ArrowRight} from 'lucide-react';
import {Breadcrumbs} from '~/components/ui/Breadcrumbs';
import {JsonLd} from '~/components/seo/JsonLd';
import {Button} from '~/components/ui/Button';

export const meta: MetaFunction = () => {
  return [
    {title: 'Support Center — Recovery Token Store'},
    {
      name: 'description',
      content:
        'Get help with orders, shipping, returns, and more. Browse our FAQ, learn about our shipping policies, or contact our support team.',
    },
    {
      property: 'og:title',
      content: 'Support Center — Recovery Token Store',
    },
    {
      property: 'og:description',
      content:
        'Get help with orders, shipping, returns, and more. Browse our FAQ or contact our support team.',
    },
    {property: 'og:type', content: 'website'},
    {name: 'twitter:card', content: 'summary_large_image'},
  ];
};

const SUPPORT_CARDS = [
  {
    title: 'Frequently Asked Questions',
    description:
      'Find answers to common questions about orders, shipping, engraving, products, and your account.',
    icon: HelpCircle,
    href: '/support/faq',
    stat: '18+ Answers',
    color: '#B8764F',
  },
  {
    title: 'Shipping & Returns',
    description:
      'Learn about shipping methods, delivery times, our return policy, and how to start a return or exchange.',
    icon: Truck,
    href: '/support/shipping-returns',
    stat: 'Full Policy',
    color: '#2D6A4F',
  },
  {
    title: 'Contact Us',
    description:
      'Need personalized help? Reach out to our support team and we will get back to you within 24 hours.',
    icon: Mail,
    href: '/contact',
    stat: '24hr Response',
    color: '#4A5568',
  },
];

export default function SupportHubPage() {
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
    ],
  };

  return (
    <div className="min-h-screen bg-white">
      <JsonLd data={breadcrumbJsonLd} />

      {/* Header Section */}
      <section className="bg-surface py-12 md:py-16">
        <div className="container-standard">
          <Breadcrumbs items={[{label: 'Support'}]} className="mb-6" />

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
              Support Center
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
              How Can We Help?
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
              Find answers to common questions, learn about our shipping and
              return policies, or reach out to our team directly.
            </p>
          </div>
        </div>
      </section>

      {/* Support Category Cards */}
      <section className="py-12 md:py-16">
        <div className="container-standard">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1.5rem',
              maxWidth: '56rem',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            {SUPPORT_CARDS.map((card) => (
              <Link
                key={card.title}
                to={card.href}
                className="block bg-white rounded-2xl p-6 shadow-sm border border-black/5 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 group h-full"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{backgroundColor: `${card.color}15`}}
                  >
                    <card.icon
                      className="w-6 h-6"
                      style={{color: card.color}}
                    />
                  </div>
                </div>

                <h2 className="font-display text-lg font-bold text-primary mb-2 group-hover:text-accent transition-colors">
                  {card.title}
                </h2>

                <p className="text-body text-secondary leading-relaxed mb-4">
                  {card.description}
                </p>

                <span className="inline-flex items-center gap-1.5 text-body-sm font-medium text-accent group-hover:text-accent/80 transition-colors">
                  Learn More
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
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
            Still Need Help?
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
            We Are Here For You
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
            Our support team is available Monday through Friday and typically
            responds within 24 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <Button variant="primary" size="lg">
                Contact Support
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
