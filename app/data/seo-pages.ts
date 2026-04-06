/**
 * SEO Landing Pages — Type Definitions & Data Store
 *
 * All page content lives here as a Map<string, SEOPage>.
 * CMS migration: replace getSEOPage() with a Sanity/CMS fetch.
 */

export type SEOPageType = 'commercial' | 'milestone' | 'glossary';

export type SchemaType = 'breadcrumb' | 'faq' | 'definedTerm' | 'webPage';

export interface FAQItem {
  question: string;
  answer: string;
}

export interface ContentSection {
  type: 'text' | 'productShowcase' | 'comparison' | 'testimonial' | 'cta';
  heading?: string;
  body: string;
  productHandles?: string[];
  collectionHandle?: string;
}

export interface SEOPage {
  slug: string;
  type: SEOPageType;
  title: string;
  metaTitle: string;
  metaDescription: string;
  canonicalPath: string;

  eyebrow: string;
  heroDescription: string;
  sections: ContentSection[];
  faq: FAQItem[];

  primaryCTA: {
    label: string;
    href: string;
  };
  featuredCollectionHandle?: string;
  featuredProductHandles?: string[];
  relatedPageSlugs: string[];

  milestone?: {
    duration: string;
    significance: string;
    traditionalColor?: string;
    nextMilestoneSlug?: string;
    prevMilestoneSlug?: string;
  };

  glossary?: {
    definition: string;
    extendedContent: string;
    category: string;
    relatedTermSlugs: string[];
    productLink?: string;
  };

  schema: SchemaType[];
}

// --- Data Store ---

const SEO_PAGES = new Map<string, SEOPage>();

export function getSEOPage(slug: string): SEOPage | undefined {
  return SEO_PAGES.get(slug);
}

export function getAllSEOPages(): SEOPage[] {
  return Array.from(SEO_PAGES.values());
}

export function getSEOPagesByType(type: SEOPageType): SEOPage[] {
  return getAllSEOPages().filter((p) => p.type === type);
}

/**
 * Register a page in the data store.
 * Called at module level by page data files.
 */
export function registerSEOPage(page: SEOPage): void {
  SEO_PAGES.set(page.slug, page);
}

// ============================================================
// COMMERCIAL LANDING PAGES
// ============================================================

registerSEOPage({
  slug: 'sobriety-coins',
  type: 'commercial',
  title: 'Sobriety Coins',
  metaTitle: 'Sobriety Coins — Premium Recovery Tokens | Coinplugz',
  metaDescription:
    'Shop handcrafted sobriety coins and recovery tokens. Premium quality chips celebrating every milestone from 24 hours to 25+ years. Free shipping.',
  canonicalPath: 'sobriety-coins',
  eyebrow: 'Recovery Tokens',
  heroDescription:
    "Handcrafted sobriety coins that honor every step of your recovery journey. From your first 24 hours to decades of strength, each token is a tangible reminder of how far you've come.",
  primaryCTA: {label: 'Shop All Coins', href: '/collections/all'},
  featuredCollectionHandle: 'all',
  relatedPageSlugs: [
    'aa-coins',
    'na-coins',
    'recovery-medallions',
    'recovery-gifts',
    '1-year-sobriety-coin',
  ],
  sections: [
    {
      type: 'text',
      heading: 'What Are Sobriety Coins?',
      body: "Sobriety coins — also known as recovery tokens, chips, or medallions — are physical tokens that mark milestones in the recovery journey. Rooted in the traditions of Alcoholics Anonymous and other 12-step programs, these coins serve as a powerful, tangible reminder of commitment and progress.\n\nEach coin represents a specific milestone: 24 hours, 30 days, 90 days, 6 months, 1 year, and beyond. Carrying a sobriety coin is a daily affirmation — a small but mighty symbol that recovery is real, one day at a time.",
    },
    {type: 'productShowcase', heading: 'Featured Sobriety Coins', body: ''},
    {
      type: 'text',
      heading: 'Why Sobriety Coins Matter',
      body: "The tradition of sobriety coins dates back to the 1940s, and their significance has only grown. A coin in your pocket is a constant companion — something to reach for in moments of temptation, something to hold during moments of gratitude.\n\nAt Coinplugz, we believe every milestone deserves to be celebrated with something beautiful. Our coins are handcrafted with premium materials, designed to be treasured for a lifetime.",
    },
  ],
  faq: [
    {
      question: 'What is a sobriety coin?',
      answer:
        'A sobriety coin (also called a recovery token, chip, or medallion) is a physical token given to mark milestones in recovery from addiction. They originated in Alcoholics Anonymous in the 1940s and are now used across many recovery programs.',
    },
    {
      question: 'What milestones do sobriety coins celebrate?',
      answer:
        "Common milestones include 24 hours, 1 week, 30 days, 60 days, 90 days, 6 months, 9 months, and then yearly anniversaries from 1 year onward. Some programs also recognize 18 months.",
    },
    {
      question: 'Do I have to be in AA to carry a sobriety coin?',
      answer:
        'No. While sobriety coins originated in AA, anyone in recovery can carry one. They are meaningful for anyone who wants a tangible reminder of their commitment to sobriety, regardless of program affiliation.',
    },
    {
      question: 'What are sobriety coins made of?',
      answer:
        'Sobriety coins are typically made from bronze, nickel, brass, or aluminum. Premium medallions may be gold or silver plated. At Coinplugz, we use high-quality materials and handcrafted processes for lasting durability.',
    },
  ],
  schema: ['breadcrumb', 'faq', 'webPage'],
});

