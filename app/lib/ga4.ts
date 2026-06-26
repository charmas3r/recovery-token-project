/**
 * GA4 helpers — a thin, consent-safe bridge to gtag.
 *
 * `trackEvent` is the ONLY place storefront code touches `window.gtag`.
 * `window.gtag` is defined exclusively by `MarketingScripts.tsx` *after* the
 * visitor grants analytics consent, so guarding on its existence means every
 * call here naturally no-ops before consent — no extra consent logic lives in
 * this module (and none should be added).
 *
 * @see app/components/analytics/MarketingScripts.tsx — owns gtag bootstrap + consent gating
 * @see app/components/analytics/GoogleAnalytics.tsx — Hydrogen → GA4 event bridge
 */

/**
 * The subset of a Hydrogen/Storefront product we read to build a GA4 item.
 *
 * Hydrogen's analytics `ProductPayload` exposes `price` as a plain amount
 * string, but other call sites (and PostHog) read `price.amount` /
 * `price.currencyCode` from a Money object. We accept either shape so the same
 * helper works for both the analytics payload and raw product/variant data.
 */
export interface Ga4ProductInput {
  id?: string | null;
  title?: string | null;
  vendor?: string | null;
  productType?: string | null;
  price?: string | number | {amount?: string | null; currencyCode?: string | null} | null;
  variantId?: string | null;
  variantTitle?: string | null;
  quantity?: number | null;
}

/** A GA4 `items[]` entry (GA4 recommended-event item schema). */
export interface Ga4Item {
  item_id?: string;
  item_name?: string;
  item_brand?: string;
  item_category?: string;
  price?: number;
  quantity?: number;
  item_variant?: string;
}

/** Pull a numeric price out of either a Money object or a bare amount. */
function readPriceAmount(
  price: Ga4ProductInput['price'],
): number | undefined {
  if (price == null) return undefined;
  if (typeof price === 'number') return price;
  if (typeof price === 'string') {
    const n = Number.parseFloat(price);
    return Number.isNaN(n) ? undefined : n;
  }
  if (typeof price === 'object' && price.amount != null) {
    const n = Number.parseFloat(String(price.amount));
    return Number.isNaN(n) ? undefined : n;
  }
  return undefined;
}

/** Pull a currency code out of a Money object, if present. */
export function readPriceCurrency(
  price: Ga4ProductInput['price'],
): string | undefined {
  if (price && typeof price === 'object' && price.currencyCode) {
    return price.currencyCode;
  }
  return undefined;
}

/**
 * Map Hydrogen/Storefront product shapes to GA4 `items[]`.
 *
 * Reuses the same fields PostHogAnalytics reads: id, title, vendor,
 * productType, price (amount), variantId, variantTitle, quantity.
 */
export function toGa4Items(
  products: Ga4ProductInput | Ga4ProductInput[] | null | undefined,
): Ga4Item[] {
  if (!products) return [];
  const list = Array.isArray(products) ? products : [products];
  return list.filter(Boolean).map((product) => {
    const item: Ga4Item = {};
    if (product.id != null) item.item_id = String(product.id);
    if (product.title != null) item.item_name = product.title;
    if (product.vendor != null) item.item_brand = product.vendor;
    if (product.productType != null) item.item_category = product.productType;
    const price = readPriceAmount(product.price);
    if (price != null) item.price = price;
    if (product.quantity != null) item.quantity = product.quantity;
    if (product.variantTitle != null) item.item_variant = product.variantTitle;
    return item;
  });
}

/** Sum `price * quantity` across GA4 items to derive an event `value`. */
export function ga4ItemsValue(items: Ga4Item[]): number {
  return items.reduce(
    (sum, item) => sum + (item.price ?? 0) * (item.quantity ?? 1),
    0,
  );
}

/**
 * Fire a GA4 event through gtag, guarded so it no-ops until consent has been
 * granted (i.e. until `MarketingScripts` has defined `window.gtag`).
 */
export function trackEvent(
  name: string,
  params?: Record<string, unknown>,
): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
    return;
  }
  window.gtag('event', name, params);
}
