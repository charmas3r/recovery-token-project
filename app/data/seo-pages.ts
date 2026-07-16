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

/**
 * Per-page copy override for the CustomTokenFeatureBlock component.
 * Each field is optional; omitted fields fall back to the shared default copy
 * defined in CustomTokenFeatureBlock.tsx.
 */
export interface CustomTokenBlockCopy {
  eyebrow?: string;
  headline?: string;
  body?: string;
  primaryCtaLabel?: string;
  secondaryCtaLabel?: string;
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

  /**
   * Which template to render. Only consulted when `type === 'commercial'`.
   * - undefined → CommercialLandingTemplate (legacy, all existing commercial pages)
   * - 'generic-seo' → GenericSEOLandingTemplate (Tier A phrase-match pages)
   * - 'custom-intent' → CustomIntentLandingTemplate (Tier B custom-flow-forward pages)
   */
  template?: 'generic-seo' | 'custom-intent';

  /**
   * Optional per-page override for the CustomTokenFeatureBlock copy.
   * Falls back to the shared default copy in CustomTokenFeatureBlock.tsx when omitted.
   */
  customTokenBlock?: CustomTokenBlockCopy;
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
  metaTitle: 'Sobriety Coins — Premium Recovery Tokens | Custom Milestones',
  metaDescription:
    'Shop handcrafted sobriety coins and recovery tokens. Premium quality chips celebrating every milestone from 24 hours to 25+ years. Free shipping.',
  canonicalPath: 'sobriety-coins',
  eyebrow: 'Recovery Tokens',
  heroDescription:
    "Handcrafted sobriety coins that honor every step of your recovery journey. From your first 24 hours to decades of strength, each token is a tangible reminder of how far you've come.",
  primaryCTA: {label: 'Shop All Coins', href: '/collections/all'},
  featuredCollectionHandle: 'all',
  relatedPageSlugs: [
    'recovery-tokens',
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
      body: "The tradition of sobriety coins dates back to the 1940s, and their significance has only grown. A coin in your pocket is a constant companion — something to reach for in moments of temptation, something to hold during moments of gratitude.\n\nAt Custom Milestones, we believe every milestone deserves to be celebrated with something beautiful. Our coins are handcrafted with premium materials, designed to be treasured for a lifetime.",
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
        'Sobriety coins are typically made from bronze, nickel, brass, or aluminum. Premium medallions may be gold or silver plated. At Custom Milestones, we use high-quality materials and handcrafted processes for lasting durability.',
    },
  ],
  schema: ['breadcrumb', 'faq', 'webPage'],
});

registerSEOPage({
  slug: 'aa-coins',
  type: 'commercial',
  title: 'AA Coins & Medallions',
  metaTitle: 'AA Coins & Medallions — Alcoholics Anonymous Chips | Custom Milestones',
  metaDescription:
    'Shop AA coins, chips, and medallions for every milestone. Premium Alcoholics Anonymous recovery tokens handcrafted to celebrate your sobriety journey.',
  canonicalPath: 'aa-coins',
  eyebrow: 'Alcoholics Anonymous',
  heroDescription:
    'Premium AA coins and medallions crafted to honor your sobriety milestones. From the first 24-hour chip to multi-decade anniversaries, celebrate your AA journey with tokens as meaningful as your recovery.',
  primaryCTA: {label: 'Shop AA Coins', href: '/collections/all'},
  featuredCollectionHandle: 'all',
  relatedPageSlugs: [
    'recovery-tokens',
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
      body: 'In AA tradition, "chips" typically refer to the simpler, lightweight tokens given at meetings — often made of plastic or aluminum. "Medallions" are the premium, collectible versions — made from bronze, brass, or plated metals, often carried daily as a personal talisman.\n\nAt Custom Milestones, all our AA coins are medallion-quality: handcrafted, weighty, and built to last a lifetime.',
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
  metaTitle: 'Recovery Gifts — Meaningful Sobriety Gifts | Custom Milestones',
  metaDescription:
    'Find meaningful recovery gifts for someone celebrating sobriety. Handcrafted tokens, personalized coins, and milestone gifts that honor their journey.',
  canonicalPath: 'recovery-gifts',
  eyebrow: 'Gift Guide',
  heroDescription:
    "Looking for a meaningful gift for someone in recovery? Our handcrafted recovery tokens make a lasting, personal gift that celebrates their strength and commitment to sobriety.",
  primaryCTA: {label: 'Shop Recovery Gifts', href: '/collections/all'},
  featuredCollectionHandle: 'all',
  relatedPageSlugs: [
    'recovery-tokens',
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
        'Yes! At Custom Milestones, we offer custom engraving so you can add a sobriety date, name, or personal message to make the gift truly unique.',
    },
  ],
  schema: ['breadcrumb', 'faq', 'webPage'],
});

registerSEOPage({
  slug: 'na-coins',
  type: 'commercial',
  title: 'NA Coins & Key Tags',
  metaTitle: 'NA Coins & Key Tags — Narcotics Anonymous Recovery Tokens | Custom Milestones',
  metaDescription:
    'Shop NA coins and key tags for every clean-time milestone. Premium Narcotics Anonymous recovery tokens celebrating 30 days to decades of sobriety.',
  canonicalPath: 'na-coins',
  eyebrow: 'Narcotics Anonymous',
  heroDescription:
    'Narcotics Anonymous uses both coins and key tags to mark the milestones that matter. Shop premium NA recovery tokens handcrafted to honor every day of clean time — from 30 days to 30 years.',
  primaryCTA: {label: 'Shop NA Coins', href: '/collections/all'},
  featuredCollectionHandle: 'all',
  relatedPageSlugs: [
    'recovery-tokens',
    'sobriety-coins',
    'aa-coins',
    'recovery-medallions',
    'aa-chip-colors',
    'sponsor-gifts',
    'celebrate-recovery-coins',
  ],
  sections: [
    {
      type: 'text',
      heading: 'NA Coins vs. NA Key Tags',
      body: "One of the distinctive features of Narcotics Anonymous is its use of key tags alongside traditional coins. Key tags are small, plastic, keyed tokens in specific colors — easy to carry on a key ring as a constant reminder of clean time. Coins serve the same purpose in a more classic medallion format.\n\nBoth formats are recognized and celebrated in NA meetings. Many members carry both: a key tag on their keys and a premium coin in their pocket.",
    },
    {type: 'productShowcase', heading: 'Shop NA Recovery Tokens', body: ''},
    {
      type: 'text',
      heading: "How NA's Color System Differs from AA",
      body: "NA and AA share the tradition of color-coded milestones, but the systems differ. NA typically uses white for 30 days (not a 24-hour chip), then orange, green, red, blue, yellow, and black for its color progression. The specific colors can vary by region and intergroup.\n\nWhat never varies is the meaning: each color represents another period of clean time — proof that recovery is possible, one day at a time.",
    },
  ],
  faq: [
    {
      question: 'What is the difference between NA coins and AA coins?',
      answer:
        "Both serve the same purpose — marking sobriety milestones — but the terminology and color systems differ. AA uses the word 'sobriety' and focuses on alcohol; NA uses 'clean time' and addresses all substances. NA also uses key tags as an alternative to coins, while AA primarily uses chips and medallions.",
    },
    {
      question: 'What are NA key tags?',
      answer:
        'NA key tags are small, colored plastic tokens shaped to fit on a key ring, distributed at Narcotics Anonymous meetings to mark clean-time milestones. They come in different colors representing different time periods and are an NA-specific tradition alongside the more common coin format.',
    },
    {
      question: 'What color are NA coins in order?',
      answer:
        'NA coin colors vary by region, but a common system is: White (30 days), Orange (60 days), Green (90 days), Red (6 months), Blue (9 months), Yellow (1 year), and then continuing anniversary colors for 2 years and beyond. Always check with your local intergroup for regional variations.',
    },
    {
      question: 'Can I use an AA coin in NA, or vice versa?',
      answer:
        'Absolutely. Many people in recovery carry coins from multiple programs. The programs themselves are supportive of one another, and the meaning of a sobriety coin transcends any single organization.',
    },
  ],
  schema: ['breadcrumb', 'faq', 'webPage'],
});

registerSEOPage({
  slug: 'recovery-medallions',
  type: 'commercial',
  title: 'Recovery Medallions',
  metaTitle: 'Recovery Medallions — Premium Sobriety Medallions | Custom Milestones',
  metaDescription:
    'Shop premium recovery medallions crafted from bronze, brass, and plated metals. Weighty, beautiful milestones tokens built to be carried for a lifetime.',
  canonicalPath: 'recovery-medallions',
  eyebrow: 'Premium Medallions',
  heroDescription:
    'A medallion is more than a chip — it is a keepsake. Handcrafted from premium metals with substantial weight and lasting detail, our recovery medallions are designed to be carried daily and treasured for a lifetime.',
  primaryCTA: {label: 'Shop Medallions', href: '/collections/all'},
  featuredCollectionHandle: 'all',
  relatedPageSlugs: [
    'recovery-tokens',
    'sobriety-coins',
    'aa-coins',
    'bronze-sobriety-coins',
    'gold-silver-medallions',
    'custom-sobriety-coins',
    'serenity-prayer-coins',
  ],
  sections: [
    {
      type: 'text',
      heading: 'What Makes a Medallion Different from a Chip?',
      body: "In recovery tradition, a \"chip\" typically refers to the lighter, simpler tokens — often plastic or thin aluminum — distributed at meetings for day-to-day milestones. A \"medallion\" is the premium counterpart: heavier, more detailed, crafted from quality metals, and designed to be a personal keepsake rather than a disposable reminder.\n\nThe weight of a medallion is intentional. When you reach into your pocket and feel it, you know it's there. That small moment of contact is a daily recommitment.",
    },
    {type: 'productShowcase', heading: 'Featured Recovery Medallions', body: ''},
    {
      type: 'text',
      heading: 'Materials & Craftsmanship',
      body: "Custom Milestones medallions are cast from bronze, brass, or zinc alloy and finished with meticulous detail. Many feature die-struck reliefs — the Serenity Prayer, the AA triangle, Roman numerals for milestone years — pressed into the metal with sharp clarity that lasts decades.\n\nPremium options include gold plating, silver plating, and antique bronze finishes that develop a beautiful patina over time. Each medallion is inspected before shipping to ensure it meets the standard that milestones deserve.",
    },
  ],
  faq: [
    {
      question: 'What is a recovery medallion?',
      answer:
        "A recovery medallion is a premium, coin-shaped token crafted from quality metals to mark sobriety milestones. Unlike lighter meeting chips, medallions are designed as personal keepsakes — heavier, more detailed, and built to be carried daily for years.",
    },
    {
      question: 'What metal are recovery medallions made from?',
      answer:
        'Most recovery medallions are made from bronze, brass, or zinc alloy. Premium versions are gold or silver plated. Custom Milestones uses die-struck processes for crisp detail that holds up over years of daily carry.',
    },
    {
      question: 'How big are sobriety medallions?',
      answer:
        'Most sobriety medallions are approximately 1.5 inches (38mm) in diameter — the same size as a classic AA chip. This size fits comfortably in a pocket or palm, making them ideal for daily carry.',
    },
    {
      question: 'Are medallions given at AA meetings?',
      answer:
        "Yes. Medallions are often presented at AA meetings for significant milestones — particularly 1 year and annual anniversaries. Some members purchase their own premium medallion as a personal keepsake in addition to any chip received at a meeting.",
    },
  ],
  schema: ['breadcrumb', 'faq', 'webPage'],
});

registerSEOPage({
  slug: 'sobriety-gifts-for-women',
  type: 'commercial',
  title: 'Sobriety Gifts for Women',
  metaTitle: 'Sobriety Gifts for Women — Elegant Recovery Gifts | Custom Milestones',
  metaDescription:
    "Find beautiful sobriety gifts for the women in your life. Elegant, meaningful recovery tokens that celebrate her strength and honor her journey.",
  canonicalPath: 'sobriety-gifts-for-women',
  eyebrow: 'Gifts for Her',
  heroDescription:
    "Recovery is an act of profound courage. Find a gift that honors her strength — a beautifully crafted sobriety token that says, \"I see how hard you've worked, and I'm proud of who you're becoming.\"",
  primaryCTA: {label: 'Shop Gifts for Her', href: '/collections/all'},
  featuredCollectionHandle: 'all',
  relatedPageSlugs: [
    'recovery-gifts',
    'sobriety-gifts-for-men',
    'sponsor-gifts',
    'custom-sobriety-coins',
    'sobriety-coins',
    'recovery-medallions',
  ],
  sections: [
    {
      type: 'text',
      heading: 'Gifts That Honor Her Journey',
      body: "Choosing a sobriety gift for a woman in recovery means choosing something that respects the depth of what she's been through. Recovery tokens strike that balance — they're beautiful enough to be a meaningful keepsake, rooted in real tradition, and carry none of the awkwardness of generic wellness gifts.\n\nA premium sobriety coin says what's hard to put in words: that you see her effort, you respect her path, and you'll keep showing up.",
    },
    {type: 'productShowcase', heading: 'Recovery Gifts for Her', body: ''},
    {
      type: 'text',
      heading: 'How to Choose the Right Sobriety Gift',
      body: "For milestone celebrations (30 days, 6 months, 1 year, etc.): choose a milestone-specific coin that marks exactly where she is. The specificity makes it personal.\n\nFor a sponsor's gift to a sponsee: a coin with a meaningful engraving — her sobriety date or a short phrase you've shared — turns a beautiful object into a deeply personal keepsake.\n\nFor a family member or friend: sometimes the best gift is simply one that acknowledges her recovery exists and matters. A premium recovery token does that without overstepping.",
    },
  ],
  faq: [
    {
      question: 'What is a thoughtful sobriety gift for a woman?',
      answer:
        "A premium sobriety coin or medallion is one of the most thoughtful recovery gifts. It's rooted in real tradition, deeply personal, and something she can carry every day as a reminder of her strength. Adding a custom engraving with her sobriety date or an encouraging message makes it even more meaningful.",
    },
    {
      question: 'Is it appropriate to give a sobriety gift to a woman in recovery?',
      answer:
        "Yes — acknowledging a sobriety milestone is a meaningful gesture. The key is choosing something that honors her journey without making it feel like a medical moment. Recovery tokens have a long tradition as celebration gifts and are widely welcomed in the recovery community.",
    },
    {
      question: 'When should I give a sobriety gift?',
      answer:
        "Sobriety gifts are most common at milestone anniversaries (30 days, 6 months, 1 year, etc.), but they can be given at any time as a gesture of support. Some people give a token at the start of someone's recovery journey as an encouragement rather than a celebration.",
    },
  ],
  schema: ['breadcrumb', 'faq', 'webPage'],
});

registerSEOPage({
  slug: 'sobriety-gifts-for-men',
  type: 'commercial',
  title: 'Sobriety Gifts for Men',
  metaTitle: 'Sobriety Gifts for Men — Meaningful Recovery Gifts | Custom Milestones',
  metaDescription:
    "Find meaningful sobriety gifts for the men in your life. Handcrafted recovery tokens that honor a man's recovery milestone with substance and dignity.",
  canonicalPath: 'sobriety-gifts-for-men',
  eyebrow: 'Gifts for Him',
  heroDescription:
    "Recovery takes grit. Find a gift that matches it — a solid, handcrafted sobriety token that a man can carry in his pocket every day as proof of what he's built.",
  primaryCTA: {label: 'Shop Gifts for Him', href: '/collections/all'},
  featuredCollectionHandle: 'all',
  relatedPageSlugs: [
    'recovery-gifts',
    'sobriety-gifts-for-women',
    'sponsor-gifts',
    'custom-sobriety-coins',
    'bronze-sobriety-coins',
    'recovery-medallions',
  ],
  sections: [
    {
      type: 'text',
      heading: 'A Gift with Weight',
      body: "The best sobriety gifts for men have weight to them — literally. A solid bronze medallion in the pocket is something you feel throughout the day. Every time it shifts, there's a moment of awareness: a reminder of the commitment, the work, and how far things have come.\n\nRecovery tokens have been the go-to sobriety gift in the AA and NA communities for decades, precisely because they carry meaning without sentiment that feels forced.",
    },
    {type: 'productShowcase', heading: 'Recovery Gifts for Him', body: ''},
    {
      type: 'text',
      heading: 'Making It Personal',
      body: "A recovery token becomes unforgettable when it's personalized. Consider engraving his sobriety date on the back — a small detail that transforms a beautiful coin into a one-of-a-kind artifact of his recovery.\n\nFor sponsors gifting a sponsee: adding a brief message that reflects your working relationship makes the token a lasting reminder of that connection. For family members: his name and sobriety date, nothing more — sometimes simplicity is everything.",
    },
  ],
  faq: [
    {
      question: 'What is a good sobriety gift for a man?',
      answer:
        "A handcrafted sobriety coin or bronze medallion is widely regarded as one of the best recovery gifts for men. It's practical (easy to carry), meaningful (rooted in decades of recovery tradition), and lasting (quality metals don't wear out). Custom engraving makes it uniquely his.",
    },
    {
      question: 'What do you say when giving a sobriety gift to a man?',
      answer:
        "Keep it honest and direct. You don't need to say much — the gift says a lot on its own. Something like \"I'm proud of you\" or \"This belongs to you\" is enough. If you've written something personal, a handwritten note alongside the coin adds even more weight.",
    },
    {
      question: 'What sobriety milestones are most commonly celebrated with gifts?',
      answer:
        "30 days, 90 days, 6 months, and 1 year are the most common milestone gifts. Annual anniversaries from 1 year onward are also widely celebrated. That said, any milestone worth celebrating is worth marking — there are no wrong answers.",
    },
  ],
  schema: ['breadcrumb', 'faq', 'webPage'],
});

registerSEOPage({
  slug: 'sponsor-gifts',
  type: 'commercial',
  title: 'Sponsor & Sponsee Gifts',
  metaTitle: 'Sponsor & Sponsee Gifts — Recovery Gifts for AA & NA | Custom Milestones',
  metaDescription:
    'Shop meaningful gifts for sponsors and sponsees. Celebrate the relationship that changes lives with premium sobriety tokens and personalized recovery coins.',
  canonicalPath: 'sponsor-gifts',
  eyebrow: 'Sponsor Gifts',
  heroDescription:
    "The sponsor-sponsee relationship is one of the most powerful bonds in recovery. Find a gift worthy of it — for the sponsor who showed the way, or the sponsee whose growth you've had the honor of witnessing.",
  primaryCTA: {label: 'Shop Sponsor Gifts', href: '/collections/all'},
  featuredCollectionHandle: 'all',
  relatedPageSlugs: [
    'recovery-gifts',
    'sobriety-gifts-for-women',
    'sobriety-gifts-for-men',
    'custom-sobriety-coins',
    'aa-coins',
    'na-coins',
  ],
  sections: [
    {
      type: 'text',
      heading: 'Gifts from Sponsor to Sponsee',
      body: "Presenting a premium medallion to your sponsee at a milestone is a tradition as old as AA itself. It's a tangible expression of what you've witnessed: the growth, the hard nights, the breakthroughs. A coin with their sobriety date engraved on the back transforms a purchase into a permanent artifact of your working relationship.\n\nMany sponsors time the gift to a significant milestone — 30 days, 90 days, 1 year — as a way of making the moment feel seen and celebrated.",
    },
    {type: 'productShowcase', heading: 'Shop Sponsor & Sponsee Gifts', body: ''},
    {
      type: 'text',
      heading: 'Thank-You Gifts from Sponsee to Sponsor',
      body: "Sponsees often look for a way to say thank you — especially at significant milestones or when completing step work. A personalized recovery coin is one of the few gifts that lands right: it's meaningful without being over the top, recovery-rooted without being on the nose.\n\nConsider engraving the sponsor's name, a meaningful phrase from your work together, or simply your sobriety date as a reminder that their guidance helped make it possible.",
    },
  ],
  faq: [
    {
      question: 'What is a good gift for an AA or NA sponsor?',
      answer:
        "A personalized sobriety coin is one of the most meaningful gifts a sponsee can give. Engraving a meaningful date, phrase, or the sponsor's name makes it deeply personal. Sponsors often carry these coins alongside their own as a reminder of the relationships recovery has built.",
    },
    {
      question: 'Do sponsors give coins to sponsees?',
      answer:
        "Yes, this is a long-standing tradition in AA and NA. Sponsors often present a premium medallion to their sponsee at major milestones as a way of marking the moment and honoring the work done together. Some sponsors carry a matching coin as a symbol of the bond.",
    },
    {
      question: 'When should I give a sponsor a gift?',
      answer:
        "Common occasions include your own sobriety anniversary (as a thank-you for their guidance), completing a significant step, or the sponsor's own sobriety anniversary. There's no wrong time to show gratitude — recovery relationships deserve acknowledgment year-round.",
    },
  ],
  schema: ['breadcrumb', 'faq', 'webPage'],
});

registerSEOPage({
  slug: 'custom-sobriety-coins',
  type: 'commercial',
  title: 'Custom & Personalized Sobriety Coins',
  metaTitle: 'Custom Sobriety Coins — Personalized Recovery Tokens | Custom Milestones',
  metaDescription:
    'Design a custom sobriety coin with personalized engraving, dates, and messages. Create a one-of-a-kind recovery token that tells your unique story.',
  canonicalPath: 'custom-sobriety-coins',
  eyebrow: 'Custom Tokens',
  heroDescription:
    "Every recovery story is unique. Your token should be too. Design a custom sobriety coin with personalized engraving — a date, a name, a phrase that means something — and create a keepsake that no one else in the world has.",
  primaryCTA: {label: 'Shop Custom Coins', href: '/collections/all'},
  featuredCollectionHandle: 'all',
  relatedPageSlugs: [
    'sobriety-coins',
    'recovery-gifts',
    'sponsor-gifts',
    'recovery-medallions',
    'sobriety-gifts-for-women',
    'sobriety-gifts-for-men',
  ],
  sections: [
    {
      type: 'text',
      heading: 'What Can Be Personalized?',
      body: "At Custom Milestones, personalization goes beyond a name on the back. You can engrave a sobriety date, a meaningful quote, a first name, initials, or a short message that captures something specific to the recipient's journey.\n\nFor sponsors creating a gift for a sponsee, consider a phrase from your work together. For family members, a simple date and a few words. For yourself, whatever truth belongs on a coin you'll carry every day.",
    },
    {type: 'productShowcase', heading: 'Custom Coin Options', body: ''},
    {
      type: 'text',
      heading: 'The Difference a Custom Coin Makes',
      body: "A standard sobriety coin is already meaningful — it carries decades of recovery tradition. A custom coin carries all of that plus something irreplaceable: the specific story of one person's recovery.\n\nWhen someone opens the box and finds a coin with their exact sobriety date engraved on the back, the effect is immediate. It's not a generic recovery gift — it's evidence that someone paid attention, cared enough to get it right, and marked the moment permanently.",
    },
  ],
  faq: [
    {
      question: 'Can I add a sobriety date to a recovery coin?',
      answer:
        "Yes. At Custom Milestones, you can engrave a specific date, name, or short message on your custom coin. Sobriety date engravings are one of our most popular personalizations — they transform a meaningful object into a one-of-a-kind keepsake.",
    },
    {
      question: 'How long does a custom engraved coin take?',
      answer:
        "Custom orders typically ship within 5-7 business days, depending on the complexity of the engraving. Rush options are available for milestone gifts with approaching dates.",
    },
    {
      question: 'What text can I put on a custom sobriety coin?',
      answer:
        "You can engrave names, dates, initials, short phrases, or milestone numbers. Most coins accommodate up to two lines of text on the reverse side. Our custom coin designer walks you through the options step by step.",
    },
    {
      question: 'Can I design a fully custom coin from scratch?',
      answer:
        "Yes — Custom Milestones offers a custom token design experience where you can choose the material, finish, and personalization details to create a completely unique recovery medallion.",
    },
  ],
  schema: ['breadcrumb', 'faq', 'webPage'],
});

registerSEOPage({
  slug: 'bronze-sobriety-coins',
  type: 'commercial',
  title: 'Bronze Sobriety Coins',
  metaTitle: 'Bronze Sobriety Coins — Classic Recovery Medallions | Custom Milestones',
  metaDescription:
    'Shop bronze sobriety coins and medallions. The classic recovery token material with deep tradition — weighty, durable, and beautiful for daily carry.',
  canonicalPath: 'bronze-sobriety-coins',
  eyebrow: 'Bronze Collection',
  heroDescription:
    "Bronze is the classic sobriety coin material for a reason. Substantial weight, warm color, and a patina that deepens over years of daily carry — a bronze medallion becomes more beautiful the longer it's carried.",
  primaryCTA: {label: 'Shop Bronze Coins', href: '/collections/all'},
  featuredCollectionHandle: 'all',
  relatedPageSlugs: [
    'sobriety-coins',
    'recovery-medallions',
    'gold-silver-medallions',
    'aa-coins',
    '1-year-sobriety-coin',
    'serenity-prayer-coins',
  ],
  sections: [
    {
      type: 'text',
      heading: 'The Tradition of Bronze in Recovery',
      body: "Bronze has been the material of choice for AA one-year medallions since the earliest days of the program. The one-year chip is traditionally bronze across most AA groups — making bronze the first annual milestone metal and one of the most recognized symbols in recovery.\n\nBeyond tradition, bronze earns its place through practicality: it's dense enough to feel substantial in a pocket, durable enough to last decades, and develops a natural patina that makes each coin subtly unique over time.",
    },
    {type: 'productShowcase', heading: 'Bronze Sobriety Coins', body: ''},
    {
      type: 'text',
      heading: 'Why Bronze Ages Beautifully',
      body: "Unlike plated metals that can wear unevenly, solid bronze coins develop a living patina — a natural darkening and richening of color that comes from the oils in your hands, the air, and daily contact. Over years of carry, a bronze sobriety coin becomes uniquely yours: slightly smoother on the high points, deeper in the engraved areas, with a history written into its surface.\n\nMany people in long-term recovery have a bronze medallion that looks nothing like it did when they first received it — and that transformation is part of its meaning.",
    },
  ],
  faq: [
    {
      question: 'Why is the 1-year AA coin bronze?',
      answer:
        "The tradition of the bronze 1-year medallion is rooted in the earliest AA groups. Bronze was chosen for its durability, warmth, and substance — fitting for the most celebrated annual milestone. It distinguishes the 1-year coin from the lighter, often plastic chips used for earlier milestones.",
    },
    {
      question: 'Do bronze sobriety coins tarnish?',
      answer:
        "Bronze develops a patina over time rather than tarnishing in a degrading way. This natural aging process is considered desirable by many collectors and recovery members — the coin takes on a history that reflects its daily carry. If you prefer a brighter finish, occasional light polishing with a soft cloth restores the original color.",
    },
    {
      question: 'How heavy are bronze sobriety coins?',
      answer:
        "A standard 1.5-inch bronze sobriety coin typically weighs 20-35 grams depending on thickness. This substantial weight is one of the defining characteristics — you feel it in your pocket throughout the day, which is exactly the point.",
    },
  ],
  schema: ['breadcrumb', 'faq', 'webPage'],
});