registerSEOPage({
  slug: 'aa-coins',
  type: 'commercial',
  title: 'AA Coins & Medallions',
  metaTitle: 'AA Coins & Medallions — Alcoholics Anonymous Chips | Coinplugz',
  metaDescription:
    'Shop AA coins, chips, and medallions for every milestone. Premium Alcoholics Anonymous recovery tokens handcrafted to celebrate your sobriety journey.',
  canonicalPath: 'aa-coins',
  eyebrow: 'Alcoholics Anonymous',
  heroDescription:
    'Premium AA coins and medallions crafted to honor your sobriety milestones. From the first 24-hour chip to multi-decade anniversaries, celebrate your AA journey with tokens as meaningful as your recovery.',
  primaryCTA: {label: 'Shop AA Coins', href: '/collections/all'},
  featuredCollectionHandle: 'all',
  relatedPageSlugs: [
    'sobriety-coins',
    'na-coins',
    'aa-chip-colors',
    'sponsor-gifts',
    '1-year-sobriety-coin',
    '90-day-sobriety-coin',
  ],
  sections: [
    {
      type: 'text',
      heading: 'The Tradition of AA Coins',
      body: 'AA coins have been a cornerstone of Alcoholics Anonymous since the 1940s. These small but powerful tokens are presented at meetings to recognize members who reach sobriety milestones — a tradition that transforms an abstract achievement into something you can hold in your hand.\n\nWhether you call them AA chips, AA medallions, or AA tokens, they all carry the same weight: proof that recovery is possible, one day at a time.',
    },
    {type: 'productShowcase', heading: 'Shop AA Coins', body: ''},
    {
      type: 'text',
      heading: 'AA Chips vs. AA Medallions',
      body: 'In AA tradition, "chips" typically refer to the simpler, lightweight tokens given at meetings — often made of plastic or aluminum. "Medallions" are the premium, collectible versions — made from bronze, brass, or plated metals, often carried daily as a personal talisman.\n\nAt Coinplugz, all our AA coins are medallion-quality: handcrafted, weighty, and built to last a lifetime.',
    },
  ],
  faq: [
    {
      question: 'What are AA chips?',
      answer:
        'AA chips are small tokens given at Alcoholics Anonymous meetings to mark sobriety milestones. They come in different colors representing different time periods, from 24 hours to multiple years.',
    },
    {
      question: 'What is the difference between AA chips and AA medallions?',
      answer:
        'AA chips are typically simpler tokens (sometimes plastic or aluminum) given at meetings. AA medallions are premium, collectible versions made from higher-quality metals like bronze or gold-plated brass. Both celebrate the same milestones.',
    },
    {
      question: 'What does "To Thine Own Self Be True" mean on AA coins?',
      answer:
        "This inscription, from Shakespeare's Hamlet, appears on many AA medallions. In the context of recovery, it means staying honest with yourself about your journey — a core principle of the AA program.",
    },
  ],
  schema: ['breadcrumb', 'faq', 'webPage'],
});

