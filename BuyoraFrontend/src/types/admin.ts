export interface DashboardStats {
  todaySales: number;
  todayOrders: number;
  totalCustomers: number;
  totalProducts: number;
  lowStockCount: number;
  pendingOrdersCount: number;
  recentOrders: Array<{
    orderNumber: string;
    total: number;
    status: string;
    createdAt: string;
  }>;
  salesOverview: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
}

export interface InventoryItem {
  id: number;
  variantId: number;
  sku: string;
  productName: string;
  variantAttributes: Record<string, string>;
  availableQuantity: number;
  reservedQuantity: number;
  totalQuantity: number;
  lowStockThreshold: number;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
}

export interface StockAdjustment {
  variantId: number;
  adjustment: number; // positive = add, negative = remove
  reason: string;
  note?: string;
}

export interface Coupon {
  id: number;
  code: string;
  type: 'PERCENTAGE' | 'FIXED' | 'FREE_SHIPPING';
  value: number;
  minimumOrderAmount?: number;
  maximumDiscountAmount?: number;
  startDate: string;
  endDate?: string;
  usageLimit?: number;
  perUserLimit?: number;
  usedCount: number;
  isActive: boolean;
  productIds?: number[];
  categoryIds?: number[];
}
