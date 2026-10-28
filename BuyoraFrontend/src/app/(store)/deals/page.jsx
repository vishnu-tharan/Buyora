import { productsService } from '@/services/products.service';
import { SearchPageClient } from '../search/SearchPageClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Today's Deals",
  description: 'Shop the best deals and discounts on Buyora',
};

export default async function DealsPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  // Base filter for deals
  const filters = { hasDiscount: true, size: 12 };
  if (resolvedSearchParams.page) filters.page = Math.max(0, Number(resolvedSearchParams.page) - 1);
  if (resolvedSearchParams.sort) filters.sort = String(resolvedSearchParams.sort);
  if (resolvedSearchParams.minPrice) filters.minPrice = Number(resolvedSearchParams.minPrice);
  if (resolvedSearchParams.maxPrice) filters.maxPrice = Number(resolvedSearchParams.maxPrice);
  if (resolvedSearchParams.rating) filters.minRating = Number(resolvedSearchParams.rating);
  if (resolvedSearchParams.inStock === 'true') filters.inStock = true;
  if (resolvedSearchParams.brand) {
    filters.brandSlugs = Array.isArray(resolvedSearchParams.brand)
      ? resolvedSearchParams.brand
      : [resolvedSearchParams.brand];
  }
  let initialProducts = {
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
  return <SearchPageClient deals query="" initialProducts={initialProducts} />;
}
