export const BRAND = {
  name: 'Custom Milestones',
  url: 'https://custommilestones.com',
  email: 'support@custommilestones.com',
} as const;

const SITE_NAME = BRAND.name;
const SITE_URL = BRAND.url;
const DEFAULT_OG_IMAGE =
  'https://cdn.shopify.com/s/files/1/0980/8330/7822/files/og-image.webp?v=1773774508';
const DEFAULT_DESCRIPTION =
  'Premium hand-crafted recovery tokens celebrating sobriety milestones.';

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
