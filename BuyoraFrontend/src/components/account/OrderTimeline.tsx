import { formatDate } from '@/lib/formatting/date';
import { OrderTimeline as OrderTimelineType } from '@/types/order';
import { Check, Clock, CreditCard, Home, Package, Truck } from 'lucide-react';

interface OrderTimelineProps {
  timeline: OrderTimelineType[];
}

const getIcon = (status: string) => {
  switch (status) {
    case 'PENDING_PAYMENT':
      return <CreditCard className="h-5 w-5" />;
    case 'PAYMENT_CONFIRMED':
      return <Check className="h-5 w-5" />;
    case 'PROCESSING':
      return <Clock className="h-5 w-5" />;
    case 'PACKED':
      return <Package className="h-5 w-5" />;
    case 'SHIPPED':
    case 'OUT_FOR_DELIVERY':
      return <Truck className="h-5 w-5" />;
    case 'DELIVERED':
      return <Home className="h-5 w-5" />;
    default:
      return <Check className="h-5 w-5" />;
  }
};

const getLabel = (status: string) => {
  return status
    .replace(/_/g, ' ')
    .replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase()));
};

export function OrderTimeline({ timeline }: OrderTimelineProps) {
  // Sort timeline chronologically just in case, but assume sorted from API
  // Reverse order is often better for vertical, but let's do top-down chronological
  return (
    <div className="py-4">
      <div className="relative ml-4 space-y-8 border-l-2 border-gray-200">
        {timeline.map((step, index) => {
          const isCurrent = index === timeline.length - 1;
          const isPast = !isCurrent;

          return (
            <div key={index} className="relative pl-8">
              <div
                className={`absolute top-1 -left-[17px] flex h-8 w-8 items-center justify-center rounded-full border-4 border-white ${
                  isCurrent
                    ? 'bg-primary text-white shadow-md'
                    : isPast
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-400'
                }`}
              >
                {isPast && !isCurrent ? <Check className="h-4 w-4" /> : getIcon(step.status)}
              </div>

              <div className={`${isPast || isCurrent ? 'text-gray-900' : 'text-gray-400'}`}>
                <h4 className="font-semibold">{getLabel(step.status)}</h4>
                {step.timestamp && (
                  <time className="mt-1 block text-sm text-gray-500">
                    {formatDate(step.timestamp)}
                  </time>
                )}
                {step.note && (
                  <p className="mt-2 rounded-md border border-gray-100 bg-gray-50 p-3 text-sm text-gray-600">
                    {step.note}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
