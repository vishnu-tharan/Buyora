import { api } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { Wishlist } from '@/types';

export const wishlistService = {
  getWishlist: () => api.get<Wishlist>(ENDPOINTS.wishlist.get),
  addItem: (productId: number, variantId?: number) =>
    api.post<Wishlist>(ENDPOINTS.wishlist.add, { productId, variantId }),
  removeItem: (productId: number) => api.delete<Wishlist>(ENDPOINTS.wishlist.remove(productId)),
  moveToCart: (productId: number, variantId: number, quantity: number) =>
    api.post<Wishlist>(ENDPOINTS.wishlist.moveToCart(productId), { variantId, quantity }),
};
