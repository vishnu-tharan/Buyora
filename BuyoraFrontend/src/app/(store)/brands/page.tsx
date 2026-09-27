'use client';
import { ErrorState } from '@/components/ui/ErrorState';
import { api } from '@/lib/api/client';
import type { Brand, PaginatedResponse } from '@/types';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
export default function BrandsPage() {
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['brands'],
    queryFn: () => api.get<PaginatedResponse<Brand>>('/brands', { params: { size: 100 } }),
  });
  return (
    <main className="container mx-auto max-w-7xl space-y-6 px-4 py-8">
      <h1 className="text-3xl font-bold">Brands</h1>
      {error ? (
        <ErrorState title="Unable to load brands" onRetry={() => refetch()} />
      ) : isLoading ? (
        <p role="status">Loading brands…</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          {data?.content.map((brand) => (
            <Link
              key={brand.id}
              className="hover:border-primary rounded border p-6 font-semibold"
              href={'/search?brand=' + encodeURIComponent(brand.slug)}
            >
              {brand.name}
            </Link>
          ))}
          {!data?.content.length && <p>No brands available.</p>}
        </div>
      )}
    </main>
  );
}
