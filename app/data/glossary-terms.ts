/**
 * Recovery Glossary Terms - Type Definitions
 *
 * Content is now managed in Sanity.io CMS.
 * These types and the GLOSSARY_CATEGORIES constant are used by
 * rendering components and the Sanity adapter.
 */

export type GlossaryCategory =
  | 'Recovery Basics'
  | 'Milestones & Time'
  | 'Tokens & Coins'
  | 'Support & Community'
  | 'Programs & Methods';

export interface GlossaryTerm {
  id: string;
  name: string;
  slug: string;
  definition: string;
  category: GlossaryCategory;
  relatedTerms?: string[];
  productLink?: {
    label: string;
    href: string;
  };
}

export const GLOSSARY_CATEGORIES: GlossaryCategory[] = [
  'Recovery Basics',
  'Milestones & Time',
  'Tokens & Coins',
  'Support & Community',
  'Programs & Methods',
];
