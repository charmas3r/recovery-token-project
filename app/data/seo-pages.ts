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

registerSEOPage({
  slug: 'na-coins',
  type: 'commercial',
  title: 'NA Coins & Key Tags',
  metaTitle: 'NA Coins & Key Tags — Narcotics Anonymous Recovery Tokens | Coinplugz',
  metaDescription:
    'Shop NA coins and key tags for every clean-time milestone. Premium Narcotics Anonymous recovery tokens celebrating 30 days to decades of sobriety.',
  canonicalPath: 'na-coins',
  eyebrow: 'Narcotics Anonymous',
  heroDescription:
    'Narcotics Anonymous uses both coins and key tags to mark the milestones that matter. Shop premium NA recovery tokens handcrafted to honor every day of clean time — from 30 days to 30 years.',
  primaryCTA: {label: 'Shop NA Coins', href: '/collections/all'},
  featuredCollectionHandle: 'all',
  relatedPageSlugs: [
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
  metaTitle: 'Recovery Medallions — Premium Sobriety Medallions | Coinplugz',
  metaDescription:
    'Shop premium recovery medallions crafted from bronze, brass, and plated metals. Weighty, beautiful milestones tokens built to be carried for a lifetime.',
  canonicalPath: 'recovery-medallions',
  eyebrow: 'Premium Medallions',
  heroDescription:
    'A medallion is more than a chip — it is a keepsake. Handcrafted from premium metals with substantial weight and lasting detail, our recovery medallions are designed to be carried daily and treasured for a lifetime.',
  primaryCTA: {label: 'Shop Medallions', href: '/collections/all'},
  featuredCollectionHandle: 'all',
  relatedPageSlugs: [
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
      body: "Coinplugz medallions are cast from bronze, brass, or zinc alloy and finished with meticulous detail. Many feature die-struck reliefs — the Serenity Prayer, the AA triangle, Roman numerals for milestone years — pressed into the metal with sharp clarity that lasts decades.\n\nPremium options include gold plating, silver plating, and antique bronze finishes that develop a beautiful patina over time. Each medallion is inspected before shipping to ensure it meets the standard that milestones deserve.",
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
        'Most recovery medallions are made from bronze, brass, or zinc alloy. Premium versions are gold or silver plated. Coinplugz uses die-struck processes for crisp detail that holds up over years of daily carry.',
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
  metaTitle: 'Sobriety Gifts for Women — Elegant Recovery Gifts | Coinplugz',
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
  metaTitle: 'Sobriety Gifts for Men — Meaningful Recovery Gifts | Coinplugz',
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
  metaTitle: 'Sponsor & Sponsee Gifts — Recovery Gifts for AA & NA | Coinplugz',
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
  metaTitle: 'Custom Sobriety Coins — Personalized Recovery Tokens | Coinplugz',
  metaDescription:
    'Design a custom sobriety coin with personalized engraving, dates, and messages. Create a one-of-a-kind recovery token that tells your unique story.',
  canonicalPath: 'custom-sobriety-coins',
  eyebrow: 'Custom Tokens',
  heroDescription:
    "Every recovery story is unique. Your token should be too. Design a custom sobriety coin with personalized engraving — a date, a name, a phrase that means something — and create a keepsake that no one else in the world has.",
  primaryCTA: {label: 'Design Your Custom Coin', href: '/custom-token'},
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
      body: "At Coinplugz, personalization goes beyond a name on the back. You can engrave a sobriety date, a meaningful quote, a first name, initials, or a short message that captures something specific to the recipient's journey.\n\nFor sponsors creating a gift for a sponsee, consider a phrase from your work together. For family members, a simple date and a few words. For yourself, whatever truth belongs on a coin you'll carry every day.",
    },
    {type: 'productShowcase', heading: 'Custom Coin Options', body: ''},
    {
      type: 'text',
      heading: 'The Difference a Custom Coin Makes',
      body: "A standard sobriety coin is already meaningful — it carries decades of recovery tradition. A custom coin carries all of that plus something irreplaceable: the specific story of one person's recovery.\n\nWhen someone opens a gift box and finds a coin with their exact sobriety date engraved on the back, the effect is immediate. It's not a generic recovery gift — it's evidence that someone paid attention, cared enough to get it right, and marked the moment permanently.",
    },
  ],
  faq: [
    {
      question: 'Can I add a sobriety date to a recovery coin?',
      answer:
        "Yes. At Coinplugz, you can engrave a specific date, name, or short message on your custom coin. Sobriety date engravings are one of our most popular personalizations — they transform a meaningful object into a one-of-a-kind keepsake.",
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
        "Yes — Coinplugz offers a custom token design experience where you can choose the material, finish, and personalization details to create a completely unique recovery medallion.",
    },
  ],
  schema: ['breadcrumb', 'faq', 'webPage'],
});

registerSEOPage({
  slug: 'bronze-sobriety-coins',
  type: 'commercial',
  title: 'Bronze Sobriety Coins',
  metaTitle: 'Bronze Sobriety Coins — Classic Recovery Medallions | Coinplugz',
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
  metaTitle: 'Gold & Silver Recovery Medallions — Premium Milestone Coins | Coinplugz',
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
      body: "Coinplugz gold and silver medallions are die-struck from quality base metals and electroplated to achieve a rich, even finish. The plating process creates a color depth and reflectivity that standard coins can't match — making them photogenic, gift-worthy, and striking on display.\n\nFor collectors of long-term recovery, having a gold medallion for a 5-year or 10-year milestone alongside the bronze coins of earlier years creates a beautiful progression of physical proof.",
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
        "Gold plating can wear on high-contact areas over years of daily carry. Coinplugz uses a thick electroplating process to maximize durability. For coins intended primarily for display or special occasions, the finish will remain pristine for many years.",
    },
  ],
  schema: ['breadcrumb', 'faq', 'webPage'],
});

registerSEOPage({
  slug: 'serenity-prayer-coins',
  type: 'commercial',
  title: 'Serenity Prayer Coins',
  metaTitle: 'Serenity Prayer Coins — Recovery Medallions with the Serenity Prayer | Coinplugz',
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
  metaTitle: 'AA Chip Colors & Meanings — Complete Color Guide | Coinplugz',
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
  metaTitle: 'Sobriety Coin Holders & Keychains — Recovery Token Accessories | Coinplugz',
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
  metaTitle: 'Celebrate Recovery Coins — CR Recovery Tokens | Coinplugz',
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
      body: "Like AA and NA, Celebrate Recovery uses coins and tokens to mark milestones in recovery — celebrating progress in community with the acknowledgment that healing is a journey, not an event.\n\nCR coins often carry scriptural references or Christ-centered phrases alongside the milestone markers, reflecting the program's foundation. Many CR members carry their coin as a daily reminder of both their commitment to sobriety and the faith that sustains it.\n\nAt Coinplugz, our recovery coins are welcomed across recovery programs and traditions — including Celebrate Recovery.",
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
      question: 'Can I use a Coinplugz coin in a Celebrate Recovery program?',
      answer:
        "Yes. Coinplugz recovery coins are meaningful across recovery programs and traditions. While some CR groups use program-specific coins, our premium recovery tokens are welcomed by CR members looking for a quality medallion to mark their milestones.",
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
