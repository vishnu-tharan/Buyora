import { SITE_URL } from '@/constants';
import { categoriesService } from '@/services';

export default async function sitemap() {
  const baseRoutes = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    {
      url: `${SITE_URL}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    { url: `${SITE_URL}/deals`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    {
      url: `${SITE_URL}/search`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
  ];
  // Fetch categories for sitemap
  let categoryRoutes = [];
  try {
    const categories = await categoriesService.getCategoryTree();
    categoryRoutes = categories.map((cat) => ({
      url: `${SITE_URL}/category/${cat.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
  } catch {
    // Gracefully handle if backend is not available
  }
  const helpRoutes = ['contact', 'faq', 'shipping', 'returns', 'privacy', 'terms'].map((path) => ({
    url: SITE_URL + '/' + path,
    changeFrequency: 'monthly',
    priority: 0.3,
  }));
  return [...baseRoutes, ...categoryRoutes, ...helpRoutes];
}
