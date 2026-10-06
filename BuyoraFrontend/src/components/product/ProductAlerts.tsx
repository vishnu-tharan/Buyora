'use client';
import { BellRing, TrendingDown } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { api } from '@/lib/api/client';
import { getErrorDetails } from '@/lib/api/errors';
import { useState } from 'react';
import Link from 'next/link';
export function ProductAlerts({
  variantId,
  inStock,
  slug,
}: {
  variantId?: number;
  inStock: boolean;
  slug: string;
}) {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const subscribe = useMutation({
    mutationFn: (kind: string) => api.post('/alerts', { variantId, kind }),
    onSuccess: () => setMessage('Alert saved. We’ll email you when it changes.'),
    onError: (e) => setMessage(getErrorDetails(e).message),
  });
  if (!variantId)
    return (
      <p className="text-muted-foreground text-xs">Choose an option to save a product alert.</p>
    );
  if (!user)
    return (
      <Link
        href={'/login?returnUrl=' + encodeURIComponent('/product/' + slug)}
        className="text-primary inline-flex min-h-10 items-center gap-2 text-xs font-medium"
      >
        <BellRing size={16} aria-hidden="true" />
        Sign in for stock and price alerts
      </Link>
    );
  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {!inStock && (
          <button
            disabled={subscribe.isPending}
            onClick={() => subscribe.mutate('BACK_IN_STOCK')}
            className="text-primary inline-flex min-h-10 items-center gap-2 text-xs font-medium"
          >
            <BellRing size={16} aria-hidden="true" />
            Notify me when available
          </button>
        )}
        <button
          disabled={subscribe.isPending}
          onClick={() => subscribe.mutate('PRICE_DROP')}
          className="text-primary inline-flex min-h-10 items-center gap-2 text-xs font-medium"
        >
          <TrendingDown size={16} aria-hidden="true" />
          Watch the price
        </button>
      </div>
      <p role="status" className="text-muted-foreground text-xs">
        {message}
      </p>
    </div>
  );
}
