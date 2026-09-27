'use client';
import { Pagination } from '@/components/ui/Pagination';
import { useState } from 'react';
import { Column, DataTable } from '@/components/admin/DataTable';
import { PageHeader } from '@/components/admin/PageHeader';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/ErrorState';
import { formatCurrency, formatDate } from '@/lib/formatting';
import { adminService } from '@/services/admin.service';
import { OrderSummary } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { Eye } from 'lucide-react';
import Link from 'next/link';

export default function AdminOrdersPage() {
  const [page, setPage] = useState(0);
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['adminOrders', page],
    queryFn: () => adminService.getOrders({ page, size: 20, sort: 'id,desc' }),
  });

  const columns: Column<OrderSummary>[] = [
    { header: 'Order #', cell: (o) => <span className="font-medium">#{o.orderNumber}</span> },
    { header: 'Date', cell: (o) => formatDate(o.createdAt) },
    { header: 'Items', cell: (o) => o.itemCount },
    { header: 'Total', cell: (o) => formatCurrency(o.total) },
    { header: 'Status', cell: (o) => <Badge variant="outline">{o.status}</Badge> },
    {
      header: 'Actions',
      cell: (o) => (
        <Link
          href={`/admin/orders/${o.orderNumber}`}
          className={buttonVariants({ variant: 'ghost', size: 'icon' })}
        >
          <Eye className="h-4 w-4" />
        </Link>
      ),
    },
  ];

  if (error)
    return (
      <ErrorState
        title="Unable to load records"
        message="Please try again. If this continues, contact the store administrator."
        onRetry={() => refetch()}
      />
    );
  return (
    <div className="space-y-6">
      <PageHeader title="Orders" />
      <div className="rounded-lg bg-white shadow-sm">
        <DataTable columns={columns} data={data?.content || []} loading={isLoading} />
        <Pagination currentPage={page} totalPages={data?.totalPages ?? 0} onPageChange={setPage} />
      </div>
    </div>
  );
}
