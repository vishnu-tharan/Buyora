import { Skeleton } from '@/components/ui/skeleton';

export function ProductCardSkeleton() {
  return (
    <div className="bg-card flex flex-col overflow-hidden rounded-xl border shadow-sm">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="flex flex-col gap-2 p-4">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="mt-1 h-3 w-24" />
        <div className="mt-2 flex items-end justify-between">
          <Skeleton className="h-5 w-20" />
        </div>
      </div>
    </div>
  );
}
