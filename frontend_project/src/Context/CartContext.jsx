import React, { createContext, useState, useEffect, useContext } from "react";
import { BACKEND_URL } from "../config";
import { AuthContext } from "./AuthContext";
import { ShopContext } from "./ShopContext";

export const CartContext = createContext(null);

// Helper to normalize cart data from any legacy or inconsistent structure
export const normalizeCart = (cartData) => {
  if (!cartData || typeof cartData !== "object") return {};
  const normalized = {};
  
  Object.keys(cartData).forEach((key) => {
    const value = cartData[key];
    if (value === undefined || value === null) return;
    
    // Parse key parts: could be "id", "id-size", or "id-size-color"
    const parts = key.split("-");
    const keyId = Number(parts[0]);
    if (isNaN(keyId)) return; // Invalid key
    
    let size = parts[1] || "M";
    let color = parts[2] || "White";
    let quantity = 0;
    let id = keyId;

    if (typeof value === "object") {
      quantity = Number(value.quantity) || 0;
      if (value.id !== undefined) id = Number(value.id);
      if (value.size !== undefined) size = value.size;
      if (value.color !== undefined) color = value.color;
    } else {
      // If it's a raw number or string (old format e.g., "1": 2)
      quantity = Number(value) || 0;
    }

    if (quantity > 0) {
      const normalizedKey = `${id}-${size}-${color}`;
      if (normalized[normalizedKey]) {
        normalized[normalizedKey].quantity += quantity;
      } else {
        normalized[normalizedKey] = {
          id,
          size,
          color,
          quantity,
        };
      }
    }
  });
  
  return normalized;
};

export const CartProvider = ({ children }) => {
  const { currentUser } = useContext(AuthContext);
  const { all_product } = useContext(ShopContext) || { all_product: [] };
  const [cartItems, setCartItems] = useState(() => {
    const localCart = localStorage.getItem("cart-items");
    if (localCart) {
      try {
        return normalizeCart(JSON.parse(localCart));
      } catch (e) {
        console.error("Failed to parse cart items from localStorage:", e);
      }
    }
    return {};
  });

  // 2. Persist to localStorage whenever cart changes
  useEffect(() => {
    if (Object.keys(cartItems).length > 0) {
      localStorage.setItem("cart-items", JSON.stringify(cartItems));
    } else {
      localStorage.removeItem("cart-items");
    }
  }, [cartItems]);

  // 3. Sync with Backend when currentUser changes (User Logs In)
  useEffect(() => {
    if (currentUser) {
      const fetchBackendCart = async () => {
        try {
          const response = await fetch(`${BACKEND_URL}/getcart`, {
            method: "GET",
            headers: {
              Accept: "application/json",
              "auth-token": `${localStorage.getItem("auth-token")}`,
              "Content-Type": "application/json",
            },
          });
          const backendCart = await response.json();
          const normalizedBackend = normalizeCart(backendCart);
          
          if (Object.keys(normalizedBackend).length > 0) {
            // Merge local cart items into backend cart items
            setCartItems((prev) => {
              const merged = { ...normalizedBackend };
              // Merge local items that are not in backend or add quantities
              Object.keys(prev).forEach((key) => {
                if (merged[key]) {
                  merged[key].quantity = Math.max(merged[key].quantity, prev[key].quantity);
                } else {
                  merged[key] = prev[key];
                }
              });
              return merged;
            });
          }
        } catch (err) {
          console.warn("⚠️ Failed to sync cart from backend Node server.", err);
        }
      };
      
      fetchBackendCart();
    }
  }, [currentUser]);

  // Add to Cart
  const addToCart = async (itemId, size = "M", color = "White", qty = 1) => {
    const key = `${itemId}-${size}-${color}`;

    setCartItems((prev) => {
      const existing = prev[key];
      const newQty = existing ? existing.quantity + qty : qty;
      const updatedItem = {
        id: Number(itemId),
        size,
        color,
        quantity: newQty,
      };

      const updated = {
        ...prev,
        [key]: updatedItem,
      };

      // Sync with MongoDB backend if logged in
      if (currentUser && localStorage.getItem("auth-token")) {
        fetch(`${BACKEND_URL}/addtocart`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "auth-token": `${localStorage.getItem("auth-token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ itemId: Number(itemId), size, color }),
        })
          .then((res) => res.json())
          .then((data) => console.log("Added in Backend:", data))
          .catch((err) => console.warn("Failed to sync addToCart in backend:", err));
      }

      return updated;
    });
  };

  // Remove from Cart (Fully removes or decreases quantity by 1)
  const removeFromCart = async (key) => {
    setCartItems((prev) => {
      const item = prev[key];
      if (!item) return prev;

      let updated = { ...prev };
      if (item.quantity <= 1) {
        delete updated[key];
      } else {
        updated[key] = { ...item, quantity: item.quantity - 1 };
      }

      // Sync with MongoDB backend if logged in
      if (currentUser && localStorage.getItem("auth-token")) {
        fetch(`${BACKEND_URL}/removefromcart`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "auth-token": `${localStorage.getItem("auth-token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ key, itemId: item.id }),
        })
          .then((res) => res.json())
          .then((data) => console.log("Removed from Backend:", data))
          .catch((err) => console.warn("Failed to sync removeFromCart in backend:", err));
      }

      return updated;
    });
  };

  // Update item quantity directly
  const updateQuantity = async (key, quantity) => {
    if (quantity <= 0) {
      removeFromCart(key);
      return;
    }

    setCartItems((prev) => {
      const item = prev[key];
      if (!item) return prev;

      const updated = {
        ...prev,
        [key]: { ...item, quantity },
      };

      // Simple sync with backend: in a full production app, this would update the db quantity
      // Here, we can trigger the standard backend sync if required, but local state updating is immediate
      return updated;
    });
  };

  // Clear all items in Cart
  const clearCart = () => {
    setCartItems({});
    localStorage.removeItem("cart-items");
  };

  // Compute Total Cart Amount
  const getTotalCartAmount = () => {
    let total = 0;
    for (const key in cartItems) {
      const item = cartItems[key];
      if (!item || typeof item !== "object") continue;
      const product = all_product.find((p) => p.id === item.id);
      if (product) {
        total += product.new_price * (Number(item.quantity) || 0);
      }
    }
    return total;
  };

  // Compute total item count for cart badges
  const getCartItemCount = () => {
    let count = 0;
    for (const key in cartItems) {
      const item = cartItems[key];
      if (item && typeof item === "object") {
        count += Number(item.quantity) || 0;
      }
    }
    return count;
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalCartAmount,
    getCartItemCount,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
