'use client';

import { OrderSummaryCard } from '@/components/account/OrderSummaryCard';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/ErrorState';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Pagination } from '@/components/ui/Pagination';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ordersService } from '@/services/orders.service';
import { useQuery } from '@tanstack/react-query';
import { PackageX, Search } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['orders', page, status, search],
    queryFn: () =>
      ordersService.getOrders({
        page: page - 1,
        size: 10,
        sort: 'createdAt,desc',
        status: status !== 'all' ? status : undefined,
        q: search || undefined,
      }),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">My Orders</h1>

        <form onSubmit={handleSearch} className="relative w-full max-w-sm sm:w-auto">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            aria-label="Search by order number"
            placeholder="Search by order number..."
            className="pr-4 pl-9"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </form>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
        <div className="overflow-x-auto border-b border-gray-100">
          <Tabs
            value={status}
            onValueChange={(v) => {
              setStatus(v);
              setPage(1);
            }}
            className="w-full"
          >
            <TabsList className="flex h-auto min-w-max justify-start bg-transparent p-0">
              {['all', 'PENDING_PAYMENT', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(
                (tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="data-[state=active]:border-primary data-[state=active]:text-primary rounded-none rounded-t-lg px-6 py-4 font-medium text-gray-500 data-[state=active]:border-b-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                  >
                    {tab === 'all'
                      ? 'All Orders'
                      : tab
                          .replace('_', ' ')
                          .replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase()))}
                  </TabsTrigger>
                )
              )}
            </TabsList>
          </Tabs>
        </div>

        <div className="p-4 sm:p-6">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner size={32} />
            </div>
          ) : error ? (
            <div className="py-10">
              <ErrorState
                title="Failed to load orders"
                message="We couldn't load your order history."
              />
            </div>
          ) : data?.content?.length === 0 ? (
            <div className="px-4 py-20 text-center">
              <PackageX className="mx-auto mb-4 h-16 w-16 text-gray-300" />
              <h3 className="mb-2 text-lg font-medium text-gray-900">No orders found</h3>
              <p className="mx-auto mb-6 max-w-md text-gray-500">
                {search
                  ? `No orders found matching "${search}". Try a different search term.`
                  : status !== 'all'
                    ? `You don't have any orders with status "${status.replace('_', ' ').toLowerCase()}".`
                    : "You haven't placed any orders yet. Start exploring our products!"}
              </p>
              {search || status !== 'all' ? (
                <Button
                  onClick={() => {
                    setSearch('');
                    setSearchInput('');
                    setStatus('all');
                  }}
                >
                  Clear Filters
                </Button>
              ) : (
                <Button>
                  <Link href="/search">Start Shopping</Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {data?.content?.map((order) => (
                <OrderSummaryCard key={order.id} order={order} />
              ))}

              {data && data.totalPages > 1 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={page - 1}
                    totalPages={data.totalPages}
                    onPageChange={(next) => setPage(next + 1)}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
