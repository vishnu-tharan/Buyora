import { ProductFilter, SortOption } from '@/types';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

export function useProductFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo(() => {
    const f: ProductFilter = {};
    const category = searchParams.get('category');
    if (category) f.categorySlug = category;
    const q = searchParams.get('q');
    if (q) f.q = q;
    const page = searchParams.get('page');
    if (page && Number.isInteger(Number(page)) && Number(page) > 0) f.page = Number(page) - 1;
    const sort = searchParams.get('sort');
    if (sort) f.sort = sort as SortOption;
    const minPrice = searchParams.get('minPrice');
    if (minPrice) f.minPrice = parseFloat(minPrice);
    const maxPrice = searchParams.get('maxPrice');
    if (maxPrice) f.maxPrice = parseFloat(maxPrice);
    const minRating = searchParams.get('rating');
    if (minRating) f.minRating = parseFloat(minRating);
    if (searchParams.get('inStock') === 'true') f.inStock = true;
    if (searchParams.get('hasDiscount') === 'true') f.hasDiscount = true;

    const brandSlugs = searchParams.getAll('brand');
    if (brandSlugs.length > 0) f.brandSlugs = brandSlugs;

    const attributes: Record<string, string[]> = {};
    searchParams.forEach((value, key) => {
      if (key.startsWith('attr_')) {
        const attrName = key.replace('attr_', '');
        if (!attributes[attrName]) {
          attributes[attrName] = [];
        }
        attributes[attrName].push(value);
      }
    });
    if (Object.keys(attributes).length > 0) f.attributes = attributes;

    return f;
  }, [searchParams]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) count++;
    if (filters.minRating !== undefined) count++;
    if (filters.inStock) count++;
    if (filters.hasDiscount) count++;
    if (filters.brandSlugs) count += filters.brandSlugs.length;
    if (filters.attributes) {
      Object.values(filters.attributes).forEach((vals) => {
        count += vals.length;
      });
    }
    return count;
  }, [filters]);

  const hasActiveFilters = activeFilterCount > 0;

  const updateUrl = useCallback(
    (newParams: URLSearchParams) => {
      router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
    },
    [pathname, router]
  );

  const setFilter = useCallback(
    (key: string, value: string | string[] | boolean | number | undefined | null) => {
      const params = new URLSearchParams(searchParams.toString());

      // Reset page on any filter change except page itself
      if (key !== 'page') {
        params.delete('page');
      }

      if (value === undefined || value === null || value === false || value === '') {
        params.delete(key);
      } else if (Array.isArray(value)) {
        params.delete(key);
        value.forEach((v) => params.append(key, v));
      } else {
        params.set(key, String(value));
      }

      updateUrl(params);
    },
    [searchParams, updateUrl]
  );

  const toggleArrayFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('page');

      const currentValues = params.getAll(key);
      params.delete(key);

      if (currentValues.includes(value)) {
        const newValues = currentValues.filter((v) => v !== value);
        newValues.forEach((v) => params.append(key, v));
      } else {
        currentValues.forEach((v) => params.append(key, v));
        params.append(key, value);
      }

      updateUrl(params);
    },
    [searchParams, updateUrl]
  );

  const clearFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    const keysToRemove: string[] = [];
    params.forEach((_, key) => {
      if (key !== 'q' && key !== 'sort' && key !== 'page') {
        keysToRemove.push(key);
      }
    });
    keysToRemove.forEach((key) => params.delete(key));
    params.delete('page');
    updateUrl(params);
  }, [searchParams, updateUrl]);

  return {
    filters,
    setFilter,
    toggleArrayFilter,
    clearFilters,
    activeFilterCount,
    hasActiveFilters,
  };
}
