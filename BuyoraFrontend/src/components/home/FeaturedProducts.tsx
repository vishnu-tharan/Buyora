import { ProductCard } from '@/components/product/ProductCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { productsService } from '@/services/products.service';

export async function FeaturedProducts() {
  const products = await productsService.getFeatured().catch(() => null);
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
        title="Featured Products"
        subtitle="Handpicked items you'll love"
        linkText="View All"
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
