import { api } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type {
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  User,
} from '@/types';

export const authService = {
  login: (data: LoginRequest) => api.post<User>(ENDPOINTS.auth.login, data),

  register: (data: RegisterRequest) => api.post<User>(ENDPOINTS.auth.register, data),

  logout: () => api.post<void>(ENDPOINTS.auth.logout),

  refresh: () => api.post<void>(ENDPOINTS.auth.refresh),

  getMe: () => api.get<User>(ENDPOINTS.auth.me),

  forgotPassword: (data: ForgotPasswordRequest) =>
    api.post<void>(ENDPOINTS.auth.forgotPassword, data),

  resetPassword: (data: ResetPasswordRequest) =>
    api.post<void>(ENDPOINTS.auth.resetPassword, { token: data.token, newPassword: data.password }),

  changePassword: (data: ChangePasswordRequest) =>
    api.post<void>(ENDPOINTS.account.changePassword, data),
};
