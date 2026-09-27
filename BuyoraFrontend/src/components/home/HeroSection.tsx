import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="bg-primary/5 relative w-full overflow-hidden">
      <div className="container mx-auto flex min-h-[500px] max-w-screen-xl flex-col items-center px-4 md:min-h-[600px] md:flex-row">
        <div className="z-10 flex flex-1 flex-col items-center pt-12 pb-8 text-center md:items-start md:py-20 md:text-left">
          <span className="bg-primary/10 text-primary mb-4 inline-block rounded-full px-3 py-1 text-sm font-semibold">
            New Collection 2025
          </span>
          <h1 className="text-foreground mb-6 max-w-2xl text-4xl font-extrabold tracking-tight md:text-6xl">
            Discover Products <br className="hidden md:block" /> You&apos;ll Love
          </h1>
          <p className="text-muted-foreground mb-8 max-w-lg text-lg">
            Quality products, unbeatable prices. Shop the latest from top brands with fast shipping
            across Sri Lanka.
          </p>
          <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
            <Button asChild size="lg" className="px-8 text-base">
              <Link href="/deals">Shop Now</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="bg-background/50 px-8 text-base backdrop-blur-sm"
            >
              <Link href="/categories">Browse Categories</Link>
            </Button>
          </div>
        </div>

        <div className="relative h-[300px] min-h-[400px] w-full flex-1 md:h-full">
          {/* Decorative Elements */}
          <div className="from-primary/20 via-primary/5 absolute top-1/2 left-1/2 -z-10 h-[120%] w-[120%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr to-transparent blur-3xl" />

          <div className="absolute inset-0 flex items-center justify-center p-8">
            <div className="from-primary/30 to-primary/10 relative aspect-square w-full max-w-md overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br shadow-xl backdrop-blur-md">
              <div className="text-primary/60 absolute inset-0 flex flex-col items-center justify-center">
                <div className="mb-4 text-6xl">🛍️</div>
                <div className="text-xl font-bold tracking-wider uppercase">Buyora</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
