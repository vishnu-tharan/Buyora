'use client';
import { getErrorDetails } from '@/lib/api/errors';

import { CancelOrderDialog } from '@/components/account/CancelOrderDialog';
import { OrderTimeline } from '@/components/account/OrderTimeline';
import { ReturnRequestDialog } from '@/components/account/ReturnRequestDialog';
import { StatusBadge } from '@/components/account/StatusBadge';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/formatting/currency';
import { formatDate } from '@/lib/formatting/date';
import { ordersService } from '@/services/orders.service';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, FileText, HelpCircle, Package, Printer, Truck } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';

export default function OrderDetailPage() {
  const params = useParams();
  const { toast } = useToast();
  const orderNumber = params.orderNumber as string;

  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const {
    data: order,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['order', orderNumber],
    queryFn: () => ordersService.getOrder(orderNumber),
  });

  const handleCancel = async (reason: string) => {
    setIsActionLoading(true);
    try {
      await ordersService.cancelOrder(orderNumber, reason);
      toast.add({ title: 'Order cancelled successfully' });
      setIsCancelDialogOpen(false);
      refetch();
    } catch (caught) {
      const err = getErrorDetails(caught);
      toast.add({
        title: 'Failed to cancel order',
        description: err.message || 'Please try again later.',
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleReturn = async (data: { itemIds: number[]; reason: string; notes: string }) => {
    setIsActionLoading(true);
    try {
      await ordersService.requestReturn(orderNumber, data);
      toast.add({ title: 'Return request submitted successfully' });
      setIsReturnDialogOpen(false);
      refetch();
    } catch (caught) {
      const err = getErrorDetails(caught);
      toast.add({
        title: 'Failed to submit return request',
        description: err.message || 'Please try again later.',
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="py-10">
        <ErrorState
          title="Order not found"
          message="We couldn't find the order you're looking for."
        />
        <div className="mt-6 flex justify-center">
          <Button asChild variant="outline">
            <Link href="/account/orders">Back to Orders</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/account/orders" className="hover:text-primary flex items-center">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Orders
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-100 bg-white p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Order #{order.orderNumber}
          </h1>
          <p className="mt-1 flex items-center gap-3 text-sm text-gray-500">
            <span>Placed on {formatDate(order.createdAt)}</span>
            <span className="h-1 w-1 rounded-full bg-gray-300" />
            <Link
              href={`/contact?order=${order.orderNumber}`}
              className="text-primary flex items-center gap-1 hover:underline"
            >
              <HelpCircle className="h-3 w-3" /> Need help?
            </Link>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Print Invoice
          </Button>
          {order.canCancel && (
            <Button
              variant="outline"
              size="sm"
              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => setIsCancelDialogOpen(true)}
            >
              Cancel Order
            </Button>
          )}
          {order.canReturn && (
            <Button variant="outline" size="sm" onClick={() => setIsReturnDialogOpen(true)}>
              Request Return
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Timeline */}
          <div className="rounded-xl border border-gray-100 bg-white p-6">
            <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold">
              <Truck className="h-5 w-5 text-gray-400" />
              Order Status
            </h2>
            <div className="mb-6 flex flex-wrap gap-2">
              <StatusBadge type="order" status={order.status} className="px-3 py-1 text-sm" />
              <StatusBadge
                type="payment"
                status={order.paymentStatus}
                className="px-3 py-1 text-sm"
              />
            </div>
            {order.timeline && order.timeline.length > 0 ? (
              <OrderTimeline timeline={order.timeline} />
            ) : (
              <p className="text-sm text-gray-500 italic">Timeline information not available.</p>
            )}
          </div>

          {/* Items */}
          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
            <h2 className="flex items-center gap-2 border-b border-gray-100 p-6 text-lg font-semibold">
              <Package className="h-5 w-5 text-gray-400" />
              Items Ordered
            </h2>
            <div className="divide-y divide-gray-100">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 p-6">
                  <Link href={`/product/${item.product.slug}`} className="flex-shrink-0">
                    {item.product.primaryImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.product.primaryImage.url}
                        alt=""
                        className="h-20 w-20 rounded-md border border-gray-100 object-cover"
                      />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-md border border-gray-100 bg-gray-50">
                        <span className="text-xs text-gray-400">No Image</span>
                      </div>
                    )}
                  </Link>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <Link
                        href={`/product/${item.product.slug}`}
                        className="hover:text-primary font-medium text-gray-900"
                      >
                        {item.product.name}
                      </Link>
                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-gray-500">
                        {Object.entries(item.variant.attributes).map(([key, value]) => (
                          <span key={key}>
                            {key}: {value}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                      <span className="font-medium">{formatCurrency(item.unitPrice)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Summary */}
          <div className="rounded-xl border border-gray-100 bg-white p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <FileText className="h-5 w-5 text-gray-400" />
              Order Summary
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount {order.couponCode ? `(${order.couponCode})` : ''}</span>
                  <span>-{formatCurrency(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>
                  {order.shippingAmount === 0 ? 'Free' : formatCurrency(order.shippingAmount)}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span>{formatCurrency(order.taxAmount)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-3 text-lg font-semibold">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Shipping */}
          <div className="rounded-xl border border-gray-100 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold">Shipping Information</h2>
            <div className="space-y-1 text-sm text-gray-600">
              <p className="font-medium text-gray-900">
                {order.shippingAddress.firstName} {order.shippingAddress.lastName}
              </p>
              <p>{order.shippingAddress.addressLine1}</p>
              {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.district}
              </p>
              {order.shippingAddress.postalCode && <p>{order.shippingAddress.postalCode}</p>}
              <p>{order.shippingAddress.country}</p>
              <p className="flex items-center gap-2 pt-2">
                <span className="text-gray-400">Phone:</span> {order.shippingAddress.phone}
              </p>
            </div>

            <div className="mt-4 border-t border-gray-100 pt-4">
              <p className="mb-1 text-sm font-medium text-gray-900">Method</p>
              <p className="text-sm text-gray-600">{order.deliveryMethod}</p>
              {order.trackingNumber && (
                <p className="mt-2 text-sm">
                  <span className="text-gray-500">Tracking Number: </span>
                  <span className="font-medium">{order.trackingNumber}</span>
                </p>
              )}
            </div>
          </div>

          {/* Payment */}
          <div className="rounded-xl border border-gray-100 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold">Payment Information</h2>
            <div className="text-sm">
              <p className="mb-2 text-gray-600">
                Method:{' '}
                <span className="font-medium text-gray-900">
                  {order.paymentMethod.replace(/_/g, ' ')}
                </span>
              </p>
              <StatusBadge type="payment" status={order.paymentStatus} />
            </div>
          </div>
        </div>
      </div>

      <CancelOrderDialog
        open={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
        onConfirm={handleCancel}
        isLoading={isActionLoading}
      />

      <ReturnRequestDialog
        open={isReturnDialogOpen}
        onOpenChange={setIsReturnDialogOpen}
        items={order.items}
        onSubmit={handleReturn}
        isLoading={isActionLoading}
      />
    </div>
  );
}
