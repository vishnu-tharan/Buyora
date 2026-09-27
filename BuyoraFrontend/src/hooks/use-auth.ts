import { isAdmin } from '@/lib/auth';
import { useAuthStore } from '@/stores';

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const logout = useAuthStore((state) => state.logout);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: isAdmin(user),
    logout,
  };
}
