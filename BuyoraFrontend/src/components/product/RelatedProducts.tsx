import { ProductCard } from '@/components/product/ProductCard';
import { productsService } from '@/services/products.service';

interface RelatedProductsProps {
  categorySlug: string;
  currentProductId: number;
}

export async function RelatedProducts({ categorySlug, currentProductId }: RelatedProductsProps) {
  const data = await productsService.getProducts({ categorySlug, size: 9 }).catch(() => null);
  if (!data) return null;

  // Filter out current product and limit to 8
  const relatedProducts = data.content.filter((p) => p.id !== currentProductId).slice(0, 8);

  if (relatedProducts.length === 0) return null;

  return (
    <section className="border-t py-12">
      <h2 className="mb-8 text-2xl font-bold">You Might Also Like</h2>

      {/* Mobile: horizontal scroll, Desktop: grid */}
      <div className="hide-scrollbar flex gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-4 md:gap-6">
        {relatedProducts.map((product) => (
          <div key={product.id} className="w-[280px] shrink-0 md:w-auto">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
