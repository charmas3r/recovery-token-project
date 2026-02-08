/**
 * FAQ Page — /support/faq
 *
 * Frequently asked questions organized by category with accordion UI.
 * Includes FAQPage schema.org structured data for rich search results.
 */

import {useState, useMemo, useRef} from 'react';
import {Link} from 'react-router';
import type {MetaFunction} from 'react-router';
import {Breadcrumbs} from '~/components/ui/Breadcrumbs';
import {JsonLd} from '~/components/seo/JsonLd';
import {Accordion, AccordionItem} from '~/components/ui/Accordion';
import {Button} from '~/components/ui/Button';
import {FadeUp} from '~/components/ui/Animations';
import {FAQ_ITEMS, FAQ_CATEGORIES, type FAQCategory} from '~/data/faq';

export const meta: MetaFunction = () => {
  return [
    {title: 'FAQ — Recovery Token Store'},
    {
      name: 'description',
      content:
        'Find answers to frequently asked questions about Recovery Token Store — orders, shipping, returns, engraving, product details, and account help.',
    },
    {
      property: 'og:title',
      content: 'Frequently Asked Questions — Recovery Token Store',
    },
    {
      property: 'og:description',
      content:
        'Answers to common questions about orders, shipping, returns, engraving, and more.',
    },
    {property: 'og:type', content: 'website'},
    {name: 'twitter:card', content: 'summary_large_image'},
  ];
};

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState<FAQCategory | null>(
    null,
  );
  const contentRef = useRef<HTMLDivElement>(null);

  // Group FAQs by category
  const groupedFaqs = useMemo(() => {
    const groups: Record<FAQCategory, typeof FAQ_ITEMS> = {} as Record<
      FAQCategory,
      typeof FAQ_ITEMS
    >;
    for (const category of FAQ_CATEGORIES) {
      groups[category] = FAQ_ITEMS.filter((item) => item.category === category);
    }
    return groups;
  }, []);

  // Categories to display
  const displayCategories = activeCategory
    ? [activeCategory]
    : FAQ_CATEGORIES;

  // Handle category pill click
  const handleCategoryClick = (category: FAQCategory | null) => {
    setActiveCategory(category);
    if (contentRef.current) {
      contentRef.current.scrollIntoView({behavior: 'smooth', block: 'start'});
    }
  };

  // Schema.org FAQPage data
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

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
        name: 'FAQ',
        item: 'https://recoverytokenstore.com/support/faq',
      },
    ],
  };

  return (
    <div className="min-h-screen bg-white">
      <JsonLd data={faqJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      {/* Header Section */}
      <section className="bg-surface py-12 md:py-16">
        <div className="container-standard">
          <Breadcrumbs
            items={[
              {label: 'Support', href: '/support'},
              {label: 'FAQ'},
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
              Frequently Asked Questions
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
              We Have Answers
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
              Browse our most commonly asked questions. Can&apos;t find what
              you&apos;re looking for? Our support team is happy to help.
            </p>
          </div>
        </div>
      </section>

      {/* Category Filter Pills */}
      <section className="py-6 border-b border-black/5 sticky top-0 bg-white z-10">
        <div className="container-standard">
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => handleCategoryClick(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === null
                  ? 'bg-accent text-white'
                  : 'bg-surface text-secondary hover:text-primary hover:bg-surface/80'
              }`}
              style={{minHeight: '44px'}}
            >
              All
            </button>
            {FAQ_CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === category
                    ? 'bg-accent text-white'
                    : 'bg-surface text-secondary hover:text-primary hover:bg-surface/80'
                }`}
                style={{minHeight: '44px'}}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-12 md:py-16" ref={contentRef}>
        <div className="container-standard" style={{maxWidth: '48rem'}}>
          {displayCategories.map((category) => (
            <FadeUp key={category}>
              <div className="mb-10 last:mb-0">
                <h2 className="font-display text-xl font-bold text-primary mb-4">
                  {category}
                </h2>
                <Accordion type="single">
                  {groupedFaqs[category].map((item) => (
                    <AccordionItem
                      key={item.id}
                      id={item.id}
                      trigger={item.question}
                    >
                      {item.answer}
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </FadeUp>
          ))}
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
            Still Have Questions?
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
            We Are Happy to Help
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
                Contact Us
              </Button>
            </Link>
            <Link to="/support/shipping-returns">
              <Button variant="secondary" size="lg">
                Shipping &amp; Returns
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
