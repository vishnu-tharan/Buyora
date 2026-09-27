'use client';
import { Button, buttonVariants } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { checkoutService } from '@/services/checkout.service';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export function PaymentCallbackClient() {
  const params = useSearchParams();
  const paymentId = params.get('paymentId');
  const result = useQuery({
    queryKey: ['payment-status', paymentId],
    queryFn: () => {
      const id = paymentId || sessionStorage.getItem('currentPaymentId');
      if (!id)
        throw new Error('Payment reference is missing. Check your order before paying again.');
      return checkoutService.getPaymentStatus(id);
    },
    retry: false,
  });
  if (result.isPending)
    return (
      <div role="status">
        <LoadingSpinner />
        <p>Checking payment status…</p>
      </div>
    );
  if (result.isError)
    return (
      <div className="space-y-4 text-center" role="alert">
        <h1 className="text-xl font-semibold">Payment could not be verified</h1>
        <p>We have not confirmed a successful payment. Check your order before paying again.</p>
        <Button onClick={() => result.refetch()}>Check again</Button>
      </div>
    );
  const paid = result.data.status === 'SUCCESS' || result.data.status === 'PAID';
  return (
    <div className="space-y-4 text-center">
      <h1 className="text-xl font-semibold">
        {paid
          ? 'Payment verified'
          : result.data.status === 'PENDING'
            ? 'Payment is pending'
            : 'Payment was not completed'}
      </h1>
      {!paid && <Button onClick={() => result.refetch()}>Check status</Button>}
      <div>
        <Link
          className={buttonVariants({ variant: 'outline' })}
          href={'/order-confirmation/' + encodeURIComponent(result.data.orderNumber)}
        >
          View order
        </Link>
      </div>
    </div>
  );
}
