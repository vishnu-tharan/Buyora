import { create } from 'zustand';

const initialState = {
  step: 1,
  billingAddressSameAsShipping: true,
};

export const useCheckoutStore = create((set) => ({
  state: initialState,
  setStep: (step) => set((store) => ({ state: { ...store.state, step } })),
  setEmail: (email) => set((store) => ({ state: { ...store.state, email } })),
  setShippingAddress: (address) =>
    set((store) => ({ state: { ...store.state, shippingAddress: address } })),
  setSavedAddressId: (id) => set((store) => ({ state: { ...store.state, savedAddressId: id } })),
  setShippingMethod: (method) =>
    set((store) => ({ state: { ...store.state, shippingMethod: method } })),
  setPaymentMethod: (method) =>
    set((store) => ({ state: { ...store.state, paymentMethod: method } })),
  setBillingAddressSameAsShipping: (same) =>
    set((store) => ({ state: { ...store.state, billingAddressSameAsShipping: same } })),
  setCouponCode: (code) => set((store) => ({ state: { ...store.state, couponCode: code } })),
  reset: () => set({ state: initialState }),
}));
