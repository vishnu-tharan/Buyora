'use client';
import { Pagination } from '@/components/ui/Pagination';
import { useState } from 'react';
import { Column, DataTable } from '@/components/admin/DataTable';
import { PageHeader } from '@/components/admin/PageHeader';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/ErrorState';
import { formatCurrency } from '@/lib/formatting';
import { adminService } from '@/services/admin.service';
import { Product } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { Edit, Eye } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function AdminProductsPage() {
  const [page, setPage] = useState(0);
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['adminProducts', page],
    queryFn: () => adminService.getProducts({ page, size: 20, sort: 'id,desc' }),
  });

  const columns: Column<Product>[] = [
    {
      header: 'Product',
      cell: (p) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
            {p.images?.[0] ? (
              <div className="relative h-full w-full">
                <Image src={p.images[0].url} alt={p.name} fill className="object-cover" />
              </div>
            ) : null}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{p.name}</p>
            <p className="text-xs text-gray-500">{p.sku}</p>
          </div>
        </div>
      ),
    },
    { header: 'Category', cell: (p) => p.category?.name || 'Uncategorized' },
    { header: 'Price', cell: (p) => formatCurrency(p.basePrice) },
    {
      header: 'Status',
      cell: (p) => (
        <Badge
          variant={
            p.status === 'ACTIVE' ? 'default' : p.status === 'DRAFT' ? 'secondary' : 'outline'
          }
        >
          {p.status}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      cell: (p) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/products/${p.id}/edit`}
            className={buttonVariants({ variant: 'ghost', size: 'icon' })}
          >
            <Edit className="h-4 w-4" />
          </Link>
          <a
            href={`/product/${p.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: 'ghost', size: 'icon' })}
          >
            <Eye className="h-4 w-4" />
          </a>
        </div>
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
      <PageHeader
        title="Products"
        action={{ label: 'Create Product', href: '/admin/products/new' }}
      />
      <div className="rounded-lg bg-white shadow-sm">
        <DataTable columns={columns} data={data?.content || []} loading={isLoading} />
        <Pagination currentPage={page} totalPages={data?.totalPages ?? 0} onPageChange={setPage} />
      </div>
    </div>
  );
}
