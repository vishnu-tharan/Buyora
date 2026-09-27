import { api } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { CreateReviewRequest, PageRequest, PaginatedResponse, Review } from '@/types';

export const reviewsService = {
  getMyReviews: (params?: PageRequest) =>
    api.get<PaginatedResponse<Review>>(ENDPOINTS.account.reviews, {
      params: params as Record<string, number>,
    }),
  getReviews: (productId: number, params?: PageRequest & { sort?: string }) =>
    api.get<PaginatedResponse<Review>>(ENDPOINTS.reviews.product(productId), {
      params: params as Record<string, string | number>,
    }),
  createReview: (data: CreateReviewRequest) =>
    api.post<Review>(ENDPOINTS.reviews.create(data.productId), data),
  markHelpful: (reviewId: number) => api.post<void>(ENDPOINTS.reviews.helpful(reviewId)),
};
