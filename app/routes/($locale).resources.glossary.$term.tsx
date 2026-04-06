/**
 * Glossary Detail Page — Dynamic Route
 *
 * Individual glossary term pages at /resources/glossary/{term}.
 * Fetches base term from Sanity + extended content from seo-pages.ts.
 */

import {useLoaderData} from 'react-router';
import type {Route} from './+types/resources.glossary.$term';
import {getSEOPage} from '~/data/seo-pages';
import {buildMeta} from '~/lib/meta';
import {getAllGlossaryTerms} from '~/lib/sanity.queries';
import {COLLECTION_WITH_PRODUCTS_QUERY} from '~/graphql/seo-queries';
import {GlossaryDetailTemplate} from '~/components/seo/GlossaryDetailTemplate';

export const meta: Route.MetaFunction = ({data}) => {
  if (!data?.page) return buildMeta({title: 'Not Found — Coinplugz'});
  return buildMeta({
    title: data.page.metaTitle,
    description: data.page.metaDescription,
  });
};

export async function loader({params, context}: Route.LoaderArgs) {
  const termSlug = params.term;
  if (!termSlug) throw new Response('Not Found', {status: 404});

  const page = getSEOPage(`resources/glossary/${termSlug}`);
  if (!page || page.type !== 'glossary') {
    throw new Response('Not Found', {status: 404});
  }

  // Fetch base term from Sanity
  const allTerms = await getAllGlossaryTerms();
  const sanityTerm = allTerms.find((t) => t.slug === termSlug);
  if (!sanityTerm) {
    throw new Response('Term not found', {status: 404});
  }

  // Fetch related products if linked
  let products: Array<Record<string, unknown>> = [];
  if (page.glossary?.productLink) {
    const {collection} = await context.storefront.query(
      COLLECTION_WITH_PRODUCTS_QUERY,
      {
        variables: {handle: page.glossary.productLink, first: 2},
        cache: context.storefront.CacheLong(),
      },
    );
    products = collection?.products?.nodes ?? [];
  }

  return {page, sanityTerm, products};
}

export default function GlossaryDetailPage() {
  const {page, sanityTerm, products} = useLoaderData<typeof loader>();

  return (
    <GlossaryDetailTemplate
      page={page}
      sanityTerm={sanityTerm as any}
      products={products as any}
    />
  );
}
