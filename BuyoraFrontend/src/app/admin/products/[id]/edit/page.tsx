'use client';
import { PageHeader } from '@/components/admin/PageHeader';
import { ProductForm } from '@/components/admin/ProductForm';
import { use } from 'react';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader title="Edit Product" />
      <ProductForm productId={Number(id)} />
    </div>
  );
}
