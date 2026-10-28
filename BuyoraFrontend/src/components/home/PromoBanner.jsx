import { ArrowUpRight, Coins, Gem, Wallet } from 'lucide-react';
import Link from 'next/link';

export function PromoBanner() {
  const budgets = [
    {
      title: 'Everyday value',
      range: 'LKR 200 – 5,000',
      detail: 'Little finds that go a long way.',
      href: '/search?minPrice=200&maxPrice=5000&sort=PRICE_ASC',
      icon: Coins,
    },
    {
      title: 'Your next upgrade',
      range: 'LKR 5,000 – 25,000',
      detail: 'More choice for your everyday.',
      href: '/search?minPrice=5000&maxPrice=25000',
      icon: Wallet,
    },
    {
      title: 'Premium picks',
      range: 'LKR 25,000 & above',
      detail: 'Make room for something special.',
      href: '/search?minPrice=25000&sort=PRICE_DESC',
      icon: Gem,
    },
  ];
  return (
    <section
      aria-label="Shop by budget"
      className="container mx-auto grid max-w-screen-xl gap-4 px-4 py-6 md:grid-cols-3"
    >
      {budgets.map(({ title, range, detail, href, icon: Icon }) => (
        <Link
          key={title}
          href={href}
          className="group border-primary/10 bg-primary/5 hover:border-primary/30 hover:bg-primary/10 rounded-2xl border p-6 transition"
        >
          <div className="mb-5 flex items-center justify-between">
            <Icon size={26} strokeWidth={1.5} className="text-primary" aria-hidden="true" />
            <ArrowUpRight
              size={19}
              className="text-primary transition group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </div>
          <p className="text-muted-foreground mb-1 text-xs font-semibold tracking-wider uppercase">
            {title}
          </p>
          <h2 className="font-display text-xl font-bold">{range}</h2>
          <p className="text-muted-foreground mt-2 text-sm">{detail}</p>
        </Link>
      ))}
    </section>
  );
}
