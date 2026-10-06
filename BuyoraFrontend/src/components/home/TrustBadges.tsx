import { CreditCard, Headphones, PackageCheck, RotateCcw } from 'lucide-react';
import Link from 'next/link';
export function TrustBadges() {
  const badges = [
    {
      icon: PackageCheck,
      title: 'Delivery, made clear',
      description: 'See options before checkout',
      href: '/shipping',
    },
    {
      icon: CreditCard,
      title: 'Your way to pay',
      description: 'Available methods at checkout',
      href: '/faq',
    },
    {
      icon: RotateCcw,
      title: 'Help with returns',
      description: 'A clear process, step by step',
      href: '/returns',
    },
    {
      icon: Headphones,
      title: 'Here to help',
      description: 'Get in touch with our team',
      href: '/contact',
    },
  ];
  return (
    <section
      aria-label="Shopping with Buyora"
      className="container mx-auto grid max-w-screen-xl grid-cols-2 gap-4 px-4 py-6 md:grid-cols-4 md:py-8"
    >
      {badges.map(({ icon: Icon, title, description, href }) => (
        <Link
          key={title}
          href={href}
          className="group hover:bg-muted flex items-start gap-3 rounded-xl p-2 transition"
        >
          <span className="border-primary/10 bg-primary/5 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl border">
            <Icon size={21} strokeWidth={1.7} aria-hidden="true" />
          </span>
          <span>
            <span className="block text-xs font-semibold sm:text-sm">{title}</span>
            <span className="text-muted-foreground mt-1 block text-[11px] leading-5 sm:text-xs">
              {description}
            </span>
          </span>
        </Link>
      ))}
    </section>
  );
}
