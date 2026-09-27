'use client';

import { Badge } from '@/components/ui/badge';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Pagination } from '@/components/ui/Pagination';
import { StarRating } from '@/components/ui/StarRating';
import { formatDate } from '@/lib/formatting/date';
import { reviewsService } from '@/services/reviews.service';
import { useQuery } from '@tanstack/react-query';
import { MessageSquareX } from 'lucide-react';
import { useState } from 'react';

export default function ReviewsPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ['my-reviews', page],
    queryFn: () => reviewsService.getMyReviews({ page: page - 1, size: 10 }),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900">My Reviews</h1>

      <div className="min-h-[400px] overflow-hidden rounded-xl border border-gray-100 bg-white">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size={32} />
          </div>
        ) : error ? (
          <div className="py-10">
            <ErrorState title="Failed to load reviews" />
          </div>
        ) : data?.content?.length === 0 ? (
          <div className="px-4 py-20 text-center">
            <MessageSquareX className="mx-auto mb-4 h-16 w-16 text-gray-300" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">No reviews yet</h3>
            <p className="mx-auto mb-6 max-w-md text-gray-500">
              You haven&apos;t written any product reviews. Once you receive your orders, you can
              share your experience!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {data?.content?.map((review) => (
              <div key={review.id} className="flex flex-col gap-6 p-6 sm:flex-row">
                <div className="w-full space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <StarRating rating={review.rating} size="sm" />
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500">{formatDate(review.createdAt)}</span>
                      {review.status === 'PENDING' && (
                        <Badge
                          variant="outline"
                          className="border-yellow-200 bg-yellow-50 text-yellow-700"
                        >
                          Pending
                        </Badge>
                      )}
                      {review.status === 'APPROVED' && (
                        <Badge
                          variant="outline"
                          className="border-green-200 bg-green-50 text-green-700"
                        >
                          Approved
                        </Badge>
                      )}
                      {review.status === 'REJECTED' && (
                        <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">
                          Rejected
                        </Badge>
                      )}
                    </div>
                  </div>

                  {review.title && <h4 className="font-semibold text-gray-900">{review.title}</h4>}
                  <p className="text-sm text-gray-600">{review.body}</p>
                </div>
              </div>
            ))}

            {data && data.totalPages > 1 && (
              <div className="p-6">
                <Pagination
                  currentPage={page - 1}
                  totalPages={data.totalPages}
                  onPageChange={(next) => setPage(next + 1)}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
