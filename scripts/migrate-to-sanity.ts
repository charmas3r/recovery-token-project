/**
 * Migration Script: Static Data → Sanity.io
 *
 * Two-pass approach:
 * 1. Create all documents without cross-references
 * 2. Patch in relatedArticles and relatedTerms references
 *
 * Usage: SANITY_WRITE_TOKEN=<token> npx tsx scripts/migrate-to-sanity.ts
 */

import {createClient} from '@sanity/client';
import {ARTICLES} from '../app/data/articles.js';
import {GLOSSARY_TERMS} from '../app/data/glossary-terms.js';
import type {ContentBlock, InlineContent} from '../app/data/articles.js';

const client = createClient({
  projectId: '7yuseyfn',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN,
});

if (!process.env.SANITY_WRITE_TOKEN) {
  console.error('Error: SANITY_WRITE_TOKEN environment variable is required.');
  console.error('Usage: SANITY_WRITE_TOKEN=<token> npx tsx scripts/migrate-to-sanity.ts');
  process.exit(1);
}

// --- Portable Text Conversion ---

function generateKey(): string {
  return Math.random().toString(36).slice(2, 10);
}

/**
 * Convert InlineContent[] → Portable Text blocks
 * Plain strings → spans with no marks
 * Link objects → spans with link mark annotation
 */
function inlineContentToPortableText(
  content: InlineContent[],
): Array<Record<string, unknown>> {
  const children: Array<Record<string, unknown>> = [];
  const markDefs: Array<Record<string, unknown>> = [];

  for (const item of content) {
    if (typeof item === 'string') {
      children.push({
        _type: 'span',
        _key: generateKey(),
        text: item,
        marks: [],
      });
    } else if (item.type === 'link') {
      const markKey = `link-${generateKey()}`;
      markDefs.push({
        _type: 'link',
        _key: markKey,
        href: item.href,
      });
      children.push({
        _type: 'span',
        _key: generateKey(),
        text: item.text,
        marks: [markKey],
      });
    }
  }

  return [
    {
      _type: 'block',
      _key: generateKey(),
      style: 'normal',
      children,
      markDefs,
    },
  ];
}

/**
 * Convert a ContentBlock → Sanity content block object
 */
function convertContentBlock(
  block: ContentBlock,
): Record<string, unknown> {
  const key = generateKey();

  switch (block.type) {
    case 'heading':
      return {
        _type: 'headingBlock',
        _key: key,
        level: block.level,
        text: block.text,
        id: {_type: 'slug', current: block.id},
      };

    case 'paragraph':
      return {
        _type: 'paragraphBlock',
        _key: key,
        content: inlineContentToPortableText(block.content),
      };

    case 'quote':
      return {
        _type: 'quoteBlock',
        _key: key,
        text: block.text,
        ...(block.attribution ? {attribution: block.attribution} : {}),
      };

    case 'list':
      return {
        _type: 'listBlock',
        _key: key,
        style: block.style,
        items: block.items,
      };

    case 'callout':
      return {
        _type: 'calloutBlock',
        _key: key,
        title: block.title,
        text: block.text,
        variant: block.variant,
      };

    case 'productCTA':
      return {
        _type: 'productCTABlock',
        _key: key,
        heading: block.heading,
        description: block.description,
        buttonText: block.buttonText,
        buttonHref: block.buttonHref,
      };

    default:
      throw new Error(`Unknown block type: ${(block as ContentBlock).type}`);
  }
}

// --- Migration ---

async function migrateArticles() {
  console.log('\n--- Pass 1: Creating articles (without references) ---');

  for (const article of ARTICLES) {
    const docId = `article-${article.slug}`;
    const doc = {
      _id: docId,
      _type: 'article' as const,
      title: article.title,
      slug: {_type: 'slug', current: article.slug},
      category: article.category,
      excerpt: article.excerpt,
      readTime: article.readTime,
      publishedAt: article.publishedAt,
      updatedAt: article.updatedAt,
      metaTitle: article.metaTitle,
      metaDescription: article.metaDescription,
      keywords: article.keywords,
      content: article.content.map(convertContentBlock),
      // relatedArticles added in pass 2
    };

    await client.createOrReplace(doc);
    console.log(`  ✓ Created article: ${article.title}`);
  }
}

async function migrateGlossaryTerms() {
  console.log('\n--- Pass 1: Creating glossary terms (without references) ---');

  for (const term of GLOSSARY_TERMS) {
    const docId = `term-${term.id}`;
    const doc = {
      _id: docId,
      _type: 'glossaryTerm' as const,
      name: term.name,
      slug: {_type: 'slug', current: term.slug},
      definition: term.definition,
      category: term.category,
      ...(term.productLink
        ? {
            productLink: {
              label: term.productLink.label,
              href: term.productLink.href,
            },
          }
        : {}),
      // relatedTerms added in pass 2
    };

    await client.createOrReplace(doc);
    console.log(`  ✓ Created term: ${term.name}`);
  }
}

async function patchArticleReferences() {
  console.log('\n--- Pass 2: Patching article references ---');

  for (const article of ARTICLES) {
    if (article.relatedSlugs.length === 0) continue;

    const docId = `article-${article.slug}`;
    const relatedArticles = article.relatedSlugs.map((slug) => ({
      _type: 'reference',
      _ref: `article-${slug}`,
      _key: generateKey(),
    }));

    await client
      .patch(docId)
      .set({relatedArticles})
      .commit();

    console.log(
      `  ✓ Patched ${article.relatedSlugs.length} references on: ${article.title}`,
    );
  }
}

async function patchGlossaryReferences() {
  console.log('\n--- Pass 2: Patching glossary term references ---');

  for (const term of GLOSSARY_TERMS) {
    if (!term.relatedTerms || term.relatedTerms.length === 0) continue;

    const docId = `term-${term.id}`;
    const relatedTerms = term.relatedTerms.map((relatedId) => ({
      _type: 'reference',
      _ref: `term-${relatedId}`,
      _key: generateKey(),
    }));

    await client
      .patch(docId)
      .set({relatedTerms})
      .commit();

    console.log(
      `  ✓ Patched ${term.relatedTerms.length} references on: ${term.name}`,
    );
  }
}

async function main() {
  console.log('Starting Sanity migration...');
  console.log(`Project: 7yuseyfn | Dataset: production`);
  console.log(`Articles to migrate: ${ARTICLES.length}`);
  console.log(`Glossary terms to migrate: ${GLOSSARY_TERMS.length}`);

  // Pass 1: Create documents
  await migrateArticles();
  await migrateGlossaryTerms();

  // Pass 2: Patch references
  await patchArticleReferences();
  await patchGlossaryReferences();

  console.log('\n✅ Migration complete!');
  console.log(`  ${ARTICLES.length} articles created`);
  console.log(`  ${GLOSSARY_TERMS.length} glossary terms created`);
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
