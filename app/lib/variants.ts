import {useLocation} from 'react-router';
import type {SelectedOption} from '@shopify/hydrogen/storefront-api-types';
import {useMemo} from 'react';

export function useVariantUrl(
  handle: string,
  selectedOptions?: SelectedOption[],
) {
  const {pathname} = useLocation();

  return useMemo(() => {
    return getVariantUrl({
      handle,
      pathname,
      searchParams: new URLSearchParams(),
      selectedOptions,
    });
  }, [handle, selectedOptions, pathname]);
}

export function getVariantUrl({
  handle,
  pathname,
  searchParams,
  selectedOptions,
}: {
  handle: string;
  pathname: string;
  searchParams: URLSearchParams;
  selectedOptions?: SelectedOption[];
}) {
  const match = /(\/[a-zA-Z]{2}-[a-zA-Z]{2}\/)/g.exec(pathname);
  const isLocalePathname = match && match.length > 0;
  const localePrefix = isLocalePathname ? match![0] : '/';

  // `custom-token` is the builder's backing SKU, not a browsable PDP — its
  // /products/custom-token route 301s to the /custom-token wizard. Link grids,
  // cards, and recommendations straight to the wizard so we never emit the dead
  // PDP URL that only resolves via a redirect. (Locale-prefix preserving.)
  if (handle === 'custom-token') {
    return `${localePrefix}custom-token`.replace('//', '/');
  }

  const path = isLocalePathname
    ? `${match![0]}products/${handle}`
    : `/products/${handle}`;

  selectedOptions?.forEach((option) => {
    searchParams.set(option.name, option.value);
  });

  const searchString = searchParams.toString();

  return path + (searchString ? '?' + searchParams.toString() : '');
}
