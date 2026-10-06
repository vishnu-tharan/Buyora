'use client';

import { useCartStore } from '@/stores/cart.store';
import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function FloatingCartButton() {
  const pathname = usePathname();
  const { cart } = useCartStore();
  const itemCount = cart?.itemCount || 0;

  if (itemCount === 0 || pathname.startsWith('/product/') || pathname === '/checkout') return null;

  return (
    <Link
      href="/cart"
      className="bg-primary text-primary-foreground fixed right-6 bottom-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 md:hidden"
      aria-label="View Cart"
    >
      <div className="relative">
        <ShoppingBag className="h-6 w-6" />
        <span className="bg-destructive text-destructive-foreground absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold">
          {itemCount}
        </span>
      </div>
    </Link>
  );
}
