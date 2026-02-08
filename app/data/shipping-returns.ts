/**
 * Shipping & Returns Content Data
 *
 * Shipping methods, policies, and return information.
 * Used by the /support/shipping-returns page.
 */

export interface ShippingMethod {
  id: string;
  name: string;
  deliveryTime: string;
  price: string;
  description: string;
}

export interface PolicySection {
  id: string;
  title: string;
  content: string[];
}

export const FREE_SHIPPING_THRESHOLD = 75;

export const SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: 'standard',
    name: 'Standard Shipping',
    deliveryTime: '5–7 business days',
    price: '$4.99',
    description: 'Reliable USPS First Class delivery with tracking included.',
  },
  {
    id: 'expedited',
    name: 'Expedited Shipping',
    deliveryTime: '2–3 business days',
    price: '$9.99',
    description: 'USPS Priority Mail for faster delivery with full tracking.',
  },
  {
    id: 'overnight',
    name: 'Overnight Shipping',
    deliveryTime: '1 business day',
    price: '$24.99',
    description:
      'USPS Priority Mail Express for next-day delivery. Order by 12pm EST.',
  },
];

export const PROCESSING_INFO: PolicySection = {
  id: 'processing',
  title: 'Processing Times',
  content: [
    'Standard orders are processed within 1–2 business days.',
    'Engraved/personalized orders require an additional 1–2 business days for processing.',
    'Orders placed on weekends or holidays are processed the next business day.',
    'You will receive a shipping confirmation email with tracking once your order ships.',
  ],
};

export const INTERNATIONAL_SHIPPING: PolicySection = {
  id: 'international',
  title: 'International Shipping',
  content: [
    'We currently ship to the United States and Canada.',
    'Canadian orders typically arrive within 7–14 business days.',
    'International shipping rates are calculated at checkout based on destination and weight.',
    'Customs duties, import taxes, and brokerage fees may apply and are the responsibility of the recipient.',
  ],
};

export const RETURN_POLICY: PolicySection = {
  id: 'return-policy',
  title: 'Return Policy',
  content: [
    'Non-personalized items may be returned within 30 days of delivery.',
    'Items must be in original, unused condition with all packaging.',
    'Personalized (engraved) tokens cannot be returned unless damaged or incorrectly engraved.',
    'Sale items and gift cards are final sale and cannot be returned.',
  ],
};

export const REFUND_INFO: PolicySection = {
  id: 'refunds',
  title: 'Refunds',
  content: [
    'Refunds are processed within 5–7 business days of receiving your return.',
    'Refunds are issued to the original payment method.',
    'Original shipping costs are non-refundable unless the return is due to our error.',
    'You will receive an email confirmation once your refund has been processed.',
  ],
};

export const EXCHANGE_INFO: PolicySection = {
  id: 'exchanges',
  title: 'Exchanges',
  content: [
    'Free exchanges are available for non-personalized tokens within 30 days.',
    'Contact our support team to arrange an exchange.',
    'We will provide a prepaid return shipping label.',
    'Your replacement will ship as soon as we receive the original item.',
  ],
};

export const DAMAGED_ITEMS: PolicySection = {
  id: 'damaged',
  title: 'Damaged or Defective Items',
  content: [
    'Contact us within 48 hours of delivery with photos of any damage.',
    'We will ship a free replacement — no need to return the damaged item.',
    'If your engraving has an error made by us, we will replace it at no charge.',
    'Missing items from your order? Contact us and we will resolve it immediately.',
  ],
};
