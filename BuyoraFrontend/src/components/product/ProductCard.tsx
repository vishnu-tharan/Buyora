'use client';

import { CompareButton } from './CompareButton';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { StarRating } from '@/components/ui/StarRating';
import { Button } from '@/components/ui/button';
import { useAddToCart } from '@/features/cart/use-cart-query';
import { useToggleWishlist, useWishlistQuery } from '@/features/wishlist/use-wishlist-query';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useWishlistStore } from '@/stores/wishlist.store';
import { ProductSummary } from '@/types/product';
import { Heart, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ProductCardProps {
  product: ProductSummary;
  showWishlist?: boolean;
  priority?: boolean;
}

export function ProductCard({ product, showWishlist = true, priority = false }: ProductCardProps) {
  const { localWishlist } = useWishlistStore();
  const addCart = useAddToCart();
  const router = useRouter();
  const { toast } = useToast();

  const { user } = useAuth();
  const { data: wishlist } = useWishlistQuery();
  const toggleWishlist = useToggleWishlist();
  const isWishlisted = user
    ? !!wishlist?.items.some((i) => i.product.id === product.id)
    : localWishlist.includes(product.id);
  const lowestVariant = product.variants.reduce<(typeof product.variants)[number] | undefined>(
    (lowest, variant) => (!lowest || variant.price < lowest.price ? variant : lowest),
    undefined
  );
  const price = lowestVariant?.price ?? product.salePrice ?? product.basePrice;
  const originalPrice =
    lowestVariant?.compareAtPrice ?? (product.salePrice ? product.basePrice : undefined);
  const discountPercent =
    originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;

  const isOutOfStock = !product.variants?.some((v) => v.availableQuantity > 0);

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleWishlist.mutate(product.id, {
      onError: () => toast.add({ title: 'Unable to update wishlist', type: 'error' }),
    });
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isOutOfStock) {
      if (product.variants.length !== 1) {
        router.push('/product/' + encodeURIComponent(product.slug));
        return;
      }
      addCart.mutate(
        { productId: product.id, variantId: product.variants[0].id, quantity: 1 },
        { onError: () => toast.add({ title: 'Could not add item to cart', type: 'error' }) }
      );
    }
  };

  return (
    <article className="group bg-card text-card-foreground border-primary/10 relative flex flex-col overflow-hidden rounded-2xl border shadow-none transition-all hover:-translate-y-1 hover:shadow-lg">
      <div className="flex h-full flex-col">
        {/* Image Container */}
        <div className="bg-muted relative aspect-square overflow-hidden">
          <Link
            href={`/product/${product.slug}`}
            aria-label={product.name}
            className="absolute inset-0"
          >
            <Image
              src={product.primaryImage?.url || '/placeholder.svg'}
              alt={product.primaryImage?.altText || product.name}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              preload={priority}
              className="object-contain p-3 transition-transform duration-300 group-hover:scale-105"
            />
          </Link>

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discountPercent > 0 && (
              <span className="bg-primary text-primary-foreground rounded-full px-2 py-1 text-xs font-semibold">
                -{discountPercent}% OFF
              </span>
            )}
          </div>

          {isOutOfStock && (
            <div className="bg-background/60 pointer-events-none absolute inset-0 flex items-center justify-center backdrop-blur-[1px]">
              <span className="bg-background rounded-md px-3 py-1.5 text-sm font-semibold">
                Out of Stock
              </span>
            </div>
          )}

          {/* Wishlist Button */}
          {showWishlist && (
            <button
              disabled={toggleWishlist.isPending}
              onClick={handleWishlist}
              className="bg-background/80 text-muted-foreground hover:bg-background hover:text-primary focus-visible:ring-ring absolute top-2 right-2 z-10 rounded-full p-2 backdrop-blur-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart className={isWishlisted ? 'fill-primary text-primary h-4 w-4' : 'h-4 w-4'} />
            </button>
          )}

          {/* Add to Cart Overlay (Desktop) */}
          <div className="absolute right-0 bottom-0 left-0 hidden translate-y-full p-3 opacity-0 transition-all duration-300 group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 md:block">
            <Button
              className="w-full shadow-lg"
              variant="default"
              onClick={handleAddToCart}
              disabled={isOutOfStock || addCart.isPending}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              {isOutOfStock
                ? 'Out of Stock'
                : product.variants.length !== 1
                  ? 'Choose options'
                  : 'Add to Cart'}
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-4">
          <div className="text-muted-foreground mb-1 text-xs">{product.brand?.name}</div>
          <h3 className="mb-2 line-clamp-2 flex-1 text-sm leading-tight font-medium">
            <Link href={`/product/${product.slug}`}>{product.name}</Link>
          </h3>

          {product.averageRating !== undefined && (
            <div className="mb-2 flex items-center gap-1.5">
              <StarRating rating={product.averageRating} size="sm" />
              {product.reviewCount !== undefined && (
                <span className="text-muted-foreground text-xs">({product.reviewCount})</span>
              )}
            </div>
          )}

          <div className="mt-auto flex items-end justify-between">
            <PriceDisplay price={price} compareAtPrice={originalPrice} />
          </div>

          {/* Mobile Add to Cart */}
          <Button
            className="mt-3 w-full md:hidden"
            size="sm"
            onClick={handleAddToCart}
            disabled={isOutOfStock || addCart.isPending}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            {product.variants.length !== 1 ? 'Choose options' : 'Add to Cart'}
          </Button>
          <CompareButton id={product.id} compact />
        </div>
      </div>
    </article>
  );
}
