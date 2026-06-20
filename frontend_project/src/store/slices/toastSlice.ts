import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
}

interface ToastState {
  toasts: ToastMessage[];
}

const initialState: ToastState = {
  toasts: []
};

export const toastSlice = createSlice({
  name: "toast",
  initialState,
  reducers: {
    addToast: (state, action: PayloadAction<Omit<ToastMessage, "id">>) => {
      const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      state.toasts.push({ id, ...action.payload });
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    }
  }
});

export const { addToast, removeToast } = toastSlice.actions;
export default toastSlice.reducer;
