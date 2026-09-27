'use client';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/ErrorState';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api/client';
import { getErrorDetails } from '@/lib/api/errors';
import { adminService } from '@/services/admin.service';
import type { Category, Product } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
export function ProductForm({ productId }: { productId?: number }) {
  const categories = useQuery({
    queryKey: ['adminCategories'],
    queryFn: () => adminService.getCategories({ size: 100 }),
  });
  const product = useQuery({
    queryKey: ['adminProduct', productId],
    queryFn: () => api.get<Product>('/admin/products/' + productId),
    enabled: !!productId,
  });
  if (categories.isLoading || (productId && product.isLoading)) return <LoadingSpinner />;
  if (categories.error || product.error)
    return (
      <ErrorState title="Unable to load product details" message="Please reload and try again." />
    );
  return (
    <ProductEditor
      key={productId ?? 'new'}
      product={product.data}
      categories={categories.data?.content ?? []}
    />
  );
}
function ProductEditor({ product, categories }: { product?: Product; categories: Category[] }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setError('');
    const form = new FormData(event.currentTarget);
    const common = {
      name: String(form.get('name')),
      shortDescription: String(form.get('shortDescription')),
      description: String(form.get('description')),
      categoryPublicId: String(form.get('category')),
      status: String(form.get('status')),
    };
    try {
      if (product) await adminService.updateProduct(product.id, common);
      else
        await adminService.createProduct({
          ...common,
          variants: [
            { sku: String(form.get('sku')), price: Number(form.get('price')), active: true },
          ],
        });
      router.push('/admin/products');
      router.refresh();
    } catch (error) {
      setError(getErrorDetails(error).message);
    } finally {
      setPending(false);
    }
  }
  return (
    <form onSubmit={submit} className="max-w-3xl space-y-5 rounded-xl border bg-white p-6">
      <div>
        <Label htmlFor="product-name">Product name</Label>
        <Input
          id="product-name"
          name="name"
          required
          maxLength={200}
          defaultValue={product?.name}
        />
      </div>
      <div>
        <Label htmlFor="product-category">Category</Label>
        <select
          id="product-category"
          name="category"
          required
          className="mt-1 w-full rounded border p-2"
          defaultValue={categories.find((c) => c.id === product?.category.id)?.publicId ?? ''}
        >
          <option value="" disabled>
            Select a category
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.publicId}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="product-short">Short description</Label>
        <Input
          id="product-short"
          name="shortDescription"
          maxLength={1000}
          defaultValue={product?.shortDescription}
        />
      </div>
      <div>
        <Label htmlFor="product-description">Description</Label>
        <Textarea
          id="product-description"
          name="description"
          maxLength={20000}
          defaultValue={product?.description}
        />
      </div>
      {!product && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="product-sku">SKU</Label>
            <Input id="product-sku" name="sku" required maxLength={100} />
          </div>
          <div>
            <Label htmlFor="product-price">Price (LKR)</Label>
            <Input id="product-price" name="price" required type="number" min="0" step="0.01" />
          </div>
        </div>
      )}
      <div>
        <Label htmlFor="product-status">Status</Label>
        <select
          id="product-status"
          name="status"
          className="ml-3 rounded border p-2"
          defaultValue={product?.status ?? 'DRAFT'}
        >
          <option>DRAFT</option>
          <option>ACTIVE</option>
          <option>ARCHIVED</option>
        </select>
      </div>
      {!product && (
        <p className="text-muted-foreground text-sm">
          New products start with zero stock. Add stock from Inventory before selling.
        </p>
      )}
      {error && (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      )}
      <Button type="submit" disabled={pending || !categories.length}>
        {pending ? 'Saving…' : 'Save product'}
      </Button>
    </form>
  );
}
