'use client';
import { Pagination } from '@/components/ui/Pagination';
import { useState } from 'react';
import { CreateTaxonomyForm } from '@/components/admin/CreateTaxonomyForm';
import { Column, DataTable } from '@/components/admin/DataTable';
import { PageHeader } from '@/components/admin/PageHeader';
import { ErrorState } from '@/components/ui/ErrorState';
import { adminService } from '@/services/admin.service';
import { Brand } from '@/types';
import { useQuery } from '@tanstack/react-query';

export default function AdminBrandsPage() {
  const [page, setPage] = useState(0);
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['adminBrands', page],
    queryFn: () => adminService.getBrands({ page, size: 20, sort: 'id,desc' }),
  });

  const columns: Column<Brand>[] = [
    { header: 'Name', cell: (b) => <span className="font-medium">{b.name}</span> },
    { header: 'Slug', accessorKey: 'slug' },
    {
      header: 'Description',
      cell: (b) => <span className="block max-w-xs truncate">{b.description || '-'}</span>,
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
      <PageHeader title="Brands" />
      <CreateTaxonomyForm kind="brand" />
      <div className="rounded-lg bg-white shadow-sm">
        <DataTable columns={columns} data={data?.content || []} loading={isLoading} />
        <Pagination currentPage={page} totalPages={data?.totalPages ?? 0} onPageChange={setPage} />
      </div>
    </div>
  );
}
