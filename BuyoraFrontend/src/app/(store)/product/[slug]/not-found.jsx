import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import Link from 'next/link';

export default function ProductNotFound() {
  return (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-24 text-center">
      <div className="bg-muted mb-6 flex h-20 w-20 items-center justify-center rounded-full">
        <Search className="text-muted-foreground h-10 w-10" />
      </div>
      <h1 className="mb-4 text-3xl font-bold">Product Not Found</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        We couldn&apos;t find the product you&apos;re looking for. It may have been removed,
        renamed, or temporarily unavailable.
      </p>

      <div className="flex w-full max-w-md flex-col gap-4 sm:flex-row">
        <Button asChild className="flex-1">
          <Link href="/search">Browse All Products</Link>
        </Button>
        <Button asChild variant="outline" className="flex-1">
          <Link href="/">Return to Home</Link>
        </Button>
      </div>
    </div>
  );
}
