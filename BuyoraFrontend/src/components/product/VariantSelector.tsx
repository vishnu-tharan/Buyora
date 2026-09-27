'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Product, ProductVariant } from '@/types';
import { useCallback } from 'react';

interface VariantSelectorProps {
  product: Product;
  selectedAttributes: Record<string, string>;
  onAttributesChange: (attributes: Record<string, string>) => void;
  onVariantChange: (variant: ProductVariant | null) => void;
}

export function VariantSelector({
  product,
  selectedAttributes,
  onAttributesChange,
  onVariantChange,
}: VariantSelectorProps) {
  // Check if a specific attribute combination exists in available variants
  const isCombinationAvailable = useCallback(
    (attrKey: string, attrValue: string) => {
      // If testing one, we should see if there is ANY variant that matches current selections PLUS this new one
      const testAttributes = { ...selectedAttributes, [attrKey]: attrValue };

      return product.variants.some((variant) => {
        // Check if all test attributes match this variant
        return Object.entries(testAttributes).every(([k, v]) => variant.attributes[k] === v);
      });
    },
    [product.variants, selectedAttributes]
  );

  const handleSelect = (attributeSlug: string, value: string) => {
    const newAttributes = { ...selectedAttributes };

    if (newAttributes[attributeSlug] === value) {
      delete newAttributes[attributeSlug];
    } else {
      newAttributes[attributeSlug] = value;

      // Clear downstream selections that might now be invalid
      const attrKeys = product.attributes.map((a) => a.slug);
      const currentIndex = attrKeys.indexOf(attributeSlug);

      if (currentIndex !== -1) {
        for (let i = currentIndex + 1; i < attrKeys.length; i++) {
          const key = attrKeys[i];
          if (newAttributes[key]) {
            // Check if still valid
            const isValid = product.variants.some((v) => {
              return Object.entries(newAttributes).every(([k, val]) => v.attributes[k] === val);
            });
            if (!isValid) {
              delete newAttributes[key];
            }
          }
        }
      }
    }

    onAttributesChange(newAttributes);

    // Find if we have a full match
    if (Object.keys(newAttributes).length === product.attributes.length) {
      const matched = product.variants.find((v) =>
        Object.entries(newAttributes).every(([k, val]) => v.attributes[k] === val)
      );
      onVariantChange(matched || null);
    } else {
      onVariantChange(null);
    }
  };

  if (product.attributes.length === 0) return null;

  return (
    <div className="space-y-6">
      {product.attributes.map((attribute) => (
        <div key={attribute.id} className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">
              {attribute.name}:{' '}
              <span className="text-muted-foreground">
                {selectedAttributes[attribute.slug] || 'Select'}
              </span>
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {attribute.values.map((val) => {
              const isSelected = selectedAttributes[attribute.slug] === val.value;
              const isAvailable = isCombinationAvailable(attribute.slug, val.value);
              const isColor = attribute.slug.toLowerCase() === 'color' && val.colorCode;

              return (
                <Button
                  key={val.id}
                  variant="outline"
                  type="button"
                  onClick={() => handleSelect(attribute.slug, val.value)}
                  disabled={!isAvailable}
                  className={cn(
                    'relative overflow-hidden transition-all duration-200',
                    isColor
                      ? 'flex h-10 w-10 items-center justify-center rounded-full border-2 p-0'
                      : 'h-10 rounded-md px-4',
                    isSelected && isColor ? 'border-primary' : 'border-border',
                    isSelected && !isColor
                      ? 'border-primary bg-primary/5 text-primary font-semibold'
                      : 'text-muted-foreground hover:text-foreground',
                    !isAvailable && 'cursor-not-allowed opacity-50 grayscale'
                  )}
                  style={isColor ? { backgroundColor: val.colorCode } : {}}
                  title={isAvailable ? undefined : `Unavailable combination`}
                >
                  {!isColor && val.value}
                  {!isAvailable && !isColor && (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <div className="bg-muted-foreground/50 absolute top-1/2 left-0 -mt-px h-px w-full origin-center rotate-45 transform"></div>
                    </div>
                  )}
                </Button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
