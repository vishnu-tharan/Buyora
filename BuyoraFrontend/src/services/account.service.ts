import { api } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { Address, User } from '@/types';

export const accountService = {
  getProfile: () => api.get<User>(ENDPOINTS.account.profile),
  updateProfile: (data: Partial<User>) => api.put<User>(ENDPOINTS.account.updateProfile, data),
  getAddresses: async () =>
    (await api.get<(Address & { isDefaultShipping: boolean })[]>(ENDPOINTS.account.addresses)).map(
      (a) => ({ ...a, isDefault: a.isDefaultShipping })
    ),
  addAddress: (data: Omit<Address, 'id' | 'publicId'>) =>
    api.post<Address>(ENDPOINTS.account.addAddress, {
      ...data,
      countryCode: 'LK',
      isDefaultShipping: data.isDefault,
      isDefaultBilling: data.isDefault,
    }),
  updateAddress: (id: string, data: Partial<Address>) =>
    api.put<Address>(ENDPOINTS.account.updateAddress(id), {
      ...data,
      countryCode: 'LK',
      isDefaultShipping: data.isDefault,
      isDefaultBilling: data.isDefault,
    }),
  deleteAddress: (id: string) => api.delete<void>(ENDPOINTS.account.deleteAddress(id)),
  setDefaultAddress: (id: string) => api.patch<Address>(ENDPOINTS.account.setDefaultAddress(id)),
};
