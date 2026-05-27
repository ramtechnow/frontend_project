import React, { createContext, useState, useEffect } from "react";
import { BACKEND_URL } from "../config";

export const ShopContext = createContext(null);

const ShopContextProvider = (props) => {
  const [all_product, setAll_Product] = useState([]);
  const [cartItems, setCartItems] = useState({});

  useEffect(() => {
    fetch(`${BACKEND_URL}/allproducts`)
      .then((res) => res.json())
      .then((data) => setAll_Product(data))
      .catch((err) => console.warn(`⚠️ Failed to fetch products from backend. Is the server running on ${BACKEND_URL}?`, err));

    if (localStorage.getItem("auth-token")) {
      fetch(`${BACKEND_URL}/getcart`, {
        method: "GET",
        headers: {
          Accept: "application/form-data",
          "auth-token": `${localStorage.getItem("auth-token")}`,
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((data) => setCartItems(data))
        .catch((err) => console.warn(`⚠️ Failed to fetch cart from backend. Is the server running on ${BACKEND_URL}?`, err));
    }
  }, []);

  // Add to Cart with Size
  const addToCart = (id, size) => {
    const key = `${id}-${size}`;

    setCartItems((prev) => {
      const existing = prev[key];
      const updatedQty = existing ? existing.quantity + 1 : 1;
      const updatedItem = {
        id,
        size: size || "M",
        quantity: updatedQty,
      };

      const updated = {
        ...prev,
        [key]: updatedItem,
      };

      // Sync to database if logged in
      if (localStorage.getItem("auth-token")) {
        fetch(`${BACKEND_URL}/addtocart`, {
          method: "POST",
          headers: {
            Accept: "application/form-data",
            "auth-token": `${localStorage.getItem("auth-token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ itemId: id, size: size || "M" }),
        })
          .then((res) => res.json())
          .then((data) => console.log(data));
      }

      return updated;
    });
  };

  // Remove item using key
  const removeFromCart = (key) => {
    setCartItems((prev) => {
      const item = prev[key];
      if (!item) return prev;

      let updated = { ...prev };
      if (item.quantity === 1) {
        delete updated[key];
      } else {
        updated[key] = { ...item, quantity: item.quantity - 1 };
      }

      // Sync to database if logged in
      if (localStorage.getItem("auth-token")) {
        fetch(`${BACKEND_URL}/removefromcart`, {
          method: "POST",
          headers: {
            Accept: "application/form-data",
            "auth-token": `${localStorage.getItem("auth-token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ key: key }),
        })
          .then((res) => res.json())
          .then((data) => console.log(data));
      }

      return updated;
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
