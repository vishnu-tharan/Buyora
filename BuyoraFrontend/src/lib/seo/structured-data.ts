import { SITE_NAME, SITE_URL } from '@/constants';
import type { Product } from '@/types';

export function generateProductStructuredData(product: Product) {
  const lowestPrice =
    product.variants.length > 0
      ? Math.min(...product.variants.map((v) => v.price))
      : (product.salePrice ?? product.basePrice);
  const inStock = product.variants.some((v) => v.availableQuantity > 0);

  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription ?? product.description,
    image: product.images.map((img) => new URL(img.url, SITE_URL).toString()),
    sku: product.sku,
    url: `${SITE_URL}/product/${product.slug}`,
    brand: product.brand
      ? {
          '@type': 'Brand',
          name: product.brand.name,
        }
      : undefined,
    offers: {
      '@type': 'Offer',
      price: lowestPrice,
      priceCurrency: 'LKR',
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `${SITE_URL}/product/${product.slug}`,
      seller: {
        '@type': 'Organization',
        name: SITE_NAME,
      },
    },
  };

  // Only include aggregateRating when real data exists
  if (product.averageRating && product.reviewCount && product.reviewCount > 0) {
    data.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.averageRating,
      reviewCount: product.reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return data;
}

export function generateBreadcrumbStructuredData(items: Array<{ label: string; href?: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: item.href ? `${SITE_URL}${item.href}` : undefined,
    })),
  };
}

export function generateOrganizationStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['English'],
    },
  };
}

export function generateWebSiteStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}
