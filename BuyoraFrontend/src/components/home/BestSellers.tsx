import { ProductCard } from '@/components/product/ProductCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { productsService } from '@/services/products.service';

export async function BestSellers() {
  const products = await productsService.getBestSellers().catch(() => null);
  if (!products)
    return (
      <section className="container mx-auto px-4 py-6">
        <p role="status" className="text-muted-foreground">
          This collection is temporarily unavailable. Please try again later.
        </p>
      </section>
    );

  if (products.length === 0) return null;

  return (
    <section className="bg-muted/30 container mx-auto mb-12 max-w-screen-xl rounded-3xl px-4 py-12 md:py-16">
      <SectionHeader title="Best Sellers" subtitle="Our most popular products" />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
