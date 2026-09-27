import { Skeleton } from '@/components/ui/skeleton';

export function CartItemSkeleton() {
  return (
    <div className="bg-card flex gap-4 rounded-lg border p-4 sm:gap-6 sm:p-6">
      <Skeleton className="h-20 w-20 flex-shrink-0 rounded-md sm:h-24 sm:w-24" />
      <div className="flex-1 space-y-4">
        <div className="flex items-start justify-between">
          <div className="max-w-[200px] flex-1 space-y-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-6 w-20" />
        </div>
        <div className="flex items-center justify-between pt-4">
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-6 w-20" />
        </div>
      </div>
    </div>
  );
}
