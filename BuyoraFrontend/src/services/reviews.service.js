import { api } from '@/lib/api-client';
import { ENDPOINTS } from '@/lib/api-endpoints';

export const reviewsService = {
  getMyReviews: (params) =>
    api.get(ENDPOINTS.account.reviews, {
      params: params,
    }),
  getReviews: (productId, params) =>
    api.get(ENDPOINTS.reviews.product(productId), {
      params: params,
    }),
  createReview: (data) => api.post(ENDPOINTS.reviews.create(data.productId), data),
  markHelpful: (reviewId) => api.post(ENDPOINTS.reviews.helpful(reviewId)),
};
