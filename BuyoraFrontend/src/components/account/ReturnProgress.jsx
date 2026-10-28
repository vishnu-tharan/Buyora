'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { RotateCcw } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';

export function ReturnProgress({ orderNumber }) {
  const query = useQuery({
    queryKey: ['returns', orderNumber],
    queryFn: () => api.get('/orders/' + encodeURIComponent(orderNumber) + '/returns'),
    refetchInterval: 60000,
    retry: false,
  });
  if (query.isError)
    return (
      <p role="status" className="text-muted-foreground text-sm">
        Return progress is temporarily unavailable.
      </p>
    );
  if (!query.data?.length) return null;
  return (
    <section className="bg-card rounded-2xl border p-6">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
        <RotateCcw size={20} strokeWidth={1.5} aria-hidden="true" />
        Returns & refunds
      </h2>
      <div className="space-y-4">
        {query.data.map((r) => (
          <div key={r.id} className="bg-muted/40 rounded-xl p-4 text-sm">
            <p className="font-medium">
              {r.itemIds.length} item(s) · {r.status.toLowerCase().replaceAll('_', ' ')}
            </p>
            <p className="text-muted-foreground mt-2">
              Refund: {formatCurrency(r.refundAmount)} ·{' '}
              {r.refundState.toLowerCase().replaceAll('_', ' ')}
            </p>
            {r.refundReference && (
              <p className="text-muted-foreground mt-1 text-xs">Reference: {r.refundReference}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
