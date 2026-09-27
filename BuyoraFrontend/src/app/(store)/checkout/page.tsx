'use client';
import { CheckoutOrderSummary } from '@/components/checkout/CheckoutOrderSummary';
import { CheckoutStepper } from '@/components/checkout/CheckoutStepper';
import { ContactShippingStep } from '@/components/checkout/ContactShippingStep';
import { OrderReviewStep } from '@/components/checkout/OrderReviewStep';
import { PaymentMethodStep } from '@/components/checkout/PaymentMethodStep';
import { PaymentStep } from '@/components/checkout/PaymentStep';
import { ShippingMethodStep } from '@/components/checkout/ShippingMethodStep';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useCartQuery } from '@/features/cart/use-cart-query';
import { useCheckoutStore } from '@/stores';
import Link from 'next/link';
export default function CheckoutPage() {
  const step = useCheckoutStore((store) => store.state.step);
  const cart = useCartQuery();
  if (step !== 5 && cart.isPending)
    return (
      <div role="status" className="p-12">
        <LoadingSpinner />
      </div>
    );
  if (step !== 5 && cart.isError)
    return <ErrorState title="Unable to load your cart" onRetry={() => cart.refetch()} />;
  if (step !== 5 && !cart.data?.items.length)
    return (
      <div className="p-12 text-center">
        <h1>Your cart is empty</h1>
        <Link href="/categories" className="underline">
          Continue shopping
        </Link>
      </div>
    );
  return (
    <div className="container mx-auto max-w-6xl space-y-8 px-4 py-8">
      <h1 className="text-3xl font-bold">Checkout</h1>
      <CheckoutStepper currentStep={step} />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section>
          {step === 1 ? (
            <ContactShippingStep />
          ) : step === 2 ? (
            <ShippingMethodStep />
          ) : step === 3 ? (
            <PaymentMethodStep />
          ) : step === 4 ? (
            <OrderReviewStep />
          ) : (
            <PaymentStep />
          )}
        </section>
        {step !== 5 && (
          <aside>
            <CheckoutOrderSummary />
          </aside>
        )}
      </div>
    </div>
  );
}
