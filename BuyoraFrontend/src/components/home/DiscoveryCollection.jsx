import { categoriesService } from '@/services/categories.service';
import { productsService } from '@/services/products.service';
import { ShopDiscovery } from './ShopDiscovery';

export async function DiscoveryCollection() {
  const [categories, products] = await Promise.all([
    categoriesService.getCategoryTree().catch(() => []),
    productsService
      .getProducts({ size: 8 })
      .then((page) => page.content)
      .catch(() => []),
  ]);
  return <ShopDiscovery categories={categories} initialProducts={products} />;
}
