'use client';

import { Button, buttonVariants } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useCartQuery, useRemoveCartItem, useUpdateCartItem } from '@/features/cart/use-cart-query';
import { formatCurrency } from '@/lib/formatting';
import { useCartStore } from '@/stores/cart.store';
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export function CartDrawer() {
  const { isOpen: isCartOpen, closeCart } = useCartStore();
  const { data: cart } = useCartQuery();
  const updateMutation = useUpdateCartItem();
  const removeMutation = useRemoveCartItem();

  const items = cart?.items || [];
  const totalItems = cart?.itemCount || 0;
  const totalPrice = cart?.summary?.total || 0;

  const updateQuantity = (id: number, qty: number) => {
    if (qty < 1) return;
    updateMutation.mutate({ itemId: id, data: { quantity: qty } });
  };

  const removeItem = (id: number) => {
    removeMutation.mutate(id);
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent className="flex w-full flex-col p-0 sm:max-w-md">
        <SheetHeader className="border-b p-6 text-left">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Your Cart ({totalItems})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
            <div className="bg-muted mb-6 flex h-24 w-24 items-center justify-center rounded-full">
              <ShoppingBag className="text-muted-foreground h-10 w-10" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Your cart is empty</h3>
            <p className="text-muted-foreground mb-6">
              Looks like you haven&apos;t added anything to your cart yet.
            </p>
            <Button onClick={closeCart} className="w-full max-w-[200px]">
              Start Shopping
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-6 overflow-y-auto p-6">
              {items.map((item) => {
                const isUpdating =
                  updateMutation.isPending && updateMutation.variables?.itemId === item.id;
                const isRemoving = removeMutation.isPending && removeMutation.variables === item.id;

                return (
                  <div
                    key={item.id}
                    className={`flex gap-4 ${isUpdating || isRemoving ? 'pointer-events-none opacity-50' : ''}`}
                  >
                    <div className="bg-muted relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md">
                      <Image
                        src={item.product?.primaryImage?.url || '/placeholder.svg'}
                        alt={item.product?.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col">
                      <div className="mb-1 flex items-start justify-between gap-2">
                        <Link href={`/product/${item.product?.slug}`} onClick={closeCart}>
                          <h4 className="line-clamp-2 text-sm font-medium hover:underline">
                            {item.product?.name}
                          </h4>
                        </Link>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-muted-foreground hover:text-destructive p-1 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      {item.variant?.attributes &&
                        Object.keys(item.variant.attributes).length > 0 && (
                          <div className="text-muted-foreground mb-2 flex gap-2 text-xs">
                            {Object.entries(item.variant.attributes).map(([key, value]) => (
                              <span key={key}>{value as React.ReactNode}</span>
                            ))}
                          </div>
                        )}
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center rounded-md border">
                          <button
                            className="hover:bg-muted p-1 disabled:opacity-50"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            className="hover:bg-muted p-1 disabled:opacity-50"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.variant?.availableQuantity}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <span className="font-medium">
                          {formatCurrency(item.unitPrice * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-muted/30 border-t p-6">
              <div className="mb-4 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">{formatCurrency(totalPrice)}</span>
              </div>
              <p className="text-muted-foreground mb-4 text-center text-xs">
                Shipping and taxes calculated at checkout.
              </p>
              <div className="grid gap-3">
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className={buttonVariants({ size: 'lg', className: 'w-full' })}
                >
                  <>
                    Checkout <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                </Link>
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className={buttonVariants({ variant: 'outline', className: 'w-full' })}
                >
                  View Cart
                </Link>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
