'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { adminService } from '@/services/admin.service';
import { getErrorDetails } from '@/lib/api-errors';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ImagePlus, Layers3, Plus, Trash2, Save } from 'lucide-react';
import Image from 'next/image';
// Product options and specifications use one Name=Value entry per line.
function readSpecifications(text) {
  const entries = [];
  for (const line of text.split('\n')) {
    if (!line.trim()) continue;
    const separator = line.indexOf('=');
    if (separator < 1 || !line.slice(separator + 1).trim()) {
      throw new Error('Use one Name=Value specification per line.');
    }
    const name = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();
    entries.push([name, value]);
  }
  return Object.fromEntries(entries);
}

function readVariantAttributes(text) {
  const entries = [];
  for (const line of text.split('\n')) {
    const separator = line.indexOf('=');
    if (separator < 0) continue;
    entries.push([line.slice(0, separator).trim(), line.slice(separator + 1).trim()]);
  }
  return Object.fromEntries(entries);
}

function toEditableVariant(variant) {
  return {
    id: variant.id,
    sku: variant.sku,
    price: variant.price,
    compareAtPrice: variant.compareAtPrice,
    active: variant.isActive,
    attributes: variant.attributes,
  };
}

export function ProductDetailsEditor({ product }) {
  const queryClient = useQueryClient();
  const [variants, setVariants] = useState(product.variants.map(toEditableVariant));
  const [images, setImages] = useState(
    product.images.map((image) => ({
      url: image.url,
      altText: image.altText ?? '',
      variantId: image.variantId,
    })),
  );
  const [specs, setSpecs] = useState(
    Object.entries(product.specifications ?? {})
      .map(([key, value]) => key + '=' + value)
      .join('\n'),
  );
  const [flags, setFlags] = useState({
    featured: product.isFeatured,
    newArrival: product.isNewArrival,
    bestSeller: product.isBestSeller,
  });
  const [message, setMessage] = useState('');
  const save = useMutation({
    mutationFn: () =>
      api.put('/admin/products/' + product.id + '/details', {
        variants,
        images,
        specifications: readSpecifications(specs),
        ...flags,
      }),
    onSuccess: (saved) => {
      setVariants(saved.variants.map(toEditableVariant));
      queryClient.setQueryData(['adminProduct', product.id], saved);
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      setMessage('Product options, images, and specifications saved.');
    },
    onError: (error) => setMessage(getErrorDetails(error).message),
  });
  const upload = useMutation({
    mutationFn: async (file) => {
      if (images.length >= 20) throw new Error('Up to 20 images per product');
      return adminService.uploadImage(file);
    },
    onSuccess: (data) =>
      setImages((prev) => [
        ...prev,
        { url: data.url, altText: product.name, variantId: undefined },
      ]),
    onError: (error) => setMessage(getErrorDetails(error).message),
  });
  function updateVariant(variantIndex, changes) {
    setVariants((currentVariants) =>
      currentVariants.map((variant, index) => {
        if (index === variantIndex) return { ...variant, ...changes };
        return variant;
      }),
    );
  }

  function updateImage(imageIndex, changes) {
    setImages((currentImages) =>
      currentImages.map((image, index) => {
        if (index === imageIndex) return { ...image, ...changes };
        return image;
      }),
    );
  }

  function makePrimaryImage(imageIndex) {
    setImages((currentImages) => {
      const primaryImage = currentImages[imageIndex];
      const otherImages = currentImages.filter((_, index) => index !== imageIndex);
      return [primaryImage, ...otherImages];
    });
  }

  return (
    <section className="bg-card mt-6 max-w-5xl space-y-6 rounded-2xl border p-6">
      <h2 className="flex items-center gap-3 text-xl font-semibold">
        <Layers3 size={23} aria-hidden="true" />
        Product options and images
      </h2>
      <p className="text-muted-foreground text-sm">
        Stock is managed separately in Inventory. Removing a variant archives it and preserves order
        records.
      </p>
      <div className="space-y-4">
        {variants.map((variant, variantIndex) => (
          <fieldset key={variant.id ?? 'new-' + variantIndex} className="rounded-xl border p-4">
            <legend className="px-2 text-sm font-semibold">Variant {variantIndex + 1}</legend>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="text-xs">
                SKU
                <Input
                  aria-label={'Variant ' + (variantIndex + 1) + ' SKU'}
                  value={variant.sku}
                  maxLength={100}
                  onChange={(e) => updateVariant(variantIndex, { sku: e.target.value })}
                />
              </label>
              <label className="text-xs">
                Price (LKR)
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={variant.price}
                  onChange={(e) => updateVariant(variantIndex, { price: Number(e.target.value) })}
                />
              </label>
              <label className="text-xs">
                Original price (optional)
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={variant.compareAtPrice ?? ''}
                  onChange={(e) =>
                    updateVariant(variantIndex, {
                      compareAtPrice: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                />
              </label>
            </div>
            <label className="mt-3 block text-xs">
              Attributes (name=value, one per line)
              <textarea
                className="mt-1 min-h-20 w-full rounded-lg border p-2 font-mono"
                defaultValue={Object.entries(variant.attributes)
                  .map(([k, val]) => k + '=' + val)
                  .join('\n')}
                onBlur={(e) =>
                  updateVariant(variantIndex, {
                    attributes: readVariantAttributes(e.target.value),
                  })
                }
                placeholder={'Color=Black\nSize=M'}
              />
            </label>
            <div className="mt-3 flex justify-between">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={variant.active}
                  onChange={(e) => updateVariant(variantIndex, { active: e.target.checked })}
                />
                Active
              </label>
              <button
                type="button"
                aria-label={'Archive variant ' + variant.sku}
                onClick={() =>
                  setVariants((currentVariants) =>
                    currentVariants.filter((_, index) => index !== variantIndex),
                  )
                }
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
          {images.map((image, imageIndex) => (
            <div key={image.url + '-' + imageIndex} className="rounded-xl border p-2">
              <div className="relative h-32">
                <Image
                  src={image.url}
                  alt={image.altText}
                  fill
                  sizes="200px"
                  className="object-contain"
                  unoptimized
                />
              </div>
              <Input
                aria-label={'Image ' + (imageIndex + 1) + ' description'}
                value={image.altText}
                maxLength={255}
                onChange={(e) => updateImage(imageIndex, { altText: e.target.value })}
              />
              <select
                aria-label={'Image ' + (imageIndex + 1) + ' variant'}
                className="mt-2 min-h-9 w-full rounded-lg border px-2 text-xs"
                value={image.variantId ?? ''}
                onChange={(e) =>
                  updateImage(imageIndex, {
                    variantId: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              >
                <option value="">All options</option>
                {variants
                  .filter((variant) => variant.id)
                  .map((variant) => (
                    <option key={variant.id} value={variant.id}>
                      {variant.sku}
                    </option>
                  ))}
              </select>
              <div className="mt-2 flex justify-between text-xs">
                <button onClick={() => makePrimaryImage(imageIndex)} type="button">
                  {imageIndex === 0 ? 'Primary' : 'Make primary'}
                </button>
                <button
                  onClick={() =>
                    setImages((currentImages) =>
                      currentImages.filter((_, index) => index !== imageIndex),
                    )
                  }
                  type="button"
                  aria-label={'Remove image ' + (imageIndex + 1)}
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
              const file = e.target.files?.[0];
              if (file) upload.mutate(file);
              e.target.value = '';
            }}
          />
        </label>
        <p className="text-muted-foreground mt-2 text-xs">
          PNG, JPEG, or WebP · up to 5 MB · first image is primary
        </p>
      </div>
      <label className="block text-sm font-medium">
        Specifications (one Name=Value per line)
        <textarea
          value={specs}
          onChange={(e) => setSpecs(e.target.value)}
          className="mt-2 min-h-32 w-full rounded-xl border p-3 font-mono text-xs"
        />
      </label>
      <div className="flex flex-wrap gap-5">
        {['featured', 'newArrival', 'bestSeller'].map((flag) => (
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
      <p role="status" className="text-sm">
        {message}
      </p>
      <Button
        type="button"
        disabled={save.isPending || upload.isPending}
        onClick={() => save.mutate()}
      >
        <Save size={16} />
        {save.isPending ? 'Saving…' : 'Save product details'}
      </Button>
    </section>
  );
}
