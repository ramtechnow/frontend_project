import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CartItem } from "../../features/checkout/types/cartTypes";

interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  items: [],
  loading: false,
  error: null
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCartItems: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
      state.loading = false;
    },
    setCartLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setCartError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    addLocalItem: (state, action: PayloadAction<CartItem>) => {
      const existing = state.items.find(
        (item) =>
          item.productId === action.payload.productId &&
          item.size === action.payload.size &&
          item.color === action.payload.color
      );
      if (existing) {
        existing.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
    },
    updateLocalQuantity: (state, action: PayloadAction<{ productId: string; size: string; color: string; quantity: number }>) => {
      const existing = state.items.find(
        (item) =>
          item.productId === action.payload.productId &&
          item.size === action.payload.size &&
          item.color === action.payload.color
      );
      if (existing) {
        existing.quantity = action.payload.quantity;
      }
    },
    removeLocalItem: (state, action: PayloadAction<{ productId: string; size: string; color: string }>) => {
      state.items = state.items.filter(
        (item) =>
          !(
            item.productId === action.payload.productId &&
            item.size === action.payload.size &&
            item.color === action.payload.color
          )
      );
    },
    clearLocalCart: (state) => {
      state.items = [];
      state.error = null;
    }
  }
});

export const {
  setCartItems,
  setCartLoading,
  setCartError,
  addLocalItem,
  updateLocalQuantity,
  removeLocalItem,
  clearLocalCart
} = cartSlice.actions;

export default cartSlice.reducer;
