import React, { useMemo, useCallback, type ReactNode } from 'react';
import type { BillingItem } from '../features/billing/types';
import type { Product } from '../types/Dashboard.types';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  addToCart as addToCartAction,
  removeFromCart as removeFromCartAction,
  updateCartItem as updateCartItemAction,
  clearCart as clearCartAction,
} from '../store/slices/cartSlice';
import { useRates } from './RateContext';

export interface CartContextType {
  cartItems: BillingItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (id: string) => void;
  updateCartItem: (id: string, updates: Partial<BillingItem>) => void;
  clearCart: () => void;
}

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export const useCart = (): CartContextType => {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.cartItems);
  const { rates } = useRates();

  const addToCart = useCallback(
    (product: Product) => {
      const rate = product.material.includes('Gold')
        ? rates.gold22k
        : product.material.includes('Silver')
        ? rates.silver
        : 3210;

      const makingRate = 500;
      const rawTotal = product.weight * rate + product.weight * makingRate;

      const newItem: BillingItem = {
        id: Math.random().toString(36).substr(2, 9),
        productId: product.id,
        name: product.name,
        code: product.sku,
        weight: product.weight,
        purity: product.material.includes('22k')
          ? '22k'
          : product.material.includes('24k')
          ? '24k'
          : '925',
        rate: rate,
        makingCharges: 500,
        wastage: 0,
        discount: 0,
        total: rawTotal,
      };

      dispatch(addToCartAction(newItem));
    },
    [dispatch, rates]
  );

  const removeFromCart = useCallback(
    (id: string) => {
      dispatch(removeFromCartAction(id));
    },
    [dispatch]
  );

  const updateCartItem = useCallback(
    (id: string, updates: Partial<BillingItem>) => {
      const item = cartItems.find((i) => i.id === id);
      if (!item) return;

      const updatedItem = { ...item, ...updates };
      const weight = updatedItem.weight;
      const wastagePercent = updatedItem.wastage || 0;
      const effectiveWeight = weight + (weight * wastagePercent) / 100;
      const rateTotal = effectiveWeight * updatedItem.rate;
      const makingRate = updatedItem.makingCharges || 0;
      const disc = updatedItem.discount || 0;
      updatedItem.total = rateTotal + makingRate * weight - disc;

      dispatch(updateCartItemAction({ id, updates: updatedItem }));
    },
    [cartItems, dispatch]
  );

  const clearCart = useCallback(() => {
    dispatch(clearCartAction());
  }, [dispatch]);

  return useMemo(
    () => ({
      cartItems,
      addToCart,
      removeFromCart,
      updateCartItem,
      clearCart,
    }),
    [cartItems, addToCart, removeFromCart, updateCartItem, clearCart]
  );
};
