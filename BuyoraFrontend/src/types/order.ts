export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAYMENT_CONFIRMED'
  | 'PROCESSING'
  | 'PACKED'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURN_REQUESTED'
  | 'RETURNED'
  | 'REFUNDED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';

export type PaymentMethod = 'PAYHERE' | 'STRIPE' | 'CASH_ON_DELIVERY';

export interface OrderItem {
  id: number;
  product: {
    id: number;
    name: string;
    slug: string;
    primaryImage?: { url: string; altText?: string };
  };
  variant: {
    id: number;
    sku: string;
    attributes: Record<string, string>;
  };
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discountAmount: number;
  reviewEligible?: boolean;
  reviewId?: number;
}

export interface OrderTimeline {
  status: OrderStatus;
  timestamp: string;
  note?: string;
  isActive: boolean;
  isCompleted: boolean;
}

export interface Order {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  items: OrderItem[];
  shippingAddress: {
    firstName: string;
    lastName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    district: string;
    postalCode?: string;
    country: string;
  };
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  taxAmount: number;
  total: number;
  couponCode?: string;
  deliveryMethod: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  timeline: OrderTimeline[];
  notes?: string;
  canCancel: boolean;
  canReturn: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderSummary {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  itemCount: number;
  total: number;
  createdAt: string;
  primaryImage?: { url: string; altText?: string };
}
