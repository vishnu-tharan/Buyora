'use client';
import { PageHeader } from '@/components/admin/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatCurrency, formatDate } from '@/lib/formatting';
import { adminService } from '@/services/admin.service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { use } from 'react';

export default function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = use(params);

  const {
    data: order,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['adminOrder', orderNumber],
    queryFn: () => adminService.getOrder(orderNumber),
  });

  const queryClient = useQueryClient();
  const advance = useMutation({
    mutationFn: (status: string) => adminService.updateOrderStatus(orderNumber, { status }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['adminOrder', orderNumber] });
      await queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
    },
  });
  const nextStatus: Record<string, string> = {
    PAYMENT_CONFIRMED: 'PROCESSING',
    PROCESSING: 'PACKED',
    PACKED: 'SHIPPED',
    SHIPPED: 'OUT_FOR_DELIVERY',
    OUT_FOR_DELIVERY: 'DELIVERED',
  };
  if (isLoading)
    return (
      <div className="flex justify-center p-8">
        <LoadingSpinner size={32} />
      </div>
    );
  if (error || !order) return <ErrorState title="Order not found" />;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Order #${order.orderNumber}`}
        description={`Placed on ${formatDate(order.createdAt)}`}
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border-b py-2 last:border-0"
                  >
                    <div>
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium">{formatCurrency(item.unitPrice * item.quantity)}</p>
                  </div>
                ))}
              </div>
              {nextStatus[order.status] && (
                <Button
                  disabled={advance.isPending}
                  onClick={() => advance.mutate(nextStatus[order.status])}
                >
                  Mark {nextStatus[order.status].toLowerCase().replaceAll('_', ' ')}
                </Button>
              )}
              {advance.error && (
                <p role="alert" className="text-red-600">
                  Unable to update the order. Refresh and try again.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Order Status</span>
                <Badge>{order.status}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment</span>
                <Badge variant="outline">{order.paymentStatus}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span>{formatCurrency(order.shippingAmount)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(order.discountAmount)}</span>
                </div>
              )}
              <div className="mt-2 flex justify-between border-t pt-2 font-bold">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
