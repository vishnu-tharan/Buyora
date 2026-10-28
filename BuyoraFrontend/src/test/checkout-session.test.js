import { afterEach, expect, it } from 'vitest';
import { useCartStore } from '@/stores/cart.store';
import { useCheckoutStore } from '@/stores/checkout.store';

afterEach(() => {
  useCartStore.getState().setCart(null);
  useCheckoutStore.getState().reset();
});

it('starts a new checkout after another product is added following an order', () => {
  useCheckoutStore.getState().setStep(5);
  useCheckoutStore.getState().setEmail('previous@example.test');
  useCartStore.getState().setCart({ items: [{ id: 1 }] });
  expect(useCheckoutStore.getState().state.step).toBe(1);
  expect(useCheckoutStore.getState().state.email).toBeUndefined();
});

it('preserves the checkout while creating an order and while editing its cart', () => {
  useCheckoutStore.getState().setStep(4);
  useCartStore.getState().setCart({ items: [{ id: 1 }] });
  expect(useCheckoutStore.getState().state.step).toBe(4);
  useCheckoutStore.getState().setStep(5);
  useCartStore.getState().setCart(null);
  expect(useCheckoutStore.getState().state.step).toBe(5);
});
