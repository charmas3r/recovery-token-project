import {ServerRouter} from 'react-router';
import {isbot} from 'isbot';
import {renderToReadableStream} from 'react-dom/server';
import {
  createContentSecurityPolicy,
  type HydrogenRouterContextProvider,
} from '@shopify/hydrogen';
import type {EntryContext} from 'react-router';

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  reactRouterContext: EntryContext,
  context: HydrogenRouterContextProvider,
) {
  const isStudioRoute = new URL(request.url).pathname.startsWith('/studio');

  const {nonce, header, NonceProvider} = createContentSecurityPolicy({
    shop: {
      checkoutDomain: context.env.PUBLIC_CHECKOUT_DOMAIN,
      storeDomain: context.env.PUBLIC_STORE_DOMAIN,
    },
    defaultSrc: [
      'https://us-assets.i.posthog.com',
      'https://us.i.posthog.com',
      // Sanity Studio needs broad access to function
      ...(isStudioRoute
        ? ['https://*.sanity.io', 'https://*.apicdn.sanity.io']
        : []),
    ],
    scriptSrc: [
      // Preserve first-party + Shopify scripts (specifying scriptSrc replaces
      // Hydrogen's default, so 'self'/localhost/cdn must be re-listed; the
      // nonce is still injected automatically).
      "'self'",
      'http://localhost:*',
      'https://cdn.shopify.com',
      // PostHog loads helper scripts at runtime; previously allowed via the
      // default-src fallback, now needs to be explicit since we set script-src.
      'https://us-assets.i.posthog.com',
      'https://us.i.posthog.com',
      // GA4 (gtag.js) + Meta Pixel (fbevents.js) loaders
      'https://www.googletagmanager.com',
      'https://www.google-analytics.com',
      'https://connect.facebook.net',
    ],
    connectSrc: [
      // GA4 / Google Tag Manager beacons
      'https://www.google-analytics.com',
      'https://*.google-analytics.com',
      'https://*.analytics.google.com',
      'https://www.googletagmanager.com',
      // Meta Pixel
      'https://connect.facebook.net',
      'https://www.facebook.com',
      // PostHog (previously blocked by the connect-src override)
      'https://us.i.posthog.com',
      'https://us-assets.i.posthog.com',
      ...(isStudioRoute
        ? ['https://*.sanity.io', 'https://*.apicdn.sanity.io']
        : []),
    ],
    imgSrc: [
      'https://cdn.shopify.com',
      'https://res.cloudinary.com',
      'https://images.unsplash.com',
      // GA4 + Meta Pixel tracking beacons (1x1 pixels)
      'https://www.google-analytics.com',
      'https://www.googletagmanager.com',
      'https://www.facebook.com',
      'https://connect.facebook.net',
      'http://localhost:*',
      'data:',
      'blob:',
      ...(isStudioRoute ? ['https://cdn.sanity.io'] : []),
    ],
    frameSrc: [...(isStudioRoute ? ['https://*.sanity.io'] : [])],
    styleSrc: [
      // Google Fonts stylesheet (loaded in root.tsx links())
      'https://fonts.googleapis.com',
      ...(isStudioRoute ? ["'unsafe-inline'"] : []),
    ],
    fontSrc: [
      // Google Fonts files
      'https://fonts.gstatic.com',
      'data:',
    ],
  });

  const body = await renderToReadableStream(
    <NonceProvider>
      <ServerRouter
        context={reactRouterContext}
        url={request.url}
        nonce={nonce}
      />
    </NonceProvider>,
    {
      nonce,
      signal: request.signal,
      onError(error) {
        console.error(error);
        responseStatusCode = 500;
      },
    },
  );

  if (isbot(request.headers.get('user-agent'))) {
    await body.allReady;
  }

  responseHeaders.set('Content-Type', 'text/html');
  responseHeaders.set('Content-Security-Policy', header);

  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
