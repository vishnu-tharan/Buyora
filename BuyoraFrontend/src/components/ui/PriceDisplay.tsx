import { formatCurrency } from '@/lib/formatting';
import { cn } from '@/lib/utils';

interface PriceDisplayProps {
  price: number;
  compareAtPrice?: number;
  className?: string;
}

export function PriceDisplay({ price, compareAtPrice, className }: PriceDisplayProps) {
  const hasDiscount = compareAtPrice !== undefined && compareAtPrice > price;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className={cn('font-semibold', hasDiscount ? 'text-primary' : '')}>
        {formatCurrency(price)}
      </span>
      {hasDiscount && (
        <span className="text-muted-foreground text-sm line-through">
          {formatCurrency(compareAtPrice)}
        </span>
      )}
    </div>
  );
}
