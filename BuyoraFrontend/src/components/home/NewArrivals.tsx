import { ProductCard } from '@/components/product/ProductCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { productsService } from '@/services/products.service';

export async function NewArrivals() {
  const products = await productsService.getNewArrivals().catch(() => null);
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
    <section className="container mx-auto max-w-screen-xl px-4 py-12 md:py-16">
      <SectionHeader
        title="New Arrivals"
        subtitle="The latest additions to our collection"
        linkText="Shop New"
        linkHref="/search?sort=NEWEST"
      />

      <div className="hide-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-6 md:mx-0 md:grid md:snap-none md:grid-cols-4 md:gap-6 md:px-0">
        {products.map((product) => (
          <div key={product.id} className="min-w-[280px] snap-start md:min-w-0">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
