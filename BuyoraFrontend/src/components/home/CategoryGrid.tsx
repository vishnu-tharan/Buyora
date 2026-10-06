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
  const tones = ['bg-[#f2e9df]', 'bg-[#e8eff0]', 'bg-[#e9ecdf]', 'bg-[#eee8f0]'];
  return (
    <section className="container mx-auto max-w-screen-xl px-4 py-8 md:py-12">
      <SectionHeader
        title="A world of good finds"
        subtitle="Start with what you love."
        linkText="All categories"
        linkHref="/categories"
      />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
        {categories.slice(0, 8).map((category, i) => (
          <Link
            key={category.id}
            href={`/category/${category.slug}`}
            className={`group relative flex min-h-36 flex-col justify-between overflow-hidden rounded-2xl p-5 transition hover:-translate-y-1 md:min-h-44 ${tones[i % tones.length]}`}
          >
            {category.imageUrl ? (
              <Image
                src={category.imageUrl}
                alt=""
                fill
                sizes="(max-width: 768px) 45vw, 280px"
                className="object-cover opacity-20"
              />
            ) : null}
            <span className="text-primary relative mb-5 flex size-12 items-center justify-center rounded-2xl bg-white/65">
              <CategoryIcon name={category.name} />
            </span>
            <span className="relative flex items-center justify-between gap-2">
              <span className="text-sm font-semibold md:text-base">{category.name}</span>
              <ArrowUpRight
                size={18}
                className="text-primary shrink-0 transition group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
