'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { Activity, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getErrorDetails } from '@/lib/api-errors';
import { ErrorState } from '@/components/ui/ErrorState';

export default function OperationsPage() {
  const client = useQueryClient();
  const payments = useQuery({
    queryKey: ['payment-review'],
    queryFn: () => api.get('/admin/payment-reconciliation'),
  });
  const check = useMutation({
    mutationFn: (number) =>
      api.post('/admin/payment-reconciliation/' + encodeURIComponent(number) + '/check'),
    onSuccess: () => client.invalidateQueries({ queryKey: ['payment-review'] }),
  });
  return (
    <div className="space-y-8">
      <h1 className="flex items-center gap-3 text-2xl font-semibold">
        <Activity size={28} aria-hidden="true" />
        Store operations
      </h1>
      <section className="bg-card rounded-2xl border p-6">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
          <ShieldCheck size={21} aria-hidden="true" />
          Payment reconciliation
        </h2>
        <p className="text-muted-foreground mb-5 text-xs">
          Uncertain payments keep stock reserved. A no-payments-found response is not proof that a
          payment cannot settle later.
        </p>
        {payments.isError ? (
          <ErrorState title="Payment review unavailable" onRetry={() => payments.refetch()} />
        ) : !payments.data?.length ? (
          <p className="text-sm">No payment reviews recorded.</p>
        ) : (
          payments.data.map((p) => (
            <div
              key={p.order_number}
              className="mb-3 flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4"
            >
              <div>
                <p className="text-sm font-semibold">
                  {p.order_number} · {p.state}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">{p.note}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={check.isPending}
                onClick={() => check.mutate(p.order_number)}
              >
                Check provider
              </Button>
            </div>
          ))
        )}
        {check.isError && (
          <p role="alert" className="text-destructive text-xs">
            {getErrorDetails(check.error).message}
          </p>
        )}
      </section>
    </div>
  );
}
