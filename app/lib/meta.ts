const SITE_NAME = 'Recovery Token Store';
const DEFAULT_OG_IMAGE =
  'https://cdn.shopify.com/s/files/1/0752/2733/2779/files/sunflower-token-final-webp.webp?v=1769842039';
const DEFAULT_DESCRIPTION =
  'Premium hand-crafted recovery tokens celebrating sobriety milestones.';

interface BuildMetaOptions {
  title: string;
  description?: string;
  ogImage?: string;
  ogType?: string;
  url?: string;
  noIndex?: boolean;
  extra?: Array<Record<string, string>>;
}

export function buildMeta({
  title,
  description = DEFAULT_DESCRIPTION,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
  url,
  noIndex,
  extra = [],
}: BuildMetaOptions) {
  const meta: Array<Record<string, string>> = [
    {title},
    {name: 'description', content: description},
    {property: 'og:title', content: title},
    {property: 'og:description', content: description},
    {property: 'og:image', content: ogImage},
    {property: 'og:type', content: ogType},
    {property: 'og:site_name', content: SITE_NAME},
    {name: 'twitter:card', content: 'summary_large_image'},
    {name: 'twitter:title', content: title},
    {name: 'twitter:description', content: description},
    {name: 'twitter:image', content: ogImage},
  ];

  if (url) {
    meta.push({property: 'og:url', content: url});
  }

  if (noIndex) {
    meta.push({name: 'robots', content: 'noindex,nofollow'});
  }

  meta.push(...extra);

  return meta;
}
