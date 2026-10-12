import { ArrowRight, ArrowUpRight, Package, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { productsService } from '@/services/products.service';
import { formatCurrency } from '@/lib/formatting/currency';

export async function HeroSection() {
  const products = await productsService.getFeatured().catch(() => []);
  const product = products.find((item) => item.primaryImage?.url);
  const price = product?.variants.reduce((min, variant) => Math.min(min, variant.price), Infinity);
  return (
    <section className="container mx-auto max-w-screen-xl px-4 pt-6 pb-2">
      <div className="border-primary/10 grid overflow-hidden rounded-3xl border bg-[#fff1f2] md:grid-cols-[1.1fr_1fr]">
        <div className="flex flex-col justify-center px-6 py-9 sm:px-10 md:py-14 lg:px-14">
          <span className="text-primary mb-5 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] uppercase">
            <ShoppingBag size={16} aria-hidden="true" /> The everyday collection
          </span>
          <h1 className="font-display max-w-xl text-4xl leading-[1.1] font-bold tracking-tight text-[#23191b] sm:text-5xl lg:text-6xl">
            Your favourites.
            <br />
            <span className="text-primary">One happy place.</span>
          </h1>
          <p className="text-muted-foreground mt-5 max-w-md text-sm leading-7 md:text-base">
            Little essentials to big upgrades. Find electronics, style and home favourites for every
            budget.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <Link
              href="/search"
              className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex min-h-12 items-center gap-5 rounded-xl px-6 text-sm font-semibold transition"
            >
              Shop the collection <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link
              href="/categories"
              className="text-foreground inline-flex min-h-12 items-center gap-2 text-sm font-semibold"
            >
              Browse categories <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          </div>
          <p className="text-muted-foreground mt-7 flex items-center gap-2 text-xs">
            <Package size={16} aria-hidden="true" /> Sri Lankan rupees. Clear prices. More choice.
          </p>
        </div>
        <div className="relative flex items-center justify-center bg-[#991b1b] p-6 md:p-9">
          <div className="pointer-events-none absolute -top-20 -right-20 size-72 rounded-full border-[45px] border-white/5" />
          {product ? (
            <Link
              href={`/product/${product.slug}`}
              className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-xl transition hover:-translate-y-1"
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={product.primaryImage!.url}
                  alt={product.primaryImage!.altText || product.name}
                  fill
                  preload
                  sizes="(max-width: 768px) 85vw, 390px"
                  className="object-cover"
                />
                <span className="text-primary absolute top-4 left-4 rounded-full bg-white px-3 py-1.5 text-xs font-semibold shadow-sm">
                  Featured find
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 p-5">
                <div className="min-w-0">
                  <h2 className="line-clamp-2 text-sm font-semibold">{product.name}</h2>
                  <p className="text-primary mt-1 text-lg font-bold">
                    {formatCurrency(price && Number.isFinite(price) ? price : product.basePrice)}
                  </p>
                </div>
                <span className="bg-primary/5 text-primary rounded-xl p-3">
                  <ArrowUpRight size={20} aria-hidden="true" />
                </span>
              </div>
            </Link>
          ) : (
            <div className="relative rounded-2xl border border-white/20 p-10 text-center text-white">
              <ShoppingBag
                size={64}
                strokeWidth={1.2}
                className="mx-auto mb-5"
                aria-hidden="true"
              />
              <p className="font-display text-2xl font-semibold">Something for every day</p>
              <Link href="/search" className="mt-4 inline-flex items-center gap-2 text-sm">
                Explore the store <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
