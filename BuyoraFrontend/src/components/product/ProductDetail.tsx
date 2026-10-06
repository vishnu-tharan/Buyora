'use client';
import { cn } from '@/lib/utils';

import { useMutation } from '@tanstack/react-query';
import { AlertCircle, CheckCircle2, Heart, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { trackEvent } from '@/lib/analytics/events';
import { ProductVideo } from './ProductVideo';
import { CompleteTheSet } from './CompleteTheSet';
import { CompareButton } from './CompareButton';
import { ShareProduct } from './ShareProduct';
import { ProductAlerts } from './ProductAlerts';

import { useToggleWishlist, useWishlistQuery } from '@/features/wishlist/use-wishlist-query';
import { useAuth } from '@/hooks/use-auth';
import { useCart } from '@/hooks/use-cart';
import { cartService } from '@/services/cart.service';
import { useCartStore } from '@/stores/cart.store';
import { useWishlistStore } from '@/stores/wishlist.store';
import type { Product, ProductVariant } from '@/types';
import { useQueryClient } from '@tanstack/react-query';

import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { StarRating } from '@/components/ui/StarRating';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ImageGallery } from './ImageGallery';
import { ProductTabs } from './ProductTabs';
import { QuantitySelector } from './QuantitySelector';
import { ShippingInfo } from './ShippingInfo';
import { VariantSelector } from './VariantSelector';

interface ProductDetailProps {
  product: Product;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const viewed = useRef<number | null>(null);
  useEffect(() => {
    if (viewed.current !== product.id) {
      viewed.current = product.id;
      trackEvent({
        type: 'product_view',
        productId: product.id,
        productName: product.name,
        price: product.basePrice,
      });
    }
  }, [product.id, product.name, product.basePrice]);
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const { openCart } = useCart();
  const wishlistStore = useWishlistStore();
  const wishlist = useWishlistQuery();
  const toggleWishlistMutation = useToggleWishlist();
  const queryClient = useQueryClient();

  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(() =>
    product.variants.length === 1 ? product.variants[0] : null
  );
  const [quantity, setQuantity] = useState(1);

  // Derived state
  const currentPrice = selectedVariant?.price ?? product.salePrice ?? product.basePrice;
  const comparePrice = selectedVariant
    ? selectedVariant.compareAtPrice
    : product.salePrice
      ? product.basePrice
      : undefined;
  const discountPercentage = selectedVariant
    ? selectedVariant.compareAtPrice
      ? Math.round(
          ((selectedVariant.compareAtPrice - selectedVariant.price) /
            selectedVariant.compareAtPrice) *
            100
        )
      : 0
    : product.discountPercentage;

  const hasVariants = product.variants && product.variants.length > 0;

  const availableStock = selectedVariant?.isActive ? selectedVariant.availableQuantity : 0;
  const isInStock = availableStock > 0;
  const lowStockThreshold = selectedVariant?.lowStockThreshold ?? 5;
  const isLowStock = isInStock && availableStock <= lowStockThreshold;

  const canAddToCart = (!hasVariants || selectedVariant !== null) && isInStock;

