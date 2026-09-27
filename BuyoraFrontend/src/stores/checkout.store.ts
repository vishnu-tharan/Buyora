import type { CheckoutAddress, CheckoutState, ShippingMethod } from '@/types';
import type { PaymentMethod } from '@/types/order';
import { create } from 'zustand';

interface CheckoutStore {
  state: CheckoutState;
  setStep: (step: CheckoutState['step']) => void;
  setEmail: (email: string) => void;
  setShippingAddress: (address: CheckoutAddress) => void;
  setSavedAddressId: (id: number) => void;
  setShippingMethod: (method: ShippingMethod) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setBillingAddressSameAsShipping: (same: boolean) => void;
  setCouponCode: (code: string | undefined) => void;
  reset: () => void;
}

const initialState: CheckoutState = {
  step: 1,
  billingAddressSameAsShipping: true,
};

export const useCheckoutStore = create<CheckoutStore>()((set) => ({
  state: initialState,
  setStep: (step) => set((s) => ({ state: { ...s.state, step } })),
  setEmail: (email) => set((s) => ({ state: { ...s.state, email } })),
  setShippingAddress: (address) =>
    set((s) => ({ state: { ...s.state, shippingAddress: address } })),
  setSavedAddressId: (id) => set((s) => ({ state: { ...s.state, savedAddressId: id } })),
  setShippingMethod: (method) => set((s) => ({ state: { ...s.state, shippingMethod: method } })),
  setPaymentMethod: (method) => set((s) => ({ state: { ...s.state, paymentMethod: method } })),
  setBillingAddressSameAsShipping: (same) =>
    set((s) => ({ state: { ...s.state, billingAddressSameAsShipping: same } })),
  setCouponCode: (code) => set((s) => ({ state: { ...s.state, couponCode: code } })),
  reset: () => set({ state: initialState }),
}));
