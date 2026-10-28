import { api } from '@/lib/api-client';
import { ENDPOINTS } from '@/lib/api-endpoints';

export const ordersService = {
  getOrders: (params) =>
    api.get(ENDPOINTS.orders.list, {
      params: params,
    }),
  getReturns: (number) => api.get('/orders/' + encodeURIComponent(number) + '/returns'),
  getOrder: (orderNumber) => api.get(ENDPOINTS.orders.detail(orderNumber)),
  cancelOrder: (orderNumber, reason) => api.post(ENDPOINTS.orders.cancel(orderNumber), { reason }),
  requestReturn: (orderNumber, data) => api.post(ENDPOINTS.orders.returnRequest(orderNumber), data),
  reorder: (orderNumber) => api.post(ENDPOINTS.orders.reorder(orderNumber)),
};
