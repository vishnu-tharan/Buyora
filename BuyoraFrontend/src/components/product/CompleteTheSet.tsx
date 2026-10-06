'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '@/lib/api/client';
import { useCartStore } from '@/stores/cart.store';
import { formatCurrency } from '@/lib/formatting/currency';
import { getErrorDetails } from '@/lib/api/errors';
import { Button } from '@/components/ui/button';
import { Plus, PackagePlus } from 'lucide-react';
import type { ProductSummary, Cart, ProductVariant } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
export function CompleteTheSet({
  slug,
  currentVariant,
}: {
  slug: string;
  currentVariant: ProductVariant | null;
}) {
  const query = useQuery({
    queryKey: ['complements', slug],
    queryFn: () =>
      api.get<ProductSummary[]>('/products/' + encodeURIComponent(slug) + '/complements'),
  });
  const [chosen, setChosen] = useState<Record<number, number>>({});
  const client = useQueryClient();
  const add = useMutation({
    mutationFn: () =>
      api.post<Cart>('/cart/bundle', {
        items: [
          { variantId: currentVariant!.id, quantity: 1 },
          ...Object.values(chosen)
            .filter(Boolean)
            .map((variantId) => ({ variantId, quantity: 1 })),
        ],
      }),
    onSuccess: (cart) => {
      useCartStore.getState().setCart(cart);
      client.setQueryData(['cart'], cart);
      useCartStore.getState().openCart();
    },
  });
  if (!query.data?.length) return null;
  const selected = query.data.flatMap((p) => {
    const v = p.variants.find((v) => v.id === chosen[p.id]);
    return v ? [v] : [];
  });
  return (
    <section className="mt-8 rounded-3xl border bg-[#e8eff0]/50 p-5 md:p-8">
      <h2 className="font-display mb-2 flex items-center gap-3 text-2xl font-semibold">
        <PackagePlus size={26} strokeWidth={1.5} aria-hidden="true" />
        Better together.
      </h2>
      <p className="text-muted-foreground mb-6 text-sm">
        Complementary picks selected by the store. Add what works for you.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {query.data.map((p) => (
          <div key={p.id} className="bg-card rounded-2xl border p-4">
            {p.primaryImage && (
              <div className="relative mb-4 aspect-square">
                <Image
                  src={p.primaryImage.url}
                  alt=""
                  fill
                  sizes="240px"
                  className="object-contain"
                />
              </div>
            )}
            <Link href={'/product/' + p.slug} className="text-sm font-semibold">
              {p.name}
            </Link>
            <label className="text-muted-foreground mt-3 block text-xs">
              Add an option
              <select
                value={chosen[p.id] ?? ''}
                onChange={(e) => setChosen((v) => ({ ...v, [p.id]: Number(e.target.value) }))}
                className="bg-card mt-1 min-h-11 w-full rounded-lg border px-2 text-xs"
              >
                <option value="">Don’t include</option>
                {p.variants
                  .filter((v) => v.availableQuantity > 0)
                  .map((v) => (
                    <option key={v.id} value={v.id}>
                      {Object.values(v.attributes).join(' / ') || v.sku} · {formatCurrency(v.price)}
                    </option>
                  ))}
              </select>
            </label>
          </div>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm">
          {currentVariant && selected.length > 0
            ? `Your product + ${selected.length} extra(s): ${formatCurrency(currentVariant.price + selected.reduce((n, v) => n + v.price, 0))}`
            : 'Choose options to build your set.'}
        </p>
        <Button
          onClick={() => add.mutate()}
          disabled={
            !currentVariant ||
            currentVariant.availableQuantity < 1 ||
            !selected.length ||
            add.isPending
          }
        >
          <Plus size={16} />
          {add.isPending ? 'Adding…' : 'Add selected set'}
        </Button>
      </div>
      {add.isError && (
        <p role="alert" className="text-destructive mt-3 text-sm">
          {getErrorDetails(add.error).message}
        </p>
      )}
    </section>
  );
}
