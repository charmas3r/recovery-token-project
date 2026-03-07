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
import {buildMeta} from '~/lib/meta';

export const meta: MetaFunction = () => {
  return buildMeta({
    title: 'Testimonials — Coinplugz',
    description:
      'Hear from members of our community about how recovery tokens have become meaningful companions on their sobriety journey.',
  });
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
        item: 'https://coinplugz.com/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'About',
        item: 'https://coinplugz.com/about',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Testimonials',
        item: 'https://coinplugz.com/about/testimonials',
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
                color: '#FFFF93',
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
                fontWeight: 700,
                color: '#FFFFFF',
                lineHeight: 1.1,
                marginBottom: '1rem',
              }}
              className="text-[2rem] md:text-[3rem]"
            >
              Words From Our Community
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
              gap: '1.5rem',
              maxWidth: '56rem',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
            className="grid-cols-1 md:grid-cols-2"
          >
            {TESTIMONIALS.map((testimonial) => (
              <div
                key={testimonial.id}
                className="rounded-2xl p-6 border border-white/[0.08]"
                style={{background: 'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)'}}
              >
                <div className="mb-4">
                  <Quote
                    className="w-8 h-8"
                    style={{color: '#FFFF93', opacity: 0.3}}
                  />
                </div>

                <p
                  style={{
                    fontSize: '1.0625rem',
                    lineHeight: 1.7,
                    color: '#FFFFFF',
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
                        color: '#FFFFFF',
                        fontSize: '0.9375rem',
                      }}
                    >
                      {testimonial.name}
                    </p>
                    {testimonial.location && (
                      <p
                        style={{
                          color: 'rgba(255,255,255,0.5)',
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
                      backgroundColor: '#FFFF9315',
                      color: '#FFFF93',
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
            Your Story Matters
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
            Share Your Recovery Journey
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
