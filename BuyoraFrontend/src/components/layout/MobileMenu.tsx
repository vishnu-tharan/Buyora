'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useLogout } from '@/hooks/use-logout';
import { useAuthStore } from '@/stores/auth.store';
import { useUIStore } from '@/stores/ui.store';
import {
  Columns3,
  Headphones,
  ChevronRight,
  Heart,
  LogOut,
  Package,
  Settings,
  User,
} from 'lucide-react';
import Link from 'next/link';

export function MobileMenu() {
  const { isMobileMenuOpen, closeMobileMenu } = useUIStore();
  const { user } = useAuthStore();
  const logoutRequest = useLogout();
  const logout = () => logoutRequest.mutate();

  return (
    <Sheet open={isMobileMenuOpen} onOpenChange={(open) => !open && closeMobileMenu()}>
      <SheetContent side="left" className="flex w-[300px] flex-col p-0 sm:w-[350px]">
        <SheetHeader className="border-b p-6 text-left">
          <SheetTitle className="text-primary text-2xl font-bold">Buyora.</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {/* User Section */}
          <div className="bg-muted/20 border-b p-6">
            {!!user ? (
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold">
                  {user?.firstName?.[0]}
                  {user?.lastName?.[0]}
                </div>
                <div>
                  <p className="font-medium">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-muted-foreground w-40 truncate text-xs">{user?.email}</p>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/login"
                  onClick={closeMobileMenu}
                  className="bg-primary text-primary-foreground hover:bg-primary/80 inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg px-2.5 text-sm font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={closeMobileMenu}
                  className="border-border bg-background hover:bg-muted inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg border px-2.5 text-sm font-medium"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 p-4 pb-0">
            <Link
              href="/compare"
              onClick={closeMobileMenu}
              className="flex items-center gap-2 rounded-xl border p-3 text-xs"
            >
              <Columns3 size={17} aria-hidden="true" />
              Compare
            </Link>
            <Link
              href="/contact"
              onClick={closeMobileMenu}
              className="flex items-center gap-2 rounded-xl border p-3 text-xs"
            >
              <Headphones size={17} aria-hidden="true" />
              Get help
            </Link>
          </div>
          {/* Navigation Links */}
          <nav className="flex flex-col gap-1 p-4">
            <Link
              href="/"
              className="hover:bg-muted flex items-center justify-between rounded-md p-3 font-medium transition-colors"
              onClick={closeMobileMenu}
            >
              Home <ChevronRight className="text-muted-foreground h-4 w-4" />
            </Link>
            <Link
              href="/categories"
              className="hover:bg-muted flex items-center justify-between rounded-md p-3 font-medium transition-colors"
              onClick={closeMobileMenu}
            >
              Categories <ChevronRight className="text-muted-foreground h-4 w-4" />
            </Link>
            <Link
              href="/deals"
              className="hover:bg-muted text-primary flex items-center justify-between rounded-md p-3 font-medium transition-colors"
              onClick={closeMobileMenu}
            >
              Deals <ChevronRight className="text-primary/70 h-4 w-4" />
            </Link>
            <Link
              href="/search?sort=NEWEST"
              className="hover:bg-muted flex items-center justify-between rounded-md p-3 font-medium transition-colors"
              onClick={closeMobileMenu}
            >
              New Arrivals <ChevronRight className="text-muted-foreground h-4 w-4" />
            </Link>
            <Link
              href="/brands"
              className="hover:bg-muted flex items-center justify-between rounded-md p-3 font-medium transition-colors"
              onClick={closeMobileMenu}
            >
              Brands <ChevronRight className="text-muted-foreground h-4 w-4" />
            </Link>
          </nav>

          {/* Account Links */}
          {!!user && (
            <div className="border-t p-4">
              <h4 className="text-muted-foreground mb-2 px-3 text-xs font-semibold tracking-wider uppercase">
                My Account
              </h4>
              <nav className="flex flex-col gap-1">
                <Link
                  href="/account"
                  className="hover:bg-muted flex items-center gap-3 rounded-md p-3 text-sm transition-colors"
                  onClick={closeMobileMenu}
                >
                  <User className="text-muted-foreground h-4 w-4" /> Profile
                </Link>
                <Link
                  href="/account/orders"
                  className="hover:bg-muted flex items-center gap-3 rounded-md p-3 text-sm transition-colors"
                  onClick={closeMobileMenu}
                >
                  <Package className="text-muted-foreground h-4 w-4" /> Orders
                </Link>
                <Link
                  href="/account/wishlist"
                  className="hover:bg-muted flex items-center gap-3 rounded-md p-3 text-sm transition-colors"
                  onClick={closeMobileMenu}
                >
                  <Heart className="text-muted-foreground h-4 w-4" /> Wishlist
                </Link>
                {user?.roles?.includes('ADMIN') && (
                  <Link
                    href="/admin"
                    className="hover:bg-muted text-primary flex items-center gap-3 rounded-md p-3 text-sm transition-colors"
                    onClick={closeMobileMenu}
                  >
                    <Settings className="h-4 w-4" /> Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout();
                    closeMobileMenu();
                  }}
                  className="flex w-full items-center gap-3 rounded-md p-3 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </nav>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
