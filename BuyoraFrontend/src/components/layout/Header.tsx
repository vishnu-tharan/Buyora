'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLogout } from '@/hooks/use-logout';
import { useAuthStore } from '@/stores/auth.store';
import { useCartStore } from '@/stores/cart.store';
import { useUIStore } from '@/stores/ui.store';
import { Columns3, Heart, Layers3, Menu, Search, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { MegaMenu } from './MegaMenu';
import { SearchDropdown } from './SearchDropdown';

export function Header() {
  const { toggleMobileMenu } = useUIStore();
  const toggleCart = useCartStore((state) => state.toggleCart);
  const { cart } = useCartStore();
  const totalItems = cart?.itemCount || 0;
  const { user } = useAuthStore();
  const logoutRequest = useLogout();
  const logout = () => logoutRequest.mutate();
  const isAuthenticated = !!user;
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const megaMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (megaMenuRef.current && !megaMenuRef.current.contains(e.target as Node)) {
        setIsMegaMenuOpen(false);
      }
    };
    document.addEventListener('mousemove', handleMouseLeave);
    return () => document.removeEventListener('mousemove', handleMouseLeave);
  }, []);

  return (
    <header className="bg-background sticky top-0 z-40 w-full border-b shadow-sm">
      <div className="container mx-auto flex h-20 max-w-screen-xl items-center justify-between gap-4 px-4">
        {/* Mobile Left */}
        <div className="flex items-center xl:hidden">
          <Button variant="ghost" size="icon" onClick={() => toggleMobileMenu()} aria-label="Menu">
            <Menu className="h-6 w-6" />
          </Button>
        </div>

        {/* Logo */}
        <div className="flex-shrink-0">
          <Link
            href="/"
            className="text-primary font-display inline-flex items-center gap-2 text-2xl font-bold tracking-tight"
          >
            <Layers3 size={25} strokeWidth={1.5} aria-hidden="true" /> Buyora
            <span className="text-[#b95728]">.</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-4 text-xs font-medium xl:flex">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>

          {/* Categories with Mega Menu */}
          <div
            className="group relative flex h-16 cursor-pointer items-center"
            ref={megaMenuRef}
            onMouseEnter={() => setIsMegaMenuOpen(true)}
          >
            <button
              type="button"
              aria-expanded={isMegaMenuOpen}
              onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
              className="hover:text-primary transition-colors"
            >
              Categories
            </button>
            {isMegaMenuOpen && (
              <MegaMenu isOpen={isMegaMenuOpen} onClose={() => setIsMegaMenuOpen(false)} />
            )}
          </div>

          <Link href="/deals" className="hover:text-primary transition-colors">
            Deals
          </Link>
          <Link href="/search?sort=NEWEST" className="hover:text-primary transition-colors">
            New Arrivals
          </Link>
          <Link href="/brands" className="hover:text-primary transition-colors">
            Brands
          </Link>
        </nav>

        {/* Search */}
        <div className="relative mx-auto hidden max-w-md flex-1 md:flex">
          <SearchDropdown />
        </div>

        {/* Mobile Search Icon (only visible on mobile) */}
        <div className="ml-auto md:hidden">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Search"
            aria-expanded={mobileSearchOpen}
            aria-controls="mobile-search"
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
          >
            <Search className="h-5 w-5" />
          </Button>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon" className="hidden lg:flex">
            <Link href="/compare" aria-label="Compare products">
              <Columns3 className="h-5 w-5" />
            </Link>
          </Button>
          {/* Wishlist (Desktop) */}
          <Button asChild variant="ghost" size="icon" className="hidden lg:flex">
            <Link href={isAuthenticated ? '/account/wishlist' : '/wishlist'} aria-label="Wishlist">
              <Heart className="h-5 w-5" />
            </Link>
          </Button>

          {/* Account Menu (Desktop) */}
          <div className="hidden md:block">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  aria-label="Account menu"
                  className="hover:bg-muted hover:text-foreground inline-flex size-8 shrink-0 items-center justify-center rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar} alt={user?.firstName} />
                    <AvatarFallback>
                      {user?.firstName?.[0]}
                      {user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-muted-foreground w-[200px] truncate text-sm">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link href="/account">My Account</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/account/orders">My Orders</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/account/wishlist">Wishlist</Link>
                  </DropdownMenuItem>
                  {user?.roles?.includes('ADMIN') && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Link href="/admin">Admin Dashboard</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600"
                    onClick={() => logout()}
                  >
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="text-sm hover:underline">
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="bg-primary text-primary-foreground hover:bg-primary/80 inline-flex h-7 items-center justify-center gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] font-medium"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Cart */}
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => toggleCart()}
            aria-label="Cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="bg-primary text-primary-foreground absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold">
                {totalItems}
              </span>
            )}
          </Button>
        </div>
      </div>
      {mobileSearchOpen && (
        <div id="mobile-search" className="border-t p-4 md:hidden">
          <SearchDropdown />
        </div>
      )}
    </header>
  );
}
