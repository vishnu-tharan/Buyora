import type { ProductSummary } from './product';

export interface WishlistItem {
  id: number;
  product: ProductSummary;
  addedAt: string;
}

export interface Wishlist {
  items: WishlistItem[];
  totalItems: number;
}
