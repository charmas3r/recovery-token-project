/**
 * Seed Script: Design Spotlight Articles → Sanity.io
 *
 * Creates 6 "Design Spotlight" articles with rich content blocks
 * including headings, paragraphs, quotes, callouts, product CTAs,
 * and cross-references to existing articles.
 *
 * Usage: SANITY_WRITE_TOKEN=<token> npx tsx scripts/seed-design-articles.ts
 */

import {createClient} from '@sanity/client';

const client = createClient({
  projectId: '7yuseyfn',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN,
});

if (!process.env.SANITY_WRITE_TOKEN) {
  console.error(
    'Error: SANITY_WRITE_TOKEN environment variable is required.',
  );
  console.error(
    'Usage: SANITY_WRITE_TOKEN=<token> npx tsx scripts/seed-design-articles.ts',
  );
  process.exit(1);
}

function generateKey(): string {
  return Math.random().toString(36).slice(2, 10);
}

function heading(
  level: 2 | 3,
  text: string,
  id: string,
): Record<string, unknown> {
  return {
    _type: 'headingBlock',
    _key: generateKey(),
    level,
    text,
    id: {_type: 'slug', current: id},
  };
}

function paragraph(text: string): Record<string, unknown> {
  return {
    _type: 'paragraphBlock',
    _key: generateKey(),
    content: [
      {
        _type: 'block',
        _key: generateKey(),
        style: 'normal',
        children: [{_type: 'span', _key: generateKey(), text, marks: []}],
        markDefs: [],
      },
    ],
  };
}

function quote(
  text: string,
  attribution?: string,
): Record<string, unknown> {
  return {
    _type: 'quoteBlock',
    _key: generateKey(),
    text,
    ...(attribution ? {attribution} : {}),
  };
}

function callout(
  title: string,
  text: string,
  variant: 'info' | 'tip' = 'info',
): Record<string, unknown> {
  return {
    _type: 'calloutBlock',
    _key: generateKey(),
    title,
    text,
    variant,
  };
}

function productCTA(
  heading: string,
  description: string,
  buttonText: string,
  buttonHref: string,
): Record<string, unknown> {
  return {
    _type: 'productCTABlock',
    _key: generateKey(),
    heading,
    description,
    buttonText,
    buttonHref,
  };
}

function list(
  items: string[],
  style: 'ordered' | 'unordered' = 'unordered',
): Record<string, unknown> {
  return {
    _type: 'listBlock',
    _key: generateKey(),
    style,
    items,
  };
}

// --- Article Definitions ---

