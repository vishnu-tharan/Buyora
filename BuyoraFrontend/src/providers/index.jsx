import { Toaster } from '@/components/ui/toast';
import { AuthProvider } from './auth-provider';
import { QueryProvider } from './query-provider';
import { WishlistMergeProvider } from './wishlist-merge-provider';

export function Providers({ children }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <Toaster>
          {children}

          <WishlistMergeProvider />
        </Toaster>
      </AuthProvider>
    </QueryProvider>
  );
}
