'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { parseStoredArray, useBrowserStorage } from '@/hooks/use-browser-storage';
import { productsService } from '@/services/products.service';
import { SearchSuggestion } from '@/types/search';
import { Search, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export function SearchDropdown() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[] | null>(null);
  const [storedSearches, writeSearches] = useBrowserStorage('buyora-recent-searches');
  const recentSearches = parseStoredArray<string>(storedSearches).filter(
    (s) => typeof s === 'string'
  );
  const setRecentSearches = (items: string[]) => writeSearches(JSON.stringify(items));
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    let active = true;
    const fetchSuggestions = async () => {
      if (query.trim().length < 2) {
        setSuggestions(null);
        return;
      }
      try {
        const results = await productsService.getSuggestions(query);
        if (active) setSuggestions(results);
      } catch {
        if (active) setSuggestions(null);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query]);

  const handleSearch = (q: string) => {
    if (!q.trim()) return;

    // Add to recent
    const updatedRecent = [q, ...recentSearches.filter((s) => s !== q)].slice(0, 5);
    setRecentSearches(updatedRecent);

    setIsOpen(false);
    router.push('/search?q=' + encodeURIComponent(q));
  };

  const removeRecent = (e: React.MouseEvent, s: string) => {
    e.stopPropagation();
    const updated = recentSearches.filter((item) => item !== s);
    setRecentSearches(updated);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          type="search"
          aria-label="Search products"
          placeholder="Search products..."
          className="bg-muted focus:bg-background focus:border-primary w-full rounded-full border-transparent pr-10 pl-9"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSearch(query);
            if (e.key === 'Escape') setIsOpen(false);
          }}
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2 rounded-full"
            onClick={() => {
              setQuery('');
              setSuggestions(null);
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isOpen && (query.length > 0 || recentSearches.length > 0) && (
        <div className="bg-background absolute top-full right-0 left-0 z-50 mt-2 overflow-hidden rounded-lg border shadow-xl">
          <div className="max-h-[70vh] overflow-y-auto py-2">
            {/* Empty state / Recent searches */}
            {!query && recentSearches.length > 0 && (
              <div className="px-4 py-2">
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                    Recent Searches
                  </h4>
                  <button
                    onClick={() => {
                      setRecentSearches([]);
                      localStorage.removeItem('buyora-recent-searches');
                    }}
                    className="text-muted-foreground hover:text-primary text-xs"
                  >
                    Clear All
                  </button>
                </div>
                <ul className="space-y-1">
                  {recentSearches.map((s, i) => (
                    <li
                      key={i}
                      className="group hover:bg-muted flex cursor-pointer items-center justify-between rounded-md p-2"
                      onClick={() => handleSearch(s)}
                    >
                      <span className="flex items-center text-sm">
                        <Search className="text-muted-foreground mr-2 h-3 w-3" /> {s}
                      </span>
                      <button
                        onClick={(e) => removeRecent(e, s)}
                        className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggestions */}
            {query && suggestions && (
              <>
                {(suggestions?.length || 0) > 0 ? (
                  <div className="px-2">
                    <h4 className="text-muted-foreground mt-2 mb-2 px-2 text-xs font-semibold tracking-wider uppercase">
                      Products
                    </h4>
                    <ul className="space-y-1">
                      {suggestions.map((p) => (
                        <li key={p.id}>
                          <button
                            className="hover:bg-muted flex w-full items-center rounded-md p-2 text-left transition-colors"
                            onClick={() => {
                              setIsOpen(false);
                              router.push('/product/' + p.slug);
                            }}
                          >
                            <div className="bg-muted relative mr-3 h-10 w-10 flex-shrink-0 overflow-hidden rounded">
                              <Image
                                src={p.imageUrl || '/placeholder.svg'}
                                alt={p.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <p className="truncate text-sm font-medium">{p.name}</p>
                              <p className="text-muted-foreground text-xs">
                                {p.price ? 'LKR ' + p.price : ''}
                              </p>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="text-muted-foreground p-4 text-center text-sm">
                    No results found for &quot;{query}&quot;
                  </div>
                )}

                {suggestions.length > 0 && (
                  <div className="bg-muted/30 mt-2 border-t p-2">
                    <button
                      className="text-primary w-full py-1 text-center text-sm font-medium hover:underline"
                      onClick={() => handleSearch(query)}
                    >
                      See all results for &quot;{query}&quot;
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
