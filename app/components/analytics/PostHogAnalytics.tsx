import {useAnalytics} from '@shopify/hydrogen';
import {useEffect} from 'react';
import posthog from 'posthog-js';

interface PostHogAnalyticsProps {
  postHogKey: string;
  postHogHost?: string;
}

export function PostHogAnalytics({
  postHogKey,
  postHogHost = 'https://us.i.posthog.com',
}: PostHogAnalyticsProps) {
  const {subscribe, register} = useAnalytics();
  const {ready} = register('PostHog');

  useEffect(() => {
    posthog.init(postHogKey, {
      api_host: postHogHost,
      capture_pageview: false, // We capture manually via Hydrogen events
      capture_pageleave: true,
      autocapture: true, // Clicks, form submissions, etc.
    });

    subscribe('page_viewed', (data) => {
      posthog.capture('$pageview', {
        $current_url: data.url,
      });
    });

    subscribe('product_viewed', (data) => {
      const product = data.products?.[0];
      if (product) {
        posthog.capture('product_viewed', {
          product_id: product.id,
          product_title: product.title,
          product_vendor: product.vendor,
          product_type: product.productType,
          product_price: product.price?.amount,
          product_currency: product.price?.currencyCode,
          variant_id: product.variantId,
          variant_title: product.variantTitle,
        });
      }
    });

    subscribe('collection_viewed', (data) => {
      posthog.capture('collection_viewed', {
        collection_id: data.collection?.id,
        collection_handle: data.collection?.handle,
      });
    });

    subscribe('search_viewed', (data) => {
      posthog.capture('search_viewed', {
        search_term: data.searchTerm,
        result_count: data.searchResults?.length,
      });
    });

    subscribe('cart_viewed', (data) => {
      posthog.capture('cart_viewed', {
        cart_id: data.cart?.id,
        cart_total: data.cart?.cost?.totalAmount?.amount,
        cart_currency: data.cart?.cost?.totalAmount?.currencyCode,
        cart_item_count: data.cart?.totalQuantity,
      });
    });

    subscribe('cart_updated', (data) => {
      posthog.capture('cart_updated', {
        cart_id: data.cart?.id,
        cart_total: data.cart?.cost?.totalAmount?.amount,
        cart_currency: data.cart?.cost?.totalAmount?.currencyCode,
        cart_item_count: data.cart?.totalQuantity,
        prev_cart_item_count: data.prevCart?.totalQuantity,
      });
    });

    ready();
  }, [subscribe, register, postHogKey, postHogHost, ready]);

  return null;
}
