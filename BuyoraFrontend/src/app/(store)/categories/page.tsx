import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Card, CardContent } from '@/components/ui/card';
import { categoriesService } from '@/services/categories.service';
import type { Category } from '@/types';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'All Categories | Buyora',
  description: 'Browse all product categories on Buyora',
};

export default async function CategoriesPage() {
  let categories: Category[] = [];
  let unavailable = false;
  try {
    categories = await categoriesService.getCategories();
  } catch {
    unavailable = true;
  }

  // Filter out to show only top-level if we have that info, or just show all
  const displayCategories = categories.filter((c) => c.level === 0 || !c.parent);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumb items={[{ label: 'Categories' }]} className="mb-6" />

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">All Categories</h1>
        <p className="text-muted-foreground mt-2">
          Browse our wide selection of products by category
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {displayCategories.map((category) => (
          <Link key={category.id} href={`/category/${category.slug}`}>
            <Card className="hover:border-primary group h-full overflow-hidden transition-colors">
              <div className="bg-muted relative flex aspect-video items-center justify-center overflow-hidden">
                {category.imageUrl ? (
                  <Image
                    src={category.imageUrl}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <span className="text-4xl">📁</span>
                )}
              </div>
              <CardContent className="p-4 text-center">
                <h3 className="line-clamp-1 text-lg font-semibold">{category.name}</h3>
                {category.productCount !== undefined && (
                  <p className="text-muted-foreground mt-1 text-sm">
                    {category.productCount} Products
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
        {displayCategories.length === 0 && (
          <div className="text-muted-foreground col-span-full rounded-lg border py-12 text-center">
            {unavailable
              ? 'Categories could not be loaded. Please try again later.'
              : 'No categories available at the moment.'}
          </div>
        )}
      </div>
    </div>
  );
}
