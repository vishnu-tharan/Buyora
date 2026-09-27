import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistStore {
  // For guests: local wishlist item IDs (product IDs)
  localWishlist: number[];
  addLocal: (productId: number) => void;
  removeLocal: (productId: number) => void;
  clearLocal: () => void;
  isInWishlist: (productId: number) => boolean;
}

export const useWishlistStore = create<WishlistStore>()(
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
    { name: 'buyora-wishlist' }
  )
);
