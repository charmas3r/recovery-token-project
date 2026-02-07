/**
 * ArticleContent - Renders structured content blocks into styled HTML
 *
 * Supports headings, paragraphs (with inline links), quotes, lists,
 * callouts, and product CTA blocks. Uses container-prose max-width
 * for readable line length.
 */

import {Link} from 'react-router';
import {Info, Lightbulb} from 'lucide-react';
import {ProductCTABlock} from '~/components/resources/ProductCTABlock';
import type {ContentBlock, InlineContent} from '~/data/articles';

interface ArticleContentProps {
  blocks: ContentBlock[];
}

function renderInlineContent(content: InlineContent[]): React.ReactNode[] {
  return content.map((item, index) => {
    if (typeof item === 'string') {
      return <span key={index}>{item}</span>;
    }
    if (item.type === 'link') {
      return (
        <Link
          key={index}
          to={item.href}
          className="text-accent hover:text-accent/80 underline underline-offset-2 transition-colors"
        >
          {item.text}
        </Link>
      );
    }
    return null;
  });
}

export function ArticleContent({blocks}: ArticleContentProps) {
  return (
    <div className="max-w-[640px] mx-auto">
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'heading':
            if (block.level === 2) {
              return (
                <h2
                  key={index}
                  id={block.id}
                  className="font-display text-2xl md:text-[1.75rem] font-bold text-primary mt-12 mb-4 scroll-mt-24"
                >
                  {block.text}
                </h2>
              );
            }
            return (
              <h3
                key={index}
                id={block.id}
                className="font-display text-xl font-bold text-primary mt-8 mb-3 scroll-mt-24"
              >
                {block.text}
              </h3>
            );

          case 'paragraph':
            return (
              <p
                key={index}
                className="text-body text-secondary leading-relaxed mb-4"
              >
                {renderInlineContent(block.content)}
              </p>
            );

          case 'quote':
            return (
              <blockquote
                key={index}
                className="my-6 pl-6 border-l-4 border-accent/40 italic"
              >
                <p className="text-body-lg text-secondary leading-relaxed">
                  {block.text}
                </p>
                {block.attribution && (
                  <footer className="mt-2 text-body-sm text-secondary/70 not-italic">
                    — {block.attribution}
                  </footer>
                )}
              </blockquote>
            );

          case 'list':
            if (block.style === 'ordered') {
              return (
                <ol
                  key={index}
                  className="my-4 pl-6 space-y-2 list-decimal text-body text-secondary leading-relaxed"
                >
                  {block.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ol>
              );
            }
            return (
              <ul
                key={index}
                className="my-4 pl-6 space-y-2 list-disc text-body text-secondary leading-relaxed"
              >
                {block.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            );

          case 'callout': {
            const Icon = block.variant === 'tip' ? Lightbulb : Info;
            return (
              <div
                key={index}
                className={`my-6 rounded-xl p-5 ${
                  block.variant === 'tip'
                    ? 'bg-accent/5 border border-accent/15'
                    : 'bg-blue-50 border border-blue-100'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Icon
                    className={`w-5 h-5 mt-0.5 shrink-0 ${
                      block.variant === 'tip' ? 'text-accent' : 'text-blue-500'
                    }`}
                  />
                  <div>
                    <p className="font-semibold text-primary text-body mb-1">
                      {block.title}
                    </p>
                    <p className="text-body text-secondary leading-relaxed">
                      {block.text}
                    </p>
                  </div>
                </div>
              </div>
            );
          }

          case 'productCTA':
            return (
              <ProductCTABlock
                key={index}
                heading={block.heading}
                description={block.description}
                buttonText={block.buttonText}
                buttonHref={block.buttonHref}
              />
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
