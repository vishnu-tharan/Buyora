import type { PaymentMethod } from './order';

export interface CheckoutAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district: string;
  postalCode?: string;
  country: string;
  saveAddress?: boolean;
}

export interface ShippingMethod {
  id: string;
  name: string;
  description?: string;
  price: number;
  estimatedDays?: string;
  carrier?: string;
}

export interface CheckoutState {
  step: 1 | 2 | 3 | 4 | 5;
  email?: string;
  shippingAddress?: CheckoutAddress;
  savedAddressId?: number;
  billingAddressSameAsShipping: boolean;
  billingAddress?: CheckoutAddress;
  shippingMethod?: ShippingMethod;
  paymentMethod?: PaymentMethod;
  couponCode?: string;
}

export interface InitiatePaymentRequest {
  orderNumber: string;
  paymentMethod: PaymentMethod;
  returnUrl?: string;
}

export interface PaymentInitiationResponse {
  paymentId: string;
  redirectUrl?: string;
  clientSecret?: string; // for Stripe
  merchantId?: string; // for PayHere
  formData?: Record<string, string>; // for form-post gateways
}
