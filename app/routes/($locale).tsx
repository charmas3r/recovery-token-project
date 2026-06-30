import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {redirect} from 'react-router';
import {getSEOPage} from '~/data/seo-pages';

export async function loader({params, request, context}: LoaderFunctionArgs) {
  const {language, country} = context.storefront.i18n;

  if (
    params.locale &&
    params.locale.toLowerCase() !== `${language}-${country}`.toLowerCase()
  ) {
    // `/products/custom-token` is a dead PDP — the custom-token product backs
    // the /custom-token builder and has no product page. React Router parses
    // this URL as locale="products" + the custom-token route, so the 301 in
    // products.$handle never runs and the request lands here. Redirect the
    // legacy URL to the builder so old sitemap entries / external links and
    // crawlers don't hit a 404.
    const {pathname, search} = new URL(request.url);
    if (/^\/products\/custom-token\/?$/.test(pathname)) {
      throw redirect('/custom-token' + search, 301);
    }

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
