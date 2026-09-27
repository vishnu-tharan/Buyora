export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? 'Buyora';
export const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
export const DEFAULT_CURRENCY = process.env.NEXT_PUBLIC_DEFAULT_CURRENCY ?? 'LKR';
export const DEFAULT_LOCALE = process.env.NEXT_PUBLIC_DEFAULT_LOCALE ?? 'en-LK';

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 24,
  MAX_PAGE_SIZE: 100,
} as const;

export const CART = {
  MAX_QUANTITY_PER_ITEM: 10,
  GUEST_CART_KEY: 'buyora-guest-cart-id',
} as const;

export const RECENTLY_VIEWED = {
  MAX_ITEMS: 12,
  STORAGE_KEY: 'buyora-recently-viewed',
} as const;

export const SRI_LANKA_DISTRICTS = [
  'Colombo',
  'Gampaha',
  'Kalutara',
  'Kandy',
  'Matale',
  'Nuwara Eliya',
  'Galle',
  'Matara',
  'Hambantota',
  'Jaffna',
  'Kilinochchi',
  'Mannar',
  'Mullaitivu',
  'Vavuniya',
  'Puttalam',
  'Kurunegala',
  'Anuradhapura',
  'Polonnaruwa',
  'Badulla',
  'Monaragala',
  'Ratnapura',
  'Kegalle',
  'Ampara',
  'Batticaloa',
  'Trincomalee',
] as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: 'Pending Payment',
  PAYMENT_CONFIRMED: 'Payment Confirmed',
  PROCESSING: 'Processing',
  PACKED: 'Packed',
  SHIPPED: 'Shipped',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  RETURN_REQUESTED: 'Return Requested',
  RETURNED: 'Returned',
  REFUNDED: 'Refunded',
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  PAID: 'Paid',
  FAILED: 'Failed',
  REFUNDED: 'Refunded',
  PARTIALLY_REFUNDED: 'Partially Refunded',
};

export const SORT_OPTIONS = [
  { value: 'RELEVANCE', label: 'Relevance' },
  { value: 'NEWEST', label: 'Newest' },
  { value: 'PRICE_ASC', label: 'Price: Low to High' },
  { value: 'PRICE_DESC', label: 'Price: High to Low' },
  { value: 'RATING', label: 'Top Rated' },
  { value: 'BEST_SELLING', label: 'Best Selling' },
] as const;

export * from './sort';
