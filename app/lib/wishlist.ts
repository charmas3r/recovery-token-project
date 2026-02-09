export interface WishlistItem {
  productHandle: string;
  addedAt: string; // ISO date
}

export type Wishlist = WishlistItem[];

export function parseWishlist(value: string | null | undefined): Wishlist {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed as Wishlist;
  } catch {
    return [];
  }
}

export function serializeWishlist(wishlist: Wishlist): string {
  return JSON.stringify(wishlist);
}

export function isInWishlist(wishlist: Wishlist, handle: string): boolean {
  return wishlist.some((item) => item.productHandle === handle);
}
