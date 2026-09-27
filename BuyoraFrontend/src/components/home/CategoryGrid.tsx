import { SectionHeader } from '@/components/ui/SectionHeader';
import { categoriesService } from '@/services/categories.service';
import Link from 'next/link';

export async function CategoryGrid() {
  const categories = await categoriesService.getCategoryTree().catch(() => null);
  if (!categories)
    return (
      <section className="container mx-auto px-4 py-6">
        <p role="status">Categories are temporarily unavailable.</p>
      </section>
    );
  // Take top 8 categories
  const topCategories = categories.slice(0, 8);

  if (topCategories.length === 0) return null;

  return (
    <section className="container mx-auto max-w-screen-xl px-4 py-16">
      <SectionHeader
        title="Shop by Category"
        linkText="View All Categories"
        linkHref="/categories"
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
        {topCategories.map((category) => (
          <Link
            key={category.id}
            href={`/category/${category.slug}`}
            className="group bg-muted relative aspect-square overflow-hidden rounded-2xl transition-transform hover:scale-[1.02]"
          >
            {/* Fallback gradient if no image */}
            <div className="from-primary/20 to-primary/40 absolute inset-0 bg-gradient-to-br opacity-80" />

            <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            <div className="absolute right-0 bottom-0 left-0 z-20 p-4 md:p-6">
              <h3 className="text-lg font-bold tracking-tight text-white capitalize transition-transform group-hover:translate-x-1 md:text-xl">
                {category.name}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
