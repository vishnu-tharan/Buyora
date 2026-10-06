import { ArrowDownRight, ArrowUpRight, BadgeCheck, Layers3, Package, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { productsService } from '@/services/products.service';
import { formatCurrency } from '@/lib/formatting/currency';

export async function HeroSection() {
  const products = await productsService.getFeatured().catch(() => []);
  const product = products.find((item) => item.primaryImage?.url);
  return (
    <section className="container mx-auto max-w-screen-xl px-4 pt-5 pb-3 md:pt-8">
      <div className="hero-panel relative grid overflow-hidden rounded-[2rem] bg-[#132d35] text-white md:grid-cols-[1.05fr_1fr]">
        <div className="relative z-10 px-6 py-10 sm:px-10 md:py-16 lg:px-14">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-medium tracking-wide">
            <Sparkles size={14} className="text-[#ffc79b]" aria-hidden="true" /> A little discovery.
            A lot to love.
          </span>
          <h1 className="font-display max-w-xl text-4xl leading-[1.08] font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            Good finds.
            <br />
            Great everyday.<span className="text-[#ffc79b]"> Yours.</span>
          </h1>
          <p className="mt-5 max-w-md text-sm leading-7 text-white/70 md:text-base">
            Discover something for your space, your style, and everything in between. Thoughtfully
            selected. Ready for you.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/categories"
              className="inline-flex min-h-12 items-center gap-6 rounded-full bg-[#ffc79b] px-6 text-sm font-semibold text-[#132d35] transition hover:bg-[#ffb87f]"
            >
              Explore the collection <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
            <Link
              href="/deals"
              className="inline-flex min-h-12 items-center gap-2 text-sm font-medium text-white/90 hover:text-white"
            >
              Find a good deal <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-8 flex items-center gap-2 text-xs text-white/65">
            <BadgeCheck size={16} className="text-[#ffc79b]" aria-hidden="true" /> Shop in LKR ·
            Delivered across Sri Lanka
          </div>
        </div>
        <div className="relative hidden min-h-[250px] items-center justify-center px-6 pb-8 md:flex md:min-h-[420px] md:p-10">
          <div className="absolute inset-8 rounded-full bg-[#ffc79b]/10 blur-3xl" />
          {product ? (
            <Link
              href={`/product/${product.slug}`}
              className="relative w-full max-w-sm rotate-[-3deg] rounded-[1.8rem] bg-[#f6f0e7] p-5 text-[#132d35] shadow-2xl transition hover:rotate-0"
            >
              <div className="mb-3 flex justify-between text-xs font-medium">
                <span className="inline-flex items-center gap-1.5">
                  <Sparkles size={14} aria-hidden="true" /> In the spotlight
                </span>
                <ArrowUpRight size={17} aria-hidden="true" />
              </div>
              <div className="relative aspect-[4/3]">
                <Image
                  src={product.primaryImage!.url}
                  alt={product.primaryImage!.altText || product.name}
                  fill
                  preload
                  sizes="(max-width: 768px) 80vw, 340px"
                  className="object-contain"
                />
              </div>
              <div className="mt-4 flex items-end justify-between gap-4">
                <h2 className="line-clamp-2 text-lg font-semibold">{product.name}</h2>
                <span className="shrink-0 text-sm font-semibold">
                  {formatCurrency(product.salePrice ?? product.basePrice)}
                </span>
              </div>
            </Link>
          ) : (
            <div className="relative flex aspect-[4/3] w-full max-w-sm items-center justify-center rounded-[1.8rem] border border-white/15 bg-white/5">
              <div className="flex flex-col items-center">
                <div className="mb-5 flex items-center gap-3">
                  <div className="rounded-2xl bg-[#ffc79b] p-5 text-[#132d35]">
                    <Package size={40} strokeWidth={1.5} aria-hidden="true" />
                  </div>
                  <div className="rounded-2xl bg-white/10 p-5">
                    <Layers3 size={40} strokeWidth={1.5} aria-hidden="true" />
                  </div>
                </div>
                <p className="text-lg font-medium">Find your next favourite</p>
                <Link
                  href="/categories"
                  className="mt-3 inline-flex items-center gap-2 text-sm text-white/70"
                >
                  Browse categories <ArrowDownRight size={16} aria-hidden="true" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
