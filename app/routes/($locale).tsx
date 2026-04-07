import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {getSEOPage} from '~/data/seo-pages';

export async function loader({params, context}: LoaderFunctionArgs) {
  const {language, country} = context.storefront.i18n;

  if (
    params.locale &&
    params.locale.toLowerCase() !== `${language}-${country}`.toLowerCase()
  ) {
    // React Router v7 may interpret single-segment paths like /recovery-tokens
    // as locale="recovery-tokens" + _index. Allow registered SEO page slugs
    // to pass through so the _index route can handle them.
    const seoPage = getSEOPage(params.locale);
    if (!seoPage || seoPage.type === 'glossary') {
      throw new Response(null, {status: 404});
    }
  }

  return null;
}
