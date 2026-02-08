/**
 * About Hub Page — /about
 *
 * Central hub for the About section: Our Story, Why Tokens Matter, and Testimonials.
 */

import {Link} from 'react-router';
import type {MetaFunction} from 'react-router';
import {BookOpen, Heart, MessageCircle, ArrowRight} from 'lucide-react';
import {Breadcrumbs} from '~/components/ui/Breadcrumbs';
import {JsonLd} from '~/components/seo/JsonLd';
import {Button} from '~/components/ui/Button';

export const meta: MetaFunction = () => {
  return [
    {title: 'About Us — Recovery Token Store'},
    {
      name: 'description',
      content:
        'Learn about our mission, discover why recovery tokens matter, and hear stories from our community. Premium tokens celebrating sobriety milestones.',
    },
    {
      property: 'og:title',
      content: 'About Us — Recovery Token Store',
    },
    {
      property: 'og:description',
      content:
        'Learn about our mission, discover why recovery tokens matter, and hear stories from our community.',
    },
    {property: 'og:type', content: 'website'},
    {name: 'twitter:card', content: 'summary_large_image'},
  ];
};

const ABOUT_CARDS = [
  {
    title: 'Our Story',
    description:
      'Learn about our mission to create meaningful, handcrafted tokens that honor the courage and commitment behind every recovery milestone.',
    icon: BookOpen,
    href: '/about/our-story',
    stat: 'Our Mission',
    color: '#B8764F',
  },
  {
    title: 'Why Tokens Matter',
    description:
      'Discover the psychology and tradition behind physical recovery tokens, and why tangible symbols make abstract milestones feel real.',
    icon: Heart,
    href: '/about/why-tokens-matter',
    stat: 'The Science',
    color: '#2D6A4F',
  },
  {
    title: 'Testimonials',
    description:
      'Hear from members of our community about how recovery tokens have become meaningful companions on their journey.',
    icon: MessageCircle,
    href: '/about/testimonials',
    stat: 'Real Stories',
    color: '#4A5568',
  },
];

export default function AboutHubPage() {
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
    ],
  };

  return (
    <div className="min-h-screen bg-white">
      <JsonLd data={breadcrumbJsonLd} />

      {/* Header Section */}
      <section className="bg-surface py-12 md:py-16">
        <div className="container-standard">
          <Breadcrumbs items={[{label: 'About'}]} className="mb-6" />

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
              About Us
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
              Our Mission & Story
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
              We create premium recovery tokens that transform milestones into
              lasting symbols of strength. Learn about who we are, why tokens
              matter, and the community we serve.
            </p>
          </div>
        </div>
      </section>

      {/* About Category Cards */}
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
            {ABOUT_CARDS.map((card) => (
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
            Join Our Community
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
            Every Milestone Deserves Recognition
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
            Whether you are celebrating your first month or your tenth year,
            our tokens are crafted to honor the journey that brought you here.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/collections">
              <Button variant="primary" size="lg">
                Shop Tokens
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="secondary" size="lg">
                Get in Touch
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
