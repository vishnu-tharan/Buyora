'use client';
import type { CartSummary as ItemType } from '@/types';

import { buttonVariants } from '@/components/ui/button';
import { formatCurrency } from '@/lib/formatting';
import { ArrowRightLeft, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { CouponInput } from './CouponInput';

export function CartSummary({ summary }: { summary: ItemType }) {
  if (!summary) return null;

  return (
    <div className="bg-card space-y-6 rounded-lg border p-6">
      <h2 className="text-xl font-bold">Order Summary</h2>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatCurrency(summary.subtotal)}</span>
        </div>

        {summary.discountAmount > 0 && (
          <div className="text-success flex justify-between">
            <span>Discount</span>
            <span>-{formatCurrency(summary.discountAmount)}</span>
          </div>
        )}

        <div className="flex justify-between">
          <span className="text-muted-foreground">Shipping</span>
          {summary.freeShipping ? (
            <span className="text-success font-medium">Free</span>
          ) : (
            <span>
              {summary.shippingAmount === 0
                ? 'Calculated at checkout'
                : formatCurrency(summary.shippingAmount)}
            </span>
          )}
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">Tax</span>
          <span>
            {summary.taxAmount === 0 ? 'Calculated at checkout' : formatCurrency(summary.taxAmount)}
          </span>
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="mb-6 flex items-center justify-between">
          <span className="text-lg font-bold">Total</span>
          <span className="text-2xl font-bold">{formatCurrency(summary.total)}</span>
        </div>

        <Link
          href="/checkout"
          className={buttonVariants({
            className: 'mb-3 flex h-12 w-full items-center justify-center text-lg',
          })}
        >
          Proceed to Checkout
        </Link>
        <Link
          href="/"
          className={buttonVariants({
            variant: 'outline',
            className: 'flex w-full items-center justify-center',
          })}
        >
          Continue Shopping
        </Link>
      </div>

      <div className="border-t pt-6">
        <CouponInput currentCoupon={summary.couponCode} />
      </div>

      <div className="text-muted-foreground flex flex-col gap-3 border-t pt-6 text-sm">
        <div className="flex items-center justify-center gap-2">
          <ShieldCheck className="h-4 w-4" /> Secure Checkout
        </div>
        <div className="flex items-center justify-center gap-2">
          <ArrowRightLeft className="h-4 w-4" /> Easy Returns
        </div>
      </div>
    </div>
  );
}
