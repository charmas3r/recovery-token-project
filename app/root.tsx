import {Analytics, getShopAnalytics, useNonce} from '@shopify/hydrogen';
import {
  Outlet,
  useRouteError,
  isRouteErrorResponse,
  type ShouldRevalidateFunction,
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
  useLocation,
} from 'react-router';
import type {Route} from './+types/root';
import {FOOTER_QUERY, HEADER_QUERY} from '~/lib/fragments';
import {getAnnouncementBar} from '~/lib/sanity.queries';
import resetStyles from '~/styles/reset.css?url';
import appStyles from '~/styles/app.css?url';
import tailwindCss from './styles/tailwind.css?url';
import {PageLayout} from './components/layout/PageLayout';
import {PostHogAnalytics} from '~/components/analytics/PostHogAnalytics';
import {GoogleAnalytics} from '~/components/analytics/GoogleAnalytics';
import {MarketingScripts} from '~/components/analytics/MarketingScripts';
import {JsonLd} from '~/components/seo/JsonLd';

export type RootLoader = typeof loader;

/**
 * This is important to avoid re-fetching root queries on sub-navigations
 */
export const shouldRevalidate: ShouldRevalidateFunction = ({
  formMethod,
  currentUrl,
  nextUrl,
}) => {
  // revalidate when a mutation is performed e.g add to cart, login...
  if (formMethod && formMethod !== 'GET') return true;

  // revalidate when manually revalidating via useRevalidator
  if (currentUrl.toString() === nextUrl.toString()) return true;

  // Defaulting to no revalidation for root loader data to improve performance.
  // When using this feature, you risk your UI getting out of sync with your server.
  // Use with caution. If you are uncomfortable with this optimization, update the
  // line below to `return defaultShouldRevalidate` instead.
  // For more details see: https://remix.run/docs/en/main/route/should-revalidate
  return false;
};

/**
 * The main and reset stylesheets are added in the Layout component
 * to prevent a bug in development HMR updates.
 *
 * This avoids the "failed to execute 'insertBefore' on 'Node'" error
 * that occurs after editing and navigating to another page.
 *
 * It's a temporary fix until the issue is resolved.
 * https://github.com/remix-run/remix/issues/9242
 */
/**
 * Design System Fonts & Assets
 * @see .cursor/skills/design-system/SKILL.md
 */
export function links() {
  return [
    // Preconnect to Shopify CDN
    {
      rel: 'preconnect',
      href: 'https://cdn.shopify.com',
    },
    {
      rel: 'preconnect',
      href: 'https://shop.app',
    },
    
    // Preconnect to Google Fonts for design system fonts
    {
      rel: 'preconnect',
      href: 'https://fonts.googleapis.com',
    },
    {
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossOrigin: 'anonymous',
    },
    
    // Load design system fonts: Inter (body), Manrope (display/headings), Sora (logo)
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@600;700&family=Sora:wght@700&display=swap',
    },
    
  ];
}

export async function loader(args: Route.LoaderArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  const {storefront, env} = args.context;

  return {
    ...deferredData,
    ...criticalData,
    publicStoreDomain: env.PUBLIC_STORE_DOMAIN,
    postHogKey: env.VITE_PUBLIC_POSTHOG_KEY,
    postHogHost: env.VITE_PUBLIC_POSTHOG_HOST,
    ga4MeasurementId: env.PUBLIC_GA4_MEASUREMENT_ID,
    metaPixelId: env.PUBLIC_META_PIXEL_ID,
    // Public site key, shared by every form using reCAPTCHA. The script itself
    // is still lazy — it only loads where useRecaptcha() is mounted.
    recaptchaSiteKey: env.PUBLIC_RECAPTCHA_SITE_KEY,
    shop: getShopAnalytics({
      storefront,
      publicStorefrontId: env.PUBLIC_STOREFRONT_ID,
    }),
    consent: {
      checkoutDomain: env.PUBLIC_CHECKOUT_DOMAIN,
      storefrontAccessToken: env.PUBLIC_STOREFRONT_API_TOKEN,
      withPrivacyBanner: true,
      // localize the privacy banner
      country: args.context.storefront.i18n.country,
      language: args.context.storefront.i18n.language,
    },
  };
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context}: Route.LoaderArgs) {
  const {storefront} = context;

  const [header, announcement] = await Promise.all([
    storefront.query(HEADER_QUERY, {
      cache: storefront.CacheLong(),
      variables: {
        headerMenuHandle: 'main-menu', // Adjust to your header menu handle
      },
    }),
    getAnnouncementBar(),
  ]);

  return {header, announcement};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  const {storefront, customerAccount, cart} = context;

  // defer the footer query (below the fold)
  const footer = storefront
    .query(FOOTER_QUERY, {
      cache: storefront.CacheLong(),
      variables: {
        footerMenuHandle: 'footer', // Adjust to your footer menu handle
      },
    })
    .catch((error: Error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });
  return {
    cart: cart.get(),
    isLoggedIn: customerAccount.isLoggedIn(),
    footer,
  };
}

