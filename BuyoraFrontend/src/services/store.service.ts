import { api } from '@/lib/api/client';
export interface StoreInfo {
  businessName: string;
  businessAddress: string;
  supportEmail: string;
  whatsappNumber: string;
  supportHours: string;
  returnWindowDays?: number;
  freeReturnShipping: boolean;
}
export interface DeliveryQuote {
  district: string;
  minDays: number;
  maxDays: number;
  codAvailable: boolean;
  methods: { id: string; name: string; price: number; description: string }[];
}
export const storeService = {
  info: () => api.get<StoreInfo>('/store/info'),
  delivery: (district: string) =>
    api.get<DeliveryQuote>('/store/delivery', { params: { district } }),
};
export const unavailableStoreInfo: StoreInfo = {
  businessName: 'Buyora',
  businessAddress: '',
  supportEmail: '',
  whatsappNumber: '',
  supportHours: '',
  freeReturnShipping: false,
};
