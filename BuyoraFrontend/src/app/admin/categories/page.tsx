'use client';
import { Pagination } from '@/components/ui/Pagination';
import { useState } from 'react';
import { CreateTaxonomyForm } from '@/components/admin/CreateTaxonomyForm';
import { Column, DataTable } from '@/components/admin/DataTable';
import { PageHeader } from '@/components/admin/PageHeader';
import { ErrorState } from '@/components/ui/ErrorState';
import { adminService } from '@/services/admin.service';
import { Category } from '@/types';
import { useQuery } from '@tanstack/react-query';

export default function AdminCategoriesPage() {
  const [page, setPage] = useState(0);
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['adminCategories', page],
    queryFn: () => adminService.getCategories({ page, size: 20, sort: 'id,desc' }),
  });

  const columns: Column<Category>[] = [
    { header: 'Name', cell: (c) => <span className="font-medium">{c.name}</span> },
    { header: 'Slug', accessorKey: 'slug' },
    { header: 'Parent', cell: (c) => c.parent?.name || '-' },
    { header: 'Products', cell: (c) => c.productCount || 0 },
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
      <PageHeader title="Categories" />
      <CreateTaxonomyForm kind="category" />
      <div className="rounded-lg bg-white shadow-sm">
        <DataTable columns={columns} data={data?.content || []} loading={isLoading} />
        <Pagination currentPage={page} totalPages={data?.totalPages ?? 0} onPageChange={setPage} />
      </div>
    </div>
  );
}
