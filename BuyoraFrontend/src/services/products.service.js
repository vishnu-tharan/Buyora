import { api } from '@/lib/api-client';
import { ENDPOINTS } from '@/lib/api-endpoints';

function buildProductParams(filters = {}) {
  const { attributes, ...params } = filters ?? {};
  if (attributes) {
    params.attribute = [];
    for (const [name, values] of Object.entries(attributes)) {
      for (const value of values) {
        params.attribute.push(`${name}:${value}`);
      }
    }
  }
  return params;
}

export const productsService = {
  getProducts: (filters) =>
    api.get(ENDPOINTS.products.list, {
      params: buildProductParams(filters),
    }),
  getProduct: (slug) => api.get(ENDPOINTS.products.detail(slug)),
  getFeatured: () => api.get(ENDPOINTS.products.featured),
  getNewArrivals: () => api.get(ENDPOINTS.products.newArrivals),
  getBestSellers: () => api.get(ENDPOINTS.products.bestSellers),
  getRecommended: () => api.get(ENDPOINTS.products.recommended),
  search: (params) =>
    api.get(ENDPOINTS.products.search, {
      params: buildProductParams(params),
    }),
  getSuggestions: (q) =>
    api.get(ENDPOINTS.products.suggestions, {
      params: { q },
    }),
};
