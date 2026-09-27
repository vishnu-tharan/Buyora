'use client';

import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/formatting/currency';
import { useCartStore, useCheckoutStore } from '@/stores';
import Image from 'next/image';

export function CheckoutOrderSummary() {
  const { cart } = useCartStore();
  const { state } = useCheckoutStore();

  if (!cart) return null;

  const subtotal = cart.summary.subtotal;
  const shippingCost =
    !cart.summary.freeShipping && state.step > 1 && state.shippingMethod
      ? state.shippingMethod.price
      : 0;
  const total = subtotal - cart.summary.discountAmount + cart.summary.taxAmount + shippingCost;

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
      <h2 className="mb-6 text-lg font-bold text-gray-900">Order Summary</h2>

      <div className="max-h-[400px] space-y-4 overflow-y-auto pr-2">
        {cart.items.map((item) => (
          <div key={item.id} className="flex items-start gap-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border border-gray-200 bg-white">
              {item.product.primaryImage ? (
                <Image
                  src={item.product.primaryImage.url}
                  alt={item.product.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-100 text-xs text-gray-400">
                  No img
                </div>
              )}
              <div className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full border border-white bg-gray-500 text-xs text-white">
                {item.quantity}
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <h4 className="truncate text-sm font-medium text-gray-900">{item.product.name}</h4>
              <p className="mt-0.5 text-xs text-gray-500">
                {Object.values(item.variant.attributes || {}).join(' / ')}
              </p>
            </div>

            <div className="shrink-0 text-sm font-medium text-gray-900">
              {formatCurrency(item.unitPrice * item.quantity)}
            </div>
          </div>
        ))}
      </div>

      <Separator className="my-6" />

      <div className="space-y-3 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span className="font-medium text-gray-900">{formatCurrency(subtotal)}</span>
        </div>

        <div className="flex justify-between text-gray-600">
          <span>Shipping</span>
          <span className="font-medium text-gray-900">
            {state.step > 1 && state.shippingMethod
              ? shippingCost === 0
                ? 'FREE'
                : formatCurrency(shippingCost)
              : 'Calculated next step'}
          </span>
        </div>
      </div>

      <div className="flex justify-between text-sm">
        <span>Discount</span>
        <span>−{formatCurrency(cart.summary.discountAmount)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span>Tax</span>
        <span>{formatCurrency(cart.summary.taxAmount)}</span>
      </div>
      <Separator className="my-6" />

      <div className="flex items-center justify-between text-lg font-bold text-gray-900">
        <span>Total</span>
        <span>{formatCurrency(total)}</span>
      </div>
    </div>
  );
}
