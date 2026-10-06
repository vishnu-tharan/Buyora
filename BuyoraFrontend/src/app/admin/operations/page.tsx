'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { Activity, ChartNoAxesCombined, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getErrorDetails } from '@/lib/api/errors';
import { ErrorState } from '@/components/ui/ErrorState';
export default function OperationsPage() {
  const client = useQueryClient();
  const analytics = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => api.get<{ event: string; count: number }[]>('/admin/analytics'),
  });
  const payments = useQuery({
    queryKey: ['payment-review'],
    queryFn: () =>
      api.get<{ order_number: string; state: string; note: string }[]>(
        '/admin/payment-reconciliation'
      ),
  });
  const email = useQuery({
    queryKey: ['email-operations'],
    queryFn: () =>
      api.get<{ pending: number; failed: number; sent: number }>('/admin/email-operations'),
  });
  const check = useMutation({
    mutationFn: (number: string) =>
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
          <ChartNoAxesCombined size={21} aria-hidden="true" />
          Shopping activity · last 30 days
        </h2>
        <p className="text-muted-foreground mb-5 text-xs">
          Anonymous event counts from shoppers who allowed analytics. These are activity counts, not
          unique-customer conversion rates.
        </p>
        {analytics.isError ? (
          <ErrorState title="Analytics unavailable" onRetry={() => analytics.refetch()} />
        ) : (
          <div className="grid gap-3 sm:grid-cols-3">
            {analytics.data?.map((e) => (
              <div key={e.event} className="bg-muted rounded-xl p-4">
                <p className="text-muted-foreground text-xs">{e.event.replaceAll('_', ' ')}</p>
                <p className="mt-2 text-2xl font-semibold">{e.count}</p>
              </div>
            ))}
          </div>
        )}
      </section>
      <section className="bg-card rounded-2xl border p-6">
        <h2 className="mb-3 text-lg font-semibold">Order email delivery</h2>
        {email.data ? (
          <div className="flex flex-wrap gap-5 text-sm">
            <span>Pending: {email.data.pending}</span>
            <span>Needs attention: {email.data.failed}</span>
            <span>Delivered to mail server: {email.data.sent}</span>
          </div>
        ) : (
          <p>{email.isError ? 'Email status unavailable' : 'Loading…'}</p>
        )}
        <p className="text-muted-foreground mt-3 text-xs">
          Failed messages retry with increasing delays. Messages that exhaust retries need
          mail-service investigation.
        </p>
      </section>
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
