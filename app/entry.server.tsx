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
    connectSrc: [
      ...(isStudioRoute
        ? ['https://*.sanity.io', 'https://*.apicdn.sanity.io']
        : []),
    ],
    imgSrc: [
      'https://cdn.shopify.com',
      'https://res.cloudinary.com',
      'https://images.unsplash.com',
      'http://localhost:*',
      'data:',
      'blob:',
      ...(isStudioRoute ? ['https://cdn.sanity.io'] : []),
    ],
    frameSrc: [...(isStudioRoute ? ['https://*.sanity.io'] : [])],
    styleSrc: [
      ...(isStudioRoute ? ["'unsafe-inline'"] : []),
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
