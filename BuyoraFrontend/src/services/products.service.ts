import { api } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { PaginatedResponse, Product, ProductFilter, ProductSummary } from '@/types';

function paramsFor(filters?: ProductFilter) {
  const { attributes, ...rest } = filters ?? {};
  return {
    ...rest,
    attribute: attributes
      ? Object.entries(attributes).flatMap(([key, values]) =>
          values.map((value) => key + ':' + value)
        )
      : undefined,
  };
}
export const productsService = {
  getProducts: (filters?: ProductFilter) =>
    api.get<PaginatedResponse<ProductSummary>>(ENDPOINTS.products.list, {
      params: paramsFor(filters),
    }),

  getProduct: (slug: string) => api.get<Product>(ENDPOINTS.products.detail(slug)),

  getFeatured: () => api.get<ProductSummary[]>(ENDPOINTS.products.featured),

  getNewArrivals: () => api.get<ProductSummary[]>(ENDPOINTS.products.newArrivals),

  getBestSellers: () => api.get<ProductSummary[]>(ENDPOINTS.products.bestSellers),

  getRecommended: () => api.get<ProductSummary[]>(ENDPOINTS.products.recommended),

  search: (params: ProductFilter) =>
    api.get<PaginatedResponse<ProductSummary>>(ENDPOINTS.products.search, {
      params: paramsFor(params),
    }),

  getSuggestions: (q: string) =>
    api.get<import('@/types').SearchSuggestion[]>(ENDPOINTS.products.suggestions, {
      params: { q },
    }),
};
