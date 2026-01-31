/// <reference types="vite/client" />
/// <reference types="react-router" />
/// <reference types="@shopify/oxygen-workers-types" />
/// <reference types="@shopify/hydrogen/react-router-types" />

// Enhance TypeScript's built-in typings.
import '@total-typescript/ts-reset';

// Augment the Env interface with Judge.me environment variables
declare module '@shopify/oxygen-workers-types' {
  export interface Env {
    // Judge.me Reviews Integration (optional)
    JUDGEME_PUBLIC_TOKEN?: string;
    JUDGEME_PRIVATE_TOKEN?: string;
    PUBLIC_JUDGEME_SHOP_DOMAIN?: string;
  }
}
