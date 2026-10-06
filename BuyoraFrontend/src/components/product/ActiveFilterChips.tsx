import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProductFilter } from '@/types';
import { X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

interface ActiveFilterChipsProps {
  filters: ProductFilter;
  setFilter: (key: string, value: string | string[] | boolean | number | undefined | null) => void;
  toggleArrayFilter: (key: string, value: string) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
}

export function ActiveFilterChips({
  filters,
  setFilter,
  toggleArrayFilter,
  clearFilters,
  hasActiveFilters,
}: ActiveFilterChipsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  if (!hasActiveFilters) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <span className="text-muted-foreground mr-1 text-sm">Active Filters:</span>

      {filters.brandSlugs?.map((brand) => (
        <Badge
          key={`brand-${brand}`}
          variant="secondary"
          className="flex items-center gap-1 rounded-full px-3 py-1 text-sm font-normal"
        >
          Brand: <span className="capitalize">{brand}</span>
          <button
            onClick={() => toggleArrayFilter('brand', brand)}
            className="hover:text-destructive ml-1 focus:outline-none"
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Remove {brand} filter</span>
          </button>
        </Badge>
      ))}

      {Object.entries(filters.attributes ?? {}).flatMap(([attribute, values]) =>
        values.map((value) => (
          <Badge
            key={attribute + value}
            variant="secondary"
            className="gap-1 rounded-full px-3 py-1"
          >
            <span className="capitalize">
              {attribute}: {value}
            </span>
            <button
              aria-label={'Remove ' + value + ' filter'}
              onClick={() => toggleArrayFilter('attr_' + attribute, value)}
              className="hover:text-destructive rounded p-1"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))
      )}

      {(filters.minPrice !== undefined || filters.maxPrice !== undefined) && (
        <Badge
          variant="secondary"
          className="flex items-center gap-1 rounded-full px-3 py-1 text-sm font-normal"
        >
          Price: {filters.minPrice || 0} - {filters.maxPrice || 'Any'}
          <button
            aria-label="Remove price filter"
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              params.delete('minPrice');
              params.delete('maxPrice');
              params.delete('page');
              router.push(pathname + '?' + params.toString(), { scroll: false });
            }}
            className="hover:text-destructive ml-1 focus:outline-none"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}

      {filters.minRating !== undefined && (
        <Badge
          variant="secondary"
          className="flex items-center gap-1 rounded-full px-3 py-1 text-sm font-normal"
        >
          Rating: {filters.minRating}★ & above
          <button
            aria-label="Remove rating filter"
            onClick={() => setFilter('rating', undefined)}
            className="hover:text-destructive ml-1 focus:outline-none"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}

      {filters.inStock && (
        <Badge
          variant="secondary"
          className="flex items-center gap-1 rounded-full px-3 py-1 text-sm font-normal"
        >
          In Stock
          <button
            aria-label="Remove availability filter"
            onClick={() => setFilter('inStock', undefined)}
            className="hover:text-destructive ml-1 focus:outline-none"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}

      {filters.hasDiscount && (
        <Badge
          variant="secondary"
          className="flex items-center gap-1 rounded-full px-3 py-1 text-sm font-normal"
        >
          On Sale
          <button
            aria-label="Remove sale filter"
            onClick={() => setFilter('hasDiscount', undefined)}
            className="hover:text-destructive ml-1 focus:outline-none"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={clearFilters}
        className="text-muted-foreground hover:text-foreground h-7 text-xs"
      >
        Clear All
      </Button>
    </div>
  );
}
