'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getErrorDetails } from '@/lib/api/errors';
import { adminService } from '@/services/admin.service';
import type { Coupon } from '@/types/admin';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
export function CreateCouponForm() {
  const [open, setOpen] = useState(false);
  const client = useQueryClient();
  const mutation = useMutation({
    mutationFn: adminService.createCoupon,
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['adminCoupons'] });
      setOpen(false);
    },
  });
  return (
    <div className="space-y-3">
      <Button onClick={() => setOpen(!open)}>Add coupon</Button>
      {open && (
        <form
          className="grid max-w-xl gap-4 rounded border bg-white p-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (mutation.isPending) return;
            const data = new FormData(e.currentTarget);
            mutation.mutate({
              code: String(data.get('code')).trim().toUpperCase(),
              type: String(data.get('type')) as Coupon['type'],
              value: Number(data.get('value')),
              minimumOrderAmount: Number(data.get('minimum')),
              startDate: new Date().toISOString(),
              endDate: data.get('end')
                ? new Date(String(data.get('end'))).toISOString()
                : undefined,
              usageLimit: data.get('limit') ? Number(data.get('limit')) : undefined,
              isActive: true,
            });
          }}
        >
          <label>
            Code
            <Input name="code" required minLength={3} maxLength={50} pattern="[A-Za-z0-9_-]+" />
          </label>
          <label>
            Type
            <select className="block w-full rounded border p-2" name="type">
              <option value="PERCENTAGE">Percentage</option>
              <option value="FIXED">Fixed amount (LKR)</option>
              <option value="FREE_SHIPPING">Free shipping</option>
            </select>
          </label>
          <label>
            Value (0 for free shipping)
            <Input name="value" type="number" required min="0" step="0.01" />
          </label>
          <label>
            Minimum purchase (LKR)
            <Input name="minimum" type="number" min="0" step="0.01" defaultValue="0" />
          </label>
          <label>
            Expiry (optional, local time)
            <Input name="end" type="datetime-local" />
          </label>
          <label>
            Total redemption limit (optional)
            <Input name="limit" type="number" min="1" step="1" />
          </label>
          <p className="text-muted-foreground text-sm">The coupon becomes active when saved.</p>
          <Button type="submit" disabled={mutation.isPending}>
            Create coupon
          </Button>
          {mutation.error && (
            <p role="alert" className="text-destructive">
              {getErrorDetails(mutation.error).message}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
