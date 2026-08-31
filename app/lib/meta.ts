export const BRAND = {
  name: 'Custom Milestones',
  url: 'https://custommilestones.com',
  email: 'support@custommilestones.com',
} as const;

/**
 * Official brand social profiles — the single source of truth for the footer
 * links and the Schema.org `sameAs` set that ties the site to these accounts.
 * Add a network here and it flows to both.
 */
export const SOCIAL = {
  instagram: 'https://www.instagram.com/custom_milestones_co/',
  facebook: 'https://www.facebook.com/profile.php?id=61584310800800',
} as const;

/** Profile URLs in `sameAs` form for Organization structured data. */
export const SOCIAL_PROFILES: string[] = Object.values(SOCIAL);

const SITE_NAME = BRAND.name;
const SITE_URL = BRAND.url;
const DEFAULT_OG_IMAGE =
  'https://cdn.shopify.com/s/files/1/0980/8330/7822/files/og-image.webp?v=1773774508';
const DEFAULT_DESCRIPTION =
  'Premium hand-crafted recovery tokens and sobriety coins celebrating every milestone — personalized, made to keep, and ready to give.';

/** Recommended max length for a meta description before Google truncates it. */
const MAX_DESCRIPTION_LENGTH = 158;

/**
 * Brand names that may appear as a trailing "<separator> Brand" suffix in a
 * raw title. Includes prior brand names so legacy/CMS titles get normalized.
 */
const TITLE_BRAND_SUFFIXES = [
  'Custom Milestones',
  'Recovery Token Store',
  'Coinplugz',
];

const TRAILING_BRAND_RE = new RegExp(
  `\\s*[|\\u2013\\u2014-]\\s*(?:${TITLE_BRAND_SUFFIXES.join('|')})\\s*$`,
  'i',
);

/**
 * Ensure every page title ends with " | Custom Milestones".
 *
 * Strips any existing trailing brand suffix (current or legacy, with any
 * dash/pipe separator) and re-appends the canonical " | Custom Milestones".
 * Titles that already lead with the brand (e.g. the homepage) are left intact
 * so the brand isn't duplicated.
 */
export function normalizeTitle(rawTitle: string): string {
  let title = String(rawTitle ?? '').trim();
  if (!title) return SITE_NAME;

  // Remove any trailing brand segments (handles doubled or legacy suffixes).
  while (TRAILING_BRAND_RE.test(title)) {
    title = title.replace(TRAILING_BRAND_RE, '').trim();
  }

  // If the brand still appears (e.g. brand-first homepage title), don't append.
  if (/custom milestones/i.test(title)) return title;

  return `${title} | ${SITE_NAME}`;
}

/**
 * Trim a meta description to a search-friendly length, preferring a sentence
 * boundary and falling back to a word boundary with an ellipsis. A no-op for
 * descriptions already within range.
 */
export function clampDescription(rawDescription: string): string {
  const text = String(rawDescription ?? '')
    .trim()
    .replace(/\s+/g, ' ');
  if (text.length <= MAX_DESCRIPTION_LENGTH) return text;

  const window = text.slice(0, MAX_DESCRIPTION_LENGTH);
  const lastSentence = Math.max(
    window.lastIndexOf('. '),
    window.lastIndexOf('! '),
    window.lastIndexOf('? '),
  );
  if (lastSentence >= 110) {
    return window.slice(0, lastSentence + 1).trim();
  }

  const lastSpace = window.lastIndexOf(' ');
  const base = window
    .slice(0, lastSpace > 0 ? lastSpace : MAX_DESCRIPTION_LENGTH)
    .replace(/[\s,;:–—-]+$/, '');
  return `${base}…`;
}

interface BuildMetaOptions {
  title: string;
  description?: string;
  ogImage?: string;
  ogImageWidth?: string;
  ogImageHeight?: string;
  ogType?: string;
  url?: string;
  canonical?: string;
  noIndex?: boolean;
  extra?: Array<Record<string, string>>;
}

/**
 * Resolve an absolute URL from a root-relative path or pass-through an
 * already-absolute URL. Strips a trailing slash except at the site root.
 */
function resolveUrl(value?: string): string | undefined {
  if (!value) return undefined;
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }
  const path = value.startsWith('/') ? value : `/${value}`;
  const full = `${SITE_URL}${path}`;
  return full.length > SITE_URL.length + 1 && full.endsWith('/')
    ? full.slice(0, -1)
    : full;
}

export function buildMeta({
  title,
  description = DEFAULT_DESCRIPTION,
  ogImage = DEFAULT_OG_IMAGE,
  ogImageWidth = '1200',
  ogImageHeight = '630',
  ogType = 'website',
  url,
  canonical,
  noIndex,
  extra = [],
}: BuildMetaOptions) {
  const absoluteUrl = resolveUrl(url);
  const absoluteCanonical = resolveUrl(canonical) ?? absoluteUrl;

  title = normalizeTitle(title);
  description = clampDescription(description);

  const meta: Array<Record<string, string>> = [
    {title},
    {name: 'description', content: description},
    {property: 'og:title', content: title},
    {property: 'og:description', content: description},
    {property: 'og:image', content: ogImage},
    {property: 'og:image:width', content: ogImageWidth},
    {property: 'og:image:height', content: ogImageHeight},
    {property: 'og:type', content: ogType},
    {property: 'og:site_name', content: SITE_NAME},
    {name: 'twitter:card', content: 'summary_large_image'},
    {name: 'twitter:title', content: title},
    {name: 'twitter:description', content: description},
    {name: 'twitter:image', content: ogImage},
  ];

  if (absoluteUrl) {
    meta.push({property: 'og:url', content: absoluteUrl});
  }

  if (absoluteCanonical) {
    meta.push({
      tagName: 'link',
      rel: 'canonical',
      href: absoluteCanonical,
    });
  }

  if (noIndex) {
    meta.push({name: 'robots', content: 'noindex,nofollow'});
  }

  meta.push(...extra);

  return meta;
}
