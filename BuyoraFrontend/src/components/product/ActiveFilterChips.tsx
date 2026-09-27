import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProductFilter } from '@/types';
import { X } from 'lucide-react';

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

      {(filters.minPrice !== undefined || filters.maxPrice !== undefined) && (
        <Badge
          variant="secondary"
          className="flex items-center gap-1 rounded-full px-3 py-1 text-sm font-normal"
        >
          Price: {filters.minPrice || 0} - {filters.maxPrice || 'Any'}
          <button
            onClick={() => {
              setFilter('minPrice', undefined);
              setFilter('maxPrice', undefined);
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
