import { api } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { Order, OrderSummary, PageRequest, PaginatedResponse } from '@/types';

export const ordersService = {
  getOrders: (params?: PageRequest & { status?: string; q?: string }) =>
    api.get<PaginatedResponse<OrderSummary>>(ENDPOINTS.orders.list, {
      params: params as Record<string, string | number>,
    }),
  getOrder: (orderNumber: string) => api.get<Order>(ENDPOINTS.orders.detail(orderNumber)),
  cancelOrder: (orderNumber: string, reason?: string) =>
    api.post<Order>(ENDPOINTS.orders.cancel(orderNumber), { reason }),
  requestReturn: (
    orderNumber: string,
    data: { reason: string; itemIds: number[]; notes?: string }
  ) => api.post<Order>(ENDPOINTS.orders.returnRequest(orderNumber), data),
  reorder: (orderNumber: string) => api.post<void>(ENDPOINTS.orders.reorder(orderNumber)),
};
