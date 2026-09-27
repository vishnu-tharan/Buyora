import '@/app/globals.css';
import { SkipNavLink } from '@/components/a11y/SkipNavLink';
import { JsonLd } from '@/components/seo/JsonLd';
import { SITE_NAME, SITE_URL } from '@/constants';
import {
  generateOrganizationStructuredData,
  generateWebSiteStructuredData,
} from '@/lib/seo/structured-data';
import { Providers } from '@/providers';
import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: 'Discover quality products at Buyora — your modern online shopping destination.',
  keywords: ['ecommerce', 'shopping', 'online store', 'Sri Lanka'],
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'en_LK',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Buyora — Your Online Shopping Destination',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${plusJakarta.variable} font-sans antialiased`}>
        <SkipNavLink />
        <Providers>{children}</Providers>
        <JsonLd data={generateOrganizationStructuredData()} />
        <JsonLd data={generateWebSiteStructuredData()} />
      </body>
    </html>
  );
}