registerSEOPage({
  slug: 'recovery-gifts',
  type: 'commercial',
  title: 'Recovery Gifts',
  metaTitle: 'Recovery Gifts — Meaningful Sobriety Gifts | Coinplugz',
  metaDescription:
    'Find meaningful recovery gifts for someone celebrating sobriety. Handcrafted tokens, personalized coins, and milestone gifts that honor their journey.',
  canonicalPath: 'recovery-gifts',
  eyebrow: 'Gift Guide',
  heroDescription:
    "Looking for a meaningful gift for someone in recovery? Our handcrafted recovery tokens make a lasting, personal gift that celebrates their strength and commitment to sobriety.",
  primaryCTA: {label: 'Shop Recovery Gifts', href: '/collections/all'},
  featuredCollectionHandle: 'all',
  relatedPageSlugs: [
    'sobriety-gifts-for-women',
    'sobriety-gifts-for-men',
    'sponsor-gifts',
    'custom-sobriety-coins',
    '1-year-sobriety-coin',
  ],
  sections: [
    {
      type: 'text',
      heading: 'Why Recovery Tokens Make the Best Gifts',
      body: "A recovery gift should honor the journey without trivializing it. Recovery tokens are one of the few gifts that truly understand the weight of what sobriety means — they're rooted in decades of tradition, carried daily as a personal talisman, and designed to last a lifetime.\n\nWhether you're a sponsor celebrating a sponsee's milestone, a family member honoring a loved one, or a friend showing support, a recovery token says \"I see your strength, and I'm proud of you.\"",
    },
    {type: 'productShowcase', heading: 'Popular Recovery Gifts', body: ''},
    {
      type: 'text',
      heading: 'Gift Ideas by Occasion',
      body: "For sobriety anniversaries: Choose a milestone-specific coin matching their clean time — 30 days, 1 year, 5 years, and beyond.\n\nFor sponsors or sponsees: A personalized engraved coin with a meaningful date or message creates a one-of-a-kind keepsake.\n\nFor holidays and birthdays: Recovery tokens make thoughtful gifts that go beyond generic presents — they acknowledge the most important gift of all: sobriety.",
    },
  ],
  faq: [
    {
      question: 'What is a good gift for someone in recovery?',
      answer:
        "A recovery token or sobriety coin is one of the most meaningful gifts. It's personal, rooted in recovery tradition, and serves as a daily reminder of their strength. You can choose a milestone-specific coin or a custom engraved token.",
    },
    {
      question: 'Is it appropriate to give a sobriety gift?',
      answer:
        "Yes. Acknowledging someone's recovery milestone with a thoughtful gift shows support and respect for their journey. Sobriety coins have a long tradition as celebration gifts in the recovery community.",
    },
    {
      question: 'Can I engrave a personal message on a recovery token?',
      answer:
        'Yes! At Coinplugz, we offer custom engraving so you can add a sobriety date, name, or personal message to make the gift truly unique.',
    },
  ],
  schema: ['breadcrumb', 'faq', 'webPage'],
});

// ============================================================
// MILESTONE LANDING PAGES
// ============================================================

registerSEOPage({
  slug: '24-hour-chip',
  type: 'milestone',
  title: '24 Hour Sobriety Chip',
  metaTitle: '24 Hour Sobriety Chip — The First Step | Coinplugz',
  metaDescription:
    'The 24 hour chip marks the most important day — day one. Shop premium 24-hour sobriety coins and desire chips that honor the courage to begin.',
  canonicalPath: '24-hour-chip',
  eyebrow: '24 Hour Milestone',
  heroDescription:
    "The most important chip you'll ever receive. The 24-hour coin marks the beginning — the courageous decision to start. Also known as the desire chip or surrender chip, this token represents the bravest step in recovery.",
  primaryCTA: {label: 'Shop 24 Hour Chips', href: '/collections/all'},
  featuredCollectionHandle: 'all',
  relatedPageSlugs: ['sobriety-coins', 'aa-coins', 'aa-chip-colors', 'early-recovery-chips'],
  sections: [
    {
      type: 'text',
      heading: 'What Is a 24 Hour Chip?',
      body: "The 24-hour chip — sometimes called the desire chip or surrender chip — is given to anyone who has a desire to stop drinking or using. In AA, it's traditionally a white chip, and picking it up at a meeting is a public declaration: \"I want to change.\"\n\nIt's the most given chip in recovery, and the most meaningful. Every long-term recovery story started with this single, brave step.",
    },
    {
      type: 'text',
      heading: 'How to Celebrate 24 Hours',
      body: 'Twenty-four hours may seem small, but it\'s everything. Many people in long-term recovery say the first day was the hardest — and the most transformative.\n\nCelebrate by picking up a chip at a meeting. Carry it with you as a daily reminder. Give one to someone taking their first step. That small coin carries immense power.',
    },
  ],
  faq: [
    {
      question: 'What does a 24 hour chip mean?',
      answer:
        'A 24-hour chip (also called a desire chip) signifies the decision to begin recovery. It represents 24 hours of sobriety and the courage to take the first step.',
    },
    {
      question: 'What color is the 24 hour chip in AA?',
      answer:
        'In AA tradition, the 24-hour chip is typically white, symbolizing a fresh start and new beginnings.',
    },
    {
      question: 'Who gives you a 24 hour chip?',
      answer:
        'The 24-hour chip is typically picked up voluntarily at an AA or NA meeting. Anyone with a desire to stop drinking or using can ask for one — no prior sobriety time is required.',
    },
  ],
  milestone: {
    duration: '24 Hours',
    significance:
      "The first 24 hours of sobriety is the hardest and the bravest. It's the moment you decide that today will be different. This chip represents not just a day without substances, but the birth of a new way of living. Every recovery journey — no matter how many years — started right here.",
    traditionalColor: 'White',
    nextMilestoneSlug: 'early-recovery-chips',
  },
  schema: ['breadcrumb', 'faq', 'webPage'],
});

