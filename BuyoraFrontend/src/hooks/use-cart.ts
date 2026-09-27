import { useCartStore } from '@/stores';

export function useCart() {
  const cart = useCartStore((state) => state.cart);
  const isOpen = useCartStore((state) => state.isOpen);
  const setCart = useCartStore((state) => state.setCart);
  const openCart = useCartStore((state) => state.openCart);
  const closeCart = useCartStore((state) => state.closeCart);

  return {
    cart,
    isOpen,
    setCart,
    openCart,
    closeCart,
    itemCount: cart?.itemCount ?? 0,
    total: cart?.summary.total ?? 0,
  };
}
