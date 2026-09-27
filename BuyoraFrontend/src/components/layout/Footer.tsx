import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-muted border-t pt-12 pb-8">
      <div className="container mx-auto max-w-screen-xl px-4">
        <div className="mb-10 grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="text-primary inline-block text-2xl font-bold tracking-tight">
              Buyora.
            </Link>
            <p className="text-muted-foreground text-sm">
              Quality products, unbeatable prices. Shop the latest from top brands in Sri Lanka.
            </p>
          </div>
          <div>
            <h4 className="mb-4 font-semibold">Shop</h4>
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li>
                <Link href="/categories" className="hover:text-foreground transition-colors">
                  Categories
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-semibold">Support</h4>
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li>
                <Link href="/account/orders" className="hover:text-foreground transition-colors">
                  Your Orders
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-semibold">Account</h4>
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li>
                <Link href="/account/profile" className="hover:text-foreground transition-colors">
                  Your Profile
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="text-muted-foreground flex flex-col items-center justify-between gap-4 border-t pt-6 text-xs md:flex-row">
          <p>&copy; 2026 Buyora. All rights reserved.</p>
          <div className="flex items-center gap-2 font-medium">
            Designed with care in Sri Lanka 🇱🇰
          </div>
        </div>
      </div>
    </footer>
  );
}