registerSEOPage({
  slug: '1-year-sobriety-coin',
  type: 'milestone',
  title: '1 Year Sobriety Coin',
  metaTitle: '1 Year Sobriety Coin — Celebrate 365 Days | Coinplugz',
  metaDescription:
    'Celebrate 1 year of sobriety with a premium recovery coin. Shop handcrafted one-year AA medallions and anniversary tokens. Free shipping.',
  canonicalPath: '1-year-sobriety-coin',
  eyebrow: '1 Year Milestone',
  heroDescription:
    "One full year. 365 days of choosing recovery, growth, and transformation. The 1-year sobriety coin is one of the most celebrated milestones in recovery — and one of the most meaningful gifts you can give.",
  primaryCTA: {label: 'Shop 1 Year Coins', href: '/collections/all'},
  featuredCollectionHandle: 'all',
  relatedPageSlugs: ['sobriety-coins', 'recovery-gifts', 'custom-sobriety-coins', 'aa-coins'],
  sections: [
    {
      type: 'text',
      heading: 'The Significance of 1 Year Sober',
      body: "Reaching one year of sobriety is a monumental achievement. It means you've navigated every season, every holiday, every trigger — and you're still here, still choosing recovery.\n\nIn AA tradition, the one-year medallion is presented at a meeting with special recognition. It's a moment of deep pride — not just for the recipient, but for everyone who supported them along the way.",
    },
    {
      type: 'text',
      heading: 'Gift Ideas for a 1 Year Anniversary',
      body: 'A 1-year sobriety coin makes the perfect anniversary gift. Consider adding a personal engraving with the sobriety date or an encouraging message.\n\nFor sponsors: presenting a premium medallion to your sponsee is a powerful tradition. For family members: a beautifully crafted coin says "I noticed, and I\'m proud."',
    },
  ],
  faq: [
    {
      question: 'What color is the 1 year sobriety coin?',
      answer:
        'In AA tradition, the 1-year coin is typically bronze. This is the first "annual" medallion and marks the transition from monthly milestones to yearly celebrations.',
    },
    {
      question: 'How do you celebrate 1 year of sobriety?',
      answer:
        "Common celebrations include picking up a medallion at an AA meeting, having dinner with sober friends and sponsors, sharing your story at a meeting, and reflecting on how far you've come. Many people also receive a sobriety coin as a gift from a loved one.",
    },
    {
      question: 'Is 1 year sober a big deal?',
      answer:
        "Absolutely. One year of sobriety is one of the most celebrated milestones in recovery. It represents a full cycle of navigating life's challenges without substances and building a strong foundation for long-term recovery.",
    },
  ],
  milestone: {
    duration: '1 Year',
    significance:
      "One year of sobriety is a triumph that deserves the highest celebration. You've walked through 365 days of challenges, growth, and transformation. You've proven — to yourself and to everyone watching — that a new way of living is not just possible, but beautiful. This coin represents an entire year of daily choices, each one a victory.",
    traditionalColor: 'Bronze',
    prevMilestoneSlug: '9-month-sobriety-coin',
    nextMilestoneSlug: '2-year-sobriety-coin',
  },
  schema: ['breadcrumb', 'faq', 'webPage'],
});

