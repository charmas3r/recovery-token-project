/**
 * SEO Landing Page — Dynamic Route
 *
 * Handles all commercial and milestone SEO pages with flat URLs.
 * Static routes (about, cart, etc.) take priority over this dynamic segment.
 * Unknown slugs return 404.
 */

import {useLoaderData} from 'react-router';
import type {Route} from './+types/$seoPage';
import {getSEOPage} from '~/data/seo-pages';
import {buildMeta} from '~/lib/meta';
import {
  COLLECTION_WITH_PRODUCTS_QUERY,
  PRODUCTS_BY_HANDLES_QUERY,
} from '~/graphql/seo-queries';
import {CommercialLandingTemplate} from '~/components/seo/CommercialLandingTemplate';
import {MilestoneLandingTemplate} from '~/components/seo/MilestoneLandingTemplate';

export const meta: Route.MetaFunction = ({data}) => {
  if (!data?.page) return buildMeta({title: 'Not Found — Coinplugz'});
  return buildMeta({
    title: data.page.metaTitle,
    description: data.page.metaDescription,
  });
};

export async function loader({params, context}: Route.LoaderArgs) {
  const slug = params.seoPage;
  if (!slug) throw new Response('Not Found', {status: 404});

  const page = getSEOPage(slug);
  if (!page || page.type === 'glossary') {
    throw new Response('Not Found', {status: 404});
  }

  // Fetch products — prefer collection, fall back to individual handles
  let products: Array<Record<string, unknown>> = [];

  if (page.featuredCollectionHandle) {
    const {collection} = await context.storefront.query(
      COLLECTION_WITH_PRODUCTS_QUERY,
      {
        variables: {handle: page.featuredCollectionHandle, first: 4},
        cache: context.storefront.CacheLong(),
      },
    );
    products = collection?.products?.nodes ?? [];
  } else if (
    page.featuredProductHandles &&
    page.featuredProductHandles.length > 0
  ) {
    const queryStr = page.featuredProductHandles
      .map((h) => `handle:${h}`)
      .join(' OR ');
    const {products: result} = await context.storefront.query(
      PRODUCTS_BY_HANDLES_QUERY,
      {
        variables: {first: page.featuredProductHandles.length, query: queryStr},
        cache: context.storefront.CacheLong(),
      },
    );
    products = result?.nodes ?? [];
  }

  return {page, products};
}

export default function SEOLandingPage() {
  const {page, products} = useLoaderData<typeof loader>();

  if (page.type === 'milestone') {
    return <MilestoneLandingTemplate page={page} products={products as any} />;
  }

  return <CommercialLandingTemplate page={page} products={products as any} />;
}
