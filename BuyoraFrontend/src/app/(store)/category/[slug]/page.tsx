import { BuyoraApiError } from '@/lib/api/client';
import { categoriesService } from '@/services/categories.service';
import type { ProductFilter, SortOption } from '@/types';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CategoryPageClient } from './CategoryPageClient';
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[]>>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  try {
    const category = await categoriesService.getCategory(resolvedParams.slug);
    return {
      title: category.name,
      description: category.description || `Browse our collection of ${category.name} products`,
    };
  } catch {
    return {
      title: 'Category Not Found',
    };
  }
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const category = await categoriesService.getCategory(resolvedParams.slug).catch((error) => {
    if (error instanceof BuyoraApiError && error.isNotFound) notFound();
    throw error;
  });
  // Parse filters for initial data load
  const filters: ProductFilter = { size: 12 }; // Default page size

  if (resolvedSearchParams.page) filters.page = Math.max(0, Number(resolvedSearchParams.page) - 1);
  if (resolvedSearchParams.sort) filters.sort = String(resolvedSearchParams.sort) as SortOption;
  if (resolvedSearchParams.minPrice) filters.minPrice = Number(resolvedSearchParams.minPrice);
  if (resolvedSearchParams.maxPrice) filters.maxPrice = Number(resolvedSearchParams.maxPrice);
  if (resolvedSearchParams.rating) filters.minRating = Number(resolvedSearchParams.rating);
  if (resolvedSearchParams.inStock === 'true') filters.inStock = true;
  if (resolvedSearchParams.hasDiscount === 'true') filters.hasDiscount = true;

  // Handle array params like brand
  if (resolvedSearchParams.brand) {
    filters.brandSlugs = Array.isArray(resolvedSearchParams.brand)
      ? resolvedSearchParams.brand
      : [resolvedSearchParams.brand];
  }

  const initialProducts = await categoriesService.getCategoryProducts(resolvedParams.slug, filters);

  return <CategoryPageClient category={category} initialProducts={initialProducts} />;
}
