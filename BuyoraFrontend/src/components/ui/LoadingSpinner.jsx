import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ className, size = 24 }) {
  return <Loader2 className={cn('text-primary animate-spin', className)} size={size} />;
}
