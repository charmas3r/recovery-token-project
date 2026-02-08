/**
 * FAQ Content Data
 *
 * Frequently asked questions organized by category.
 * Used by the /support/faq page.
 */

export type FAQCategory =
  | 'Orders & Shipping'
  | 'Returns & Exchanges'
  | 'Engraving & Personalization'
  | 'Product Information'
  | 'Account & Payment';

export const FAQ_CATEGORIES: FAQCategory[] = [
  'Orders & Shipping',
  'Returns & Exchanges',
  'Engraving & Personalization',
  'Product Information',
  'Account & Payment',
];

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: FAQCategory;
}

export const FAQ_ITEMS: FAQItem[] = [
  // Orders & Shipping
  {
    id: 'how-long-shipping',
    question: 'How long does shipping take?',
    answer:
      'Standard shipping takes 5–7 business days within the US. Expedited shipping (2–3 business days) and overnight options are also available at checkout. Processing time is 1–2 business days for standard orders.',
    category: 'Orders & Shipping',
  },
  {
    id: 'free-shipping',
    question: 'Do you offer free shipping?',
    answer:
      'Yes! We offer free standard shipping on all US orders over $75. This is automatically applied at checkout — no coupon code needed.',
    category: 'Orders & Shipping',
  },
  {
    id: 'international-shipping',
    question: 'Do you ship internationally?',
    answer:
      'We currently ship to the US and Canada. International shipping to Canada typically takes 7–14 business days. Customs duties and taxes may apply and are the responsibility of the recipient.',
    category: 'Orders & Shipping',
  },
  {
    id: 'track-order',
    question: 'How do I track my order?',
    answer:
      'Once your order ships, you will receive a confirmation email with a tracking number and link. You can also track your order by logging into your account and viewing your order history.',
    category: 'Orders & Shipping',
  },
  // Returns & Exchanges
  {
    id: 'return-policy',
    question: 'What is your return policy?',
    answer:
      'We accept returns within 30 days of delivery for non-personalized items in their original condition and packaging. Personalized (engraved) tokens cannot be returned unless they arrive damaged or with an engraving error.',
    category: 'Returns & Exchanges',
  },
  {
    id: 'start-return',
    question: 'How do I start a return?',
    answer:
      'To initiate a return, contact our support team at support@recoverytokenstore.com with your order number. We will provide you with a prepaid return shipping label and instructions.',
    category: 'Returns & Exchanges',
  },
  {
    id: 'exchange-item',
    question: 'Can I exchange an item for a different design?',
    answer:
      'Yes! We offer free exchanges for non-personalized tokens. Simply contact us within 30 days of delivery and we will arrange the exchange. You will receive a prepaid shipping label for the return.',
    category: 'Returns & Exchanges',
  },
  {
    id: 'damaged-item',
    question: 'What if my item arrives damaged?',
    answer:
      'If your token arrives damaged, please contact us within 48 hours of delivery with photos of the damage. We will ship a replacement at no cost to you, and you will not need to return the damaged item.',
    category: 'Returns & Exchanges',
  },
  // Engraving & Personalization
  {
    id: 'engraving-options',
    question: 'What engraving options are available?',
    answer:
      'We offer custom engraving on select token designs. You can add a sobriety date, initials, a short message (up to 20 characters), or a name. Engraving is done with precision laser etching for a clean, lasting finish.',
    category: 'Engraving & Personalization',
  },
  {
    id: 'engraving-time',
    question: 'Does engraving add to processing time?',
    answer:
      'Yes, engraved orders require an additional 1–2 business days for processing. Total processing for engraved tokens is typically 2–4 business days before shipping.',
    category: 'Engraving & Personalization',
  },
  {
    id: 'engraving-preview',
    question: 'Can I preview my engraving before it is made?',
    answer:
      'You can see a live preview of your engraving text on the product page before adding to cart. The preview shows approximate placement and sizing. If you have special requests, contact us before ordering.',
    category: 'Engraving & Personalization',
  },
  {
    id: 'engraving-error',
    question: 'What happens if my engraving has an error?',
    answer:
      'If we make an engraving error, we will replace the token at no charge. Please double-check your engraving text at checkout. Errors in customer-provided text (typos, wrong dates) cannot be corrected after production begins.',
    category: 'Engraving & Personalization',
  },
  // Product Information
  {
    id: 'token-material',
    question: 'What are the tokens made of?',
    answer:
      'Our tokens are crafted from premium bronze alloy, designed to develop a beautiful patina over time. Each token is individually die-struck for crisp detail and a satisfying weight in your hand.',
    category: 'Product Information',
  },
  {
    id: 'token-size',
    question: 'How big are the tokens?',
    answer:
      'Our standard tokens are 39mm in diameter (about 1.5 inches) and approximately 3mm thick. This is similar in size to a traditional AA medallion, designed to fit comfortably in a pocket or hand.',
    category: 'Product Information',
  },
  {
    id: 'token-care',
    question: 'How should I care for my token?',
    answer:
      'Bronze tokens naturally develop a rich patina over time, which many people love. To maintain the original shine, gently clean with a soft cloth. Avoid harsh chemicals or abrasive cleaners. Store in the included velvet pouch when not carrying.',
    category: 'Product Information',
  },
  {
    id: 'gift-options',
    question: 'Do you offer gift wrapping or gift sets?',
    answer:
      'Yes! We offer curated gift sets that include a token, velvet pouch, and a congratulations card. Gift wrapping is available at checkout for individual tokens as well. We can also include a personalized gift message.',
    category: 'Product Information',
  },
  // Account & Payment
  {
    id: 'payment-methods',
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit cards (Visa, Mastercard, American Express, Discover), PayPal, Apple Pay, Google Pay, and Shop Pay. All transactions are securely processed and encrypted.',
    category: 'Account & Payment',
  },
  {
    id: 'create-account',
    question: 'Do I need an account to place an order?',
    answer:
      'No, you can check out as a guest. However, creating an account lets you track orders, save addresses, view order history, and check out faster on future purchases.',
    category: 'Account & Payment',
  },
];
