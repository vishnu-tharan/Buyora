import { api } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { AddToCartRequest, Cart, UpdateCartItemRequest } from '@/types';

export const cartService = {
  getCart: () => api.get<Cart>(ENDPOINTS.cart.get),
  addItem: (data: AddToCartRequest) => api.post<Cart>(ENDPOINTS.cart.add, data),
  updateItem: (itemId: number, data: UpdateCartItemRequest) =>
    api.put<Cart>(ENDPOINTS.cart.update(itemId), data),
  removeItem: (itemId: number) => api.delete<Cart>(ENDPOINTS.cart.remove(itemId)),
  clearCart: () => api.delete<void>(ENDPOINTS.cart.clear),
  applyCoupon: (code: string) => api.post<Cart>(ENDPOINTS.cart.applyCoupon, { code }),
  removeCoupon: () => api.delete<Cart>(ENDPOINTS.cart.removeCoupon),
  mergeCart: () => api.post<Cart>(ENDPOINTS.cart.merge),
};
