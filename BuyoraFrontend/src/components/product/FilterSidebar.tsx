import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { api } from '@/lib/api/client';
import type { Brand, PaginatedResponse } from '@/types';
import { Category, ProductFilter } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

interface FilterSidebarProps {
  filters: ProductFilter;
  setFilter: (key: string, value: string | string[] | boolean | number | undefined | null) => void;
  toggleArrayFilter: (key: string, value: string) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
  category?: Category;
}

export function FilterSidebar({
  filters,
  setFilter,
  toggleArrayFilter,
  clearFilters,
  hasActiveFilters,
  category,
}: FilterSidebarProps) {
  const { data: brandPage } = useQuery({
    queryKey: ['brands'],
    queryFn: () => api.get<PaginatedResponse<Brand>>('/brands', { params: { size: 100 } }),
  });
  const facets = useQuery({
    queryKey: ['facets', category?.slug ?? filters.categorySlug],
    queryFn: () =>
      api.get<{ slug: string; name: string; values: string[] }[]>('/products/facets', {
        params: { categorySlug: category?.slug ?? filters.categorySlug },
      }),
    staleTime: 60000,
  });
  const brands = brandPage?.content ?? [];
  const priceRange = [filters.minPrice ?? 0, filters.maxPrice ?? 500000];
  const [brandSearch, setBrandSearch] = useState('');

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const handlePriceCommit = (value: number[]) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('page');
    if (value[0] > 0) params.set('minPrice', String(value[0]));
    else params.delete('minPrice');
    if (value[1] < 500000) params.set('maxPrice', String(value[1]));
    else params.delete('maxPrice');
    router.push(pathname + '?' + params.toString(), { scroll: false });
  };

  const filteredBrands = brands.filter((b) =>
    b.name.toLowerCase().includes(brandSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filters</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2 text-xs">
            Clear All
          </Button>
        )}
      </div>

      <Accordion
        defaultValue={['price', 'brands', 'rating', 'availability', 'discount']}
        className="w-full"
      >
        <AccordionItem value="price">
          <AccordionTrigger>Price Range (LKR)</AccordionTrigger>
          <AccordionContent className="space-y-4 px-1 pt-4 pb-2">
            <Slider
              min={0}
              max={500000}
              step={1000}
              key={priceRange.join('-')}
              defaultValue={priceRange}
              onValueCommitted={(val) =>
                handlePriceCommit(Array.isArray(val) ? val : [val, 500000])
              }
            />
            <div className="flex items-center justify-between text-sm">
              <span>LKR {priceRange[0].toLocaleString()}</span>
              <span>LKR {priceRange[1].toLocaleString()}</span>
            </div>
          </AccordionContent>
        </AccordionItem>

        {facets.data?.map((facet) => (
          <AccordionItem key={facet.slug} value={facet.slug}>
            <AccordionTrigger>{facet.name}</AccordionTrigger>
            <AccordionContent className="space-y-3 p-1">
              {facet.values.map((value) => (
                <label key={value} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={filters.attributes?.[facet.slug]?.includes(value) ?? false}
                    onChange={() => toggleArrayFilter('attr_' + facet.slug, value)}
                  />
                  {value}
                </label>
              ))}
            </AccordionContent>
          </AccordionItem>
        ))}
        <AccordionItem value="brands">
          <AccordionTrigger>Brands</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-1">
            {brands.length > 8 && (
              <Input
                placeholder="Search brands..."
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
                className="h-8 text-sm"
              />
            )}
            <div className="max-h-48 space-y-2 overflow-y-auto pr-2">
              {filteredBrands.map((brand) => (
                <div key={brand.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`brand-${brand.slug}`}
                    checked={(filters.brandSlugs || []).includes(brand.slug)}
                    onCheckedChange={() => toggleArrayFilter('brand', brand.slug)}
                  />
                  <Label
                    htmlFor={`brand-${brand.slug}`}
                    className="cursor-pointer text-sm leading-none font-normal peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {brand.name}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="rating">
          <AccordionTrigger>Rating</AccordionTrigger>
          <AccordionContent className="pt-1">
            <RadioGroup
              value={filters.minRating?.toString() || ''}
              onValueChange={(val) => setFilter('rating', val ? Number(val) : undefined)}
            >
              {[4, 3, 2].map((rating) => (
                <div key={rating} className="flex items-center space-x-2 py-1">
                  <RadioGroupItem value={rating.toString()} id={`rating-${rating}`} />
                  <Label
                    htmlFor={`rating-${rating}`}
                    className="cursor-pointer text-sm font-normal"
                  >
                    {rating}★ & above
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="availability">
          <AccordionTrigger>Availability</AccordionTrigger>
          <AccordionContent className="pt-1">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="in-stock"
                checked={filters.inStock === true}
                onCheckedChange={(checked) =>
                  setFilter('inStock', checked === true ? true : undefined)
                }
              />
              <Label htmlFor="in-stock" className="cursor-pointer text-sm font-normal">
                In Stock Only
              </Label>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="discount">
          <AccordionTrigger>Discount</AccordionTrigger>
          <AccordionContent className="pt-1">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="on-sale"
                checked={filters.hasDiscount === true}
                onCheckedChange={(checked) =>
                  setFilter('hasDiscount', checked === true ? true : undefined)
                }
              />
              <Label htmlFor="on-sale" className="cursor-pointer text-sm font-normal">
                On Sale Only
              </Label>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
