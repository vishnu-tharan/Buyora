import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-24 text-center">
      <h1 className="text-primary mb-4 text-6xl font-extrabold">404</h1>
      <h2 className="mb-4 text-2xl font-bold">We couldn&apos;t find that page</h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        The page you are looking for might have been removed, had its name changed, or is
        temporarily unavailable.
      </p>

      <div className="mb-12 flex w-full max-w-sm flex-col gap-4 sm:flex-row">
        <Button asChild size="lg" className="w-full">
          <Link href="/">Go Home</Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="w-full">
          <Link href="/categories">Browse Categories</Link>
        </Button>
      </div>
    </div>
  );
}