registerSEOPage({
  slug: '90-day-sobriety-coin',
  type: 'milestone',
  title: '90 Day Sobriety Coin',
  metaTitle: '90 Day Sobriety Coin — 3 Months of Recovery | Coinplugz',
  metaDescription:
    'Celebrate 90 days sober with a premium recovery coin. The 90-day chip marks a major milestone in early recovery. Free shipping on all orders.',
  canonicalPath: '90-day-sobriety-coin',
  eyebrow: '90 Day Milestone',
  heroDescription:
    'Three months. A full quarter-year of recovery. The 90-day sobriety coin marks one of the most critical milestones in early recovery — the point where new habits begin to solidify and the path forward becomes clearer.',
  primaryCTA: {label: 'Shop 90 Day Coins', href: '/collections/all'},
  featuredCollectionHandle: 'all',
  relatedPageSlugs: [
    'sobriety-coins',
    'aa-coins',
    '30-day-sobriety-coin',
    '6-month-sobriety-coin',
  ],
  sections: [
    {
      type: 'text',
      heading: 'Why 90 Days Matters',
      body: "In recovery circles, 90 days is often considered the first truly significant milestone. Research suggests it takes roughly 90 days for the brain to begin resetting from the effects of substance use. Many treatment programs are built around a 90-day model for this reason.\n\nThe 90-day chip is more than a token — it's evidence that the initial storm of early recovery can be weathered.",
    },
    {
      type: 'text',
      heading: 'The 90-Day Chip Tradition',
      body: "In AA, the 90-day chip is traditionally green — symbolizing growth and renewal. It's a turning point: by 90 days, many people have established a home group, found a sponsor, and begun working the steps.\n\nReaching 90 days often sparks a shift from \"surviving\" to \"living\" in recovery.",
    },
  ],
  faq: [
    {
      question: 'What color is the 90 day chip in AA?',
      answer:
        'The 90-day chip in AA is traditionally green, symbolizing growth, renewal, and new life.',
    },
    {
      question: 'Why is 90 days important in recovery?',
      answer:
        'Research suggests it takes about 90 days for the brain to begin significant healing from substance use. The 90-day mark is also when new habits start to solidify, making it a critical milestone in building a foundation for long-term recovery.',
    },
  ],
  milestone: {
    duration: '90 Days',
    significance:
      "Ninety days marks a turning point in recovery. The hardest days are behind you, and the brain is beginning to heal. At three months sober, you're not just abstaining — you're building a new life. This coin represents the moment recovery shifts from survival to growth.",
    traditionalColor: 'Green',
    prevMilestoneSlug: '60-day-sobriety-coin',
    nextMilestoneSlug: '6-month-sobriety-coin',
  },
  schema: ['breadcrumb', 'faq', 'webPage'],
});

// ============================================================
// GLOSSARY DETAIL PAGES
// ============================================================

registerSEOPage({
  slug: 'resources/glossary/sobriety-coin',
  type: 'glossary',
  title: 'Sobriety Coin',
  metaTitle: 'What Is a Sobriety Coin? — Definition & History | Coinplugz',
  metaDescription:
    'Learn what a sobriety coin is, its history in AA, and why recovery tokens matter. Comprehensive guide to sobriety coins, chips, and medallions.',
  canonicalPath: 'resources/glossary/sobriety-coin',
  eyebrow: 'Tokens & Coins',
  heroDescription:
    'A sobriety coin is a physical token marking milestones in recovery from addiction, originating in Alcoholics Anonymous.',
  primaryCTA: {label: 'Shop Sobriety Coins', href: '/collections/all'},
  relatedPageSlugs: ['sobriety-coins', 'aa-coins'],
  sections: [],
  faq: [
    {
      question: 'Where can I get a sobriety coin?',
      answer:
        'Sobriety coins can be received at AA or NA meetings, or purchased from specialty retailers like Coinplugz for personal milestones or as gifts.',
    },
  ],
  glossary: {
    definition: 'A physical token given to mark milestones in recovery from addiction.',
    extendedContent:
      "Sobriety coins — also known as recovery tokens, medallions, or chips — are small coins awarded to individuals who reach specific milestones in their recovery journey. The tradition began in Alcoholics Anonymous in the 1940s and has since spread to Narcotics Anonymous, Celebrate Recovery, and many other programs.\n\nThe most iconic sobriety coin features the Serenity Prayer on one side and the AA triangle (representing Unity, Service, and Recovery) on the other. The inscription \"To Thine Own Self Be True\" appears on many AA medallions as a reminder to stay honest in recovery.\n\nSobriety coins come in various materials — from simple aluminum meeting chips to premium bronze, silver, and gold-plated medallions. Many people carry their coin daily as a tangible reminder of their commitment to sobriety.",
    category: 'Tokens & Coins',
    relatedTermSlugs: ['aa-chip', 'clean-time'],
    productLink: 'all',
  },
  schema: ['breadcrumb', 'definedTerm'],
});

