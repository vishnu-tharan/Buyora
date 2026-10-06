import { ArrowUpRight, BadgePercent, Tag } from 'lucide-react';
import Link from 'next/link';
export function PromoBanner() {
  return (
    <section className="container mx-auto max-w-screen-xl px-4 py-6">
      <div className="relative flex flex-col justify-between gap-6 overflow-hidden rounded-3xl bg-[#f1e5d6] p-7 md:flex-row md:items-center md:p-10">
        <div className="flex items-center gap-5">
          <span className="border-primary/10 text-primary hidden size-20 shrink-0 items-center justify-center rounded-3xl border bg-white/40 sm:flex">
            <BadgePercent size={40} strokeWidth={1.3} aria-hidden="true" />
          </span>
          <div>
            <p className="text-primary mb-2 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] uppercase">
              <Tag size={14} aria-hidden="true" /> A good find feels even better
            </p>
            <h2 className="font-display text-3xl font-semibold tracking-tight">
              Small prices. Big possibilities.
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Discover current offers on selected products.
            </p>
          </div>
        </div>
        <Link
          href="/deals"
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex min-h-12 shrink-0 items-center justify-center gap-5 rounded-full px-6 text-sm font-semibold transition"
        >
          Explore deals <ArrowUpRight size={18} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
