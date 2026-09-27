'use client';

import { BuyoraApiError } from '@/lib/api/client';
import { authService } from '@/services';
import { useAuthStore } from '@/stores';
import { useQuery } from '@tanstack/react-query';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser } = useAuthStore();

  useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      try {
        let user;
        try {
          user = await authService.getMe();
        } catch (error) {
          if (!(error instanceof BuyoraApiError) || !error.isUnauthorized) throw error;
          await authService.refresh();
          user = await authService.getMe();
        }
        setUser(user);
        return user;
      } catch (error) {
        if (error instanceof BuyoraApiError && error.isUnauthorized) {
          setUser(null);
          return null;
        }
        setUser(null);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });

  return <>{children}</>;
}
