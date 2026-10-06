import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/constants';
import { productsService } from '@/services/products.service';
export async function generateSitemaps() {
  const products = await productsService.getProducts({ size: 1 }).catch(() => null);
  return Array.from(
    { length: Math.max(1, Math.ceil((products?.totalElements ?? 0) / 1000)) },
    (_, id) => ({ id })
  );
}
export default async function sitemap({
  id,
}: {
  id: Promise<string>;
}): Promise<MetadataRoute.Sitemap> {
  const bucket = Number(await id);
  if (!Number.isSafeInteger(bucket) || bucket < 0) return [];
  const pages = await Promise.all(
    Array.from({ length: 10 }, (_, i) =>
      productsService.getProducts({ page: bucket * 10 + i, size: 100 })
    )
  );
  return pages.flatMap((page) =>
    page.content.map((p) => ({
      url: SITE_URL + '/product/' + encodeURIComponent(p.slug),
      lastModified: p.updatedAt ? new Date(p.updatedAt) : undefined,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  );
}
