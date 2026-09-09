import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { BillingItem } from '../../features/billing/types';

interface CartState {
  cartItems: BillingItem[];
}

const getInitialCart = (): BillingItem[] => {
  try {
    const stored = localStorage.getItem('cartItems');
    return stored ? JSON.parse(stored) : [];
  } catch (err) {
    console.error('Failed to parse cart items from localStorage', err);
    return [];
  }
};

const initialState: CartState = {
  cartItems: getInitialCart(),
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<BillingItem>) => {
      state.cartItems.push(action.payload);
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.cartItems = state.cartItems.filter((item) => item.id !== action.payload);
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    },
    updateCartItem: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<BillingItem> }>
    ) => {
      const { id, updates } = action.payload;
      const index = state.cartItems.findIndex((item) => item.id === id);
      if (index !== -1) {
        state.cartItems[index] = { ...state.cartItems[index], ...updates };
        localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
      }
    },
    clearCart: (state) => {
      state.cartItems = [];
      localStorage.removeItem('cartItems');
    },
  },
});

export const { addToCart, removeFromCart, updateCartItem, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
