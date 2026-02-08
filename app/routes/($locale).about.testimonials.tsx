/**
 * Testimonials Page — /about/testimonials
 *
 * Customer stories and testimonials about recovery tokens.
 */

import {Link} from 'react-router';
import type {MetaFunction} from 'react-router';
import {Quote} from 'lucide-react';
import {Breadcrumbs} from '~/components/ui/Breadcrumbs';
import {JsonLd} from '~/components/seo/JsonLd';
import {Button} from '~/components/ui/Button';
import {TESTIMONIALS} from '~/data/testimonials';

export const meta: MetaFunction = () => {
  return [
    {title: 'Testimonials — Recovery Token Store'},
    {
      name: 'description',
      content:
        'Hear from members of our community about how recovery tokens have become meaningful companions on their sobriety journey.',
    },
    {
      property: 'og:title',
      content: 'Testimonials — Recovery Token Store',
    },
    {
      property: 'og:description',
      content:
        'Real stories from real people about how recovery tokens support their sobriety journey.',
    },
    {property: 'og:type', content: 'website'},
    {name: 'twitter:card', content: 'summary_large_image'},
  ];
};

export default function TestimonialsPage() {
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
        name: 'About',
        item: 'https://recoverytokenstore.com/about',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Testimonials',
        item: 'https://recoverytokenstore.com/about/testimonials',
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
              {label: 'About', href: '/about'},
              {label: 'Testimonials'},
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
              Community Stories
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
              Words From Our Community
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
              Hear from people who carry recovery tokens as daily reminders
              of their strength, courage, and commitment.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonial Grid */}
      <section className="py-12 md:py-16">
        <div className="container-standard">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1.5rem',
              maxWidth: '56rem',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            {TESTIMONIALS.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-black/5"
              >
                <div className="mb-4">
                  <Quote
                    className="w-8 h-8"
                    style={{color: '#B8764F', opacity: 0.3}}
                  />
                </div>

                <p
                  style={{
                    fontSize: '1.0625rem',
                    lineHeight: 1.7,
                    color: '#1A202C',
                    marginBottom: '1.5rem',
                    fontStyle: 'italic',
                  }}
                >
                  "{testimonial.quote}"
                </p>

                <div className="flex items-center justify-between">
                  <div>
                    <p
                      style={{
                        fontWeight: 600,
                        color: '#1A202C',
                        fontSize: '0.9375rem',
                      }}
                    >
                      {testimonial.name}
                    </p>
                    {testimonial.location && (
                      <p
                        style={{
                          color: '#4A5568',
                          fontSize: '0.8125rem',
                          marginTop: '0.125rem',
                        }}
                      >
                        {testimonial.location}
                      </p>
                    )}
                  </div>
                  <span
                    style={{
                      display: 'inline-block',
                      backgroundColor: '#B8764F15',
                      color: '#B8764F',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {testimonial.milestone}
                  </span>
                </div>
              </div>
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
            Your Story Matters
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
            Share Your Recovery Journey
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
            We would love to hear how your recovery token has been part of
            your journey. Reach out to share your story, or browse our
            collection to find your next milestone token.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <Button variant="primary" size="lg">
                Share Your Story
              </Button>
            </Link>
            <Link to="/collections">
              <Button variant="secondary" size="lg">
                Shop Tokens
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
