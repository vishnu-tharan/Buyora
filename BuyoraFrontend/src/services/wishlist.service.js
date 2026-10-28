import { api } from '@/lib/api-client';
import { ENDPOINTS } from '@/lib/api-endpoints';

export const wishlistService = {
  getWishlist: () => api.get(ENDPOINTS.wishlist.get),
  addItem: (productId, variantId) => api.post(ENDPOINTS.wishlist.add, { productId, variantId }),
  removeItem: (productId) => api.delete(ENDPOINTS.wishlist.remove(productId)),
  moveToCart: (productId, variantId, quantity) =>
    api.post(ENDPOINTS.wishlist.moveToCart(productId), { variantId, quantity }),
};
