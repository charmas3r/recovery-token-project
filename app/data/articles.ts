/**
 * Token Heritage Articles - Static Data
 *
 * 4 articles establishing topical authority for recovery token search queries.
 * Structured content blocks for controllable rendering and future CMS migration.
 * Ready for Sanity.io integration in Phase 2.
 */

// --- Types ---

export type ArticleCategory = 'Token Heritage';

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

// --- Helper Functions ---

export function getArticleBySlug(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

export function getRelatedArticles(article: Article): Article[] {
  return article.relatedSlugs
    .map((slug) => ARTICLES.find((a) => a.slug === slug))
    .filter((a): a is Article => a !== undefined);
}

export function getAllArticles(): Article[] {
  return ARTICLES;
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

// --- Articles ---

export const ARTICLES: Article[] = [
  // Article 1: The History of Recovery Tokens & Challenge Coins
  {
    id: 'history-of-recovery-tokens',
    slug: 'history-of-recovery-tokens',
    title: 'The History of Recovery Tokens & Challenge Coins',
    category: 'Token Heritage',
    excerpt:
      'From military challenge coins to the AA chips we know today, recovery tokens carry a powerful tradition of courage, accountability, and community.',
    readTime: 8,
    publishedAt: '2025-01-15',
    updatedAt: '2025-01-15',
    metaTitle:
      'The History of Recovery Tokens & Challenge Coins — Recovery Token Store',
    metaDescription:
      'Discover the history of sobriety coins and recovery tokens, from military challenge coin origins to AA chips. Learn how these symbols of courage evolved.',
    keywords: [
      'sobriety coin history',
      'challenge coin tradition',
      'recovery medallion history',
    ],
    relatedSlugs: [
      'how-recovery-tokens-are-made',
      'symbolism-in-token-design',
      'aa-chips-vs-recovery-tokens',
    ],
    content: [
      {
        type: 'paragraph',
        content: [
          'Recovery tokens are more than metal and enamel — they are tangible symbols of perseverance. But where did the tradition begin? The story spans decades, crossing from military barracks to church basements, and ultimately into the hands of millions seeking a better life.',
        ],
      },

      // H2: Origins in Military Challenge Coins
      {
        type: 'heading',
        level: 2,
        text: 'Origins in Military Challenge Coins',
        id: 'origins-in-military-challenge-coins',
      },
      {
        type: 'paragraph',
        content: [
          'The challenge coin tradition is most commonly traced to World War I. According to popular legend, a wealthy American lieutenant had bronze medallions struck for every member of his flying squadron. When one young pilot was captured by German forces, his medallion — worn in a leather pouch around his neck — proved his identity to French allies and saved his life.',
        ],
      },
      {
        type: 'paragraph',
        content: [
          'Whether the story is entirely true or embellished over time, the tradition it inspired is undeniable. By World War II, military units regularly carried unit-specific coins as symbols of belonging, duty, and shared sacrifice. The "challenge" itself — slamming a coin on a bar to see if your comrades had theirs — became a ritual of camaraderie.',
        ],
      },
      {
        type: 'quote',
        text: 'A challenge coin is not merely a token — it is proof that you belong to something greater than yourself.',
        attribution: 'Military tradition',
      },

      // H2: The Birth of AA Chips (1940s)
      {
        type: 'heading',
        level: 2,
        text: 'The Birth of AA Chips (1940s)',
        id: 'the-birth-of-aa-chips',
      },
      {
        type: 'paragraph',
        content: [
          'Alcoholics Anonymous was founded in 1935 by Bill Wilson and Dr. Bob Smith, but the tradition of awarding ',
          {type: 'link', text: 'sobriety coins', href: '/resources/glossary#term-sobriety-coin'},
          ' didn\'t emerge immediately. By the early 1940s, a group in Indianapolis, Indiana began handing out small poker-style chips to mark periods of continuous sobriety.',
        ],
      },
      {
        type: 'paragraph',
        content: [
          'The practice was simple but powerful: a newcomer received a chip at their first meeting, then additional chips at 30 days, 60 days, 90 days, and eventually yearly anniversaries. Each chip was a physical reminder of progress — something you could hold in your hand when temptation struck.',
        ],
      },
      {
        type: 'paragraph',
        content: [
          'Interestingly, AA\'s central office never officially endorsed the chip system. It grew organically, spreading from group to group as members saw its impact. This grassroots adoption speaks to a fundamental human truth: we need physical objects to anchor invisible achievements.',
        ],
      },

      // ProductCTA 1
      {
        type: 'productCTA',
        heading: 'Continue the Tradition',
        description:
          'Our bronze tokens carry forward the same tradition that began in those early AA meetings — handcrafted symbols of courage and commitment.',
        buttonText: 'Browse Bronze Tokens',
        buttonHref: '/collections/bronze-tokens',
      },

      // H2: How Recovery Tokens Spread Beyond AA
      {
        type: 'heading',
        level: 2,
        text: 'How Recovery Tokens Spread Beyond AA',
        id: 'how-recovery-tokens-spread-beyond-aa',
      },
      {
        type: 'paragraph',
        content: [
          'By the 1960s and 1970s, the chip system had become a standard practice in AA meetings across the United States. But the idea didn\'t stay within AA. Other ',
          {type: 'link', text: '12-step programs', href: '/resources/glossary#term-12-step-program'},
          ' — Narcotics Anonymous, Gamblers Anonymous, Overeaters Anonymous — adopted similar token systems to celebrate milestones.',
        ],
      },
      {
        type: 'paragraph',
        content: [
          'Each program adapted the tradition to its own community. NA, for instance, developed its own key tag system alongside traditional medallions. The core idea remained the same: a physical object that says, "You showed up. You did the work. You earned this."',
        ],
      },
      {
        type: 'list',
        style: 'unordered',
        items: [
          'AA (Alcoholics Anonymous) — Chips and medallions for sobriety milestones',
          'NA (Narcotics Anonymous) — Key tags and medallions for clean time',
          'GA (Gamblers Anonymous) — Anniversary tokens for abstinence milestones',
          'OA (Overeaters Anonymous) — Tokens celebrating recovery progress',
        ],
      },

      // H2: The Modern Recovery Token
      {
        type: 'heading',
        level: 2,
        text: 'The Modern Recovery Token',
        id: 'the-modern-recovery-token',
      },
      {
        type: 'paragraph',
        content: [
          'Today\'s recovery tokens have evolved far beyond simple plastic chips. Modern tokens are crafted from premium materials — bronze, silver-plated, and gold-plated metals — with intricate designs that carry deep personal meaning.',
        ],
      },
      {
        type: 'paragraph',
        content: [
          'The shift toward higher-quality tokens reflects an important cultural change: recovery is increasingly recognized not as something to hide, but as an achievement worthy of celebration. A beautifully crafted token says that your journey matters — that each day of sobriety deserves to be honored with something lasting.',
        ],
      },
      {
        type: 'callout',
        title: 'Did You Know?',
        text: 'Many people carry their recovery token in their pocket every day, rubbing it between their fingers as a tactile reminder of their commitment. This practice is sometimes called a "worry stone" technique.',
        variant: 'info',
      },

      // H2: Why Physical Tokens Still Matter
      {
        type: 'heading',
        level: 2,
        text: 'Why Physical Tokens Still Matter',
        id: 'why-physical-tokens-still-matter',
      },
      {
        type: 'paragraph',
        content: [
          'In an increasingly digital world, the power of a physical token might seem surprising. But research in psychology suggests that tangible objects play a crucial role in forming and maintaining identity. Holding something you\'ve earned activates a different part of the brain than seeing a digital badge or notification.',
        ],
      },
      {
        type: 'paragraph',
        content: [
          'A recovery token serves multiple purposes: it\'s a personal reminder of progress, a conversation starter with others in recovery, and — in moments of doubt — a physical anchor to the commitment you\'ve made. The weight of it in your pocket is a constant, gentle reminder that you are not alone.',
        ],
      },
      {
        type: 'paragraph',
        content: [
          'The tradition that began with military ',
          {type: 'link', text: 'challenge coins', href: '/resources/glossary#term-challenge-coin'},
          ' and grew through AA\'s grassroots chip system continues to evolve. Today, ',
          {type: 'link', text: 'explore our full collection', href: '/collections'},
          ' of recovery tokens crafted to honor every step of your journey.',
        ],
      },

      // ProductCTA 2
      {
        type: 'productCTA',
        heading: 'Honor Your Journey',
        description:
          'From your first 24 hours to decades of sobriety, find the token that celebrates your milestone.',
        buttonText: 'Explore Our Collection',
        buttonHref: '/collections',
      },
    ],
  },

  // Article 2: How Recovery Tokens Are Made: Materials & Craftsmanship
  {
    id: 'how-recovery-tokens-are-made',
    slug: 'how-recovery-tokens-are-made',
    title: 'How Recovery Tokens Are Made: Materials & Craftsmanship',
    category: 'Token Heritage',
    excerpt:
      'Discover the artistry behind recovery tokens — from die striking and bronze casting to silver plating and hand-finished details.',
    readTime: 7,
    publishedAt: '2025-01-22',
    updatedAt: '2025-01-22',
    metaTitle:
      'How Recovery Tokens Are Made: Materials & Craftsmanship — Recovery Token Store',
    metaDescription:
      'Learn how sobriety coins and recovery tokens are made, from bronze die striking to silver and gold plating. Understand the materials and craftsmanship involved.',
    keywords: [
      'how sobriety coins are made',
      'recovery token materials',
      'bronze token craftsmanship',
    ],
    relatedSlugs: [
      'history-of-recovery-tokens',
      'symbolism-in-token-design',
      'aa-chips-vs-recovery-tokens',
    ],
    content: [
      {
        type: 'paragraph',
        content: [
          'A recovery token is more than a symbol — it\'s a handcrafted object designed to last a lifetime. The process of creating these tokens combines centuries-old metalworking techniques with modern precision, resulting in pieces that carry both beauty and meaning.',
        ],
      },

      // H2: The Art of Die Striking
      {
        type: 'heading',
        level: 2,
        text: 'The Art of Die Striking',
        id: 'the-art-of-die-striking',
      },
      {
        type: 'paragraph',
        content: [
          'Die striking is the foundation of quality token manufacturing. The process begins with a master die — a hardened steel tool engraved with the inverse of the desired design. When a metal blank (called a planchet) is placed between two dies and subjected to enormous pressure — often 50 to 150 tons — the design is transferred with remarkable precision.',
        ],
      },
      {
        type: 'paragraph',
        content: [
          'This method produces tokens with sharp, crisp details and a satisfying weight that cheaper stamping methods can\'t match. The dies themselves can take weeks to create, as skilled engravers work to perfect every element of the design.',
        ],
      },
      {
        type: 'callout',
        title: 'Master Die Lifespan',
        text: 'A single master die can produce thousands of tokens before needing replacement. The harder the die steel, the more tokens it can strike — which is why premium manufacturers invest in high-grade tool steel.',
        variant: 'info',
      },

      // H2: Bronze: The Classic Choice
      {
        type: 'heading',
        level: 2,
        text: 'Bronze: The Classic Choice',
        id: 'bronze-the-classic-choice',
      },
      {
        type: 'paragraph',
        content: [
          'Bronze has been the material of choice for ',
          {type: 'link', text: 'recovery tokens', href: '/resources/glossary#term-recovery-token'},
          ' since the earliest days of the tradition. This copper-tin alloy offers a unique combination of durability, beauty, and warmth that other metals simply can\'t replicate.',
        ],
      },
      {
        type: 'paragraph',
        content: [
          'One of bronze\'s most appealing qualities is how it ages. Over time, a bronze token develops a natural patina — a warm, darkened finish that actually enhances the design\'s depth and character. Many collectors and token holders treasure this aging process, as it mirrors their own journey: growing richer and more meaningful with time.',
        ],
      },
      {
        type: 'list',
        style: 'unordered',
        items: [
          'Durability — Bronze resists corrosion and everyday wear',
          'Weight — Substantial feel that conveys quality and importance',
          'Patina — Develops character and depth over time',
          'Tradition — Connects to the original AA chip heritage',
          'Affordability — Premium feel without precious metal pricing',
        ],
      },

      // ProductCTA 1
      {
        type: 'productCTA',
        heading: 'The Bronze Standard',
        description:
          'Our bronze tokens are die-struck from premium alloy, designed to develop a beautiful patina over years of daily carry.',
        buttonText: 'Shop Bronze Tokens',
        buttonHref: '/collections/bronze-tokens',
      },

      // H2: Silver and Gold Plating
      {
        type: 'heading',
        level: 2,
        text: 'Silver and Gold Plating',
        id: 'silver-and-gold-plating',
      },
      {
        type: 'paragraph',
        content: [
          'For milestone anniversaries, many people choose silver-plated or gold-plated tokens. The plating process involves electrodeposition — submerging the struck bronze token in a chemical bath and using an electrical current to bond a thin layer of precious metal to the surface.',
        ],
      },
      {
        type: 'paragraph',
        content: [
          'Quality plating requires multiple steps: cleaning, activation, base coating, and finally the precious metal layer. The best manufacturers apply multiple coats with a protective sealant, ensuring the finish lasts for years without tarnishing or flaking.',
        ],
      },

      {
        type: 'heading',
        level: 3,
        text: 'Color Enamel Finishing',
        id: 'color-enamel-finishing',
      },
      {
        type: 'paragraph',
        content: [
          'Many recovery tokens feature colored enamel fills — a technique where liquid enamel is carefully applied to recessed areas of the design, then cured at high temperature. This adds vibrant color while maintaining the metal\'s raised detail. The traditional ',
          {type: 'link', text: 'AA chip color system', href: '/resources/glossary#term-aa-chip'},
          ' uses specific colors to represent different milestones.',
        ],
      },

      // H2: The Design Process
      {
        type: 'heading',
        level: 2,
        text: 'The Design Process',
        id: 'the-design-process',
      },
      {
        type: 'paragraph',
        content: [
          'Creating a new token design is a collaborative process that blends artistry with symbolism. It typically begins with concept sketches, where designers work with recovery community advisors to ensure every element carries authentic meaning.',
        ],
      },
      {
        type: 'list',
        style: 'ordered',
        items: [
          'Concept development — Researching symbols, gathering community input',
          'Digital design — Creating precise vector artwork from sketches',
          'Sculpting — Translating 2D designs into 3D relief models',
          'Die creation — Engraving master dies from the 3D models',
          'Sampling — Striking test pieces and refining the design',
          'Production — Full manufacturing run with quality inspection',
        ],
      },

      // H2: Quality That Lasts a Lifetime
      {
        type: 'heading',
        level: 2,
        text: 'Quality That Lasts a Lifetime',
        id: 'quality-that-lasts-a-lifetime',
      },
      {
        type: 'paragraph',
        content: [
          'The mark of a quality recovery token is how it feels in your hand — the weight, the crispness of the detail, the smoothness of the edge finishing. Premium tokens undergo multiple quality control checks throughout the manufacturing process.',
        ],
      },
      {
        type: 'paragraph',
        content: [
          'When you carry a well-made token, you can feel the difference. The edges are smooth and comfortable. The design elements are sharp and defined. The weight is reassuring. These aren\'t just aesthetic choices — they\'re functional ones, because a token that feels good to hold is a token you\'ll actually carry every day.',
        ],
      },
      {
        type: 'quote',
        text: 'The best recovery token is the one you carry with you. Quality craftsmanship ensures it becomes a lifelong companion on your journey.',
      },

      // ProductCTA 2
      {
        type: 'productCTA',
        heading: 'Crafted to Last',
        description:
          'Every token in our collection is made with the same attention to craftsmanship described here — because your milestone deserves nothing less.',
        buttonText: 'Design Your Custom Token',
        buttonHref: '/collections/custom-tokens',
      },
    ],
  },

  // Article 3: Symbolism in Token Design: Every Detail Has Meaning
  {
    id: 'symbolism-in-token-design',
    slug: 'symbolism-in-token-design',
    title: 'Symbolism in Token Design: Every Detail Has Meaning',
    category: 'Token Heritage',
    excerpt:
      'The circle, the triangle, the numbers — every element on a recovery token carries deep significance rooted in decades of tradition.',
    readTime: 7,
    publishedAt: '2025-02-01',
    updatedAt: '2025-02-01',
    metaTitle:
      'Symbolism in Token Design: Every Detail Has Meaning — Recovery Token Store',
    metaDescription:
      'Learn the meaning behind recovery token symbols — circles, triangles, numbers, and more. Understand the deep symbolism in AA chips and sobriety coins.',
    keywords: [
      'AA chip meaning',
      'recovery token symbols',
      'sobriety coin design meaning',
    ],
    relatedSlugs: [
      'history-of-recovery-tokens',
      'how-recovery-tokens-are-made',
      'aa-chips-vs-recovery-tokens',
    ],
    content: [
      {
        type: 'paragraph',
        content: [
          'Look closely at any recovery token and you\'ll find layers of meaning embedded in every curve, number, and symbol. These design elements aren\'t decorative — each one connects to a rich tradition of recovery philosophy, shared experience, and personal transformation.',
        ],
      },

      // H2: The Circle: Wholeness and Unity
      {
        type: 'heading',
        level: 2,
        text: 'The Circle: Wholeness and Unity',
        id: 'the-circle-wholeness-and-unity',
      },
      {
        type: 'paragraph',
        content: [
          'The most fundamental symbol in token design is the circle itself. The circular shape of a ',
          {type: 'link', text: 'recovery token', href: '/resources/glossary#term-recovery-token'},
          ' is not arbitrary — it represents wholeness, completeness, and the never-ending nature of the recovery journey.',
        ],
      },
      {
        type: 'paragraph',
        content: [
          'In many spiritual traditions, the circle represents eternity and the cyclical nature of life. For those in recovery, it serves as a reminder that the journey has no final destination — it\'s a continuous process of growth, one day at a time. The circle also symbolizes the unity of the recovery community: everyone sitting in a circle at a meeting is equal.',
        ],
      },

      // H2: Numbers and Milestones
      {
        type: 'heading',
        level: 2,
        text: 'Numbers and Milestones',
        id: 'numbers-and-milestones',
      },
      {
        type: 'paragraph',
        content: [
          'The numbers on a recovery token — whether "24 Hours," "30 Days," "1 Year," or "25 Years" — are perhaps the most personal element. Each number represents a specific period of continuous ',
          {type: 'link', text: 'sobriety', href: '/resources/glossary#term-sobriety'},
          ', earned one day at a time.',
        ],
      },
      {
        type: 'paragraph',
        content: [
          'The milestone system serves a psychological purpose beyond record-keeping. Research in behavioral psychology shows that breaking a long-term goal into smaller, achievable milestones increases motivation and the likelihood of success. Each numbered token is both a celebration of what\'s been accomplished and a stepping stone toward the next goal.',
        ],
      },
      {
        type: 'list',
        style: 'unordered',
        items: [
          '24 Hours — The most important milestone. Every journey begins with a single day.',
          '30, 60, 90 Days — Early recovery milestones that build confidence and routine.',
          '6 Months — A half-year of dedication and growing strength.',
          '1 Year — A deeply significant anniversary marking a full cycle of seasons sober.',
          '5, 10, 15, 20, 25+ Years — Long-term milestones celebrating sustained commitment.',
        ],
      },

      // ProductCTA 1
      {
        type: 'productCTA',
        heading: 'Make It Personal',
        description:
          'Add custom engraving to any token — a name, a date, or a personal message that makes the milestone uniquely yours.',
        buttonText: 'Personalize Your Token',
        buttonHref: '/collections/custom-tokens',
      },

      // H2: The Triangle: Unity, Service, Recovery
      {
        type: 'heading',
        level: 2,
        text: 'The Triangle: Unity, Service, Recovery',
        id: 'the-triangle-unity-service-recovery',
      },
      {
        type: 'paragraph',
        content: [
          'The triangle is one of the most recognized symbols in the recovery world. In AA tradition, the three sides of the triangle represent three foundational principles:',
        ],
      },
      {
        type: 'list',
        style: 'unordered',
        items: [
          'Unity — The strength found in community and fellowship',
          'Service — Giving back to others who are on the same path',
          'Recovery — The ongoing process of personal healing and growth',
        ],
      },
      {
        type: 'paragraph',
        content: [
          'When enclosed within a circle, the triangle-within-a-circle becomes the iconic AA symbol. The circle represents the global community of AA, while the triangle inside represents these three principles working together. This symbol appears on countless tokens and ',
          {type: 'link', text: 'medallions', href: '/resources/glossary#term-medallion'},
          ' worldwide.',
        ],
      },

      // H2: Common Symbols and Their Meanings
      {
        type: 'heading',
        level: 2,
        text: 'Common Symbols and Their Meanings',
        id: 'common-symbols-and-their-meanings',
      },
      {
        type: 'paragraph',
        content: [
          'Beyond the circle and triangle, recovery tokens feature a rich vocabulary of symbols. Here are some of the most common:',
        ],
      },
      {
        type: 'list',
        style: 'unordered',
        items: [
          'The Serenity Prayer — "God grant me the serenity..." A daily prayer of acceptance and courage.',
          'The Camel — Symbolizes "one day at a time," as a camel can go one day without water.',
          'The Butterfly — Represents transformation and new beginnings.',
          'The Sunflower — Turning toward the light, growth, and hope.',
          'Clasped Hands — Unity, fellowship, and mutual support.',
          'The Roman Numeral — A classical way to mark anniversary years.',
        ],
      },
      {
        type: 'callout',
        title: 'The Sunflower Tradition',
        text: 'Sunflowers are increasingly popular in recovery symbolism because they always turn toward the sun — a beautiful metaphor for choosing light over darkness, growth over stagnation.',
        variant: 'tip',
      },

      // H2: Personalization Through Engraving
      {
        type: 'heading',
        level: 2,
        text: 'Personalization Through Engraving',
        id: 'personalization-through-engraving',
      },
      {
        type: 'paragraph',
        content: [
          'One of the most meaningful ways to add symbolism to a token is through custom engraving. A sobriety date, a name, a meaningful phrase, or a personal mantra transforms a beautiful object into a deeply personal talisman.',
        ],
      },
      {
        type: 'paragraph',
        content: [
          'Common engravings include sobriety dates (the day the journey began), initials or first names, and short phrases like "One Day at a Time" or "Progress, Not Perfection." Some people engrave the names of loved ones who supported their recovery, while others choose a single word that encapsulates their personal philosophy.',
        ],
      },
      {
        type: 'paragraph',
        content: [
          'Whether you choose a token rich in traditional symbolism or opt for a more personal design, the meaning you attach to it is what matters most. Every token tells a story — make sure yours tells yours. Browse our ',
          {type: 'link', text: 'full collection', href: '/collections'},
          ' to find the design that speaks to your journey.',
        ],
      },

      // ProductCTA 2
      {
        type: 'productCTA',
        heading: 'Tell Your Story',
        description:
          'Our Sunflower Token features one of recovery\'s most beloved symbols. See the detailed craftsmanship for yourself.',
        buttonText: 'See the Sunflower Token',
        buttonHref: '/products/sunflower-token',
      },
    ],
  },

  // Article 4: AA Chips vs. Recovery Tokens: Understanding the Tradition
  {
    id: 'aa-chips-vs-recovery-tokens',
    slug: 'aa-chips-vs-recovery-tokens',
    title: 'AA Chips vs. Recovery Tokens: Understanding the Tradition',
    category: 'Token Heritage',
    excerpt:
      'What\'s the difference between an AA chip and a recovery token? Learn about the traditions, materials, and color systems behind each.',
    readTime: 6,
    publishedAt: '2025-02-10',
    updatedAt: '2025-02-10',
    metaTitle:
      'AA Chips vs. Recovery Tokens: Understanding the Tradition — Recovery Token Store',
    metaDescription:
      'Understand the difference between AA chips and recovery tokens. Learn about the color system, materials, and traditions behind sobriety milestones.',
    keywords: [
      'AA chip vs recovery token',
      'sobriety token vs chip',
      'AA chip colors meaning',
    ],
    relatedSlugs: [
      'history-of-recovery-tokens',
      'how-recovery-tokens-are-made',
      'symbolism-in-token-design',
    ],
    content: [
      {
        type: 'paragraph',
        content: [
          'If you\'re new to the recovery community, you may hear the terms "AA chip," "sobriety coin," "recovery token," and "medallion" used interchangeably. While they\'re all part of the same tradition, there are meaningful differences in materials, design, and usage. Understanding these distinctions can help you choose the right way to mark your milestones.',
        ],
      },

      // H2: What Are AA Chips?
      {
        type: 'heading',
        level: 2,
        text: 'What Are AA Chips?',
        id: 'what-are-aa-chips',
      },
      {
        type: 'paragraph',
        content: [
          {type: 'link', text: 'AA chips', href: '/resources/glossary#term-aa-chip'},
          ' (also called sobriety chips) are the original milestone markers used in Alcoholics Anonymous meetings. The term "chip" reflects their origins — early versions were literally poker chips or similar small, flat tokens made from inexpensive materials like plastic or aluminum.',
        ],
      },
      {
        type: 'paragraph',
        content: [
          'Traditional AA chips are characterized by their simplicity and accessibility. They\'re typically given out during meetings at no cost, funded by group contributions. The idea is that anyone, regardless of financial situation, should be able to receive a chip marking their milestone.',
        ],
      },
      {
        type: 'list',
        style: 'unordered',
        items: [
          'Material: Usually plastic, aluminum, or basic metal alloy',
          'Cost: Free at meetings (funded by group treasury)',
          'Design: Simple, standardized with AA symbolism',
          'Purpose: Given during meetings as community celebration',
          'Size: Typically 1.25 to 1.5 inches in diameter',
        ],
      },

      // H2: What Are Recovery Tokens?
      {
        type: 'heading',
        level: 2,
        text: 'What Are Recovery Tokens?',
        id: 'what-are-recovery-tokens',
      },
      {
        type: 'paragraph',
        content: [
          'Recovery tokens (also called ',
          {type: 'link', text: 'recovery medallions', href: '/resources/glossary#term-medallion'},
          ') are premium-quality versions of the same tradition. Made from materials like die-struck bronze, silver-plated metal, and gold-plated alloy, these tokens are designed to be heirloom-quality objects that last a lifetime.',
        ],
      },
      {
        type: 'paragraph',
        content: [
          'Recovery tokens are typically purchased by individuals, sponsors, or family members as personal gifts marking significant milestones. They often feature more detailed designs, finer craftsmanship, and the option for custom engraving.',
        ],
      },
      {
        type: 'list',
        style: 'unordered',
        items: [
          'Material: Die-struck bronze, silver-plated, or gold-plated',
          'Cost: Purchased individually as personal milestone markers',
          'Design: Detailed, varied designs with artistic symbolism',
          'Purpose: Personal keepsake, gift from sponsor or loved one',
          'Size: Typically 1.5 to 1.75 inches, heavier weight',
        ],
      },

      // ProductCTA 1
      {
        type: 'productCTA',
        heading: 'Premium Recovery Tokens',
        description:
          'Our collection features die-struck bronze tokens with detailed designs, perfect as personal milestone keepsakes or meaningful gifts.',
        buttonText: 'Browse All Tokens',
        buttonHref: '/collections',
      },

      // H2: Key Differences
      {
        type: 'heading',
        level: 2,
        text: 'Key Differences',
        id: 'key-differences',
      },
      {
        type: 'paragraph',
        content: [
          'While AA chips and recovery tokens serve the same fundamental purpose — celebrating sobriety milestones — they differ in several important ways:',
        ],
      },

      {
        type: 'heading',
        level: 3,
        text: 'Material and Durability',
        id: 'material-and-durability',
      },
      {
        type: 'paragraph',
        content: [
          'Standard AA chips are made from lightweight plastic or thin metal, designed for accessibility rather than longevity. Recovery tokens are crafted from solid bronze or plated metals, built to withstand decades of daily carry. A quality bronze token will develop a rich ',
          {type: 'link', text: 'patina', href: '/resources/glossary#term-patina'},
          ' over time, becoming more beautiful with age.',
        ],
      },

      {
        type: 'heading',
        level: 3,
        text: 'Design Complexity',
        id: 'design-complexity',
      },
      {
        type: 'paragraph',
        content: [
          'AA chips typically feature standardized designs — the AA triangle, the milestone number, and basic text. Recovery tokens offer a wider range of artistic expression, from traditional symbols to nature-inspired designs, geometric patterns, and custom engravings.',
        ],
      },

      {
        type: 'heading',
        level: 3,
        text: 'Personal Significance',
        id: 'personal-significance',
      },
      {
        type: 'paragraph',
        content: [
          'Both carry deep personal meaning, but in different ways. An AA chip represents the community\'s recognition — it\'s given by the group. A recovery token is often a more personal choice — selected by you or gifted by someone who knows your specific journey.',
        ],
      },

      // H2: The Color System Explained
      {
        type: 'heading',
        level: 2,
        text: 'The Color System Explained',
        id: 'the-color-system-explained',
      },
      {
        type: 'paragraph',
        content: [
          'One of the most distinctive aspects of AA chips is the color-coding system. While colors can vary slightly between groups, the most widely used system is:',
        ],
      },
      {
        type: 'list',
        style: 'unordered',
        items: [
          'White — Surrender / newcomer (desire chip)',
          'Silver — 24 hours',
          'Red — 30 days (1 month)',
          'Gold — 60 days (2 months)',
          'Green — 90 days (3 months)',
          'Purple — 4 months',
          'Pink — 5 months',
          'Dark Blue — 6 months',
          'Copper — 7 months',
          'Ruby Red — 8 months',
          'Gold-Purple — 9 months',
          'Gray-Gold — 10 months',
          'Green-Gold — 11 months',
          'Bronze — 1 year and beyond (annual milestones)',
        ],
      },
      {
        type: 'callout',
        title: 'The Desire Chip',
        text: 'The white "desire chip" or "surrender chip" is perhaps the most powerful of all. It represents the moment someone says, "I want to stop." No sobriety time is required — just the desire for a better life. Many people keep their desire chip for decades.',
        variant: 'tip',
      },

      // H2: Choosing What's Right for You
      {
        type: 'heading',
        level: 2,
        text: "Choosing What's Right for You",
        id: 'choosing-whats-right-for-you',
      },
      {
        type: 'paragraph',
        content: [
          'There\'s no wrong choice between AA chips and recovery tokens — many people collect both. The free chips from meetings mark the communal celebration, while a premium token serves as a personal, lasting keepsake.',
        ],
      },
      {
        type: 'paragraph',
        content: [
          'Some people receive a chip at their meeting and then purchase a premium token to carry daily. Others receive tokens as gifts from sponsors, spouses, or children. The "right" choice is whatever resonates with you and supports your recovery.',
        ],
      },
      {
        type: 'paragraph',
        content: [
          'What matters most is not the material or the price — it\'s what the token represents. Whether it\'s a simple plastic chip or a handcrafted bronze medallion, it\'s a physical reminder that you showed up, did the work, and earned this moment.',
        ],
      },
      {
        type: 'paragraph',
        content: [
          'Ready to find your perfect token? Our ',
          {type: 'link', text: 'color token collection', href: '/collections/color-tokens'},
          ' honors the traditional color system, while our bronze and custom lines offer premium alternatives for lasting milestones.',
        ],
      },

      // ProductCTA 2
      {
        type: 'productCTA',
        heading: 'Honor the Tradition',
        description:
          'Our color tokens follow the traditional milestone color system, available in premium die-struck metal for a lasting keepsake.',
        buttonText: 'Shop Color Tokens',
        buttonHref: '/collections/color-tokens',
      },
    ],
  },
];
