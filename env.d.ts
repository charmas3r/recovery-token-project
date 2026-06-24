/// <reference types="vite/client" />
/// <reference types="react-router" />
/// <reference types="@shopify/oxygen-workers-types" />
/// <reference types="@shopify/hydrogen/react-router-types" />

// Enhance TypeScript's built-in typings.
import '@total-typescript/ts-reset';

// Augment the Env interface with custom environment variables
declare module '@shopify/oxygen-workers-types' {
  export interface Env {
    // Klaviyo Email & Marketing Integration
    KLAVIYO_PRIVATE_API_KEY?: string;
    KLAVIYO_NEWSLETTER_LIST_ID?: string;

    // Shopify Admin API (metafields, discounts, file uploads)
    SHOPIFY_ADMIN_API_TOKEN?: string;

    // Judge.me Reviews Integration (optional)
    JUDGEME_PUBLIC_TOKEN?: string;
    JUDGEME_PRIVATE_TOKEN?: string;
    PUBLIC_JUDGEME_SHOP_DOMAIN?: string;

    // PostHog Analytics (optional)
    VITE_PUBLIC_POSTHOG_KEY?: string;
    VITE_PUBLIC_POSTHOG_HOST?: string;

    // GA4 + Meta Pixel (optional; consent-gated, no-op when unset)
    PUBLIC_GA4_MEASUREMENT_ID?: string;
    PUBLIC_META_PIXEL_ID?: string;

    // AI Image Generation
    AI_IMAGE_PROVIDER?: string;
    OPENAI_API_KEY?: string;
    AI_MAX_GENERATIONS_PER_SESSION?: string;
    AI_MAX_GENERATIONS_PER_DAY?: string;
  }
}
