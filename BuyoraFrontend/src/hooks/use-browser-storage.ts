import { useCallback, useSyncExternalStore } from 'react';
export function useBrowserStorage(key: string, session = false) {
  const read = useCallback(() => {
    try {
      return (session ? sessionStorage : localStorage).getItem(key);
    } catch {
      return null;
    }
  }, [key, session]);
  const subscribe = useCallback((notify: () => void) => {
    window.addEventListener('storage', notify);
    window.addEventListener('buyora-storage', notify);
    return () => {
      window.removeEventListener('storage', notify);
      window.removeEventListener('buyora-storage', notify);
    };
  }, []);
  const value = useSyncExternalStore(subscribe, read, () => null);
  const write = useCallback(
    (value: string) => {
      try {
        (session ? sessionStorage : localStorage).setItem(key, value);
        window.dispatchEvent(new Event('buyora-storage'));
      } catch {
        /* Storage may be disabled by the browser. */
      }
    },
    [key, session]
  );
  return [value, write] as const;
}
export function parseStoredArray<T>(value: string | null): T[] {
  try {
    const parsed: unknown = JSON.parse(value ?? '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
