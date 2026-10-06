'use client';
import Link from 'next/link';
import { useBrowserStorage } from '@/hooks/use-browser-storage';
import { Button } from '@/components/ui/button';
import { ChartNoAxesCombined, ShieldCheck } from 'lucide-react';
export function AnalyticsPreferences({ banner = false }: { banner?: boolean }) {
  const [consent, setConsent] = useBrowserStorage('buyora-analytics-consent');
  if (banner && consent) return null;
  return (
    <div
      className={
        banner
          ? 'bg-card fixed bottom-4 left-4 z-50 max-w-sm rounded-2xl border p-5 shadow-xl'
          : 'rounded-xl border p-4'
      }
      role={banner ? 'region' : undefined}
      aria-label="Shopping analytics preferences"
    >
      <span className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <ChartNoAxesCombined size={18} aria-hidden="true" /> Help us improve your shopping
      </span>
      <p className="text-muted-foreground text-xs leading-6">
        Allow anonymous shopping event counts? Your choice won’t affect checkout.{' '}
        <Link href="/privacy#preferences" className="underline">
          Privacy details
        </Link>
      </p>
      {!banner && (
        <p className="mt-2 flex items-center gap-2 text-xs">
          <ShieldCheck size={14} aria-hidden="true" />
          Analytics {consent === 'allow' ? 'allowed' : 'disabled'}
        </p>
      )}
      <div className="mt-4 flex gap-2">
        <Button size="sm" onClick={() => setConsent('allow')}>
          Allow analytics
        </Button>
        <Button size="sm" variant="outline" onClick={() => setConsent('deny')}>
          No thanks
        </Button>
      </div>
    </div>
  );
}
