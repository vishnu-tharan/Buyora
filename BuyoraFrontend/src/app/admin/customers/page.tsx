'use client';
import { Pagination } from '@/components/ui/Pagination';
import { useState } from 'react';
import { Column, DataTable } from '@/components/admin/DataTable';
import { PageHeader } from '@/components/admin/PageHeader';
import { ErrorState } from '@/components/ui/ErrorState';
import { formatCurrency, formatDate } from '@/lib/formatting';
import { adminService } from '@/services/admin.service';
import { User } from '@/types';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

type Customer = User & { orderCount: number; totalSpent: number };

export default function AdminCustomersPage() {
  const [page, setPage] = useState(0);
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['adminCustomers', page],
    queryFn: () => adminService.getCustomers({ page, size: 20, sort: 'id,desc' }),
  });

  const columns: Column<Customer>[] = [
    {
      header: 'Name',
      cell: (c) => (
        <Link href={`/admin/customers/${c.id}`} className="font-medium underline">
          {c.firstName} {c.lastName}
        </Link>
      ),
    },
    { header: 'Email', accessorKey: 'email' },
    { header: 'Orders', accessorKey: 'orderCount' },
    { header: 'Total Spent', cell: (c) => formatCurrency(c.totalSpent) },
    { header: 'Joined', cell: (c) => formatDate(c.createdAt) },
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
      <PageHeader title="Customers" />
      <div className="rounded-lg bg-white shadow-sm">
        <DataTable columns={columns} data={data?.content || []} loading={isLoading} />
        <Pagination currentPage={page} totalPages={data?.totalPages ?? 0} onPageChange={setPage} />
      </div>
    </div>
  );
}
