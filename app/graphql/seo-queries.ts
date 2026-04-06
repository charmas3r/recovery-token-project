/**
 * GraphQL queries for SEO landing pages.
 *
 * Fetches products by handle and collections with products
 * for product showcases on landing pages.
 */

export const SEO_PRODUCT_FRAGMENT = `#graphql
  fragment SEOMoneyProduct on MoneyV2 {
    amount
    currencyCode
  }
  fragment SEOProduct on Product {
    id
    handle
    title
    featuredImage {
      id
      altText
      url
      width
      height
    }
    priceRange {
      minVariantPrice {
        ...SEOMoneyProduct
      }
      maxVariantPrice {
        ...SEOMoneyProduct
      }
    }
  }
` as const;

export const COLLECTION_WITH_PRODUCTS_QUERY = `#graphql
  ${SEO_PRODUCT_FRAGMENT}
  query SEOCollectionWithProducts(
    $handle: String!
    $first: Int!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      products(first: $first) {
        nodes {
          ...SEOProduct
        }
      }
    }
  }
` as const;

export const PRODUCTS_BY_HANDLES_QUERY = `#graphql
  ${SEO_PRODUCT_FRAGMENT}
  query SEOProductsByHandles(
    $first: Int!
    $query: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    products(first: $first, query: $query) {
      nodes {
        ...SEOProduct
      }
    }
  }
` as const;
