import { productsService } from '@/services/products.service';
import type { PaginatedResponse, ProductFilter, ProductSummary, SortOption } from '@/types';
import { Metadata } from 'next';
import { SearchPageClient } from '../search/SearchPageClient';
export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<Record<string, string | string[]>>;
}

export const metadata: Metadata = {
  title: "Today's Deals",
  description: 'Shop the best deals and discounts on Buyora',
};

export default async function DealsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;

  // Base filter for deals
  const filters: ProductFilter = { hasDiscount: true, size: 12 };

  if (resolvedSearchParams.page) filters.page = Math.max(0, Number(resolvedSearchParams.page) - 1);
  if (resolvedSearchParams.sort) filters.sort = String(resolvedSearchParams.sort) as SortOption;
  if (resolvedSearchParams.minPrice) filters.minPrice = Number(resolvedSearchParams.minPrice);
  if (resolvedSearchParams.maxPrice) filters.maxPrice = Number(resolvedSearchParams.maxPrice);
  if (resolvedSearchParams.rating) filters.minRating = Number(resolvedSearchParams.rating);
  if (resolvedSearchParams.inStock === 'true') filters.inStock = true;

  if (resolvedSearchParams.brand) {
    filters.brandSlugs = Array.isArray(resolvedSearchParams.brand)
      ? resolvedSearchParams.brand
      : [resolvedSearchParams.brand];
  }

  let initialProducts: PaginatedResponse<ProductSummary> = {
    content: [],
    totalElements: 0,
    totalPages: 0,
    size: 12,
    number: 0,
    first: true,
    last: true,
    empty: true,
  };

  try {
    // Reusing the search endpoint with hasDiscount filter
    initialProducts = await productsService.search(filters);
  } catch (error) {
    console.error('Failed to fetch deals:', error);
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-destructive flex items-center gap-2 text-3xl font-bold tracking-tight">
          <span>🔥</span> Today&apos;s Deals
        </h1>
        <p className="text-muted-foreground mt-2">
          Incredible savings on top products. Hurry, these deals won&apos;t last long!
        </p>
      </div>

      <SearchPageClient query="" deals initialProducts={initialProducts} />
    </div>
  );
}
