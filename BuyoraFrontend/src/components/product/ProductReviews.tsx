'use client';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/ErrorState';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Pagination } from '@/components/ui/Pagination';
import { StarRating } from '@/components/ui/StarRating';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { getErrorDetails } from '@/lib/api/errors';
import { formatRelativeDate } from '@/lib/formatting/date';
import { reviewsService } from '@/services/reviews.service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
export function ProductReviews({
  productId,
  productName,
}: {
  productId: number;
  productName: string;
}) {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('createdAt,desc');
  const [formOpen, setFormOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { user } = useAuth();
  const client = useQueryClient();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['reviews', productId, page, sort],
    queryFn: () => reviewsService.getReviews(productId, { page: page - 1, size: 10, sort }),
  });
  const create = useMutation({
    mutationFn: reviewsService.createReview,
    onSuccess: () => {
      setFormOpen(false);
      setSubmitted(true);
      client.invalidateQueries({ queryKey: ['reviews', productId] });
      client.invalidateQueries({ queryKey: ['my-reviews'] });
    },
  });
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (create.isPending) return;
    const form = new FormData(event.currentTarget);
    create.mutate({
      productId,
      rating: Number(form.get('rating')),
      title: String(form.get('title')),
      body: String(form.get('body')),
    });
  }
  return (
    <section className="mt-12 space-y-6 border-t py-10" id="reviews">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Customer reviews</h2>
        {user ? (
          <Button onClick={() => setFormOpen(!formOpen)}>Write a review</Button>
        ) : (
          <Link href="/login" className="text-primary underline">
            Sign in to review
          </Link>
        )}
      </div>
      {submitted && <p role="status">Your review has been submitted for approval.</p>}
      {formOpen && (
        <form onSubmit={submit} className="max-w-xl space-y-4 rounded-xl border p-5">
          <p className="font-medium">Review {productName}</p>
          <div>
            <Label htmlFor="review-rating">Rating</Label>
            <select
              name="rating"
              id="review-rating"
              className="ml-3 rounded border p-2"
              defaultValue="5"
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n} stars
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="review-title">Title</Label>
            <Input name="title" id="review-title" maxLength={200} />
          </div>
          <div>
            <Label htmlFor="review-body">Your review</Label>
            <Textarea name="body" id="review-body" required maxLength={5000} />
          </div>
          {create.error && (
            <p role="alert" className="text-destructive">
              {getErrorDetails(create.error).message}
            </p>
          )}
          <Button type="submit" disabled={create.isPending}>
            {create.isPending ? 'Submitting…' : 'Submit review'}
          </Button>
        </form>
      )}
      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorState
          title="Unable to load reviews"
          message="Please try again."
          onRetry={() => refetch()}
        />
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p>{data?.totalElements ?? 0} reviews</p>
            <label className="text-sm">
              Sort by{' '}
              <select
                className="ml-2 rounded border p-2"
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
              >
                <option value="createdAt,desc">Most recent</option>
                <option value="rating,desc">Highest rating</option>
                <option value="rating,asc">Lowest rating</option>
              </select>
            </label>
          </div>
          {data?.content.length ? (
            data.content.map((review) => (
              <article key={review.id} className="space-y-3 border-b py-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">
                      {review.user.firstName} {review.user.lastName.slice(0, 1)}.
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {formatRelativeDate(review.createdAt)}
                      {review.isVerifiedPurchase ? ' · Verified purchase' : ''}
                    </p>
                  </div>
                  <StarRating rating={review.rating} />
                </div>
                {review.title && <h3 className="font-semibold">{review.title}</h3>}
                <p className="text-muted-foreground text-sm whitespace-pre-wrap">{review.body}</p>
              </article>
            ))
          ) : (
            <p className="text-muted-foreground py-8">No reviews yet.</p>
          )}
          {data && data.totalPages > 1 && (
            <Pagination currentPage={page} totalPages={data.totalPages} onPageChange={setPage} />
          )}
        </>
      )}
    </section>
  );
}
