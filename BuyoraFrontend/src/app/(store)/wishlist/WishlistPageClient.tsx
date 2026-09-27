'use client';

import { Button, buttonVariants } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/skeleton';
import { WishlistItemCard } from '@/components/wishlist/WishlistItemCard';
import { useWishlistQuery } from '@/features/wishlist/use-wishlist-query';
import { useAuth } from '@/hooks/use-auth';
import { api } from '@/lib/api/client';
import { useWishlistStore } from '@/stores/wishlist.store';
import type { ProductSummary } from '@/types';
import { useQueries } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import Link from 'next/link';

export function WishlistPageClient() {
  const { user } = useAuth();
  const { data: wishlist, isLoading, isError } = useWishlistQuery();
  const { localWishlist } = useWishlistStore();

  const isGuest = !user;
  const guestQueries = useQueries({
    queries: (isGuest ? localWishlist : []).map((id) => ({
      queryKey: ['wishlist-product', id],
      queryFn: () => api.get<ProductSummary>('/products/by-id/' + id),
      retry: false,
    })),
  });
  const items = isGuest ? localWishlist : wishlist?.items || [];

  if (isLoading && !isGuest) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold">My Wishlist</h1>
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="aspect-square w-full rounded-md" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError)
    return <ErrorState title="Unable to load your wishlist" message="Please try again later." />;
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">
        My Wishlist {!isGuest && wishlist ? `(${wishlist.totalItems})` : ''}
      </h1>

      {isGuest && (
        <div className="bg-muted mb-8 flex flex-wrap items-center justify-between gap-4 rounded-lg p-4 text-sm">
          <p>
            Sign in to save your wishlist permanently across devices and see full product details.
          </p>
          <Link href="/login" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
            Sign In
          </Link>
        </div>
      )}

      {items.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <Heart className="text-muted mb-6 h-24 w-24" strokeWidth={1} />
          <h2 className="mb-2 text-2xl font-bold">Your wishlist is empty</h2>
          <p className="text-muted-foreground mb-8">
            Save items you love to find them easily later.
          </p>
          <Link href="/" className={buttonVariants({ size: 'lg' })}>
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {isGuest
            ? guestQueries.map((result, index) =>
                result.data ? (
                  <WishlistItemCard
                    key={localWishlist[index]}
                    item={{ id: localWishlist[index], product: result.data, addedAt: '' }}
                  />
                ) : (
                  <div key={localWishlist[index]} className="rounded-lg border p-4">
                    <p>
                      {result.isLoading ? 'Loading saved item…' : 'This saved item is unavailable.'}
                    </p>
                    <Button
                      onClick={() => useWishlistStore.getState().removeLocal(localWishlist[index])}
                      variant="outline"
                    >
                      Remove
                    </Button>
                  </div>
                )
              )
            : wishlist?.items.map((item) => <WishlistItemCard key={item.id} item={item} />)}
        </div>
      )}
    </div>
  );
}
