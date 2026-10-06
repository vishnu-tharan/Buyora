'use client';
import { parseStoredArray, useBrowserStorage } from '@/hooks/use-browser-storage';
export function useCompare() {
  const [stored, write] = useBrowserStorage('buyora-compare');
  const ids = parseStoredArray<number>(stored)
    .filter((id) => Number.isSafeInteger(id) && id > 0)
    .slice(0, 4);
  return {
    ids,
    toggle(id: number) {
      if (ids.includes(id)) write(JSON.stringify(ids.filter((x) => x !== id)));
      else if (ids.length < 4) write(JSON.stringify([...ids, id]));
    },
    clear() {
      write('[]');
    },
  };
}
