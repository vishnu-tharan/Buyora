import { api } from '@/lib/api-client';
import { ENDPOINTS } from '@/lib/api-endpoints';

export const accountService = {
  getProfile: () => api.get(ENDPOINTS.account.profile),
  updateProfile: (data) => api.put(ENDPOINTS.account.updateProfile, data),
  getAddresses: async () =>
    (await api.get(ENDPOINTS.account.addresses)).map((a) => ({
      ...a,
      isDefault: a.isDefaultShipping,
    })),
  addAddress: (data) =>
    api.post(ENDPOINTS.account.addAddress, {
      ...data,
      countryCode: 'LK',
      isDefaultShipping: data.isDefault,
      isDefaultBilling: data.isDefault,
    }),
  updateAddress: (id, data) =>
    api.put(ENDPOINTS.account.updateAddress(id), {
      ...data,
      countryCode: 'LK',
      isDefaultShipping: data.isDefault,
      isDefaultBilling: data.isDefault,
    }),
  deleteAddress: (id) => api.delete(ENDPOINTS.account.deleteAddress(id)),
  setDefaultAddress: (id) => api.patch(ENDPOINTS.account.setDefaultAddress(id)),
};