registerSEOPage({
  slug: 'gold-silver-medallions',
  type: 'commercial',
  title: 'Gold & Silver Recovery Medallions',
  metaTitle: 'Gold & Silver Recovery Medallions — Premium Milestone Coins | Custom Milestones',
  metaDescription:
    'Shop gold and silver plated recovery medallions for major milestones. Premium sobriety coins worthy of the most significant anniversaries in recovery.',
  canonicalPath: 'gold-silver-medallions',
  eyebrow: 'Premium Metals',
  heroDescription:
    "Some milestones call for something extraordinary. Our gold and silver plated recovery medallions are the premium choice for major anniversaries — 5 years, 10 years, 20 years, and the decades of work they represent.",
  primaryCTA: {label: 'Shop Premium Medallions', href: '/collections/all'},
  featuredCollectionHandle: 'all',
  relatedPageSlugs: [
    'recovery-medallions',
    'bronze-sobriety-coins',
    'sobriety-coins',
    'custom-sobriety-coins',
    '1-year-sobriety-coin',
    'recovery-gifts',
  ],
  sections: [
    {
      type: 'text',
      heading: 'Gold & Silver for Major Milestones',
      body: "When someone reaches 5 years, 10 years, or a multi-decade anniversary, the milestone deserves recognition that matches its weight. Gold and silver plated medallions step beyond the standard bronze in both appearance and symbolism — they signal that this is not just another year; this is something rare.\n\nIn AA and NA, it's common to see gold and silver coins presented for major annual milestones, often at speaker meetings or special celebrations with the full home group in attendance.",
    },
    {type: 'productShowcase', heading: 'Gold & Silver Medallions', body: ''},
    {
      type: 'text',
      heading: 'Craftsmanship & Finish',
      body: "Custom Milestones gold and silver medallions are die-struck from quality base metals and electroplated to achieve a rich, even finish. The plating process creates a color depth and reflectivity that standard coins can't match — making them photogenic, gift-worthy, and striking on display.\n\nFor collectors of long-term recovery, having a gold medallion for a 5-year or 10-year milestone alongside the bronze coins of earlier years creates a beautiful progression of physical proof.",
    },
  ],
  faq: [
    {
      question: 'Are gold sobriety coins actually made of gold?',
      answer:
        "Most gold sobriety coins are gold-plated — a base metal (usually brass or zinc alloy) coated in a layer of gold electroplating. This achieves the appearance and warmth of gold at a price that makes sense for something carried daily. Solid gold medallions are available as special commissions.",
    },
    {
      question: 'What milestones are gold or silver medallions used for?',
      answer:
        "Gold and silver medallions are most common for major annual milestones — 5 years, 10 years, 15 years, 20 years, and beyond. Some groups also use gold for the 18-month milestone. The specific traditions vary by group and region.",
    },
    {
      question: 'Do gold plated coins wear over time?',
      answer:
        "Gold plating can wear on high-contact areas over years of daily carry. Custom Milestones uses a thick electroplating process to maximize durability. For coins intended primarily for display or special occasions, the finish will remain pristine for many years.",
    },
  ],
  schema: ['breadcrumb', 'faq', 'webPage'],
});

registerSEOPage({
  slug: 'serenity-prayer-coins',
  type: 'commercial',
  title: 'Serenity Prayer Coins',
  metaTitle: 'Serenity Prayer Coins — Recovery Medallions with the Serenity Prayer | Custom Milestones',
  metaDescription:
    'Shop sobriety coins featuring the full Serenity Prayer. Handcrafted recovery medallions carrying the words that guide millions in recovery every day.',
  canonicalPath: 'serenity-prayer-coins',
  eyebrow: 'Serenity Prayer',
  heroDescription:
    'God, grant me the serenity to accept the things I cannot change, the courage to change the things I can, and the wisdom to know the difference. Shop recovery coins that carry these words — close, always.',
  primaryCTA: {label: 'Shop Serenity Prayer Coins', href: '/collections/all'},
  featuredCollectionHandle: 'all',
  relatedPageSlugs: [
    'sobriety-coins',
    'aa-coins',
    'recovery-medallions',
    'bronze-sobriety-coins',
    'custom-sobriety-coins',
    'aa-chip-colors',
  ],
  sections: [
    {
      type: 'text',
      heading: 'The Serenity Prayer in Recovery',
      body: "The Serenity Prayer is perhaps the most widely recited prayer in recovery. Said at the opening of virtually every AA and NA meeting, it distills the philosophy of recovery into 27 words: acceptance, courage, and wisdom.\n\nCarrying those words on a coin means having them accessible in every moment of difficulty — a small, private meeting with yourself when the meeting isn't nearby.",
    },
    {type: 'productShowcase', heading: 'Serenity Prayer Recovery Coins', body: ''},
    {
      type: 'text',
      heading: 'Origin & Meaning',
      body: "The Serenity Prayer is attributed to theologian Reinhold Niebuhr, who wrote it in the early 1940s. AA adopted it shortly after, and it has been inseparable from the recovery community ever since.\n\nThe prayer's power in recovery comes from its simplicity and its practicality. It doesn't promise that hard things will disappear — it offers a framework for deciding what to fight and what to accept. That distinction is at the heart of sustainable recovery.",
    },
  ],
  faq: [
    {
      question: 'What is the Serenity Prayer?',
      answer:
        "The Serenity Prayer reads: \"God, grant me the serenity to accept the things I cannot change, the courage to change the things I can, and the wisdom to know the difference.\" It is used at the opening of most AA and NA meetings and is one of the most recognized phrases in recovery culture.",
    },
    {
      question: 'Who wrote the Serenity Prayer?',
      answer:
        "The Serenity Prayer is attributed to American theologian Reinhold Niebuhr, who is believed to have composed it in the early 1940s. Alcoholics Anonymous adopted it and made it the unofficial prayer of the recovery movement.",
    },
    {
      question: 'Does the full Serenity Prayer fit on a coin?',
      answer:
        "Most sobriety coins feature the short version of the Serenity Prayer: 'God, grant me the serenity to accept the things I cannot change, courage to change the things I can, and wisdom to know the difference.' The full extended version is typically found in printed formats due to space constraints.",
    },
    {
      question: 'Do you need to be religious to use a Serenity Prayer coin?',
      answer:
        "Not at all. Many people in recovery interpret 'God' as a higher power of their own understanding — or simply as the collective strength of the recovery community. The prayer's message of acceptance, courage, and wisdom resonates across a wide range of beliefs.",
    },
  ],
  schema: ['breadcrumb', 'faq', 'webPage'],
});

registerSEOPage({
  slug: 'aa-chip-colors',
  type: 'commercial',
  title: 'AA Chip Colors & Meanings',
  metaTitle: 'AA Chip Colors & Meanings — Complete Color Guide | Custom Milestones',
  metaDescription:
    'The complete guide to AA chip colors and what each one means. White through bronze — learn the sobriety milestone color system used in AA meetings.',
  canonicalPath: 'aa-chip-colors',
  eyebrow: 'Color Guide',
  heroDescription:
    "Every AA chip color tells a story. From the white desire chip that marks day one, to the bronze medallion that marks a full year — here is the complete guide to what each color means and why it matters.",
  primaryCTA: {label: 'Shop AA Chips by Color', href: '/collections/all'},
  featuredCollectionHandle: 'all',
  relatedPageSlugs: [
    'aa-coins',
    'sobriety-coins',
    'na-coins',
    'recovery-medallions',
    'serenity-prayer-coins',
    '90-day-sobriety-coin',
  ],
  sections: [
    {
      type: 'text',
      heading: 'AA Chip Colors in Order',
      body: "The AA chip color system gives each milestone a distinct identity. While colors can vary slightly by region and intergroup, the most widely used system is:\n\n**White** — 24 Hours / Desire Chip. The first chip. Given to anyone who has a desire to stop drinking. Picking up the white chip at a meeting is a public declaration of intent — the most courageous moment in many people's recovery.\n\n**Red** — 30 Days. One month of sobriety. The first monthly milestone and the first evidence that the decision made on day one is holding.\n\n**Gold** — 60 Days. Two months of continuous sobriety. By 60 days, the initial withdrawal has passed and new patterns are beginning to form.\n\n**Green** — 90 Days. Three months. Often called the most critical milestone in early recovery. The brain begins significant healing at this stage, and the foundation of long-term recovery starts to solidify.\n\n**Purple** — 6 Months. Half a year of recovery — proof that the commitment is sustained, not just a fresh start.\n\n**Dark Blue** — 9 Months. Nine months of sobriety. Three-quarters of a year, and a major marker on the way to the first annual medallion.\n\n**Bronze** — 1 Year. The first annual medallion. Bronze is the traditional color for one year across most AA groups — a shift from monthly chips to the yearly milestone that marks full membership in long-term recovery.",
    },
    {type: 'productShowcase', heading: 'Shop AA Chips by Milestone', body: ''},
    {
      type: 'text',
      heading: 'Why Chip Colors Matter',
      body: "The color system in AA does more than organize milestones — it creates a visual language of progress. When someone new walks into a meeting and sees members holding different colored chips, they see proof that the program works: people are staying sober, and for longer and longer.\n\nFor the person receiving the chip, the color is a shorthand for everything they've been through. Walking up to get a green chip means everyone in that room knows what three months looks like. There's no need to explain the work — the color says it.\n\nNote: Chip colors are not standardized by AA World Services and can vary by region, district, and individual group. The system above reflects the most commonly used convention in the United States.",
    },
  ],
  faq: [
    {
      question: 'What are AA chip colors in order?',
      answer:
        'The most common AA chip color sequence is: White (24 hours/desire), Red (30 days), Gold (60 days), Green (90 days), Purple (6 months), Dark Blue (9 months), Bronze (1 year). Colors for subsequent annual milestones vary widely by region.',
    },
    {
      question: 'Do AA chip colors vary by region?',
      answer:
        "Yes. AA World Services does not mandate a specific color system, so chip colors vary by region, district, and even individual group. The White-Red-Gold-Green-Purple-Dark Blue-Bronze sequence is the most common in the United States, but your local meeting may use a different system. When in doubt, ask your group.",
    },
    {
      question: 'What color is the 24-hour AA chip?',
      answer:
        'The 24-hour chip is traditionally white in most AA groups, symbolizing a clean slate and new beginnings. It is also called the desire chip or surrender chip.',
    },
    {
      question: 'What does a bronze AA chip mean?',
      answer:
        "A bronze chip represents one year of continuous sobriety in most AA groups. It is the first annual medallion and marks the transition from monthly milestone tracking to yearly celebrations. Bronze is traditional for this milestone across most of the United States.",
    },
  ],
  schema: ['breadcrumb', 'faq', 'webPage'],
});

registerSEOPage({
  slug: 'sobriety-coin-holders',
  type: 'commercial',
  title: 'Sobriety Coin Holders & Keychains',
  metaTitle: 'Sobriety Coin Holders & Keychains — Recovery Token Accessories | Custom Milestones',
  metaDescription:
    'Shop coin holders, keychain cases, and display options for sobriety coins and recovery medallions. Keep your milestone token close and protected.',
  canonicalPath: 'sobriety-coin-holders',
  eyebrow: 'Accessories',
  heroDescription:
    "Your sobriety coin deserves a home. Shop coin holders, keychain attachments, and display cases that keep your recovery token close, protected, and presented with the dignity it represents.",
  primaryCTA: {label: 'Shop Coin Holders', href: '/collections/all'},
  featuredCollectionHandle: 'all',
  relatedPageSlugs: [
    'sobriety-coins',
    'recovery-medallions',
    'aa-coins',
    'na-coins',
    'custom-sobriety-coins',
    'recovery-gifts',
  ],
  sections: [
    {
      type: 'text',
      heading: 'How People Carry Their Sobriety Coins',
      body: "Most people in recovery carry their coin in a pocket — the same pocket, every day, so reaching in becomes a habit. But there are other options that suit different lifestyles and preferences.\n\nKeychain holders let you keep your coin on your keys, making it impossible to leave behind. Velvet pouches protect a medallion during travel or when it's not being carried actively. Display stands let a coin serve as a daily visual reminder on a desk or nightstand.",
    },
    {type: 'productShowcase', heading: 'Coin Holders & Display Options', body: ''},
    {
      type: 'text',
      heading: 'Display Cases for Long-Term Collections',
      body: "Many people in long-term recovery build a collection of sobriety coins over the years — one for each milestone, year after year. Display cases designed for coins let you arrange them chronologically, turning a collection into a physical timeline of recovery.\n\nSeeing 5 years, 10 years, 15 years laid out in a row is powerful. It turns abstract time into something you can point to.",
    },
  ],
  faq: [
    {
      question: 'How do you carry a sobriety coin?',
      answer:
        "Most people carry their sobriety coin loose in a pocket — usually the same pocket every day so it becomes a habit. Others use a coin holder keychain to keep it attached to their keys, or a pouch for protection. The important thing is that it's close and accessible.",
    },
    {
      question: 'What size holder do I need for a sobriety coin?',
      answer:
        "Standard sobriety coins are 1.5 inches (38mm) in diameter. Most coin holders and cases are designed for this size. If you have a non-standard coin, check the diameter before purchasing a holder.",
    },
    {
      question: 'Can I display my sobriety coins instead of carrying them?',
      answer:
        "Absolutely. Many people in long-term recovery display their collected milestone coins in a shadow box or coin display stand. This creates a visible record of their recovery journey that can serve as daily inspiration.",
    },
  ],
  schema: ['breadcrumb', 'faq', 'webPage'],
});

registerSEOPage({
  slug: 'celebrate-recovery-coins',
  type: 'commercial',
  title: 'Celebrate Recovery Coins',
  metaTitle: 'Celebrate Recovery Coins — CR Recovery Tokens | Custom Milestones',
  metaDescription:
    'Shop Celebrate Recovery coins and tokens. Premium recovery medallions for the CR program rooted in Christ-centered principles and community support.',
  canonicalPath: 'celebrate-recovery-coins',
  eyebrow: 'Celebrate Recovery',
  heroDescription:
    "Celebrate Recovery brings the 12 steps into a Christ-centered community. Shop premium CR recovery coins that honor the milestones of healing and the faith that makes them possible.",
  primaryCTA: {label: 'Shop CR Coins', href: '/collections/all'},
  featuredCollectionHandle: 'all',
  relatedPageSlugs: [
    'sobriety-coins',
    'recovery-medallions',
    'na-coins',
    'aa-coins',
    'recovery-gifts',
    'serenity-prayer-coins',
  ],
  sections: [
    {
      type: 'text',
      heading: 'About Celebrate Recovery',
      body: "Celebrate Recovery (CR) is a Christ-centered, 12-step recovery program founded in 1991 at Saddleback Church by Pastor John Baker. It is now one of the largest recovery programs in the world, with thousands of groups meeting weekly in churches across the United States and internationally.\n\nUnlike AA, which uses a non-denominational higher power, CR explicitly grounds its program in Christian faith — using Scripture alongside the 12 steps to address addiction, codependency, and a wide range of life's hurts, habits, and hang-ups.",
    },
    {type: 'productShowcase', heading: 'Celebrate Recovery Tokens', body: ''},
    {
      type: 'text',
      heading: 'The CR Coin Tradition',
      body: "Like AA and NA, Celebrate Recovery uses coins and tokens to mark milestones in recovery — celebrating progress in community with the acknowledgment that healing is a journey, not an event.\n\nCR coins often carry scriptural references or Christ-centered phrases alongside the milestone markers, reflecting the program's foundation. Many CR members carry their coin as a daily reminder of both their commitment to sobriety and the faith that sustains it.\n\nAt Custom Milestones, our recovery coins are welcomed across recovery programs and traditions — including Celebrate Recovery.",
    },
  ],
  faq: [
    {
      question: 'What is Celebrate Recovery?',
      answer:
        "Celebrate Recovery is a Christ-centered 12-step recovery program founded in 1991. It addresses addiction, codependency, and other life struggles through a combination of the 12 steps and biblical principles. CR meets in churches worldwide and is open to anyone struggling with any hurt, habit, or hang-up.",
    },
    {
      question: 'Does Celebrate Recovery use coins?',
      answer:
        "Yes. Like AA and NA, Celebrate Recovery uses coins or tokens to mark sobriety and recovery milestones. The coin tradition helps make abstract progress tangible and creates moments of community celebration at meetings.",
    },
    {
      question: 'How is Celebrate Recovery different from AA?',
      answer:
        "The primary difference is the spiritual foundation. AA uses a non-denominational concept of a 'higher power,' while Celebrate Recovery explicitly grounds its program in Jesus Christ and Christian Scripture. CR also addresses a broader range of struggles beyond chemical addiction, including codependency, eating disorders, and other behavioral issues.",
    },
    {
      question: 'Can I use a Custom Milestones coin in a Celebrate Recovery program?',
      answer:
        "Yes. Custom Milestones recovery coins are meaningful across recovery programs and traditions. While some CR groups use program-specific coins, our premium recovery tokens are welcomed by CR members looking for a quality medallion to mark their milestones.",
    },
  ],
  schema: ['breadcrumb', 'faq', 'webPage'],
});

