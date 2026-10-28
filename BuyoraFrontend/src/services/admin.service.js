import { api } from '@/lib/api-client';
import { ENDPOINTS } from '@/lib/api-endpoints';

export const adminService = {
  // Dashboard
  getDashboard: () => api.get(ENDPOINTS.admin.dashboard),
  // Products
  getProducts: (params) =>
    api.get(ENDPOINTS.admin.products, {
      params: params,
    }),
  createProduct: (data) => api.post(ENDPOINTS.admin.products, data),
  updateProduct: (id, data) => api.put(ENDPOINTS.admin.product(id), data),
  archiveProduct: (id) => api.patch(ENDPOINTS.admin.product(id), { status: 'ARCHIVED' }),
  // Categories
  getCategories: (params) =>
    api.get(ENDPOINTS.admin.categories, {
      params: params,
    }),
  createCategory: (data) => api.post(ENDPOINTS.admin.categories, data),
  updateCategory: (id, data) => api.put(ENDPOINTS.admin.category(id), data),
  // Brands
  getBrands: (params) =>
    api.get(ENDPOINTS.admin.brands, {
      params: params,
    }),
  createBrand: (data) => api.post(ENDPOINTS.admin.brands, data),
  updateBrand: (id, data) => api.put(ENDPOINTS.admin.brand(id), data),
  // Inventory
  getInventory: (params) =>
    api.get(ENDPOINTS.admin.inventory, {
      params: params,
    }),
  adjustStock: (data) =>
    api.post(ENDPOINTS.admin.inventoryAdjust(data.variantId), {
      quantity: data.adjustment,
      reason: data.reason,
    }),
  // Orders
  getOrders: (params) =>
    api.get(ENDPOINTS.admin.orders, {
      params: params,
    }),
  getOrder: (orderNumber) => api.get(ENDPOINTS.admin.order(orderNumber)),
  updateOrderStatus: (orderNumber, data) =>
    api.patch(ENDPOINTS.admin.orderStatus(orderNumber), data),
  // Customers
  getCustomers: (params) => api.get(ENDPOINTS.admin.customers, { params: params }),
  // Reviews
  getReviews: (params) =>
    api.get(ENDPOINTS.admin.reviews, {
      params: params,
    }),
  updateReviewStatus: (id, status) => api.patch(ENDPOINTS.admin.reviewStatus(id), { status }),
  // Coupons
  getCoupons: (params) =>
    api.get(ENDPOINTS.admin.coupons, {
      params: params,
    }),
  createCoupon: (data) => api.post(ENDPOINTS.admin.coupons, data),
  updateCoupon: (id, data) => api.put(ENDPOINTS.admin.coupon(id), data),
  deleteCoupon: (id) => api.delete(ENDPOINTS.admin.coupon(id)),
  // Uploads
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(ENDPOINTS.admin.uploadImage, formData, {
      headers: {}, // let browser set Content-Type for multipart
    });
  },
};
