/**
 * Token Heritage Articles - Static Data
 *
 * 8 articles across 2 categories: Token Heritage (4) and Recovery Guides (4).
 * Structured content blocks for controllable rendering and future CMS migration.
 * Ready for Sanity.io integration in Phase 2.
 */

// --- Types ---

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

  // ─────────────────────────────────────────────────────────────
  // RECOVERY GUIDES (Articles 5–8)
  // ─────────────────────────────────────────────────────────────

  // Article 5: How to Celebrate a Recovery Milestone
  {
    id: 'how-to-celebrate-recovery-milestone',
    slug: 'how-to-celebrate-recovery-milestone',
    title: 'How to Celebrate a Recovery Milestone',
    category: 'Recovery Guides',
    excerpt:
      'Recovery milestones are earned, not given. Explore meaningful ways to celebrate sobriety anniversaries — from personal rituals and group ceremonies to tangible keepsakes that anchor your progress.',
    readTime: 7,
    publishedAt: '2025-04-25',
    updatedAt: '2025-04-25',
    metaTitle: 'How to Celebrate a Recovery Milestone | Recovery Token Store',
    metaDescription:
      'Discover meaningful ways to celebrate sobriety milestones. From personal rituals to group ceremonies, learn how to honor every step of your recovery journey.',
    keywords: [
      'how to celebrate sobriety',
      'recovery milestone celebration',
      'sobriety anniversary ideas',
      'celebrating recovery',
      'sobriety milestones',
      'recovery celebration ideas',
    ],
    relatedSlugs: [
      'aa-chips-vs-recovery-tokens',
      'symbolism-in-token-design',
      'history-of-recovery-tokens',
    ],
    content: [
      // Opening
      {
        type: 'paragraph',
        content: [
          'Every day in ',
          {type: 'link', text: 'recovery', href: '/resources/glossary#term-recovery'},
          ' is an achievement — but some days carry extra weight. Whether it\'s 24 hours, 30 days, or 20 years, a ',
          {type: 'link', text: 'sobriety milestone', href: '/resources/glossary#term-anniversary'},
          ' represents something profound: proof that you showed up, did the work, and chose a different path. These milestones aren\'t given — they\'re earned.',
        ],
      },
      {
        type: 'paragraph',
        content: [
          'Yet many people in recovery don\'t know how to celebrate these moments. The culture of shame around addiction can make it feel strange to acknowledge what you\'ve accomplished. This guide is here to change that. Your milestones deserve celebration — and knowing how to mark them can strengthen your recovery for years to come.',
        ],
      },

      // H2: Why Celebrating Matters
      {
        type: 'heading',
        level: 2,
        text: 'Why Celebrating Matters',
        id: 'why-celebrating-matters',
      },
      {
        type: 'paragraph',
        content: [
          'Addiction thrives in shame. Recovery thrives in recognition. Behavioral psychology shows that positive reinforcement — acknowledging and rewarding progress — is one of the strongest predictors of sustained behavior change. When you celebrate a milestone, you\'re not just having a good time; you\'re actively reinforcing the neural pathways that support your ',
          {type: 'link', text: 'sobriety', href: '/resources/glossary#term-sobriety'},
          '.',
        ],
      },
      {
        type: 'paragraph',
        content: [
          'Celebration also counters the isolation that addiction creates. It invites your community into your story. It tells the people around you: this is real, this matters, and I\'m proud of the work I\'ve done.',
        ],
      },
      {
        type: 'callout',
        title: 'The Science Is Clear',
        text: 'Research on habit formation consistently shows that celebrating small wins — not just the big milestones — dramatically increases the likelihood of long-term success. Every celebration trains your brain to associate recovery with reward.',
        variant: 'info',
      },

      // H2: Ideas for Every Milestone
      {
        type: 'heading',
        level: 2,
        text: 'Ideas for Every Milestone',
        id: 'ideas-for-every-milestone',
      },
      {
        type: 'paragraph',
        content: [
          'Not every milestone calls for the same celebration. What matters at 30 days is different from what matters at 5 years. Here are ideas organized by stage:',
        ],
      },
      {
        type: 'heading',
        level: 3,
        text: 'Early Recovery (24 Hours to 90 Days)',
        id: 'early-recovery',
      },
      {
        type: 'list',
        style: 'unordered',
        items: [
          'Share at a meeting and accept your chip with pride',
          'Write a letter to yourself about why you chose recovery',
          'Treat yourself to a favorite meal or experience (sober, of course)',
          'Call your sponsor and acknowledge the moment together',
          'Start a recovery journal — your first entry is today\'s milestone',
        ],
      },
      {
        type: 'heading',
        level: 3,
        text: 'Mid Recovery (6 Months to 2 Years)',
        id: 'mid-recovery',
      },
      {
        type: 'list',
        style: 'unordered',
        items: [
          'Host a small gathering with sober friends or family',
          'Plan a meaningful outing — a hike, a concert, a day trip',
          'Commission a custom recovery token with your sobriety date engraved',
          'Write a gratitude list of everything recovery has given you',
          'Volunteer at a meeting or recovery center to give back',
        ],
      },
      {
        type: 'heading',
        level: 3,
        text: 'Long-Term Recovery (3+ Years)',
        id: 'long-term-recovery',
      },
      {
        type: 'list',
        style: 'unordered',
        items: [
          'Renew personal commitments — revisit your step work or set new goals',
          'Mentor a newcomer and share what the milestone means to you',
          'Plan a trip or experience you\'ve been saving for',
          'Upgrade to a premium token that reflects the weight of your achievement',
          'Write or record your story for others who need to hear it',
        ],
      },

      // H2: Ceremony and Ritual
      {
        type: 'heading',
        level: 2,
        text: 'Ceremony and Ritual',
        id: 'ceremony-and-ritual',
      },
      {
        type: 'paragraph',
        content: [
          'There\'s a reason ',
          {type: 'link', text: 'meetings', href: '/resources/glossary#term-meeting'},
          ' have chip ceremonies. Ritual creates a container for emotion. It says: this moment is different from ordinary time. Whether you\'re in a room of 200 people or sitting quietly alone, ceremony turns a date on the calendar into a lived experience.',
        ],
      },
      {
        type: 'paragraph',
        content: [
          'Chip ceremonies in AA and NA are one of the most powerful rituals in recovery. When the room applauds as you walk up to collect your chip, you feel it physically. That\'s not an accident — it\'s the community bearing witness to your transformation.',
        ],
      },
      {
        type: 'paragraph',
        content: [
          'But ceremony doesn\'t have to be public. Some people light a candle on their ',
          {type: 'link', text: 'sobriety date', href: '/resources/glossary#term-sobriety-date'},
          ' each year. Others read a passage from their daily reader, or take a moment of silence. The form doesn\'t matter as much as the intention: pausing to recognize what this day means.',
        ],
      },

      // H2: Celebrating with Others
      {
        type: 'heading',
        level: 2,
        text: 'Celebrating with Others',
        id: 'celebrating-with-others',
      },
      {
        type: 'paragraph',
        content: [
          'Recovery happens in community, and milestones are often best celebrated in community too. But navigating celebrations with family, friends, and loved ones can be complicated — especially if your circle doesn\'t fully understand recovery.',
        ],
      },
      {
        type: 'list',
        style: 'unordered',
        items: [
          'Be direct about what you need: "This is important to me, and I\'d love you to be part of it"',
          'Choose sober-friendly venues and activities — no need to test yourself',
          'Invite your recovery friends alongside family; the two worlds can coexist',
          'If your family doesn\'t understand, don\'t force it. Celebrate with the people who get it',
          'Let your sponsor or home group know about your milestone — they want to celebrate you',
        ],
      },
      {
        type: 'callout',
        title: 'For Supporters',
        text: 'If someone you love is celebrating a recovery milestone, the best gift is presence. Show up. Say "I\'m proud of you." Don\'t ask about the past — celebrate the present.',
        variant: 'tip',
      },

      // H2: Celebrating Alone
      {
        type: 'heading',
        level: 2,
        text: 'Celebrating Alone',
        id: 'celebrating-alone',
      },
      {
        type: 'paragraph',
        content: [
          'Not everyone has a visible support system, and that\'s okay. Many people in recovery — especially those in their first year — celebrate milestones privately. Solo celebration isn\'t lesser; it\'s just different.',
        ],
      },
      {
        type: 'list',
        style: 'unordered',
        items: [
          'Write yourself a letter of acknowledgment — be specific about what you\'re proud of',
          'Take yourself to a place that brings you peace: a park, a café, a trail',
          'Treat yourself to something meaningful (not expensive — meaningful)',
          'Post in an online recovery community if you want witnesses without physical presence',
          'Hold your recovery token and take one minute of silence. You earned this.',
        ],
      },

      // H2: Making It Tangible
      {
        type: 'heading',
        level: 2,
        text: 'Making It Tangible',
        id: 'making-it-tangible',
      },
      {
        type: 'paragraph',
        content: [
          'There\'s a reason ',
          {type: 'link', text: 'recovery tokens', href: '/resources/glossary#term-recovery-token'},
          ' have endured for nearly a century. Physical objects anchor abstract achievements in reality. You can\'t hold "365 days sober" in your hand — but you can hold a ',
          {type: 'link', text: 'medallion', href: '/resources/glossary#term-medallion'},
          ' that represents it.',
        ],
      },
      {
        type: 'paragraph',
        content: [
          'Tangible keepsakes serve as portable reminders. A token in your pocket is a touchstone — literally. When a craving hits, when doubt creeps in, when someone asks "why don\'t you just have one?" — you can reach into your pocket and remember.',
        ],
      },
      {
        type: 'paragraph',
        content: [
          'Journals, framed certificates, photos from celebrations, a ',
          {type: 'link', text: 'pocket piece', href: '/resources/glossary#term-pocket-piece'},
          ' — these things transform an invisible achievement into something you can see, touch, and carry. They make your recovery real in a way that memory alone cannot.',
        ],
      },

      // ProductCTA 1
      {
        type: 'productCTA',
        heading: 'Mark Your Milestone',
        description:
          'Our handcrafted recovery tokens are designed to honor the weight of your achievement. Premium materials, meaningful design, built to carry daily.',
        buttonText: 'Browse All Collections',
        buttonHref: '/collections',
      },

      // ProductCTA 2
      {
        type: 'productCTA',
        heading: 'The Classic Bronze Token',
        description:
          'Die-struck bronze with lasting detail — the most popular choice for marking sobriety milestones that matter.',
        buttonText: 'Shop Bronze Tokens',
        buttonHref: '/collections/bronze-tokens',
      },
    ],
  },

  // Article 6: Supporting Someone in Recovery: A Practical Guide
  {
    id: 'supporting-someone-in-recovery',
    slug: 'supporting-someone-in-recovery',
    title: 'Supporting Someone in Recovery: A Practical Guide',
    category: 'Recovery Guides',
    excerpt:
      'Want to support someone in recovery but not sure how? This practical guide covers what to say, what to avoid, how to respect boundaries, and when to celebrate their milestones.',
    readTime: 8,
    publishedAt: '2025-05-01',
    updatedAt: '2025-05-01',
    metaTitle: 'Supporting Someone in Recovery: A Practical Guide | Recovery Token Store',
    metaDescription:
      'Learn how to support a loved one in recovery. Practical advice on what to say, respecting boundaries, celebrating milestones, and taking care of yourself.',
    keywords: [
      'supporting someone in recovery',
      'how to help someone in recovery',
      'recovery support',
      'family recovery support',
      'sobriety support',
      'loved one in recovery',
    ],
    relatedSlugs: [
      'aa-chips-vs-recovery-tokens',
      'how-to-celebrate-recovery-milestone',
      'symbolism-in-token-design',
    ],
    content: [
      // Opening
      {
        type: 'paragraph',
        content: [
          'Someone you care about is in ',
          {type: 'link', text: 'recovery', href: '/resources/glossary#term-recovery'},
          ', and you want to help. Maybe it\'s your partner, your parent, your child, your best friend, or a coworker. You want to say the right thing, do the right thing — but you\'re terrified of getting it wrong.',
        ],
      },
      {
        type: 'paragraph',
        content: [
          'That fear? It\'s actually a good sign. It means you care enough to be thoughtful. This guide will give you practical, specific tools for showing up — without overstepping, enabling, or making it about you.',
        ],
      },

      // H2: Understanding Recovery
      {
        type: 'heading',
        level: 2,
        text: 'Understanding Recovery',
        id: 'understanding-recovery',
      },
      {
        type: 'paragraph',
        content: [
          'If you haven\'t been through addiction yourself, recovery can look confusing from the outside. Here\'s what\'s important to know:',
        ],
      },
      {
        type: 'paragraph',
        content: [
          {type: 'link', text: 'Recovery', href: '/resources/glossary#term-recovery'},
          ' is not a single event — it\'s a daily practice. There\'s no finish line. Your loved one doesn\'t "graduate" from recovery. They wake up every day and choose it again. Some days that\'s easy. Some days it\'s the hardest thing they\'ve ever done.',
        ],
      },
      {
        type: 'paragraph',
        content: [
          'Recovery often involves meetings (like AA or NA), working with a ',
          {type: 'link', text: 'sponsor', href: '/resources/glossary#term-sponsor'},
          ', step work, therapy, and building new daily habits. It reshapes every aspect of life — relationships, routines, identity, even how someone spends a Saturday night.',
        ],
      },
      {
        type: 'callout',
        title: 'Key Insight',
        text: 'Recovery is not about willpower. Addiction is a complex condition involving brain chemistry, trauma, environment, and genetics. When someone is in recovery, they\'re not just "choosing to stop" — they\'re rewiring their brain and rebuilding their life.',
        variant: 'info',
      },

      // H2: What to Say (and What Not to Say)
      {
        type: 'heading',
        level: 2,
        text: 'What to Say (and What Not to Say)',
        id: 'what-to-say-and-what-not-to-say',
      },
      {
        type: 'paragraph',
        content: [
          'Words matter enormously in recovery. Here are specific examples:',
        ],
      },
      {
        type: 'heading',
        level: 3,
        text: 'Helpful Things to Say',
        id: 'helpful-things-to-say',
      },
      {
        type: 'list',
        style: 'unordered',
        items: [
          '"I\'m proud of you" — simple, direct, powerful',
          '"I\'m here if you need anything" — and mean it',
          '"I don\'t fully understand, but I want to" — honesty builds trust',
          '"What can I do to support you right now?" — let them lead',
          '"Your [30 days / 1 year / etc.] is a big deal" — acknowledge milestones',
        ],
      },
      {
        type: 'heading',
        level: 3,
        text: 'Things to Avoid Saying',
        id: 'things-to-avoid-saying',
      },
      {
        type: 'list',
        style: 'unordered',
        items: [
          '"You can have just one, right?" — never test their sobriety',
          '"You don\'t seem like an addict" — minimizes their experience',
          '"I could never give up drinking" — centers you, not them',
          '"Are you sure you need to go to all those meetings?" — don\'t question their program',
          '"But you seem fine now" — recovery isn\'t about seeming fine',
        ],
      },

      // H2: Practical Ways to Show Support
      {
        type: 'heading',
        level: 2,
        text: 'Practical Ways to Show Support',
        id: 'practical-ways-to-show-support',
      },
      {
        type: 'paragraph',
        content: [
          'Support isn\'t just words — it\'s actions. Here\'s what tangible support looks like:',
        ],
      },
      {
        type: 'list',
        style: 'unordered',
        items: [
          'Attend an open meeting if they invite you — it shows you care about their world',
          'Stop offering them drinks or keeping alcohol front-and-center at gatherings',
          'Respect their schedule — recovery often involves regular meetings, therapy, and self-care time',
          'Celebrate their milestones. Remember their sobriety date the way you remember a birthday',
          'Be patient with the process. Recovery changes people, and the person you knew might evolve',
          'Don\'t gossip about their recovery — it\'s their story to tell, not yours',
        ],
      },
      {
        type: 'callout',
        title: 'The Power of Showing Up',
        text: 'One of the most meaningful things you can do is simply be present. You don\'t need to fix anything, say anything perfect, or understand everything. Just be there. Consistency over time is the greatest gift.',
        variant: 'tip',
      },

      // H2: Setting Your Own Boundaries
      {
        type: 'heading',
        level: 2,
        text: 'Setting Your Own Boundaries',
        id: 'setting-your-own-boundaries',
      },
      {
        type: 'paragraph',
        content: [
          'Supporting someone in recovery doesn\'t mean sacrificing yourself. In fact, the best support comes from people who have healthy boundaries.',
        ],
      },
      {
        type: 'list',
        style: 'unordered',
        items: [
          'You are not their therapist, sponsor, or higher power — you\'re their loved one',
          'It\'s okay to say "I love you, and I can\'t do that for you"',
          'Watch for codependency patterns — are you managing their recovery more than your own life?',
          'Consider Al-Anon, Nar-Anon, or therapy for yourself. Recovery affects the whole family',
          'You can\'t want their recovery more than they do. That\'s a recipe for resentment',
        ],
      },
      {
        type: 'paragraph',
        content: [
          'Taking care of yourself isn\'t selfish — it\'s necessary. You can\'t pour from an empty cup, and supporting someone through recovery is a long journey.',
        ],
      },

      // H2: Milestone Moments
      {
        type: 'heading',
        level: 2,
        text: 'Milestone Moments',
        id: 'milestone-moments',
      },
      {
        type: 'paragraph',
        content: [
          {type: 'link', text: 'Milestones', href: '/resources/glossary#term-anniversary'},
          ' in recovery are significant. They represent real, earned progress. Here\'s how to honor them without overstepping:',
        ],
      },
      {
        type: 'list',
        style: 'unordered',
        items: [
          'Ask them how they want to celebrate — don\'t assume',
          'A handwritten note or card can be more meaningful than a party',
          'Consider a meaningful gift: a custom recovery token with their date, a journal, a book',
          'Don\'t make it about the addiction — celebrate the person they\'re becoming',
          'If they don\'t want to make a big deal of it, respect that. A quiet "I see you" goes far',
        ],
      },
      {
        type: 'paragraph',
        content: [
          'A ',
          {type: 'link', text: 'recovery token', href: '/resources/glossary#term-recovery-token'},
          ' is one of the most thoughtful gifts for a milestone. It says: I recognize what this took, and I wanted you to have something that lasts.',
        ],
      },

      // H2: When Things Get Hard
      {
        type: 'heading',
        level: 2,
        text: 'When Things Get Hard',
        id: 'when-things-get-hard',
      },
      {
        type: 'paragraph',
        content: [
          {type: 'link', text: 'Relapse', href: '/resources/glossary#term-relapse'},
          ' is a possibility in recovery — not a certainty, but a possibility. If it happens, here\'s how to respond:',
        ],
      },
      {
        type: 'list',
        style: 'unordered',
        items: [
          'Don\'t panic. Relapse doesn\'t erase their progress or mean recovery is over',
          'Don\'t shame them. They already feel it. What they need is compassion, not a lecture',
          'Ask: "What do you need right now?" and follow their lead',
          'Encourage them to reach out to their sponsor, therapist, or support network',
          'Remind them that recovery is still possible — many people relapse and come back stronger',
          'Take care of yourself. Their relapse will affect you, and that\'s okay to acknowledge',
        ],
      },
      {
        type: 'callout',
        title: 'Remember',
        text: 'Relapse is not a moral failure. It\'s often a part of the recovery process. What matters most is what happens next. Your response can help determine whether they get back up or stay down.',
        variant: 'info',
      },

      // ProductCTA 1
      {
        type: 'productCTA',
        heading: 'A Gift That Says Everything',
        description:
          'Custom-engraved recovery tokens make a deeply personal milestone gift. Add their sobriety date, a meaningful message, or a symbol that speaks to their journey.',
        buttonText: 'Shop Custom Tokens',
        buttonHref: '/collections/custom-tokens',
      },

      // ProductCTA 2
      {
        type: 'productCTA',
        heading: 'Find the Perfect Token',
        description:
          'Browse our full collection of handcrafted recovery tokens — from classic bronze to premium custom designs, there\'s one for every milestone.',
        buttonText: 'Browse All Collections',
        buttonHref: '/collections',
      },
    ],
  },

  // Article 7: The Science Behind Milestone Marking
  {
    id: 'science-behind-milestone-marking',
    slug: 'science-behind-milestone-marking',
    title: 'The Science Behind Milestone Marking',
    category: 'Recovery Guides',
    excerpt:
      'Why do physical tokens work? The answer is rooted in neuroscience, behavioral psychology, and centuries of ritual practice. Explore the science behind why tangible milestones strengthen recovery.',
    readTime: 8,
    publishedAt: '2025-05-05',
    updatedAt: '2025-05-05',
    metaTitle: 'The Science Behind Milestone Marking | Recovery Token Store',
    metaDescription:
      'Discover the neuroscience and psychology behind why physical recovery tokens work. Learn how tangible milestones reinforce sobriety and support long-term recovery.',
    keywords: [
      'psychology of sobriety milestones',
      'science of recovery tokens',
      'why recovery tokens work',
      'milestone psychology',
      'behavioral reinforcement recovery',
      'neuroscience of sobriety',
    ],
    relatedSlugs: [
      'how-to-celebrate-recovery-milestone',
      'history-of-recovery-tokens',
      'how-recovery-tokens-are-made',
    ],
    content: [
      // Opening
      {
        type: 'paragraph',
        content: [
          'For nearly a century, people in ',
          {type: 'link', text: 'recovery', href: '/resources/glossary#term-recovery'},
          ' have carried small physical tokens to mark their milestones. ',
          {type: 'link', text: 'Sobriety coins', href: '/resources/glossary#term-sobriety-coin'},
          ', ',
          {type: 'link', text: 'medallions', href: '/resources/glossary#term-medallion'},
          ', chips — they come in many forms, but the practice endures. Why?',
        ],
      },
      {
        type: 'paragraph',
        content: [
          'It\'s not just tradition. It\'s science. The effectiveness of physical milestone markers is supported by research in neuroscience, behavioral psychology, identity theory, and anthropology. Understanding why these tokens work doesn\'t diminish their power — it amplifies it.',
        ],
      },

      // H2: The Psychology of Tangible Rewards
      {
        type: 'heading',
        level: 2,
        text: 'The Psychology of Tangible Rewards',
        id: 'the-psychology-of-tangible-rewards',
      },
      {
        type: 'paragraph',
        content: [
          'B.F. Skinner\'s research on operant conditioning established a foundational principle: behaviors followed by positive outcomes are more likely to be repeated. This is the basis of positive reinforcement, and it\'s exactly what happens when someone receives a ',
          {type: 'link', text: 'recovery token', href: '/resources/glossary#term-recovery-token'},
          ' for reaching a milestone.',
        ],
      },
      {
        type: 'paragraph',
        content: [
          'The token acts as a tangible reward — something the brain can associate with the effort of staying sober. Unlike abstract praise ("good job"), a physical object creates a concrete, sensory connection to the achievement. You can see it, touch it, feel its weight. That sensory richness makes the reward signal stronger.',
        ],
      },
      {
        type: 'paragraph',
        content: [
          'This is particularly important in recovery because addiction hijacks the brain\'s natural reward system. Substances flood the brain with dopamine, creating intense associations between the substance and pleasure. Recovery tokens help create new, positive associations — linking sobriety with reward rather than deprivation.',
        ],
      },

      // H2: How the Brain Recovers
      {
        type: 'heading',
        level: 2,
        text: 'How the Brain Recovers',
        id: 'how-the-brain-recovers',
      },
      {
        type: 'paragraph',
        content: [
          'One of the most hopeful discoveries in neuroscience is neuroplasticity — the brain\'s ability to rewire itself. The same brain that was changed by addiction can be changed by recovery.',
        ],
      },
      {
        type: 'paragraph',
        content: [
          'The dopamine system, heavily impacted by substance use, begins to normalize over time in ',
          {type: 'link', text: 'sobriety', href: '/resources/glossary#term-sobriety'},
          '. The prefrontal cortex — responsible for decision-making, impulse control, and long-term planning — gradually regains function. This process is real but slow, often taking 12–18 months of sustained sobriety for significant recovery.',
        ],
      },
      {
        type: 'paragraph',
        content: [
          'Milestone markers support this process by creating positive "checkpoints" for the brain. Each time a milestone is acknowledged with a physical token, the brain registers a reward event. Over time, these events help build new neural pathways that associate sobriety with positive outcomes.',
        ],
      },
      {
        type: 'callout',
        title: 'Brain Healing Timeline',
        text: 'Research shows that many cognitive functions begin improving within weeks of sobriety. But the most significant neurological recovery — particularly in the prefrontal cortex and dopamine system — occurs between 6 and 18 months. Every milestone you mark is literally a checkpoint in your brain\'s healing process.',
        variant: 'info',
      },

      // H2: Identity and Object Association
      {
        type: 'heading',
        level: 2,
        text: 'Identity and Object Association',
        id: 'identity-and-object-association',
      },
      {
        type: 'paragraph',
        content: [
          'Neuroscientist Antonio Damasio\'s somatic marker hypothesis explains how physical objects become linked to emotions and identity. When you carry a recovery token daily, it becomes a "somatic marker" — a physical trigger for the emotions, values, and identity associated with your recovery.',
        ],
      },
      {
        type: 'paragraph',
        content: [
          'This connects to self-concept theory in psychology. Recovery requires a fundamental identity shift: from "person who uses" to "person in recovery." This shift is abstract and fragile, especially in early ',
          {type: 'link', text: 'clean time', href: '/resources/glossary#term-clean-time'},
          '. A physical token makes the new identity concrete. It\'s proof you can see and hold.',
        ],
      },
      {
        type: 'paragraph',
        content: [
          'Every time you reach into your pocket and feel your token, you\'re reinforcing: "I am a person in recovery. I have [X] days. I earned this." That physical act of touching the token anchors the identity in the body, not just the mind.',
        ],
      },

      // H2: The Power of Ritual
      {
        type: 'heading',
        level: 2,
        text: 'The Power of Ritual',
        id: 'the-power-of-ritual',
      },
      {
        type: 'paragraph',
        content: [
          'Anthropologists have studied ritual across every human culture and found a consistent pattern: rituals work. They reduce anxiety, increase group cohesion, and create a sense of meaning and belonging.',
        ],
      },
      {
        type: 'paragraph',
        content: [
          'The chip ceremony in AA — where someone walks to the front of a ',
          {type: 'link', text: 'meeting', href: '/resources/glossary#term-meeting'},
          ', receives their chip, and is applauded by the group — is a perfect example of effective ritual. It combines public recognition, community witnessing, and physical object exchange into a single powerful moment.',
        ],
      },
      {
        type: 'paragraph',
        content: [
          'These ceremonies activate what psychologists call "collective effervescence" — the heightened emotion people feel in group rituals. This emotional energy gets encoded into the object. The chip itself becomes charged with the memory of that moment, the applause, the hugs, the feeling of belonging to something larger than yourself.',
        ],
      },
      {
        type: 'quote',
        text: 'Ritual is not about magic. It\'s about attention. It says: this moment matters enough to mark.',
        attribution: 'Cultural anthropology principle',
      },

      // H2: Breaking Goals into Milestones
      {
        type: 'heading',
        level: 2,
        text: 'Breaking Goals into Milestones',
        id: 'breaking-goals-into-milestones',
      },
      {
        type: 'paragraph',
        content: [
          'Goal-setting theory, developed by Edwin Locke and Gary Latham, has consistently shown that incremental goals with clear markers dramatically increase success rates compared to vague, distant goals.',
        ],
      },
      {
        type: 'paragraph',
        content: [
          '"Stay sober forever" is paralyzing. "',
          {type: 'link', text: 'One day at a time', href: '/resources/glossary#term-one-day-at-a-time'},
          '" is manageable. And each milestone — 24 hours, 30 days, 90 days, 6 months, 1 year — creates a concrete checkpoint that makes the infinite feel achievable.',
        ],
      },
      {
        type: 'paragraph',
        content: [
          'Each milestone also creates what researchers call a "fresh start effect" — the feeling of beginning a new chapter. After reaching 90 days, you\'re not just continuing the same journey; psychologically, you\'re beginning the next phase. The milestone marker makes this transition tangible.',
        ],
      },

      // H2: Why Physical Beats Digital
      {
        type: 'heading',
        level: 2,
        text: 'Why Physical Beats Digital',
        id: 'why-physical-beats-digital',
      },
      {
        type: 'paragraph',
        content: [
          'In a world of apps, notifications, and digital counters, why do physical tokens still matter? The answer lies in embodied cognition — the science of how physical interaction shapes thought.',
        ],
      },
      {
        type: 'paragraph',
        content: [
          'Research shows that physical objects engage more neural pathways than digital ones. When you hold a ',
          {type: 'link', text: 'pocket piece', href: '/resources/glossary#term-pocket-piece'},
          ', your brain processes the weight, texture, temperature, and shape — all creating richer memory encoding than looking at a screen.',
        ],
      },
      {
        type: 'paragraph',
        content: [
          'There\'s also what we might call the "pocket check" effect. Many people in recovery develop the habit of touching their token throughout the day — in their pocket, on their desk, in moments of stress. Each touch is a micro-reinforcement. A sobriety app can\'t be felt in your pocket at 2 AM when a craving hits. A bronze token can.',
        ],
      },
      {
        type: 'callout',
        title: 'The Weight Matters',
        text: 'There\'s a reason premium tokens are made from bronze, not plastic. The weight of the object communicates the weight of the achievement. When something feels substantial in your hand, your brain registers it as significant. Material matters.',
        variant: 'tip',
      },

      // ProductCTA 1
      {
        type: 'productCTA',
        heading: 'Science-Backed, Handcrafted',
        description:
          'Our recovery tokens are designed with purpose — premium weight, meaningful symbols, and lasting materials that your brain and body recognize as significant.',
        buttonText: 'Browse All Collections',
        buttonHref: '/collections',
      },

      // ProductCTA 2
      {
        type: 'productCTA',
        heading: 'Feel the Difference',
        description:
          'Die-struck bronze tokens with real weight and lasting detail. Designed to carry daily, built to last a lifetime of recovery.',
        buttonText: 'Shop Bronze Tokens',
        buttonHref: '/collections/bronze-tokens',
      },
    ],
  },

  // Article 8: Building a Recovery Toolkit
  {
    id: 'building-a-recovery-toolkit',
    slug: 'building-a-recovery-toolkit',
    title: 'Building a Recovery Toolkit',
    category: 'Recovery Guides',
    excerpt:
      'Recovery is more than not using — it\'s building a new life with new tools. From daily practices and support networks to physical anchors and coping strategies, here\'s how to assemble a toolkit that grows with you.',
    readTime: 7,
    publishedAt: '2025-05-10',
    updatedAt: '2025-05-10',
    metaTitle: 'Building a Recovery Toolkit | Recovery Token Store',
    metaDescription:
      'Build a comprehensive recovery toolkit with daily practices, support networks, physical anchors, coping strategies, and an emergency plan. Practical guide for every stage of recovery.',
    keywords: [
      'recovery toolkit',
      'sobriety tools',
      'recovery practices',
      'coping skills recovery',
      'recovery support network',
      'sobriety strategies',
    ],
    relatedSlugs: [
      'science-behind-milestone-marking',
      'how-to-celebrate-recovery-milestone',
      'symbolism-in-token-design',
    ],
    content: [
      // Opening
      {
        type: 'paragraph',
        content: [
          {type: 'link', text: 'Recovery', href: '/resources/glossary#term-recovery'},
          ' is more than the absence of substances. It\'s the presence of something new — new habits, new relationships, new ways of handling the moments that used to send you reaching for a drink or a drug. Building that new life takes tools.',
        ],
      },
      {
        type: 'paragraph',
        content: [
          'A recovery toolkit isn\'t a one-time purchase. It\'s a living collection of practices, people, objects, and strategies that you assemble and refine over time. What works in your first 30 days may look different at 5 years — and that\'s the point. This guide will help you build a toolkit that grows with you.',
        ],
      },

      // H2: Your Daily Practices
      {
        type: 'heading',
        level: 2,
        text: 'Your Daily Practices',
        id: 'your-daily-practices',
      },
      {
        type: 'paragraph',
        content: [
          'Recovery lives in the daily routine. The structure you build into each day is your first line of defense against the chaos that addiction thrives in.',
        ],
      },
      {
        type: 'list',
        style: 'unordered',
        items: [
          'Morning check-in — Before the day hits, take 5 minutes. How are you feeling? What do you need today? Journal it, pray it, or just sit with it',
          'Meditation or mindfulness — Even 5 minutes of stillness trains your brain to observe cravings without acting on them',
          'Daily reading — Recovery literature, daily readers, or any text that grounds you in your values',
          'Journaling — Writing externalizes what\'s inside. It\'s free therapy, and it creates a record of your growth',
          'Evening reflection — How did today go? What are you grateful for? What would you do differently?',
        ],
      },
      {
        type: 'callout',
        title: 'Start Small',
        text: 'You don\'t need to do all of these on day one. Pick one daily practice and commit to it for a week. Then add another. Recovery is built one habit at a time, just like sobriety is built one day at a time.',
        variant: 'tip',
      },

      // H2: Your Support Network
      {
        type: 'heading',
        level: 2,
        text: 'Your Support Network',
        id: 'your-support-network',
      },
      {
        type: 'paragraph',
        content: [
          'Addiction isolates. Recovery connects. The people in your life are among the most powerful tools you have.',
        ],
      },
      {
        type: 'list',
        style: 'unordered',
        items: [
          'A sponsor — Someone who has walked the path before you and can guide you through the steps. Your sponsor is your first call when things get hard',
          'A home group — A regular meeting where people know your name, your story, and your face. Your home group is your recovery family',
          'Sober friends — People who prove that fun, connection, and depth exist without substances',
          'A therapist or counselor — Professional support for trauma, mental health, and the emotional work that recovery surfaces',
          'Online communities — For those without local access, or as a supplement. Recovery forums, Discord servers, and social media communities can bridge the gap',
        ],
      },
      {
        type: 'paragraph',
        content: [
          'Your ',
          {type: 'link', text: 'sponsor', href: '/resources/glossary#term-sponsor'},
          ', your ',
          {type: 'link', text: 'home group', href: '/resources/glossary#term-home-group'},
          ', the ',
          {type: 'link', text: 'fellowship', href: '/resources/glossary#term-fellowship'},
          ' — these aren\'t optional extras. They\'re the foundation your recovery stands on.',
        ],
      },

      // H2: Your Physical Anchors
      {
        type: 'heading',
        level: 2,
        text: 'Your Physical Anchors',
        id: 'your-physical-anchors',
      },
      {
        type: 'paragraph',
        content: [
          'Recovery is abstract. It happens inside — in your thoughts, your choices, your neural pathways. Physical anchors make it concrete. They give you something to hold when the invisible work feels overwhelming.',
        ],
      },
      {
        type: 'list',
        style: 'unordered',
        items: [
          'Recovery tokens — A daily carry that represents your milestone. The weight in your pocket is a constant reminder of what you\'ve built',
          'Your journal — Not just a practice, but an object. The filled pages are physical evidence of your journey',
          'Recovery literature — Books that have shaped your understanding. Dog-eared, highlighted, carried in your bag',
          'Daily readers — A small book with a passage for each day. Many people read theirs every morning like ritual',
          'Photos or keepsakes — Anything that connects you to why you chose recovery. A photo of your kids, a letter from your sponsor, your first chip',
        ],
      },
      {
        type: 'paragraph',
        content: [
          'A ',
          {type: 'link', text: 'recovery token', href: '/resources/glossary#term-recovery-token'},
          ' or ',
          {type: 'link', text: 'pocket piece', href: '/resources/glossary#term-pocket-piece'},
          ' is the quintessential physical anchor. It\'s small enough to carry everywhere, meaningful enough to ground you in a crisis, and durable enough to last your entire recovery.',
        ],
      },

      // H2: Your Coping Strategies
      {
        type: 'heading',
        level: 2,
        text: 'Your Coping Strategies',
        id: 'your-coping-strategies',
      },
      {
        type: 'paragraph',
        content: [
          {type: 'link', text: 'Triggers', href: '/resources/glossary#term-triggers'},
          ' are inevitable. What matters is how you respond. ',
          {type: 'link', text: 'Coping skills', href: '/resources/glossary#term-coping-skills'},
          ' are the tools that stand between a trigger and a relapse.',
        ],
      },
      {
        type: 'paragraph',
        content: [
          'HALT is one of the most useful frameworks in recovery. Before reacting to a craving or emotional spiral, check: Am I Hungry? Angry? Lonely? Tired? Often, the craving isn\'t about the substance — it\'s about an unmet basic need.',
        ],
      },
      {
        type: 'list',
        style: 'unordered',
        items: [
          'Identify your triggers — Make a list. People, places, emotions, times of day. Know your battlefield',
          'Practice grounding techniques — The 5-4-3-2-1 method (five things you see, four you touch, three you hear, two you smell, one you taste) pulls you out of craving and into the present',
          'Move your body — Walk, run, stretch, swim. Physical movement interrupts the craving cycle and releases natural endorphins',
          'Call before you drink/use — Your sponsor, a sober friend, a hotline. Cravings lose power when spoken out loud',
          'Play the tape forward — When romanticizing substance use, play the full movie: the morning after, the shame, the consequences. Not just the first drink, but the tenth',
        ],
      },

      // H2: Your Emergency Plan
      {
        type: 'heading',
        level: 2,
        text: 'Your Emergency Plan',
        id: 'your-emergency-plan',
      },
      {
        type: 'paragraph',
        content: [
          'Even with the best daily practices and strongest support network, there will be moments of crisis. Having an emergency plan means you don\'t have to think clearly when thinking clearly is hardest.',
        ],
      },
      {
        type: 'list',
        style: 'ordered',
        items: [
          'Reach for your token — Feel it in your hand. Remember what it represents. Breathe.',
          'Call your sponsor — If they don\'t answer, call the next person on your list',
          'Call a sober friend or someone from your home group',
          'Go to a meeting — Use a meeting finder app. There\'s almost always one happening within the hour',
          'If you\'re in immediate danger, call SAMHSA\'s National Helpline: 1-800-662-4357 (free, confidential, 24/7)',
          'Remove yourself from the triggering situation. Leave the party, the bar, the room. Your sobriety is more important than politeness',
        ],
      },
      {
        type: 'callout',
        title: 'Write It Down',
        text: 'Write your emergency plan on an index card and keep it with your recovery token. When a crisis hits, you won\'t be able to think straight — but you can read a card. Phone numbers, steps to take, a reminder of why you chose this path.',
        variant: 'tip',
      },

      // H2: Growing Your Toolkit Over Time
      {
        type: 'heading',
        level: 2,
        text: 'Growing Your Toolkit Over Time',
        id: 'growing-your-toolkit-over-time',
      },
      {
        type: 'paragraph',
        content: [
          'Your toolkit in early recovery will look different from your toolkit at 5 or 10 years — and it should. As you grow, your needs change.',
        ],
      },
      {
        type: 'paragraph',
        content: [
          'In early recovery, your toolkit is survival-focused: meetings, sponsor, basic routines, an emergency plan. You\'re learning to walk again. The tools are practical and immediate.',
        ],
      },
      {
        type: 'paragraph',
        content: [
          'In mid recovery, you start adding depth: therapy for underlying issues, deeper step work, new hobbies and interests, service to others. Your toolkit expands because your capacity expands.',
        ],
      },
      {
        type: 'paragraph',
        content: [
          'In long-term recovery, the toolkit becomes about growth and meaning: mentoring ',
          {type: 'link', text: 'newcomers', href: '/resources/glossary#term-newcomer'},
          ', pursuing goals that addiction made impossible, deepening spiritual practice, giving back to the community that saved your life.',
        ],
      },
      {
        type: 'paragraph',
        content: [
          'At every stage, physical anchors remain. Your ',
          {type: 'link', text: 'one day at a time', href: '/resources/glossary#term-one-day-at-a-time'},
          ' token from early recovery sits next to your 10-year medallion. The collection grows. The toolkit grows. And so do you.',
        ],
      },

      // ProductCTA 1
      {
        type: 'productCTA',
        heading: 'Add to Your Toolkit',
        description:
          'Custom-engraved recovery tokens are more than keepsakes — they\'re daily-carry tools for grounding, motivation, and identity. Add your date, your message, your symbol.',
        buttonText: 'Shop Custom Tokens',
        buttonHref: '/collections/custom-tokens',
      },

      // ProductCTA 2
      {
        type: 'productCTA',
        heading: 'Start Your Collection',
        description:
          'From your first chip to your annual milestone token — browse our full range of handcrafted recovery tokens designed to grow with your journey.',
        buttonText: 'Browse All Collections',
        buttonHref: '/collections',
      },
    ],
  },
];
