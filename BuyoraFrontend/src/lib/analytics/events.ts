// Analytics event types
export type AnalyticsEvent =
  | { type: 'product_view'; productId: number; productName: string; price: number }
  | { type: 'search'; query: string; resultsCount: number }
  | { type: 'add_to_cart'; productId: number; variantId: number; quantity: number; price: number }
  | { type: 'remove_from_cart'; productId: number; quantity: number }
  | { type: 'begin_checkout'; cartTotal: number; itemCount: number }
  | { type: 'purchase'; orderNumber: string; total: number; itemCount: number }
  | { type: 'order_placed'; orderNumber: string; total: number; itemCount: number }
  | { type: 'add_to_wishlist'; productId: number }
  | { type: 'coupon_applied'; code: string; discount: number };

type AnalyticsProvider = {
  track: (event: AnalyticsEvent) => void;
};

const providers: AnalyticsProvider[] = [];
const pending: AnalyticsEvent[] = [];

export function registerAnalyticsProvider(provider: AnalyticsProvider) {
  providers.push(provider);
  pending.splice(0).forEach((event) => {
    try {
      provider.track(event);
    } catch {
      /* Analytics must not interrupt shopping. */
    }
  });
  return () => {
    const index = providers.indexOf(provider);
    if (index >= 0) providers.splice(index, 1);
  };
}

export function trackEvent(event: AnalyticsEvent) {
  if (!providers.length) {
    if (pending.length < 30) pending.push(event);
    return;
  }
  if (process.env.NODE_ENV === 'development') {
    console.debug('[Analytics]', event);
  }
  providers.forEach((p) => {
    try {
      p.track(event);
    } catch (error) {
      console.warn('[Analytics] Provider error:', error);
    }
  });
}
