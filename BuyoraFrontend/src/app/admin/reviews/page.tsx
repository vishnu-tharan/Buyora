'use client';
import { ReviewPhotos } from '@/components/product/ReviewPhotos';
import { Pagination } from '@/components/ui/Pagination';
import { useState } from 'react';
import { Column, DataTable } from '@/components/admin/DataTable';
import { PageHeader } from '@/components/admin/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/ErrorState';
import { StarRating } from '@/components/ui/StarRating';
import { getErrorDetails } from '@/lib/api/errors';
import { formatDate } from '@/lib/formatting';
import { adminService } from '@/services/admin.service';
import { Review } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export default function AdminReviewsPage() {
  const [page, setPage] = useState(0);
  const client = useQueryClient();
  const moderate = useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'APPROVED' | 'REJECTED' }) =>
      adminService.updateReviewStatus(id, status),
    onSuccess: () => client.invalidateQueries({ queryKey: ['adminReviews'] }),
  });
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['adminReviews', page],
    queryFn: () => adminService.getReviews({ page, size: 20, sort: 'id,desc' }),
  });

  const columns: Column<Review>[] = [
    { header: 'Rating', cell: (r) => <StarRating rating={r.rating} /> },
    { header: 'Title', cell: (r) => <span className="font-medium">{r.title}</span> },
    { header: 'Reviewer', cell: (r) => r.user.firstName + ' ' + r.user.lastName },
    { header: 'Status', cell: (r) => <Badge>{r.status || 'PENDING'}</Badge> },
    {
      header: 'Review',
      cell: (r) => (
        <div className="max-w-md">
          <p className="text-sm whitespace-pre-wrap">{r.body}</p>
          <ReviewPhotos images={r.images} />
        </div>
      ),
    },
    {
      header: 'Actions',
      cell: (r) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            disabled={moderate.isPending || r.status === 'APPROVED'}
            onClick={() => moderate.mutate({ id: r.id, status: 'APPROVED' })}
          >
            Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={moderate.isPending || r.status === 'REJECTED'}
            onClick={() => moderate.mutate({ id: r.id, status: 'REJECTED' })}
          >
            Reject
          </Button>
        </div>
      ),
    },
    { header: 'Date', cell: (r) => formatDate(r.createdAt) },
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
      <PageHeader title="Reviews" />
      {moderate.error && (
        <p role="alert" className="text-destructive">
          {getErrorDetails(moderate.error).message}
        </p>
      )}
      <div className="rounded-lg bg-white shadow-sm">
        <DataTable columns={columns} data={data?.content || []} loading={isLoading} />
        <Pagination currentPage={page} totalPages={data?.totalPages ?? 0} onPageChange={setPage} />
      </div>
    </div>
  );
}
