import {useAnalytics} from '@shopify/hydrogen';
import {useEffect} from 'react';
import {
  ga4ItemsValue,
  readPriceCurrency,
  toGa4Items,
  trackEvent,
  type Ga4ProductInput,
} from '~/lib/ga4';

interface GoogleAnalyticsProps {
  ga4MeasurementId?: string;
}

/**
 * GA4 ecommerce-event bridge.
 *
 * Mirrors `PostHogAnalytics.tsx`: registers with Hydrogen's
 * `Analytics.Provider`, subscribes to the auto-published events inside a
 * `useEffect`, and calls `ready()`. Every event is forwarded to GA4 through the
 * consent-guarded `trackEvent` helper, so nothing fires before the visitor
 * grants analytics consent (see `MarketingScripts.tsx`).
 *
 * `page_viewed` is intentionally NOT mapped — `MarketingScripts.tsx` is the
 * single source of GA4 `page_view`, and double-sending would inflate counts.
 */
export function GoogleAnalytics({ga4MeasurementId}: GoogleAnalyticsProps) {
  const {subscribe, register} = useAnalytics();
  const {ready} = register('GoogleAnalytics');

  useEffect(() => {
    // product_viewed -> view_item
    subscribe('product_viewed', (data) => {
      const items = toGa4Items(data.products as Ga4ProductInput[] | undefined);
      if (!items.length) return;
      const currency = readPriceCurrency(
        (data.products?.[0] as Ga4ProductInput | undefined)?.price,
      );
      trackEvent('view_item', {
        items,
        value: ga4ItemsValue(items),
        ...(currency ? {currency} : {}),
      });
    });

    // collection_viewed -> view_item_list (list id/name from collection handle)
    subscribe('collection_viewed', (data) => {
      trackEvent('view_item_list', {
        item_list_id: data.collection?.handle,
        item_list_name: data.collection?.handle,
      });
    });

    // search_viewed -> search (+ view_search_results)
    subscribe('search_viewed', (data) => {
      const params = {
        search_term: data.searchTerm,
        ...(Array.isArray(data.searchResults)
          ? {result_count: data.searchResults.length}
          : {}),
      };
      trackEvent('search', params);
      trackEvent('view_search_results', params);
    });

    // cart_viewed -> view_cart
    subscribe('cart_viewed', (data) => {
      const items = cartLinesToGa4Items(data.cart);
      trackEvent('view_cart', {
        items,
        value: cartValue(data.cart),
        ...(cartCurrency(data.cart) ? {currency: cartCurrency(data.cart)} : {}),
      });
    });

    // product_added_to_cart -> add_to_cart
    subscribe('product_added_to_cart', (data) => {
      const items = cartLinesToGa4Items(data.currentLine, data.prevLine);
      trackEvent('add_to_cart', {
        items,
        value: ga4ItemsValue(items),
        ...(cartCurrency(data.cart) ? {currency: cartCurrency(data.cart)} : {}),
      });
    });

    // cart_updated -> remove_from_cart ONLY (on quantity decrease).
    // Additions are owned by product_added_to_cart; if we also emitted
    // add_to_cart here, a single add would fire two add_to_cart events and the
    // cart_updated one would over-report the whole cart. So only handle removals.
    subscribe('cart_updated', (data) => {
      const current = data.cart?.totalQuantity ?? 0;
      const prev = data.prevCart?.totalQuantity ?? 0;
      if (current >= prev) return; // increases are covered by product_added_to_cart
      const items = cartLinesToGa4Items(data.cart);
      trackEvent('remove_from_cart', {
        items,
        value: cartValue(data.cart),
        ...(cartCurrency(data.cart) ? {currency: cartCurrency(data.cart)} : {}),
      });
    });

    ready();
  }, [subscribe, register, ga4MeasurementId, ready]);

  return null;
}

/** Loosely-typed cart line (the analytics payload widens these to `unknown`). */
type CartLineLike = {
  quantity?: number | null;
  cost?: {totalAmount?: {amount?: string | null} | null} | null;
  merchandise?: {
    id?: string | null;
    title?: string | null;
    product?: {
      id?: string | null;
      title?: string | null;
      vendor?: string | null;
      productType?: string | null;
    } | null;
    price?: {amount?: string | null; currencyCode?: string | null} | null;
  } | null;
};

type CartLike = {
  cost?: {totalAmount?: {amount?: string | null; currencyCode?: string | null} | null} | null;
  lines?: {nodes?: CartLineLike[] | null} | null;
} | null | undefined;

function lineToGa4Input(line: CartLineLike): Ga4ProductInput {
  const product = line.merchandise?.product;
  return {
    id: product?.id ?? line.merchandise?.id,
    title: product?.title,
    vendor: product?.vendor,
    productType: product?.productType,
    price: line.merchandise?.price,
    variantId: line.merchandise?.id,
    variantTitle: line.merchandise?.title,
    quantity: line.quantity,
  };
}

/**
 * Build GA4 items from cart-ish payloads. Accepts either a cart (with
 * `lines.nodes`) or one or more individual cart lines (add/remove events).
 */
function cartLinesToGa4Items(
  source: CartLike | CartLineLike | null | undefined,
  ...extraLines: Array<CartLineLike | null | undefined>
): ReturnType<typeof toGa4Items> {
  if (!source) {
    return toGa4Items(
      extraLines.filter(Boolean).map((l) => lineToGa4Input(l as CartLineLike)),
    );
  }
  // A cart with `lines.nodes`.
  if ((source as CartLike)?.lines?.nodes) {
    const nodes = (source as CartLike)!.lines!.nodes ?? [];
    return toGa4Items(nodes.map(lineToGa4Input));
  }
  // A single cart line.
  return toGa4Items([lineToGa4Input(source as CartLineLike)]);
}

function cartValue(cart: CartLike): number {
  const amount = cart?.cost?.totalAmount?.amount;
  if (amount == null) return 0;
  const n = Number.parseFloat(String(amount));
  return Number.isNaN(n) ? 0 : n;
}

function cartCurrency(cart: CartLike): string | undefined {
  return cart?.cost?.totalAmount?.currencyCode ?? undefined;
}
