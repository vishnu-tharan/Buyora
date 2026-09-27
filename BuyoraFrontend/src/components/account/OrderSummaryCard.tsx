import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/formatting/currency';
import { formatDate } from '@/lib/formatting/date';
import { OrderSummary } from '@/types/order';
import { ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { StatusBadge } from './StatusBadge';

interface OrderSummaryCardProps {
  order: OrderSummary;
}

export function OrderSummaryCard({ order }: OrderSummaryCardProps) {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition-colors hover:border-gray-300 sm:flex-row">
      <div className="flex flex-1 flex-col gap-6 p-4 sm:flex-row sm:p-6">
        <div className="flex-shrink-0">
          {order.primaryImage ? (
            <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-md border border-gray-100 bg-gray-50">
              <Image
                src={order.primaryImage.url}
                alt={order.primaryImage.altText || ''}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-md border border-gray-100 bg-gray-50">
              <span className="text-xs font-medium text-gray-400">No Image</span>
            </div>
          )}
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <Link
                href={`/account/orders/${order.orderNumber}`}
                className="hover:text-primary text-lg font-semibold transition-colors"
              >
                Order #{order.orderNumber}
              </Link>
              <p className="mt-0.5 text-sm text-gray-500">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <StatusBadge type="order" status={order.status} />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600">
            <div>
              <span className="font-medium text-gray-900">Total:</span>{' '}
              {formatCurrency(order.total)}
            </div>
            <div>
              <span className="font-medium text-gray-900">Items:</span> {order.itemCount}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-gray-900">Payment:</span>
              <StatusBadge
                type="payment"
                status={order.paymentStatus}
                className="h-5 py-0 text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full min-w-[140px] flex-row items-center justify-end gap-3 border-t border-gray-200 bg-gray-50 p-4 sm:w-auto sm:flex-col sm:justify-center sm:border-t-0 sm:border-l sm:p-6">
        <Button asChild variant="outline" className="w-full justify-between" size="sm">
          <Link href={`/account/orders/${order.orderNumber}`}>
            View Details <ChevronRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
