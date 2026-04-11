/**
 * Schema.org JSON-LD builders.
 * Pure functions — callers pipe the result into <JsonLd data={...} />.
 */

const SITE_URL = 'https://coinplugz.com';

export interface BreadcrumbItem {
  name: string;
  path: string;
}

/**
 * Build a Schema.org BreadcrumbList object for JSON-LD output.
 *
 * The caller is responsible for including the `Home` entry as the first item
 * when appropriate — the function does not prepend it for you, so the
 * breadcrumb trail stays under the caller's control and matches the visible UI.
 */
export function buildBreadcrumbList(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path.startsWith('/') ? item.path : `/${item.path}`}`,
    })),
  };
}
