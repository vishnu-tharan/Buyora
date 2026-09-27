import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { ProductDetail } from '@/components/product/ProductDetail';
import { ProductReviews } from '@/components/product/ProductReviews';
import { RecentlyViewed } from '@/components/product/RecentlyViewed';
import { RelatedProducts } from '@/components/product/RelatedProducts';
import { Skeleton } from '@/components/ui/skeleton';
import { productsService } from '@/services/products.service';

export const revalidate = 60; // ISR: revalidate every 60 seconds

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  try {
    const product = await productsService.getProduct((await params).slug);

    if (!product) return {};

    const title = product.seoTitle || product.name;
    const description =
      product.seoDescription ||
      product.shortDescription ||
      product.description?.substring(0, 160) ||
      '';
    const images = product.images.filter((img) => img.isPrimary).map((img) => img.url);
    if (images.length === 0 && product.images.length > 0) {
      images.push(product.images[0].url);
    }

    return {
      title,
      description,
      alternates: {
        canonical: `/product/${product.slug}`,
      },
      openGraph: {
        title,
        description,
        url: `/product/${product.slug}`,
        siteName: 'Buyora',
        images: images.map((url) => ({ url })),
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: images,
      },
    };
  } catch {
    return {};
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  let product;
  try {
    const response = await productsService.getProduct((await params).slug);
    product = response;
  } catch {
    // 404 or other error
  }

  if (!product) {
    notFound();
  }

  // JSON-LD Structured Data
  const price = product.salePrice ?? product.basePrice;
  const inStock = product.variants?.some((v) => v.availableQuantity > 0);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription || product.description?.substring(0, 160),
    image: product.images.map((i) => i.url),
    ...(product.brand
      ? {
          brand: {
            '@type': 'Brand',
            name: product.brand.name,
          },
        }
      : {}),
    offers: {
      '@type': 'Offer',
      price: price,
      priceCurrency: 'LKR',
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/product/${product.slug}`,
    },
    ...(product.averageRating && product.reviewCount
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: product.averageRating,
            reviewCount: product.reviewCount,
          },
        }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />

      <main className="pb-16">
        <ProductDetail product={product} />

        <div className="container mx-auto mt-8 space-y-16 px-4">
          <Suspense
            fallback={
              <div className="py-12">
                <Skeleton className="h-96 w-full" />
              </div>
            }
          >
            <ProductReviews productId={product.id} productName={product.name} />
          </Suspense>

          {product.category && (
            <Suspense
              fallback={
                <div className="py-12">
                  <Skeleton className="h-64 w-full" />
                </div>
              }
            >
              <RelatedProducts categorySlug={product.category.slug} currentProductId={product.id} />
            </Suspense>
          )}

          <RecentlyViewed currentProduct={product} />
        </div>
      </main>
    </>
  );
}
