import { useContext } from "react";
import { CartContext } from "../Context/CartContext";

/**
 * Custom hook to safely consume Cart Context
 */
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined || context === null) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export default useCart;
