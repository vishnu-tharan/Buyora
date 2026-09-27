'use client';
import { Button, buttonVariants } from '@/components/ui/button';
import { checkoutService } from '@/services/checkout.service';
import { useCheckoutStore } from '@/stores';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

export function PaymentStep() {
  const router = useRouter();
  const method = useCheckoutStore((store) => store.state.paymentMethod);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const submitting = useRef(false);
  async function pay() {
    if (submitting.current) return;
    submitting.current = true;
    setPending(true);
    setError('');
    try {
      const orderNumber = sessionStorage.getItem('currentOrderNumber');
      if (!orderNumber || !method)
        throw new Error('Order details are missing. Please check your orders before trying again.');
      if (method === 'CASH_ON_DELIVERY') {
        router.push('/order-confirmation/' + encodeURIComponent(orderNumber));
        return;
      }
      const payment = await checkoutService.initiatePayment({ orderNumber, paymentMethod: method });
      if (!payment.redirectUrl || !payment.formData || method !== 'PAYHERE')
        throw new Error('This payment method is unavailable. Your order has not been marked paid.');
      const url = new URL(payment.redirectUrl);
      if (
        url.protocol !== 'https:' ||
        !['www.payhere.lk', 'sandbox.payhere.lk'].includes(url.hostname) ||
        url.pathname !== '/pay/checkout'
      )
        throw new Error('The payment destination could not be verified.');
      sessionStorage.setItem('currentPaymentId', payment.paymentId);
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = url.href;
      for (const [name, value] of Object.entries(payment.formData)) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        input.value = value;
        form.appendChild(input);
      }
      document.body.appendChild(form);
      HTMLFormElement.prototype.submit.call(form);
      form.remove();
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : 'Payment could not be started. Please try again.'
      );
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }
  return (
    <div className="space-y-5 py-8 text-center">
      <h2 className="text-2xl font-semibold">Your order has been created</h2>
      <p>
        {method === 'CASH_ON_DELIVERY'
          ? 'Payment is due on delivery.'
          : 'Continue to the payment provider to pay securely.'}
      </p>
      {error && (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      )}
      <Button onClick={pay} disabled={pending}>
        {pending
          ? 'Please wait…'
          : method === 'CASH_ON_DELIVERY'
            ? 'View order confirmation'
            : 'Continue to PayHere'}
      </Button>
      <div>
        <Link href="/account/orders" className={buttonVariants({ variant: 'link' })}>
          View my orders
        </Link>
      </div>
    </div>
  );
}
