import { ProductCard } from '@/components/product/ProductCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { productsService } from '@/services/products.service';

export async function BestSellers() {
  const selected = await productsService.getBestSellers().catch(() => null);
  const products =
    selected?.length === 0
      ? await productsService
          .getProducts({ size: 8 })
          .then((p) => p.content)
          .catch(() => null)
      : selected;
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
    <section className="container mx-auto max-w-screen-xl px-4 py-8 md:py-12">
      <SectionHeader
        title={selected?.length ? 'Best Sellers' : 'Good finds for your everyday'}
        subtitle={selected?.length ? 'Our most popular products' : 'Explore something new.'}
        linkText="Explore all"
        linkHref="/search"
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
