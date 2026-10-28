'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ProductCard } from '@/components/product/ProductCard';
import { productsService } from '@/services/products.service';
import Link from 'next/link';
import { ArrowRight, RotateCcw } from 'lucide-react';

export function ShopDiscovery({ categories, initialProducts }) {
  const [selected, setSelected] = useState('all');
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['home-discovery', selected],
    queryFn: async () =>
      (
        await productsService.getProducts({
          size: 8,
          ...(selected === 'value'
            ? { maxPrice: 5000, sort: 'PRICE_ASC' }
            : selected === 'all'
              ? {}
              : { categorySlug: selected }),
        })
      ).content,
    initialData: selected === 'all' ? initialProducts : undefined,
    staleTime: 60000,
  });
  const filters = [
    { slug: 'all', name: 'All finds' },
    ...categories.slice(0, 5),
    { slug: 'value', name: 'Under LKR 5,000' },
  ];
  return (
    <section className="container mx-auto max-w-screen-xl px-4 py-8 md:py-10">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-primary mb-2 text-xs font-semibold tracking-[0.15em] uppercase">
            Made for your everyday
          </p>
          <h2 className="font-display text-2xl font-bold md:text-3xl">Find your next favourite</h2>
        </div>
        <Link
          href="/search"
          className="text-primary inline-flex items-center gap-2 text-sm font-semibold"
        >
          Shop all products <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
      <div aria-label="Filter the collection" className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {filters.map((filter) => (
          <button
            key={filter.slug}
            type="button"
            aria-pressed={selected === filter.slug}
            onClick={() => setSelected(filter.slug)}
            className={`min-h-10 shrink-0 rounded-full border px-4 text-xs font-semibold transition ${selected === filter.slug ? 'border-primary bg-primary text-white' : 'border-border text-muted-foreground hover:border-primary/40 hover:text-primary bg-white'}`}
          >
            {filter.name}
          </button>
        ))}
      </div>
      {isPending ? (
        <p role="status" className="text-muted-foreground py-10 text-center">
          Loading the collection…
        </p>
      ) : isError ? (
        <div role="status" className="rounded-2xl border p-8 text-center">
          <p>We couldn’t load this collection.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="text-primary mt-4 inline-flex items-center gap-2 text-sm font-semibold"
          >
            <RotateCcw size={16} aria-hidden="true" />
            Try again
          </button>
        </div>
      ) : !data?.length ? (
        <p role="status" className="text-muted-foreground rounded-2xl border py-10 text-center">
          No products in this collection yet. Explore another category.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {data.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
