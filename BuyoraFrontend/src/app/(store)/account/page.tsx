'use client';

import { OrderSummaryCard } from '@/components/account/OrderSummaryCard';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ordersService } from '@/services/orders.service';
import { useAuthStore } from '@/stores/auth.store';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Clock, Heart, Package } from 'lucide-react';
import Link from 'next/link';

export default function AccountDashboardPage() {
  const user = useAuthStore((state) => state.user);

  const {
    data: recentOrders,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['orders', 'recent'],
    queryFn: () => ordersService.getOrders({ page: 0, size: 3 }),
  });

  if (!user) return null;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Welcome back, {user.firstName}!
          </h1>
          <p className="mt-1 text-gray-500">Manage your orders, profile, and preferences here.</p>
        </div>
        <Button asChild className="hidden sm:flex">
          <Link href="/search">Continue Shopping</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900">{recentOrders?.totalElements || 0}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Pending in recent orders</p>
            <p className="text-2xl font-bold text-gray-900">
              {/* This would ideally come from an API stats endpoint */}
              {recentOrders?.content?.filter(
                (o) => o.status === 'PENDING_PAYMENT' || o.status === 'PROCESSING'
              ).length || 0}
            </p>
          </div>
        </div>

        <Link
          href="/account/wishlist"
          className="hover:border-primary/50 group flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-6 transition-colors"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600 transition-colors group-hover:bg-rose-100">
            <Heart className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Wishlist</p>
            <p className="text-primary mt-1 flex items-center gap-1 text-sm font-medium transition-all group-hover:gap-2">
              View Items <ArrowRight className="h-4 w-4" />
            </p>
          </div>
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
          <Link href="/account/orders" className="text-primary text-sm font-medium hover:underline">
            View All
          </Link>
        </div>
        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <ErrorState
              title="Failed to load orders"
              message="We couldn't load your recent orders."
            />
          ) : recentOrders?.content?.length === 0 ? (
            <div className="py-8 text-center">
              <Package className="mx-auto mb-3 h-12 w-12 text-gray-300" />
              <p className="text-gray-500">You haven&apos;t placed any orders yet.</p>
              <Button asChild variant="outline" className="mt-4">
                <Link href="/search">Start Shopping</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders?.content?.map((order) => (
                <OrderSummaryCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
