import { Toaster } from '@/components/ui/toast';
import { AuthProvider } from './auth-provider';
import { QueryProvider } from './query-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <Toaster>{children}</Toaster>
      </AuthProvider>
    </QueryProvider>
  );
}
