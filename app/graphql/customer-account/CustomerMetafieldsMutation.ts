// NOTE: https://shopify.dev/docs/api/customer/latest/mutations/metafieldsSet
export const CUSTOMER_METAFIELDS_SET_MUTATION = `#graphql
  mutation CustomerMetafieldsSet(
    $metafields: [MetafieldsSetInput!]!
    $language: LanguageCode
  ) @inContext(language: $language) {
    metafieldsSet(metafields: $metafields) {
      metafields {
        key
        namespace
        value
        type
      }
      userErrors {
        code
        field
        message
      }
    }
  }
` as const;
