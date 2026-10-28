export default function ProductLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Image gallery skeleton */}
        <div className="bg-muted aspect-square animate-pulse rounded-lg" />
        {/* Product info skeleton */}
        <div className="space-y-4">
          <div className="bg-muted h-8 w-3/4 animate-pulse rounded" />
          <div className="bg-muted h-4 w-1/2 animate-pulse rounded" />
          <div className="bg-muted h-12 w-1/3 animate-pulse rounded" />
          <div className="bg-muted h-32 animate-pulse rounded" />
          <div className="bg-muted h-12 animate-pulse rounded" />
        </div>
      </div>
    </div>
  );
}
