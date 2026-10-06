import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useLogout } from '@/hooks/use-logout';
import { useAuthStore } from '@/stores/auth.store';
import { BellRing, Heart, LogOut, MapPin, Package, Shield, Star, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/account/profile', label: 'My Profile', icon: User },
  { href: '/account/orders', label: 'My Orders', icon: Package },
  { href: '/account/wishlist', label: 'Wishlist', icon: Heart },
  { href: '/account/addresses', label: 'Addresses', icon: MapPin },
  { href: '/account/reviews', label: 'My Reviews', icon: Star },
  { href: '/account/alerts', label: 'Product alerts', icon: BellRing },
  { href: '/account/security', label: 'Security', icon: Shield },
];

export function AccountSidebar() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();
  const handleLogout = () => logout.mutate();

  if (!user) return null;

  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();

  return (
    <div className="flex w-full flex-shrink-0 flex-col gap-6 lg:w-64">
      <div className="flex flex-col items-center space-y-4 rounded-xl border border-gray-100 bg-white p-6 text-center">
        <Avatar className="h-20 w-20">
          <AvatarImage src={user.avatar} alt={user.firstName} />
          <AvatarFallback className="bg-primary/10 text-primary text-xl">{initials}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-medium text-gray-900">
            {user.firstName} {user.lastName}
          </h3>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1 rounded-xl border border-gray-100 bg-white p-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary/5 text-primary'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
        <div className="my-1 border-t border-gray-100" />
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </nav>
    </div>
  );
}
