/**
 * Seed Script: Missing Glossary Terms → Sanity.io
 *
 * Creates the 8 glossary terms that are referenced by seo-pages.ts and linked
 * from other glossary pages but were never published in Sanity, causing the
 * `/resources/glossary/<term>` routes to 404 (flagged in the SEO audit).
 *
 * Content (name, definition, category, related terms) is sourced from the
 * authoritative entries in app/data/seo-pages.ts.
 *
 * Idempotent: uses createOrReplace, so it is safe to re-run.
 *
 * Usage: SANITY_WRITE_TOKEN=<token> npx tsx scripts/seed-glossary-terms.ts
 */

import {createClient} from '@sanity/client';

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID || '7yuseyfn',
  dataset: process.env.SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN,
});

if (!process.env.SANITY_WRITE_TOKEN) {
  console.error('Error: SANITY_WRITE_TOKEN environment variable is required.');
  console.error(
    'Usage: SANITY_WRITE_TOKEN=<token> npx tsx scripts/seed-glossary-terms.ts',
  );
  process.exit(1);
}

function generateKey(): string {
  return Math.random().toString(36).slice(2, 10);
}

interface SeedTerm {
  slug: string;
  name: string;
  definition: string;
  category: string;
  relatedTermSlugs: string[];
}

const TERMS: SeedTerm[] = [
  {
    slug: 'sober-birthday',
    name: 'Sober Birthday',
    definition:
      "The anniversary of a person's sobriety date, celebrated annually in the recovery community.",
    category: 'Milestones & Time',
    relatedTermSlugs: ['sobriety-date', 'anniversary', 'sobriety-coin'],
  },
  {
    slug: 'accountability',
    name: 'Accountability',
    definition:
      "Taking honest responsibility for one's recovery actions, commitments, and behavior, supported by a sponsor and community.",
    category: 'Support & Community',
    relatedTermSlugs: ['sponsor', 'fellowship', 'home-group'],
  },
  {
    slug: 'milestone',
    name: 'Recovery Milestone',
    definition:
      'A significant achievement in recovery measured by time, typically marked with a sobriety coin or chip.',
    category: 'Milestones & Time',
    relatedTermSlugs: ['sobriety-date', 'anniversary', 'sobriety-coin'],
  },
  {
    slug: 'big-book',
    name: 'Big Book',
    definition:
      'Alcoholics Anonymous\'s foundational text, "Alcoholics Anonymous," first published in 1939 and containing the 12 steps and early members\' stories.',
    category: 'Programs & Methods',
    relatedTermSlugs: ['twelve-steps', 'step-work', 'higher-power'],
  },
  {
    slug: 'step-work',
    name: 'Step Work',
    definition:
      'The active process of working through the 12 steps of a recovery program, typically guided by a sponsor, to address the spiritual and behavioral roots of addiction.',
    category: 'Programs & Methods',
    relatedTermSlugs: ['twelve-steps', 'sponsor', 'making-amends'],
  },
  {
    slug: 'abstinence',
    name: 'Abstinence',
    definition:
      'The complete avoidance of alcohol and drugs as the behavioral foundation of recovery.',
    category: 'Recovery Basics',
    relatedTermSlugs: ['sobriety', 'clean-time', 'recovery'],
  },
  {
    slug: 'making-amends',
    name: 'Making Amends',
    definition:
      'Steps 8 and 9 of the AA 12-step program: making a list of people harmed and, where possible, directly repairing that harm.',
    category: 'Programs & Methods',
    relatedTermSlugs: ['step-work', 'twelve-steps', 'accountability'],
  },
  {
    slug: 'gratitude-list',
    name: 'Gratitude List',
    definition:
      'A daily recovery practice of listing things one is grateful for, used to counter negative thinking and reinforce the positive aspects of sober living.',
    category: 'Programs & Methods',
    relatedTermSlugs: ['one-day-at-a-time', 'recovery', 'accountability'],
  },
];

async function createTerms() {
  console.log('\n--- Pass 1: Creating glossary terms (without references) ---');
  for (const term of TERMS) {
    const doc = {
      _id: `term-${term.slug}`,
      _type: 'glossaryTerm' as const,
      name: term.name,
      slug: {_type: 'slug' as const, current: term.slug},
      definition: term.definition,
      category: term.category,
    };
    await client.createOrReplace(doc);
    console.log(`  ✓ Created term: ${term.name} (term-${term.slug})`);
  }
}

async function patchReferences() {
  console.log('\n--- Pass 2: Patching relatedTerms references ---');
  for (const term of TERMS) {
    if (term.relatedTermSlugs.length === 0) continue;
    const relatedTerms = term.relatedTermSlugs.map((slug) => ({
      _type: 'reference' as const,
      _ref: `term-${slug}`,
      _key: generateKey(),
    }));
    await client.patch(`term-${term.slug}`).set({relatedTerms}).commit();
    console.log(
      `  ✓ Patched ${term.relatedTermSlugs.length} references on: ${term.name}`,
    );
  }
}

async function main() {
  console.log(`Seeding ${TERMS.length} glossary terms to Sanity…`);
  await createTerms();
  await patchReferences();
  console.log(`\n✅ Done. ${TERMS.length} glossary terms created/updated.`);
}

main().catch((err) => {
  console.error('\n❌ Seed failed:', err.message);
  process.exit(1);
});
