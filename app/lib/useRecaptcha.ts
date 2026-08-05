/**
 * reCAPTCHA v3 Client Hook
 *
 * Loads Google's reCAPTCHA v3 script and exposes a token generator.
 * Only mounted on routes that need it (currently /contact), so the ~90KB
 * script never touches the rest of the site.
 *
 * The badge is hidden via CSS; the required attribution is rendered as
 * disclosure text next to the submit button instead (see RecaptchaDisclosure).
 */

import {useEffect, useRef, useCallback} from 'react';

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (
        siteKey: string,
        options: {action: string},
      ) => Promise<string>;
    };
  }
}

const SCRIPT_ID = 'recaptcha-v3';

/**
 * @param siteKey - PUBLIC_RECAPTCHA_SITE_KEY, or undefined when unconfigured
 * @returns getToken - resolves to a token, or null if reCAPTCHA is unavailable
 *   (unconfigured, blocked by an extension, or failed to load)
 */
export function useRecaptcha(siteKey?: string) {
  const loadFailed = useRef(false);

  useEffect(() => {
    if (!siteKey || document.getElementById(SCRIPT_ID)) return;

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      loadFailed.current = true;
      console.warn('[recaptcha] script failed to load (blocked or offline)');
    };

    document.head.appendChild(script);
  }, [siteKey]);

  const getToken = useCallback(
    async (action: string): Promise<string | null> => {
      if (!siteKey || loadFailed.current || !window.grecaptcha) return null;

      try {
        // grecaptcha.ready resolves once the script has finished initializing.
        await new Promise<void>((resolve) => window.grecaptcha!.ready(resolve));
        return await window.grecaptcha.execute(siteKey, {action});
      } catch (error) {
        console.warn('[recaptcha] execute failed:', error);
        return null;
      }
    },
    [siteKey],
  );

  return {getToken, enabled: Boolean(siteKey)};
}
