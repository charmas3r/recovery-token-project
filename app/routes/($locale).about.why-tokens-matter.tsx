/**
 * Why Tokens Matter Page — /about/why-tokens-matter
 *
 * The psychology, tradition, and impact of physical recovery tokens.
 */

import {Link} from 'react-router';
import type {MetaFunction} from 'react-router';
import {Brain, History, Sparkles, Check} from 'lucide-react';
import {Breadcrumbs} from '~/components/ui/Breadcrumbs';
import {JsonLd} from '~/components/seo/JsonLd';
import {Button} from '~/components/ui/Button';

export const meta: MetaFunction = () => {
  return [
    {title: 'Why Tokens Matter — Recovery Token Store'},
    {
      name: 'description',
      content:
        'Discover the psychology and tradition behind recovery tokens. Learn why physical symbols help anchor abstract achievements and support long-term sobriety.',
    },
    {
      property: 'og:title',
      content: 'Why Tokens Matter — Recovery Token Store',
    },
    {
      property: 'og:description',
      content:
        'Discover the psychology and tradition behind recovery tokens and why physical symbols matter.',
    },
    {property: 'og:type', content: 'website'},
    {name: 'twitter:card', content: 'summary_large_image'},
  ];
};

const IMPACT_CARDS = [
  {
    title: 'Tangible Progress',
    description:
      'Physical tokens transform abstract time into something you can hold, carry, and see — making progress feel concrete and undeniable.',
    icon: Sparkles,
    color: '#B8764F',
  },
  {
    title: 'Grounding Anchor',
    description:
      'In moments of doubt or temptation, the weight of a token in your pocket serves as an immediate, tactile reminder of how far you have come.',
    icon: Brain,
    color: '#2D6A4F',
  },
  {
    title: 'Shared Tradition',
    description:
      'Tokens connect you to a global community. Every person who carries one shares in a tradition of mutual support and celebration.',
    icon: History,
    color: '#4A5568',
  },
];

const BENEFITS = [
  'Creates a physical anchor for an abstract achievement, making progress feel real',
  'Activates the brain\'s reward system, reinforcing positive behavior and commitment',
  'Serves as a portable reminder during moments of temptation or doubt',
  'Builds a visible collection that tells the story of your journey over time',
  'Provides a meaningful ritual for celebrating milestones with your support community',
  'Offers a private, discreet way to carry your strength with you everywhere',
];

export default function WhyTokensMatterPage() {
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
        name: 'Why Tokens Matter',
        item: 'https://recoverytokenstore.com/about/why-tokens-matter',
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
              {label: 'Why Tokens Matter'},
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
              The Science & Tradition
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
              Why Tokens Matter
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
              Recovery tokens are more than keepsakes. They are grounded in
              psychology, rooted in tradition, and proven to support
              long-term sobriety.
            </p>
          </div>
        </div>
      </section>

      {/* The Psychology */}
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
              The Psychology
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
              Why Physical Objects Anchor Abstract Achievements
            </h2>

            <div className="space-y-4">
              <p
                style={{
                  fontSize: '1.0625rem',
                  lineHeight: 1.7,
                  color: '#4A5568',
                }}
              >
                Sobriety is invisible. You cannot see it, measure it on a
                scale, or point to it on a shelf. This is what makes it both
                remarkable and, at times, difficult to hold onto. A
                recovery token bridges that gap — it makes the invisible
                visible.
              </p>
              <p
                style={{
                  fontSize: '1.0625rem',
                  lineHeight: 1.7,
                  color: '#4A5568',
                }}
              >
                Research in behavioral psychology shows that tangible rewards
                activate the brain's dopamine pathways in ways that abstract
                concepts alone cannot. When you hold a token, your brain
                registers it as real, earned, and valuable. This
                neurological response reinforces the behaviors that led to
                the milestone.
              </p>
              <p
                style={{
                  fontSize: '1.0625rem',
                  lineHeight: 1.7,
                  color: '#4A5568',
                }}
              >
                The tactile nature of a token — its weight, texture, and
                temperature — engages multiple senses simultaneously. This
                multi-sensory experience creates stronger memory
                associations, making your commitment to recovery more
                deeply embedded in your daily consciousness.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Tradition */}
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
              The Tradition
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
              A History Rooted in Community
            </h2>

            <div className="space-y-4">
              <p
                style={{
                  fontSize: '1.0625rem',
                  lineHeight: 1.7,
                  color: '#4A5568',
                }}
              >
                The tradition of recovery tokens dates back to the earliest
                days of Alcoholics Anonymous in the 1940s. Members began
                carrying small tokens — sometimes coins, sometimes
                medallions — as symbols of their commitment and progress.
              </p>
              <p
                style={{
                  fontSize: '1.0625rem',
                  lineHeight: 1.7,
                  color: '#4A5568',
                }}
              >
                Over the decades, the practice of awarding chips at
                milestone meetings became a cornerstone of recovery culture.
                The "surrender chip" given on day one, the 30-day chip, the
                annual medallion — each carries profound meaning not just
                for the recipient but for the entire community that
                witnessed the journey.
              </p>
              <p
                style={{
                  fontSize: '1.0625rem',
                  lineHeight: 1.7,
                  color: '#4A5568',
                }}
              >
                Today, this tradition extends beyond AA to encompass all
                forms of recovery. Modern recovery tokens honor the same
                principles — progress, community, and courage — while
                reflecting the diverse paths people take toward sobriety.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Impact */}
      <section className="py-12 md:py-16">
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
              The Impact
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
              How Tokens Support Recovery
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
            {IMPACT_CARDS.map((card) => (
              <div
                key={card.title}
                className="bg-white rounded-2xl p-6 shadow-sm border border-black/5"
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

                <h3 className="font-display text-lg font-bold text-primary mb-2">
                  {card.title}
                </h3>

                <p className="text-body text-secondary leading-relaxed">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How They Help */}
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
              The Benefits
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
              How Tokens Help Every Day
            </h2>

            <div className="space-y-3">
              {BENEFITS.map((item) => (
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
            Start Your Collection
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
            Find a Token That Speaks to You
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
            Explore our collection of premium recovery tokens, or read
            articles from our community about the recovery journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/collections">
              <Button variant="primary" size="lg">
                Explore Tokens
              </Button>
            </Link>
            <Link to="/resources/articles">
              <Button variant="secondary" size="lg">
                Read Articles
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
