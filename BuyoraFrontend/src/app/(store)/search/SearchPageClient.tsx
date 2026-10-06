'use client';

import { ActiveFilterChips } from '@/components/product/ActiveFilterChips';
import { FilterDrawer } from '@/components/product/FilterDrawer';
import { FilterSidebar } from '@/components/product/FilterSidebar';
import { ProductGrid } from '@/components/product/ProductGrid';
import { ProductListControls } from '@/components/product/ProductListControls';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/ErrorState';
import { Pagination } from '@/components/ui/Pagination';
import { useProductFilters } from '@/hooks/use-product-filters';
import { productsService } from '@/services/products.service';
import { PaginatedResponse, ProductSummary } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { trackEvent } from '@/lib/analytics/events';
import { useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import Link from 'next/link';

interface SearchPageClientProps {
  deals?: boolean;
  query: string;
  initialProducts: PaginatedResponse<ProductSummary>;
}

export function SearchPageClient({ query, initialProducts, deals = false }: SearchPageClientProps) {
  const {
    filters,
    setFilter,
    toggleArrayFilter,
    clearFilters,
    activeFilterCount,
    hasActiveFilters,
  } = useProductFilters();
  const {
    data = initialProducts,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['search', filters, deals],
    queryFn: () =>
      productsService.search({ ...filters, ...(deals ? { hasDiscount: true } : {}), size: 12 }),
  });
  const tracked = useRef<string | null>(null);
  useEffect(() => {
    const term = filters.q || query;
    const key = term + ':' + data.totalElements;
    if (!isLoading && term && tracked.current !== key) {
      tracked.current = key;
      trackEvent({ type: 'search', query: term, resultsCount: data.totalElements });
    }
  }, [filters.q, query, data.totalElements, isLoading]);
  if (error)
    return (
      <ErrorState
        title="Unable to load products"
        message="Please try again."
        onRetry={() => refetch()}
      />
    );

  const filterProps = { filters, setFilter, toggleArrayFilter, clearFilters, hasActiveFilters };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          {deals ? (
            'Current deals'
          ) : filters.q || query ? (
            <>Results for &quot;{filters.q || query}&quot;</>
          ) : filters.sort === 'NEWEST' ? (
            'Fresh finds'
          ) : (
            'Explore the collection'
          )}
        </h1>
        <p className="text-muted-foreground mt-2">{data.totalElements} products to explore</p>
      </div>

      {data.totalElements === 0 && !hasActiveFilters && !isLoading ? (
        <div className="bg-muted/20 flex flex-col items-center justify-center rounded-lg border py-16">
          <Search className="text-muted-foreground mb-4 h-12 w-12" />
          <h2 className="mb-2 text-xl font-bold">No results found</h2>
          <p className="text-muted-foreground mb-6">
            We couldn&apos;t find anything matching &quot;{filters.q || query}&quot;.
          </p>
          <div className="flex gap-4">
            <Link href="/categories">
              <Button>Browse Categories</Button>
            </Link>
            <Link href="/deals">
              <Button variant="outline">View Deals</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-8 lg:flex-row">
          <aside className="hidden w-64 shrink-0 lg:block">
            <FilterSidebar {...filterProps} />
          </aside>

          <main className="min-w-0 flex-1">
            <ActiveFilterChips {...filterProps} />

            <ProductListControls
              totalElements={data.totalElements}
              sort={filters.sort || 'RELEVANCE'}
              onSortChange={(sort) => setFilter('sort', sort)}
              mobileFilterTrigger={
                <FilterDrawer {...filterProps} activeCount={activeFilterCount} />
              }
            />

            <ProductGrid products={data.content} loading={isLoading} skeletonCount={12} />

            <Pagination
              currentPage={data.number}
              totalPages={data.totalPages}
              onPageChange={(page) => setFilter('page', page + 1)}
            />
          </main>
        </div>
      )}
    </div>
  );
}
