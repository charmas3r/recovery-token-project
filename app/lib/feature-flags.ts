/**
 * Feature Flags — Simple toggle for in-progress features.
 *
 * Flip these booleans to show/hide features across the storefront.
 * When a feature is ready for production, remove the flag and
 * all conditional checks that reference it.
 */

export const FEATURE_FLAGS = {
  /** Custom token designer (/custom-token) — hidden until launch-ready */
  CUSTOM_TOKEN: true,
} as const;
