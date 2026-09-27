import { RECENTLY_VIEWED } from '@/constants';
import type { ProductSummary } from '@/types';
import { useMemo } from 'react';
import { parseStoredArray, useBrowserStorage } from './use-browser-storage';

type RecentlyViewedProduct = Pick<
  ProductSummary,
  'id' | 'name' | 'slug' | 'primaryImage' | 'basePrice' | 'salePrice'
>;

export function useRecentlyViewed() {
  const [stored, write] = useBrowserStorage(RECENTLY_VIEWED.STORAGE_KEY);
  const items = useMemo(() => parseStoredArray<RecentlyViewedProduct>(stored), [stored]);
  const addItem = (product: RecentlyViewedProduct) => {
    write(
      JSON.stringify(
        [product, ...items.filter((p) => p.id !== product.id)].slice(0, RECENTLY_VIEWED.MAX_ITEMS)
      )
    );
  };
  return { items, addItem };
}
