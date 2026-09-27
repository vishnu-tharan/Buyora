import { api } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type {
  InitiatePaymentRequest,
  Order,
  PaymentInitiationResponse,
  ShippingMethod,
} from '@/types';

export const checkoutService = {
  preview: () =>
    api.post<{
      summary: import('@/types').CartSummary;
      paymentMethods: import('@/types').PaymentMethod[];
      shippingMethods: ShippingMethod[];
    }>(ENDPOINTS.checkout.initiate),
  getShippingMethods: (params?: { addressId?: number }) =>
    api.get<ShippingMethod[]>(ENDPOINTS.checkout.shippingMethods, {
      params: params as Record<string, string | number>,
    }),

  placeOrder: (data: unknown) => api.post<Order>(ENDPOINTS.checkout.placeOrder, data),

  initiatePayment: (data: InitiatePaymentRequest) =>
    api.post<PaymentInitiationResponse>(ENDPOINTS.payment.initiate, data),

  verifyPayment: (data: Record<string, string>) =>
    api.post<{ status: string; orderNumber: string }>(ENDPOINTS.payment.verify, data),

  getPaymentStatus: (paymentId: string) =>
    api.get<{ status: string; orderNumber: string }>(ENDPOINTS.payment.status(paymentId)),
};
