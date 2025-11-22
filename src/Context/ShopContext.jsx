import React, { createContext, useState } from "react";
import all_product from "../Components/Assets/all_product";

export const ShopContext = createContext(null);

const ShopContextProvider = (props) => {
  /*
    cartItems structure:
    {
      "1-M": { id: 1, size: "M", quantity: 1 },
      "1-L": { id: 1, size: "L", quantity: 2 }
    }
  */
  const [cartItems, setCartItems] = useState({});

  // Add to Cart with Size
  const addToCart = (id, size) => {
    const key = `${id}-${size}`;

    setCartItems((prev) => {
      const existing = prev[key];

      if (existing) {
        return {
          ...prev,
          [key]: {
            ...existing,
            quantity: existing.quantity + 1,
          },
        };
      }

      return {
        ...prev,
        [key]: {
          id,
          size,
          quantity: 1,
        },
      };
    });
  };

  // Remove item using key
  const removeFromCart = (key) => {
    setCartItems((prev) => {
      const item = prev[key];
      if (!item) return prev;

      if (item.quantity === 1) {
        const updated = { ...prev };
        delete updated[key];
        return updated;
      }

      return {
        ...prev,
        [key]: { ...item, quantity: item.quantity - 1 },
      };
    });
  };

  // CART TOTAL PRICE
  const getTotalCartAmount = () => {
    let total = 0;

    for (const key in cartItems) {
      const item = cartItems[key];
      const product = all_product.find((p) => p.id === item.id);

      if (product) {
        total += product.new_price * item.quantity;
      }
    }

    return total;
  };

  // CART ITEM COUNT
  const getDefaultCartItems = () => {
    let count = 0;

    for (const key in cartItems) {
      count += cartItems[key].quantity;
    }

    return count;
  };

  const contextValue = {
    all_product,
    cartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    getDefaultCartItems,
  };

  return (
    <ShopContext.Provider value={contextValue}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
