import { HeadphonesIcon, RefreshCw, ShieldCheck, Truck } from 'lucide-react';

export function TrustBadges() {
  const badges = [
    {
      icon: <Truck className="text-primary h-8 w-8" />,
      title: 'Free Shipping',
      description: 'On orders over LKR 5,000',
    },
    {
      icon: <ShieldCheck className="text-primary h-8 w-8" />,
      title: 'Secure Payments',
      description: '100% safe checkout',
    },
    {
      icon: <RefreshCw className="text-primary h-8 w-8" />,
      title: 'Easy Returns',
      description: '30-day return policy',
    },
    {
      icon: <HeadphonesIcon className="text-primary h-8 w-8" />,
      title: '24/7 Support',
      description: 'Always here to help',
    },
  ];

  return (
    <section className="container mx-auto max-w-screen-xl border-b px-4 py-12">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
        {badges.map((badge, i) => (
          <div
            key={i}
            className="bg-background flex items-center gap-4 rounded-xl border p-4 shadow-sm transition-transform hover:-translate-y-1"
          >
            <div className="bg-primary/10 flex-shrink-0 rounded-full p-3">{badge.icon}</div>
            <div>
              <h4 className="font-bold">{badge.title}</h4>
              <p className="text-muted-foreground text-sm">{badge.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
