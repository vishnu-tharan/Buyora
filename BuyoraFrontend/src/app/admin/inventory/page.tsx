'use client';
import { Pagination } from '@/components/ui/Pagination';
import { Column, DataTable } from '@/components/admin/DataTable';
import { PageHeader } from '@/components/admin/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/ErrorState';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getErrorDetails } from '@/lib/api/errors';
import { adminService } from '@/services/admin.service';
import { InventoryItem } from '@/types/admin';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

export default function AdminInventoryPage() {
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<InventoryItem | null>(null);
  const client = useQueryClient();
  const adjust = useMutation({
    mutationFn: adminService.adjustStock,
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['adminInventory'] });
      setSelected(null);
    },
  });
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['adminInventory', page],
    queryFn: () => adminService.getInventory({ page, size: 20, sort: 'id,desc' }),
  });

  const columns: Column<InventoryItem>[] = [
    { header: 'Product', cell: (i) => <span className="font-medium">{i.productName}</span> },
    { header: 'SKU', accessorKey: 'sku' },
    { header: 'Available', accessorKey: 'availableQuantity' },
    { header: 'Total', accessorKey: 'totalQuantity' },
    {
      header: 'Status',
      cell: (i) => {
        const colors = {
          IN_STOCK: 'bg-green-100 text-green-800',
          LOW_STOCK: 'bg-amber-100 text-amber-800',
          OUT_OF_STOCK: 'bg-red-100 text-red-800',
        };
        return <Badge className={colors[i.status]}>{i.status.replace('_', ' ')}</Badge>;
      },
    },
    {
      header: 'Actions',
      cell: (item) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            adjust.reset();
            setSelected(item);
          }}
        >
          Adjust
        </Button>
      ),
    },
  ];

  if (error)
    return (
      <ErrorState
        title="Unable to load records"
        message="Please try again. If this continues, contact the store administrator."
        onRetry={() => refetch()}
      />
    );
  return (
    <div className="space-y-6">
      <PageHeader title="Inventory" />
      {selected && (
        <form
          className="space-y-3 rounded border bg-white p-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (adjust.isPending) return;
            const form = new FormData(event.currentTarget);
            adjust.mutate({
              variantId: selected.variantId,
              adjustment: Number(form.get('quantity')),
              reason: String(form.get('reason')),
            });
          }}
        >
          <h2 className="font-semibold">Adjust stock: {selected.sku}</h2>
          <div>
            <Label htmlFor="stock-quantity">Quantity change (negative to remove)</Label>
            <Input id="stock-quantity" name="quantity" type="number" step="1" required />
          </div>
          <div>
            <Label htmlFor="stock-reason">Reason</Label>
            <Input id="stock-reason" name="reason" required maxLength={1000} />
          </div>
          {adjust.error && (
            <p role="alert" className="text-destructive">
              {getErrorDetails(adjust.error).message}
            </p>
          )}
          <Button type="submit" disabled={adjust.isPending}>
            Save adjustment
          </Button>
          <Button type="button" variant="ghost" onClick={() => setSelected(null)}>
            Cancel
          </Button>
        </form>
      )}
      <div className="rounded-lg bg-white shadow-sm">
        <DataTable columns={columns} data={data?.content || []} loading={isLoading} />
        <Pagination currentPage={page} totalPages={data?.totalPages ?? 0} onPageChange={setPage} />
      </div>
    </div>
  );
}
