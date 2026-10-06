'use client';

import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/ErrorState';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { storeService } from '@/services/store.service';
import { checkoutService } from '@/services/checkout.service';
import { useCheckoutStore } from '@/stores';
import type { PaymentMethod } from '@/types/order';
import { useQuery } from '@tanstack/react-query';
import { Banknote, CreditCard, Wallet, type LucideIcon } from 'lucide-react';

const paymentMethods: {
  id: PaymentMethod;
  title: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    id: 'PAYHERE',
    title: 'Credit/Debit Card (via PayHere)',
    description:
      "You'll be redirected to PayHere's secure payment page. Supports Visa, Mastercard, Amex, etc.",
    icon: CreditCard,
  },
  {
    id: 'STRIPE',
    title: 'Stripe',
    description: 'Pay securely via Stripe. Supports Visa, Mastercard.',
    icon: Wallet,
  },
  {
    id: 'CASH_ON_DELIVERY',
    title: 'Cash on Delivery',
    description:
      'Pay when your order arrives. Available for selected areas. Additional fee may apply.',
    icon: Banknote,
  },
];

export function PaymentMethodStep() {
  const { state, setPaymentMethod, setStep } = useCheckoutStore();

  const query = useQuery({
    queryKey: ['checkout-preview'],
    queryFn: checkoutService.preview,
    retry: false,
  });
  const district = state.shippingAddress?.district ?? '';
  const delivery = useQuery({
    queryKey: ['delivery', district],
    queryFn: () => storeService.delivery(district),
    enabled: !!district,
  });
  const available = paymentMethods.filter(
    (method) =>
      query.data?.paymentMethods.includes(method.id) &&
      (method.id !== 'CASH_ON_DELIVERY' || delivery.data?.codAvailable === true)
  );
  if (query.isError)
    return <ErrorState title="Payment methods are unavailable" onRetry={() => query.refetch()} />;
  const handleContinue = () => {
    if (available.some((method) => method.id === state.paymentMethod)) {
      setStep(4);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Payment Method</h2>

      <RadioGroup
        value={state.paymentMethod}
        onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
        className="space-y-4"
      >
        {available.map((method) => {
          const Icon = method.icon;
          const isSelected = state.paymentMethod === method.id;

          return (
            <div
              key={method.id}
              className={`relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none ${
                isSelected ? 'border-black ring-1 ring-black' : 'border-gray-300'
              }`}
            >
              <RadioGroupItem value={method.id} id={method.id} className="mt-1" />
              <div className="ml-4 flex flex-1 flex-col">
                <Label
                  htmlFor={method.id}
                  className="flex cursor-pointer items-center gap-2 font-medium text-gray-900"
                >
                  <Icon className="h-5 w-5 text-gray-500" />
                  {method.title}
                </Label>
                <p className="mt-1 pl-7 text-sm text-gray-500">{method.description}</p>
              </div>
            </div>
          );
        })}
      </RadioGroup>

      <div className="flex items-center justify-between border-t border-gray-200 pt-6">
        <Button variant="ghost" onClick={() => setStep(2)}>
          Back
        </Button>
        <Button
          onClick={handleContinue}
          size="lg"
          disabled={!available.some((method) => method.id === state.paymentMethod)}
        >
          Continue to Review
        </Button>
      </div>
    </div>
  );
}
