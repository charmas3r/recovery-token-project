/**
 * Meta Pixel helpers — a thin, consent-safe bridge to fbq.
 *
 * `trackPixelEvent` is the ONLY place storefront code (outside
 * `MarketingScripts.tsx`) touches `window.fbq`. `window.fbq` is defined
 * exclusively by `MarketingScripts.tsx` *after* the visitor grants marketing
 * consent, so guarding on its existence means every call here naturally
 * no-ops before consent — no extra consent logic lives in this module.
 *
 * @see app/components/analytics/MarketingScripts.tsx — owns fbq bootstrap + consent gating
 */

/** The subset of a cart line we read to build a Meta Pixel `contents` entry. */
export interface MetaPixelLineInput {
  id?: string | null;
  price?: string | number | {amount?: string | null; currencyCode?: string | null} | null;
  quantity?: number | null;
}

export interface MetaPixelContents {
  content_ids: string[];
  content_type: 'product';
  contents: Array<{id: string; quantity: number}>;
  value: number;
  currency?: string;
}

/** Pull a numeric price out of either a Money object or a bare amount. */
function readAmount(price: MetaPixelLineInput['price']): number | undefined {
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
function readCurrency(price: MetaPixelLineInput['price']): string | undefined {
  if (price && typeof price === 'object' && price.currencyCode) {
    return price.currencyCode;
  }
  return undefined;
}

/**
 * Map cart-line-like inputs to Meta's `content_ids`/`contents`/`value` shape
 * for the AddToCart/InitiateCheckout standard events.
 */
export function toMetaPixelContents(
  lines: MetaPixelLineInput | MetaPixelLineInput[] | null | undefined,
): MetaPixelContents {
  const list = (Array.isArray(lines) ? lines : [lines]).filter(
    (line): line is MetaPixelLineInput => line != null && line.id != null,
  );
  const contents = list.map((line) => ({
    id: String(line.id),
    quantity: line.quantity ?? 1,
  }));
  const value = list.reduce((sum, line) => {
    const amount = readAmount(line.price);
    return sum + (amount ?? 0) * (line.quantity ?? 1);
  }, 0);
  const currency = list.map((line) => readCurrency(line.price)).find(Boolean);

  return {
    content_ids: contents.map((c) => c.id),
    content_type: 'product',
    contents,
    value,
    ...(currency ? {currency} : {}),
  };
}

/**
 * Fire a Meta Pixel event through fbq, guarded so it no-ops until consent has
 * been granted (i.e. until `MarketingScripts` has defined `window.fbq`).
 */
export function trackPixelEvent(
  name: string,
  params?: Record<string, unknown> | MetaPixelContents,
): void {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') {
    return;
  }
  window.fbq('track', name, params);
}
