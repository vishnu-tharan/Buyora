export interface Review {
  id: number;
  productId: number;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  rating: number;
  title?: string;
  body: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export interface ReviewStats {
  averageRating: number;
  totalCount: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

export interface CreateReviewRequest {
  productId: number;
  rating: number;
  title?: string;
  body: string;
  images?: string[];
}
