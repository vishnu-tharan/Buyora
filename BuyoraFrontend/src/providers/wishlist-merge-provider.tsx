'use client';
import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { useWishlistStore } from '@/stores/wishlist.store';
import { api } from '@/lib/api/client';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
export function WishlistMergeProvider() {
  const user = useAuthStore((s) => s.user);
  const local = useWishlistStore((s) => s.localWishlist);
  const attempted = useRef<string | null>(null);
  const client = useQueryClient();
  const { toast } = useToast();
  useEffect(() => {
    if (!user) {
      attempted.current = null;
      return;
    }
    if (!local.length) return;
    const key = user.id + ':' + local.join(',');
    if (attempted.current === key) return;
    attempted.current = key;
    const ids = local.filter((id) => Number.isSafeInteger(id) && id > 0).slice(0, 100);
    void api
      .post<{ mergedProductIds: number[] }>('/wishlist/merge', { productIds: ids })
      .then((result) => {
        result.mergedProductIds.forEach((id) => useWishlistStore.getState().removeLocal(id));
        void client.invalidateQueries({ queryKey: ['wishlist'] });
      })
      .catch(() =>
        toast.add({
          title: 'Your favourites are still saved in this browser',
          description: 'We could not sync them. Sign in again to retry.',
          type: 'error',
        })
      );
  }, [user, local, client, toast]);
  return null;
}
