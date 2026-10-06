import { productsService } from '@/services/products.service';
import { SITE_URL } from '@/constants';
import type { MetadataRoute } from 'next';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const products = await productsService.getProducts({ size: 1 }).catch(() => null);
  const maps = Array.from(
    { length: Math.ceil((products?.totalElements ?? 0) / 1000) },
    (_, i) => SITE_URL + '/product/sitemap/' + i + '.xml'
  );
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/account/', '/checkout/', '/payment/'],
      },
    ],
    sitemap: [`${SITE_URL}/sitemap.xml`, ...maps],
  };
}
