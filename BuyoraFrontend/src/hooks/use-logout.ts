'use client';
import { toast } from '@/components/ui/toast';
import { authService } from '@/services/auth.service';
import { useAuthStore, useCartStore, useCheckoutStore } from '@/stores';
import { useMutation, useQueryClient } from '@tanstack/react-query';
export function useLogout() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: authService.logout,
    onSuccess: async () => {
      await client.cancelQueries();
      client.clear();
      useAuthStore.getState().logout();
      useCartStore.getState().setCart(null);
      useCheckoutStore.getState().reset();
      sessionStorage.removeItem('currentPaymentId');
      sessionStorage.removeItem('currentOrderNumber');
      sessionStorage.removeItem('checkoutKey');
      window.location.assign(new URL('/login', window.location.origin).href);
    },
    onError: () =>
      toast.add({
        title: 'Sign out failed',
        description: 'Please try again to end your session.',
        type: 'error',
      }),
  });
}