  const isWishlisted = user
    ? (wishlist.data?.items.some((item) => item.product.id === product.id) ?? false)
    : wishlistStore.isInWishlist(product.id);

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      if (!selectedVariant || quantity > availableStock)
        throw new Error('Select an available variant');
      return cartService.addItem({
        productId: product.id,
        variantId: selectedVariant.id,
        quantity,
      });
    },
    onSuccess: (cart) => {
      if (selectedVariant)
        trackEvent({
          type: 'add_to_cart',
          productId: product.id,
          variantId: selectedVariant.id,
          quantity,
          price: currentPrice,
        });
      queryClient.setQueryData(['cart'], cart);
      useCartStore.getState().setCart(cart);
      openCart();
    },
    onError: () => {
      toast.add({
        title: 'Error',
        description: 'Failed to add item to cart. Please try again.',
      });
    },
  });

  const handleAddToCart = () => {
    addToCartMutation.mutate();
  };

  const handleBuyNow = () => {
    addToCartMutation.mutate(undefined, {
      onSuccess: () => {
        router.push('/checkout');
      },
    });
  };

  const handleToggleWishlist = () => {
    toggleWishlistMutation.mutate(product.id);
  };

  const scrollToReviews = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById('reviews');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="container mx-auto max-w-screen-xl px-4 pt-8 pb-24 md:pb-8">
      <Breadcrumb
        className="mb-6"
        items={[
          ...(product.category
            ? [{ label: product.category.name, href: `/category/${product.category.slug}` }]
            : []),
          { label: product.name },
        ]}
      />

      <div className="mb-12 grid gap-8 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-12">
        {/* Left Column - Images */}
        <div className="min-w-0">
          <ImageGallery
            key={selectedVariant?.id ?? 'all'}
            images={product.images}
            productName={product.name}
            selectedVariant={selectedVariant}
          />
        </div>

        {/* Right Column - Product Info */}
        <div className="flex flex-col">
          {product.brand && (
            <Link
              href={`/search?brand=${encodeURIComponent(product.brand.slug)}`}
              className="text-primary mb-2 font-medium hover:underline"
            >
              {product.brand.name}
            </Link>
          )}

          <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">{product.name}</h1>

          <div className="mb-6 flex items-center gap-4">
            {product.averageRating !== undefined && product.reviewCount !== undefined && (
              <div className="flex items-center gap-2">
                <StarRating rating={product.averageRating} size="sm" />
                <a
                  href="#reviews"
                  onClick={scrollToReviews}
                  className="text-muted-foreground hover:text-primary text-sm transition-colors hover:underline"
                >
                  ({product.reviewCount} reviews)
                </a>
              </div>
            )}

            {selectedVariant?.sku && (
              <div className="text-muted-foreground bg-muted rounded px-2 py-1 font-mono text-xs">
                SKU: {selectedVariant.sku}
              </div>
            )}
          </div>

          <div className="mb-6 flex items-end gap-3">
            <PriceDisplay
              price={currentPrice}
              compareAtPrice={comparePrice}

              className="text-3xl"
            />
            {discountPercentage ? (
              <Badge variant="destructive" className="mb-1 text-sm font-bold">
                -{discountPercentage}% OFF
              </Badge>
            ) : null}
          </div>

          <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
            {product.shortDescription ||
              (product.description ? product.description.substring(0, 150) + '…' : '')}
          </p>

          <div className="mb-8 flex-1 space-y-6">
            {hasVariants && (
              <VariantSelector
                product={product}
                selectedAttributes={selectedAttributes}
                onAttributesChange={setSelectedAttributes}
                onVariantChange={setSelectedVariant}
              />
            )}

            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Quantity</h3>

                {/* Stock Status */}
                <div className="flex items-center text-sm">
                  {!hasVariants || selectedVariant ? (
                    isInStock ? (
                      isLowStock ? (
                        <span className="flex items-center gap-1.5 font-medium text-amber-500">
                          <AlertCircle className="h-4 w-4" />
                          Only {availableStock} left!
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 font-medium text-green-600">
                          <CheckCircle2 className="h-4 w-4" />
                          In Stock
                        </span>
                      )
                    ) : (
                      <span className="text-destructive flex items-center gap-1.5 font-medium">
                        <XCircle className="h-4 w-4" />
                        Out of Stock
                      </span>
                    )
                  ) : (
                    <span className="text-muted-foreground">
                      Select options to see availability
                    </span>
                  )}
                </div>
              </div>

              <QuantitySelector
                value={quantity}
                onChange={setQuantity}
                max={Math.min(availableStock || 10, 10)}
                disabled={!canAddToCart || addToCartMutation.isPending}
              />
            </div>
          </div>

          <div className="mb-3 grid grid-cols-[1fr_auto] gap-3">
            <Button
              className="h-12 w-full text-base font-semibold"
              disabled={!canAddToCart || addToCartMutation.isPending}
              onClick={handleAddToCart}
            >
              {addToCartMutation.isPending ? 'Adding...' : 'Add to Cart'}
            </Button>
            <Button
              size="icon"
              variant="outline"
              className="h-12 w-12"
              onClick={handleToggleWishlist}
              disabled={toggleWishlistMutation.isPending}
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart
                className={cn('h-5 w-5', isWishlisted && 'fill-destructive text-destructive')}
              />
            </Button>
          </div>
          <Button
            variant="secondary"
            className="mb-6 h-12 w-full text-base font-semibold"
            disabled={!canAddToCart}
            onClick={handleBuyNow}
          >
            Buy Now
          </Button>

          <div className="mb-3 flex flex-wrap items-center gap-4">
            <CompareButton id={product.id} />
            <ShareProduct name={product.name} slug={product.slug} />
          </div>
          <ProductAlerts variantId={selectedVariant?.id} inStock={isInStock} slug={product.slug} />
          <ShippingInfo />
        </div>
      </div>

      <ProductVideo url={product.videoUrl} name={product.name} poster={product.images[0]?.url} />
      <ProductTabs product={product} />
      <CompleteTheSet slug={product.slug} currentVariant={selectedVariant} />
      <div className="bg-card/95 fixed inset-x-0 bottom-0 z-30 flex items-center gap-4 border-t px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden">
        <div className="min-w-0 flex-1">
          <p className="text-muted-foreground truncate text-xs">{product.name}</p>
          <p className="text-sm font-semibold">
            {new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(
              currentPrice
            )}
          </p>
        </div>
        <Button
          onClick={handleAddToCart}
          disabled={!canAddToCart || addToCartMutation.isPending}
          className="h-11 rounded-full px-6"
        >
          {addToCartMutation.isPending
            ? 'Adding…'
            : !selectedVariant
              ? 'Choose options'
              : isInStock
                ? 'Add to Cart'
                : 'Out of Stock'}
        </Button>
      </div>
    </div>
  );
}
