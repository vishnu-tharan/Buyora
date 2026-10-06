'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { BellRing, TrendingDown, X } from 'lucide-react';
import Link from 'next/link';
import { ErrorState } from '@/components/ui/ErrorState';
import { getErrorDetails } from '@/lib/api/errors';
export default function AlertsPage() {
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ['alerts'],
    queryFn: () =>
      api.get<
        { id: string; kind: string; active: boolean; name: string; slug: string; sku: string }[]
      >('/alerts'),
  });
  const cancel = useMutation({
    mutationFn: (id: string) => api.delete('/alerts/' + id),
    onSuccess: () => client.invalidateQueries({ queryKey: ['alerts'] }),
  });
  if (query.isError)
    return <ErrorState title="Unable to load alerts" onRetry={() => query.refetch()} />;
  return (
    <div>
      <BellRing className="text-primary mb-3" size={28} strokeWidth={1.5} aria-hidden="true" />
      <h1 className="font-display mb-2 text-2xl font-semibold">Good finds, worth watching.</h1>
      <p className="text-muted-foreground mb-6 text-sm">
        Email updates for the products you care about. Each alert sends once.
      </p>
      {query.isLoading ? (
        <p>Loading alerts…</p>
      ) : !query.data?.length ? (
        <div className="rounded-2xl border p-8">
          <p>No product alerts yet.</p>
          <Link href="/categories" className="text-primary mt-3 block text-sm font-semibold">
            Explore products
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {query.data.map((a) => (
            <div key={a.id} className="bg-card flex items-center gap-4 rounded-2xl border p-4">
              {a.kind === 'PRICE_DROP' ? (
                <TrendingDown className="text-primary shrink-0" size={22} aria-hidden="true" />
              ) : (
                <BellRing className="text-primary shrink-0" size={22} aria-hidden="true" />
              )}
              <div className="flex-1">
                <Link href={'/product/' + a.slug} className="text-sm font-semibold">
                  {a.name}
                </Link>
                <p className="text-muted-foreground mt-1 text-xs">
                  {a.sku} · {a.kind === 'PRICE_DROP' ? 'Price drop' : 'Back in stock'} ·{' '}
                  {a.active ? 'Watching' : 'Closed'}
                </p>
              </div>
              {a.active && (
                <button
                  disabled={cancel.isPending}
                  onClick={() => cancel.mutate(a.id)}
                  className="hover:bg-muted rounded-full p-3"
                  aria-label={'Cancel alert for ' + a.name}
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      {cancel.isError && (
        <p role="alert" className="text-destructive mt-3 text-sm">
          {getErrorDetails(cancel.error).message}
        </p>
      )}
    </div>
  );
}
