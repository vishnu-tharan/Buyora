import { ArrowUpRight, CreditCard, Layers3, PackageCheck } from 'lucide-react';
import Link from 'next/link';
export function Footer() {
  const groups = [
    {
      title: 'Discover',
      links: [
        ['Categories', '/categories'],
        ['New arrivals', '/search?sort=NEWEST'],
        ['Current deals', '/deals'],
        ['Brands', '/brands'],
        ['Compare products', '/compare'],
      ],
    },
    {
      title: 'Here to help',
      links: [
        ['Contact us', '/contact'],
        ['Frequently asked questions', '/faq'],
        ['Delivery information', '/shipping'],
        ['Returns & refunds', '/returns'],
        ['Track an order', '/track-order'],
      ],
    },
    {
      title: 'Your Buyora',
      links: [
        ['Your account', '/account'],
        ['Your orders', '/account/orders'],
        ['Saved favourites', '/wishlist'],
        ['Product alerts', '/account/alerts'],
      ],
    },
  ];
  return (
    <footer className="mt-10 border-t bg-[#132d35] text-white">
      <div className="container mx-auto max-w-screen-xl px-4 py-12 md:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <Link
              href="/"
              className="font-display inline-flex items-center gap-2 text-3xl font-bold tracking-tight"
            >
              <Layers3 className="text-[#ffc79b]" strokeWidth={1.5} aria-hidden="true" /> Buyora
              <span className="text-[#ffc79b]">.</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-7 text-white/60">
              Good finds for your everyday.
              <br />
              Discover your next favourite, right here in Sri Lanka.
            </p>
            <div className="mt-6 flex gap-3">
              <span className="rounded-xl border border-white/15 p-3" title="Delivery information">
                <PackageCheck size={20} aria-hidden="true" />
              </span>
              <span
                className="rounded-xl border border-white/15 p-3"
                title="Payment options at checkout"
              >
                <CreditCard size={20} aria-hidden="true" />
              </span>
            </div>
          </div>
          {groups.map((group) => (
            <div key={group.title}>
              <h2 className="mb-5 text-sm font-semibold">{group.title}</h2>
              <ul className="space-y-3">
                {group.links.map(([label, href]) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="group inline-flex items-center gap-2 text-sm text-white/60 transition hover:text-white"
                    >
                      {label}
                      <ArrowUpRight
                        size={12}
                        className="opacity-0 transition group-hover:opacity-100"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-6 text-xs text-white/50">
          <p>© {new Date().getFullYear()} Buyora. All rights reserved.</p>
          <div className="flex flex-wrap gap-5">
            <Link href="/privacy" className="hover:text-white">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white">
              Terms
            </Link>
            <Link href="/privacy#preferences" className="hover:text-white">
              Cookie preferences
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