registerSEOPage({
  slug: 'recovery-tokens',
  type: 'commercial',
  title: 'Recovery Tokens',
  metaTitle: 'Recovery Tokens — Premium Sobriety Milestone Coins | Custom Milestones',
  metaDescription:
    'Shop premium recovery tokens for every sobriety milestone. Handcrafted coins celebrating 24 hours to 25+ years of recovery. The tradition that makes milestones real.',
  canonicalPath: 'recovery-tokens',
  eyebrow: 'Premium Collection',
  heroDescription:
    "Recovery tokens are the physical proof that milestones matter. From the 24-hour surrender chip to multi-decade anniversary coins, each handcrafted token carries the weight of every day you've chosen recovery. Hold yours and remember why you started.",
  primaryCTA: {label: 'Shop All Recovery Tokens', href: '/collections/all'},
  featuredCollectionHandle: 'all',
  relatedPageSlugs: [
    'sobriety-coins',
    'aa-coins',
    'na-coins',
    'recovery-gifts',
    '1-year-sobriety-coin',
    'recovery-medallions',
  ],
  sections: [
    {
      type: 'text',
      heading: 'What Are Recovery Tokens?',
      body: "Recovery tokens are physical coins, chips, and medallions given to people in recovery from addiction to mark sobriety milestones. The tradition began in Alcoholics Anonymous in the 1940s, when members started handing out small tokens to celebrate clean time — 24 hours, 30 days, 90 days, 1 year, and beyond.\n\nToday, recovery tokens are used across AA, Narcotics Anonymous, Celebrate Recovery, SMART Recovery, and countless other programs worldwide. They go by many names — sobriety coins, AA chips, recovery medallions, clean-time tokens — but they all serve the same purpose: turning an invisible achievement into something you can hold in your hand.\n\nA recovery token isn't just a coin. It's a daily reminder that you chose sobriety today, a talisman to reach for when temptation hits, and a symbol of belonging to a community that understands what it took to get here.",
    },
    {type: 'productShowcase', heading: 'Shop Recovery Tokens', body: ''},
    {
      type: 'text',
      heading: 'Why Premium Recovery Tokens Matter',
      body: "The token you carry every day should feel like it means something. Mass-produced aluminum chips serve their purpose at meetings, but a premium recovery token — handcrafted from bronze, finished with care, weighted to feel substantial in your pocket — becomes something more.\n\nAt Custom Milestones, every recovery token is designed to last a lifetime. We use premium materials and meticulous finishing because the milestone it represents deserves nothing less. When you pull your coin out in a quiet moment, the weight of it should match the weight of what you've accomplished.\n\nMany people in long-term recovery say their token is the most meaningful object they own. Not because of what it cost, but because of what it represents: every hard morning, every meeting attended, every day they chose to keep going.",
    },
    {
      type: 'text',
      heading: 'Recovery Token Milestones',
      body: "Recovery tokens follow a milestone system rooted in decades of 12-step tradition. While colors and designs vary by program and region, the most recognized milestones include:\n\n24 hours (the surrender chip) — the most important token, representing the decision to begin. 30 days, 60 days, and 90 days mark the critical early months. 6 months and 9 months recognize sustained commitment. Then annual milestones begin — 1 year, 2 years, 5 years, 10 years, and beyond.\n\nEach milestone carries its own emotional weight. The 24-hour chip is raw courage. The 1-year coin is proof that it's possible. The 10-year medallion is a testament to a life rebuilt. At Custom Milestones, we craft tokens for every one of these milestones because every single one deserves to be celebrated.",
    },
    {
      type: 'text',
      heading: 'How People Use Recovery Tokens',
      body: "Recovery tokens aren't display pieces — they're daily companions. Most people carry their token in a pocket, wallet, or on a keychain. The act of reaching for it throughout the day creates a physical connection to recovery that no app or calendar reminder can replicate.\n\nAt meetings, receiving a token is a moment of community celebration. The person picks up their chip, the room applauds, and for that moment, the invisible work of staying sober becomes visible to everyone.\n\nMany people also give recovery tokens as gifts — sponsors to sponsees, family members to loved ones, friends supporting someone's journey. A recovery token says what's hard to put into words: I see you, I'm proud of you, and your sobriety matters.",
    },
  ],
  faq: [
    {
      question: 'What is a recovery token?',
      answer:
        'A recovery token is a physical coin or medallion given to mark sobriety milestones in addiction recovery. Also called sobriety coins, AA chips, or recovery medallions, they originated in Alcoholics Anonymous in the 1940s and are now used across many recovery programs worldwide.',
    },
    {
      question: 'What are recovery tokens used for?',
      answer:
        "Recovery tokens serve as tangible reminders of sobriety milestones. People carry them daily in pockets or on keychains as a physical connection to their recovery. They're also presented at meetings to celebrate milestones, given as gifts by sponsors and loved ones, and collected over the years as markers of a recovery journey.",
    },
    {
      question: 'What milestones do recovery tokens celebrate?',
      answer:
        'Common recovery token milestones include 24 hours (the surrender chip), 30 days, 60 days, 90 days, 6 months, 9 months, and annual anniversaries from 1 year onward. Some programs also recognize 1 week and 18 months. At Custom Milestones, we offer premium tokens for every milestone.',
    },
    {
      question: 'Where can I buy recovery tokens?',
      answer:
        'You can buy recovery tokens at Custom Milestones.com. We offer handcrafted, premium-quality sobriety coins and recovery medallions for every milestone. Our tokens are designed to be carried daily and built to last a lifetime. We ship worldwide with free shipping on qualifying orders.',
    },
    {
      question: 'Do recovery tokens only work for AA?',
      answer:
        'No. While recovery tokens originated in Alcoholics Anonymous, they are used across Narcotics Anonymous, Celebrate Recovery, SMART Recovery, and many other programs. Anyone in recovery from addiction can carry a token — program affiliation is not required.',
    },
    {
      question: 'What are recovery tokens made of?',
      answer:
        'Recovery tokens can be made from aluminum, bronze, brass, nickel, or precious metals. At Custom Milestones, we use premium bronze and high-quality finishing for tokens that feel substantial and are built to last. Our handcrafted process ensures each token is worthy of the milestone it represents.',
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
  metaTitle: '24 Hour Sobriety Chip — The First Step | Custom Milestones',
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
  metaTitle: '1 Year Sobriety Coin — Celebrate 365 Days | Custom Milestones',
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
  metaTitle: '90 Day Sobriety Coin — 3 Months of Recovery | Custom Milestones',
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

registerSEOPage({
  slug: 'early-recovery-chips',
  type: 'milestone',
  title: 'Early Recovery Chips',
  metaTitle: 'Early Recovery Chips — First Weeks of Sobriety | Custom Milestones',
  metaDescription:
    'Honor the fragile, powerful first weeks of recovery. Shop early recovery chips for 1-week and other early sobriety milestones. Free shipping.',
  canonicalPath: 'early-recovery-chips',
  eyebrow: 'Early Recovery',
  heroDescription:
    'The first weeks of sobriety are the most fragile and the most powerful. Early recovery chips honor the courage it takes to keep going when everything feels uncertain — one day, one week at a time.',
  primaryCTA: {label: 'Shop Early Recovery Chips', href: '/collections/all'},
  featuredCollectionHandle: 'all',
  relatedPageSlugs: ['sobriety-coins', 'recovery-gifts', '24-hour-chip', '30-day-sobriety-coin'],
  sections: [
    {
      type: 'text',
      heading: 'What Early Recovery Chips Represent',
      body: "The first weeks of sobriety are unlike anything else in recovery. The body is healing, old patterns are losing their grip, and the future feels both terrifying and possible. Early recovery chips — for 1 week, 2 weeks, and other early milestones — exist because these days matter.\n\nEvery week you stay committed in early recovery is a genuine act of courage. These tokens exist to make that invisible struggle visible and celebrated.",
    },
    {
      type: 'text',
      heading: 'How to Celebrate Early Milestones',
      body: "Early milestones deserve real celebration. A 1-week chip might seem small from the outside, but to the person holding it, it represents a week of choosing something different — often the hardest week of their life.\n\nGive a chip at a meeting, share one with a newcomer, or carry one as your own reminder. Whatever role you play in someone's early recovery, honoring these first weeks plants the seeds for everything that follows.",
    },
  ],
  faq: [
    {
      question: 'What milestones are considered early recovery?',
      answer:
        'Early recovery typically covers the first 90 days of sobriety. Common early milestones include 24 hours, 1 week, 2 weeks, and 30 days. Each of these marks a meaningful turning point in the first stage of the recovery journey.',
    },
    {
      question: 'Is there a chip for 1 week of sobriety?',
      answer:
        'Yes. Many programs recognize a 1-week or "one week" chip. While less universal than the 30-day or 90-day chips, the 1-week token is a meaningful symbol for someone in the earliest and often most difficult days of recovery.',
    },
    {
      question: 'What color are early recovery chips?',
      answer:
        'Colors for early recovery chips vary by program and region. In AA tradition, the 24-hour chip is typically white (desire chip). Weekly chips, when used, come in various colors. The 30-day chip is traditionally red.',
    },
  ],
  milestone: {
    duration: '1 Week',
    significance:
      "The first weeks of recovery are where the story begins. These are the days when every hour is a victory and every morning is proof that it's possible. Early recovery chips exist to honor that fragile, extraordinary time — to say \"what you are doing right now matters more than you know.\"",
    traditionalColor: 'Various',
    prevMilestoneSlug: '24-hour-chip',
    nextMilestoneSlug: '30-day-sobriety-coin',
  },
  schema: ['breadcrumb', 'faq', 'webPage'],
});

registerSEOPage({
  slug: '30-day-sobriety-coin',
  type: 'milestone',
  title: '30 Day Sobriety Coin',
  metaTitle: '30 Day Sobriety Coin — One Month Milestone | Custom Milestones',
  metaDescription:
    'Celebrate 30 days sober with a premium recovery coin. The red 30-day chip marks one month of new beginnings and habits forming. Free shipping.',
  canonicalPath: '30-day-sobriety-coin',
  eyebrow: '30 Day Milestone',
  heroDescription:
    'Thirty days. One full month of choosing recovery every single day. The 30-day sobriety coin marks the end of the hardest chapter in early recovery and the beginning of something new.',
  primaryCTA: {label: 'Shop 30 Day Coins', href: '/collections/all'},
  featuredCollectionHandle: 'all',
  relatedPageSlugs: [
    'sobriety-coins',
    'recovery-gifts',
    'early-recovery-chips',
    '60-day-sobriety-coin',
  ],
  sections: [
    {
      type: 'text',
      heading: 'What 30 Days Means in Recovery',
      body: "One month of sobriety is a major milestone. The first 30 days are often the most physically and emotionally demanding — withdrawal, cravings, and the upheaval of reshaping daily life. Reaching 30 days means you have walked through all of that and come out the other side.\n\nIn AA tradition, the 30-day chip is traditionally red — a bold color for a bold achievement. New habits are forming, a home group is taking shape, and the foundation of recovery is being laid, brick by brick.",
    },
    {
      type: 'text',
      heading: 'Celebrating a 30 Day Sobriety Anniversary',
      body: "The 30-day mark is a natural time for reflection and celebration. Many people receive their 30-day chip at a meeting surrounded by the community that helped them get there.\n\nIf you're celebrating someone else's 30 days: a premium sobriety coin — perhaps engraved with their sobriety date — makes a deeply meaningful gift. It transforms a chip into a keepsake that honors the work they've already done.",
    },
  ],
  faq: [
    {
      question: 'What color is the 30 day sobriety chip?',
      answer:
        'In AA tradition, the 30-day sobriety chip is traditionally red. The red chip is one of the most recognized early recovery tokens in the program.',
    },
    {
      question: 'How significant is 30 days sober?',
      answer:
        'Very significant. The first 30 days are often the hardest in recovery — physically, emotionally, and socially. Reaching 30 days represents navigating the most intense phase of early recovery and establishing a foundation for what comes next.',
    },
    {
      question: 'What should I give someone for 30 days sober?',
      answer:
        'A 30-day sobriety coin is a traditional and meaningful gift. A premium coin — especially with a custom engraving of their sobriety date — makes the milestone tangible and lasting. Keep it simple and sincere.',
    },
  ],
  milestone: {
    duration: '30 Days',
    significance:
      "Thirty days of sobriety is where the new life starts to take shape. You've moved through the storm of early withdrawal and the chaos of change. New habits are forming — in the morning routine, in the meetings, in the way you face the day. This coin marks the moment recovery becomes something you're building, not just surviving.",
    traditionalColor: 'Red',
    prevMilestoneSlug: 'early-recovery-chips',
    nextMilestoneSlug: '60-day-sobriety-coin',
  },
  schema: ['breadcrumb', 'faq', 'webPage'],
});

registerSEOPage({
  slug: '60-day-sobriety-coin',
  type: 'milestone',
  title: '60 Day Sobriety Coin',
  metaTitle: '60 Day Sobriety Coin — Two Months of Recovery | Custom Milestones',
  metaDescription:
    'Celebrate 60 days sober with a premium gold recovery coin. Two months of growing resilience and deeper recovery roots. Free shipping on all orders.',
  canonicalPath: '60-day-sobriety-coin',
  eyebrow: '60 Day Milestone',
  heroDescription:
    'Two months of sobriety. Sixty days of showing up, doing the work, and building something new. The 60-day coin marks a moment when resilience is growing and recovery is becoming part of who you are.',
  primaryCTA: {label: 'Shop 60 Day Coins', href: '/collections/all'},
  featuredCollectionHandle: 'all',
  relatedPageSlugs: [
    'sobriety-coins',
    'recovery-gifts',
    '30-day-sobriety-coin',
    '90-day-sobriety-coin',
  ],
  sections: [
    {
      type: 'text',
      heading: 'The Significance of 60 Days Sober',
      body: "At 60 days, early recovery is shifting. The acute intensity of the first month has passed, and something more sustainable is growing in its place. The brain is continuing to heal, and many people begin to experience moments of genuine clarity and hope that were impossible to imagine at the start.\n\nThe 60-day chip in AA tradition is typically gold — a fitting color for a milestone that represents deepening strength and growing roots.",
    },
    {
      type: 'text',
      heading: 'Gift Ideas for 60 Days of Sobriety',
      body: "Sixty days is a milestone many people celebrate quietly — it doesn't get the same spotlight as 90 days or a year, but that's exactly why honoring it matters. A premium 60-day coin says, \"I'm paying attention. Every month counts.\"\n\nFor sponsors, family members, or friends: a beautifully crafted coin — optionally engraved with their sobriety date — is a lasting reminder that their two months of work have not gone unnoticed.",
    },
  ],
  faq: [
    {
      question: 'What color is the 60 day sobriety chip?',
      answer:
        'In AA tradition, the 60-day chip is typically gold, symbolizing growing strength and the value of two months of dedicated recovery.',
    },
    {
      question: 'What changes at 60 days sober?',
      answer:
        "By 60 days, many people notice clearer thinking, more stable emotions, and improved physical health. The brain continues to heal, and recovery begins to feel less like white-knuckling and more like a way of life. It's often when hope starts to feel real.",
    },
    {
      question: 'How do I celebrate 60 days of sobriety?',
      answer:
        'Share the milestone at a meeting, mark it with a 60-day chip, and spend time with the people who have supported your recovery. A special dinner, a reflective journal entry, or a call with your sponsor are all meaningful ways to honor two months of growth.',
    },
  ],
  milestone: {
    duration: '60 Days',
    significance:
      "At 60 days, something shifts. The frantic energy of early recovery begins to settle, and in its place, something steadier emerges. You are not just abstaining — you are adapting. Your brain is healing, your habits are changing, and recovery is becoming woven into the fabric of your daily life. This coin is proof of that quiet, profound transformation.",
    traditionalColor: 'Gold',
    prevMilestoneSlug: '30-day-sobriety-coin',
    nextMilestoneSlug: '90-day-sobriety-coin',
  },
  schema: ['breadcrumb', 'faq', 'webPage'],
});

registerSEOPage({
  slug: '6-month-sobriety-coin',
  type: 'milestone',
  title: '6 Month Sobriety Coin',
  metaTitle: '6 Month Sobriety Coin — Half a Year of Recovery | Custom Milestones',
  metaDescription:
    'Celebrate 6 months sober with a premium purple recovery coin. Half a year of dedication, healing, and transformation. Free shipping on all orders.',
  canonicalPath: '6-month-sobriety-coin',
  eyebrow: '6 Month Milestone',
  heroDescription:
    'Six months of sobriety is half a year of transformation. The 6-month coin marks a milestone where recovery has become a genuine way of life — and the future looks different than you ever imagined.',
  primaryCTA: {label: 'Shop 6 Month Coins', href: '/collections/all'},
  featuredCollectionHandle: 'all',
  relatedPageSlugs: [
    'sobriety-coins',
    'recovery-gifts',
    '90-day-sobriety-coin',
    '9-month-sobriety-coin',
  ],
  sections: [
    {
      type: 'text',
      heading: 'What Six Months of Sobriety Means',
      body: "Reaching six months of sobriety means you have navigated half a year of life without substances. You've experienced seasons changing, stressful days, celebrations, and quiet ordinary evenings — and stayed the course through all of them.\n\nIn AA tradition, the 6-month chip is purple — a color associated with wisdom and dedication. By six months, many people have completed significant step work, deepened their relationships with sponsors and home groups, and begun to see real transformation in their daily lives.",
    },
    {
      type: 'text',
      heading: 'Celebrating Six Months of Dedication',
      body: "The six-month mark is often recognized at meetings with particular warmth. It is no longer the first month, when everything is new and fragile — it is the deep middle, where dedication is proven day after day.\n\nFor a six-month gift: a premium purple-accented sobriety coin is a beautiful acknowledgment. Consider pairing it with a handwritten note — sometimes the words that accompany the coin mean just as much as the coin itself.",
    },
  ],
  faq: [
    {
      question: 'What color is the 6 month sobriety chip?',
      answer:
        'In AA tradition, the 6-month chip is typically purple, representing wisdom, dedication, and the deep work of sustained recovery.',
    },
    {
      question: 'Is 6 months sober a big milestone?',
      answer:
        'Absolutely. Six months represents a half-year of daily commitment, navigating every life situation without substances. It is a profound milestone that marks the transition from early recovery to a sustained and deepening way of life.',
    },
    {
      question: 'What changes after 6 months of sobriety?',
      answer:
        'By six months, most people experience significant improvements in mental clarity, emotional regulation, physical health, and relationships. Many also report a growing sense of identity in sobriety — a feeling that this new life is genuinely theirs.',
    },
  ],
  milestone: {
    duration: '6 Months',
    significance:
      "Six months of sobriety is a testament to daily dedication. You have lived half a year differently — facing every challenge, every temptation, and every ordinary Tuesday without turning to substances. The life you are building now is real. This coin represents 180 days of choosing yourself and your future, one day at a time.",
    traditionalColor: 'Purple',
    prevMilestoneSlug: '90-day-sobriety-coin',
    nextMilestoneSlug: '9-month-sobriety-coin',
  },
  schema: ['breadcrumb', 'faq', 'webPage'],
});

registerSEOPage({
  slug: '9-month-sobriety-coin',
  type: 'milestone',
  title: '9 Month Sobriety Coin',
  metaTitle: '9 Month Sobriety Coin — The Home Stretch to One Year | Custom Milestones',
  metaDescription:
    'Celebrate 9 months sober with a premium dark blue recovery coin. The home stretch to one year — nine months of strength and transformation.',
  canonicalPath: '9-month-sobriety-coin',
  eyebrow: '9 Month Milestone',
  heroDescription:
    'Nine months of sobriety — the home stretch to one year. The 9-month coin recognizes the incredible depth of commitment it takes to carry recovery this far and keep going.',
  primaryCTA: {label: 'Shop 9 Month Coins', href: '/collections/all'},
  featuredCollectionHandle: 'all',
  relatedPageSlugs: [
    'sobriety-coins',
    'recovery-gifts',
    '6-month-sobriety-coin',
    '1-year-sobriety-coin',
  ],
  sections: [
    {
      type: 'text',
      heading: 'Nine Months: The Quiet Strength of Recovery',
      body: "Nine months is a milestone that often passes without as much fanfare as the more talked-about anniversaries — but it shouldn't. Reaching nine months means you have sustained recovery through three full seasons. You have shown that sobriety is not a phase or a temporary fix; it is a life you are actively building.\n\nIn AA tradition, the 9-month chip is dark blue — steady, deep, and unwavering. The color suits the milestone perfectly.",
    },
    {
      type: 'text',
      heading: 'Gift Ideas for Nine Months Sober',
      body: "The nine-month mark deserves recognition precisely because it's often overlooked. If you know someone approaching their nine-month anniversary, a premium sobriety coin — marked with their milestone — is a powerful way to say, \"I see how far you've come, and I'm not going to let this one pass uncelebrated.\"\n\nFor the person in recovery themselves: carrying a nine-month coin is a daily reminder that one year is within reach.",
    },
  ],
  faq: [
    {
      question: 'What color is the 9 month sobriety chip?',
      answer:
        'In AA tradition, the 9-month chip is typically dark blue or navy, representing the depth and steadiness of sustained recovery.',
    },
    {
      question: 'What should I expect at 9 months sober?',
      answer:
        'At nine months, many people experience a strong sense of identity in their sobriety, more stable emotional regulation, and a clearer vision for the future. The one-year milestone is in sight, which often brings both excitement and a renewed commitment to the daily work of recovery.',
    },
    {
      question: 'Is there a chip for 9 months?',
      answer:
        'Yes. The 9-month chip is a recognized milestone in AA and other programs. It is typically dark blue and is presented at meetings to honor nine months of continuous sobriety.',
    },
  ],
  milestone: {
    duration: '9 Months',
    significance:
      "Nine months of sobriety is the home stretch — and it is no less demanding than the miles that came before. The one-year milestone glows on the horizon, but the work of today is just as important as it ever was. This coin represents the quiet, extraordinary strength it takes to keep showing up every day when the hardest days are behind you and the reward is almost within reach.",
    traditionalColor: 'Dark Blue',
    prevMilestoneSlug: '6-month-sobriety-coin',
    nextMilestoneSlug: '1-year-sobriety-coin',
  },
  schema: ['breadcrumb', 'faq', 'webPage'],
});

registerSEOPage({
  slug: '2-year-sobriety-coin',
  type: 'milestone',
  title: '2 Year Sobriety Coin',
  metaTitle: '2 Year Sobriety Coin — Two Years of New Life | Custom Milestones',
  metaDescription:
    'Celebrate 2 years of sobriety with a premium recovery coin. Two years of building a new life, one day at a time. Free shipping on all orders.',
  canonicalPath: '2-year-sobriety-coin',
  eyebrow: '2 Year Milestone',
  heroDescription:
    'Two years of sobriety. This is not survival anymore — this is a life you have built. The 2-year coin honors the deep, ongoing work of recovery and the person you have become.',
  primaryCTA: {label: 'Shop 2 Year Coins', href: '/collections/all'},
  featuredCollectionHandle: 'all',
  relatedPageSlugs: [
    'sobriety-coins',
    'recovery-gifts',
    '1-year-sobriety-coin',
    '5-year-sobriety-coin',
  ],
  sections: [
    {
      type: 'text',
      heading: 'What Two Years of Sobriety Means',
      body: "Two years of sobriety means you have walked through two full cycles of life's seasons with clarity and commitment. You have built new relationships, navigated grief and celebration sober, and proven — to yourself above all — that recovery is not something that happened to you but something you are actively living.\n\nAt two years, the foundation of a new life is solid. The daily work continues, but the person doing that work has changed profoundly.",
    },
    {
      type: 'text',
      heading: 'How to Celebrate a 2-Year Sobriety Anniversary',
      body: "Two years is a milestone worthy of real celebration. Share at a meeting, invite the people who have walked with you, and take time to genuinely reflect on how far you have come.\n\nA 2-year sobriety coin — especially a premium medallion engraved with the anniversary date — makes a lasting keepsake. Some people celebrate by doing service work or speaking at a meeting where newcomers need to hear that two years is possible.",
    },
  ],
  faq: [
    {
      question: 'What does a 2 year sobriety coin look like?',
      answer:
        'Two-year sobriety coins are typically bronze medallions, following the annual milestone tradition in AA. They often feature the year prominently alongside the Serenity Prayer or AA triangle.',
    },
    {
      question: 'How significant is 2 years of sobriety?',
      answer:
        'Very significant. Two years represents sustained, intentional recovery through every kind of life situation. Research shows that the longer someone maintains sobriety, the lower their risk of relapse — two years is a meaningful threshold in long-term recovery.',
    },
    {
      question: 'What should I get someone for a 2 year sobriety anniversary?',
      answer:
        'A premium 2-year sobriety coin or medallion is the traditional and most meaningful gift. For a special touch, add a custom engraving with their sobriety date or a personal message. A heartfelt card accompanying the coin can make the moment even more memorable.',
    },
  ],
  milestone: {
    duration: '2 Years',
    significance:
      "Two years of sobriety is a testament to sustained courage. You have navigated two full years of life — its joys, its losses, its ordinary days — and you have done it with clear eyes and an open heart. The person who picked up a 24-hour chip is still here, transformed. This coin honors the life you have built and the strength you have found.",
    traditionalColor: 'Bronze',
    prevMilestoneSlug: '1-year-sobriety-coin',
    nextMilestoneSlug: '5-year-sobriety-coin',
  },
  schema: ['breadcrumb', 'faq', 'webPage'],
});

registerSEOPage({
  slug: '5-year-sobriety-coin',
  type: 'milestone',
  title: '5 Year Sobriety Coin',
  metaTitle: '5 Year Sobriety Coin — Five Years of Enduring Strength | Custom Milestones',
  metaDescription:
    'Celebrate 5 years of sobriety with a premium recovery coin. Five years is a testament to enduring strength and a life rebuilt from the inside out.',
  canonicalPath: '5-year-sobriety-coin',
  eyebrow: '5 Year Milestone',
  heroDescription:
    'Five years of sobriety. A testament to enduring strength and the extraordinary power of choosing recovery, day after day, year after year.',
  primaryCTA: {label: 'Shop 5 Year Coins', href: '/collections/all'},
  featuredCollectionHandle: 'all',
  relatedPageSlugs: [
    'sobriety-coins',
    'recovery-gifts',
    '2-year-sobriety-coin',
    '10-year-sobriety-coin',
  ],
  sections: [
    {
      type: 'text',
      heading: 'Five Years: A Life Rebuilt',
      body: "Five years of sobriety is a milestone that carries extraordinary weight. At five years, recovery is no longer a chapter of your story — it is the foundation of your story. Relationships that once seemed beyond repair have healed. A career, a purpose, a sense of self — built, brick by brick, in the years since that first decision to change.\n\nFive years also means you have become, whether you sought it or not, a beacon for others. Newcomers look at five-year members and see proof that a different life is possible.",
    },
    {
      type: 'text',
      heading: 'Celebrating Five Years of Recovery',
      body: "A five-year sobriety anniversary is a community celebration. Many people choose to speak at a meeting, sharing their story openly so others can hear what five years looks like.\n\nA premium 5-year sobriety medallion — heavy, beautifully crafted, and engraved with the anniversary date — is a lasting symbol of this achievement. Some people commission custom coins for major milestones like five years, making the token as unique as the journey it represents.",
    },
  ],
  faq: [
    {
      question: 'What color is the 5 year sobriety coin?',
      answer:
        'Five-year sobriety coins are typically bronze, following the annual medallion tradition. Some programs or custom coins use special finishes for significant milestones like five years.',
    },
    {
      question: 'Is 5 years sober a major milestone?',
      answer:
        'Yes — five years is considered a major long-term recovery milestone. Research on addiction recovery shows that sustained sobriety beyond five years significantly reduces the risk of relapse, and five years is widely celebrated as a transformative achievement in the recovery community.',
    },
    {
      question: 'What is a good gift for 5 years of sobriety?',
      answer:
        'A premium 5-year sobriety medallion is the most traditional and meaningful gift. For this significant milestone, consider a custom-engraved coin with the sobriety date and a personal message, or a heavier, premium finish that distinguishes it from earlier milestone coins.',
    },
  ],
  milestone: {
    duration: '5 Years',
    significance:
      "Five years of sobriety is proof that the decision made at the very beginning — the desperate, hopeful decision to try — was the right one. You have lived a different life for half a decade. You have become someone your younger self could not have imagined. This coin represents five years of daily courage, accumulated into something remarkable.",
    traditionalColor: 'Bronze',
    prevMilestoneSlug: '2-year-sobriety-coin',
    nextMilestoneSlug: '10-year-sobriety-coin',
  },
  schema: ['breadcrumb', 'faq', 'webPage'],
});

registerSEOPage({
  slug: '10-year-sobriety-coin',
  type: 'milestone',
  title: '10 Year Sobriety Coin',
  metaTitle: '10 Year Sobriety Coin — A Decade of Recovery | Custom Milestones',
  metaDescription:
    'Celebrate 10 years of sobriety with a premium recovery coin. A full decade of recovery, growth, and transformation. Free shipping on all orders.',
  canonicalPath: '10-year-sobriety-coin',
  eyebrow: '10 Year Milestone',
  heroDescription:
    'Ten years of sobriety. A full decade of living differently, growing stronger, and showing the world — and yourself — what recovery really means.',
  primaryCTA: {label: 'Shop 10 Year Coins', href: '/collections/all'},
  featuredCollectionHandle: 'all',
  relatedPageSlugs: [
    'sobriety-coins',
    'recovery-gifts',
    '5-year-sobriety-coin',
    '15-year-sobriety-coin',
  ],
  sections: [
    {
      type: 'text',
      heading: 'What a Decade of Sobriety Represents',
      body: "Ten years of sobriety is a milestone that transforms not just the person in recovery, but everyone around them. A decade of clear-eyed presence — at family gatherings, at work, at life's hardest moments — changes relationships in ways that cannot be overstated.\n\nAt ten years, recovery is no longer something you are doing. It is who you are. The coin you carry at year ten is not just a milestone marker — it is an artifact of an entire transformation.",
    },
    {
      type: 'text',
      heading: 'Honoring Ten Years of Recovery',
      body: "A ten-year anniversary deserves to be marked with something exceptional. A premium sobriety medallion — heavy, detailed, perhaps custom-commissioned — is a fitting symbol for a decade of daily commitment.\n\nMany people use their ten-year anniversary as an opportunity for deep reflection: writing a letter to their earlier self, speaking at a meeting, or gathering the people who have been part of their recovery journey to celebrate together.",
    },
  ],
  faq: [
    {
      question: 'What does a 10 year sobriety coin look like?',
      answer:
        'Ten-year sobriety coins are typically premium bronze medallions. Some feature Roman numerals for the decade milestone. Many people choose custom or premium coins for major milestones like ten years.',
    },
    {
      question: 'How rare is 10 years of sobriety?',
      answer:
        "Reaching ten years of sobriety is a significant achievement. While exact statistics vary, long-term recovery sustained over a decade represents deep, sustained commitment. People with ten years of sobriety are often pillars of their recovery communities.",
    },
    {
      question: 'What is a meaningful way to celebrate 10 years sober?',
      answer:
        'Share at a meeting and tell your story. Gather those who supported you along the way. Commission a custom sobriety coin. Write a reflection on who you were and who you have become. The most meaningful celebrations involve both honoring the journey and giving back to those still in their early days.',
    },
  ],
  milestone: {
    duration: '10 Years',
    significance:
      "A decade of sobriety is not just a number — it is a life. Ten years of mornings chosen differently, ten years of relationships rebuilt, ten years of being present for the people you love. This coin carries the weight of everything that has happened since the beginning, and everything that is still possible ahead.",
    traditionalColor: 'Bronze',
    prevMilestoneSlug: '5-year-sobriety-coin',
    nextMilestoneSlug: '15-year-sobriety-coin',
  },
  schema: ['breadcrumb', 'faq', 'webPage'],
});

registerSEOPage({
  slug: '15-year-sobriety-coin',
  type: 'milestone',
  title: '15 Year Sobriety Coin',
  metaTitle: '15 Year Sobriety Coin — Living Proof | Custom Milestones',
  metaDescription:
    'Celebrate 15 years of sobriety with a premium recovery coin. Fifteen years of living proof that recovery works and a new life is possible.',
  canonicalPath: '15-year-sobriety-coin',
  eyebrow: '15 Year Milestone',
  heroDescription:
    "Fifteen years of sobriety. Living proof — to yourself and to every newcomer who needs to see it — that recovery is not just possible, it's magnificent.",
  primaryCTA: {label: 'Shop 15 Year Coins', href: '/collections/all'},
  featuredCollectionHandle: 'all',
  relatedPageSlugs: [
    'sobriety-coins',
    'recovery-gifts',
    '10-year-sobriety-coin',
    '20-year-sobriety-coin',
  ],
  sections: [
    {
      type: 'text',
      heading: 'Fifteen Years: The Living Example',
      body: "At fifteen years, sobriety has become something most people in recovery only dreamed about in their earliest days. You are the person newcomers see across the room at a meeting and think, \"Maybe I can do this too.\"\n\nFifteen years of recovery means you have navigated loss, health challenges, relationship changes, and the ordinary and extraordinary events of life — all while continuing to choose sobriety. That is not merely impressive. It is transformative for everyone who witnesses it.",
    },
    {
      type: 'text',
      heading: 'Celebrating 15 Years of Recovery',
      body: "A fifteen-year sobriety anniversary is a moment to celebrate expansively. It is a milestone that calls for community — the people who have been alongside the journey and those who are just beginning their own.\n\nA premium 15-year sobriety coin is a worthy symbol for this milestone. Consider having it engraved not just with the anniversary date, but with a phrase or word that captures what fifteen years means to you.",
    },
  ],
  faq: [
    {
      question: 'Is there a 15 year sobriety coin?',
      answer:
        'Yes. Fifteen-year sobriety coins are available as premium medallions and are a meaningful way to honor this significant long-term recovery milestone. Many people in recovery mark every year with a coin, and fifteen years deserves a particularly special one.',
    },
    {
      question: 'What does 15 years of sobriety feel like?',
      answer:
        'Many people describe fifteen years of sobriety as a place where recovery feels deeply integrated into identity rather than something that requires constant vigilance. While the daily commitment continues, it is often accompanied by a profound sense of gratitude and purpose.',
    },
    {
      question: 'How do you celebrate a 15 year sobriety anniversary?',
      answer:
        'Common celebrations include sharing at a meeting, hosting a dinner with recovery community members, receiving a special sobriety coin, and reflecting deeply on the journey. Some people take the occasion to do significant service work or mentor newcomers as a way of honoring their own milestone.',
    },
  ],
  milestone: {
    duration: '15 Years',
    significance:
      "Fifteen years of sobriety is living proof. Proof that the person who showed up desperate and hopeful at the beginning of this journey could become someone who has chosen recovery every day for fifteen years. This coin represents a decade and a half of daily courage — and the extraordinary life built in that time.",
    traditionalColor: 'Bronze',
    prevMilestoneSlug: '10-year-sobriety-coin',
    nextMilestoneSlug: '20-year-sobriety-coin',
  },
  schema: ['breadcrumb', 'faq', 'webPage'],
});

registerSEOPage({
  slug: '20-year-sobriety-coin',
  type: 'milestone',
  title: '20 Year Sobriety Coin',
  metaTitle: '20 Year Sobriety Coin — Two Decades of Transformation | Custom Milestones',
  metaDescription:
    'Celebrate 20 years of sobriety with a premium recovery coin. Two decades of transformation and a life that proves recovery is everything.',
  canonicalPath: '20-year-sobriety-coin',
  eyebrow: '20 Year Milestone',
  heroDescription:
    'Twenty years of sobriety. Two full decades of transformation — of becoming the person that recovery makes possible, and showing others what is possible for them.',
  primaryCTA: {label: 'Shop 20 Year Coins', href: '/collections/all'},
  featuredCollectionHandle: 'all',
  relatedPageSlugs: [
    'sobriety-coins',
    'recovery-gifts',
    '15-year-sobriety-coin',
    '25-year-sobriety-coin',
  ],
  sections: [
    {
      type: 'text',
      heading: 'Two Decades of a Different Life',
      body: "Twenty years of sobriety represents an entire adult chapter lived in recovery. Children have been raised, careers have been built, communities have been served — all from the foundation of a life chosen differently each day.\n\nAt twenty years, the transformation is complete not in the sense that the work is done, but in the sense that who you are in recovery is who you simply are. The two are indistinguishable. The program, the principles, the daily practice — they are no longer tools. They are the architecture of your life.",
    },
    {
      type: 'text',
      heading: 'Marking Twenty Years of Sobriety',
      body: "A twenty-year sobriety anniversary calls for extraordinary recognition. This is the kind of milestone that warrants a gathering — of family, of recovery community, of everyone who has been part of the journey in ways both seen and unseen.\n\nA premium 20-year sobriety medallion, custom-engraved and beautifully crafted, is a fitting physical symbol for an achievement of this magnitude. Some people mark twenty years with a letter, a celebration, and the commissioning of something truly unique.",
    },
  ],
  faq: [
    {
      question: 'What is a 20 year sobriety coin?',
      answer:
        'A 20-year sobriety coin is a premium medallion commemorating two decades of continuous sobriety. It is typically a beautifully crafted bronze or custom-finish coin marking one of the most significant long-term recovery milestones.',
    },
    {
      question: 'What should I say to someone with 20 years of sobriety?',
      answer:
        '"Thank you" is a powerful place to start. Someone with twenty years of sobriety has likely been a beacon for countless others. Acknowledging the impact of their journey — not just on themselves but on everyone who has witnessed it — is deeply meaningful.',
    },
    {
      question: 'How do you celebrate 20 years sober?',
      answer:
        'Gather the people who matter. Share the story at a meeting. Commission a custom sobriety coin that matches the magnitude of the milestone. Write a reflection. Do service. Twenty years is worth celebrating as expansively as the journey itself.',
    },
  ],
  milestone: {
    duration: '20 Years',
    significance:
      "Twenty years of sobriety is the full transformation made manifest. Two decades of showing up, of doing the work, of being present for life in a way that was once unimaginable. This coin represents not just the years behind you, but the person those years have made — and the legacy that person is still building.",
    traditionalColor: 'Bronze',
    prevMilestoneSlug: '15-year-sobriety-coin',
    nextMilestoneSlug: '25-year-sobriety-coin',
  },
  schema: ['breadcrumb', 'faq', 'webPage'],
});

registerSEOPage({
  slug: '25-year-sobriety-coin',
  type: 'milestone',
  title: '25 Year Sobriety Coin',
  metaTitle: '25 Year Sobriety Coin — A Quarter Century Legacy | Custom Milestones',
  metaDescription:
    'Celebrate 25 years of sobriety with a premium recovery coin. A quarter century of recovery — a legacy that will outlast a lifetime.',
  canonicalPath: '25-year-sobriety-coin',
  eyebrow: '25 Year Milestone',
  heroDescription:
    'Twenty-five years of sobriety. A quarter century of recovery — a legacy of courage, transformation, and service that reaches far beyond one life.',
  primaryCTA: {label: 'Shop 25 Year Coins', href: '/collections/all'},
  featuredCollectionHandle: 'all',
  relatedPageSlugs: [
    'sobriety-coins',
    'recovery-gifts',
    '20-year-sobriety-coin',
    'long-term-sobriety-coins',
  ],
  sections: [
    {
      type: 'text',
      heading: 'A Quarter Century of Recovery',
      body: "Twenty-five years of sobriety is a legacy. Not just a personal achievement — though it is profoundly that — but a living demonstration that recovery changes everything it touches. Over twenty-five years, a person in recovery ripples outward: as a parent, a sponsor, a colleague, a friend, a neighbor. The lives touched by one person's sobriety are incalculable.\n\nA quarter century of recovery is the fulfillment of the promise made on day one: that choosing sobriety was worth it.",
    },
    {
      type: 'text',
      heading: 'Honoring a 25-Year Sobriety Milestone',
      body: "A twenty-five-year sobriety anniversary is among the most sacred milestones in recovery. It demands a celebration worthy of its weight — community, gratitude, and a physical symbol of the journey.\n\nA premium 25-year sobriety coin — custom engraved, beautifully crafted, and presented with intention — is a fitting artifact for a quarter century of living differently. This is the kind of milestone that deserves to be passed down, shared, and remembered.",
    },
  ],
  faq: [
    {
      question: 'What does 25 years of sobriety mean?',
      answer:
        "Twenty-five years of sobriety represents a quarter century of daily commitment to recovery. It means navigating life's full spectrum — its joys and griefs, its ordinary and extraordinary moments — with clarity and purpose for twenty-five consecutive years.",
    },
    {
      question: 'Is there a 25 year sobriety coin?',
      answer:
        'Yes. Twenty-five-year sobriety coins are significant milestone tokens, typically crafted as premium bronze or custom-finish medallions. For a milestone of this magnitude, many people opt for a custom-commissioned coin that matches the uniqueness of the achievement.',
    },
    {
      question: 'What is a good gift for 25 years of sobriety?',
      answer:
        'A premium, custom-engraved 25-year sobriety medallion is the most meaningful traditional gift. For this milestone, consider pairing it with something personal — a letter, a gathering, or a donation in their honor to a recovery organization they care about.',
    },
  ],
  milestone: {
    duration: '25 Years',
    significance:
      "Twenty-five years of sobriety is a legacy measured not in days but in lives changed. A quarter century of choosing recovery has transformed not just the person who carries this coin, but everyone they have ever sponsored, supported, or simply shown up for. This coin is more than a milestone — it is the proof of a life fully, courageously lived.",
    traditionalColor: 'Bronze',
    prevMilestoneSlug: '20-year-sobriety-coin',
    nextMilestoneSlug: 'long-term-sobriety-coins',
  },
  schema: ['breadcrumb', 'faq', 'webPage'],
});

registerSEOPage({
  slug: 'long-term-sobriety-coins',
  type: 'milestone',
  title: 'Long-Term Sobriety Coins',
  metaTitle: 'Long-Term Sobriety Coins — 30, 35, 40 & 50 Year Milestones | Custom Milestones',
  metaDescription:
    'Shop long-term sobriety coins for 30, 35, 40, and 50+ year milestones. Premium recovery tokens for the most extraordinary recovery journeys.',
  canonicalPath: 'long-term-sobriety-coins',
  eyebrow: 'Long-Term Recovery',
  heroDescription:
    'Thirty, thirty-five, forty, fifty years. These are the milestones that redefine what is possible in recovery — lives so fully transformed that they become a foundation for entire communities.',
  primaryCTA: {label: 'Shop Long-Term Coins', href: '/collections/all'},
  featuredCollectionHandle: 'all',
  relatedPageSlugs: [
    'sobriety-coins',
    'recovery-gifts',
    '25-year-sobriety-coin',
    'custom-sobriety-coins',
  ],
  sections: [
    {
      type: 'text',
      heading: 'The Extraordinary Milestones of Long-Term Recovery',
      body: "Thirty years. Forty years. Fifty years. These are milestones that most people entering recovery cannot imagine — and that is precisely why they matter so much. Long-term recovery coins for 30, 35, 40, and 50+ year anniversaries exist to celebrate what is possible when a person commits to sobriety for a lifetime.\n\nThe person receiving a 50-year sobriety coin has likely sponsored dozens of people through their recoveries. They have watched the program work through generations. They are, in the truest sense, a living legacy of what recovery can become.",
    },
    {
      type: 'text',
      heading: 'Honoring a Lifetime of Recovery',
      body: "For milestones of 30 years and beyond, a standard coin is not enough. These are moments that call for custom medallions — crafted with the same care and intentionality that the recovery journey has demanded.\n\nAt Custom Milestones, we offer custom sobriety coins for any milestone, including the rarest and most extraordinary. A 50-year sobriety medallion can be engraved with the date, a name, a message — anything that honors a journey of that magnitude. These coins often become family heirlooms, passed from one generation to the next as a symbol of what one person's courage made possible.",
    },
  ],
  faq: [
    {
      question: 'Are there sobriety coins for 30 years or more?',
      answer:
        'Yes. Sobriety coins are available for 30, 35, 40, 45, 50 years, and beyond. For these extraordinary milestones, many people opt for custom-designed medallions that honor the uniqueness of decades of sustained recovery.',
    },
    {
      question: 'What is a 50 year sobriety coin?',
      answer:
        'A 50-year sobriety coin marks a half century of continuous recovery — one of the rarest and most extraordinary milestones in the recovery community. These coins are often custom-crafted and serve as permanent keepsakes and family heirlooms.',
    },
    {
      question: 'How do you celebrate 30 or more years of sobriety?',
      answer:
        'Long-term milestones are best celebrated with community — the people who have been part of the journey and the newcomers who need to see what is possible. A custom sobriety coin, a gathering of those who matter, and the opportunity to share the story openly are all meaningful ways to honor decades of recovery.',
    },
  ],
  milestone: {
    duration: '30+ Years',
    significance:
      "Long-term sobriety — 30, 40, 50 years — is something that transcends personal achievement. It is a gift to everyone who has ever sat across from this person at a meeting, everyone they have sponsored, every family member who got to keep them in their life. These coins are not just milestones. They are monuments to what recovery makes possible.",
    traditionalColor: 'Bronze',
    prevMilestoneSlug: '25-year-sobriety-coin',
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
  metaTitle: 'What Is a Sobriety Coin? — Definition & History | Custom Milestones',
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
        'Sobriety coins can be received at AA or NA meetings, or purchased from specialty retailers like Custom Milestones for personal milestones or as gifts.',
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
  metaTitle: 'What Is an AA Chip? — Colors, Meaning & Tradition | Custom Milestones',
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
  metaTitle: 'What Is Clean Time? — Definition & Meaning | Custom Milestones',
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

// ============================================================
// GLOSSARY PAGES — Recovery Basics
// ============================================================

registerSEOPage({
  slug: 'resources/glossary/sobriety',
  type: 'glossary',
  title: 'Sobriety',
  metaTitle: 'What Is Sobriety? — Definition & Meaning | Custom Milestones',
  metaDescription:
    'Learn what sobriety means in the context of recovery — the state of being free from alcohol and drugs and living a substance-free life.',
  canonicalPath: 'resources/glossary/sobriety',
  eyebrow: 'Recovery Basics',
  heroDescription:
    'Sobriety is the ongoing state of being free from alcohol and drugs, embracing a life of clarity, accountability, and personal growth.',
  primaryCTA: {label: 'Shop Recovery Tokens', href: '/collections/all'},
  relatedPageSlugs: ['sobriety-coins', '1-year-sobriety-coin'],
  sections: [],
  faq: [
    {
      question: 'Is sobriety the same as abstinence?',
      answer:
        'Abstinence refers to not using substances, while sobriety typically implies a broader lifestyle change — addressing the emotional, mental, and spiritual dimensions of recovery.',
    },
  ],
  glossary: {
    definition: 'The state of being free from substance use and committed to a life of recovery.',
    extendedContent:
      "Sobriety is often used interchangeably with abstinence, but in the recovery community it carries a deeper meaning. While abstinence simply means not drinking or using drugs, sobriety describes a transformed way of living — one that addresses the underlying causes of addiction and embraces honesty, accountability, and growth.\n\nFor many people, sobriety begins on their last day of substance use, a date they celebrate as their \"sobriety date\" or \"sober birthday.\" From that day forward, they measure their journey in clean time, collecting sobriety coins or chips to mark meaningful milestones.\n\nSobriety is not just the absence of something — it is the presence of something greater. Recovery communities celebrate sobriety as a daily choice and a lifelong commitment, often guided by the principle of \"one day at a time.\"",
    category: 'Recovery Basics',
    relatedTermSlugs: ['clean-time', 'abstinence', 'recovery'],
  },
  schema: ['breadcrumb', 'definedTerm'],
});

registerSEOPage({
  slug: 'resources/glossary/relapse',
  type: 'glossary',
  title: 'Relapse',
  metaTitle: 'What Is a Relapse? — Definition & Meaning | Custom Milestones',
  metaDescription:
    'Learn what relapse means in recovery — a return to substance use after a period of sobriety — and how to respond with compassion and renewed commitment.',
  canonicalPath: 'resources/glossary/relapse',
  eyebrow: 'Recovery Basics',
  heroDescription:
    'A relapse is a return to substance use after a period of sobriety, recognized in recovery as a setback rather than a failure.',
  primaryCTA: {label: 'Shop Recovery Tokens', href: '/collections/all'},
  relatedPageSlugs: ['sobriety-coins'],
  sections: [],
  faq: [
    {
      question: 'Does a relapse mean starting over from zero?',
      answer:
        'Many programs reset the sobriety clock after a relapse, but the progress and skills gained are never truly lost. Many long-term survivors experienced relapses on their path to lasting recovery.',
    },
  ],
  glossary: {
    definition:
      'A return to substance use after a period of sobriety, often viewed as part of the recovery process rather than a final failure.',
    extendedContent:
      "Relapse is one of the most difficult experiences in recovery. Defined as a return to substance use after a period of abstinence, it is unfortunately common — studies suggest that 40–60% of people in recovery experience at least one relapse. Recovery programs teach that relapse does not mean failure; it is a signal to recommit, seek support, and adjust one's recovery plan.\n\nThe relapse process often begins long before the first drink or drug. Warning signs — known as \"emotional relapse\" or \"mental relapse\" — can include isolation, skipping meetings, romanticizing past use, and mounting stress without healthy coping tools. Recognizing these signs early is a key skill taught in recovery programs.\n\nWhen a relapse does occur, the response matters most. Reaching out to a sponsor, returning to meetings, and picking up a desire chip are important first steps. The recovery community emphasizes compassion over shame, understanding that lasting sobriety is built through persistence, not perfection.",
    category: 'Recovery Basics',
    relatedTermSlugs: ['sobriety', 'clean-time', 'sponsor'],
  },
  schema: ['breadcrumb', 'definedTerm'],
});

registerSEOPage({
  slug: 'resources/glossary/recovery',
  type: 'glossary',
  title: 'Recovery',
  metaTitle: 'What Is Recovery? — Definition & Meaning | Custom Milestones',
  metaDescription:
    'Understand what recovery means in the context of addiction — the ongoing process of healing, growth, and building a fulfilling substance-free life.',
  canonicalPath: 'resources/glossary/recovery',
  eyebrow: 'Recovery Basics',
  heroDescription:
    'Recovery is the ongoing, active process of overcoming addiction and building a healthy, meaningful life free from substances.',
  primaryCTA: {label: 'Shop Recovery Tokens', href: '/collections/all'},
  relatedPageSlugs: ['sobriety-coins'],
  sections: [],
  faq: [],
  glossary: {
    definition:
      'The ongoing process of healing from addiction through abstinence, personal growth, and community support.',
    extendedContent:
      "Recovery is not a destination — it is a journey. Unlike the simple act of stopping substance use, recovery encompasses the full arc of healing: physical detox, emotional processing, rebuilding relationships, and finding new meaning and purpose. It is recognized by health organizations worldwide as a lifelong process that unfolds differently for every person.\n\nRecovery programs like Alcoholics Anonymous, Narcotics Anonymous, SMART Recovery, and many others provide structured frameworks, peer support, and spiritual or behavioral tools to support this journey. Central to most programs is the idea that sustained recovery requires ongoing effort — attending meetings, doing step work, working with a sponsor, and practicing gratitude.\n\nPhysical sobriety is only the beginning. Long-term recovery involves addressing the root causes of addiction — trauma, mental health, social environment — and building a life that makes staying sober not just possible but genuinely appealing. Recovery coins and milestones play an important role in marking progress and keeping motivation alive.",
    category: 'Recovery Basics',
    relatedTermSlugs: ['sobriety', 'twelve-steps', 'clean-time'],
  },
  schema: ['breadcrumb', 'definedTerm'],
});

registerSEOPage({
  slug: 'resources/glossary/triggers',
  type: 'glossary',
  title: 'Triggers',
  metaTitle: 'What Are Triggers in Recovery? — Definition & Meaning | Custom Milestones',
  metaDescription:
    'Learn what triggers are in addiction recovery — people, places, or situations that create urges to use — and how to manage them effectively.',
  canonicalPath: 'resources/glossary/triggers',
  eyebrow: 'Recovery Basics',
  heroDescription:
    'Triggers are people, places, emotions, or situations that create urges to use substances, and learning to manage them is central to sustained recovery.',
  primaryCTA: {label: 'Shop Recovery Tokens', href: '/collections/all'},
  relatedPageSlugs: ['sobriety-coins'],
  sections: [],
  faq: [
    {
      question: 'How do you deal with triggers in recovery?',
      answer:
        'Common strategies include calling a sponsor, attending a meeting, using the HALT check (Hungry, Angry, Lonely, Tired), practicing mindfulness, and using coping tools learned in step work or therapy.',
    },
  ],
  glossary: {
    definition:
      'People, places, emotions, or situations that create cravings or urges to use alcohol or drugs.',
    extendedContent:
      "In recovery, a trigger is anything that activates a craving or urge to return to substance use. Triggers can be external — such as driving past a former bar, spending time with old using friends, or being in situations associated with past use — or internal, such as feelings of stress, loneliness, anger, or euphoria.\n\nUnderstanding one's personal triggers is a critical part of recovery work. Most treatment programs include exercises to identify triggers and develop specific, practiced responses — sometimes called a \"relapse prevention plan.\" Sponsors and therapists often help people build this awareness over time.\n\nA sobriety coin or recovery token can serve as a physical anchor in trigger moments. Many people in recovery hold their coin when they feel a craving, using it as a grounding tool and a reminder of everything they have worked for. The weight of the coin in the hand can be a powerful cue to pause, breathe, and choose sobriety.",
    category: 'Recovery Basics',
    relatedTermSlugs: ['relapse', 'sponsor', 'one-day-at-a-time'],
    productLink: 'all',
  },
  schema: ['breadcrumb', 'definedTerm'],
});

// ============================================================
// GLOSSARY PAGES — Milestones & Time
// ============================================================

registerSEOPage({
  slug: 'resources/glossary/sobriety-date',
  type: 'glossary',
  title: 'Sobriety Date',
  metaTitle: 'What Is a Sobriety Date? — Definition & Meaning | Custom Milestones',
  metaDescription:
    "Learn what a sobriety date is in recovery — the last day a person used substances — and why it's treasured as a personal milestone.",
  canonicalPath: 'resources/glossary/sobriety-date',
  eyebrow: 'Milestones & Time',
  heroDescription:
    "A sobriety date is the date a person last used alcohol or drugs, marking the starting point from which all recovery milestones are measured.",
  primaryCTA: {label: 'Shop Milestone Coins', href: '/collections/all'},
  relatedPageSlugs: ['sobriety-coins', '1-year-sobriety-coin'],
  sections: [],
  faq: [
    {
      question: 'What happens to my sobriety date if I relapse?',
      answer:
        'Most 12-step programs recognize the new last-use date as the updated sobriety date if a relapse occurs. While this resets the count, many people choose to remember their previous sobriety date as well.',
    },
  ],
  glossary: {
    definition: 'The date a person last used alcohol or drugs, from which all sobriety milestones are counted.',
    extendedContent:
      "A sobriety date — sometimes called a \"clean date\" or \"birthday\" — is one of the most cherished pieces of information a person in recovery carries. It is the last day they used substances, and every milestone in their recovery is measured from that single day.\n\nIn 12-step programs, members often memorize their sobriety date the way others remember their wedding anniversary. It is shared at meetings, used to calculate clean time, and celebrated annually as a sober birthday. Some people tattoo their sobriety date as a permanent reminder of their commitment.\n\nSobriety dates are also the basis for the sobriety coin system. At 24 hours, 30 days, 60 days, 90 days, 6 months, 9 months, and each year thereafter, members receive a new coin marking the time elapsed since their sobriety date. These coins become treasured keepsakes that tell the story of a life rebuilt.",
    category: 'Milestones & Time',
    relatedTermSlugs: ['clean-time', 'sober-birthday', 'anniversary'],
    productLink: 'all',
  },
  schema: ['breadcrumb', 'definedTerm'],
});

registerSEOPage({
  slug: 'resources/glossary/anniversary',
  type: 'glossary',
  title: 'Sobriety Anniversary',
  metaTitle: 'What Is a Sobriety Anniversary? — Definition & Meaning | Custom Milestones',
  metaDescription:
    "Learn what a sobriety anniversary is in recovery — the yearly celebration of continuous sobriety — and how it's celebrated with coins and community.",
  canonicalPath: 'resources/glossary/anniversary',
  eyebrow: 'Milestones & Time',
  heroDescription:
    "A sobriety anniversary is the yearly celebration of continuous recovery, marking how many years have passed since a person's sobriety date.",
  primaryCTA: {label: 'Shop Anniversary Coins', href: '/collections/all'},
  relatedPageSlugs: ['sobriety-coins', '1-year-sobriety-coin'],
  sections: [],
  faq: [],
  glossary: {
    definition: "The yearly milestone celebrating continuous sobriety from a person's sobriety date.",
    extendedContent:
      "A sobriety anniversary — sometimes called a \"cake\" in AA because some groups present a cake — marks the completion of each full year of continuous recovery. It is one of the most celebrated moments in 12-step and other recovery programs, often observed at a home group meeting with applause, sharing, and the presentation of a commemorative coin or medallion.\n\nYearly anniversaries carry special weight because they represent sustained daily choices over hundreds of days. At a one-year anniversary, the member has already navigated a full cycle of seasons, holidays, stress, and joy without substances. At five, ten, or twenty-five years, the depth of that commitment becomes even more remarkable.\n\nSobriety anniversary coins are typically made in bronze, silver, or gold, often bearing the number of years and the Serenity Prayer. Many people keep every anniversary coin they have ever received, creating a tangible timeline of their recovery journey.",
    category: 'Milestones & Time',
    relatedTermSlugs: ['sobriety-date', 'sober-birthday', 'milestone'],
    productLink: 'all',
  },
  schema: ['breadcrumb', 'definedTerm'],
});

// ============================================================
// GLOSSARY PAGES — Tokens & Coins
// ============================================================

registerSEOPage({
  slug: 'resources/glossary/medallion',
  type: 'glossary',
  title: 'Recovery Medallion',
  metaTitle: 'What Is a Recovery Medallion? — Definition & Meaning | Custom Milestones',
  metaDescription:
    'Learn what a recovery medallion is — a premium metal token marking a sobriety milestone — and how it differs from a standard AA chip.',
  canonicalPath: 'resources/glossary/medallion',
  eyebrow: 'Tokens & Coins',
  heroDescription:
    'A recovery medallion is a premium metal token awarded to mark significant sobriety milestones, often more elaborate than a standard chip.',
  primaryCTA: {label: 'Shop Recovery Medallions', href: '/collections/all'},
  relatedPageSlugs: ['sobriety-coins', 'aa-coins'],
  sections: [],
  faq: [],
  glossary: {
    definition:
      'A premium recovery token, typically made of metal, awarded to mark significant sobriety milestones.',
    extendedContent:
      "Recovery medallions are the premium tier of sobriety tokens. While the term is sometimes used interchangeably with \"sobriety coin,\" it often refers specifically to heavier, more elaborately crafted tokens made from bronze, brass, zinc alloy, or precious metals. Medallions are typically awarded for longer-term milestones — one year and beyond — when the occasion calls for something more substantial.\n\nThe front of a medallion commonly displays the Roman numeral or number of years achieved, along with the Serenity Prayer or program-specific text. The reverse often features the AA triangle, NA logo, or a personalized message. The added weight and quality of a medallion give it a tangible presence that reinforces its significance.\n\nMany families choose to commission custom medallions for loved ones' major anniversaries — five, ten, twenty-five years — as a lasting keepsake. Premium medallions are also popular as gifts from sponsors to sponsees, symbolizing pride in the work done together.",
    category: 'Tokens & Coins',
    relatedTermSlugs: ['sobriety-coin', 'aa-chip', 'anniversary'],
    productLink: 'all',
  },
  schema: ['breadcrumb', 'definedTerm'],
});

registerSEOPage({
  slug: 'resources/glossary/desire-chip',
  type: 'glossary',
  title: 'Desire Chip',
  metaTitle: 'What Is a Desire Chip? — Definition & Meaning | Custom Milestones',
  metaDescription:
    'Learn what a desire chip is in AA recovery — the first chip picked up to declare the desire to stop drinking — and its significance in the sobriety journey.',
  canonicalPath: 'resources/glossary/desire-chip',
  eyebrow: 'Tokens & Coins',
  heroDescription:
    'A desire chip is the first chip a person picks up in AA, representing their desire to stop drinking and take the first step toward recovery.',
  primaryCTA: {label: 'Shop Recovery Tokens', href: '/collections/all'},
  relatedPageSlugs: ['aa-coins', 'sobriety-coins'],
  sections: [],
  faq: [
    {
      question: 'What color is the desire chip?',
      answer:
        'The desire chip is traditionally white, symbolizing a blank slate and a new beginning. It is sometimes called the surrender chip or 24-hour chip.',
    },
  ],
  glossary: {
    definition:
      "The first chip picked up in Alcoholics Anonymous, representing a person's desire to stop drinking.",
    extendedContent:
      "The desire chip — also called the surrender chip, white chip, or 24-hour chip — is the most humble and arguably most courageous token in the sobriety coin system. It is offered at AA meetings to anyone who wants to stop drinking, no matter how many times they have tried before. Picking it up is an act of vulnerability and hope.\n\nThe chip is typically white, representing a clean slate and new beginning. When someone picks up a desire chip at a meeting, the group responds with a moment of recognition — applause, a handshake, or a hug — that communicates that they are not alone and that they are welcome exactly as they are.\n\nMany long-timers in recovery say that picking up their desire chip was the hardest and most important thing they ever did. Some carry their original white chip alongside their current milestone coin as a reminder of where they started. It is the coin that begins every sobriety story.",
    category: 'Tokens & Coins',
    relatedTermSlugs: ['aa-chip', 'sobriety-coin', 'sobriety-date'],
    productLink: 'all',
  },
  schema: ['breadcrumb', 'definedTerm'],
});

// ============================================================
// GLOSSARY PAGES — Support & Community
// ============================================================

registerSEOPage({
  slug: 'resources/glossary/sponsor',
  type: 'glossary',
  title: 'Sponsor',
  metaTitle: 'What Is a Sponsor in AA / NA? — Definition & Meaning | Custom Milestones',
  metaDescription:
    'Learn what a sponsor is in 12-step recovery programs — an experienced member who guides a newcomer through the steps — and why sponsorship is central to recovery.',
  canonicalPath: 'resources/glossary/sponsor',
  eyebrow: 'Support & Community',
  heroDescription:
    'A sponsor is an experienced member of a recovery program who guides a newcomer through the 12 steps and provides one-on-one support.',
  primaryCTA: {label: 'Shop Recovery Tokens', href: '/collections/all'},
  relatedPageSlugs: ['sobriety-coins'],
  sections: [],
  faq: [
    {
      question: 'How do you get a sponsor in AA or NA?',
      answer:
        'Simply ask someone at a meeting whose recovery you admire. Most members with significant clean time are willing to sponsor, and no formal application is needed.',
    },
  ],
  glossary: {
    definition:
      'An experienced recovery program member who guides a newcomer through the 12 steps and provides ongoing personal support.',
    extendedContent:
      "Sponsorship is one of the most distinctive and effective elements of 12-step recovery programs. A sponsor is someone with significant clean time who has completed the 12 steps and agrees to guide a newcomer — called a sponsee — through the same process. The relationship is one-on-one, deeply personal, and built on honesty and trust.\n\nThe sponsor-sponsee relationship is different from therapy or friendship, though it shares elements of both. A sponsor draws on their own recovery experience to help the sponsee navigate challenges, work through each step, and build a foundation for long-term sobriety. They are available by phone, meet regularly, and become a consistent presence in the sponsee's recovery.\n\nSponsorship is also reciprocal in a broader sense: sponsoring others is widely considered one of the most powerful ways to strengthen one's own recovery. Many people say that becoming a sponsor was when their recovery truly deepened. It is this chain — the sponsor who was once a sponsee — that has carried 12-step recovery across generations.",
    category: 'Support & Community',
    relatedTermSlugs: ['sponsee', 'twelve-steps', 'home-group'],
  },
  schema: ['breadcrumb', 'definedTerm'],
});

registerSEOPage({
  slug: 'resources/glossary/sponsee',
  type: 'glossary',
  title: 'Sponsee',
  metaTitle: 'What Is a Sponsee in Recovery? — Definition & Meaning | Custom Milestones',
  metaDescription:
    'Learn what a sponsee is in 12-step recovery — a person being guided by a sponsor through the steps — and the role this relationship plays in sobriety.',
  canonicalPath: 'resources/glossary/sponsee',
  eyebrow: 'Support & Community',
  heroDescription:
    'A sponsee is a person in a 12-step recovery program who is being guided through the steps by a more experienced member called a sponsor.',
  primaryCTA: {label: 'Shop Recovery Tokens', href: '/collections/all'},
  relatedPageSlugs: ['sobriety-coins'],
  sections: [],
  faq: [],
  glossary: {
    definition:
      'A person in a recovery program who is being guided through the 12 steps by a sponsor.',
    extendedContent:
      "Being a sponsee means entering into one of the most important relationships in recovery. A sponsee works directly with a sponsor — sharing their story honestly, completing each of the 12 steps, and learning to navigate life without substances. The sponsee-sponsor relationship is often described as the heart of 12-step recovery.\n\nBecoming someone's sponsee is an act of trust and vulnerability. Newcomers are encouraged to find a sponsor early — ideally within the first few weeks — because the structure and accountability that sponsorship provides dramatically improves outcomes. The sponsee is expected to call their sponsor regularly, attend meetings, and be honest about their struggles and temptations.\n\nOver time, the sponsee grows into greater autonomy and eventually may become a sponsor themselves, continuing the chain of recovery. Many people maintain lifelong relationships with former sponsors, finding that the bond forged in the difficult early work of the steps is among the most meaningful of their lives.",
    category: 'Support & Community',
    relatedTermSlugs: ['sponsor', 'twelve-steps', 'step-work'],
  },
  schema: ['breadcrumb', 'definedTerm'],
});

registerSEOPage({
  slug: 'resources/glossary/home-group',
  type: 'glossary',
  title: 'Home Group',
  metaTitle: 'What Is a Home Group in Recovery? — Definition & Meaning | Custom Milestones',
  metaDescription:
    'Learn what a home group is in AA and NA — the regular meeting a member considers their primary recovery community — and why it matters for long-term sobriety.',
  canonicalPath: 'resources/glossary/home-group',
  eyebrow: 'Support & Community',
  heroDescription:
    'A home group is the specific recovery meeting a member regularly attends and considers their primary community, where milestones are celebrated.',
  primaryCTA: {label: 'Shop Recovery Tokens', href: '/collections/all'},
  relatedPageSlugs: ['sobriety-coins'],
  sections: [],
  faq: [],
  glossary: {
    definition:
      "The specific meeting a recovery program member regularly attends and considers their primary recovery community.",
    extendedContent:
      "A home group is more than just a recurring meeting — it is a recovery family. In AA, NA, and other 12-step programs, members are encouraged to identify one meeting as their home group: the place they show up consistently, take on service responsibilities, and where their milestones are celebrated.\n\nHaving a home group provides accountability and continuity. When you are a \"home group member,\" others notice when you are absent. You are known by name, your history is known, and your sobriety anniversaries are celebrated by people who have watched you grow. This depth of connection is a powerful buffer against relapse.\n\nService is a key part of home group membership. Members take turns setting up chairs, making coffee, chairing meetings, and welcoming newcomers. This service orientation — giving back to the community that supported you — is considered an essential element of sustained recovery in 12-step philosophy.",
    category: 'Support & Community',
    relatedTermSlugs: ['fellowship', 'meeting', 'sponsor'],
  },
  schema: ['breadcrumb', 'definedTerm'],
});

registerSEOPage({
  slug: 'resources/glossary/fellowship',
  type: 'glossary',
  title: 'Fellowship',
  metaTitle: 'What Is Fellowship in Recovery? — Definition & Meaning | Custom Milestones',
  metaDescription:
    'Learn what fellowship means in AA and NA recovery — the community of people supporting each other in sobriety — and why community is essential to lasting recovery.',
  canonicalPath: 'resources/glossary/fellowship',
  eyebrow: 'Support & Community',
  heroDescription:
    'Fellowship is the community of people in recovery who support one another, share their experiences, and build a sober life together.',
  primaryCTA: {label: 'Shop Recovery Tokens', href: '/collections/all'},
  relatedPageSlugs: ['sobriety-coins'],
  sections: [],
  faq: [],
  glossary: {
    definition:
      'The community of people in a recovery program who support each other through shared experience, honesty, and mutual aid.',
    extendedContent:
      "Fellowship is the lifeblood of 12-step recovery. The word refers to the entire community of people in a program — AA, NA, Al-Anon, or others — who come together around shared experience and a common commitment to recovery. It is the network of relationships that makes long-term sobriety not just sustainable but genuinely joyful.\n\nThe fellowship provides what isolation cannot: perspective, accountability, humor, and hope. When a person in recovery faces a difficult day, the fellowship is there — in phone calls, coffee after meetings, and the simple act of sitting with others who understand. It is the antidote to the loneliness that often drives substance use.\n\nFellowship extends beyond meetings. Members support each other through job losses, health crises, and grief — and celebrate together at sober birthdays, weddings, and the birth of children born into a sober family. Sobriety coins are often presented within the fellowship, making them symbols not just of individual achievement but of communal support.",
    category: 'Support & Community',
    relatedTermSlugs: ['home-group', 'meeting', 'accountability'],
  },
  schema: ['breadcrumb', 'definedTerm'],
});

registerSEOPage({
  slug: 'resources/glossary/meeting',
  type: 'glossary',
  title: 'Recovery Meeting',
  metaTitle: 'What Is a Recovery Meeting? — Definition & Meaning | Custom Milestones',
  metaDescription:
    'Learn what a recovery meeting is in AA and NA — a gathering where people in recovery share experiences and support each other — and what to expect.',
  canonicalPath: 'resources/glossary/meeting',
  eyebrow: 'Support & Community',
  heroDescription:
    'A recovery meeting is a regular gathering where people in recovery share their experiences, offer support, and practice the principles of their program.',
  primaryCTA: {label: 'Shop Recovery Tokens', href: '/collections/all'},
  relatedPageSlugs: ['sobriety-coins'],
  sections: [],
  faq: [
    {
      question: 'What happens at an AA or NA meeting?',
      answer:
        "Meetings typically open with a reading (like the Serenity Prayer or the 12 Traditions), include member sharing about their recovery experiences, celebrate milestones with coin presentations, and close with a group affirmation.",
    },
  ],
  glossary: {
    definition:
      'A structured gathering of recovery program members to share experiences, offer support, and mark milestones together.',
    extendedContent:
      "Recovery meetings are the backbone of 12-step programs. Held in community centers, church basements, hospitals, and online, they provide a structured space where people in recovery gather to share their stories, celebrate milestones, and support one another. Meetings are open to anyone who wants to stop drinking or using, and no prior commitment is required to attend.\n\nA typical meeting includes a brief reading of program literature, a main speaker or open sharing period, announcements, and milestone celebrations. When a member reaches a sobriety milestone, they are invited to receive their chip or key tag in front of the group — a public acknowledgment of their achievement and a moment of community pride.\n\nThe variety of meetings is enormous: open meetings welcome anyone curious about recovery; closed meetings are for members only; speaker meetings feature one person sharing their story at length; step study meetings focus on one step at a time. Finding meetings that resonate is a personal process, and most members attend multiple meetings per week, especially in early recovery.",
    category: 'Support & Community',
    relatedTermSlugs: ['home-group', 'fellowship', 'aa-chip'],
  },
  schema: ['breadcrumb', 'definedTerm'],
});

// ============================================================
// GLOSSARY PAGES — Programs & Methods
// ============================================================

registerSEOPage({
  slug: 'resources/glossary/twelve-steps',
  type: 'glossary',
  title: 'Twelve Steps',
  metaTitle: 'What Are the Twelve Steps? — Definition & Meaning | Custom Milestones',
  metaDescription:
    'Learn what the 12 steps of recovery are — the foundational program of Alcoholics Anonymous — and how they guide people toward lasting sobriety.',
  canonicalPath: 'resources/glossary/twelve-steps',
  eyebrow: 'Programs & Methods',
  heroDescription:
    'The Twelve Steps are the core recovery program of Alcoholics Anonymous, providing a structured path from addiction to a life of sobriety and purpose.',
  primaryCTA: {label: 'Shop Recovery Tokens', href: '/collections/all'},
  relatedPageSlugs: ['sobriety-coins'],
  sections: [],
  faq: [
    {
      question: 'What are the 12 steps?',
      answer:
        'The 12 steps address admitting powerlessness over addiction, turning to a higher power, making a moral inventory, making amends, and carrying the message to others — guiding a full spiritual and behavioral transformation.',
    },
  ],
  glossary: {
    definition:
      "The 12-step program originating in Alcoholics Anonymous that provides a structured path to recovery through spiritual principles and community.",
    extendedContent:
      "The Twelve Steps were first published in the AA Big Book in 1939, written by AA co-founder Bill Wilson. They describe a path from the depths of addiction to a life of sobriety, purpose, and service. The steps have since been adapted by Narcotics Anonymous, Overeaters Anonymous, Gamblers Anonymous, and dozens of other programs addressing various addictions and compulsive behaviors.\n\nThe steps are not a one-time checklist — they are a lifelong practice. Early steps focus on honesty and surrender: admitting powerlessness, believing that a higher power can restore sanity, and making a decision to turn one's life over. Middle steps involve personal inventory, confession, and character work. Later steps address making amends and carrying the message to others.\n\nCompleting the steps is often marked with a celebration — a chip, a meeting dedicated to the milestone, a gift from a sponsor. Step work is where the real internal transformation of recovery happens, and many members describe working the steps as the most important thing they ever did.",
    category: 'Programs & Methods',
    relatedTermSlugs: ['step-work', 'making-amends', 'sponsor'],
  },
  schema: ['breadcrumb', 'definedTerm'],
});

registerSEOPage({
  slug: 'resources/glossary/higher-power',
  type: 'glossary',
  title: 'Higher Power',
  metaTitle: 'What Is a Higher Power in Recovery? — Definition & Meaning | Custom Milestones',
  metaDescription:
    'Learn what "higher power" means in 12-step recovery programs — a personal spiritual concept that supports surrender and long-term sobriety.',
  canonicalPath: 'resources/glossary/higher-power',
  eyebrow: 'Programs & Methods',
  heroDescription:
    'A higher power in 12-step recovery is a personal spiritual concept — any force greater than oneself — that supports the surrender and growth central to the program.',
  primaryCTA: {label: 'Shop Recovery Tokens', href: '/collections/all'},
  relatedPageSlugs: ['sobriety-coins'],
  sections: [],
  faq: [
    {
      question: 'Do I have to believe in God to work the 12 steps?',
      answer:
        'No. AA and NA explicitly allow members to define their higher power as they understand it — it can be the recovery group itself, nature, love, or any concept of a power greater than oneself.',
    },
  ],
  glossary: {
    definition:
      "A personal spiritual concept — any force greater than oneself — used in 12-step programs to support surrender and recovery.",
    extendedContent:
      "The concept of a higher power is central to 12-step recovery, appearing in the second and third steps of AA and NA. Bill Wilson deliberately wrote these steps with language that allows for broad interpretation: \"a Power greater than ourselves\" and \"God as we understood Him.\" This flexibility was intentional — designed to be accessible to people of all faiths and no faith.\n\nIn practice, members' understandings of a higher power vary enormously. For some, it is the God of a traditional religion. For others, it is the group itself — the collective wisdom and love of the fellowship. For others still, it is nature, the universe, or a more abstract force. The only requirement is a willingness to believe that something beyond one's own willpower can help.\n\nThe higher power concept addresses a core paradox of addiction recovery: the very thinking that led to addiction cannot reliably recover from it. Surrendering to something larger — whether spiritual or communal — allows a new perspective to emerge. Many people in recovery say that finding their higher power was the turning point in their sobriety.",
    category: 'Programs & Methods',
    relatedTermSlugs: ['twelve-steps', 'serenity-prayer', 'big-book'],
  },
  schema: ['breadcrumb', 'definedTerm'],
});

registerSEOPage({
  slug: 'resources/glossary/serenity-prayer',
  type: 'glossary',
  title: 'Serenity Prayer',
  metaTitle: 'What Is the Serenity Prayer? — Definition & Meaning | Custom Milestones',
  metaDescription:
    "Learn about the Serenity Prayer — the prayer recited at AA and NA meetings worldwide — its origin, meaning, and its connection to sobriety coins.",
  canonicalPath: 'resources/glossary/serenity-prayer',
  eyebrow: 'Programs & Methods',
  heroDescription:
    'The Serenity Prayer is the short prayer recited at AA and NA meetings worldwide, asking for serenity, courage, and wisdom — and inscribed on countless sobriety coins.',
  primaryCTA: {label: 'Shop Serenity Prayer Coins', href: '/collections/all'},
  relatedPageSlugs: ['sobriety-coins', 'aa-coins'],
  sections: [],
  faq: [
    {
      question: 'What is the full Serenity Prayer?',
      answer:
        '"God, grant me the serenity to accept the things I cannot change, courage to change the things I can, and wisdom to know the difference." The longer version continues with additional lines about living one day at a time.',
    },
  ],
  glossary: {
    definition:
      "The short prayer — \"God, grant me the serenity to accept the things I cannot change...\" — recited at recovery meetings worldwide and inscribed on sobriety coins.",
    extendedContent:
      "\"God, grant me the serenity to accept the things I cannot change, courage to change the things I can, and wisdom to know the difference.\" These words, commonly attributed to theologian Reinhold Niebuhr, were adopted by Alcoholics Anonymous in the 1940s and have since become the most recognized words in the recovery world.\n\nThe Serenity Prayer is recited at the opening or close of virtually every AA and NA meeting worldwide. Its three requests — serenity, courage, and wisdom — capture three of the most important qualities needed in recovery: the acceptance of powerlessness over addiction, the courage to change behavior, and the discernment to know the difference.\n\nThe Serenity Prayer appears on the reverse side of most standard AA and NA sobriety coins. For many people in recovery, the prayer functions as a rapid grounding tool — a few seconds of recitation can interrupt a craving, calm a moment of anger, or restore perspective when life feels overwhelming. Carrying a coin bearing the prayer keeps these words accessible in any moment.",
    category: 'Programs & Methods',
    relatedTermSlugs: ['higher-power', 'twelve-steps', 'sobriety-coin'],
    productLink: 'all',
  },
  schema: ['breadcrumb', 'definedTerm'],
});

registerSEOPage({
  slug: 'resources/glossary/one-day-at-a-time',
  type: 'glossary',
  title: 'One Day at a Time',
  metaTitle: 'What Does "One Day at a Time" Mean? — Definition | Custom Milestones',
  metaDescription:
    'Learn what "one day at a time" means in recovery — the philosophy of focusing on today rather than the daunting prospect of lifelong sobriety.',
  canonicalPath: 'resources/glossary/one-day-at-a-time',
  eyebrow: 'Programs & Methods',
  heroDescription:
    '"One day at a time" is the foundational recovery philosophy of staying sober just for today — making the impossible feel achievable through focus on the present.',
  primaryCTA: {label: 'Shop Recovery Tokens', href: '/collections/all'},
  relatedPageSlugs: ['sobriety-coins'],
  sections: [],
  faq: [],
  glossary: {
    definition:
      "A core recovery philosophy advising people to focus on staying sober just for today, rather than feeling overwhelmed by the prospect of lifelong abstinence.",
    extendedContent:
      "\"One day at a time\" is perhaps the most widely known phrase in recovery culture. It encapsulates a practical wisdom that has helped millions of people stay sober: instead of committing to never drink again forever — a commitment that can feel impossible — focus only on not drinking today. Tomorrow, make the same commitment. Recovery, it turns out, is built one 24-hour period at a time.\n\nThis philosophy addresses one of the most common obstacles in early recovery: catastrophizing about the future. The thought of never attending another happy hour, never celebrating with a drink again, or navigating every holiday sober for the rest of one's life can feel paralyzing. \"One day at a time\" cuts through that overwhelm by making the task manageable: just today.\n\nThe 24-hour period is also why the first sobriety chip — the desire chip — represents 24 hours rather than a month. AA recognized that for someone in the grip of addiction, committing to one full day was monumental enough. Each 24-hour coin awarded at meetings is a tangible reminder that recovery is built in the smallest possible increments, each one complete and worthy of celebration.",
    category: 'Programs & Methods',
    relatedTermSlugs: ['sobriety', 'clean-time', 'gratitude-list'],
  },
  schema: ['breadcrumb', 'definedTerm'],
});

// ============================================================
// PHRASE-MATCH EXPANSION — TIER A (generic-seo template)
// ============================================================

registerSEOPage({
  slug: 'milestone-tokens',
  type: 'commercial',
  template: 'generic-seo',
  title: 'Milestone Tokens',
  metaTitle: 'Milestone Tokens — Handcrafted Recovery Coins | Custom Milestones',
  metaDescription:
    'Shop premium milestone tokens for every recovery achievement. Handcrafted coins marking 24 hours, 30 days, 1 year, and every milestone in between. Design your own.',
  canonicalPath: 'milestone-tokens',
  eyebrow: 'Mark Every Milestone',
  heroDescription:
    'Milestone tokens are the physical proof that the days you strung together actually happened. Handcrafted, weighted, and made to last — one for every milestone that mattered.',
  primaryCTA: {label: 'Shop Milestone Tokens', href: '/collections/all'},
  featuredCollectionHandle: 'all',
  // This hub is the flat index for the entire milestone ladder. Every milestone
  // page is listed here directly (not just via prev/next chaining) so they stay
  // shallow for crawlers — the hub is linked from the footer on every page.
  relatedPageSlugs: [
    '24-hour-chip',
    'early-recovery-chips',
    '30-day-sobriety-coin',
    '60-day-sobriety-coin',
    '90-day-sobriety-coin',
    '6-month-sobriety-coin',
    '9-month-sobriety-coin',
    '1-year-sobriety-coin',
    '2-year-sobriety-coin',
    '5-year-sobriety-coin',
    '10-year-sobriety-coin',
    '15-year-sobriety-coin',
    '20-year-sobriety-coin',
    '25-year-sobriety-coin',
    'long-term-sobriety-coins',
    'recovery-tokens',
    'sobriety-coins',
    'custom-recovery-token',
  ],
  sections: [
    {
      type: 'text',
      heading: 'What Are Milestone Tokens?',
      body: "Milestone tokens are physical markers — coins, chips, or medallions — given to people in recovery to commemorate specific sobriety achievements. Unlike a generic keepsake, a milestone token is tied to a date: the day you reached 24 hours, 30 days, 90 days, a year, five years, and beyond. Every token corresponds to a moment you decided to keep going.\n\nThe term 'milestone token' is deliberately program-agnostic. AA calls them chips. NA uses medallions and key tags. Celebrate Recovery has its own designs. SMART Recovery doesn't formalize them at all. But the underlying idea is shared across every major recovery tradition: turn an invisible achievement into something you can hold in your hand, and the achievement feels real.\n\nAt Custom Milestones, we make milestone tokens for every point in the journey — from the 24-hour surrender chip to 25-year anniversary medallions — and we make them out of premium materials because the days they represent are worth more than stamped aluminum.",
    },
    {
      type: 'text',
      heading: 'Every Milestone Deserves a Marker',
      body: "The milestones that matter aren't always the ones you'd expect. The 1-year chip gets the celebrations, but ask anyone in long-term recovery and they'll tell you the 24-hour chip is the one that saved their life. The decision to start — in a church basement, on a couch, in a treatment center parking lot — is the hardest one they ever made. The token that marks that day becomes the most important thing they own.\n\nEarly recovery milestones land hardest: 30 days (the month you proved you could), 60 days (the month you proved the first month wasn't a fluke), 90 days (the quarter that starts to feel like who you are now). Then the half-year and nine-month tokens fill the long stretches where the meetings get quieter and the work gets harder. The 1-year medallion is the first real celebration — the proof you were building toward something.\n\nAnnual milestones after that — 2, 5, 10, 15, 20, 25 years — each carry their own weight. Some mark a quiet morning alone. Others mark the dinner where your family finally stopped waiting for the relapse. Every one of them deserves a token that feels as permanent as the work that earned it.",
    },
    {
      type: 'text',
      heading: 'Tokens, Chips, Coins, Medallions — What\'s the Difference?',
      body: "The vocabulary varies by program and region, and the distinctions are mostly historical. 'Chip' comes from AA's earliest days in 1940s Cleveland, when the Clarence Snyder group handed out poker chips at meetings — the cheapest round tokens they could buy. AA kept the name. 'Coin' became popular as designs got more elaborate and manufacturers moved from stamped plastic to cast metal. 'Medallion' tends to describe larger, heavier annual coins — the ones you display rather than carry. 'Token' is the umbrella word that captures all of them.\n\nSome groups treat the terms as strictly different objects — NA, for example, distinguishes key tags (plastic, for shorter clean-time) from medallions (metal, for annual milestones). Other groups use the words interchangeably. When you're shopping for a milestone token, what matters isn't the label — it's whether the object feels substantial enough to carry the weight of what it represents.",
    },
  ],
  faq: [
    {
      question: 'What is a milestone token in recovery?',
      answer:
        'A milestone token is a physical coin, chip, or medallion given to someone in recovery to mark a specific sobriety achievement — 24 hours, 30 days, 1 year, and so on. The tradition comes from AA but has spread across almost every recovery program. Milestone tokens turn an invisible accomplishment into something tangible you can hold.',
    },
    {
      question: 'Are milestone tokens the same as AA chips?',
      answer:
        'AA chips are a type of milestone token. The word "token" is broader — it covers AA chips, NA medallions, Celebrate Recovery coins, and every other program-specific marker. If you\'re shopping for someone whose program you don\'t know, a generic premium milestone token works across every tradition.',
    },
    {
      question: 'What milestones typically get tokens?',
      answer:
        'The most common milestone tokens are 24 hours, 30 days, 60 days, 90 days, 6 months, 9 months, and then annual anniversaries starting at 1 year. Some people also collect tokens for 18 months, 2 years, 5 years, 10 years, 15 years, 20 years, and 25 years. Every milestone that matters to you deserves one.',
    },
    {
      question: 'Can I get a custom milestone token made?',
      answer:
        'Yes. Our custom token flow lets you design a one-of-a-kind milestone token with your own date, engraving, and imagery. You can either describe your vision and let us design it, or control every detail yourself. The custom flow is built for people who want their milestone marked by something truly personal.',
    },
    {
      question: 'What material is best for a milestone token?',
      answer:
        'Bronze is the most traditional and durable choice — it develops a patina over time that many people find meaningful. Silver has a cleaner, more formal look and feels substantial in the hand. Gold is reserved for the most significant milestones — typically 10+ year anniversaries. For daily-carry tokens that need to survive pockets and keyrings, bronze is the most forgiving.',
    },
  ],
  schema: ['breadcrumb', 'faq', 'webPage'],
});

// ============================================================
// PHRASE-MATCH EXPANSION — TIER B (custom-intent template)
// ============================================================

registerSEOPage({
  slug: 'custom-recovery-token',
  type: 'commercial',
  template: 'custom-intent',
  title: 'Custom Recovery Token',
  metaTitle: 'Custom Recovery Token — Design Your Own Sobriety Coin | Custom Milestones',
  metaDescription:
    'Design a one-of-a-kind custom recovery token. Choose engraving, material, and imagery — or tell us your story and we\'ll design it for you. Built for the milestones that matter most.',
  canonicalPath: 'custom-recovery-token',
  eyebrow: 'Make It Yours',
  heroDescription:
    "A custom recovery token turns your story into something you can hold. Your date, your imagery, your words — on a premium token built to last a lifetime. Two ways to create yours.",
  primaryCTA: {label: 'Start Designing', href: '/custom-token'},
  featuredCollectionHandle: 'all',
  relatedPageSlugs: [
    'milestone-tokens',
    'personalized-recovery-tokens',
    'recovery-tokens',
    'custom-sobriety-coins',
  ],
  customTokenBlock: {
    eyebrow: 'The Flagship Experience',
    headline: "A recovery token that's truly yours — start to finish.",
    body: "Every milestone is different. So is every story. Our custom token flow is built for the moments a stock design can't quite capture — the name you want engraved, the date only you know, the image that means something only to you. Two paths, one result: a token made for you alone.",
    primaryCtaLabel: 'Start Designing',
    secondaryCtaLabel: 'See the Process',
  },
  sections: [
    {
      type: 'text',
      heading: 'Two Paths to Your Custom Recovery Token',
      body: "When you start the custom token flow, you'll choose between two paths.\n\n**We Design It For You.** If you have a story but not a design, tell us the occasion, the person, the milestone, the words that matter. Our designers will translate your answers into a finished proof — usually within 2-3 business days — and send it to you by email. You review, suggest changes, and approve. Once you're happy, we cast and finish the token and ship it to you. This path is best for people who know what they want to say but don't want to pick every font and color.\n\n**You Design It Yourself.** If you have a clear vision — specific imagery, a layout in mind, fonts you love — the self-design path gives you control. You describe your design, refine it with our on-screen tools, preview the front and back, and approve before we produce it. This path is best for people who enjoy the design process and want to own every detail.\n\nBoth paths end the same way: a premium, handcrafted recovery token built from bronze, silver, or gold, weighted to feel substantial in your pocket, and made to last longer than the memories it marks.",
    },
    {
      type: 'text',
      heading: 'What You Can Customize',
      body: "A custom recovery token isn't just a stock design with a date slapped on. You control everything that matters.\n\n**Engraving.** Names, dates, phrases, Roman numerals, the Serenity Prayer, a sponsor's initials, a spouse's handwriting. Front and back. Deep engraving that won't wear off.\n\n**Imagery.** Triangle and circle (AA), clean-time symbols (NA), a lighthouse, a mountain, a phoenix, a tree, your home group logo, a meaningful place. If you can describe it, we can design it.\n\n**Material and finish.** Bronze (traditional, develops a warm patina), silver (clean and formal), or gold (reserved for major milestones). Matte, polished, or antiqued finishes.\n\n**Size and weight.** Standard pocket-carry sized (same as AA chips) or larger commemorative sizes for display.\n\n**Edge and rim details.** Knurled, beaded, plain, or custom-etched rims.\n\nThe only thing you can't customize is the quality. Every token we ship meets the same premium standard.",
    },
    {
      type: 'text',
      heading: 'Who Custom Recovery Tokens Are For',
      body: "Most people who order a custom recovery token are marking an occasion a stock design can't quite reach. Sponsors giving a 1-year medallion to a sponsee whose story they want to honor. Spouses commemorating a partner's 5-year sober anniversary. Parents celebrating a child's first year in recovery. People in long-term recovery building a personal collection that documents their own journey in a way no catalog can.\n\nThe custom flow also serves the practical case: group logos for home groups, retreat commemorative tokens, recovery center graduation coins, and memorial tokens for people lost to addiction. Whatever the reason, the custom path exists because some milestones deserve a token designed for that exact moment and nobody else's.",
    },
  ],
  faq: [
    {
      question: 'How long does it take to get a custom recovery token?',
      answer:
        'Design proofs typically come back within 2-3 business days. Once you approve the design, production takes about a week. Total time from order to doorstep is usually 2-3 weeks — longer if you choose gold or request multiple rounds of revisions.',
    },
    {
      question: 'How much does a custom recovery token cost?',
      answer:
        'Custom token pricing depends on material (bronze is most affordable, gold is the most premium), size, and complexity of the design. Start the custom flow to get a personalized quote — you\'ll see the price before you commit to anything.',
    },
    {
      question: 'Can I see the design before I commit to buying?',
      answer:
        'Yes. Both custom paths produce a finished design proof that you review and approve before we start production. If the proof isn\'t quite right, you can request revisions. You only commit to the final product once you\'ve signed off on the design.',
    },
    {
      question: "What's the difference between a custom token and a personalized token?",
      answer:
        'A personalized token is a stock design with your name or date engraved on it. A custom token is a design built from scratch to your specifications — imagery, layout, engraving, and all. Personalization is faster and cheaper. Custom gives you something genuinely one-of-a-kind.',
    },
    {
      question: 'Can I order multiple identical custom tokens?',
      answer:
        "Yes. Custom designs can be produced in quantities from 1 to several hundred — useful for home groups, retreats, or gifting a matching set to people who shared a milestone. Quantity pricing becomes more favorable above 10 units.",
    },
  ],
  schema: ['breadcrumb', 'faq', 'webPage'],
});

// ============================================================
// PHRASE-MATCH EXPANSION — TIER A BATCH 1 (AA/NA phrase families)
// ============================================================

registerSEOPage({
  slug: 'aa-sobriety-coins',
  type: 'commercial',
  template: 'generic-seo',
  title: 'AA Sobriety Coins',
  metaTitle: 'AA Sobriety Coins — Premium Handcrafted AA Chips | Custom Milestones',
  metaDescription:
    'Shop premium AA sobriety coins for every milestone. Handcrafted coins in the traditional AA color system. Design your own for a truly personal touch.',
  canonicalPath: 'aa-sobriety-coins',
  eyebrow: 'Alcoholics Anonymous',
  heroDescription:
    "AA sobriety coins are the original milestone markers — handed out in meetings for over 80 years to celebrate clean time from 24 hours onward. Shop the collection or design your own.",
  primaryCTA: {label: 'Shop AA Sobriety Coins', href: '/collections/all'},
  featuredCollectionHandle: 'all',
  relatedPageSlugs: [
    'aa-coins',
    'aa-sobriety-tokens',
    'aa-sober-chips',
    'sobriety-coins',
    'custom-aa-coins',
  ],
  sections: [
    {
      type: 'text',
      heading: 'What Are AA Sobriety Coins?',
      body: "AA sobriety coins are physical milestone markers handed out at Alcoholics Anonymous meetings to recognize periods of continuous sobriety. The tradition follows a well-established ladder: 24 hours, 30 days, 60 days, 90 days, 6 months, 9 months, 1 year, and every annual anniversary after that. Each coin corresponds to a specific milestone, and receiving one in front of your group turns an internal accomplishment into a shared celebration.\n\nThe practice dates back to the early 1940s, when Clarence Snyder's Cleveland AA group began handing out inexpensive tokens to members who hit sobriety milestones. What started as a practical way to mark progress became one of the most enduring traditions in all of recovery. Today, AA sobriety coins are recognized worldwide — and the color each one carries tells people in the room exactly how far you've come.",
    },
    {
      type: 'text',
      heading: 'Colors and Meanings in AA Sobriety Coins',
      body: "Every AA sobriety coin in the early milestone series carries a specific color, and that color is the first thing anyone in the room notices. The system isn't written into AA's official literature — the Big Book never mentions chips — but it's been practiced so consistently for so long that most members can recite the sequence from memory.\n\nWhite is where it begins. The white chip — sometimes called the desire chip or the surrender chip — is offered to anyone willing to try sobriety for the next 24 hours. There is no requirement beyond wanting to stop. Taking it is an act of honesty in a room full of people who understand exactly what that honesty costs.\n\nGold or yellow marks 30 days. It represents the first full month — the period where the physical withdrawal subsides but the emotional turbulence hasn't settled yet. Red arrives at 60 days, a quieter milestone that often catches people off guard because two months of sobriety starts to feel like a new way of living rather than a crisis being managed. Green at 90 days closes out the first quarter, the point most treatment programs target as the minimum foundation for sustained recovery.\n\nBlue marks 6 months — half a year of showing up, one day at a time, through holidays and hard conversations and mornings that used to start very differently. Purple at 9 months is the bridge between the early-recovery milestones and the 1-year anniversary. It fills a stretch that many people describe as the hardest: far enough from the wreckage to forget why they quit, not yet close enough to the anniversary to feel momentum pulling them forward.\n\nBronze marks 1 year. It's the dividing line between the early-color chips and the annual coins that follow. After the first year, annual milestones are typically distinguished by material — bronze, silver, gold — rather than by painted color. Some regions substitute different hues or add milestones like 18 months, but the core sequence above is what most groups in the United States follow. If your home group's palette differs slightly, that's normal. The colors are a convention, not a rule, and the meaning behind each one is more important than the exact shade.",
    },
    {
      type: 'text',
      heading: 'Why Premium Matters for AA Sobriety Coins',
      body: "Most AA sobriety coins handed out at meetings are made from stamped aluminum or injection-molded plastic. They cost pennies to produce. They serve their purpose in the moment — the applause, the handshake, the brief flash of pride — but within months the paint chips, the edges wear smooth, and the coin becomes something you hesitate to show anyone.\n\nA premium handcrafted coin is built for a different timeline. Cast bronze holds its detail for decades. The weight in your pocket is noticeable — a constant, quiet reminder that the days you accumulated are real and worth protecting. Engraving stays legible after years of daily carry. The patina that develops over time becomes part of the coin's story, not a sign of deterioration.\n\nAA sobriety coins mark the hardest work most people will ever do. The object that represents that work should be built to outlast the doubt that occasionally follows.",
    },
  ],
  faq: [
    {
      question: 'What do the colors on AA sobriety coins mean?',
      answer:
        "AA sobriety coin colors mark early milestones. The most common system: white (24 hours / desire chip), gold or yellow (30 days), red (60 days), green (90 days), blue (6 months), purple (9 months), and bronze (1 year). Annual coins beyond the first year are typically bronze, silver, or gold by material rather than paint. Colors vary by region and group, so your home group's tradition may differ slightly.",
    },
    {
      question: 'What is the first AA sobriety coin called?',
      answer:
        'The first AA sobriety coin is the 24-hour chip, often called the "white chip" or "desire chip." It\'s given to anyone in the meeting who wants to try sobriety for the next 24 hours — no questions asked, no judgment. The white chip represents the surrender that makes everything else possible.',
    },
    {
      question: 'Who gives out AA sobriety coins at meetings?',
      answer:
        "At most AA meetings, the chairperson or a designated member hands out sobriety coins. The person receiving the chip usually walks to the front of the room and shares briefly about their milestone. Some groups invite the person's sponsor to hand them the coin personally.",
    },
    {
      question: 'Can I buy my own AA sobriety coin instead of getting one at a meeting?',
      answer:
        "Yes. Many people buy their own AA sobriety coins as keepsakes, gifts, or replacements for chips they've lost. There's no rule against it — AA sobriety coins are meaningful because of what they represent, not because of where you got them. Our handcrafted coins are made to last decades longer than the stamped aluminum ones handed out at most meetings.",
    },
  ],
  schema: ['breadcrumb', 'faq', 'webPage'],
});

registerSEOPage({
  slug: 'aa-sobriety-tokens',
  type: 'commercial',
  template: 'generic-seo',
  title: 'AA Sobriety Tokens',
  metaTitle: 'AA Sobriety Tokens — The Original Recovery Chips | Custom Milestones',
  metaDescription:
    "Shop premium AA sobriety tokens. Discover the 1940s Cleveland origin story and carry the tradition that started it all. Handcrafted tokens for every milestone.",
  canonicalPath: 'aa-sobriety-tokens',
  eyebrow: 'AA Heritage',
  heroDescription:
    "AA sobriety tokens have a specific origin — the Clarence Snyder group in 1940s Cleveland, who first handed out poker chips at meetings to mark clean time. The word 'token' stuck. Here's where the tradition began.",
  primaryCTA: {label: 'Shop AA Sobriety Tokens', href: '/collections/all'},
  featuredCollectionHandle: 'all',
  relatedPageSlugs: [
    'aa-coins',
    'aa-sobriety-coins',
    'aa-sober-chips',
    'alcoholics-anonymous-sobriety-coins',
    'custom-aa-coins',
  ],
  sections: [
    {
      type: 'text',
      heading: 'What Are AA Sobriety Tokens?',
      body: "AA sobriety tokens are the milestone markers used across Alcoholics Anonymous to recognize periods of continuous sobriety — from the first 24 hours through decades of sustained recovery. The word 'token' is one of several names for the same tradition: some groups say chips, others say coins, still others say medallions. All of them describe a small, round object given to a member who has reached a specific milestone in their sobriety.\n\nWhat makes the word 'token' distinctive is its direct lineage to the objects that started the practice. AA sobriety tokens trace their origin to a particular group, a particular city, and a particular era — and understanding that history is part of understanding why these small objects carry such outsized weight in recovery culture.",
    },
    {
      type: 'text',
      heading: 'Where the Token Tradition Began',
      body: "Alcoholics Anonymous was founded in Akron, Ohio, in 1935 by Bill Wilson and Dr. Bob Smith. By 1939, the fledgling movement had spread to Cleveland, where a member named Clarence Snyder helped establish one of the city's first AA groups. Snyder was a pragmatist and an organizer. He saw that the Akron meetings relied on informal accountability — members simply showed up and talked — and he wanted something more concrete. He wanted a way to mark the milestones that kept people coming back.\n\nSnyder's solution was cheap and practical: poker chips. He bought them in bulk, probably from a five-and-dime, and began handing them out at Cleveland meetings to members who hit sobriety milestones. The chips were small, round, easy to carry, and — crucially — visible to other members. When someone pulled a chip from a pocket during a meeting, everyone in the room knew what it meant without a word being spoken.\n\nThe word 'token' stuck because that's what poker chips were: tokens exchanged in a game. Snyder repurposed the object and the language. The chip was no longer a placeholder for money in a card game. It was a placeholder for something harder to hold onto — a day, a week, a month of choosing differently.\n\nBy the mid-1940s, the practice had spread from Cleveland to AA groups across the Midwest, then to the coasts. There was no official AA mandate — the Big Book, published in 1939, never mentions chips or tokens — but the tradition filled a need that the literature alone couldn't. Sobriety is invisible. The token made it visible. It gave people a way to measure progress without counting out loud, and it gave groups a reason to celebrate together at every meeting.\n\nOver the decades, the objects themselves evolved. Poker chips gave way to stamped aluminum. Aluminum gave way to enameled metal. Some groups moved to cast bronze and silver for annual milestones. But the concept never changed: a small object, given in recognition, carried daily as proof that the work is real. AA sobriety tokens still serve the exact same purpose Clarence Snyder intended when he bought that first bag of poker chips in a Cleveland general store.",
    },
    {
      type: 'text',
      heading: 'From Poker Chips to Premium Bronze',
      body: "The original AA sobriety tokens were disposable by design. Snyder wasn't building keepsakes — he was solving a problem with whatever was cheap and available. Poker chips cost almost nothing, and they did the job. But the symbolism outgrew the material. People started carrying their tokens everywhere. They rubbed them smooth in their pockets. They held them during cravings. They showed them to their children.\n\nAs the tradition deepened, the materials caught up. Stamped aluminum replaced plastic. Enameled metal added color and detail. Cast bronze gave the tokens real weight — enough to feel in a coat pocket, enough to notice when you reach for your keys. The physical evolution mirrors the emotional one: what starts as a simple gesture of recognition becomes something you build a life around.\n\nOur handcrafted AA sobriety tokens are built in that same lineage. Premium bronze, deep engraving, a weight that registers in your hand. Clarence Snyder handed out poker chips because they were all he had. You deserve something built to last as long as the decision it represents.",
    },
  ],
  faq: [
    {
      question: 'Where did AA sobriety tokens come from?',
      answer:
        "AA sobriety tokens trace back to Clarence Snyder's Cleveland AA group in the early 1940s. Snyder's group was one of the first to formalize milestone celebrations, and they used poker chips — the cheapest round tokens they could buy — to mark clean time. The practice spread across AA meetings throughout the 1940s and became the tradition we know today.",
    },
    {
      question: 'Why are they called tokens and not chips?',
      answer:
        "The words 'token' and 'chip' both come from the original poker-chip tradition, and they're largely interchangeable. Some groups prefer 'token' because it evokes the idea of something given in recognition — a token of achievement. Others stick with 'chip' as a nod to the original object. In modern AA, both terms refer to the same milestone markers.",
    },
    {
      question: 'Are AA sobriety tokens the same as AA chips?',
      answer:
        "Yes, functionally they're the same object with slightly different names. Some groups use 'chip' for smaller stamped-plastic meeting markers and 'token' for heavier cast-metal milestone coins, but the distinction is informal and varies by region.",
    },
    {
      question: 'What milestones do AA sobriety tokens mark?',
      answer:
        "AA sobriety tokens mark the same milestones AA has recognized for decades: 24 hours, 30 days, 60 days, 90 days, 6 months, 9 months, 1 year, and every annual anniversary after that. Some groups also recognize 18 months as a formal milestone.",
    },
  ],
  schema: ['breadcrumb', 'faq', 'webPage'],
});

registerSEOPage({
  slug: 'aa-sober-chips',
  type: 'commercial',
  template: 'generic-seo',
  title: 'AA Sober Chips',
  metaTitle: 'AA Sober Chips — Premium Recovery Chips for Every Milestone | Custom Milestones',
  metaDescription:
    "Shop premium AA sober chips for every milestone from 24 hours to 25+ years. The tradition of the white desire chip and the ritual of picking yours up.",
  canonicalPath: 'aa-sober-chips',
  eyebrow: 'The Meeting Room Tradition',
  heroDescription:
    "The moment you walk up to the front of the room and pick up your AA sober chip is the moment the milestone becomes real. Handcrafted chips that carry the weight of what you earned.",
  primaryCTA: {label: 'Shop AA Sober Chips', href: '/collections/all'},
  featuredCollectionHandle: 'all',
  relatedPageSlugs: [
    'aa-coins',
    'aa-sobriety-coins',
    'aa-sobriety-tokens',
    '24-hour-chip',
    'custom-aa-coins',
  ],
  sections: [
    {
      type: 'text',
      heading: 'What Are AA Sober Chips?',
      body: "AA sober chips are the milestone markers that Alcoholics Anonymous members receive at meetings to acknowledge specific periods of continuous sobriety. From the very first 24-hour chip to annual anniversary medallions, each one is given in front of the group — a public recognition of private work. The term 'chip' is the most common name for these objects within AA itself, rooted in the original poker chips that were used in the 1940s.\n\nWhat makes AA sober chips different from a trophy on a shelf or a certificate in a drawer is the way they're received. They aren't mailed to you. They aren't ordered online and unwrapped in private. They're handed to you in a room full of people who know exactly what it took to earn one. The ritual of picking up an AA sober chip is as important as the chip itself.",
    },
    {
      type: 'text',
      heading: 'The Ritual of Picking Up Your Chip',
      body: "There's a moment in most AA meetings — usually near the beginning or the end — when the chairperson pauses and asks if anyone is celebrating a milestone. The room goes quiet. Sometimes nobody moves. Sometimes three people stand up at once. But when someone does rise from their chair and walk to the front of the room, something shifts. The meeting, which may have been running on autopilot, suddenly feels like it matters.\n\nThe white chip comes first in the sequence, and it's the most powerful. The chairperson holds it up and offers it to anyone who wants to try sobriety for just the next 24 hours. No conditions. No sobriety requirement. No questions. Taking a white chip is the closest thing AA has to a public vow, and it requires nothing except the willingness to try. When someone walks up — often shaking, sometimes crying, occasionally angry — the room responds with applause. Not polite applause. The kind that says: we know what this costs, and we're glad you're here.\n\nMilestone chips after the white one follow a more structured rhythm. Thirty days. Sixty days. Ninety days. Six months. Nine months. One year. The chairperson reads the milestone, the member walks up, and what happens next depends on the group. Some meetings invite the recipient to say a few words — their name, their milestone, maybe a sentence about what got them through. Others keep it brief: a handshake, a hug from a sponsor, a moment of eye contact that says more than any share could.\n\nThe sponsor's role in the ritual varies, but in many groups the sponsor is the one who physically places the chip in the person's hand. That gesture matters. The sponsor watched the work happen — the late-night phone calls, the white-knuckle Saturdays, the step work that unearthed things neither of them wanted to look at. Handing over the chip closes a loop: I believed you could do this, and here's proof you did.\n\nAnnual chips — the 1-year, the 5-year, the 10-year — bring a different energy. The whole meeting often knows who's receiving one. There's cake sometimes. There's laughter. The person sharing might talk for five minutes instead of one. The room listens differently because long-term sobriety is contagious — it reminds everyone that this actually works, that the daily grind of one-day-at-a-time eventually becomes a life you'd choose on purpose.",
    },
    {
      type: 'text',
      heading: 'Carrying the Chip Home',
      body: "After the meeting ends and the folding chairs are stacked against the wall, the chip goes home with you. That's when it starts its second life — not as a ceremonial object, but as a daily companion.\n\nMost people carry their most recent chip in a front pocket or a wallet. They reach for it without thinking, the way you'd reach for a worry stone or a set of keys. The weight of it becomes a habit, and the habit becomes an anchor. People in early recovery describe pulling their chip out during a craving — rolling it between their fingers in a bar parking lot, gripping it during a phone call they almost didn't make, pressing it against their palm in a meeting where someone else's story hit too close.\n\nOlder chips migrate to nightstands, keychains, display cases, or the small boxes where people keep things too important to throw away but too personal to frame. Some people carry every chip they've ever earned. Others keep only two: the 24-hour chip and the most recent annual. AA sober chips end up in the places that matter — close at hand when things are hard, visible when you need reminding that the worst day sober is still better than the best day drunk.",
    },
  ],
  faq: [
    {
      question: 'What is the white chip in AA?',
      answer:
        "The white chip — also called the 'desire chip' or '24-hour chip' — is the first AA sober chip. It's offered to anyone in the meeting who wants to try 24 hours of sobriety, whether it's their first day or their hundredth relapse. The only requirement for taking a white chip is the desire to stop drinking.",
    },
    {
      question: 'Is there a ritual for receiving an AA sober chip?',
      answer:
        "Most AA meetings have a brief moment in every meeting when the chairperson asks who has a milestone. People with milestones walk up, receive their chip, often say their name and their clean-time count, and are met with applause. The format varies by group — some meetings invite a sponsor to hand over the chip personally, others keep it informal.",
    },
    {
      question: "What do you do with AA sober chips after you get them?",
      answer:
        "Most people carry their most recent chip in a pocket or wallet as a daily reminder. Older chips often end up on a keychain, in a nightstand drawer, or in a display case for longer collections. Some people keep every chip they've earned; others carry only the 24-hour and the most recent annual.",
    },
    {
      question: "Can I give someone an AA sober chip as a gift?",
      answer:
        "Yes, though the traditional giving happens at meetings. Giving an AA sober chip as a gift outside the meeting — from a sponsor to a sponsee, from a family member to someone in recovery, or as a keepsake replacement for a lost chip — is common and meaningful. A handcrafted premium chip can make a meaningful milestone gift.",
    },
  ],
  schema: ['breadcrumb', 'faq', 'webPage'],
});

registerSEOPage({
  slug: 'na-sobriety-coins',
  type: 'commercial',
  template: 'generic-seo',
  title: 'NA Sobriety Coins',
  metaTitle: 'NA Sobriety Coins — Narcotics Anonymous Medallions | Custom Milestones',
  metaDescription:
    "Shop premium NA sobriety coins and medallions. Narcotics Anonymous uses its own chip tradition — here's how it differs from AA and where to find quality tokens.",
  canonicalPath: 'na-sobriety-coins',
  eyebrow: 'Narcotics Anonymous',
  heroDescription:
    "NA sobriety coins mark clean time in Narcotics Anonymous. NA has its own color system, its own key-tag tradition for early clean-time, and its own medallion tradition for annual milestones.",
  primaryCTA: {label: 'Shop NA Sobriety Coins', href: '/collections/all'},
  featuredCollectionHandle: 'all',
  relatedPageSlugs: [
    'na-coins',
    'na-sober-chips',
    'narcotics-anonymous-coins',
    'aa-sobriety-coins',
    'custom-na-coins',
  ],
  sections: [
    {
      type: 'text',
      heading: 'What Are NA Sobriety Coins?',
      body: "NA sobriety coins are the milestone markers used within Narcotics Anonymous to celebrate periods of continuous clean time. Like their AA counterparts, they represent specific achievements — 30 days, 90 days, 1 year, and beyond — and they're given out at meetings as a form of group recognition. But NA developed its own distinct system for marking milestones, and that system looks and works differently from what most people picture when they think of recovery chips.\n\nUnderstanding NA sobriety coins means understanding a two-tier tradition: plastic key tags for the early milestones and metal medallions for the annual ones. The two objects serve the same purpose but carry different weight, both literally and symbolically.",
    },
    {
      type: 'text',
      heading: 'How NA Sobriety Coins Differ From AA Chips',
      body: "The most visible difference between NA and AA milestone markers is material. AA hands out metal chips at every milestone, from the 24-hour surrender chip onward. NA splits the timeline: early clean-time milestones get plastic key tags, and the first metal medallion doesn't arrive until the 1-year anniversary. That distinction shapes the entire experience of early recovery in NA. For the first twelve months, what you carry on your keychain is lightweight, inexpensive, and deliberately modest — a reminder that the work is still fresh.\n\nThe color sequences are also different, and they don't map neatly onto each other. NA's key-tag progression runs: white for the welcome tag (given to anyone expressing a desire to stop using, regardless of clean time), orange for 30 days, green for 60 days, red for 90 days, blue for 6 months, yellow for 9 months, and moonglow — a pearlescent cream-white — for 1 year. The moonglow tag is usually the last key tag a member receives. After that, annual milestones are marked with metal medallions, typically in bronze, silver, or gold depending on the year and the group's convention.\n\nNA was founded in 1953, nearly two decades after AA. By the time NA formalized its milestone traditions, AA's chip system was already well established. NA's founders made deliberate choices to differentiate: key tags instead of coins for early recovery, a different color palette, and a vocabulary that favors 'clean time' over 'sobriety' and 'medallion' over 'chip.' These aren't arbitrary distinctions. NA serves people recovering from addiction to any substance — not just alcohol — and the language and symbols reflect that broader scope.\n\nThe NA Service Symbol, a four-pointed stylized star set within a circle, appears on most official NA medallions and many key tags. It's the visual equivalent of AA's triangle-and-circle: an instantly recognizable emblem that tells anyone in the know which program you belong to. NA sobriety coins bearing the Service Symbol carry a particular significance for members who want their milestone marker rooted in the NA tradition specifically, not in a generic recovery design.",
    },
    {
      type: 'text',
      heading: 'Key Tags, Medallions, and Premium NA Sobriety Coins',
      body: "Standard NA key tags are functional objects — small, plastic, punched with a hole for a keyring. They're designed to be carried and replaced as milestones progress. They do their job. But for many NA members, the transition from key tags to the 1-year metal medallion is one of the most meaningful moments in early recovery, precisely because the object finally feels permanent.\n\nPremium handcrafted NA sobriety coins extend that permanence to every milestone in the journey. Instead of a plastic tag that cracks after a few months on a keychain, a cast-bronze coin with the NA Service Symbol, a clean date, and deep engraving gives early milestones the same material weight that annual medallions carry. The 30-day milestone that changed everything for you deserves an object that lasts as long as the memory.\n\nWhether you're replacing a worn key tag, upgrading a 1-year medallion, or gifting a milestone marker to someone whose clean time you've watched accumulate day by day, a premium coin honors the NA tradition while giving it a form built to endure.",
    },
  ],
  faq: [
    {
      question: 'What are NA sobriety coins called?',
      answer:
        "NA has two distinct milestone markers: key tags for shorter clean-time milestones (white/welcome, orange/30d, green/60d, red/90d, blue/6mo, yellow/9mo) and medallions for annual anniversaries (moonglow for 1 year, then annual colors or metal for subsequent years). Both are often called 'NA sobriety coins' in casual conversation even though key tags are technically plastic tags, not coins.",
    },
    {
      question: 'How are NA sobriety coins different from AA chips?',
      answer:
        "The biggest difference is that NA uses key tags (plastic) for early clean-time and metal medallions only for annual milestones, while AA uses metal chips for every milestone from 24 hours forward. The color systems are also different — NA and AA use overlapping but not identical color conventions.",
    },
    {
      question: 'What does moonglow mean in NA?',
      answer:
        "Moonglow is the traditional color for the 1-year NA medallion. It's a pearlescent cream-white color that stands out distinctly from AA's bronze 1-year chip. Moonglow marks the first major annual milestone in NA and is usually the first metal medallion a member receives (after a year of plastic key tags).",
    },
    {
      question: "Can I use an NA sobriety coin if my program is different?",
      answer:
        "Yes. NA sobriety coins are meaningful across recovery traditions. Many people in cross-program recovery — AA, NA, Celebrate Recovery, SMART Recovery — choose medallions from whichever program resonates most. The coin is for you, not the program.",
    },
  ],
  schema: ['breadcrumb', 'faq', 'webPage'],
});

registerSEOPage({
  slug: 'na-sober-chips',
  type: 'commercial',
  template: 'generic-seo',
  title: 'NA Sober Chips',
  metaTitle: 'NA Sober Chips — Key Tags, Medallions, and Recovery Coins | Custom Milestones',
  metaDescription:
    "Shop NA sober chips, key tags, and medallions. Learn how NA's clean-time tradition actually works — and find premium recovery coins for every milestone.",
  canonicalPath: 'na-sober-chips',
  eyebrow: 'Narcotics Anonymous',
  heroDescription:
    "The phrase 'NA sober chips' covers a tradition that uses both plastic key tags and metal medallions. Here's how the system works — and the premium handcrafted coins that honor the milestones NA celebrates.",
  primaryCTA: {label: 'Shop NA Sober Chips', href: '/collections/all'},
  featuredCollectionHandle: 'all',
  relatedPageSlugs: [
    'na-coins',
    'na-sobriety-coins',
    'narcotics-anonymous-coins',
    'aa-sober-chips',
    'custom-na-coins',
  ],
  sections: [
    {
      type: 'text',
      heading: 'Are There NA Sober Chips?',
      body: "If you're searching for NA sober chips, you're looking for the right thing under a slightly different name. Narcotics Anonymous doesn't use the word 'chip' in its official tradition — that term belongs to AA. But the concept is the same: physical objects given at meetings to mark clean-time milestones. NA calls them key tags for the first year and medallions for annual anniversaries. In everyday conversation, though, plenty of NA members and their families say 'NA sober chips' and mean exactly the right thing.\n\nThe terminology can be confusing if you're new to recovery or shopping for someone else. Here's how the system actually works — and what the objects look like at each stage of the journey.",
    },
    {
      type: 'text',
      heading: 'Key Tags, Medallions, and Chips in NA',
      body: "NA's milestone system is built on two distinct objects that mark different phases of recovery. For the first year of clean time, members receive plastic key tags — small, lightweight tabs with a hole punched through one end so they can be clipped to a keyring. After the 1-year mark, the tradition shifts to metal medallions: heavier, more substantial coins that feel like something you'd keep in a display case or carry in a breast pocket.\n\nThe key-tag sequence follows a specific color order. White is the welcome tag — offered to anyone at any meeting who expresses a desire to stop using, regardless of whether they have a single day of clean time. Orange marks 30 days. Green marks 60 days. Red marks 90 days. Blue marks 6 months. Yellow marks 9 months. And moonglow — a distinctive pearlescent cream — marks 1 year, the transition point from key tags to medallions.\n\nOne important language note: NA uses 'clean time' rather than 'sobriety.' The distinction matters to members. Sobriety implies abstinence from alcohol specifically; clean time encompasses freedom from all mind-altering substances, which is NA's broader focus. When NA members talk about their milestones, they'll say 'I have two years clean,' not 'I have two years sober.' The key tags and medallions reflect that language — they mark clean time, not sobriety in the AA sense.\n\nAfter the 1-year moonglow tag, annual medallions arrive in metal. Most groups use bronze for the early annual milestones, with silver and gold reserved for longer accumulations of clean time — though the exact metal-to-year mapping varies by group and region. Some NA communities use colored enamel inlays on annual medallions to distinguish 2 years from 5 from 10. Others keep the palette simple and let the engraved number speak for itself.\n\nThe key-tag-to-medallion transition is one of the most significant moments in NA recovery. For twelve months, what you carry is plastic — functional, modest, easy to replace if it cracks on your keychain. Then at one year, someone hands you metal. The weight difference is immediate and unmistakable. That shift from plastic to metal mirrors the shift in recovery itself: from fragile early days to something that feels like it can hold.",
    },
    {
      type: 'text',
      heading: 'Premium Recovery Coins for NA Milestones',
      body: "Standard key tags and meeting-issued medallions serve the tradition well, but they aren't built for permanence. Plastic key tags crack. Stamped-metal medallions lose their detail. For NA members who want a milestone marker that lasts as long as the clean time it represents, premium handcrafted recovery coins fill the gap.\n\nA premium NA sober chips collection might include cast-bronze coins for each key-tag milestone — 30 days through 9 months — bearing the NA Service Symbol, the distinctive four-pointed star within a double circle that identifies NA worldwide. Annual medallions in bronze, silver, or gold can carry a clean date, a personal engraving, or custom imagery that connects the coin to your story specifically.\n\nThe NA Service Symbol matters. For members who built their recovery inside NA — who worked the twelve steps with an NA sponsor, who found their home group in an NA meeting room — a generic recovery coin doesn't carry the same meaning. A coin bearing the Service Symbol says this is where I got clean, and these are the people who showed me how. Our custom token flow lets you include the symbol alongside whatever personal detail makes the milestone yours.",
    },
  ],
  faq: [
    {
      question: 'Does NA use chips like AA?',
      answer:
        "Not exactly. NA's tradition uses plastic key tags for early clean-time milestones (white/welcome, orange/30d, green/60d, red/90d, blue/6mo, yellow/9mo, moonglow/1yr) and metal medallions for annual anniversaries after the first year. NA members sometimes call these 'chips' in casual speech, but technically NA has key tags and medallions rather than AA-style chips.",
    },
    {
      question: 'What is a key tag in NA?',
      answer:
        "An NA key tag is a small plastic tag, usually with a hole for a keychain, given out at NA meetings to mark clean-time milestones before the 1-year anniversary. Key tags follow a color sequence: white (welcome / any clean-time desire), orange (30 days), green (60 days), red (90 days), blue (6 months), yellow (9 months), and moonglow (1 year — the transition to metal medallions).",
    },
    {
      question: 'When does NA switch from key tags to medallions?',
      answer:
        "NA members typically receive their first metal medallion at 1 year of clean time. The 1-year medallion is traditionally moonglow-colored (pearlescent white). Annual medallions continue every year after that, usually in metal — bronze, silver, or gold — though some groups use colored enamel for specific annual milestones.",
    },
    {
      question: "Can I buy an NA sober chip as a gift for someone?",
      answer:
        "Yes. Premium handcrafted NA medallions make meaningful gifts for sponsors, sponsees, family members, or yourself. Our custom token flow lets you design an NA medallion with the Service Symbol, a clean date, or a personal engraving.",
    },
  ],
  schema: ['breadcrumb', 'faq', 'webPage'],
});

// ============================================================
// PHRASE-MATCH EXPANSION — TIER A BATCH 2 (long-form & umbrella)
// ============================================================

registerSEOPage({
  slug: 'alcoholics-anonymous-sobriety-coins',
  type: 'commercial',
  template: 'generic-seo',
  title: 'Alcoholics Anonymous Sobriety Coins',
  metaTitle: 'Alcoholics Anonymous Sobriety Coins — Premium Recovery Chips | Custom Milestones',
  metaDescription:
    "Shop premium Alcoholics Anonymous sobriety coins. The full history of AA's chip tradition from 1935 Akron to today, and handcrafted coins for every milestone.",
  canonicalPath: 'alcoholics-anonymous-sobriety-coins',
  eyebrow: 'Since 1935',
  heroDescription:
    "Alcoholics Anonymous sobriety coins carry one of the oldest traditions in modern recovery. From Bill W. and Dr. Bob's first meeting in 1935 Akron to today's meeting rooms worldwide, these coins mark the milestones that make recovery real.",
  primaryCTA: {
    label: 'Shop Alcoholics Anonymous Sobriety Coins',
    href: '/collections/all',
  },
  featuredCollectionHandle: 'all',
  relatedPageSlugs: [
    'aa-coins',
    'aa-sobriety-coins',
    'aa-sobriety-tokens',
    'narcotics-anonymous-coins',
    'custom-aa-coins',
  ],
  sections: [
    {
      type: 'text',
      heading: 'What Are Alcoholics Anonymous Sobriety Coins?',
      body: "Alcoholics Anonymous sobriety coins are physical milestone markers used across the worldwide AA fellowship to recognize periods of continuous sobriety. The tradition stretches back to the early 1940s — just a few years after AA itself was founded — and has become one of the most enduring rituals in modern recovery culture. Each coin corresponds to a specific milestone: 24 hours, 30 days, 60 days, 90 days, 6 months, 9 months, 1 year, and every annual anniversary thereafter.\n\nAlcoholics Anonymous sobriety coins are not official AA merchandise. They never have been. The Big Book makes no mention of chips, coins, or tokens. Yet the practice of handing them out at meetings has been so universal for so long that most people assume it's written into AA's founding documents. It isn't. The chip tradition is a grassroots custom — born in a single meeting room, carried forward by the people who found it meaningful, and now practiced in virtually every AA group on the planet. That history is worth understanding, because it explains why these small objects carry so much weight.",
    },
    {
      type: 'text',
      heading: 'The History of Alcoholics Anonymous Sobriety Coins',
      body: "The story begins in Akron, Ohio, in May 1935. William Griffith Wilson — a New York stockbroker who had recently gotten sober through a spiritual experience and the Oxford Group — was in Akron on a business deal that had fallen apart. Desperate and alone, he knew he needed to talk to another alcoholic to stay sober. Through a chain of phone calls, he was connected to Dr. Robert Holbrook Smith, an Akron physician who had been struggling with alcohol for years despite his own involvement with the Oxford Group. Their meeting on Mother's Day weekend 1935 is widely regarded as the founding moment of Alcoholics Anonymous.\n\nBill W. and Dr. Bob spent that summer working with other alcoholics in Akron. By 1939, the movement had grown enough to produce its core text — the Big Book, officially titled Alcoholics Anonymous — which laid out the Twelve Steps and the philosophy of one alcoholic helping another. AA groups began forming in cities across the country: New York, Cleveland, Philadelphia, Chicago.\n\nThe chip tradition emerged not in Akron but in Cleveland, around 1942. A member named Clarence Snyder, who had been instrumental in establishing Cleveland's AA groups, began handing out poker chips at meetings to members who reached sobriety milestones. Snyder was practical — he wanted a tangible way to acknowledge progress and keep people coming back. Poker chips were cheap, round, pocket-sized, and available at any general store. The gesture was simple: hit a milestone, get a chip, carry it as a reminder.\n\nThe practice caught on quickly. Cleveland groups shared it with groups in other cities. By the mid-1940s, AA meetings across the Midwest were using some version of the chip system. The original poker chips gave way to stamped aluminum tokens with printed slogans and milestone markings. By the 1950s, enameled metal chips with the circle-and-triangle symbol had become standard in most regions.\n\nAA General Service has never endorsed or opposed the chip tradition. The organization's position is that individual groups are autonomous — they can celebrate milestones however they choose. Some groups hand out chips at every meeting. Others do so monthly. A few don't use chips at all. But the overwhelming majority of AA meetings worldwide include some version of the practice Clarence Snyder started with a bag of poker chips in a Cleveland church basement.\n\nWhat makes this history remarkable is how organic it was. No committee designed the chip system. No vote authorized it. One member in one city had a practical idea, and it spread because it worked. The Alcoholics Anonymous sobriety coin tradition is proof that the best rituals aren't mandated — they're adopted by the people who need them.",
    },
    {
      type: 'text',
      heading: 'Carrying the Tradition Forward',
      body: "Today, the chip tradition operates the same way it always has: someone reaches a milestone, the chairperson offers a coin, the room applauds. What has changed is the quality of the objects themselves. The poker chips and stamped aluminum of the early decades served their purpose, but they weren't built to last. Paint chipped. Edges softened. Detail wore away. For something people carry every day — in pockets, on keyrings, between their fingers during hard moments — the material matters.\n\nPremium handcrafted Alcoholics Anonymous sobriety coins honor the tradition Clarence Snyder started while giving it a form built for decades of daily carry. Cast bronze holds engraving detail indefinitely. The weight registers in your hand the way stamped aluminum never could. A patina develops over years that becomes part of the coin's history — evidence of how long and how faithfully it was carried.\n\nThe tradition doesn't belong to any manufacturer or any organization. It belongs to the people in the rooms. But the object that carries the tradition forward should be made with the same seriousness as the work it represents. Every Alcoholics Anonymous sobriety coin in our collection is designed to outlast the doubt that occasionally follows a milestone — and to remind you, every time you reach for it, that the days you accumulated are real.",
    },
  ],
  faq: [
    {
      question: 'When did Alcoholics Anonymous start giving out sobriety coins?',
      answer:
        "Alcoholics Anonymous sobriety coins trace back to Clarence Snyder's Cleveland AA group in the early 1940s, just a few years after AA itself was founded in 1935. Snyder's group started handing out poker chips at meetings to mark clean-time milestones. The practice spread to other AA groups throughout the 1940s and became a universal tradition by the 1950s.",
    },
    {
      question: 'Who founded Alcoholics Anonymous?',
      answer:
        "Alcoholics Anonymous was co-founded in Akron, Ohio in May 1935 by Bill Wilson (known as 'Bill W.') and Dr. Robert Smith (known as 'Dr. Bob'). Bill W. was a New York stockbroker in early recovery; Dr. Bob was an Akron physician. Their meeting and partnership established the Twelve Step model that became AA's foundation.",
    },
    {
      question: 'Are Alcoholics Anonymous sobriety coins official AA merchandise?',
      answer:
        "No. AA General Service has no official position on sobriety coins — the chip tradition is a local-group custom, not an AA-sanctioned practice. Every AA meeting is free to handle milestone celebrations however they choose. Premium handcrafted coins are made by independent manufacturers and are not affiliated with AA General Service.",
    },
    {
      question: 'What does the triangle and circle on AA coins mean?',
      answer:
        "The circle-and-triangle is the traditional AA symbol. The circle represents 'the World of AA,' and the three sides of the triangle represent AA's Three Legacies: Unity, Recovery, and Service. The symbol originated in the 1950s and appears on most traditional Alcoholics Anonymous sobriety coins.",
    },
  ],
  schema: ['breadcrumb', 'faq', 'webPage'],
});

registerSEOPage({
  slug: 'narcotics-anonymous-coins',
  type: 'commercial',
  template: 'generic-seo',
  title: 'Narcotics Anonymous Coins',
  metaTitle: 'Narcotics Anonymous Coins — NA Medallions & Key Tags | Custom Milestones',
  metaDescription:
    "Shop premium Narcotics Anonymous coins and medallions. The NA tradition since 1953, the key-tag system, and handcrafted recovery coins for every clean-time milestone.",
  canonicalPath: 'narcotics-anonymous-coins',
  eyebrow: 'Since 1953',
  heroDescription:
    "Narcotics Anonymous coins mark the milestones of clean time in NA. Founded in 1953 as an adaptation of AA for drug addiction, NA developed its own traditions — including its key-tag system and moonglow medallions.",
  primaryCTA: {
    label: 'Shop Narcotics Anonymous Coins',
    href: '/collections/all',
  },
  featuredCollectionHandle: 'all',
  relatedPageSlugs: [
    'na-coins',
    'na-sobriety-coins',
    'na-sober-chips',
    'alcoholics-anonymous-sobriety-coins',
    'custom-na-coins',
  ],
  sections: [
    {
      type: 'text',
      heading: 'What Are Narcotics Anonymous Coins?',
      body: "Narcotics Anonymous coins are milestone markers used within the NA fellowship to celebrate periods of continuous clean time. Unlike AA, which uses metal chips from the very first milestone onward, Narcotics Anonymous developed a two-tier system: plastic key tags for early clean-time milestones and metal medallions for annual anniversaries beginning at one year. Both are given out at meetings, both follow a specific color sequence, and both carry the weight of a promise kept.\n\nWhen people search for Narcotics Anonymous coins, they're usually looking for the metal medallions — the heavier, more permanent markers that represent a year or more of clean time. But the key-tag system is equally important to understand, because it shapes the entire experience of early recovery in NA and distinguishes the program from every other recovery tradition.",
    },
    {
      type: 'text',
      heading: 'The History of Narcotics Anonymous and Its Coin Tradition',
      body: "Narcotics Anonymous was founded in Los Angeles in 1953, primarily through the efforts of Jimmy Kinnon and a small group of co-founders who recognized that AA's framework — powerful as it was — didn't fully address the experience of people addicted to drugs other than alcohol. AA's Twelve Steps were adapted with a critical change: every reference to alcohol was broadened to encompass all drugs. The result was a program built on the same spiritual and communal principles as AA but centered on the idea of complete abstinence from all mind-altering substances.\n\nGrowth was slow in the early years. Through the 1950s and 1960s, NA meetings were concentrated in Southern California, and the fellowship struggled to gain the visibility and institutional momentum that AA had built over the previous two decades. The 1970s brought a turning point. The drug culture of the era drove a surge in addiction, and NA meetings began appearing in cities across the country. By the early 1980s, NA had grown large enough to produce its own core text — the Basic Text, first published in 1982 — which codified the program's philosophy and gave the fellowship a shared reference point independent of AA literature.\n\nThe key-tag system emerged during this period of growth. Where AA's chip tradition had evolved organically from Clarence Snyder's poker chips, NA's milestone markers were developed more deliberately as the fellowship formalized its practices. Plastic key tags were chosen for early milestones — white for the welcome tag, then a color progression through orange, green, red, blue, yellow, and moonglow. The choice of plastic was intentional: lightweight, inexpensive, and easy to carry on a keyring where you'd see it every day.\n\nThe metal medallion tradition followed for annual milestones. The 1-year medallion — traditionally moonglow-colored, a pearlescent white that became NA's signature — marked the transition from early recovery to sustained clean time. Annual medallions after that typically came in bronze, silver, or gold, though the specific conventions varied by region and group.\n\nNA's coin tradition reflects something fundamental about the program's identity. The emphasis on complete abstinence from all drugs — not just one substance — means that Narcotics Anonymous coins mark a broader commitment than AA chips do. They represent freedom from everything, not just alcohol. That philosophical distinction shows up in the language (clean time, not sobriety), the symbols (the NA Service Symbol rather than AA's circle-and-triangle), and the milestone objects themselves. Today, NA is active in over 140 countries, and the key-tag and medallion system travels with it — adapted locally but recognizable worldwide.",
    },
    {
      type: 'text',
      heading: 'Premium Coins for Narcotics Anonymous Milestones',
      body: "The standard key tags and meeting-issued medallions do their job, but they were never designed for permanence. Plastic cracks. Stamped aluminum loses its edges. For NA members who want their milestones marked by something built to last, premium handcrafted Narcotics Anonymous coins fill the gap between tradition and durability.\n\nThe NA Service Symbol — a square with four points set inside a circle, representing self, society, service, and God or a higher power — is the visual heart of NA identity. It appears on official NA literature, on meeting room walls, and on most traditional medallions. A premium coin bearing the Service Symbol connects your milestone to the fellowship in a way that a generic recovery coin cannot. It says this is my program, these are my people, and this is how long I've been clean.\n\nOur collection includes cast-bronze coins for every milestone in the NA progression, from the 30-day mark through multi-decade anniversaries. Custom designs can incorporate your clean date, your home group's name, a personal engraving, or imagery that connects the coin to your specific story. Whether you're marking your own clean time or gifting a milestone marker to someone whose recovery you've witnessed firsthand, a premium Narcotics Anonymous coin gives the moment the permanence it deserves.",
    },
  ],
  faq: [
    {
      question: 'When was Narcotics Anonymous founded?',
      answer:
        "Narcotics Anonymous was founded in Los Angeles in 1953, primarily by Jimmy Kinnon and a small group of co-founders. NA was created as an adaptation of AA's Twelve Step program for people recovering from drug addiction. Its growth was slow through the 1960s but accelerated in the 1970s, and NA is now active in over 140 countries.",
    },
    {
      question: "What's the Narcotics Anonymous service symbol?",
      answer:
        "The NA Service Symbol is a square with four points inside a circle. The four points represent self, society, service, and God (or higher power). The symbol appears on many Narcotics Anonymous coins and medallions, especially the annual medallions given for 1+ year milestones.",
    },
    {
      question: 'How are Narcotics Anonymous coins different from AA coins?',
      answer:
        "NA uses plastic key tags for shorter clean-time milestones (30d through 9mo) and metal medallions only for 1-year and longer anniversaries. AA uses metal chips for every milestone from 24 hours forward. NA's color sequence and symbols are also distinct, and the 1-year NA medallion is traditionally moonglow (pearlescent white) rather than AA's bronze.",
    },
    {
      question: 'Can I get a custom Narcotics Anonymous coin made?',
      answer:
        "Yes. Our custom token flow lets you design an NA-specific medallion with the Service Symbol, your clean date, personal engraving, or home-group imagery. Custom NA coins are a popular gift from sponsors and a common choice for people marking a major clean-time anniversary.",
    },
  ],
  schema: ['breadcrumb', 'faq', 'webPage'],
});

registerSEOPage({
  slug: 'sobriety-medallion',
  type: 'commercial',
  template: 'generic-seo',
  title: 'Sobriety Medallion',
  metaTitle: 'Sobriety Medallion — Premium Handcrafted Recovery Medallions | Custom Milestones',
  metaDescription:
    'Shop a premium sobriety medallion for your milestone. Bronze, silver, and gold medallions with engraving options. Design your own or choose from handcrafted collections.',
  canonicalPath: 'sobriety-medallion',
  eyebrow: 'Premium Collection',
  heroDescription:
    "A sobriety medallion is the physical marker you carry for a milestone that matters. Shop handcrafted medallions in bronze, silver, and gold — or design your own.",
  primaryCTA: {label: 'Shop Sobriety Medallions', href: '/collections/all'},
  featuredCollectionHandle: 'all',
  relatedPageSlugs: [
    'recovery-medallions',
    'gold-silver-medallions',
    'bronze-sobriety-coins',
    'custom-sobriety-medallion',
    'sobriety-coin-holders',
    'milestone-tokens',
  ],
  sections: [
    {
      type: 'text',
      heading: 'What Is a Sobriety Medallion?',
      body: "A sobriety medallion is a metal coin — typically heavier, larger, and more detailed than the chips handed out at meetings — used to commemorate a specific recovery milestone. Where a standard meeting chip might be stamped aluminum or injection-molded plastic, a sobriety medallion is cast metal: bronze, silver, or gold, with engraved detail that holds up to years of daily carry. The word 'medallion' implies a level of quality and permanence that separates it from the everyday chip.\n\nIf you're shopping for a sobriety medallion, you're usually looking for something more substantial than what your home group hands out. You want an object that matches the gravity of the milestone — something you can carry in your pocket, display on a shelf, or give to someone whose recovery you've watched unfold. A sobriety medallion is the version of the chip that's built to last a lifetime.",
    },
    {
      type: 'text',
      heading: 'Choosing a Material: Bronze, Silver, or Gold',
      body: "The material you choose for a sobriety medallion shapes how it feels in your hand, how it ages over time, and what it communicates about the milestone it represents. Each metal carries its own character.\n\nBronze is the most traditional choice, and for good reason. It's the metal most closely associated with the chip tradition — the 1-year AA chip has been bronze for decades. A bronze sobriety medallion has a warm, burnished tone that deepens over time as patina develops. That patina isn't damage; it's evidence of carry. A bronze medallion that's been in a pocket for five years looks different from one that's been in a drawer, and most people prefer the carried version. Bronze is also the most durable option for daily carry — it resists scratching better than softer metals and tolerates the abuse of keyrings, pockets, and the occasional drop onto concrete.\n\nSilver carries a cleaner, cooler aesthetic. A silver sobriety medallion has a formal quality that makes it a natural choice for gift contexts — from a sponsor to a sponsee, from a parent to an adult child, from a partner who watched the hard work happen. Silver develops its own patina over time, a soft gray toning that many collectors find beautiful. It's heavier than bronze of the same size, which gives it a satisfying heft. Silver medallions are often chosen for milestones with social significance: the 1-year anniversary dinner, the 5-year celebration at your home group, the moment you want marked by something you'd be proud to show.\n\nGold is reserved for the milestones that feel like landmarks rather than waypoints. A gold sobriety medallion typically marks 10 years or more — the point where recovery has become a foundation rather than a daily negotiation. Gold doesn't tarnish, doesn't patina, and doesn't change. It looks the same in year twenty as it did the day it was cast. That permanence is the point. A gold medallion is an heirloom piece — something you carry now and pass down later.\n\nFor daily carry, bronze is the most forgiving. For gifting, silver strikes the right balance between formality and warmth. For a legacy milestone, gold says what words can't. There's no wrong choice — only the one that matches what the milestone means to you.",
    },
    {
      type: 'text',
      heading: 'Engraving and Customization Options',
      body: "A sobriety medallion becomes truly personal when it carries your details. Deep engraving — cut into the metal rather than printed on the surface — ensures that names, dates, and phrases remain legible after years of handling. Most premium medallions offer engraving on both the front and back, giving you space for a milestone number on one side and a personal inscription on the other.\n\nCommon engravings include a sobriety date, a name or initials, a sponsor's initials, Roman numerals for the year count, or a short phrase that carries personal meaning — a line from the Serenity Prayer, a step number, a home group name. Some people engrave coordinates for the location where they got sober. Others keep it simple: a date and a number.\n\nOur custom token flow lets you go further. You can design a one-of-a-kind sobriety medallion with custom imagery, typography, and layout — or describe what you want and let our team design it for you. The preview process shows you exactly what the finished medallion will look like before production begins, so the object you receive matches the vision you had.",
    },
  ],
  faq: [
    {
      question: 'What is a sobriety medallion?',
      answer:
        "A sobriety medallion is a metal coin — typically bronze, silver, or gold — given or bought to mark a recovery milestone. Medallions are generally heavier and more substantial than the plastic or aluminum chips handed out at meetings. The word 'medallion' usually implies a premium, commemorative quality.",
    },
    {
      question: "What's the difference between a sobriety medallion and a sobriety chip?",
      answer:
        "A 'chip' is usually a smaller, lighter token — often stamped plastic or aluminum — handed out at meetings to mark milestones from 24 hours onward. A 'medallion' is a heavier, higher-quality metal coin, often used for annual anniversaries and major milestones. The distinction is informal, and some groups use the words interchangeably.",
    },
    {
      question: 'What material should I choose for a sobriety medallion?',
      answer:
        "Bronze is the most traditional and most durable for daily carry, with a warm patina that develops over time. Silver is cleaner and more formal, often chosen for gift contexts. Gold is reserved for major milestones — typically 10+ year anniversaries — and functions as an heirloom piece. For a daily-carry medallion, bronze is the most forgiving.",
    },
    {
      question: 'Can I get a sobriety medallion engraved?',
      answer:
        "Yes. Deep engraving with names, dates, or phrases is a standard option on premium sobriety medallions. Engraving can be added to the front, back, or both. Our custom token flow lets you preview the engraving before committing to production.",
    },
  ],
  schema: ['breadcrumb', 'faq', 'webPage'],
});

registerSEOPage({
  slug: 'recovery-chips',
  type: 'commercial',
  template: 'generic-seo',
  title: 'Recovery Chips',
  metaTitle: 'Recovery Chips — AA, NA, and Beyond | Custom Milestones',
  metaDescription:
    "Recovery chips span AA, NA, Celebrate Recovery, and SMART Recovery. Compare traditions, find premium handcrafted chips for every program, or design your own.",
  canonicalPath: 'recovery-chips',
  eyebrow: 'Every Tradition',
  heroDescription:
    "Recovery chips are the umbrella term for the milestone markers used across recovery programs — AA chips, NA key tags, Celebrate Recovery coins, and more. One word, many traditions.",
  primaryCTA: {label: 'Shop Recovery Chips', href: '/collections/all'},
  featuredCollectionHandle: 'all',
  relatedPageSlugs: [
    'aa-coins',
    'na-coins',
    'celebrate-recovery-coins',
    'sobriety-coins',
    'custom-recovery-token',
  ],
  sections: [
    {
      type: 'text',
      heading: 'What Are Recovery Chips?',
      body: "Recovery chips are physical milestone markers — coins, tokens, key tags, and medallions — used across addiction recovery programs to celebrate periods of sustained sobriety or clean time. The term is deliberately broad. Recovery chips include the bronze chips handed out at AA meetings, the plastic key tags given at NA meetings, the scripture-backed coins from Celebrate Recovery, and the personal tokens that people in non-traditional programs choose for themselves.\n\nWhat unites every type of recovery chip is the same core function: turning an invisible achievement into something tangible. Sobriety doesn't leave a mark on the world. You can't point at it. A recovery chip gives you something to hold when the accomplishment feels abstract — and something to show when you want the people around you to know that the work is real.",
    },
    {
      type: 'text',
      heading: 'Recovery Chips Across Programs',
      body: "Each major recovery program has its own chip tradition, its own color system, and its own way of marking milestones. Understanding the differences helps you find the right chip — whether you're shopping for yourself, for a sponsee, or for a family member whose program you're still learning about.\n\nAA chips are the original. Alcoholics Anonymous has been handing out metal chips since the early 1940s, when Clarence Snyder's Cleveland group started using poker chips to mark sobriety milestones. Today's AA chips follow a well-known color sequence — white for 24 hours, gold for 30 days, red for 60, green for 90, blue for 6 months, purple for 9 months, bronze for 1 year — and metal chips are given at every milestone from the first day forward. AA's chip tradition is the oldest and most widely recognized in recovery culture. For program-specific options, see our AA coins collection.\n\nNA key tags and medallions represent a different approach. Narcotics Anonymous uses lightweight plastic key tags for clean-time milestones through the first year, with metal medallions beginning at the 1-year anniversary. The color sequence is distinct from AA: white for the welcome tag, orange for 30 days, green for 60, red for 90, blue for 6 months, yellow for 9 months, and moonglow for 1 year. The key-tag-to-medallion transition at one year is one of the most meaningful moments in NA recovery. For NA-specific designs, see our NA coins collection.\n\nCelebrate Recovery chips are rooted in the Christian faith-based recovery tradition. CR uses its own coin designs, often featuring scripture references, the CR logo, and milestone markings that align with the program's step structure. Celebrate Recovery operates within churches nationwide and uses chips to mark milestones much as AA and NA do, with an explicitly faith-centered framework. See our Celebrate Recovery coins collection for CR-specific designs.\n\nSMART Recovery takes a different path entirely. The Self-Management and Recovery Training program is non-12-step and secular, emphasizing cognitive-behavioral tools over spiritual frameworks. SMART Recovery has no official chip or token tradition — the program doesn't formalize physical milestone markers. But that doesn't mean milestones don't matter to SMART participants. Many people in SMART Recovery choose to buy premium recovery chips on their own, selecting designs that resonate personally rather than following a program-prescribed system.\n\nOther programs have their own variations. Al-Anon, for families of people with alcohol use disorder, sometimes uses chips at meetings. Gamblers Anonymous and Overeaters Anonymous have adapted the AA chip tradition for their own milestone structures. Refuge Recovery, a Buddhist-inspired program, emphasizes meditation tokens. Youth-focused recovery programs often adapt chip traditions with age-appropriate designs. Across every program, recovery chips serve the same purpose: making the invisible visible.",
    },
    {
      type: 'text',
      heading: 'Premium Recovery Chips for Any Program',
      body: "Whatever your tradition, the milestone deserves an object built to match it. Our collection includes recovery chips designed for AA, NA, Celebrate Recovery, and program-agnostic milestones — all handcrafted in cast bronze, silver, or gold with deep engraving that holds up to years of daily carry.\n\nFor people in programs without an official chip tradition, or in cross-program recovery where no single design feels right, our custom token flow lets you build a recovery chip from scratch. Choose your material, your imagery, your engraving, and your milestone — or describe what you want and let our team design it. Recovery chips are personal objects. The one you carry should feel like yours, regardless of which room you got sober in.",
    },
  ],
  faq: [
    {
      question: 'Are AA chips and NA chips the same thing?',
      answer:
        "No. AA chips are metal (traditionally) and cover every milestone from 24 hours onward using a color system of white, gold, red, green, blue, purple, and bronze. NA uses plastic key tags for shorter clean-time milestones and metal medallions only for annual anniversaries. The two programs have different color conventions and different symbolic systems.",
    },
    {
      question: 'What is the most common recovery chip?',
      answer:
        "The 24-hour chip (the 'desire chip' in AA, the 'welcome tag' in NA) is the most universally recognized recovery chip. It's offered to anyone who wants to try sobriety for the next 24 hours — no questions, no commitment beyond that day. The 24-hour chip is usually white and is the first step in every milestone tradition.",
    },
    {
      question: 'Do all recovery programs use chips?',
      answer:
        "Most major 12-step programs have a chip or token tradition — AA, NA, Celebrate Recovery, Gamblers Anonymous, Overeaters Anonymous, and more. SMART Recovery is a notable exception: it doesn't formalize physical milestone markers, though individual members sometimes buy premium tokens on their own.",
    },
    {
      question: 'Can I use one program\'s recovery chips if I\'m in a different program?',
      answer:
        "Yes. Recovery chips are personal keepsakes, not membership credentials. Many people in cross-program recovery or mixed communities choose chips from whichever tradition resonates most. A premium handcrafted chip is meaningful regardless of which program it came from.",
    },
  ],
  schema: ['breadcrumb', 'faq', 'webPage'],
});

// ============================================================
// PHRASE-MATCH EXPANSION — TIER B BATCH (custom-intent pages)
// ============================================================

registerSEOPage({
  slug: 'custom-aa-coins',
  type: 'commercial',
  template: 'custom-intent',
  title: 'Custom AA Coins',
  metaTitle: 'Custom AA Coins — Design Your Own Alcoholics Anonymous Chip | Custom Milestones',
  metaDescription:
    'Design a custom AA coin with your home group, sponsor name, anniversary date, or Serenity Prayer engraving. Two ways to create a one-of-a-kind AA coin that honors your story.',
  canonicalPath: 'custom-aa-coins',
  eyebrow: 'Design Your Own AA Coin',
  heroDescription:
    "A custom AA coin turns the traditions that kept you sober — your home group, your sponsor, your milestones — into something you can hold. Design yours in minutes.",
  primaryCTA: {label: 'Start Designing', href: '/custom-token'},
  featuredCollectionHandle: 'all',
  relatedPageSlugs: [
    'custom-recovery-token',
    'aa-sobriety-coins',
    'aa-sobriety-tokens',
    'aa-coins',
    'custom-sobriety-coins',
  ],
  sections: [
    {
      type: 'text',
      heading: 'Ideas for a Custom AA Coin',
      body: "Every AA group has its own character — the room, the regulars, the phrases that get repeated until they stick. A custom AA coin lets you put that character on something permanent.\n\nStart with your home group. The group name and city across the front, the meeting day and time along the rim. Members who have carried the same group for years often commission coins for anniversary nights — handed out to the room as a reminder that the group itself has a sobriety date, not just the individuals inside it.\n\nSponsor details are another common choice. A sponsor's initials and sobriety date engraved on the back of a coin create something the sponsee carries daily — a quiet acknowledgment of the person who picked up the phone every time. Some sponsors reverse it: they commission a coin for the sponsee's first anniversary, with the sponsee's name, date, and a line from the Big Book that mattered during their work together.\n\nAA's unofficial slogans engrave well because they're short and direct. 'One day at a time.' 'Easy does it.' 'Let go and let God.' 'Keep coming back — it works if you work it.' The short-form Serenity Prayer fits cleanly on the reverse of a standard-size coin, leaving the front open for the AA circle-and-triangle symbol and a sobriety date.\n\nRoman numerals are a popular way to display anniversary years — V for five, X for ten, XXV for twenty-five. They add a timeless, understated quality that pairs well with the triangle-and-circle.\n\nMeeting-room imagery is less common but worth considering. A lighthouse, a mountain range, a sunrise over a specific skyline — whatever your group looks out at or talks about. One group in Colorado commissioned coins with the outline of the peak visible from their meeting-room window. Another in coastal Maine used a lobster boat — not because it was spiritual, but because every member in that room had worked on one.",
    },
    {
      type: 'text',
      heading: 'Two Paths to a Custom AA Coin',
      body: "You don't need to be a graphic designer to get a custom AA coin made. The custom flow gives you two ways in, and both end with the same result.\n\nThe first path is 'We Design It For You.' You tell us about the coin — the group, the milestone, the phrases, the person it's for. You don't need to sketch anything or choose fonts. Our team takes your description and turns it into a finished proof, usually within two to three business days. You review the proof by email, suggest changes if something isn't right, and approve when it's ready. This is the path most AA members choose because it's the fastest way from an idea to a real coin.\n\nThe second path is 'You Design It Yourself.' If you already know the layout you want — the AA circle-and-triangle on the front, the Serenity Prayer on the back, a specific font for the date, bronze with an antiqued finish — the self-design path gives you control over every element. You describe or upload your design, preview it, refine it, and approve before production begins.\n\nBoth paths produce the same coin: cast bronze, silver, or gold, deep-engraved, weighted to feel substantial, and finished to hold up to years of pocket carry. The difference is only how much of the creative work you want to do yourself.",
    },
    {
      type: 'text',
      heading: 'Custom Coins as Sponsor Gifts',
      body: "Handing a sponsee a chip at their anniversary meeting is already one of the most meaningful moments in AA. A custom AA coin takes that moment further — because the coin itself tells the sponsee that someone sat down, thought about their story, and built something specifically for them.\n\nA stock coin says 'congratulations.' A custom coin says 'I know what this year cost you, and I wanted you to have something that proves it happened.' Sponsors who commission custom coins often include the sponsee's first name, their sobriety date, and a short phrase from their step work together — something only the two of them would recognize.\n\nThe coin becomes a private conversation between sponsor and sponsee, held in a pocket, carried through every meeting that follows. That's something a catalog can't replicate.",
    },
  ],
  faq: [
    {
      question: 'Can I put my home group name on a custom AA coin?',
      answer:
        "Yes. Home group names, meeting locations, and meeting times are among the most popular engraving choices for custom AA coins. You can add them to the front, back, or around the edge of the coin. The custom flow lets you preview the placement before committing.",
    },
    {
      question: 'Can a custom AA coin include the Serenity Prayer?',
      answer:
        "Yes. The short-form Serenity Prayer is one of the most-requested engravings on custom AA coins. The full prayer can also fit on larger medallions. You can combine the Serenity Prayer with a sobriety date, a name, and the AA circle-and-triangle symbol on a single coin.",
    },
    {
      question: 'Is a custom AA coin appropriate as a sponsor gift?',
      answer:
        "Yes — custom AA coins are one of the most traditional and meaningful gifts a sponsor can give a sponsee. A custom coin lets the sponsor put the sponsee's name, their sobriety date, and a personal message on something they'll carry for the rest of their life. It's the kind of gift that gets remembered.",
    },
    {
      question: "How do I design a custom AA coin if I'm not a designer?",
      answer:
        "Choose the 'We Design It For You' path in the custom flow. You describe what you want — the occasion, the group, the phrase, the symbolism — and our designers turn it into a finished proof. You review the proof, request changes if needed, and approve before we produce it. No design skills required.",
    },
  ],
  schema: ['breadcrumb', 'faq', 'webPage'],
});

registerSEOPage({
  slug: 'custom-na-coins',
  type: 'commercial',
  template: 'custom-intent',
  title: 'Custom NA Coins',
  metaTitle: 'Custom NA Coins — Design Your Own Narcotics Anonymous Medallion | Custom Milestones',
  metaDescription:
    "Design a custom NA coin with the Service Symbol, 'Just for Today,' your clean date, or your home group. Build a one-of-a-kind Narcotics Anonymous medallion.",
  canonicalPath: 'custom-na-coins',
  eyebrow: 'Design Your Own NA Coin',
  heroDescription:
    "A custom NA coin puts the traditions of Narcotics Anonymous — the Service Symbol, 'Just for Today,' your clean date, your home group — on a token made for you alone.",
  primaryCTA: {label: 'Start Designing', href: '/custom-token'},
  featuredCollectionHandle: 'all',
  relatedPageSlugs: [
    'custom-recovery-token',
    'na-sobriety-coins',
    'na-sober-chips',
    'na-coins',
    'narcotics-anonymous-coins',
  ],
  sections: [
    {
      type: 'text',
      heading: 'Ideas for a Custom NA Coin',
      body: "Narcotics Anonymous has its own visual language — symbols, phrases, and traditions that mean something specific to the people who live them. A custom NA coin lets you put that language on metal and carry it with you.\n\nThe NA Service Symbol is where most designs start. The square with four points inside a circle represents self, society, service, and God-as-you-understand-God. It's the most recognizable emblem in NA, and it anchors a custom coin the way the circle-and-triangle anchors AA designs. You can place it front-center, pair it with your clean date below, and leave the reverse open for personal engraving.\n\n'Just for Today' is the phrase most closely associated with NA recovery. It appears in the daily meditation literature, it's recited at meetings, and it captures the NA approach to staying clean: not forever, not next year, just today. Engraved across the top arc of a coin with the clean date centered beneath it, the phrase turns a daily commitment into a permanent reminder.\n\nHome group details work just as well on NA coins as they do on AA coins, but NA groups often carry a different character — smaller, more tightly knit, meeting in church basements and community centers across neighborhoods that most people drive through without stopping. The group name, city, and founding year give a custom coin a local identity that connects it to a specific place and the people inside it.\n\nOther strong NA-specific engraving choices include 'Live and Let Live,' 'It works — how and why,' references to the NA Basic Text, the Twelve Traditions, and clean-date milestones in both numeric and Roman numeral formats. For home groups that want to commemorate their own anniversary, a batch of matching custom coins — one for every regular member — creates a shared keepsake that marks the group's history alongside each individual's recovery.\n\nCustom NA coins are also common as sponsor gifts, especially at the 1-year mark when an NA member transitions from plastic key tags to a metal medallion for the first time. That transition already carries weight. A custom medallion designed specifically for the person receiving it turns an already meaningful moment into one they'll remember in detail.",
    },
    {
      type: 'text',
      heading: 'Two Paths to a Custom NA Medallion',
      body: "The custom flow is built for people in recovery, not for graphic designers. Whether you know exactly what you want or you just know how you want it to feel, there's a path that fits.\n\n'We Design It For You' is the hands-off path. You describe the coin: the milestone, the person, the NA symbols and phrases you want included, the material, and any imagery that matters — the Service Symbol, a geographic landmark, a line from the Basic Text. Our design team builds a proof from your description and sends it to you within two to three business days. You review, request changes, and approve. You never have to open a design tool or pick a typeface.\n\n'You Design It Yourself' is for members who already have a vision. Maybe you've sketched it on a napkin at a meeting. Maybe you've been thinking about it for months. This path lets you specify the layout, the symbol placement, the font, the finish, and the material. You describe or upload your design, preview it on screen, and approve before production begins.\n\nBoth paths produce the same quality medallion — cast in bronze, silver, or gold, deep-engraved, and finished to a standard that holds up to years of daily carry. The only difference is how much creative direction you want to provide.",
    },
    {
      type: 'text',
      heading: 'Custom Medallions for Major NA Milestones',
      body: "In Narcotics Anonymous, the 1-year clean-time anniversary carries a weight that's hard to overstate. For the first twelve months, NA milestones are marked with plastic key tags — lightweight, color-coded, functional. At one year, the key tag gives way to a metal medallion. That physical shift from plastic to metal mirrors something the member already feels: the recovery has substance now. It's no longer fragile in the same way.\n\nA custom NA coin makes that transition permanent. Instead of a stock medallion pulled from a box, the member receives something designed for their story — their clean date, their group, their phrase, their symbol. The medallion becomes an anchor point for the years that follow.\n\nAnnual milestones after the first year — 2, 5, 10, 20 — are natural moments for custom coins as well. Each year adds to the story, and a custom medallion lets the design evolve with it. Some members build a collection over time, each coin marking a different chapter, each one distinct. The custom flow makes that kind of continuity possible without repeating the same design twice.",
    },
  ],
  faq: [
    {
      question: 'Can I put the NA Service Symbol on a custom coin?',
      answer:
        "Yes. The NA Service Symbol — a square with four points inside a circle — is a popular element on custom NA coins. It can appear on the front or back, at any size, and can be combined with your clean date, your home group, or 'Just for Today.'",
    },
    {
      question: "Can a custom NA coin say 'Just for Today'?",
      answer:
        "Yes. 'Just for Today' is one of the most-requested engravings on custom NA coins. It can appear as the main front-side text or as a subtle reverse-side engraving. Some members combine it with their clean date and home group for a complete personal coin.",
    },
    {
      question: "What's the difference between a custom NA coin and a standard NA medallion?",
      answer:
        "A standard NA medallion comes in preset designs with fixed imagery and limited engraving options (usually just the clean-time number). A custom NA coin is designed from scratch to your specifications — your choice of imagery, layout, engraving, material, and finish. Custom coins are one-of-a-kind; standard medallions are mass-produced.",
    },
    {
      question: 'Can I give a custom NA coin as a 1-year anniversary gift?',
      answer:
        "Yes — it's one of the most meaningful gift choices for an NA 1-year anniversary. The 1-year moment in NA is already significant because it marks the transition from plastic key tags to metal medallions. A custom medallion with the person's clean date, home group, and a personal message turns that transition into something they'll carry forever.",
    },
  ],
  schema: ['breadcrumb', 'faq', 'webPage'],
});

registerSEOPage({
  slug: 'custom-sobriety-medallion',
  type: 'commercial',
  template: 'custom-intent',
  title: 'Custom Sobriety Medallion',
  metaTitle: 'Custom Sobriety Medallion — Bronze, Silver, Gold | Custom Milestones',
  metaDescription:
    'Design a custom sobriety medallion in bronze, silver, or gold. Deep engraving, custom imagery, and a premium finish for the milestones that matter most.',
  canonicalPath: 'custom-sobriety-medallion',
  eyebrow: 'Premium Custom',
  heroDescription:
    "A custom sobriety medallion is the most premium way to mark a major milestone — your material, your engraving, your design, your story. Built to last as a heirloom.",
  primaryCTA: {label: 'Start Designing', href: '/custom-token'},
  featuredCollectionHandle: 'all',
  relatedPageSlugs: [
    'custom-recovery-token',
    'sobriety-medallion',
    'gold-silver-medallions',
    'bronze-sobriety-coins',
    'custom-sobriety-coins',
  ],
  sections: [
    {
      type: 'text',
      heading: 'What Makes a Custom Sobriety Medallion Different',
      body: "A coin is built for your pocket. A medallion is built for the moment — and for the shelf, the display case, or the drawer you open when you need to remember why you started.\n\nCustom sobriety medallions are larger and heavier than standard custom coins. Where a coin measures roughly 39mm across and weighs enough to notice in your pocket, a medallion starts at 50mm or larger and carries real heft in your hand. That size difference isn't vanity — it's canvas. More surface area means deeper engraving, finer image detail, and room for text on the front, back, and edge without crowding.\n\nMost people who choose a custom medallion over a custom coin are marking a milestone that carries significant weight: five years, ten years, twenty-five years, or longer. The kind of milestone where the person receiving it has outlasted the doubt, the relapses they watched others go through, and the quiet stretches where nobody noticed they were still showing up. A medallion matches that gravity. It's not something you toss in a junk drawer — it's something you set on a nightstand or keep in a case, and it's still there when your grandchildren find it.\n\nCustom sobriety medallions also serve a ceremonial purpose that coins don't always fill. Recovery centers use them for graduation ceremonies. Home groups commission them for milestone nights where the entire room participates. Families order them for anniversaries where the milestone belongs to everyone who stayed, not just the person who got sober. The medallion format signals permanence and formality in a way a pocket-sized coin communicates differently.",
    },
    {
      type: 'text',
      heading: 'Choosing Material for Your Custom Medallion',
      body: "Material isn't just an aesthetic choice on a custom sobriety medallion — it changes how the piece feels in your hand, how it ages over decades, and how the engraving reads under light.\n\nBronze is the traditional starting point. It's warm-toned, substantial, and affordable enough to order for milestone ceremonies without breaking a budget. Over years of handling, bronze develops a patina — a gradual darkening that deepens the engraved lines and gives the medallion a character it didn't have when it was new. Many people prefer the patina. It's visible evidence of time passing, which is the whole point.\n\nSilver is the formal choice. It holds a sharper edge than bronze, reflects light cleanly, and develops a gray patina slowly rather than a brown one. Engraving on silver reads with more contrast because the recessed lines stay darker than the polished surface. Silver medallions are often chosen for milestones in the 5-to-15-year range, or for occasions where the medallion will be displayed rather than pocket-carried.\n\nGold is reserved for the milestones where nothing else feels sufficient. It doesn't tarnish, it doesn't patina, and it catches light in a way that makes people look twice. Gold medallions are most commonly ordered for 10-year, 20-year, and 25-year-plus anniversaries — the milestones that represent a lifetime of sustained recovery. The weight of a gold medallion is noticeably different from bronze or silver, and for many people that physical weight is part of the meaning.\n\nWhichever material you choose, the engraving process is the same: deep-cut lines that hold detail for decades, not surface etching that wears smooth after a few years of handling.",
    },
    {
      type: 'text',
      heading: 'Engraving Options for Heirloom Medallions',
      body: "A custom sobriety medallion is only as personal as the engraving on it. The medallion format gives you room to go further than a standard coin allows.\n\nFront-face engraving typically carries the primary imagery: a recovery symbol, a program emblem, or a custom illustration. The larger canvas means photographic detail is possible — portraits, landscapes, building outlines — at a fidelity that would be lost on a smaller coin.\n\nBack-face engraving is where most personal text lives: names, dates, dedications, short passages, and milestone numbers. A medallion back can hold 40-60 words comfortably, enough for a meaningful inscription without cramming.\n\nEdge engraving adds a third dimension. Dates, short phrases, or a continuous line of text around the rim turn the medallion into something you read by rotating it in your hand — a tactile experience that flat surfaces can't replicate.\n\nFont choices range from classic serifs that echo traditional coinage to clean modern typefaces for a contemporary look. For the most personal touch, we can digitize handwriting — a sponsor's note, a parent's message, a phrase written on a napkin at a meeting — and engrave it exactly as it was written. A custom sobriety medallion built this way becomes an artifact, not just a keepsake.",
    },
  ],
  faq: [
    {
      question: "What's the difference between a custom sobriety coin and a custom medallion?",
      answer:
        "Size, weight, and intended use. A custom sobriety coin is pocket-sized and designed for daily carry. A custom sobriety medallion is larger, heavier, and typically intended for display or annual-milestone carry. Medallions are usually chosen for major anniversaries where the person wants a heirloom-quality piece rather than a daily-carry token.",
    },
    {
      question: 'What material is best for a custom sobriety medallion?',
      answer:
        "For major milestones and heirloom pieces, silver and gold are the most premium choices. Gold is traditionally reserved for 10+ year anniversaries. Silver works for milestones at any level and holds sharp engraving beautifully. Bronze is the traditional and most affordable choice and develops a warm patina over decades of handling.",
    },
    {
      question: 'Can I include a photo or logo on a custom sobriety medallion?',
      answer:
        "Yes. Custom medallions can include photo reproduction, logo recreation, and even digitized handwriting. The larger medallion size gives designers more room to work with than a standard coin, so image detail can be significantly higher.",
    },
    {
      question: 'How long does a custom sobriety medallion take to produce?',
      answer:
        "Design proofs typically come back within 2-3 business days. Once you approve the design, medallion production takes 7-14 days depending on material (gold takes longer than bronze). Total time from order to delivery is usually 3-4 weeks.",
    },
  ],
  schema: ['breadcrumb', 'faq', 'webPage'],
});

registerSEOPage({
  slug: 'personalized-recovery-tokens',
  type: 'commercial',
  template: 'custom-intent',
  title: 'Personalized Recovery Tokens',
  metaTitle: 'Personalized Recovery Tokens — Engraved Sobriety Coins | Custom Milestones',
  metaDescription:
    "Personalize a recovery token with your name, date, or short message. Simpler and faster than fully custom design — all the meaning, less of the process.",
  canonicalPath: 'personalized-recovery-tokens',
  eyebrow: 'Add Your Own Touch',
  heroDescription:
    "Personalized recovery tokens are stock designs with your name, date, or message engraved on them. Simpler than a custom design, still distinctly yours.",
  primaryCTA: {label: 'Start Personalizing', href: '/custom-token'},
  featuredCollectionHandle: 'all',
  relatedPageSlugs: [
    'custom-recovery-token',
    'custom-sobriety-coins',
    'recovery-tokens',
    'milestone-tokens',
    'sobriety-coins',
  ],
  sections: [
    {
      type: 'text',
      heading: 'Personalized vs. Fully Custom',
      body: "Not every milestone needs a coin designed from the ground up. Sometimes the right design already exists in the catalog — it just needs your name on it.\n\nPersonalized recovery tokens start with a stock design: a coin we've already crafted, with imagery and layout that's been refined and proven. You add your personal details — a name, a sobriety date, a short phrase, a Roman numeral milestone — and the engraving is applied to the existing design. The result is a coin that looks and feels premium, carries your personal information, and ships faster than a fully custom piece.\n\nFully custom tokens are different. With a custom token, nothing is predetermined. You choose the imagery, the layout, the material, the engraving placement — or you describe what you want and our team designs it from scratch. Custom is the right choice when the catalog doesn't capture what you need, or when the milestone calls for something nobody else has ever held.\n\nThe practical differences matter. Personalized recovery tokens typically ship within 7 to 10 days because the base design is already produced — only the engraving is new. Fully custom tokens take 2 to 3 weeks because the design phase, proof review, and production all happen in sequence. Personalization is also less expensive, since there's no design labor beyond the engraving itself.\n\nBoth options produce a coin you'll be proud to carry. Personalized recovery tokens are simply the faster, lighter path — the one that makes sense when the stock design already resonates and all it needs is your mark on it.",
    },
    {
      type: 'text',
      heading: 'What You Can Personalize',
      body: "The personalization options are designed to be meaningful without being overwhelming. You're not redesigning a coin — you're adding the details that make an existing design yours.\n\nA name is the most common addition. Your first name, your full name, or a sponsor's initials engraved on the front or back of the coin. It transforms an anonymous token into something addressed directly to the person who carries it.\n\nA sobriety or clean date is the second most popular choice. The date goes on the back in most cases, formatted however you prefer: month-day-year, a spelled-out month, or just the year if you want to keep it understated.\n\nShort phrases work well when you want the coin to say something beyond a name and a date. There's room for roughly 20 characters — enough for 'One day at a time,' 'Just for today,' a sponsor's favorite saying, or a word that held you together on a hard night. Keep it concise and it engraves cleanly.\n\nRoman numeral milestones — I, V, X, XV, XX, XXV — add a classic, timeless feel. They pair naturally with the traditional coin aesthetic and read well at any size.\n\nYou choose from two to three font options depending on the stock design. Each font has been tested against the coin's existing imagery to make sure the engraving complements rather than competes. Front engraving, back engraving, or both — the personalization flow previews each option so you see the finished result before placing your order.",
    },
    {
      type: 'text',
      heading: 'When to Personalize vs. Go Fully Custom',
      body: "The decision is simpler than it seems.\n\nPersonalize when a stock design already captures what you're looking for. Browse the catalog, find a coin whose imagery and style feel right, and add your name, date, or phrase. You'll have a finished, engraved coin in your hands within 7 to 10 days at a lower cost than a custom build. For most milestones — monthly anniversaries, early-year celebrations, gifts where you know the recipient's taste — personalization delivers exactly the right amount of individuality.\n\nGo fully custom when the catalog doesn't have what you need. Maybe the milestone calls for a specific image that doesn't exist in stock designs. Maybe the recipient's story is so particular that a generic template, even with their name on it, wouldn't do it justice. Maybe you want to control every element — the symbol placement, the font, the edge detail, the material. The custom path takes longer and costs more, but it produces something that exists nowhere else in the world.\n\nPersonalized recovery tokens are the middle path between off-the-shelf and one-of-a-kind. For many people, that middle path is exactly where the right coin lives.",
    },
  ],
  faq: [
    {
      question: "What's the difference between personalized and custom recovery tokens?",
      answer:
        "Personalized tokens are stock designs with your name, date, or message engraved on them. Custom tokens are designed from scratch — you control every element including imagery, layout, material, and engraving. Personalization is faster and more affordable; custom is slower, more expensive, and genuinely one-of-a-kind.",
    },
    {
      question: 'How long does personalization take?',
      answer:
        "Personalized recovery tokens typically ship within 7-10 days of order, compared to 2-3 weeks for a fully custom design. The shorter timeline is because the underlying design is already approved — only the engraving is new.",
    },
    {
      question: 'What can I add to a personalized recovery token?',
      answer:
        "A personalized recovery token can include your name, your sobriety or clean date, a short phrase (up to about 20 characters), your milestone count in Roman numerals, or a sponsor's initials. Engraving can go on the front, back, or both. The engraving sits alongside the stock design's existing imagery.",
    },
    {
      question: 'Can I change the material on a personalized token?',
      answer:
        "Yes. Most stock designs are offered in bronze, silver, and gold. You choose the material when you start the personalization flow. Note that changing material doesn't change the design — it still uses the same stock imagery. Only the engraving is unique to you.",
    },
  ],
  schema: ['breadcrumb', 'faq', 'webPage'],
});