const DESIGN_ARTICLES = [
  {
    slug: 'mandala-token-design',
    title: 'The Mandala Token: Circles of Wholeness',
    excerpt:
      'Explore the ancient symbolism of the mandala and how its concentric circles represent the journey toward inner wholeness in recovery.',
    readTime: 6,
    publishedAt: '2025-06-15',
    updatedAt: '2025-06-15',
    metaTitle:
      'The Mandala Token: Circles of Wholeness — Recovery Token Store',
    metaDescription:
      'Discover the symbolism behind the mandala recovery token design — concentric circles representing wholeness, balance, and the journey of recovery.',
    keywords: [
      'mandala token',
      'recovery token design',
      'mandala symbolism',
      'sobriety coin design',
      'recovery art',
    ],
    relatedSlugs: [
      'symbolism-in-token-design',
      'sacred-geometry-token-design',
    ],
    content: [
      heading(2, 'The Mandala: An Ancient Symbol of Wholeness', 'ancient-symbol'),
      paragraph(
        'The mandala — from the Sanskrit word for "circle" — has been used for thousands of years across cultures as a symbol of the universe, wholeness, and the journey inward. In Buddhism, Hinduism, and Indigenous traditions worldwide, mandalas represent the idea that life is never-ending and that everything is connected.',
      ),
      paragraph(
        'When we chose the mandala as one of our signature token designs, we were drawn to its profound resonance with the recovery journey. Recovery is not a straight line — it is a process of returning, again and again, to your center.',
      ),
      heading(2, 'Concentric Circles: Layers of Growth', 'concentric-circles'),
      paragraph(
        'Our mandala token features concentric circles radiating outward from a central point. Each ring represents a layer of growth in recovery: the innermost circle is the self, the core of your identity that you rediscover in sobriety. Moving outward, the circles represent your relationships, your community, your purpose, and your connection to something larger than yourself.',
      ),
      quote(
        'The mandala is the path. It is the path to the center of your own heart.',
        'Joseph Campbell',
      ),
      heading(3, 'The Geometry of Balance', 'geometry-of-balance'),
      paragraph(
        'Every element of the mandala is balanced — symmetrical across multiple axes. This geometric harmony reflects the balance that recovery cultivates: between vulnerability and strength, between solitude and community, between discipline and self-compassion.',
      ),
      callout(
        'Design Detail',
        'Each mandala token is cast with 8-fold symmetry, a pattern found in nature from snowflakes to flower petals. The number 8 in many traditions symbolizes new beginnings and regeneration.',
        'tip',
      ),
      heading(2, 'Crafting the Mandala in Bronze', 'crafting-in-bronze'),
      paragraph(
        'Translating the intricate geometry of a mandala into a hand-held bronze token required months of design iteration. The challenge was preserving the fine detail of the concentric patterns while ensuring the token feels substantial and tactile in the hand. The raised lines of each ring create a texture you can feel with your thumb — a physical reminder of the layers of growth you carry with you.',
      ),
      paragraph(
        'The bronze patina that develops over time adds another dimension to the mandala metaphor. As your token ages alongside your recovery, it becomes uniquely yours — each patina pattern as individual as your journey.',
      ),
      heading(2, 'The Mandala in Your Recovery Practice', 'recovery-practice'),
      paragraph(
        'Many token holders describe using their mandala token as a meditation focus. Tracing the concentric circles with your finger becomes a centering practice — a way to ground yourself in the present moment when challenges arise. The circular design has no beginning and no end, a reminder that recovery is an ongoing practice, not a destination.',
      ),
      productCTA(
        'Carry Your Wholeness',
        'The mandala token is available in bronze with a hand-finished patina. Each token is individually cast and inspected.',
        'View Mandala Tokens',
        '/collections',
      ),
    ],
  },
  {
    slug: 'sunflower-token-design',
    title: 'The Sunflower Token: Growing Toward the Light',
    excerpt:
      'The sunflower has long symbolized hope, loyalty, and turning toward the light. Learn how this design embodies the spirit of recovery.',
    readTime: 5,
    publishedAt: '2025-06-22',
    updatedAt: '2025-06-22',
    metaTitle:
      'The Sunflower Token: Growing Toward the Light — Recovery Token Store',
    metaDescription:
      'Learn about the sunflower recovery token — a symbol of hope, loyalty, and the courage to grow toward the light in your recovery journey.',
    keywords: [
      'sunflower token',
      'recovery token design',
      'sunflower symbolism',
      'hope in recovery',
      'sobriety token',
    ],
    relatedSlugs: [
      'symbolism-in-token-design',
      'color-milestone-meanings',
    ],
    content: [
      heading(2, 'Why the Sunflower?', 'why-sunflower'),
      paragraph(
        'Of all the flowers in the natural world, the sunflower is unique in its behavior: it turns to face the sun throughout the day, a phenomenon called heliotropism. This instinct to orient toward light — toward warmth and growth — is a powerful metaphor for recovery. In your darkest moments, you made the choice to turn toward the light. The sunflower token honors that courage.',
      ),
      heading(2, 'A Symbol Across Cultures', 'symbol-across-cultures'),
      paragraph(
        'Sunflowers have carried deep meaning across civilizations. In Greek mythology, the nymph Clytie was transformed into a sunflower, forever turning toward her beloved Apollo, the sun god — a story of devotion and constancy. The Incas used sunflowers as symbols of their sun god Inti. In Chinese culture, sunflowers represent good fortune, vitality, and long life.',
      ),
      paragraph(
        'In the modern recovery community, sunflowers have become an unofficial symbol of hope and positive growth. You will find them in recovery art, literature, and meeting spaces — a reminder that growth is always possible when you turn toward the light.',
      ),
      quote(
        'Keep your face always toward the sunshine, and shadows will fall behind you.',
        'Walt Whitman',
      ),
      heading(2, 'Design Elements', 'design-elements'),
      paragraph(
        'Our sunflower token captures the flower in full bloom, with 21 petals radiating from a detailed center seed pattern. The Fibonacci spiral visible in the seed head is not just beautiful — it represents the mathematical order underlying all natural growth. Even in what appears to be chaos, there is a pattern. Even in the turbulence of early recovery, there is a path forward.',
      ),
      callout(
        'Did You Know?',
        'The seed pattern in a sunflower head follows the Fibonacci sequence — the same mathematical pattern found in seashells, galaxies, and DNA. We preserved this pattern in our token design as a symbol of the natural order that supports recovery.',
        'info',
      ),
      heading(3, 'The Back Face', 'back-face'),
      paragraph(
        'The reverse side of the sunflower token features a single stem with two leaves, representing the grounding and support system that makes growth possible. No sunflower grows without roots. No recovery flourishes without a foundation of support — sponsors, meetings, loved ones, practices that keep you grounded.',
      ),
      heading(2, 'Carrying the Light', 'carrying-the-light'),
      paragraph(
        'The sunflower token is one of our most popular designs, especially among those in their first year of recovery. Its message is simple and powerful: you have the innate capacity to grow toward the light. Every day you choose recovery, you are turning your face toward the sun.',
      ),
      productCTA(
        'Grow Toward the Light',
        'The sunflower token is available in bronze and silver finishes, each hand-cast with exquisite petal detail.',
        'Shop Sunflower Tokens',
        '/collections',
      ),
    ],
  },
  {
    slug: 'why-bronze-casting',
    title: 'Bronze as a Medium: Why We Cast in Bronze',
    excerpt:
      'Discover why we chose bronze as our primary medium — its 5,000-year history, natural warmth, and the way it develops character over time.',
    readTime: 7,
    publishedAt: '2025-07-01',
    updatedAt: '2025-07-01',
    metaTitle:
      'Why We Cast in Bronze — Recovery Token Store',
    metaDescription:
      'Learn why bronze is the ideal medium for recovery tokens — 5,000 years of heritage, natural warmth, and a living patina that evolves with your journey.',
    keywords: [
      'bronze casting',
      'recovery token materials',
      'bronze patina',
      'lost wax casting',
      'token craftsmanship',
    ],
    relatedSlugs: [
      'how-recovery-tokens-are-made',
      'mandala-token-design',
    ],
    content: [
      heading(2, 'Five Thousand Years of Bronze', 'five-thousand-years'),
      paragraph(
        'Bronze is one of the first metals humans learned to work with, dating back to roughly 3300 BCE. The Bronze Age transformed civilization — enabling tools, art, currency, and monuments that have survived millennia. When you hold a bronze recovery token, you are holding a material with a lineage stretching back to the very beginnings of human craft.',
      ),
      paragraph(
        'We chose bronze deliberately. In a world of disposable goods and fleeting digital tokens, a bronze recovery token is an object of permanence. It is made to last not just years, but lifetimes.',
      ),
      heading(2, 'The Properties of Bronze', 'properties'),
      paragraph(
        'Bronze is an alloy of copper and tin, and this combination gives it remarkable properties that make it ideal for recovery tokens.',
      ),
      list([
        'Warmth: Bronze naturally warms to body temperature, making it feel alive in your hand.',
        'Weight: The density of bronze gives each token a satisfying heft — substantial enough to feel meaningful in your pocket.',
        'Durability: Bronze resists corrosion and wear. Tokens will endure years of daily handling without losing their detail.',
        'Patina: Over time, bronze develops a unique surface character that tells the story of its use.',
      ]),
      heading(2, 'The Lost-Wax Process', 'lost-wax-process'),
      paragraph(
        'Each recovery token is cast using a variation of the lost-wax process — the same technique used to create bronze sculptures in museums and ancient temples. A master pattern is carved, then a wax replica is made and coated in a ceramic shell. When the shell is heated, the wax melts away, leaving a perfect mold for molten bronze.',
      ),
      paragraph(
        'This process allows us to capture extraordinary detail — the fine lines of a mandala pattern, the individual petals of a sunflower, the texture of hand-lettered inscriptions. Each token emerges from the mold as a unique object, with subtle variations that mass production cannot replicate.',
      ),
      quote(
        'Bronze has a memory. It remembers the shape of what it was asked to hold.',
        'An anonymous bronze caster',
      ),
      heading(2, 'The Living Patina', 'living-patina'),
      paragraph(
        'Perhaps the most compelling property of bronze is its patina — the surface color that develops through exposure to air, moisture, and the oils from your skin. A new bronze token starts with a warm, golden-brown color. Over weeks and months of handling, it develops deeper tones: rich browns, subtle greens, and warm ambers.',
      ),
      callout(
        'Your Unique Patina',
        'No two patinas are identical. The patina on your token is influenced by your skin chemistry, your environment, and how you carry it. After a year, your token will look different from every other token in the world — a physical record of your unique journey.',
        'tip',
      ),
      paragraph(
        'Many of our customers tell us that watching their token develop its patina becomes part of their recovery practice. The gradual change is a visible metaphor for the transformation happening within — slow, steady, and beautiful.',
      ),
      heading(2, 'Bronze in the Recovery Tradition', 'recovery-tradition'),
      paragraph(
        'The tradition of metal recovery tokens dates back to the early days of Alcoholics Anonymous, when members would carry coins or medallions as tangible reminders of their commitment. The weight of metal in the pocket served as a constant, physical touchpoint — something to reach for in moments of temptation or doubt.',
      ),
      paragraph(
        'We honor this tradition while elevating the craft. Every recovery token we produce is designed to be not just a marker of time, but a work of art that you are proud to carry — a tangible symbol of the extraordinary courage it takes to choose recovery, one day at a time.',
      ),
      productCTA(
        'Experience Bronze',
        'Hold the warmth of five thousand years of craft in your hand. Each token is individually cast and inspected.',
        'Browse Our Collection',
        '/collections',
      ),
    ],
  },
  {
    slug: 'serenity-prayer-token-design',
    title: 'The Serenity Prayer Token: Words That Carry Weight',
    excerpt:
      'The Serenity Prayer has guided millions in recovery. Learn how we translated these timeless words into a token you can carry every day.',
    readTime: 5,
    publishedAt: '2025-07-10',
    updatedAt: '2025-07-10',
    metaTitle:
      'The Serenity Prayer Token Design — Recovery Token Store',
    metaDescription:
      'Discover the design story behind the Serenity Prayer recovery token — how timeless words were translated into a hand-cast bronze token for daily carry.',
    keywords: [
      'serenity prayer token',
      'serenity prayer coin',
      'recovery prayer',
      'AA token design',
      'sobriety coin',
    ],
    relatedSlugs: [
      'history-of-recovery-tokens',
      'aa-chips-vs-recovery-tokens',
    ],
    content: [
      heading(2, 'The Most Spoken Words in Recovery', 'most-spoken-words'),
      paragraph(
        '"God, grant me the serenity to accept the things I cannot change, courage to change the things I can, and wisdom to know the difference." These words, attributed to theologian Reinhold Niebuhr, have been spoken at the close of countless recovery meetings since the 1940s. For many in recovery, they are the first words that offered a path through the chaos.',
      ),
      paragraph(
        'Translating words this meaningful into a physical object required care and intention. Every design decision — the typeface, the layout, the weight of the lines — was made in service of honoring these words and the millions of people who rely on them.',
      ),
      heading(2, 'Typography as Art', 'typography-as-art'),
      paragraph(
        'The text on the Serenity Prayer token is hand-lettered, not typeset. We worked with a lettering artist to create custom letterforms that balance elegance with readability at the small scale of a token. Each word is carefully spaced so that the prayer can be read clearly, even worn around the neck or held at arm\'s length.',
      ),
      callout(
        'Design Detail',
        'The three key concepts — Serenity, Courage, and Wisdom — are given slightly more visual weight than the surrounding text, allowing the eye to land on them first. This reflects how many people use the prayer: as a quick centering tool, focusing on one concept at a time.',
        'tip',
      ),
      heading(2, 'The Border Design', 'border-design'),
      paragraph(
        'Encircling the text is a continuous border of interlocking olive branches — an ancient symbol of peace and victory. The branches form an unbroken ring, representing the continuity of the recovery journey and the peace that the prayer invokes. The olive branch motif also connects to the broader history of recovery symbolism, where peace and surrender are not weakness but profound strength.',
      ),
      heading(3, 'The Reverse Side', 'reverse-side'),
      paragraph(
        'The back of the Serenity Prayer token is left intentionally simple: a smooth, polished surface with a small engraving area for personalization. Many customers choose to engrave their sobriety date, initials, or a personal mantra. This blank canvas represents the future — the pages of your story yet to be written.',
      ),
      heading(2, 'A Prayer in Your Pocket', 'prayer-in-pocket'),
      paragraph(
        'The Serenity Prayer token is our most frequently gifted design. Sponsors give it to sponsees. Parents give it to children beginning their recovery. Friends tuck it into cards and care packages. The token transforms the prayer from spoken words into a physical object — something you can hold, something that holds you.',
      ),
      quote(
        'I keep my Serenity Prayer token in my left pocket. When things get hard, I reach in and feel the words under my thumb. It brings me back.',
        'A Recovery Token Store customer',
      ),
      productCTA(
        'Carry the Words',
        'The Serenity Prayer token is available with custom engraving on the reverse. A meaningful gift for anyone in recovery.',
        'View Serenity Prayer Tokens',
        '/collections',
      ),
    ],
  },
  {
    slug: 'color-milestone-meanings',
    title: 'Color and Meaning: The Spectrum of Recovery Milestones',
    excerpt:
      'From white for a new beginning to gold for decades of sobriety, every color in recovery tokens carries deep meaning. Learn the full spectrum.',
    readTime: 6,
    publishedAt: '2025-07-18',
    updatedAt: '2025-07-18',
    metaTitle:
      'Recovery Milestone Colors and Their Meanings — Recovery Token Store',
    metaDescription:
      'Learn what each color means in recovery tokens and sobriety coins — from white (new beginnings) to gold (long-term sobriety). The full color spectrum explained.',
    keywords: [
      'recovery token colors',
      'sobriety coin colors',
      'AA chip colors',
      'milestone colors',
      'recovery milestones',
    ],
    relatedSlugs: [
      'history-of-recovery-tokens',
      'how-to-celebrate-recovery-milestone',
    ],
    content: [
      heading(2, 'A Language of Color', 'language-of-color'),
      paragraph(
        'In the recovery community, colors speak. A white chip needs no explanation in a meeting room — everyone knows it represents a fresh start, a declaration of intent. A gold medallion tells a story of years of perseverance. This color language has evolved over decades, and while variations exist between different groups and organizations, a broadly recognized spectrum has emerged.',
      ),
      paragraph(
        'When designing our tokens, we studied this tradition carefully. Each enamel color we use is chosen to honor the established meanings while bringing a fresh aesthetic to the tokens. Here is the story behind each color.',
      ),
      heading(2, 'White: The Courage to Begin', 'white'),
      paragraph(
        'White represents the blank page — a new beginning. In many programs, a white chip is given (or taken) at the very first meeting. It requires no time; it requires only the willingness to try. The white token is perhaps the most powerful in the entire spectrum, because it represents the hardest step: admitting you need help and choosing to begin.',
      ),
      heading(2, 'Red: 30 Days', 'red'),
      paragraph(
        'Red is the color of passion, urgency, and life force. At 30 days, you have survived the most acute physical and emotional challenges of early sobriety. Red honors the fire it took to get through those first weeks — the raw courage of early recovery.',
      ),
      heading(2, 'Gold/Amber: 60 Days', 'gold-amber'),
      paragraph(
        'Gold or amber at the 60-day mark represents the first rays of dawn. The crisis of the earliest days has passed, and a new clarity is beginning to emerge. This warm color symbolizes the growing warmth of hope.',
      ),
      heading(2, 'Green: 90 Days', 'green'),
      paragraph(
        'Green is the color of growth, renewal, and nature. At 90 days, the foundations of a new life are taking root. New habits are forming, relationships are mending, and the world is beginning to look different. Green honors this season of growth.',
      ),
      heading(2, 'Blue: 6 Months', 'blue'),
      paragraph(
        'Blue represents depth, trust, and serenity. At six months, recovery deepens from survival mode into genuine transformation. The blue token marks the moment when sobriety begins to feel less like a battle and more like a way of life.',
      ),
      heading(2, 'Purple: 9 Months', 'purple'),
      paragraph(
        'Purple, historically associated with nobility and spiritual wisdom, marks the nine-month milestone. This is a period of deepening self-knowledge, of understanding not just how to stay sober but why sobriety matters to you personally.',
      ),
      heading(2, 'Bronze: 1 Year', 'bronze-one-year'),
      paragraph(
        'The one-year bronze token is a watershed moment. Bronze — the material we cast our premium tokens in — represents endurance, warmth, and timelessness. One year of sobriety is an extraordinary achievement, and the bronze token is designed to be an object worthy of that achievement.',
      ),
      callout(
        'The Birthday Tradition',
        'Many recovery groups celebrate "birthdays" — the anniversary of one\'s sobriety date. The one-year bronze token is often presented at a birthday meeting, with the group offering congratulations and encouragement. It is one of the most emotionally powerful rituals in recovery.',
        'info',
      ),
      heading(2, 'Beyond One Year', 'beyond-one-year'),
      paragraph(
        'After the first year, tokens are typically marked by year count rather than color alone. However, many programs use special colors for significant anniversaries: silver for 5 years, gold for 10, and special editions for 15, 20, 25 years and beyond. Each represents not just time, but the accumulated wisdom, gratitude, and service that long-term recovery makes possible.',
      ),
      heading(2, 'How We Use Color in Our Designs', 'our-color-approach'),
      paragraph(
        'In our token collection, we use hand-applied enamel to bring color to our bronze designs. Each color is mixed by hand and applied in thin layers, building up depth and richness. The combination of warm bronze and vivid enamel creates tokens that are both traditional and contemporary — honoring the legacy while creating something beautiful enough to carry with pride.',
      ),
      productCTA(
        'Find Your Color',
        'Explore our full collection of milestone tokens, from 24-hour white to multi-year gold.',
        'Shop by Milestone',
        '/collections',
      ),
    ],
  },
  {
    slug: 'sacred-geometry-token-design',
    title: 'Sacred Geometry in Token Design: Patterns of Strength',
    excerpt:
      'From the Flower of Life to the golden ratio, sacred geometry patterns appear throughout our token designs. Discover the meaning behind the mathematics.',
    readTime: 6,
    publishedAt: '2025-07-25',
    updatedAt: '2025-07-25',
    metaTitle:
      'Sacred Geometry in Recovery Token Design — Recovery Token Store',
    metaDescription:
      'Explore how sacred geometry patterns — the Flower of Life, golden ratio, and more — are woven into recovery token designs as symbols of strength and order.',
    keywords: [
      'sacred geometry',
      'token design',
      'flower of life',
      'golden ratio',
      'recovery symbolism',
    ],
    relatedSlugs: [
      'mandala-token-design',
      'symbolism-in-token-design',
    ],
    content: [
      heading(2, 'The Mathematics of Meaning', 'mathematics-of-meaning'),
      paragraph(
        'Sacred geometry is the study of geometric patterns that appear throughout nature, art, and architecture — patterns that many cultures have imbued with spiritual or philosophical significance. From the spiral of a nautilus shell to the hexagonal cells of a beehive, these patterns suggest an underlying order to the universe. In our token designs, we use sacred geometry as a visual language for the order and beauty that recovery can bring to a life that once felt chaotic.',
      ),
      heading(2, 'The Flower of Life', 'flower-of-life'),
      paragraph(
        'The Flower of Life is perhaps the most recognized sacred geometry pattern: a series of evenly-spaced, overlapping circles arranged in a hexagonal grid. It appears in ancient temples from Egypt to China and has been found etched into stone dating back at least 6,000 years.',
      ),
      paragraph(
        'We incorporate the Flower of Life pattern into several of our token designs because of what it represents: interconnection. Each circle in the pattern overlaps with its neighbors — no circle exists in isolation. This mirrors the recovery community, where each person\'s journey overlaps with and supports others. The pattern also contains within it every other geometric form — the triangle, square, hexagon, and more — suggesting that from a simple, repeated practice (like daily recovery), infinite possibilities emerge.',
      ),
      callout(
        'Look Closely',
        'The Flower of Life pattern on our tokens contains hidden shapes: the Seed of Life (7 circles), the Tree of Life (10 nodes), and the Vesica Piscis (the almond shape where two circles overlap). Each has its own rich symbolism related to creation, growth, and unity.',
        'tip',
      ),
      heading(2, 'The Golden Ratio', 'golden-ratio'),
      paragraph(
        'The golden ratio — approximately 1.618 — is a mathematical proportion found throughout nature, from the spiral of a galaxy to the arrangement of petals in a rose. It has been used by artists and architects for centuries because shapes based on this ratio feel inherently balanced and beautiful to the human eye.',
      ),
      paragraph(
        'In our token design process, we use the golden ratio to determine proportions: the relationship between text and imagery, the spacing of border elements, and the overall composition of each face. The result is tokens that feel harmonious even before you consciously register why. This invisible structure mirrors the way a solid recovery program provides structure that supports your life without constraining it.',
      ),
      heading(2, 'Triangles and Trinity', 'triangles-trinity'),
      paragraph(
        'The triangle is one of the most common symbols in recovery, representing the three-part foundations found in many programs: Unity, Service, and Recovery in AA; body, mind, and spirit in holistic approaches. Geometrically, the triangle is the strongest structural shape — three points create a form that cannot be deformed without breaking.',
      ),
      paragraph(
        'Several of our token designs feature triangular elements, from subtle three-point compositions to prominent equilateral triangles. We use the triangle as a reminder that strength comes from balance — not from any single element, but from the harmony of three.',
      ),
      heading(2, 'Spirals: The Shape of Growth', 'spirals'),
      paragraph(
        'The spiral is the shape of growth in nature — from unfurling ferns to the arms of spiral galaxies. Unlike a circle, which returns to its starting point, a spiral moves outward with each revolution. It revisits the same angles but at an ever-greater distance from the center.',
      ),
      quote(
        'Recovery is not a circle — you do not end up where you started. It is a spiral. You revisit the same challenges, but each time from a higher vantage point.',
      ),
      paragraph(
        'Our spiral-inspired token designs capture this upward movement. The logarithmic spiral on our growth token follows the same mathematical curve as a nautilus shell — a creature that has built its expanding home one chamber at a time for 500 million years. If that is not a metaphor for taking it one day at a time, nothing is.',
      ),
      heading(2, 'Geometry as Meditation', 'geometry-meditation'),
      paragraph(
        'Beyond their symbolic meaning, the geometric patterns on our tokens serve a practical purpose: they provide a focus for contemplation. Running your finger along the interlocking circles of a Flower of Life pattern, or tracing the spiral of a growth token, can become a meditative practice — a way to quiet the mind and return to the present moment.',
      ),
      paragraph(
        'The regularity and predictability of geometric patterns have been shown to have a calming effect on the nervous system. In moments of stress or craving, the simple act of holding your token and tracing its patterns can serve as a grounding technique — math and meaning, working together in the palm of your hand.',
      ),
      productCTA(
        'Discover the Patterns',
        'Explore our collection of sacred geometry tokens — each design grounded in thousands of years of mathematical beauty.',
        'Shop Geometry Tokens',
        '/collections',
      ),
    ],
  },
];

