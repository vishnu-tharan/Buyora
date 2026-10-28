import { api } from '@/lib/api-client';
import { ENDPOINTS } from '@/lib/api-endpoints';

export const checkoutService = {
  preview: () => api.post(ENDPOINTS.checkout.initiate),
  getShippingMethods: (params) =>
    api.get(ENDPOINTS.checkout.shippingMethods, {
      params: params,
    }),
  placeOrder: (data) => api.post(ENDPOINTS.checkout.placeOrder, data),
  initiatePayment: (data) => api.post(ENDPOINTS.payment.initiate, data),
  verifyPayment: (data) => api.post(ENDPOINTS.payment.verify, data),
  getPaymentStatus: (paymentId) => api.get(ENDPOINTS.payment.status(paymentId)),
};
