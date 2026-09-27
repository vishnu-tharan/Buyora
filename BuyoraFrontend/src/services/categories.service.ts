import { api } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { Category, ProductFilter } from '@/types';
import { productsService } from './products.service';

export const categoriesService = {
  getCategories: () => api.get<Category[]>(ENDPOINTS.categories.list),
  getCategoryTree: () => api.get<Category[]>(ENDPOINTS.categories.tree),
  getCategory: (slug: string) => api.get<Category>(ENDPOINTS.categories.detail(slug)),
  getCategoryProducts: (slug: string, filters?: ProductFilter) =>
    productsService.getProducts({ ...filters, categorySlug: slug }),
};
