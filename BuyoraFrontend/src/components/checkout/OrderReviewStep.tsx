'use client';

import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { getErrorDetails } from '@/lib/api/errors';
import { formatCurrency } from '@/lib/formatting/currency';
import { checkoutService } from '@/services/checkout.service';
import { useCartStore, useCheckoutStore } from '@/stores';
import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { trackEvent } from '@/lib/analytics/events';
import { Edit2 } from 'lucide-react';
import { useRef, useState } from 'react';

export function OrderReviewStep() {
  const { state, setStep } = useCheckoutStore();
  const { cart, setCart } = useCartStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitting = useRef(false);
  const calculateTotal = () => {
    const subtotal =
      (cart?.summary.subtotal ?? 0) -
      (cart?.summary.discountAmount ?? 0) +
      (cart?.summary.taxAmount ?? 0);
    const shipping = cart?.summary.freeShipping ? 0 : state.shippingMethod?.price || 0;
    return subtotal + shipping;
  };

  const handlePlaceOrder = async () => {
    if (submitting.current) return;
    if (
      !cart?.items.length ||
      !state.email ||
      !state.shippingAddress ||
      !state.shippingMethod ||
      !state.paymentMethod
    ) {
      toast.add({
        title: 'Missing information',
        description: 'Please complete all checkout steps.',
        type: 'error',
      });
      return;
    }

    try {
      submitting.current = true;
      setIsSubmitting(true);
      let key = sessionStorage.getItem('checkoutKey');
      if (!key) {
        key = crypto.randomUUID();
        sessionStorage.setItem('checkoutKey', key);
      }
      const order = await checkoutService.placeOrder({
        guestEmail: state.email,
        guestShippingAddress: state.shippingAddress,
        deliveryMethod: state.shippingMethod.id,
        paymentMethod: state.paymentMethod,
        idempotencyKey: key,
      });
      trackEvent({
        type: 'order_placed',
        orderNumber: order.orderNumber,
        total: order.total,
        itemCount: order.items.length,
      });
      sessionStorage.setItem('currentOrderNumber', order.orderNumber);
      sessionStorage.removeItem('checkoutKey');

      setCart(null);
      queryClient.removeQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setStep(5);
    } catch (error) {
      toast.add({
        title: 'Error placing order',
        description: getErrorDetails(error).message,
        type: 'error',
      });
    } finally {
      submitting.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Review Your Order</h2>

      <div className="space-y-6">
        {/* Contact Info */}
        <div className="flex items-start justify-between border-b border-gray-100 pb-4">
          <div>
            <h3 className="mb-1 text-sm font-medium text-gray-500">Contact</h3>
            <p className="text-sm text-gray-900">{state.email}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="text-gray-500">
            <Edit2 className="mr-1 h-4 w-4" /> Edit
          </Button>
        </div>

        {/* Shipping Address */}
        <div className="flex items-start justify-between border-b border-gray-100 pb-4">
          <div>
            <h3 className="mb-1 text-sm font-medium text-gray-500">Ship to</h3>
            <p className="text-sm text-gray-900">
              {state.shippingAddress?.firstName} {state.shippingAddress?.lastName}
              <br />
              {state.shippingAddress?.addressLine1}
              {state.shippingAddress?.addressLine2 && (
                <>
                  <br />
                  {state.shippingAddress?.addressLine2}
                </>
              )}
              <br />
              {state.shippingAddress?.city}, {state.shippingAddress?.district}{' '}
              {state.shippingAddress?.postalCode}
              <br />
              {state.shippingAddress?.country}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="text-gray-500">
            <Edit2 className="mr-1 h-4 w-4" /> Edit
          </Button>
        </div>

        {/* Shipping Method */}
        <div className="flex items-start justify-between border-b border-gray-100 pb-4">
          <div>
            <h3 className="mb-1 text-sm font-medium text-gray-500">Shipping Method</h3>
            <p className="text-sm text-gray-900">
              {state.shippingMethod?.name} -{' '}
              {state.shippingMethod?.price === 0
                ? 'FREE'
                : formatCurrency(state.shippingMethod?.price || 0)}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setStep(2)} className="text-gray-500">
            <Edit2 className="mr-1 h-4 w-4" /> Edit
          </Button>
        </div>

        {/* Payment Method */}
        <div className="flex items-start justify-between border-b border-gray-100 pb-4">
          <div>
            <h3 className="mb-1 text-sm font-medium text-gray-500">Payment Method</h3>
            <p className="text-sm text-gray-900">{state.paymentMethod?.replace(/_/g, ' ')}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setStep(3)} className="text-gray-500">
            <Edit2 className="mr-1 h-4 w-4" /> Edit
          </Button>
        </div>
      </div>

      <div className="mt-6 rounded-lg bg-gray-50 p-4">
        <p className="mb-4 text-sm text-gray-600">
          By placing your order, you agree to our{' '}
          <Link href="/terms" className="text-primary underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-primary underline">
            Privacy Policy
          </Link>
          .
        </p>
        <Button
          onClick={handlePlaceOrder}
          size="lg"
          className="h-14 w-full text-lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? <LoadingSpinner className="mr-2 text-white" size={16} /> : null}
          {isSubmitting ? 'Processing...' : `Place Order — ${formatCurrency(calculateTotal())}`}
        </Button>
      </div>

      <div className="flex items-center justify-start pt-4">
        <Button variant="ghost" onClick={() => setStep(3)} disabled={isSubmitting}>
          Back
        </Button>
      </div>
    </div>
  );
}
