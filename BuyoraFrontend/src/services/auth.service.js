import { api } from '@/lib/api-client';
import { ENDPOINTS } from '@/lib/api-endpoints';

export const authService = {
  login: (data) => api.post(ENDPOINTS.auth.login, data),
  register: (data) => api.post(ENDPOINTS.auth.register, data),
  logout: () => api.post(ENDPOINTS.auth.logout),
  refresh: () => api.post(ENDPOINTS.auth.refresh),
  getMe: () => api.get(ENDPOINTS.auth.me),
  changePassword: (data) => api.post(ENDPOINTS.account.changePassword, data),
};
