import { cn } from '@/lib/utils';
import { Star, StarHalf } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StarRating({ rating, max = 5, size = 'md', className }: StarRatingProps) {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const iconClass = sizeClasses[size];

  return (
    <div
      className={cn('flex items-center gap-0.5', className)}
      role="img"
      aria-label={`Rating: ${rating} out of ${max} stars`}
    >
      {Array.from({ length: max }).map((_, i) => {
        const fill = rating - i;
        if (fill >= 1) {
          return (
            <Star
              key={i}
              aria-hidden="true"
              className={cn(iconClass, 'fill-yellow-400 text-yellow-400')}
            />
          );
        } else if (fill >= 0.5) {
          return (
            <StarHalf
              key={i}
              aria-hidden="true"
              className={cn(iconClass, 'fill-yellow-400 text-yellow-400')}
            />
          );
        }
        return (
          <Star key={i} aria-hidden="true" className={cn(iconClass, 'text-muted-foreground/30')} />
        );
      })}
    </div>
  );
}
