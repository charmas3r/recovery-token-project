import type {Route} from './+types/sitemap.$type.$page[.xml]';
import {getSitemap} from '@shopify/hydrogen';

export async function loader({
  request,
  params,
  context: {storefront},
}: Route.LoaderArgs) {
  const response = await getSitemap({
    storefront,
    request,
    params,
    locales: ['EN-US'],
    getLink: ({type, baseUrl, handle, locale}) => {
      if (!locale) return `${baseUrl}/${type}/${handle}`;
      return `${baseUrl}/${locale}/${type}/${handle}`;
    },
  });

  // Shopify auto-includes every published resource, but a few don't resolve to a
  // canonical 200 page and shouldn't be advertised to crawlers:
  //   - /products/custom-token → no PDP; 301s to the /custom-token builder
  //   - /pages/contact         → 301s to the /contact route
  // Drop their <url> blocks (loc + any hreflang alternates) from the XML.
  const EXCLUDED_LOC_SUFFIXES = ['/products/custom-token', '/pages/contact'];
  let body = await response.text();
  body = body.replace(/\s*<url>[\s\S]*?<\/url>/g, (block) =>
    EXCLUDED_LOC_SUFFIXES.some((suffix) => block.includes(`${suffix}</loc>`))
      ? ''
      : block,
  );

  const headers = new Headers(response.headers);
  headers.set('Cache-Control', `max-age=${60 * 60 * 24}`);

  return new Response(body, {status: response.status, headers});
}
