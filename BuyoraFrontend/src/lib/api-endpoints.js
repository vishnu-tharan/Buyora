export const ENDPOINTS = {
  // Auth
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    me: '/auth/me',
  },
  // Products
  products: {
    list: '/products',
    detail: (slug) => `/products/${slug}`,
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
    detail: (slug) => `/categories/${slug}`,
  },
  // Cart
  cart: {
    get: '/cart',
    add: '/cart/items',
    update: (itemId) => `/cart/items/${itemId}`,
    remove: (itemId) => `/cart/items/${itemId}`,
    clear: '/cart/clear',
    applyCoupon: '/cart/coupon',
    removeCoupon: '/cart/coupon',
    merge: '/cart/merge',
  },
  // Wishlist
  wishlist: {
    get: '/wishlist',
    add: '/wishlist/items',
    remove: (productId) => `/wishlist/items/${productId}`,
    moveToCart: (productId) => `/wishlist/items/${productId}/move-to-cart`,
  },
  // Checkout
  checkout: {
    initiate: '/checkout/preview',
    shippingMethods: '/checkout/shipping-methods',
    placeOrder: '/checkout/place-order',
  },
  // Orders
  orders: {
    list: '/orders',
    detail: (orderNumber) => `/orders/${orderNumber}`,
    cancel: (orderNumber) => `/orders/${orderNumber}/cancel`,
    returnRequest: (orderNumber) => `/orders/${orderNumber}/returns`,
    reorder: (orderNumber) => `/orders/${orderNumber}/reorder`,
  },
  // Payment
  payment: {
    initiate: '/payments/initiate',
    verify: '/payments/verify',
    status: (paymentId) => `/payments/${paymentId}/status`,
  },
  // Reviews
  reviews: {
    product: (productId) => `/products/${productId}/reviews`,
    create: (productId) => `/products/${productId}/reviews`,
    helpful: (reviewId) => `/reviews/${reviewId}/helpful`,
  },
  // Account
  account: {
    profile: '/account/profile',
    updateProfile: '/account/profile',
    addresses: '/account/addresses',
    addAddress: '/account/addresses',
    updateAddress: (id) => `/account/addresses/${id}`,
    deleteAddress: (id) => `/account/addresses/${id}`,
    setDefaultAddress: (id) => `/account/addresses/${id}/default`,
    changePassword: '/account/change-password',
    reviews: '/account/reviews',
  },
  // Admin
  admin: {
    dashboard: '/admin/dashboard',
    // Products
    products: '/admin/products',
    product: (id) => `/admin/products/${id}`,
    // Categories
    categories: '/admin/categories',
    category: (id) => `/admin/categories/${id}`,
    // Brands
    brands: '/admin/brands',
    brand: (id) => `/admin/brands/${id}`,
    // Inventory
    inventory: '/admin/inventory',
    inventoryAdjust: (variantId) => `/admin/inventory/variants/${variantId}/adjust`,
    // Orders
    orders: '/admin/orders',
    order: (orderNumber) => `/admin/orders/${orderNumber}`,
    orderStatus: (orderNumber) => `/admin/orders/${orderNumber}/status`,
    // Customers
    customers: '/admin/customers',
    // Reviews
    reviews: '/admin/reviews',
    reviewStatus: (id) => `/admin/reviews/${id}/status`,
    // Coupons
    coupons: '/admin/coupons',
    coupon: (id) => `/admin/coupons/${id}`,
    // Uploads
    uploadImage: '/admin/uploads/image',
  },
};
