import { api } from '@/lib/api-client';
import { ENDPOINTS } from '@/lib/api-endpoints';
import { productsService } from './products.service';

export const categoriesService = {
  getCategories: () => api.get(ENDPOINTS.categories.list),
  getCategoryTree: () => api.get(ENDPOINTS.categories.tree),
  getCategory: (slug) => api.get(ENDPOINTS.categories.detail(slug)),
  getCategoryProducts: (slug, filters) =>
    productsService.getProducts({ ...filters, categorySlug: slug }),
};
