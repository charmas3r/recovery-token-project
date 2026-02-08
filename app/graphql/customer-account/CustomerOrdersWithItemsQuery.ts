// Orders with line items and customAttributes for gift history
export const CUSTOMER_ORDERS_WITH_ITEMS_QUERY = `#graphql
  fragment OrderMoney on MoneyV2 {
    amount
    currencyCode
  }
  fragment GiftLineItem on LineItem {
    id
    title
    quantity
    image {
      altText
      url
      width
      height
    }
    price {
      ...OrderMoney
    }
    variantTitle
    customAttributes {
      key
      value
    }
  }
  query CustomerOrdersWithItems($language: LanguageCode, $first: Int!) @inContext(language: $language) {
    customer {
      orders(first: $first, sortKey: PROCESSED_AT, reverse: true) {
        nodes {
          id
          name
          processedAt
          lineItems(first: 50) {
            nodes {
              ...GiftLineItem
            }
          }
        }
      }
    }
  }
` as const;