// --- Create Articles ---

async function seedDesignArticles() {
  console.log('Starting Design Spotlight article seeding...');
  console.log(`Articles to create: ${DESIGN_ARTICLES.length}\n`);

  // Pass 1: Create articles without references
  console.log('--- Pass 1: Creating articles ---');
  for (const article of DESIGN_ARTICLES) {
    const docId = `article-${article.slug}`;
    const doc = {
      _id: docId,
      _type: 'article' as const,
      title: article.title,
      slug: {_type: 'slug', current: article.slug},
      category: 'Design Spotlight',
      excerpt: article.excerpt,
      readTime: article.readTime,
      publishedAt: article.publishedAt,
      updatedAt: article.updatedAt,
      metaTitle: article.metaTitle,
      metaDescription: article.metaDescription,
      keywords: article.keywords,
      content: article.content,
    };

    await client.createOrReplace(doc);
    console.log(`  Created: ${article.title}`);
  }

  // Pass 2: Patch references
  console.log('\n--- Pass 2: Patching references ---');
  for (const article of DESIGN_ARTICLES) {
    if (article.relatedSlugs.length === 0) continue;

    const docId = `article-${article.slug}`;
    const relatedArticles = article.relatedSlugs.map((slug) => ({
      _type: 'reference',
      _ref: `article-${slug}`,
      _key: generateKey(),
    }));

    await client.patch(docId).set({relatedArticles}).commit();
    console.log(
      `  Patched ${article.relatedSlugs.length} references on: ${article.title}`,
    );
  }

  console.log(`\nDone! ${DESIGN_ARTICLES.length} Design Spotlight articles created.`);
}

seedDesignArticles().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
