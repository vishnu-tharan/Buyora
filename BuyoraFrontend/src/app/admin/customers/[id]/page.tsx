'use client';
import { PageHeader } from '@/components/admin/PageHeader';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { api } from '@/lib/api/client';
import { formatCurrency, formatDate } from '@/lib/formatting';
import type { User } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { use } from 'react';
export default function AdminCustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading, error } = useQuery({
    queryKey: ['adminCustomer', id],
    queryFn: () =>
      api.get<User & { orderCount: number; totalSpent: number }>(
        '/admin/customers/' + encodeURIComponent(id)
      ),
  });
  if (isLoading) return <LoadingSpinner />;
  if (error || !data)
    return <ErrorState title="Unable to load customer" message="Please try again." />;
  return (
    <section className="space-y-6">
      <PageHeader title={data.firstName + ' ' + data.lastName} />
      <dl className="grid max-w-2xl grid-cols-2 gap-4 rounded-xl border bg-white p-6">
        <dt>Email</dt>
        <dd>{data.email}</dd>
        <dt>Phone</dt>
        <dd>{data.phone || 'Not provided'}</dd>
        <dt>Joined</dt>
        <dd>{formatDate(data.createdAt)}</dd>
        <dt>Orders</dt>
        <dd>{data.orderCount}</dd>
        <dt>Paid total</dt>
        <dd>{formatCurrency(data.totalSpent)}</dd>
      </dl>
    </section>
  );
}
