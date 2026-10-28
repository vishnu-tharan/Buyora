import { create } from 'zustand';
import { useCheckoutStore } from './checkout.store';

export const useCartStore = create((set) => ({
  cart: null,
  isOpen: false,
  setCart: (cart) => {
    if (cart?.items.length && useCheckoutStore.getState().state.step === 5) {
      useCheckoutStore.getState().reset();
    }
    set({ cart });
  },
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
}));
