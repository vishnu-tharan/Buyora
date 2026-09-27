// Analytics event types
export type AnalyticsEvent =
  | { type: 'product_view'; productId: number; productName: string; price: number }
  | { type: 'search'; query: string; resultsCount: number }
  | { type: 'add_to_cart'; productId: number; variantId: number; quantity: number; price: number }
  | { type: 'remove_from_cart'; productId: number; quantity: number }
  | { type: 'begin_checkout'; cartTotal: number; itemCount: number }
  | { type: 'purchase'; orderNumber: string; total: number; itemCount: number }
  | { type: 'add_to_wishlist'; productId: number }
  | { type: 'coupon_applied'; code: string; discount: number };

type AnalyticsProvider = {
  track: (event: AnalyticsEvent) => void;
};

const providers: AnalyticsProvider[] = [];

export function registerAnalyticsProvider(provider: AnalyticsProvider) {
  providers.push(provider);
}

export function trackEvent(event: AnalyticsEvent) {
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
