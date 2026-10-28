import { api } from '@/lib/api-client';

export const storeService = {
  info: () => api.get('/store/info'),
  delivery: (district) => api.get('/store/delivery', { params: { district } }),
};

export const unavailableStoreInfo = {
  businessName: 'Buyora',
  businessAddress: '',
  whatsappNumber: '',
  supportHours: '',
  freeReturnShipping: false,
};
