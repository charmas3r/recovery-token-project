import type {Route} from './+types/[sitemap.xml]';
import {getSitemapIndex} from '@shopify/hydrogen';

export async function loader({
  request,
  context: {storefront},
}: Route.LoaderArgs) {
  const response = await getSitemapIndex({
    storefront,
    request,
  });

  // Append custom static pages sitemap to the index
  const body = await response.text();
  const url = new URL(request.url);
  const customSitemapEntry = `<sitemap><loc>${url.origin}/sitemap/custom/1.xml</loc></sitemap>`;
  const updatedBody = body.replace(
    '</sitemapindex>',
    `${customSitemapEntry}\n</sitemapindex>`,
  );

  return new Response(updatedBody, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': `max-age=${60 * 60 * 24}`,
      'xml-charset': 'UTF-8',
    },
  });
}
