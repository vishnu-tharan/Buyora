import { describe, it, expect, beforeEach } from 'vitest';
import { useWishlistStore } from '../wishlist.store';

describe('wishlistStore (local/guest)', () => {
  beforeEach(() => {
    useWishlistStore.setState({ localWishlist: [] });
  });

  it('adds item to local wishlist', () => {
    useWishlistStore.getState().addLocal(123);
    expect(useWishlistStore.getState().localWishlist).toContain(123);
  });

  it('does not add duplicate items', () => {
    useWishlistStore.getState().addLocal(123);
    useWishlistStore.getState().addLocal(123);
    const items = useWishlistStore.getState().localWishlist;
    expect(items.filter((id) => id === 123).length).toBe(1);
  });

  it('removes item from local wishlist', () => {
    useWishlistStore.getState().addLocal(123);
    useWishlistStore.getState().removeLocal(123);
    expect(useWishlistStore.getState().localWishlist).not.toContain(123);
  });

  it('clears all local wishlist items', () => {
    useWishlistStore.getState().addLocal(1);
    useWishlistStore.getState().addLocal(2);
    useWishlistStore.getState().clearLocal();
    expect(useWishlistStore.getState().localWishlist).toHaveLength(0);
  });

  it('checks if item is in wishlist', () => {
    useWishlistStore.getState().addLocal(456);
    expect(useWishlistStore.getState().isInWishlist(456)).toBe(true);
    expect(useWishlistStore.getState().isInWishlist(789)).toBe(false);
  });
});
