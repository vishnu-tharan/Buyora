import { ComparePage } from '@/components/product/ComparePage';
export const metadata = { title: 'Compare products' };
export default async function Page({ searchParams }: { searchParams: Promise<{ ids?: string }> }) {
  const { ids } = await searchParams;
  return (
    <ComparePage
      sharedIds={ids
        ?.split(',')
        .map(Number)
        .filter((id) => Number.isSafeInteger(id) && id > 0)
        .slice(0, 4)}
    />
  );
}
