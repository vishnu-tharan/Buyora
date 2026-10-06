'use client';

import { ProductCard } from '@/components/product/ProductCard';
import { Button } from '@/components/ui/button';
import { useRecentlyViewed } from '@/hooks/use-recently-viewed';
import type { Product } from '@/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useQueries } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import type { ProductSummary } from '@/types';
import { useEffect, useRef } from 'react';

interface RecentlyViewedProps {
  currentProduct: Product;
}

export function RecentlyViewed({ currentProduct }: RecentlyViewedProps) {
  const { items, addItem } = useRecentlyViewed();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Add current product to recently viewed
    addItem({
      id: currentProduct.id,
      name: currentProduct.name,
      slug: currentProduct.slug,
      primaryImage: currentProduct.images.find((img) => img.isPrimary) || currentProduct.images[0],
      basePrice: currentProduct.basePrice,
      salePrice: currentProduct.salePrice,
    });
  }, [currentProduct, addItem]);

  const recentQueries = useQueries({
    queries: items
      .filter((item) => item.id !== currentProduct.id)
      .slice(0, 8)
      .map((item) => ({
        queryKey: ['recent-product', item.id],
        queryFn: () => api.get<ProductSummary>('/products/by-id/' + item.id),
        retry: false,
        staleTime: 60000,
      })),
  });
  const displayItems = recentQueries.flatMap((q) => (q.data ? [q.data] : []));

  if (displayItems.length === 0) return null;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="border-t py-12">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Recently Viewed</h2>

        <div className="hidden gap-2 md:flex">
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll('left')}
            className="h-8 w-8 rounded-full"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll('right')}
            className="h-8 w-8 rounded-full"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="hide-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-4 md:gap-6"
      >
        {displayItems.map((product) => (
          <div key={product.id} className="w-[280px] shrink-0 snap-start md:w-auto">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
