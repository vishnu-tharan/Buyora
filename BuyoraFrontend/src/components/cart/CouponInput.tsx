'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApplyCoupon, useRemoveCoupon } from '@/features/cart/use-cart-query';
import { useToast } from '@/hooks/use-toast';
import { X } from 'lucide-react';
import { useState } from 'react';

export function CouponInput({ currentCoupon }: { currentCoupon?: string }) {
  const [code, setCode] = useState('');
  const applyMutation = useApplyCoupon();
  const removeMutation = useRemoveCoupon();
  const { toast } = useToast();

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    applyMutation.mutate(code, {
      onSuccess: () => {
        toast.add({ title: 'Coupon applied successfully' });
        setCode('');
      },
      onError: () => {
        toast.add({ title: 'Invalid or expired coupon code' });
      },
    });
  };

  const handleRemove = () => {
    removeMutation.mutate(undefined, {
      onSuccess: () => {
        toast.add({ title: 'Coupon removed' });
      },
    });
  };

  if (currentCoupon) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium">Applied Coupon</label>
        <div className="bg-muted border-success/30 flex items-center justify-between rounded-md border p-3">
          <span className="text-success font-mono text-sm font-bold">{currentCoupon}</span>
          <button
            onClick={handleRemove}
            className="text-muted-foreground hover:text-destructive disabled:opacity-50"
            disabled={removeMutation.isPending}
            aria-label="Remove coupon"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleApply} className="space-y-2">
      <label htmlFor="coupon-code" className="text-sm font-medium">
        Have a promo code?
      </label>
      <div className="flex gap-2">
        <Input
          id="coupon-code"
          placeholder="Enter code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          disabled={applyMutation.isPending}
          className="uppercase"
        />
        <Button
          type="submit"
          variant="secondary"
          disabled={!code.trim() || applyMutation.isPending}
        >
          Apply
        </Button>
      </div>
    </form>
  );
}
