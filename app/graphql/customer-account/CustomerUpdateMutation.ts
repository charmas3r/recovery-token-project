// NOTE: https://shopify.dev/docs/api/customer/latest/mutations/customerUpdate
export const CUSTOMER_UPDATE_MUTATION = `#graphql
  mutation customerUpdate(
    $customer: CustomerUpdateInput!
    $language: LanguageCode
  ) @inContext(language: $language) {
    customerUpdate(input: $customer) {
      customer {
        id
        firstName
        lastName
        emailAddress {
          emailAddress
        }
        phoneNumber {
          phoneNumber
        }
      }
      userErrors {
        code
        field
        message
      }
    }
  }
` as const;

// NOTE: https://shopify.dev/docs/api/customer/latest/mutations/customerEmailMarketingConsentUpdate
export const CUSTOMER_EMAIL_MARKETING_MUTATION = `#graphql
  mutation customerEmailMarketingConsentUpdate(
    $input: CustomerEmailMarketingConsentUpdateInput!
    $language: LanguageCode
  ) @inContext(language: $language) {
    customerEmailMarketingConsentUpdate(input: $input) {
      customer {
        id
        emailAddress {
          emailAddress
          marketingState
        }
      }
      userErrors {
        code
        field
        message
      }
    }
  }
` as const;

// NOTE: https://shopify.dev/docs/api/customer/latest/mutations/customerSmsMarketingConsentUpdate
export const CUSTOMER_SMS_MARKETING_MUTATION = `#graphql
  mutation customerSmsMarketingConsentUpdate(
    $input: CustomerSmsMarketingConsentUpdateInput!
    $language: LanguageCode
  ) @inContext(language: $language) {
    customerSmsMarketingConsentUpdate(input: $input) {
      customer {
        id
        phoneNumber {
          phoneNumber
          marketingState
        }
      }
      userErrors {
        code
        field
        message
      }
    }
  }
` as const;
