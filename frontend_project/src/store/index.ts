import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import toastReducer from "./slices/toastSlice";
import cartReducer from "./slices/cartSlice";
import wishlistReducer from "./slices/wishlistSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    toast: toastReducer,
    cart: cartReducer,
    wishlist: wishlistReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false // Disable to prevent errors with timestamp structures
    })
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
