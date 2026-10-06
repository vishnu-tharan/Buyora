'use client';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getErrorDetails } from '@/lib/api/errors';
import { Truck } from 'lucide-react';
export function TrackingEditor({
  orderNumber,
  number = '',
  url = '',
}: {
  orderNumber: string;
  number?: string;
  url?: string;
}) {
  const [trackingNumber, setNumber] = useState(number);
  const [trackingUrl, setUrl] = useState(url);
  const client = useQueryClient();
  const save = useMutation({
    mutationFn: () =>
      api.put('/admin/orders/' + encodeURIComponent(orderNumber) + '/tracking', {
        trackingNumber,
        trackingUrl,
      }),
    onSuccess: () => client.invalidateQueries({ queryKey: ['adminOrder', orderNumber] }),
  });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate();
      }}
      className="bg-card space-y-4 rounded-2xl border p-5"
    >
      <h2 className="flex items-center gap-2 font-semibold">
        <Truck size={20} aria-hidden="true" />
        Courier tracking
      </h2>
      <label className="block text-xs">
        Reference number
        <Input
          value={trackingNumber}
          onChange={(e) => setNumber(e.target.value)}
          required
          maxLength={100}
        />
      </label>
      <label className="block text-xs">
        HTTPS tracking URL (optional)
        <Input
          value={trackingUrl}
          onChange={(e) => setUrl(e.target.value)}
          type="url"
          maxLength={1000}
        />
      </label>
      <p className="text-muted-foreground text-xs">
        Mark the order as shipped before saving. Saving emails the tracking reference to the
        customer.
      </p>
      <Button type="submit" disabled={save.isPending}>
        Save tracking
      </Button>
      {save.isError && (
        <p role="alert" className="text-destructive text-xs">
          {getErrorDetails(save.error).message}
        </p>
      )}
      {save.isSuccess && (
        <p role="status" className="text-xs">
          Tracking saved.
        </p>
      )}
    </form>
  );
}
