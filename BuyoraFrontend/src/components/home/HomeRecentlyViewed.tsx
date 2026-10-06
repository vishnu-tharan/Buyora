'use client';
import { useRecentlyViewed } from '@/hooks/use-recently-viewed';
import { useQueries } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { ProductCard } from '@/components/product/ProductCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import type { ProductSummary } from '@/types';
export function HomeRecentlyViewed() {
  const { items } = useRecentlyViewed();
  const ids = items
    .filter((p) => p && Number.isSafeInteger(p.id) && p.id > 0)
    .slice(0, 4)
    .map((p) => p.id);
  const queries = useQueries({
    queries: ids.map((id) => ({
      queryKey: ['recent-product', id],
      queryFn: () => api.get<ProductSummary>('/products/by-id/' + id),
      retry: false,
      staleTime: 60000,
    })),
  });
  const products = queries.flatMap((q) => (q.data ? [q.data] : []));
  if (!products.length) return null;
  return (
    <section className="container mx-auto max-w-screen-xl px-4 py-10">
      <SectionHeader title="Worth another look" subtitle="Pick up where you left off." />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
