/**
 * SEOFaqAccordion
 *
 * Wraps the existing Accordion + AccordionItem components and emits
 * FAQPage JSON-LD structured data for search engine visibility.
 */

import {Accordion, AccordionItem} from '~/components/ui/Accordion';
import {JsonLd} from '~/components/seo/JsonLd';
import type {FAQItem} from '~/data/seo-pages';

interface SEOFaqAccordionProps {
  items: FAQItem[];
  className?: string;
}

export function SEOFaqAccordion({items, className = ''}: SEOFaqAccordionProps) {
  if (items.length === 0) return null;

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <section className={className}>
      <JsonLd data={faqSchema} />
      <h2
        className="font-display text-subsection text-white mb-8"
        style={{textAlign: 'center'}}
      >
        Frequently Asked Questions
      </h2>
      <Accordion type="single" className="max-w-3xl mx-auto">
        {items.map((item) => (
          <AccordionItem
            key={item.question}
            id={item.question.replace(/\s+/g, '-').toLowerCase()}
            trigger={item.question}
          >
            {item.answer}
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
