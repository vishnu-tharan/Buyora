'use client';

import { ErrorState } from '@/components/ui/ErrorState';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-24">
      <ErrorState
        title="Something went wrong"
        message={error.message || 'An unexpected error occurred while loading this page.'}
        onRetry={reset}
      />
      <div className="mt-8">
        <Button asChild variant="link">
          <Link href="/">Return to Home</Link>
        </Button>
      </div>
    </div>
  );
}
