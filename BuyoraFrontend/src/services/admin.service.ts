import { api } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type {
  Category,
  Coupon,
  DashboardStats,
  InventoryItem,
  Order,
  PageRequest,
  PaginatedResponse,
  Product,
  StockAdjustment,
} from '@/types';

export const adminService = {
  // Dashboard
  getDashboard: () => api.get<DashboardStats>(ENDPOINTS.admin.dashboard),

  // Products
  getProducts: (params?: PageRequest & { q?: string; status?: string }) =>
    api.get<PaginatedResponse<Product>>(ENDPOINTS.admin.products, {
      params: params as Record<string, string | number>,
    }),
  createProduct: (data: unknown) => api.post<Product>(ENDPOINTS.admin.products, data),
  updateProduct: (id: number, data: unknown) => api.put<Product>(ENDPOINTS.admin.product(id), data),
  archiveProduct: (id: number) =>
    api.patch<Product>(ENDPOINTS.admin.product(id), { status: 'ARCHIVED' }),

  // Categories
  getCategories: (params?: PageRequest) =>
    api.get<PaginatedResponse<Category>>(ENDPOINTS.admin.categories, {
      params: params as Record<string, string | number>,
    }),
  createCategory: (data: unknown) => api.post<Category>(ENDPOINTS.admin.categories, data),
  updateCategory: (id: number, data: unknown) =>
    api.put<Category>(ENDPOINTS.admin.category(id), data),

  // Brands
  getBrands: (params?: PageRequest) =>
    api.get<PaginatedResponse<import('@/types').Brand>>(ENDPOINTS.admin.brands, {
      params: params as Record<string, string | number>,
    }),
  createBrand: (data: unknown) => api.post<import('@/types').Brand>(ENDPOINTS.admin.brands, data),
  updateBrand: (id: number, data: unknown) =>
    api.put<import('@/types').Brand>(ENDPOINTS.admin.brand(id), data),

  // Inventory
  getInventory: (params?: PageRequest & { status?: string; q?: string }) =>
    api.get<PaginatedResponse<InventoryItem>>(ENDPOINTS.admin.inventory, {
      params: params as Record<string, string | number>,
    }),
  adjustStock: (data: StockAdjustment) =>
    api.post<void>(ENDPOINTS.admin.inventoryAdjust(data.variantId), {
      quantity: data.adjustment,
      reason: data.reason,
    }),

  // Orders
  getOrders: (params?: PageRequest & { status?: string; q?: string }) =>
    api.get<PaginatedResponse<import('@/types').OrderSummary>>(ENDPOINTS.admin.orders, {
      params: params as Record<string, string | number>,
    }),
  getOrder: (orderNumber: string) => api.get<Order>(ENDPOINTS.admin.order(orderNumber)),
  updateOrderStatus: (orderNumber: string, data: { status: string; notes?: string }) =>
    api.patch<Order>(ENDPOINTS.admin.orderStatus(orderNumber), data),

  // Customers
  getCustomers: (params?: PageRequest & { q?: string }) =>
    api.get<PaginatedResponse<import('@/types').User & { orderCount: number; totalSpent: number }>>(
      ENDPOINTS.admin.customers,
      { params: params as Record<string, string | number> }
    ),

  // Reviews
  getReviews: (params?: PageRequest & { status?: string; productId?: number }) =>
    api.get<PaginatedResponse<import('@/types').Review>>(ENDPOINTS.admin.reviews, {
      params: params as Record<string, string | number>,
    }),
  updateReviewStatus: (id: number, status: 'APPROVED' | 'REJECTED') =>
    api.patch<import('@/types').Review>(ENDPOINTS.admin.reviewStatus(id), { status }),

  // Coupons
  getCoupons: (params?: PageRequest) =>
    api.get<PaginatedResponse<Coupon>>(ENDPOINTS.admin.coupons, {
      params: params as Record<string, string | number>,
    }),
  createCoupon: (data: Omit<Coupon, 'id' | 'usedCount'>) =>
    api.post<Coupon>(ENDPOINTS.admin.coupons, data),
  updateCoupon: (id: number, data: Partial<Coupon>) =>
    api.put<Coupon>(ENDPOINTS.admin.coupon(id), data),
  deleteCoupon: (id: number) => api.delete<void>(ENDPOINTS.admin.coupon(id)),

  // Uploads
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<{ url: string; publicId: string }>(ENDPOINTS.admin.uploadImage, formData, {
      headers: {}, // let browser set Content-Type for multipart
    });
  },
};
