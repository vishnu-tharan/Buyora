import { trackEvent } from '@/lib/analytics/events';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { wishlistService } from '@/services/wishlist.service';
import { useWishlistStore } from '@/stores/wishlist.store';
import type { Wishlist } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useWishlistQuery() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['wishlist'],
    queryFn: () => wishlistService.getWishlist(),
    enabled: !!user,
  });
}

export function useToggleWishlist() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const store = useWishlistStore();

  return useMutation({
    mutationFn: async (productId: number) => {
      if (!user) {
        if (store.isInWishlist(productId)) {
          store.removeLocal(productId);
        } else {
          store.addLocal(productId);
          trackEvent({ type: 'add_to_wishlist', productId });
        }
        return null;
      }

      const currentWishlist = queryClient.getQueryData<Wishlist>(['wishlist']);
      const exists = currentWishlist?.items.some((item) => item.product.id === productId);

      if (exists) {
        return wishlistService.removeItem(productId);
      } else {
        const added = await wishlistService.addItem(productId);
        trackEvent({ type: 'add_to_wishlist', productId });
        return added;
      }
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.setQueryData(['wishlist'], data);
      }
    },
  });
}

export function useMoveToCart() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      productId,
      variantId,
      quantity,
    }: {
      productId: number;
      variantId: number;
      quantity: number;
    }) => wishlistService.moveToCart(productId, variantId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.add({ title: 'Moved to cart successfully' });
    },
    onError: () => {
      toast.add({ title: 'Failed to move to cart' });
    },
  });
}
