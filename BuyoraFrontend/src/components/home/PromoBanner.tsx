import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function PromoBanner() {
  return (
    <section className="bg-primary text-primary-foreground relative w-full overflow-hidden py-16">
      {/* Decorative patterns */}
      <div className="absolute top-0 right-0 h-64 w-64 translate-x-1/3 -translate-y-1/2 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-80 w-80 -translate-x-1/4 translate-y-1/2 rounded-full bg-black/10 blur-3xl" />

      <div className="relative z-10 container mx-auto flex max-w-screen-xl flex-col items-center px-4 text-center">
        <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-5xl">Exclusive Deals</h2>
        <p className="text-primary-foreground/80 mb-8 max-w-2xl text-lg md:text-xl">
          Explore current offers and find savings on selected products.
        </p>
        <Button asChild size="lg" variant="secondary" className="px-8 font-bold">
          <Link href="/deals">Shop Deals</Link>
        </Button>
      </div>
    </section>
  );
}
