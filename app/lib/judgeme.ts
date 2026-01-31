/**
 * Judge.me Shared Utilities
 * 
 * These utilities can be used on both client and server.
 */

/**
 * Extract numeric product ID from Shopify GID
 * Judge.me expects numeric ID, not full GID
 * 
 * @example
 * extractProductId('gid://shopify/Product/123456') // returns '123456'
 */
export function extractProductId(gid: string): string {
  return gid.split('/').pop() || gid;
}
