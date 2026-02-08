/**
 * Sanity GROQ Queries + Adapter
 *
 * Fetches articles and glossary terms from Sanity, then adapts them
 * to the existing Article / GlossaryTerm TypeScript types so that
 * rendering components require zero changes.
 */

import {sanityClient} from '~/lib/sanity.server';
import type {
  Article,
  ArticleCategory,
  ContentBlock,
  InlineContent,
} from '~/data/articles';
import type {GlossaryTerm, GlossaryCategory} from '~/data/glossary-terms';

// --- GROQ Queries ---

const ARTICLE_FIELDS = `
  _id,
  title,
  "slug": slug.current,
  category,
  excerpt,
  readTime,
  publishedAt,
  updatedAt,
  metaTitle,
  metaDescription,
  keywords,
  content[] {
    _type,
    _key,
    // headingBlock
    level,
    text,
    "headingId": id.current,
    // paragraphBlock
    content[] {
      ...,
      markDefs[] { ..., href }
    },
    // quoteBlock
    attribution,
    // listBlock
    style,
    items,
    // calloutBlock
    variant,
    // productCTABlock
    heading,
    description,
    buttonText,
    buttonHref
  },
  "relatedSlugs": relatedArticles[]->slug.current
`;

const ALL_ARTICLES_QUERY = `*[_type == "article"] | order(publishedAt asc) {
  ${ARTICLE_FIELDS}
}`;

const ARTICLE_BY_SLUG_QUERY = `*[_type == "article" && slug.current == $slug][0] {
  ${ARTICLE_FIELDS}
}`;

const ALL_GLOSSARY_TERMS_QUERY = `*[_type == "glossaryTerm"] | order(name asc) {
  _id,
  name,
  "slug": slug.current,
  definition,
  category,
  "relatedTerms": relatedTerms[]->slug.current,
  productLink { label, href }
}`;

// --- Sanity Response Types ---

interface SanityPortableTextSpan {
  _type: 'span';
  _key: string;
  text: string;
  marks: string[];
}

interface SanityPortableTextBlock {
  _type: 'block';
  _key: string;
  style: string;
  children: SanityPortableTextSpan[];
  markDefs: Array<{
    _type: string;
    _key: string;
    href?: string;
  }>;
}

interface SanityContentBlock {
  _type: string;
  _key: string;
  // headingBlock
  level?: number;
  text?: string;
  headingId?: string;
  // paragraphBlock
  content?: SanityPortableTextBlock[];
  // quoteBlock
  attribution?: string;
  // listBlock
  style?: string;
  items?: string[];
  // calloutBlock
  title?: string;
  variant?: string;
  // productCTABlock
  heading?: string;
  description?: string;
  buttonText?: string;
  buttonHref?: string;
}

interface SanityArticle {
  _id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  readTime: number;
  publishedAt: string;
  updatedAt: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  content: SanityContentBlock[];
  relatedSlugs: string[] | null;
}

interface SanityGlossaryTerm {
  _id: string;
  name: string;
  slug: string;
  definition: string;
  category: string;
  relatedTerms: string[] | null;
  productLink: {label: string; href: string} | null;
}

// --- Adapters ---

/**
 * Convert Portable Text block → InlineContent[]
 */
function portableTextToInlineContent(
  blocks: SanityPortableTextBlock[],
): InlineContent[] {
  const result: InlineContent[] = [];

  for (const block of blocks) {
    if (block._type !== 'block') continue;

    for (const child of block.children) {
      if (child.marks && child.marks.length > 0) {
        // Check if any mark is a link
        for (const markKey of child.marks) {
          const markDef = block.markDefs?.find((m) => m._key === markKey);
          if (markDef && markDef._type === 'link' && markDef.href) {
            result.push({
              type: 'link',
              text: child.text,
              href: markDef.href,
            });
          } else {
            // Non-link mark (bold, italic), just push text
            result.push(child.text);
          }
        }
      } else {
        result.push(child.text);
      }
    }
  }

  return result;
}

/**
 * Convert a Sanity content block → ContentBlock
 */
