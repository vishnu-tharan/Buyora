'use client';
import { PageHeader } from '@/components/admin/PageHeader';
import { SalesChart } from '@/components/admin/SalesChart';
import { StatCard } from '@/components/admin/StatCard';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatCurrency, formatDate } from '@/lib/formatting';
import { adminService } from '@/services/admin.service';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Clock, DollarSign, Package, ShoppingBag, Users } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const {
    data: stats,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: adminService.getDashboard,
  });

  if (isLoading)
    return (
      <div className="flex justify-center p-8">
        <LoadingSpinner size={32} />
      </div>
    );
  if (error)
    return <ErrorState title="Failed to load dashboard" onRetry={() => window.location.reload()} />;
  if (!stats) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Overview of your store's performance" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Today's Sales"
          value={formatCurrency(stats.todaySales)}
          icon={DollarSign}
        />
        <StatCard title="Today's Orders" value={stats.todayOrders} icon={ShoppingBag} />
        <StatCard title="Total Customers" value={stats.totalCustomers} icon={Users} />
        <StatCard title="Total Products" value={stats.totalProducts} icon={Package} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-full bg-red-100 p-3 text-red-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">Low Stock Alert</h3>
              <p className="text-2xl font-bold text-red-900">{stats.lowStockCount}</p>
            </div>
            <Link
              href="/admin/inventory?status=LOW_STOCK"
              className={buttonVariants({ variant: 'outline', size: 'sm', className: 'bg-white' })}
            >
              View Items
            </Link>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-full bg-amber-100 p-3 text-amber-600">
              <Clock className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-amber-800">Pending Orders</h3>
              <p className="text-2xl font-bold text-amber-900">{stats.pendingOrdersCount}</p>
            </div>
            <Link
              href="/admin/orders?status=PENDING_PAYMENT"
              className={buttonVariants({ variant: 'outline', size: 'sm', className: 'bg-white' })}
            >
              View Orders
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Sales Overview (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <SalesChart data={stats.salesOverview} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Orders</CardTitle>
              <Link
                href="/admin/orders"
                className={buttonVariants({ variant: 'link', size: 'sm' })}
              >
                View All
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentOrders.map((order) => (
                  <div
                    key={order.orderNumber}
                    className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="text-sm font-medium">#{order.orderNumber}</p>
                      <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatCurrency(order.total)}</p>
                      <Badge variant="outline" className="mt-1 text-[10px]">
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
