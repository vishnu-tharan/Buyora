export interface CartItem {
  id: number;
  product: {
    id: number;
    name: string;
    slug: string;
    primaryImage?: { url: string; altText?: string };
  };
  variant: {
    id: number;
    sku: string;
    attributes: Record<string, string>;
    price: number;
    availableQuantity: number;
  };
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discountAmount: number;
}

export interface CartSummary {
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  taxAmount: number;
  total: number;
  couponCode?: string;
  freeShipping: boolean;
}

export interface Cart {
  id: string;
  items: CartItem[];
  summary: CartSummary;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AddToCartRequest {
  productId: number;
  variantId: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}
