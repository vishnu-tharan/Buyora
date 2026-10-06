'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { useState } from 'react';
import { RotateCcw, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/formatting/currency';
import { getErrorDetails } from '@/lib/api/errors';
import type { ReturnRecord } from '@/components/account/ReturnProgress';
import type { PaginatedResponse } from '@/types';
import { ErrorState } from '@/components/ui/ErrorState';
function ReturnActions({ record }: { record: ReturnRecord }) {
  const [evidence, setEvidence] = useState('');
  const client = useQueryClient();
  const [reference, setReference] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const action = useMutation({
    mutationFn: (status: string) =>
      api.patch('/admin/returns/' + record.id + '/review?status=' + status),
    onSuccess: () => client.invalidateQueries({ queryKey: ['admin-returns'] }),
  });
  const resolve = useMutation({
    mutationFn: () =>
      api.post('/admin/returns/' + record.id + '/refund-resolution', {
        reference,
        amount: record.refundAmount,
        evidence,
      }),
    onSuccess: () => client.invalidateQueries({ queryKey: ['admin-returns'] }),
  });
  const refund = useMutation({
    mutationFn: () =>
      api.post('/admin/returns/' + record.id + '/refund', {
        repaymentReference: reference || undefined,
      }),
    onSuccess: () => client.invalidateQueries({ queryKey: ['admin-returns'] }),
  });
  return (
    <div className="space-y-3">
      {record.status === 'PENDING' && (
        <div className="flex gap-2">
          <Button size="sm" disabled={action.isPending} onClick={() => action.mutate('APPROVED')}>
            Approve
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={action.isPending}
            onClick={() => action.mutate('REJECTED')}
          >
            Reject
          </Button>
        </div>
      )}
      {record.status === 'APPROVED' && (
        <Button size="sm" disabled={action.isPending} onClick={() => action.mutate('RECEIVED')}>
          Confirm items received
        </Button>
      )}
      {record.status === 'RECEIVED' && record.refundState === 'NOT_REQUESTED' && (
        <div className="space-y-3 rounded-xl border p-4">
          <Input
            aria-label="Completed repayment reference for cash on delivery"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="COD: completed repayment reference"
            maxLength={255}
          />
          <p className="text-muted-foreground text-xs">
            PayHere refunds require configured merchant access. For COD, repay the customer first
            and enter its reference.
          </p>
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
            />
            I reviewed the return and amount; proceed with this refund.
          </label>
          <Button
            size="sm"
            disabled={!confirmed || refund.isPending}
            onClick={() => refund.mutate()}
          >
            <CreditCard size={15} />
            {refund.isPending ? 'Processing…' : 'Refund ' + formatCurrency(record.refundAmount)}
          </Button>
        </div>
      )}
      {['UNKNOWN', 'PROCESSING', 'REQUESTED'].includes(record.refundState) && (
        <div className="space-y-3 rounded-xl bg-amber-50 p-4">
          <p className="text-xs text-amber-900">
            Check the provider or bank record. Confirm only an actual completed refund for this
            exact amount. PayHere acceptance is recorded as requested until completion is verified.
            Processing refunds must be stalled for 30 minutes before manual reconciliation.
          </p>
          <Input
            aria-label="Verified refund reference"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="Verified refund reference"
          />
          <Input
            aria-label="Refund verification evidence"
            value={evidence}
            onChange={(e) => setEvidence(e.target.value)}
            placeholder="How you verified repayment"
            maxLength={1000}
          />
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
            />
            I verified the completed repayment and amount.
          </label>
          <Button
            size="sm"
            variant="outline"
            disabled={!reference || !evidence || !confirmed || resolve.isPending}
            onClick={() => resolve.mutate()}
          >
            Record verified refund
          </Button>
        </div>
      )}
      {(action.isError || refund.isError || resolve.isError) && (
        <p role="alert" className="text-destructive text-xs">
          {getErrorDetails(action.error ?? refund.error ?? resolve.error).message}
        </p>
      )}
    </div>
  );
}
export default function ReturnsPage() {
  const [page, setPage] = useState(0);
  const query = useQuery({
    queryKey: ['admin-returns', page],
    queryFn: () =>
      api.get<PaginatedResponse<ReturnRecord>>('/admin/returns', { params: { page, size: 20 } }),
  });
  if (query.isError)
    return <ErrorState title="Unable to load returns" onRetry={() => query.refetch()} />;
  return (
    <div className="space-y-6">
      <h1 className="flex items-center gap-3 text-2xl font-semibold">
        <RotateCcw size={27} aria-hidden="true" />
        Returns & refunds
      </h1>
      <p className="text-muted-foreground text-sm">
        Review individual items. Refund completion requires a provider response or a recorded COD
        repayment.
      </p>
      {query.isLoading ? (
        <p>Loading…</p>
      ) : !query.data?.content.length ? (
        <p>No return requests.</p>
      ) : (
        query.data.content.map((r) => (
          <article key={r.id} className="bg-card space-y-4 rounded-2xl border p-6">
            <div className="flex flex-wrap justify-between gap-3">
              <div>
                <h2 className="font-semibold">{r.orderNumber}</h2>
                <p className="text-muted-foreground mt-1 text-xs">
                  {r.itemIds.length} item(s) · {r.status} · Refund {r.refundState}
                </p>
              </div>
              <p className="font-semibold">{formatCurrency(r.refundAmount)}</p>
            </div>
            <p className="text-sm whitespace-pre-line">{r.reason}</p>
            <ul className="bg-muted/40 space-y-2 rounded-xl p-4">
              {r.items?.map((item) => (
                <li key={item.id} className="text-sm">
                  {item.name} · {item.sku} · Qty {item.quantity}
                </li>
              ))}
            </ul>
            {r.refundReference && <p className="text-xs">Reference: {r.refundReference}</p>}
            <ReturnActions record={r} />
          </article>
        ))
      )}
      <div className="flex gap-3">
        <Button variant="outline" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
          Previous
        </Button>
        <Button
          variant="outline"
          disabled={!query.data || page + 1 >= query.data.totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
