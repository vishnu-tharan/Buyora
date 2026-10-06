export const dynamic = 'force-dynamic';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { HomeRecentlyViewed } from '@/components/home/HomeRecentlyViewed';
import { HeroSection } from '@/components/home/HeroSection';
import { PromoBanner } from '@/components/home/PromoBanner';
import { TrustBadges } from '@/components/home/TrustBadges';
import { Skeleton } from '@/components/ui/skeleton';
import nextDynamic from 'next/dynamic';
import { Suspense } from 'react';

const NewArrivals = nextDynamic(
  () => import('@/components/home/NewArrivals').then((mod) => ({ default: mod.NewArrivals })),
  {
    loading: () => <SectionSkeleton />,
  }
);

const BestSellers = nextDynamic(
  () => import('@/components/home/BestSellers').then((mod) => ({ default: mod.BestSellers })),
  {
    loading: () => <SectionSkeleton />,
  }
);

export const metadata = {
  title: 'Buyora - Quality Products, Unbeatable Prices',
  description: 'Shop the latest products from top brands in Sri Lanka.',
};

function SectionSkeleton() {
  return (
    <div className="container mx-auto max-w-screen-xl px-4 py-12">
      <div className="mb-6 flex justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-2 h-4 w-24" />
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <Skeleton className="aspect-square w-full rounded-xl" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustBadges />
      <Suspense fallback={<SectionSkeleton />}>
        <CategoryGrid />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <BestSellers />
      </Suspense>
      <PromoBanner />
      <Suspense fallback={<SectionSkeleton />}>
        <NewArrivals />
      </Suspense>
      <HomeRecentlyViewed />
    </>
  );
}
