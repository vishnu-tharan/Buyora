'use client';
import { Pagination } from '@/components/ui/Pagination';
import { useState } from 'react';
import { CreateCouponForm } from '@/components/admin/CreateCouponForm';
import { Column, DataTable } from '@/components/admin/DataTable';
import { PageHeader } from '@/components/admin/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/ErrorState';
import { adminService } from '@/services/admin.service';
import { Coupon } from '@/types/admin';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export default function AdminCouponsPage() {
  const [page, setPage] = useState(0);
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['adminCoupons', page],
    queryFn: () => adminService.getCoupons({ page, size: 20, sort: 'id,desc' }),
  });

  const client = useQueryClient();
  const deactivate = useMutation({
    mutationFn: adminService.deleteCoupon,
    onSuccess: () => client.invalidateQueries({ queryKey: ['adminCoupons'] }),
  });
  const columns: Column<Coupon>[] = [
    {
      header: 'Actions',
      cell: (c) =>
        c.isActive ? (
          <Button
            variant="outline"
            disabled={deactivate.isPending}
            onClick={() => deactivate.mutate(c.id)}
          >
            Deactivate {c.code}
          </Button>
        ) : null,
    },
    { header: 'Code', cell: (c) => <span className="font-bold">{c.code}</span> },
    { header: 'Type', accessorKey: 'type' },
    { header: 'Value', cell: (c) => (c.type === 'PERCENTAGE' ? `${c.value}%` : c.value) },
    { header: 'Used', cell: (c) => `${c.usedCount} ${c.usageLimit ? `/ ${c.usageLimit}` : ''}` },
    {
      header: 'Status',
      cell: (c) => (
        <Badge variant={c.isActive ? 'default' : 'secondary'}>
          {c.isActive ? 'Active' : 'Inactive'}
        </Badge>
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
      <PageHeader title="Coupons" />
      <CreateCouponForm />
      {deactivate.error && (
        <p role="alert" className="text-destructive">
          Unable to deactivate coupon. Please try again.
        </p>
      )}
      <div className="rounded-lg bg-white shadow-sm">
        <DataTable columns={columns} data={data?.content || []} loading={isLoading} />
        <Pagination currentPage={page} totalPages={data?.totalPages ?? 0} onPageChange={setPage} />
      </div>
    </div>
  );
}
