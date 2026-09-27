'use client';

import { useBrowserStorage } from '@/hooks/use-browser-storage';
import { X } from 'lucide-react';

export function AnnouncementBar() {
  const [dismissed, setDismissed] = useBrowserStorage('announcement_dismissed', true);
  if (dismissed === 'true') return null;
  const dismiss = () => setDismissed('true');

  return (
    <div className="bg-primary text-primary-foreground relative flex items-center justify-center px-4 py-2 text-xs md:text-sm">
      <div className="max-w-screen-xl truncate px-4 text-center font-medium md:overflow-visible md:whitespace-normal">
        Welcome to Buyora &middot; Find your next favourite
      </div>
      <button
        onClick={dismiss}
        className="hover:bg-primary-foreground/20 absolute right-2 rounded-full p-1 transition-colors"
        aria-label="Dismiss announcement"
      >
        <X size={14} />
      </button>
    </div>
  );
}
