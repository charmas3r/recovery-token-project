/**
 * Token Heritage Articles - Type Definitions
 *
 * Content is now managed in Sanity.io CMS.
 * These types are used by rendering components and the Sanity adapter.
 */

export type ArticleCategory = 'Token Heritage' | 'Recovery Guides';

export type InlineContent = string | {type: 'link'; text: string; href: string};

export type ContentBlock =
  | {type: 'heading'; level: 2 | 3; text: string; id: string}
  | {type: 'paragraph'; content: InlineContent[]}
  | {type: 'quote'; text: string; attribution?: string}
  | {type: 'list'; style: 'ordered' | 'unordered'; items: string[]}
  | {type: 'callout'; title: string; text: string; variant: 'info' | 'tip'}
  | {
      type: 'productCTA';
      heading: string;
      description: string;
      buttonText: string;
      buttonHref: string;
    };

export interface Article {
  id: string;
  slug: string;
  title: string;
  category: ArticleCategory;
  excerpt: string;
  readTime: number;
  publishedAt: string;
  updatedAt: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  content: ContentBlock[];
  relatedSlugs: string[];
}
