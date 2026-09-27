'use client';
import { PageHeader } from '@/components/admin/PageHeader';
import { SalesChart } from '@/components/admin/SalesChart';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatCurrency } from '@/lib/formatting';
import { adminService } from '@/services/admin.service';
import { useQuery } from '@tanstack/react-query';
export default function AdminReportsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: adminService.getDashboard,
  });
  if (isLoading) return <LoadingSpinner />;
  if (error || !data)
    return <ErrorState title="Unable to load reports" message="Please try again." />;
  return (
    <section className="space-y-6">
      <PageHeader
        title="Sales report"
        description="Recorded paid orders during the last seven days"
      />
      <div className="rounded-xl border bg-white p-6">
        <SalesChart data={data.salesOverview} />
        <table className="mt-8 w-full text-left text-sm">
          <thead>
            <tr>
              <th>Date</th>
              <th>Paid orders</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {data.salesOverview.map((row) => (
              <tr key={row.date}>
                <td className="py-3">{row.date}</td>
                <td>{row.orders}</td>
                <td>{formatCurrency(row.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!data.salesOverview.length && <p>No paid orders in this period.</p>}
      </div>
    </section>
  );
}
