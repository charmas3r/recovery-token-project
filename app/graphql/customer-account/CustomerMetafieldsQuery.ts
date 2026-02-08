// NOTE: https://shopify.dev/docs/api/customer/latest/objects/Customer
export const CUSTOMER_METAFIELDS_QUERY = `#graphql
  query CustomerMetafields($language: LanguageCode) @inContext(language: $language) {
    customer {
      metafields(identifiers: [
        {namespace: "custom", key: "recovery_circle"},
        {namespace: "custom", key: "sobriety_date"},
        {namespace: "custom", key: "recovery_program"},
        {namespace: "custom", key: "milestone_reminders"}
      ]) {
        key
        namespace
        value
        type
      }
    }
  }
` as const;
