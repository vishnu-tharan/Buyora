'use client';
import type { WishlistItem as ItemType } from '@/types';

import { Button } from '@/components/ui/button';
import { useMoveToCart, useToggleWishlist } from '@/features/wishlist/use-wishlist-query';
import { formatCurrency, formatDate } from '@/lib/formatting';
import { ShoppingCart, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function WishlistItemCard({ item }: { item: ItemType }) {
  const router = useRouter();
  const toggleMutation = useToggleWishlist();
  const moveToCartMutation = useMoveToCart();

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleMutation.mutate(item.product.id);
  };

  const handleMoveToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(`/product/${item.product.slug}`);
  };

  const isUpdating = toggleMutation.isPending || moveToCartMutation.isPending;

  return (
    <div className="group bg-card flex flex-col overflow-hidden rounded-lg border transition-all hover:shadow-md">
      <div className="bg-muted relative aspect-square">
        <Link href={`/product/${item.product.slug}`}>
          <Image
            src={item.product?.primaryImage?.url || '/placeholder.svg'}
            alt={item.product.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        </Link>
        <button
          disabled={isUpdating}
          onClick={handleRemove}
          className="bg-background/80 hover:text-destructive absolute top-2 right-2 rounded-full p-2 opacity-100 backdrop-blur transition-opacity"
          aria-label="Remove from wishlist"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="text-muted-foreground mb-1 text-xs">
          {typeof item.product.brand === 'string' ? item.product.brand : item.product.brand?.name}
        </div>
        <Link
          href={`/product/${item.product.slug}`}
          className="mb-2 line-clamp-2 flex-1 font-medium hover:underline"
        >
          {item.product.name}
        </Link>

        <div className="mb-4 text-lg font-semibold">{formatCurrency(item.product.basePrice)}</div>

        <div className="text-muted-foreground mb-4 text-xs">
          {item.addedAt ? 'Added ' + formatDate(item.addedAt) : 'Saved on this device'}
        </div>

        <Button className="w-full" onClick={handleMoveToCart} disabled={isUpdating}>
          <ShoppingCart className="mr-2 h-4 w-4" /> Choose Options
        </Button>
      </div>
    </div>
  );
}
