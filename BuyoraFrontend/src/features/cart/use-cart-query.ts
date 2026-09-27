import { cartService } from '@/services/cart.service';
import { useCartStore } from '@/stores/cart.store';
import type { AddToCartRequest, UpdateCartItemRequest } from '@/types/cart';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useCartQuery() {
  return useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const data = await cartService.getCart();
      useCartStore.getState().setCart(data);
      return data;
    },
    staleTime: 30 * 1000,
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  const { openCart } = useCartStore();

  return useMutation({
    mutationFn: (data: AddToCartRequest) => cartService.addItem(data),
    onSuccess: (cart) => {
      queryClient.setQueryData(['cart'], cart);
      useCartStore.getState().setCart(cart);
      openCart();
    },
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, data }: { itemId: number; data: UpdateCartItemRequest }) =>
      cartService.updateItem(itemId, data),
    onSuccess: (cart) => {
      queryClient.setQueryData(['cart'], cart);
      useCartStore.getState().setCart(cart);
    },
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: number) => cartService.removeItem(itemId),
    onSuccess: (cart) => {
      queryClient.setQueryData(['cart'], cart);
      useCartStore.getState().setCart(cart);
    },
  });
}

export function useApplyCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: string) => cartService.applyCoupon(code),
    onSuccess: (cart) => {
      queryClient.setQueryData(['cart'], cart);
      useCartStore.getState().setCart(cart);
    },
  });
}

export function useRemoveCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cartService.removeCoupon(),
    onSuccess: (cart) => {
      queryClient.setQueryData(['cart'], cart);
      useCartStore.getState().setCart(cart);
    },
  });
}
