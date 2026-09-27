'use client';

import { CartItemRow } from '@/components/cart/CartItemRow';
import { CartItemSkeleton } from '@/components/cart/CartItemSkeleton';
import { CartSummary } from '@/components/cart/CartSummary';
import { Button } from '@/components/ui/button';
import { useCartQuery } from '@/features/cart/use-cart-query';
import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export function CartPageClient() {
  const { data: cart, isLoading, isError, refetch } = useCartQuery();

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold">Shopping Cart</h1>
        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="flex-1 space-y-4">
            <CartItemSkeleton />
            <CartItemSkeleton />
          </div>
          <div className="bg-muted/20 h-[400px] w-full animate-pulse rounded-lg lg:w-[380px]"></div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="mb-4 text-2xl font-bold">Unable to load your cart</h2>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  const items = cart?.items || [];

  if (items.length === 0) {
    return (
      <div className="container mx-auto flex max-w-4xl flex-col items-center px-4 py-16 text-center">
        <ShoppingBag className="text-muted mb-6 h-24 w-24" strokeWidth={1} />
        <h1 className="mb-2 text-3xl font-bold">Your cart is empty</h1>
        <p className="text-muted-foreground mb-8">
          Looks like you haven&apos;t added anything yet.
        </p>
        <Button size="lg" render={<Link href="/" />}>
          Start Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Shopping Cart ({cart?.itemCount || 0})</h1>

      <div className="flex flex-col items-start gap-8 lg:flex-row">
        <div className="w-full flex-1 space-y-6">
          <div className="bg-card divide-y rounded-lg border">
            {items.map((item) => (
              <CartItemRow key={item.id} item={item} />
            ))}
          </div>
        </div>

        <div className="sticky top-24 w-full lg:w-[380px]">
          <CartSummary summary={cart!.summary} />
        </div>
      </div>
    </div>
  );
}
