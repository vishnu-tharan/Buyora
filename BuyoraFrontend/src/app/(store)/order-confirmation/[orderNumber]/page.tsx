'use client';

import { StatusBadge } from '@/components/account/StatusBadge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatCurrency } from '@/lib/formatting/currency';
import { ordersService } from '@/services/orders.service';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, CheckCircle2, ChevronRight, Package } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function OrderConfirmationPage() {
  const params = useParams();
  const orderNumber = params.orderNumber as string;

  const {
    data: order,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['order', orderNumber],
    queryFn: () => ordersService.getOrder(orderNumber),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
        <LoadingSpinner size={32} />
        <p className="text-gray-500">Confirming your order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-4">
        <AlertCircle className="mb-4 h-16 w-16 text-red-500" />
        <h1 className="mb-2 text-2xl font-bold">Order Not Found</h1>
        <p className="mb-6 max-w-md text-center text-gray-500">
          We couldn&apos;t find the details for this order. It may still be processing.
        </p>
        <Button asChild>
          <Link href="/account/orders">View My Orders</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-gray-900">Order Confirmed!</h1>
        <p className="text-lg text-gray-600">Order #{order.orderNumber}</p>
        <p className="mt-2 text-gray-500">
          We&apos;ve sent a confirmation email with your order details.
        </p>
      </div>

      <div className="mb-8 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 bg-gray-50 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Order Details</h2>
          <StatusBadge type="payment" status={order.paymentStatus} />
        </div>

        <div className="grid grid-cols-1 gap-8 p-6 md:grid-cols-2">
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-500">
              <Package className="h-4 w-4" />
              Delivery Information
            </h3>
            <div className="space-y-1 rounded-lg bg-gray-50 p-4 text-sm text-gray-900">
              <p className="font-medium">
                {order.shippingAddress.firstName} {order.shippingAddress.lastName}
              </p>
              <p>{order.shippingAddress.addressLine1}</p>
              {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.district}
              </p>
              <p>{order.shippingAddress.country}</p>
              <p className="pt-2 text-gray-500">Method: {order.deliveryMethod}</p>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-medium text-gray-500">Order Summary</h3>
            <div className="space-y-3 rounded-lg bg-gray-50 p-4 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>
                  Subtotal ({order.items.reduce((acc, item) => acc + item.quantity, 0)} items)
                </span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>
                  {order.shippingAmount === 0 ? 'Free' : formatCurrency(order.shippingAmount)}
                </span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-3 text-base font-semibold text-gray-900">
                <span>Total Paid</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="text-sm text-gray-600">
              Payment Method:{' '}
              <span className="font-medium text-gray-900">
                {order.paymentMethod.replace(/_/g, ' ')}
              </span>
            </span>
            {order.paymentStatus === 'PENDING' && (
              <p className="text-sm font-medium text-orange-600">
                Payment is pending. We will process your order once payment is confirmed.
              </p>
            )}
            {order.paymentStatus === 'FAILED' && (
              <p className="text-sm font-medium text-red-600">
                Payment failed. Please try again or contact support.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center gap-4 sm:flex-row">
        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link href={`/account/orders/${order.orderNumber}`}>
            Track Your Order <ChevronRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
          <Link href="/">Continue Shopping</Link>
        </Button>
      </div>
    </div>
  );
}
