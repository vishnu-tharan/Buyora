import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Suspense } from 'react';
import { PaymentCallbackClient } from './PaymentCallbackClient';

export default function PaymentCallbackPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <Suspense
        fallback={
          <div className="space-y-4 text-center">
            <LoadingSpinner size={32} />
            <p className="text-gray-500">Processing payment response...</p>
          </div>
        }
      >
        <PaymentCallbackClient />
      </Suspense>
    </div>
  );
}
