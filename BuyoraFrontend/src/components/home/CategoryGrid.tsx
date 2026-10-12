import { SectionHeader } from '@/components/ui/SectionHeader';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { categoriesService } from '@/services/categories.service';
import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export async function CategoryGrid() {
  const categories = await categoriesService.getCategoryTree().catch(() => null);
  if (!categories)
    return (
      <section className="container mx-auto px-4 py-6">
        <p role="status">Categories are temporarily unavailable.</p>
      </section>
    );
  if (!categories.length) return null;
  return (
    <section className="container mx-auto max-w-screen-xl px-4 py-8 md:py-10">
      <SectionHeader
        title="Shop by category"
        subtitle="Everything you love, in one place."
        linkText="All categories"
        linkHref="/categories"
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
        {categories.slice(0, 8).map((category) => (
          <Link
            key={category.id}
            href={`/category/${category.slug}`}
            className="group hover:border-primary/30 overflow-hidden rounded-2xl border bg-white transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="bg-muted relative aspect-[4/3] overflow-hidden">
              {category.imageUrl ? (
                <Image
                  src={category.imageUrl}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 45vw, (max-width: 1280px) 22vw, 160px"
                  className="object-cover transition duration-300 group-hover:scale-105"
                />
              ) : (
                <span className="text-primary flex h-full items-center justify-center">
                  <CategoryIcon name={category.name} className="size-12" />
                </span>
              )}
            </div>
            <div className="flex min-h-16 items-center justify-between gap-2 p-3">
              <span className="text-xs leading-5 font-semibold">{category.name}</span>
              <ArrowUpRight size={15} className="text-primary shrink-0" aria-hidden="true" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