export function Layout({children}: {children?: React.ReactNode}) {
  const nonce = useNonce();
  const location = useLocation();
  const isStudio = location.pathname.startsWith('/studio');

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        {!isStudio && <meta name="theme-color" content="#000000" />}
        <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 58 58' fill='none'%3E%3Crect width='58' height='58' rx='10' fill='%23000000'/%3E%3Cg transform='translate(4.35 4.35) scale(1.45)'%3E%3Ccircle cx='17' cy='17' r='15.5' stroke='rgba(255,255,255,0.9)' stroke-width='1.5'/%3E%3Ccircle cx='17' cy='17' r='12.5' stroke='rgba(255,255,255,0.25)' stroke-width='0.75'/%3E%3Cpath d='M9.5 22.5 L9.5 12 L14 19 L17 14.5 L20 19 L24.5 12 L24.5 22.5' stroke='%23ffffff' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round' fill='none'/%3E%3Cline x1='17' y1='1' x2='17' y2='3.5' stroke='rgba(255,255,255,0.45)' stroke-width='1.2' stroke-linecap='round'/%3E%3Cline x1='17' y1='30.5' x2='17' y2='33' stroke='rgba(255,255,255,0.45)' stroke-width='1.2' stroke-linecap='round'/%3E%3Cline x1='1' y1='17' x2='3.5' y2='17' stroke='rgba(255,255,255,0.45)' stroke-width='1.2' stroke-linecap='round'/%3E%3Cline x1='30.5' y1='17' x2='33' y2='17' stroke='rgba(255,255,255,0.45)' stroke-width='1.2' stroke-linecap='round'/%3E%3C/g%3E%3C/svg%3E" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        {!isStudio && (
          <>
            <link rel="stylesheet" href={tailwindCss}></link>
            <link rel="stylesheet" href={resetStyles}></link>
            <link rel="stylesheet" href={appStyles}></link>
          </>
        )}
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

export default function App() {
  const data = useRouteLoaderData<RootLoader>('root');
  const location = useLocation();
  const isStudio = location.pathname.startsWith('/studio');
  // Ad-landing pages (/lp/*) run lean: minimal chrome, no global nav/footer.
  // The template renders its own logo-only header + slim footer. Matches with
  // or without the optional ($locale) path segment (e.g. /en-us/lp/...).
  const isLanding = /(^|\/)lp\//.test(location.pathname);

  if (!data) {
    return <Outlet />;
  }

  if (isStudio) {
    return <Outlet />;
  }

  if (isLanding) {
    return (
      <Analytics.Provider
        cart={data.cart}
        shop={data.shop}
        consent={data.consent}
      >
        <Outlet />
        {data.postHogKey && (
          <PostHogAnalytics
            postHogKey={data.postHogKey}
            postHogHost={data.postHogHost}
          />
        )}
        <GoogleAnalytics ga4MeasurementId={data.ga4MeasurementId} />
        <MarketingScripts
          ga4MeasurementId={data.ga4MeasurementId}
          metaPixelId={data.metaPixelId}
        />
      </Analytics.Provider>
    );
  }

  return (
    <Analytics.Provider
      cart={data.cart}
      shop={data.shop}
      consent={data.consent}
    >
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Custom Milestones',
          url: 'https://custommilestones.com',
          description: 'Premium hand-crafted recovery tokens celebrating sobriety milestones.',
          logo: 'https://cdn.shopify.com/s/files/1/0980/8330/7822/files/og-image.webp?v=1773774508',
        }}
      />
      <PageLayout {...data}>
        <Outlet />
      </PageLayout>
      {data.postHogKey && (
        <PostHogAnalytics
          postHogKey={data.postHogKey}
          postHogHost={data.postHogHost}
        />
      )}
      <GoogleAnalytics ga4MeasurementId={data.ga4MeasurementId} />
      <MarketingScripts
        ga4MeasurementId={data.ga4MeasurementId}
        metaPixelId={data.metaPixelId}
      />
    </Analytics.Provider>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  let errorMessage = 'Unknown error';
  let errorStatus = 500;

  if (isRouteErrorResponse(error)) {
    errorMessage = error?.data?.message ?? error.data;
    errorStatus = error.status;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  const is404 = errorStatus === 404;

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000',
        color: '#fff',
        fontFamily: 'var(--font-body, Inter, sans-serif)',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      <p
        style={{
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.25em',
          fontWeight: 600,
          color: '#B8764F',
          marginBottom: '1rem',
        }}
      >
        {is404 ? 'Page Not Found' : 'Something Went Wrong'}
      </p>
      <h1
        style={{
          fontFamily: 'var(--font-display, Manrope, sans-serif)',
          fontSize: 'clamp(4rem, 15vw, 8rem)',
          fontWeight: 700,
          lineHeight: 1,
          marginBottom: '1rem',
          color: '#fff',
        }}
      >
        {errorStatus}
      </h1>
      <p
        style={{
          fontSize: '1.125rem',
          color: 'rgba(255,255,255,0.5)',
          maxWidth: '28rem',
          lineHeight: 1.6,
          marginBottom: '2.5rem',
        }}
      >
        {is404
          ? "The page you're looking for doesn't exist or has been moved."
          : errorMessage}
      </p>
      <a
        href="/"
        style={{
          display: 'inline-block',
          padding: '0.875rem 2rem',
          background: '#B8764F',
          color: '#fff',
          fontWeight: 600,
          fontSize: '0.875rem',
          borderRadius: '0.5rem',
          textDecoration: 'none',
          letterSpacing: '0.02em',
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
      >
        Back to Home
      </a>
    </div>
  );
}
