export const env = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/api/v1',
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  siteName: process.env.NEXT_PUBLIC_SITE_NAME ?? 'Buyora',
  defaultCurrency: process.env.NEXT_PUBLIC_DEFAULT_CURRENCY ?? 'LKR',
  payheremerchantId: process.env.NEXT_PUBLIC_PAYHERE_MERCHANT_ID ?? '',
  stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '',
} as const;
