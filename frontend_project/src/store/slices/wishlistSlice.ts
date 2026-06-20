import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface WishlistState {
  productIds: string[];
}

const initialState: WishlistState = {
  productIds: []
};

export const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    setWishlist: (state, action: PayloadAction<string[]>) => {
      state.productIds = action.payload;
    },
    addLocalWish: (state, action: PayloadAction<string>) => {
      if (!state.productIds.includes(action.payload)) {
        state.productIds.push(action.payload);
      }
    },
    removeLocalWish: (state, action: PayloadAction<string>) => {
      state.productIds = state.productIds.filter((id) => id !== action.payload);
    },
    clearLocalWish: (state) => {
      state.productIds = [];
    }
  }
});

export const { setWishlist, addLocalWish, removeLocalWish, clearLocalWish } = wishlistSlice.actions;
export default wishlistSlice.reducer;