registerSEOPage({
  slug: 'resources/glossary/aa-chip',
  type: 'glossary',
  title: 'AA Chip',
  metaTitle: 'What Is an AA Chip? — Colors, Meaning & Tradition | Coinplugz',
  metaDescription:
    "Learn what AA chips are, what the colors mean, and how they're used in Alcoholics Anonymous meetings to celebrate sobriety milestones.",
  canonicalPath: 'resources/glossary/aa-chip',
  eyebrow: 'Tokens & Coins',
  heroDescription:
    'An AA chip is a token given at Alcoholics Anonymous meetings to mark sobriety milestones, with different colors representing different time periods.',
  primaryCTA: {label: 'Shop AA Chips', href: '/collections/all'},
  relatedPageSlugs: ['aa-coins', 'aa-chip-colors'],
  sections: [],
  faq: [
    {
      question: 'What are the AA chip colors in order?',
      answer:
        'Common AA chip colors: White (24 hours/desire), Red (30 days), Gold (60 days), Green (90 days), Purple (6 months), Dark Blue (9 months), Bronze (1 year and annual milestones).',
    },
  ],
  glossary: {
    definition: 'A token given at Alcoholics Anonymous meetings to celebrate sobriety milestones.',
    extendedContent:
      'AA chips are one of the most recognizable symbols of recovery. The chip system was introduced in the 1940s as a way to make sobriety milestones tangible and celebrate progress in front of the community.\n\nDifferent colors represent different time periods. While colors can vary by region and meeting, the most common system is: White for 24 hours (also called the desire or surrender chip), Red for 30 days, Gold for 60 days, Green for 90 days, Purple for 6 months, Dark Blue for 9 months, and Bronze for annual milestones starting at 1 year.\n\nAt meetings, picking up a chip is a moment of community celebration. The person receiving the chip often shares briefly about their journey, and the group responds with applause and encouragement.',
    category: 'Tokens & Coins',
    relatedTermSlugs: ['sobriety-coin', 'clean-time'],
    productLink: 'all',
  },
  schema: ['breadcrumb', 'definedTerm'],
});

registerSEOPage({
  slug: 'resources/glossary/clean-time',
  type: 'glossary',
  title: 'Clean Time',
  metaTitle: 'What Is Clean Time? — Definition & Meaning | Coinplugz',
  metaDescription:
    "Learn what clean time means in recovery, how it's calculated, and why celebrating clean time milestones matters for long-term sobriety.",
  canonicalPath: 'resources/glossary/clean-time',
  eyebrow: 'Recovery Basics',
  heroDescription:
    'Clean time refers to the continuous period someone has been free from substance use, measured from their sobriety date.',
  primaryCTA: {label: 'Shop Milestone Coins', href: '/collections/all'},
  relatedPageSlugs: ['sobriety-coins', '1-year-sobriety-coin'],
  sections: [],
  faq: [],
  glossary: {
    definition: 'The continuous period of time someone has been free from substance use.',
    extendedContent:
      "Clean time is one of the most important concepts in recovery. It represents the unbroken period since a person last used drugs or alcohol, measured from their \"sobriety date\" — the last day they used.\n\nIn Narcotics Anonymous (NA), the term \"clean time\" is preferred over \"sober time,\" reflecting the program's focus on all substances, not just alcohol. In AA, the equivalent term is \"sobriety\" or \"sober time.\"\n\nCelebrating clean time milestones is a core tradition in 12-step programs. Milestones are typically marked at 24 hours, 30 days, 60 days, 90 days, 6 months, 9 months, 1 year, and annually thereafter. Each milestone is often commemorated with a coin, chip, or key tag.\n\nClean time is not a competition — it's a personal measure of progress. Whether someone has 24 hours or 24 years, their clean time is equally valuable.",
    category: 'Recovery Basics',
    relatedTermSlugs: ['sobriety-coin', 'aa-chip'],
    productLink: 'all',
  },
  schema: ['breadcrumb', 'definedTerm'],
});
