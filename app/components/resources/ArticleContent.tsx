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
                  className="font-display text-2xl md:text-[1.75rem] font-bold text-white scroll-mt-24"
                  style={{marginTop: '3.5rem', marginBottom: '1.5rem'}}
                >
                  {block.text}
                </h2>
              );
            }
            return (
              <h3
                key={index}
                id={block.id}
                className="font-display text-xl font-bold text-white scroll-mt-24"
                style={{marginTop: '2.5rem', marginBottom: '1rem'}}
              >
                {block.text}
              </h3>
            );

          case 'paragraph':
            return (
              <p
                key={index}
                className="text-body text-white/50 leading-[1.8]"
                style={{marginBottom: '1.5rem'}}
              >
                {renderInlineContent(block.content)}
              </p>
            );

          case 'quote':
            return (
              <blockquote
                key={index}
                className="border-l-4 border-accent/40 italic"
                style={{marginTop: '1.5rem', marginBottom: '1.5rem', paddingLeft: '1.5rem'}}
              >
                <p className="text-body-lg text-white/50 leading-relaxed">
                  {block.text}
                </p>
                {block.attribution && (
                  <footer className="text-body-sm text-white/40 not-italic" style={{marginTop: '0.5rem'}}>
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
                  className="list-decimal text-body text-white/50 leading-[1.8]"
                  style={{marginTop: '1.5rem', marginBottom: '1.5rem', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem'}}
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
                className="list-disc text-body text-white/50 leading-[1.8]"
                style={{marginTop: '1.5rem', marginBottom: '1.5rem', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem'}}
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
                style={{marginTop: '1.5rem', marginBottom: '1.5rem', padding: '1.25rem'}}
                className={`rounded-xl ${
                  block.variant === 'tip'
                    ? 'bg-accent/10 border border-accent/20'
                    : 'bg-blue-500/10 border border-blue-500/20'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Icon
                    className={`w-5 h-5 mt-0.5 shrink-0 ${
                      block.variant === 'tip' ? 'text-accent' : 'text-blue-500'
                    }`}
                  />
                  <div>
                    <p className="font-semibold text-white text-body mb-1">
                      {block.title}
                    </p>
                    <p className="text-body text-white/50 leading-relaxed">
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

          case 'image':
            return (
              <figure key={index} style={{marginTop: '2rem', marginBottom: '2rem'}}>
                <img
                  src={block.src}
                  alt={block.alt}
                  loading="lazy"
                  className="w-full rounded-xl"
                />
                {block.caption && (
                  <figcaption className="text-center text-body-sm text-white/40 italic" style={{marginTop: '0.75rem'}}>
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
