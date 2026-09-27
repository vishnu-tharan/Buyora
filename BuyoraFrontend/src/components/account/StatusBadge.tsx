import { Badge } from '@/components/ui/badge';
import { OrderStatus, PaymentStatus } from '@/types/order';

interface StatusBadgeProps {
  status: OrderStatus | PaymentStatus;
  type: 'order' | 'payment';
  className?: string;
}

const ORDER_STATUS_CONFIG: Record<OrderStatus, { label: string; color: string }> = {
  PENDING_PAYMENT: {
    label: 'Pending Payment',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
  },
  PAYMENT_CONFIRMED: {
    label: 'Payment Confirmed',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  PROCESSING: { label: 'Processing', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  PACKED: { label: 'Packed', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  SHIPPED: { label: 'Shipped', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
  OUT_FOR_DELIVERY: {
    label: 'Out for Delivery',
    color: 'bg-teal-100 text-teal-800 border-teal-200',
  },
  DELIVERED: { label: 'Delivered', color: 'bg-green-100 text-green-800 border-green-200' },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-800 border-red-200' },
  RETURN_REQUESTED: {
    label: 'Return Requested',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  RETURNED: { label: 'Returned', color: 'bg-gray-100 text-gray-800 border-gray-200' },
  REFUNDED: { label: 'Refunded', color: 'bg-gray-100 text-gray-800 border-gray-200' },
};

const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, { label: string; color: string }> = {
  PENDING: { label: 'Pending', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  PAID: { label: 'Paid', color: 'bg-green-100 text-green-800 border-green-200' },
  FAILED: { label: 'Failed', color: 'bg-red-100 text-red-800 border-red-200' },
  REFUNDED: { label: 'Refunded', color: 'bg-gray-100 text-gray-800 border-gray-200' },
  PARTIALLY_REFUNDED: {
    label: 'Partially Refunded',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
};

export function StatusBadge({ status, type, className = '' }: StatusBadgeProps) {
  const config =
    type === 'order'
      ? ORDER_STATUS_CONFIG[status as OrderStatus]
      : PAYMENT_STATUS_CONFIG[status as PaymentStatus];

  if (!config) {
    return <Badge variant="outline">{status}</Badge>;
  }

  return (
    <Badge variant="outline" className={`${config.color} ${className}`}>
      {config.label}
    </Badge>
  );
}
