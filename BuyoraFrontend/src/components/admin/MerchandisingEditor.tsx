'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { adminService } from '@/services/admin.service';
import { getErrorDetails } from '@/lib/api/errors';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ImagePlus, Layers3, Plus, Trash2, Save } from 'lucide-react';
import type { Product } from '@/types';
import Image from 'next/image';
type Variant = {
  id?: number;
  sku: string;
  price: number;
  compareAtPrice?: number;
  active: boolean;
  attributes: Record<string, string>;
};
export function MerchandisingEditor({ product }: { product: Product }) {
  const queryClient = useQueryClient();
  const [variants, setVariants] = useState<Variant[]>(
    product.variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      price: v.price,
      compareAtPrice: v.compareAtPrice,
      active: v.isActive,
      attributes: v.attributes,
    }))
  );
  const [images, setImages] = useState(
    product.images.map((i) => ({ url: i.url, altText: i.altText ?? '', variantId: i.variantId }))
  );
  const [videoUrl, setVideoUrl] = useState(product.videoUrl ?? '');
  const video = useMutation({
    mutationFn: async (file: File) => {
      const body = new FormData();
      body.append('file', file);
      return api.post<{ url: string }>('/admin/uploads/video', body);
    },
    onSuccess: (r) => {
      setVideoUrl(r.url);
      setMessage('Video uploaded. Save presentation to publish it.');
    },
    onError: (e) => setMessage(getErrorDetails(e).message),
  });
  const [specs, setSpecs] = useState(JSON.stringify(product.specifications ?? {}, null, 2));
  const [flags, setFlags] = useState({
    featured: product.isFeatured,
    newArrival: product.isNewArrival,
    bestSeller: product.isBestSeller,
  });
  const [selected, setSelected] = useState<number[] | null>(null);
  const [message, setMessage] = useState('');
  const complements = useQuery({
    queryKey: ['admin-complements', product.id],
    queryFn: () => api.get<number[]>('/admin/products/' + product.id + '/complements'),
  });
  const catalog = useQuery({
    queryKey: ['admin-complement-options'],
    queryFn: () => adminService.getProducts({ size: 100 }),
  });
  const save = useMutation({
    mutationFn: () =>
      api.put<Product>('/admin/products/' + product.id + '/merchandising', {
        variants,
        images,
        specifications: JSON.parse(specs),
        ...flags,
        videoUrl,
        complementIds: selected ?? complements.data ?? [],
      }),
    onSuccess: (saved) => {
      setVariants(
        saved.variants.map((v) => ({
          id: v.id,
          sku: v.sku,
          price: v.price,
          compareAtPrice: v.compareAtPrice,
          active: v.isActive,
          attributes: v.attributes,
        }))
      );
      queryClient.setQueryData(['adminProduct', product.id], saved);
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      setMessage('Product options, images, and specifications saved.');
    },
    onError: (e) => setMessage(getErrorDetails(e).message),
  });
  const upload = useMutation({
    mutationFn: async (file: File) => {
      if (images.length >= 20) throw new Error('Up to 20 images per product');
      return adminService.uploadImage(file);
    },
    onSuccess: (data) =>
      setImages((prev) => [
        ...prev,
        { url: data.url, altText: product.name, variantId: undefined },
      ]),
    onError: (e) => setMessage(getErrorDetails(e).message),
  });
  const edit = (i: number, patch: Partial<Variant>) =>
    setVariants((v) => v.map((a, n) => (n === i ? { ...a, ...patch } : a)));
  return (
    <section className="bg-card mt-6 max-w-5xl space-y-6 rounded-2xl border p-6">
      <h2 className="flex items-center gap-3 text-xl font-semibold">
        <Layers3 size={23} aria-hidden="true" />
        Product options & presentation
      </h2>
      <p className="text-muted-foreground text-sm">
        Stock is managed separately in Inventory. Removing a variant archives it and preserves order
        records.
      </p>
      <div className="space-y-4">
        {variants.map((v, i) => (
          <fieldset key={v.id ?? 'new-' + i} className="rounded-xl border p-4">
            <legend className="px-2 text-sm font-semibold">Variant {i + 1}</legend>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="text-xs">
                SKU
                <Input
                  aria-label={'Variant ' + (i + 1) + ' SKU'}
                  value={v.sku}
                  maxLength={100}
                  onChange={(e) => edit(i, { sku: e.target.value })}
                />
              </label>
              <label className="text-xs">
                Price (LKR)
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={v.price}
                  onChange={(e) => edit(i, { price: Number(e.target.value) })}
                />
              </label>
              <label className="text-xs">
                Original price (optional)
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={v.compareAtPrice ?? ''}
                  onChange={(e) =>
                    edit(i, { compareAtPrice: e.target.value ? Number(e.target.value) : undefined })
                  }
                />
              </label>
            </div>
            <label className="mt-3 block text-xs">
              Attributes (name=value, one per line)
              <textarea
                className="mt-1 min-h-20 w-full rounded-lg border p-2 font-mono"
                defaultValue={Object.entries(v.attributes)
                  .map(([k, val]) => k + '=' + val)
                  .join('\n')}
                onBlur={(e) =>
                  edit(i, {
                    attributes: Object.fromEntries(
                      e.target.value
                        .split('\n')
                        .filter((x) => x.includes('='))
                        .map((x) => {
                          const at = x.indexOf('=');
                          return [x.slice(0, at).trim(), x.slice(at + 1).trim()];
                        })
                    ),
                  })
                }
                placeholder={'Color=Black\nSize=M'}
              />
            </label>
            <div className="mt-3 flex justify-between">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={v.active}
                  onChange={(e) => edit(i, { active: e.target.checked })}
                />
                Active
              </label>
              <button
                type="button"
                aria-label={'Archive variant ' + v.sku}
                onClick={() => setVariants((vs) => vs.filter((_, n) => n !== i))}
                className="text-destructive p-2"
              >
                <Trash2 size={17} />
              </button>
            </div>
          </fieldset>
        ))}
      </div>
      <Button
        variant="outline"
        type="button"
        disabled={variants.length >= 50}
        onClick={() =>
          setVariants((v) => [...v, { sku: '', price: 0, active: true, attributes: {} }])
        }
      >
        <Plus size={16} />
        Add variant
      </Button>
      <div>
        <h3 className="mb-3 font-semibold">Product images</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {images.map((img, i) => (
            <div key={img.url + '-' + i} className="rounded-xl border p-2">
              <div className="relative h-32">
                <Image
                  src={img.url}
                  alt={img.altText}
                  fill
                  sizes="200px"
                  className="object-contain"
                  unoptimized
                />
              </div>
              <Input
                aria-label={'Image ' + (i + 1) + ' description'}
                value={img.altText}
                maxLength={255}
                onChange={(e) =>
                  setImages((v) =>
                    v.map((a, n) => (n === i ? { ...a, altText: e.target.value } : a))
                  )
                }
              />
              <select
                aria-label={'Image ' + (i + 1) + ' variant'}
                className="mt-2 min-h-9 w-full rounded-lg border px-2 text-xs"
                value={img.variantId ?? ''}
                onChange={(e) =>
                  setImages((v) =>
                    v.map((a, n) =>
                      n === i
                        ? { ...a, variantId: e.target.value ? Number(e.target.value) : undefined }
                        : a
                    )
                  )
                }
              >
                <option value="">All options</option>
                {variants
                  .filter((v) => v.id)
                  .map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.sku}
                    </option>
                  ))}
              </select>
              <div className="mt-2 flex justify-between text-xs">
                <button
                  onClick={() => setImages((v) => [v[i], ...v.filter((_, n) => n !== i)])}
                  type="button"
                >
                  {i === 0 ? 'Primary' : 'Make primary'}
                </button>
                <button
                  onClick={() => setImages((v) => v.filter((_, n) => n !== i))}
                  type="button"
                  aria-label={'Remove image ' + (i + 1)}
                  className="text-destructive p-2"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
        <label className="mt-4 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border px-4 text-sm">
          <ImagePlus size={18} aria-hidden="true" />
          {upload.isPending ? 'Uploading…' : 'Upload image'}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            disabled={upload.isPending}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) upload.mutate(f);
              e.target.value = '';
            }}
          />
        </label>
        <p className="text-muted-foreground mt-2 text-xs">
          PNG, JPEG, or WebP · up to 5 MB · first image is primary
        </p>
      </div>
      <div>
        <h3 className="mb-2 font-semibold">Product demonstration</h3>
        {videoUrl && (
          <div className="mb-3 flex items-center gap-3">
            <span className="text-muted-foreground text-xs">Video ready</span>
            <button
              type="button"
              onClick={() => setVideoUrl('')}
              className="text-destructive text-xs"
            >
              Remove video
            </button>
          </div>
        )}
        <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border px-4 text-sm">
          {video.isPending ? 'Uploading video…' : 'Upload MP4 demonstration'}
          <input
            type="file"
            accept="video/mp4"
            className="sr-only"
            disabled={video.isPending}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) video.mutate(file);
              e.target.value = '';
            }}
          />
        </label>
        <p className="text-muted-foreground mt-2 text-xs">
          MP4 · up to 20 MB. Use a clear visual demonstration; add visible captions for speech.
        </p>
      </div>
      <label className="block text-sm font-medium">
        Specifications (JSON object)
        <textarea
          value={specs}
          onChange={(e) => setSpecs(e.target.value)}
          className="mt-2 min-h-32 w-full rounded-xl border p-3 font-mono text-xs"
        />
      </label>
      <div className="flex flex-wrap gap-5">
        {(['featured', 'newArrival', 'bestSeller'] as const).map((flag) => (
          <label key={flag} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={flags[flag]}
              onChange={(e) => setFlags((f) => ({ ...f, [flag]: e.target.checked }))}
            />
            {flag === 'featured'
              ? 'Featured'
              : flag === 'newArrival'
                ? 'New arrival'
                : 'Best seller'}
          </label>
        ))}
      </div>
      <div>
        <h3 className="mb-3 font-semibold">Complementary products (up to four)</h3>
        <p className="text-muted-foreground mb-2 text-xs">
          Choose products that actually work together. These appear as an optional bundle on the
          product page.
        </p>
        <div className="max-h-44 space-y-2 overflow-y-auto rounded-xl border p-3">
          {catalog.data?.content
            .filter((p) => p.id !== product.id)
            .map((p) => {
              const ids = selected ?? complements.data ?? [];
              return (
                <label key={p.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={ids.includes(p.id)}
                    disabled={!ids.includes(p.id) && ids.length >= 4}
                    onChange={() =>
                      setSelected(
                        ids.includes(p.id) ? ids.filter((id) => id !== p.id) : [...ids, p.id]
                      )
                    }
                  />
                  {p.name}
                </label>
              );
            })}
        </div>
      </div>
      <p role="status" className="text-sm">
        {message}
      </p>
      <Button
        type="button"
        disabled={save.isPending || upload.isPending || video.isPending || complements.isPending}
        onClick={() => {
          try {
            const parsed: unknown = JSON.parse(specs);
            if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') throw new Error();
            save.mutate();
          } catch {
            setMessage('Specifications must be a valid JSON object.');
          }
        }}
      >
        <Save size={16} />
        {save.isPending ? 'Saving…' : 'Save presentation'}
      </Button>
    </section>
  );
}
