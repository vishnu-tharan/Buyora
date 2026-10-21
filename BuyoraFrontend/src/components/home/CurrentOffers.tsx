import { productsService } from '@/services/products.service';
import { ProductCard } from '@/components/product/ProductCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
export async function CurrentOffers() {
  const products = await productsService
    .getProducts({ hasDiscount: true, size: 4 })
    .then((page) => page.content)
    .catch(() => []);
  if (!products.length) return null;
  return (
    <section className="container mx-auto max-w-screen-xl px-4 py-8 md:py-10">
      <SectionHeader
        title="Offers worth a look"
        subtitle="Selected finds with a little extra value."
        linkText="Explore offers"
        linkHref="/deals"
      />
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
