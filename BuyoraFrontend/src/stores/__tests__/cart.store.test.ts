import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from '../cart.store';

describe('cartStore', () => {
  beforeEach(() => {
    useCartStore.setState({ cart: null, isOpen: false });
  });

  it('initializes with empty cart', () => {
    const state = useCartStore.getState();
    expect(state.cart).toBeNull();
    expect(state.isOpen).toBe(false);
  });

  it('opens cart drawer', () => {
    useCartStore.getState().openCart();
    expect(useCartStore.getState().isOpen).toBe(true);
  });

  it('closes cart drawer', () => {
    useCartStore.getState().openCart();
    useCartStore.getState().closeCart();
    expect(useCartStore.getState().isOpen).toBe(false);
  });

  it('toggles cart drawer', () => {
    const store = useCartStore.getState();
    store.toggleCart();
    expect(useCartStore.getState().isOpen).toBe(true);
    store.toggleCart();
    expect(useCartStore.getState().isOpen).toBe(false);
  });

  it('sets cart data', () => {
    const mockCart = {
      id: 'cart-1',
      items: [],
      summary: {
        subtotal: 0,
        discountAmount: 0,
        shippingAmount: 0,
        taxAmount: 0,
        total: 0,
        freeShipping: false,
      },
      itemCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    useCartStore.getState().setCart(mockCart);
    expect(useCartStore.getState().cart).toEqual(mockCart);
  });
});
