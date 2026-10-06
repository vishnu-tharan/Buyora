import { Toaster } from '@/components/ui/toast';
import { AuthProvider } from './auth-provider';
import { QueryProvider } from './query-provider';
import { WishlistMergeProvider } from './wishlist-merge-provider';
import { AnalyticsProvider } from './analytics-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <Toaster>
          {children}
          <AnalyticsProvider />
          <WishlistMergeProvider />
        </Toaster>
      </AuthProvider>
    </QueryProvider>
  );
}
