'use client';
import { RotateCcw, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { storeService } from '@/services/store.service';
import { DeliveryEstimator } from './DeliveryEstimator';
export function ShippingInfo() {
  const info = useQuery({ queryKey: ['store-info'], queryFn: storeService.info, staleTime: 60000 });
  return (
    <div className="mt-5 space-y-3">
      <DeliveryEstimator />
      <div className="bg-muted/60 grid gap-3 rounded-2xl p-4 text-xs">
        <Link href="/returns" className="flex items-center gap-2">
          <RotateCcw size={16} className="text-primary" aria-hidden="true" />
          {info.data?.returnWindowDays
            ? `Return requests within ${info.data.returnWindowDays} days of delivery`
            : 'View return policy'}
        </Link>
        <Link href="/faq" className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-primary" aria-hidden="true" />
          Payment options confirmed at checkout
        </Link>
      </div>
    </div>
  );
}
