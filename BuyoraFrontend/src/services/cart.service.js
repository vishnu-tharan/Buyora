import { api } from '@/lib/api-client';
import { ENDPOINTS } from '@/lib/api-endpoints';

export const cartService = {
  getCart: () => api.get(ENDPOINTS.cart.get),
  addItem: (data) => api.post(ENDPOINTS.cart.add, data),
  updateItem: (itemId, data) => api.put(ENDPOINTS.cart.update(itemId), data),
  removeItem: (itemId) => api.delete(ENDPOINTS.cart.remove(itemId)),
  clearCart: () => api.delete(ENDPOINTS.cart.clear),
  applyCoupon: (code) => api.post(ENDPOINTS.cart.applyCoupon, { code }),
  removeCoupon: () => api.delete(ENDPOINTS.cart.removeCoupon),
  mergeCart: () => api.post(ENDPOINTS.cart.merge),
};
