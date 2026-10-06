'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ordersService } from '@/services/orders.service';
import { TrackingLink } from '@/components/account/TrackingLink';
import { OrderTimeline } from '@/components/account/OrderTimeline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PackageSearch, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
export default function TrackOrderPage() {
  const [input, setInput] = useState('');
  const [number, setNumber] = useState('');
  const query = useQuery({
    queryKey: ['track-order', number],
    queryFn: () => ordersService.getOrder(number),
    enabled: !!number,
    retry: false,
    refetchInterval: (q) =>
      q.state.data && !['DELIVERED', 'CANCELLED', 'REFUNDED'].includes(q.state.data.status)
        ? 60000
        : false,
  });
  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8 rounded-3xl bg-[#e8eff0] p-8">
        <PackageSearch
          size={35}
          strokeWidth={1.5}
          className="text-primary mb-5"
          aria-hidden="true"
        />
        <h1 className="font-display text-3xl font-semibold">Follow your good find.</h1>
        <p className="text-muted-foreground mt-3 text-sm leading-6">
          Enter your order number. Sign in for account orders, or use the browser where you placed
          your guest order.
        </p>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setNumber(input.trim());
        }}
        className="flex flex-col gap-3 sm:flex-row"
      >
        <label className="flex-1">
          <span className="sr-only">Order number</span>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            required
            maxLength={50}
            placeholder="Order number from your confirmation"
            className="h-12 rounded-xl"
          />
        </label>
        <Button type="submit" disabled={query.isFetching} className="h-12 rounded-xl">
          {query.isFetching ? 'Checking…' : 'Track order'}
        </Button>
      </form>
      {query.isError && (
        <p role="alert" className="mt-5 rounded-xl border p-4 text-sm">
          We couldn’t access this order. Check the number and sign in, or try the browser used for
          guest checkout.
        </p>
      )}
      {query.data && (
        <div className="bg-card mt-6 space-y-6 rounded-2xl border p-6">
          <h2 className="font-semibold">{query.data.orderNumber}</h2>
          <p className="text-sm">Status: {query.data.status.toLowerCase().replaceAll('_', ' ')}</p>
          <TrackingLink number={query.data.trackingNumber} url={query.data.trackingUrl} />
          <OrderTimeline timeline={query.data.timeline} />
          <Link
            href={'/order-confirmation/' + encodeURIComponent(query.data.orderNumber)}
            className="text-primary inline-flex items-center gap-2 text-sm font-semibold"
          >
            Order details <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </div>
      )}
      <Link href="/account/orders" className="text-primary mt-6 block text-sm underline">
        View account orders
      </Link>
    </div>
  );
}
