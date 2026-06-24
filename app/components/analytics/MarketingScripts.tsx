import {useNonce} from '@shopify/hydrogen';
import {useEffect, useRef} from 'react';
import {useLocation} from 'react-router';

type FbqFn = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[];
  push?: unknown;
  loaded?: boolean;
  version?: string;
};

interface CustomerPrivacy {
  analyticsProcessingAllowed?: () => boolean;
  marketingAllowed?: () => boolean;
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: FbqFn;
    _fbq?: FbqFn;
  }
}

interface MarketingScriptsProps {
  ga4MeasurementId?: string;
  metaPixelId?: string;
}

/** Read consent from Shopify's Customer Privacy API (loaded by the privacy banner). */
function getConsent() {
  const cp = (
    window as unknown as {Shopify?: {customerPrivacy?: CustomerPrivacy}}
  ).Shopify?.customerPrivacy;
  return {
    analytics: cp?.analyticsProcessingAllowed?.() ?? false,
    marketing: cp?.marketingAllowed?.() ?? false,
  };
}

/**
 * GA4 + Meta Pixel loader.
 *
 * - **Env-driven:** nothing loads unless the matching ID is provided. With the
 *   IDs unset (default), this renders nothing and injects no scripts.
 * - **Consent-gated:** scripts initialize only after the visitor grants consent
 *   via the Shopify privacy banner — analytics consent -> GA4, marketing consent
 *   -> Meta Pixel. Default is NO tracking until consent is given, and it
 *   re-checks on the `visitorConsentCollected` event.
 * - **CSP-safe:** external scripts are injected with the page nonce; their
 *   domains are allow-listed in `app/entry.server.tsx`.
 *
 * Purchase conversions are intentionally NOT fired here: Hydrogen checkout is on
 * Shopify's domain, so configure Purchase via the Shopify Meta/Google sales
 * channel or Customer Events.
 */
export function MarketingScripts({
  ga4MeasurementId,
  metaPixelId,
}: MarketingScriptsProps) {
  const nonce = useNonce();
  const location = useLocation();
  const firstLoad = useRef(true);

  // Consent-gated lazy initialization.
  useEffect(() => {
    if (!ga4MeasurementId && !metaPixelId) return;

    function initGA4() {
      if (window.gtag || !ga4MeasurementId) return;
      const s = document.createElement('script');
      s.async = true;
      s.src = `https://www.googletagmanager.com/gtag/js?id=${ga4MeasurementId}`;
      if (nonce) s.nonce = nonce;
      document.head.appendChild(s);
      window.dataLayer = window.dataLayer || [];
      window.gtag = (...args: unknown[]) => {
        window.dataLayer!.push(args);
      };
      window.gtag('js', new Date());
      window.gtag('config', ga4MeasurementId);
    }

    function initPixel() {
      if (window.fbq || !metaPixelId) return;
      const n: FbqFn = ((...args: unknown[]) => {
        if (n.callMethod) {
          n.callMethod(...args);
        } else {
          n.queue!.push(args);
        }
      }) as FbqFn;
      n.queue = [];
      n.push = n;
      n.loaded = true;
      n.version = '2.0';
      window.fbq = n;
      if (!window._fbq) window._fbq = n;
      const t = document.createElement('script');
      t.async = true;
      t.src = 'https://connect.facebook.net/en_US/fbevents.js';
      if (nonce) t.nonce = nonce;
      document.head.appendChild(t);
      n('init', metaPixelId);
      n('track', 'PageView');
    }

    function apply() {
      const consent = getConsent();
      if (consent.analytics) initGA4();
      if (consent.marketing) initPixel();
    }

    apply();
    document.addEventListener('visitorConsentCollected', apply);
    return () => document.removeEventListener('visitorConsentCollected', apply);
  }, [ga4MeasurementId, metaPixelId, nonce]);

  // SPA page views on route change. Only fires for trackers already
  // initialized (i.e. consent was granted); the initial view is sent at init.
  useEffect(() => {
    if (firstLoad.current) {
      firstLoad.current = false;
      return;
    }
    if (window.gtag && ga4MeasurementId) {
      window.gtag('event', 'page_view', {
        page_path: location.pathname + location.search,
      });
    }
    if (window.fbq) {
      window.fbq('track', 'PageView');
    }
  }, [location.pathname, location.search, ga4MeasurementId]);

  return null;
}
