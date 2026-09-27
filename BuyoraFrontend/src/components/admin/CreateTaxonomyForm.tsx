'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getErrorDetails } from '@/lib/api/errors';
import { adminService } from '@/services/admin.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
export function CreateTaxonomyForm({ kind }: { kind: 'category' | 'brand' }) {
  const [open, setOpen] = useState(false);
  const client = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (name: string) => {
      const data = { name, active: true };
      return kind === 'category'
        ? adminService.createCategory(data)
        : adminService.createBrand(data);
    },
    onSuccess: () => {
      client.invalidateQueries({
        queryKey: [kind === 'category' ? 'adminCategories' : 'adminBrands'],
      });
      setOpen(false);
    },
  });
  return (
    <div className="space-y-3">
      <Button onClick={() => setOpen(!open)}>Add {kind}</Button>
      {open && (
        <form
          className="flex max-w-xl flex-wrap items-end gap-3 rounded border bg-white p-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!mutation.isPending)
              mutation.mutate(String(new FormData(e.currentTarget).get('name')).trim());
          }}
        >
          <div className="flex-1">
            <Label htmlFor={kind + '-name'}>Name</Label>
            <Input id={kind + '-name'} name="name" required maxLength={200} />
          </div>
          <Button type="submit" disabled={mutation.isPending}>
            Save
          </Button>
          {mutation.error && (
            <p role="alert" className="text-destructive w-full">
              {getErrorDetails(mutation.error).message}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
