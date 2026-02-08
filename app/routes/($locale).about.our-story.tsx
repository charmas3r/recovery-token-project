/**
 * Our Story Page — /about/our-story
 *
 * The brand narrative: mission, values, origin, and differentiators.
 */

import {Link} from 'react-router';
import type {MetaFunction} from 'react-router';
import {Gem, Heart, Users, Check} from 'lucide-react';
import {Breadcrumbs} from '~/components/ui/Breadcrumbs';
import {JsonLd} from '~/components/seo/JsonLd';
import {Button} from '~/components/ui/Button';

export const meta: MetaFunction = () => {
  return [
    {title: 'Our Story — Recovery Token Store'},
    {
      name: 'description',
      content:
        'Discover our mission to create premium, handcrafted recovery tokens that honor sobriety milestones. Learn about our values, our beginning, and what sets us apart.',
    },
    {
      property: 'og:title',
      content: 'Our Story — Recovery Token Store',
    },
    {
      property: 'og:description',
      content:
        'Discover our mission to create premium recovery tokens that honor sobriety milestones.',
    },
    {property: 'og:type', content: 'website'},
    {name: 'twitter:card', content: 'summary_large_image'},
  ];
};

const VALUES = [
  {
    title: 'Craftsmanship',
    description:
      'Every token is designed with intention and manufactured to the highest standards. We believe the quality of the object should match the magnitude of the achievement it represents.',
    icon: Gem,
    color: '#B8764F',
  },
  {
    title: 'Empathy',
    description:
      'We understand that recovery is deeply personal. Our team approaches every decision — from design to customer service — with compassion and respect for the journey.',
    icon: Heart,
    color: '#2D6A4F',
  },
  {
    title: 'Community',
    description:
      'Recovery does not happen in isolation. We are proud to serve a community built on mutual support, and we strive to strengthen those connections through our work.',
    icon: Users,
    color: '#4A5568',
  },
];

const DIFFERENTIATORS = [
  'Premium materials and finishes that feel substantial in your hand',
  'Designs created specifically for the recovery community, not generic templates',
  'Custom engraving options to make every token uniquely yours',
  'Thoughtful packaging designed for gifting and celebration',
  'A team that genuinely understands and respects the recovery journey',
  'Discreet shipping for customers who value privacy',
];

export default function OurStoryPage() {
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
        name: 'Our Story',
        item: 'https://recoverytokenstore.com/about/our-story',
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
              {label: 'Our Story'},
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
              Our Story
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
              Built on Purpose, Crafted with Care
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
              We believe every day of sobriety is an achievement worth
              honoring. Our tokens are designed to make those milestones
              tangible, beautiful, and lasting.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-16 md:py-20">
        <div className="container-standard">
          <div
            style={{
              maxWidth: '48rem',
              marginLeft: 'auto',
              marginRight: 'auto',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                borderLeft: '4px solid #B8764F',
                paddingLeft: '2rem',
                paddingTop: '1rem',
                paddingBottom: '1rem',
                textAlign: 'left',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-display, serif)',
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  color: '#1A202C',
                  lineHeight: 1.5,
                  fontStyle: 'italic',
                }}
              >
                "Our mission is to create recovery tokens that are as
                extraordinary as the people who earn them — objects worthy of
                the courage, resilience, and daily commitment that sobriety
                demands."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-12 md:py-16 bg-surface">
        <div className="container-standard">
          <div
            style={{
              textAlign: 'center',
              marginBottom: '3rem',
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
              What Drives Us
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-display, serif)',
                fontSize: '2rem',
                fontWeight: 700,
                color: '#1A202C',
                lineHeight: 1.2,
              }}
            >
              Our Values
            </h2>
          </div>

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
            {VALUES.map((value) => (
              <div
                key={value.title}
                className="bg-white rounded-2xl p-6 shadow-sm border border-black/5"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{backgroundColor: `${value.color}15`}}
                  >
                    <value.icon
                      className="w-6 h-6"
                      style={{color: value.color}}
                    />
                  </div>
                </div>

                <h3 className="font-display text-lg font-bold text-primary mb-2">
                  {value.title}
                </h3>

                <p className="text-body text-secondary leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Beginning */}
      <section className="py-16 md:py-20">
        <div className="container-standard">
          <div
            style={{
              maxWidth: '48rem',
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
              Where It Started
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-display, serif)',
                fontSize: '2rem',
                fontWeight: 700,
                color: '#1A202C',
                lineHeight: 1.2,
                marginBottom: '1.5rem',
              }}
            >
              Our Beginning
            </h2>

            <div className="space-y-4">
              <p
                style={{
                  fontSize: '1.0625rem',
                  lineHeight: 1.7,
                  color: '#4A5568',
                }}
              >
                Recovery Token Store was born from a simple observation: the
                tokens available to celebrate sobriety milestones did not
                reflect the magnitude of the achievement. Standard chips
                and medallions served their purpose, but we believed people
                in recovery deserved something more — something premium,
                beautiful, and built to last a lifetime.
              </p>
              <p
                style={{
                  fontSize: '1.0625rem',
                  lineHeight: 1.7,
                  color: '#4A5568',
                }}
              >
                We started with a handful of designs and a deep respect for
                the recovery community. Every token was crafted with input
                from people in recovery, sponsors, therapists, and families
                who understand what these milestones truly mean.
              </p>
              <p
                style={{
                  fontSize: '1.0625rem',
                  lineHeight: 1.7,
                  color: '#4A5568',
                }}
              >
                Today, we are proud to offer a curated collection of premium
                recovery tokens that people carry with them daily, display
                on their nightstands, and give as gifts to the people they
                love. Each token is a testament to the strength it took to
                earn it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What Sets Us Apart */}
      <section className="py-12 md:py-16 bg-surface">
        <div className="container-standard">
          <div
            style={{
              maxWidth: '48rem',
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
              The Difference
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-display, serif)',
                fontSize: '2rem',
                fontWeight: 700,
                color: '#1A202C',
                lineHeight: 1.2,
                marginBottom: '1.5rem',
              }}
            >
              What Sets Us Apart
            </h2>

            <div className="space-y-3">
              {DIFFERENTIATORS.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{backgroundColor: '#B8764F15'}}
                  >
                    <Check className="w-3.5 h-3.5" style={{color: '#B8764F'}} />
                  </div>
                  <p
                    style={{
                      fontSize: '1.0625rem',
                      lineHeight: 1.6,
                      color: '#4A5568',
                    }}
                  >
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 md:py-20">
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
            Ready to Explore?
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
            Find the Perfect Token
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
            Browse our collection of premium recovery tokens, or reach out
            to learn more about custom engraving and bulk orders.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/collections">
              <Button variant="primary" size="lg">
                Shop Tokens
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="secondary" size="lg">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
