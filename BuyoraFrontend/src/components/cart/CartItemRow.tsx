'use client';
import type { CartItem as ItemType } from '@/types';

import { Button } from '@/components/ui/button';
import { useRemoveCartItem, useUpdateCartItem } from '@/features/cart/use-cart-query';
import { useToggleWishlist } from '@/features/wishlist/use-wishlist-query';
import { formatCurrency } from '@/lib/formatting';
import { Heart, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export function CartItemRow({ item }: { item: ItemType }) {
  const updateMutation = useUpdateCartItem();
  const removeMutation = useRemoveCartItem();
  const wishlistMutation = useToggleWishlist();

  const handleUpdateQuantity = (newQuantity: number) => {
    if (newQuantity < 1) return;
    updateMutation.mutate({ itemId: item.id, data: { quantity: newQuantity } });
  };

  const handleRemove = () => {
    removeMutation.mutate(item.id);
  };

  const handleSaveForLater = () => {
    wishlistMutation.mutate(item.product.id, {
      onSuccess: () => handleRemove(),
    });
  };

  const isUpdating = updateMutation.isPending || removeMutation.isPending;

  return (
    <div
      className={`flex gap-4 p-4 sm:gap-6 sm:p-6 ${isUpdating ? 'pointer-events-none opacity-60' : ''}`}
    >
      <div className="bg-muted relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md sm:h-24 sm:w-24">
        <Image
          src={item.product?.primaryImage?.url || '/placeholder.svg'}
          alt={item.product.name}
          fill
          className="object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link
              href={`/product/${item.product.slug}`}
              className="line-clamp-2 font-medium hover:underline sm:text-lg"
            >
              {item.product.name}
            </Link>
            {item.variant?.attributes && Object.entries(item.variant.attributes).length > 0 && (
              <div className="text-muted-foreground mt-1 text-sm">
                {Object.entries(item.variant.attributes)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(' - ')}
              </div>
            )}
            <div className="text-muted-foreground mt-1 text-xs">SKU: {item.variant.sku}</div>
          </div>
          <div className="text-right font-semibold sm:text-lg">
            {formatCurrency(item.unitPrice)}
          </div>
        </div>

        {item.variant.availableQuantity < 5 && (
          <div className="text-destructive mt-2 text-sm">
            Only {item.variant.availableQuantity} left!
          </div>
        )}

        <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 items-center rounded-md border">
              <button
                onClick={() => handleUpdateQuantity(item.quantity - 1)}
                disabled={item.quantity <= 1}
                className="hover:bg-muted h-full px-3 disabled:opacity-50"
                aria-label="Decrease quantity"
              >
                -
              </button>
              <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
              <button
                onClick={() => handleUpdateQuantity(item.quantity + 1)}
                disabled={item.quantity >= item.variant.availableQuantity}
                className="hover:bg-muted h-full px-3 disabled:opacity-50"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
              onClick={handleSaveForLater}
              title="Save for Later"
            >
              <Heart className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive"
              onClick={handleRemove}
              title="Remove"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-lg font-semibold">
            Total: {formatCurrency(item.unitPrice * item.quantity)}
          </div>
        </div>
      </div>
    </div>
  );
}
