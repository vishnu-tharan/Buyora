'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { categoriesService } from '@/services/categories.service';
import { Category } from '@/types/product';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MegaMenu({ isOpen, onClose }: MegaMenuProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const tree = await categoriesService.getCategoryTree();
        setCategories(tree);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };
    if (isOpen && categories.length === 0) {
      fetchCategories();
    }
  }, [isOpen, categories.length]);

  return (
    <div className="bg-background animate-in fade-in slide-in-from-top-2 absolute top-full left-0 z-50 w-[600px] cursor-default overflow-hidden rounded-b-xl border p-6 shadow-xl">
      {loading ? (
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-8">
          {categories.slice(0, 4).map((category) => (
            <div key={category.id}>
              <Link
                href={/category/ + category.slug}
                className="hover:text-primary mb-2 block font-bold transition-colors"
                onClick={onClose}
              >
                {category.name}
              </Link>
              {category.children && category.children.length > 0 && (
                <ul className="mt-2 space-y-1.5">
                  {category.children.slice(0, 5).map((sub) => (
                    <li key={sub.id}>
                      <Link
                        href={/category/ + sub.slug}
                        className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                        onClick={onClose}
                      >
                        {sub.name}
                      </Link>
                    </li>
                  ))}
                  {category.children.length > 5 && (
                    <li>
                      <Link
                        href={/category/ + category.slug}
                        className="text-primary text-sm hover:underline"
                        onClick={onClose}
                      >
                        View all &rarr;
                      </Link>
                    </li>
                  )}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
