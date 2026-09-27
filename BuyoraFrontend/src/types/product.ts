export interface Brand {
  id: number;
  name: string;
  slug: string;
  logoUrl?: string;
  description?: string;
}

export interface Category {
  id: number;
  publicId: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId?: number;
  parent?: Category;
  children?: Category[];
  productCount?: number;
  level: number;
}

export interface ProductAttribute {
  id: number;
  name: string; // e.g. "Color"
  slug: string; // e.g. "color"
  values: AttributeValue[];
}

export interface AttributeValue {
  id: number;
  value: string; // e.g. "Red"
  displayName?: string;
  colorCode?: string; // for color swatches
  order: number;
}

export interface ProductImage {
  id: number;
  url: string;
  altText?: string;
  order: number;
  isPrimary: boolean;
  variantId?: number; // if image belongs to a specific variant
}

export interface ProductVariant {
  id: number;
  sku: string;
  price: number;
  compareAtPrice?: number;
  stockQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  attributes: Record<string, string>; // e.g. { color: "Red", size: "M" }
  images?: ProductImage[];
  isActive: boolean;
  lowStockThreshold?: number;
  weight?: number;
}

export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'DRAFT' | 'ARCHIVED';

export interface Product {
  id: number;
  name: string;
  slug: string;
  sku?: string;
  description?: string;
  shortDescription?: string;
  brand?: Brand;
  category: Category;
  images: ProductImage[];
  variants: ProductVariant[];
  attributes: ProductAttribute[];
  basePrice: number;
  salePrice?: number;
  discountPercentage?: number;
  status: ProductStatus;
  averageRating?: number;
  reviewCount?: number;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
  specifications?: Record<string, string>;
  shippingInfo?: string;
  returnInfo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductSummary {
  id: number;
  name: string;
  slug: string;
  brand?: Pick<Brand, 'id' | 'name' | 'slug'>;
  primaryImage?: ProductImage;
  basePrice: number;
  salePrice?: number;
  discountPercentage?: number;
  averageRating?: number;
  reviewCount?: number;
  isInWishlist?: boolean;
  variants: Pick<ProductVariant, 'id' | 'sku' | 'price' | 'availableQuantity' | 'attributes'>[];
  status: ProductStatus;
}

export type SortOption =
  'RELEVANCE' | 'NEWEST' | 'PRICE_ASC' | 'PRICE_DESC' | 'RATING' | 'BEST_SELLING';

export interface ProductFilter {
  categorySlug?: string;
  brandSlugs?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
  hasDiscount?: boolean;
  attributes?: Record<string, string[]>;
  sort?: SortOption;
  q?: string;
  page?: number;
  size?: number;
}