function adaptContentBlock(block: SanityContentBlock): ContentBlock {
  switch (block._type) {
    case 'headingBlock':
      return {
        type: 'heading',
        level: (block.level as 2 | 3) || 2,
        text: block.text || '',
        id: block.headingId || '',
      };

    case 'paragraphBlock':
      return {
        type: 'paragraph',
        content: block.content
          ? portableTextToInlineContent(block.content)
          : [],
      };

    case 'quoteBlock':
      return {
        type: 'quote',
        text: block.text || '',
        ...(block.attribution ? {attribution: block.attribution} : {}),
      };

    case 'listBlock':
      return {
        type: 'list',
        style: (block.style as 'ordered' | 'unordered') || 'unordered',
        items: block.items || [],
      };

    case 'calloutBlock':
      return {
        type: 'callout',
        title: block.title || '',
        text: block.text || '',
        variant: (block.variant as 'info' | 'tip') || 'info',
      };

    case 'productCTABlock':
      return {
        type: 'productCTA',
        heading: block.heading || '',
        description: block.description || '',
        buttonText: block.buttonText || '',
        buttonHref: block.buttonHref || '',
      };

    default:
      // Fallback: treat as paragraph
      return {type: 'paragraph', content: []};
  }
}

/**
 * Adapt Sanity article → Article type
 */
function adaptArticle(doc: SanityArticle): Article {
  return {
    id: doc.slug,
    slug: doc.slug,
    title: doc.title,
    category: doc.category as ArticleCategory,
    excerpt: doc.excerpt,
    readTime: doc.readTime,
    publishedAt: doc.publishedAt,
    updatedAt: doc.updatedAt,
    metaTitle: doc.metaTitle,
    metaDescription: doc.metaDescription,
    keywords: doc.keywords || [],
    content: (doc.content || []).map(adaptContentBlock),
    relatedSlugs: doc.relatedSlugs || [],
  };
}

/**
 * Adapt Sanity glossary term → GlossaryTerm type
 */
function adaptGlossaryTerm(doc: SanityGlossaryTerm): GlossaryTerm {
  return {
    id: doc.slug,
    name: doc.name,
    slug: doc.slug,
    definition: doc.definition,
    category: doc.category as GlossaryCategory,
    ...(doc.relatedTerms && doc.relatedTerms.length > 0
      ? {relatedTerms: doc.relatedTerms}
      : {}),
    ...(doc.productLink
      ? {productLink: {label: doc.productLink.label, href: doc.productLink.href}}
      : {}),
  };
}

// --- Public API ---

export async function getArticleBySlug(
  slug: string,
): Promise<Article | null> {
  const doc = await sanityClient.fetch<SanityArticle | null>(
    ARTICLE_BY_SLUG_QUERY,
    {slug},
  );
  if (!doc) return null;
  return adaptArticle(doc);
}

export async function getAllArticles(): Promise<Article[]> {
  const docs = await sanityClient.fetch<SanityArticle[]>(ALL_ARTICLES_QUERY);
  return docs.map(adaptArticle);
}

export async function getRelatedArticles(article: Article): Promise<Article[]> {
  if (!article.relatedSlugs || article.relatedSlugs.length === 0) return [];

  const docs = await sanityClient.fetch<SanityArticle[]>(
    `*[_type == "article" && slug.current in $slugs] {
      ${ARTICLE_FIELDS}
    }`,
    {slugs: article.relatedSlugs},
  );

  return docs.map(adaptArticle);
}

export function getHeadings(
  article: Article,
): {id: string; text: string; level: 2 | 3}[] {
  return article.content
    .filter(
      (block): block is Extract<ContentBlock, {type: 'heading'}> =>
        block.type === 'heading',
    )
    .map((block) => ({id: block.id, text: block.text, level: block.level}));
}

export async function getAllGlossaryTerms(): Promise<GlossaryTerm[]> {
  const docs = await sanityClient.fetch<SanityGlossaryTerm[]>(
    ALL_GLOSSARY_TERMS_QUERY,
  );
  return docs.map(adaptGlossaryTerm);
}
