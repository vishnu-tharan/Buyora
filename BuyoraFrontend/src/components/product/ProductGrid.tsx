import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ProductSummary } from '@/types';
import Link from 'next/link';
import { ProductCard } from './ProductCard';
import { ProductCardSkeleton } from './ProductCardSkeleton';

interface ProductGridProps {
  products: ProductSummary[];
  loading?: boolean;
  skeletonCount?: number;
  className?: string;
}

export function ProductGrid({ products, loading, skeletonCount = 8, className }: ProductGridProps) {
  if (loading) {
    return (
      <div
        className={cn('grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4', className)}
      >
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-muted/20 flex flex-col items-center justify-center rounded-lg border px-4 py-16 text-center">
        <h3 className="mb-2 text-xl font-bold">No products found</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          We couldn&apos;t find any products matching your current filters. Try adjusting or
          clearing some filters to see more results.
        </p>
        <Link href="/categories">
          <Button>Browse Categories</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className={cn('grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4', className)}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
