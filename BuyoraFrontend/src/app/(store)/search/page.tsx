import { productsService } from '@/services/products.service';
import type { PaginatedResponse, ProductFilter, ProductSummary, SortOption } from '@/types';
import { Metadata } from 'next';
import { SearchPageClient } from './SearchPageClient';
export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<Record<string, string | string[]>>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const q = typeof resolvedSearchParams.q === 'string' ? resolvedSearchParams.q : '';

  return {
    title: q ? `Search results for "${q}"` : 'Search',
    description: 'Search for products across all categories',
  };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const q = typeof resolvedSearchParams.q === 'string' ? resolvedSearchParams.q : '';

  // Parse filters
  const filters: ProductFilter = { q, size: 12 };

  if (resolvedSearchParams.page) filters.page = Math.max(0, Number(resolvedSearchParams.page) - 1);
  if (resolvedSearchParams.sort) filters.sort = String(resolvedSearchParams.sort) as SortOption;
  if (resolvedSearchParams.minPrice) filters.minPrice = Number(resolvedSearchParams.minPrice);
  if (resolvedSearchParams.maxPrice) filters.maxPrice = Number(resolvedSearchParams.maxPrice);
  if (resolvedSearchParams.rating) filters.minRating = Number(resolvedSearchParams.rating);
  if (resolvedSearchParams.inStock === 'true') filters.inStock = true;
  if (resolvedSearchParams.hasDiscount === 'true') filters.hasDiscount = true;

  if (resolvedSearchParams.brand) {
    filters.brandSlugs = Array.isArray(resolvedSearchParams.brand)
      ? resolvedSearchParams.brand
      : [resolvedSearchParams.brand];
  }

  // Handle server-side search fetch if q exists
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

  if (q) {
    try {
      initialProducts = await productsService.search(filters);
    } catch (error) {
      console.error('Search failed:', error);
    }
  }

  return <SearchPageClient query={q} initialProducts={initialProducts} />;
}
