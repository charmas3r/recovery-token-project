/**
 * Recovery Glossary Terms - Static Data
 *
 * 30 recovery terms organized by category for the glossary page.
 * Ready for Sanity.io CMS integration in Phase 2.
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

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  // Recovery Basics
  {
    id: 'sobriety',
    name: 'Sobriety',
    slug: 'sobriety',
    definition:
      'The state of abstaining from alcohol or other substances. Sobriety is both a daily practice and a lifelong journey, celebrated through milestones and supported by community.',
    category: 'Recovery Basics',
    relatedTerms: ['clean-time', 'recovery'],
  },
  {
    id: 'recovery',
    name: 'Recovery',
    slug: 'recovery',
    definition:
      'The ongoing process of overcoming substance use disorder and building a fulfilling, substance-free life. Recovery encompasses physical, mental, emotional, and spiritual healing.',
    category: 'Recovery Basics',
    relatedTerms: ['sobriety', 'clean-time'],
  },
  {
    id: 'clean-time',
    name: 'Clean Time',
    slug: 'clean-time',
    definition:
      'The duration of time a person has been free from substance use. Clean time is tracked from the last date of use and celebrated at key milestones.',
    category: 'Recovery Basics',
    relatedTerms: ['sobriety', 'sobriety-date'],
  },
  {
    id: 'relapse',
    name: 'Relapse',
    slug: 'relapse',
    definition:
      'A return to substance use after a period of sobriety. Relapse is often viewed not as failure but as a common part of the recovery process that can provide valuable learning.',
    category: 'Recovery Basics',
    relatedTerms: ['recovery', 'sobriety'],
  },
  {
    id: 'triggers',
    name: 'Triggers',
    slug: 'triggers',
    definition:
      'People, places, emotions, or situations that create urges to use substances. Identifying and managing triggers is a crucial skill in maintaining sobriety.',
    category: 'Recovery Basics',
    relatedTerms: ['relapse', 'coping-skills'],
  },
  {
    id: 'coping-skills',
    name: 'Coping Skills',
    slug: 'coping-skills',
    definition:
      'Healthy strategies and techniques used to manage stress, cravings, and difficult emotions without turning to substances. Examples include meditation, exercise, journaling, and reaching out to a support network.',
    category: 'Recovery Basics',
    relatedTerms: ['triggers', 'recovery'],
  },

  // Milestones & Time
  {
    id: 'sobriety-date',
    name: 'Sobriety Date',
    slug: 'sobriety-date',
    definition:
      'The specific date marking the beginning of a person\'s current period of continuous sobriety. This date is deeply personal and serves as the foundation for celebrating milestones.',
    category: 'Milestones & Time',
    relatedTerms: ['clean-time', 'anniversary'],
    productLink: {
      label: 'Calculate your milestones',
      href: '/resources/milestone-calculator',
    },
  },
  {
    id: 'anniversary',
    name: 'Anniversary',
    slug: 'anniversary',
    definition:
      'The yearly celebration of one\'s sobriety date. Anniversaries are significant milestones often marked with tokens, ceremonies, and community recognition.',
    category: 'Milestones & Time',
    relatedTerms: ['sobriety-date', 'birthday'],
    productLink: {
      label: 'Shop anniversary tokens',
      href: '/collections',
    },
  },
  {
    id: 'birthday',
    name: 'Birthday (Recovery)',
    slug: 'birthday',
    definition:
      'In recovery communities, a "birthday" refers to the anniversary of one\'s sobriety date rather than their actual date of birth. It celebrates the beginning of a new life in recovery.',
    category: 'Milestones & Time',
    relatedTerms: ['anniversary', 'sobriety-date'],
  },
  {
    id: 'one-day-at-a-time',
    name: 'One Day at a Time',
    slug: 'one-day-at-a-time',
    definition:
      'A foundational recovery principle emphasizing the importance of focusing only on staying sober today, rather than being overwhelmed by the prospect of lifelong sobriety.',
    category: 'Milestones & Time',
    relatedTerms: ['sobriety', 'twenty-four-hours'],
  },
  {
    id: 'twenty-four-hours',
    name: '24-Hour Chip',
    slug: 'twenty-four-hours',
    definition:
      'The first token given in many recovery programs, representing a commitment to stay sober for just one day. Often considered the most important chip a person will ever receive.',
    category: 'Milestones & Time',
    relatedTerms: ['one-day-at-a-time', 'sobriety-coin'],
    productLink: {
      label: 'Shop 24-hour tokens',
      href: '/collections',
    },
  },
  {
    id: 'ninety-in-ninety',
    name: '90 in 90',
    slug: 'ninety-in-ninety',
    definition:
      'A common suggestion for newcomers to attend 90 meetings in 90 days. This intensive period of meeting attendance helps establish a strong foundation in early recovery.',
    category: 'Milestones & Time',
    relatedTerms: ['meeting', 'newcomer'],
  },

  // Tokens & Coins
  {
    id: 'sobriety-coin',
    name: 'Sobriety Coin',
    slug: 'sobriety-coin',
    definition:
      'A physical token, typically a metal coin or medallion, given to mark recovery milestones. Sobriety coins serve as tangible reminders of progress and commitment to recovery.',
    category: 'Tokens & Coins',
    relatedTerms: ['aa-chip', 'recovery-token'],
    productLink: {
      label: 'Browse sobriety coins',
      href: '/collections',
    },
  },
  {
    id: 'aa-chip',
    name: 'AA Chip',
    slug: 'aa-chip',
    definition:
      'A medallion given in Alcoholics Anonymous to commemorate periods of sobriety. AA chips originated in the 1940s and typically come in different colors representing various time milestones.',
    category: 'Tokens & Coins',
    relatedTerms: ['sobriety-coin', 'alcoholics-anonymous'],
    productLink: {
      label: 'Shop AA-style tokens',
      href: '/collections',
    },
  },
  {
    id: 'recovery-token',
    name: 'Recovery Token',
    slug: 'recovery-token',
    definition:
      'A modern term for any physical token or medallion carried as a symbol of recovery. Recovery tokens can be coins, pendants, keychains, or other items that serve as daily reminders of one\'s journey.',
    category: 'Tokens & Coins',
    relatedTerms: ['sobriety-coin', 'aa-chip'],
    productLink: {
      label: 'Shop recovery tokens',
      href: '/collections',
    },
  },
  {
    id: 'medallion',
    name: 'Medallion',
    slug: 'medallion',
    definition:
      'A larger, often more ornate version of a sobriety coin, typically given for significant milestones like yearly anniversaries. Medallions are usually made of higher-quality materials and feature detailed designs.',
    category: 'Tokens & Coins',
    relatedTerms: ['sobriety-coin', 'anniversary'],
    productLink: {
      label: 'Browse medallions',
      href: '/collections',
    },
  },
  {
    id: 'desire-chip',
    name: 'Desire Chip',
    slug: 'desire-chip',
    definition:
      'A chip or token given to someone who expresses a desire to stop drinking or using substances. Taking a desire chip is often the first public step in acknowledging the need for help.',
    category: 'Tokens & Coins',
    relatedTerms: ['twenty-four-hours', 'newcomer'],
  },
  {
    id: 'pocket-piece',
    name: 'Pocket Piece',
    slug: 'pocket-piece',
    definition:
      'A recovery token small enough to carry in a pocket at all times. Many people in recovery find comfort in touching or holding their pocket piece during moments of temptation or stress.',
    category: 'Tokens & Coins',
    relatedTerms: ['recovery-token', 'sobriety-coin'],
    productLink: {
      label: 'Shop pocket tokens',
      href: '/collections',
    },
  },

  // Support & Community
  {
    id: 'sponsor',
    name: 'Sponsor',
    slug: 'sponsor',
    definition:
      'An experienced member of a recovery program who guides and supports a newer member (sponsee) through the recovery process. Sponsors share their experience and help work through the steps.',
    category: 'Support & Community',
    relatedTerms: ['sponsee', 'twelve-steps'],
  },
  {
    id: 'sponsee',
    name: 'Sponsee',
    slug: 'sponsee',
    definition:
      'A person in recovery who is being guided by a more experienced member (sponsor). The sponsor-sponsee relationship is a cornerstone of many twelve-step programs.',
    category: 'Support & Community',
    relatedTerms: ['sponsor', 'newcomer'],
  },
  {
    id: 'meeting',
    name: 'Meeting',
    slug: 'meeting',
    definition:
      'A gathering of people in recovery who come together to share experiences, provide mutual support, and discuss recovery topics. Meetings can be open (anyone welcome) or closed (members only).',
    category: 'Support & Community',
    relatedTerms: ['home-group', 'fellowship'],
  },
  {
    id: 'home-group',
    name: 'Home Group',
    slug: 'home-group',
    definition:
      'A specific meeting that a person regularly attends and considers their primary recovery community. Having a home group provides consistency, accountability, and deeper connections.',
    category: 'Support & Community',
    relatedTerms: ['meeting', 'fellowship'],
  },
  {
    id: 'fellowship',
    name: 'Fellowship',
    slug: 'fellowship',
    definition:
      'The community and bonds formed between people in recovery. Fellowship extends beyond meetings and includes the mutual support, understanding, and shared experience that comes from walking a similar path.',
    category: 'Support & Community',
    relatedTerms: ['meeting', 'home-group'],
  },
  {
    id: 'newcomer',
    name: 'Newcomer',
    slug: 'newcomer',
    definition:
      'A person who is new to recovery or a recovery program. Newcomers are welcomed with open arms and often encouraged to listen, attend meetings regularly, and find a sponsor.',
    category: 'Support & Community',
    relatedTerms: ['desire-chip', 'sponsor'],
  },

  // Programs & Methods
  {
    id: 'alcoholics-anonymous',
    name: 'Alcoholics Anonymous (AA)',
    slug: 'alcoholics-anonymous',
    definition:
      'An international fellowship founded in 1935 that uses a twelve-step program to help people recover from alcoholism. AA meetings are held worldwide and provide peer support for maintaining sobriety.',
    category: 'Programs & Methods',
    relatedTerms: ['twelve-steps', 'aa-chip'],
  },
  {
    id: 'narcotics-anonymous',
    name: 'Narcotics Anonymous (NA)',
    slug: 'narcotics-anonymous',
    definition:
      'A twelve-step program for people recovering from drug addiction. NA follows principles similar to AA but is focused on all forms of substance use rather than alcohol specifically.',
    category: 'Programs & Methods',
    relatedTerms: ['twelve-steps', 'alcoholics-anonymous'],
  },
  {
    id: 'twelve-steps',
    name: 'Twelve Steps',
    slug: 'twelve-steps',
    definition:
      'A set of guiding principles for recovery originally developed by Alcoholics Anonymous. The twelve steps outline a spiritual and practical path for overcoming addiction and building a new way of life.',
    category: 'Programs & Methods',
    relatedTerms: ['alcoholics-anonymous', 'sponsor'],
  },
  {
    id: 'higher-power',
    name: 'Higher Power',
    slug: 'higher-power',
    definition:
      'A personal concept of a power greater than oneself, central to twelve-step programs. A higher power can be God, nature, the recovery community, or any source of strength and guidance beyond the individual.',
    category: 'Programs & Methods',
    relatedTerms: ['twelve-steps', 'serenity-prayer'],
  },
  {
    id: 'serenity-prayer',
    name: 'Serenity Prayer',
    slug: 'serenity-prayer',
    definition:
      '"God, grant me the serenity to accept the things I cannot change, the courage to change the things I can, and the wisdom to know the difference." This prayer is recited at the beginning or end of many recovery meetings.',
    category: 'Programs & Methods',
    relatedTerms: ['higher-power', 'meeting'],
  },
];
