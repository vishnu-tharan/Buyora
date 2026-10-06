'use client';
import { useQueries } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { useCompare } from '@/hooks/use-compare';
import { formatCurrency } from '@/lib/formatting/currency';
import type { Product } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import { Columns3, Share2, X, ArrowUpRight } from 'lucide-react';
import { useState } from 'react';
export function ComparePage({ sharedIds }: { sharedIds?: number[] }) {
  const compare = useCompare();
  const ids = sharedIds?.length ? sharedIds : compare.ids;
  const queries = useQueries({
    queries: ids.map((id) => ({
      queryKey: ['compare', id],
      queryFn: () => api.get<Product>('/products/by-id/' + id),
      retry: false,
    })),
  });
  const [message, setMessage] = useState('');
  const products = queries.map((q) => q.data);
  const specs = [...new Set(products.flatMap((p) => Object.keys(p?.specifications ?? {})))];
  async function share() {
    const url = new URL('/compare', window.location.origin);
    url.searchParams.set('ids', ids.join(','));
    try {
      if (navigator.share)
        await navigator.share({ title: 'Compare on Buyora', url: url.toString() });
      else {
        await navigator.clipboard.writeText(url.toString());
        setMessage('Comparison link copied.');
      }
    } catch {
      setMessage('Sharing was cancelled or unavailable.');
    }
  }
  return (
    <div className="container mx-auto max-w-screen-xl px-4 py-10">
      <div className="mb-8 flex flex-wrap justify-between gap-4">
        <div>
          <Columns3 className="text-primary mb-3" size={32} strokeWidth={1.5} aria-hidden="true" />
          <h1 className="font-display text-3xl font-semibold">Find your perfect fit.</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Compare up to four products, side by side.
          </p>
        </div>
        {ids.length > 0 && (
          <button
            onClick={share}
            className="inline-flex h-11 items-center gap-2 rounded-full border px-5 text-sm"
          >
            <Share2 size={16} aria-hidden="true" />
            Share comparison
          </button>
        )}
      </div>
      <p role="status" className="mb-3 text-sm">
        {message}
      </p>
      {!ids.length ? (
        <div className="bg-muted rounded-3xl p-10 text-center">
          <p>Select Compare on a product to start.</p>
          <Link
            href="/categories"
            className="text-primary mt-4 inline-flex items-center gap-2 font-semibold"
          >
            Explore products <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </div>
      ) : (
        <div className="bg-card overflow-x-auto rounded-2xl border">
          <table className="w-full min-w-[640px] text-left text-sm">
            <caption className="sr-only">Product comparison</caption>
            <thead>
              <tr>
                <th className="w-36 p-5">Product</th>
                {ids.map((id, i) => (
                  <th key={id} className="min-w-48 p-5 align-top">
                    {queries[i].isLoading ? (
                      'Loading…'
                    ) : !products[i] ? (
                      'Product unavailable'
                    ) : (
                      <div>
                        {products[i]!.images[0] && (
                          <div className="relative mb-4 h-40">
                            <Image
                              src={products[i]!.images[0].url}
                              alt=""
                              fill
                              sizes="240px"
                              className="object-contain"
                            />
                          </div>
                        )}
                        <Link
                          href={'/product/' + products[i]!.slug}
                          className="font-semibold hover:underline"
                        >
                          {products[i]!.name}
                        </Link>
                        {!sharedIds?.length && (
                          <button
                            className="hover:bg-muted ml-2 rounded p-2"
                            aria-label={'Remove ' + products[i]!.name}
                            onClick={() => compare.toggle(id)}
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['Price', ...products.map((p) => (p ? formatCurrency(p.basePrice) : '—'))],
                [
                  'Availability',
                  ...products.map((p) =>
                    p
                      ? p.variants.some((v) => v.availableQuantity > 0)
                        ? 'In stock'
                        : 'Out of stock'
                      : '—'
                  ),
                ],
                ['Brand', ...products.map((p) => p?.brand?.name ?? '—')],
                [
                  'Rating',
                  ...products.map((p) =>
                    p?.reviewCount
                      ? `${p.averageRating}/5 (${p.reviewCount} reviews)`
                      : 'No reviews yet'
                  ),
                ],
                ...specs.map((key) => [
                  key,
                  ...products.map((p) => p?.specifications?.[key] ?? '—'),
                ]),
              ].map((row) => (
                <tr key={row[0]} className="odd:bg-muted/40 border-t">
                  <th className="p-5 font-medium">{row[0]}</th>
                  {row.slice(1).map((cell, i) => (
                    <td key={ids[i]} className="p-5">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
