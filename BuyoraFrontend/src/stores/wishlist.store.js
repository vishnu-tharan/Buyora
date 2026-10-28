import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      localWishlist: [],
      addLocal: (productId) =>
        set((state) => ({
          localWishlist: state.localWishlist.includes(productId)
            ? state.localWishlist
            : [...state.localWishlist, productId],
        })),
      removeLocal: (productId) =>
        set((state) => ({
          localWishlist: state.localWishlist.filter((id) => id !== productId),
        })),
      clearLocal: () => set({ localWishlist: [] }),
      isInWishlist: (productId) => get().localWishlist.includes(productId),
    }),
    { name: 'buyora-wishlist' },
  ),
);
