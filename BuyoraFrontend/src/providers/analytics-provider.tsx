'use client';
import { useEffect } from 'react';
import { api } from '@/lib/api/client';
import { registerAnalyticsProvider } from '@/lib/analytics/events';
import { AnalyticsPreferences } from '@/components/analytics/AnalyticsPreferences';
export function AnalyticsProvider() {
  useEffect(
    () =>
      registerAnalyticsProvider({
        track(event) {
          try {
            if (localStorage.getItem('buyora-analytics-consent') !== 'allow') return;
            // Send only the event type: no search terms, order identifiers, or personal data.
            void api.post('/analytics/events', { type: event.type }).catch(() => undefined);
          } catch {
            /* Storage may be disabled. Shopping continues. */
          }
        },
      }),
    []
  );
  return <AnalyticsPreferences banner />;
}
