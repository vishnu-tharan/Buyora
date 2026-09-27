'use client';
import { PageHeader } from '@/components/admin/PageHeader';
import { ProductForm } from '@/components/admin/ProductForm';

export default function NewProductPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader title="Create Product" />
      <ProductForm />
    </div>
  );
}
