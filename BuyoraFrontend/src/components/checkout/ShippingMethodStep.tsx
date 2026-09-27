'use client';

import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/ErrorState';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/formatting/currency';
import { checkoutService } from '@/services/checkout.service';
import { useCheckoutStore } from '@/stores';
import { useQuery } from '@tanstack/react-query';
import { Truck } from 'lucide-react';

export function ShippingMethodStep() {
  const { state, setShippingMethod, setStep } = useCheckoutStore();
  const { toast } = useToast();
  const query = useQuery({
    queryKey: ['checkout-preview'],
    queryFn: checkoutService.preview,
    retry: false,
  });
  const methods = query.data?.shippingMethods ?? [];
  const isLoading = query.isPending;
  if (query.isError)
    return <ErrorState title="Shipping is unavailable" onRetry={() => query.refetch()} />;
  const handleContinue = () => {
    if (!methods.some((method) => method.id === state.shippingMethod?.id)) {
      toast.add({ title: 'Please select a shipping method', type: 'error' });
      return;
    }
    setStep(3);
  };

  return (
    <div className="space-y-6">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Shipping Method</h2>

      {!isLoading && methods.length === 0 && (
        <p>No shipping methods are available for this order.</p>
      )}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
      ) : (
        <RadioGroup
          value={state.shippingMethod?.id}
          onValueChange={(id) => {
            const selected = methods.find((m) => m.id === id);
            if (selected) setShippingMethod(selected);
          }}
          className="space-y-4"
        >
          {methods.map((method) => (
            <div
              key={method.id}
              className={`relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none ${
                state.shippingMethod?.id === method.id
                  ? 'border-black ring-1 ring-black'
                  : 'border-gray-300'
              }`}
            >
              <RadioGroupItem value={method.id} id={method.id} className="mt-1" />
              <div className="ml-4 flex flex-1 flex-col">
                <Label
                  htmlFor={method.id}
                  className="flex cursor-pointer items-center justify-between font-medium text-gray-900"
                >
                  <span className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-gray-500" />
                    {method.name}
                  </span>
                  <span
                    className={
                      method.price === 0
                        ? 'font-bold text-green-600'
                        : 'font-semibold text-gray-900'
                    }
                  >
                    {method.price === 0 ? 'FREE' : formatCurrency(method.price)}
                  </span>
                </Label>
                {method.description && (
                  <p className="mt-1 pl-6 text-sm text-gray-500">{method.description}</p>
                )}
              </div>
            </div>
          ))}
        </RadioGroup>
      )}

      <div className="flex items-center justify-between border-t border-gray-200 pt-6">
        <Button variant="ghost" onClick={() => setStep(1)}>
          Back
        </Button>
        <Button
          onClick={handleContinue}
          size="lg"
          disabled={isLoading || !methods.some((method) => method.id === state.shippingMethod?.id)}
        >
          Continue to Payment
        </Button>
      </div>
    </div>
  );
}
