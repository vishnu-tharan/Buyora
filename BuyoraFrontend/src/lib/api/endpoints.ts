export const ENDPOINTS = {
  // Auth
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    me: '/auth/me',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
  },

  // Products
  products: {
    list: '/products',
    detail: (slug: string) => `/products/${slug}`,
    featured: '/products/featured',
    newArrivals: '/products/new-arrivals',
    bestSellers: '/products/best-sellers',
    recommended: '/products/recommended',
    search: '/products/search',
    suggestions: '/products/suggestions',
  },

  // Categories
  categories: {
    list: '/categories',
    tree: '/categories/tree',
    detail: (slug: string) => `/categories/${slug}`,
    products: (slug: string) => `/categories/${slug}/products`,
  },

  // Brands
  brands: {
    list: '/brands',
    detail: (slug: string) => `/brands/${slug}`,
    featured: '/brands/featured',
  },

  // Cart
  cart: {
    get: '/cart',
    add: '/cart/items',
    update: (itemId: number) => `/cart/items/${itemId}`,
    remove: (itemId: number) => `/cart/items/${itemId}`,
    clear: '/cart/clear',
    applyCoupon: '/cart/coupon',
    removeCoupon: '/cart/coupon',
    merge: '/cart/merge',
  },

  // Wishlist
  wishlist: {
    get: '/wishlist',
    add: '/wishlist/items',
    remove: (productId: number) => `/wishlist/items/${productId}`,
    moveToCart: (productId: number) => `/wishlist/items/${productId}/move-to-cart`,
  },

  // Checkout
  checkout: {
    initiate: '/checkout/preview',
    shippingMethods: '/checkout/shipping-methods',
    validateAddress: '/checkout/validate-address',
    placeOrder: '/checkout/place-order',
  },

  // Orders
  orders: {
    list: '/orders',
    detail: (orderNumber: string) => `/orders/${orderNumber}`,
    cancel: (orderNumber: string) => `/orders/${orderNumber}/cancel`,
    returnRequest: (orderNumber: string) => `/orders/${orderNumber}/returns`,
    reorder: (orderNumber: string) => `/orders/${orderNumber}/reorder`,
  },

  // Payment
  payment: {
    initiate: '/payments/initiate',
    verify: '/payments/verify',
    status: (paymentId: string) => `/payments/${paymentId}/status`,
  },

  // Reviews
  reviews: {
    product: (productId: number) => `/products/${productId}/reviews`,
    create: (productId: number) => `/products/${productId}/reviews`,
    myReview: (productId: number) => `/products/${productId}/reviews/my`,
    helpful: (reviewId: number) => `/reviews/${reviewId}/helpful`,
  },

  // Account
  account: {
    profile: '/account/profile',
    updateProfile: '/account/profile',
    addresses: '/account/addresses',
    addAddress: '/account/addresses',
    updateAddress: (id: string) => `/account/addresses/${id}`,
    deleteAddress: (id: string) => `/account/addresses/${id}`,
    setDefaultAddress: (id: string) => `/account/addresses/${id}/default`,
    changePassword: '/account/change-password',
    orders: '/account/orders',
    wishlist: '/account/wishlist',
    reviews: '/account/reviews',
    recentlyViewed: '/account/recently-viewed',
  },

  // Admin
  admin: {
    dashboard: '/admin/dashboard',
    // Products
    products: '/admin/products',
    product: (id: number) => `/admin/products/${id}`,
    // Categories
    categories: '/admin/categories',
    category: (id: number) => `/admin/categories/${id}`,
    // Brands
    brands: '/admin/brands',
    brand: (id: number) => `/admin/brands/${id}`,
    // Inventory
    inventory: '/admin/inventory',
    inventoryAdjust: (variantId: number) => `/admin/inventory/variants/${variantId}/adjust`,
    inventoryHistory: (variantId: number) => `/admin/inventory/${variantId}/history`,
    // Orders
    orders: '/admin/orders',
    order: (orderNumber: string) => `/admin/orders/${orderNumber}`,
    orderStatus: (orderNumber: string) => `/admin/orders/${orderNumber}/status`,
    // Customers
    customers: '/admin/customers',
    customer: (id: number) => `/admin/customers/${id}`,
    // Reviews
    reviews: '/admin/reviews',
    reviewStatus: (id: number) => `/admin/reviews/${id}/status`,
    // Coupons
    coupons: '/admin/coupons',
    coupon: (id: number) => `/admin/coupons/${id}`,
    // Uploads
    uploadImage: '/admin/uploads/image',
  },
} as const;
