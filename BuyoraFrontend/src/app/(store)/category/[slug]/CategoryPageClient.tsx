'use client';

import { ActiveFilterChips } from '@/components/product/ActiveFilterChips';
import { FilterDrawer } from '@/components/product/FilterDrawer';
import { FilterSidebar } from '@/components/product/FilterSidebar';
import { ProductGrid } from '@/components/product/ProductGrid';
import { ProductListControls } from '@/components/product/ProductListControls';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { ErrorState } from '@/components/ui/ErrorState';
import { Pagination } from '@/components/ui/Pagination';
import { useProductFilters } from '@/hooks/use-product-filters';
import { categoriesService } from '@/services/categories.service';
import { Category, PaginatedResponse, ProductSummary } from '@/types';
import { useQuery } from '@tanstack/react-query';

interface CategoryPageClientProps {
  category: Category;
  initialProducts: PaginatedResponse<ProductSummary>;
}

export function CategoryPageClient({ category, initialProducts }: CategoryPageClientProps) {
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
    queryKey: ['category-products', category.slug, filters],
    queryFn: () => categoriesService.getCategoryProducts(category.slug, { ...filters, size: 12 }),
  });
  if (error)
    return (
      <ErrorState
        title="Unable to load products"
        message="Please try again."
        onRetry={() => refetch()}
      />
    );

  const breadcrumbItems: { label: string; href?: string }[] = [
    { label: 'Categories', href: '/categories' },
  ];

  if (category.parent) {
    breadcrumbItems.push({
      label: category.parent.name,
      href: `/category/${category.parent.slug}`,
    });
  }
  breadcrumbItems.push({ label: category.name });

  const filterProps = {
    filters,
    setFilter,
    toggleArrayFilter,
    clearFilters,
    hasActiveFilters,
    category,
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumb items={breadcrumbItems} className="mb-6" />

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{category.name}</h1>
        {category.description && (
          <p className="text-muted-foreground mt-2 max-w-3xl">{category.description}</p>
        )}
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <FilterSidebar {...filterProps} />
        </aside>

        {/* Main Content */}
        <main className="min-w-0 flex-1">
          <ActiveFilterChips {...filterProps} />

          <ProductListControls
            totalElements={data.totalElements}
            sort={filters.sort || 'RELEVANCE'}
            onSortChange={(sort) => setFilter('sort', sort)}
            mobileFilterTrigger={<FilterDrawer {...filterProps} activeCount={activeFilterCount} />}
          />

          <ProductGrid products={data.content} loading={isLoading} skeletonCount={12} />

          <Pagination
            currentPage={data.number}
            totalPages={data.totalPages}
            onPageChange={(page) => setFilter('page', page + 1)}
          />
        </main>
      </div>
    </div>
  );
}
