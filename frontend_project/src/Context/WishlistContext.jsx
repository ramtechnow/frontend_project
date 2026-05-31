import React, { createContext, useState, useEffect } from 'react';
import { BACKEND_URL } from '../config';

export const WishlistContext = createContext(null);

export const WishlistContextProvider = (props) => {
  const [wishlistItems, setWishlistItems] = useState([]);

  // Fetch wishlist helper supporting database loading & local fallback
  const fetchWishlist = () => {
    if (localStorage.getItem("auth-token")) {
      fetch(`${BACKEND_URL}/getwishlist`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "auth-token": `${localStorage.getItem("auth-token")}`,
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            const numericData = data.map(Number);
            setWishlistItems(numericData);
            localStorage.setItem('user-wishlist', JSON.stringify(numericData));
          }
        })
        .catch((err) => console.warn("⚠️ Failed to load wishlist from backend:", err));
    } else {
      try {
        const savedWishlist = localStorage.getItem('user-wishlist');
        if (savedWishlist) {
          setWishlistItems(JSON.parse(savedWishlist).map(Number));
        }
      } catch (e) {
        console.warn("⚠️ Failed to parse wishlist from local storage:", e);
      }
    }
  };

  // Load wishlist on component mount
  useEffect(() => {
    fetchWishlist();

    // Listen to token changes in storage
    const checkToken = () => {
      fetchWishlist();
    };
    window.addEventListener('auth-change', checkToken);
    window.addEventListener('storage', checkToken);
    return () => {
      window.removeEventListener('auth-change', checkToken);
      window.removeEventListener('storage', checkToken);
    };
  }, []);

  // Save wishlist locally
  const saveWishlistLocally = (items) => {
    setWishlistItems(items);
    localStorage.setItem('user-wishlist', JSON.stringify(items));
  };

  const toggleWishlist = (id) => {
    const numericId = Number(id);
    const isCurrentlyFav = wishlistItems.includes(numericId);
    let updatedItems = [];

    if (isCurrentlyFav) {
      updatedItems = wishlistItems.filter(item => item !== numericId);
    } else {
      updatedItems = [...wishlistItems, numericId];
    }

    saveWishlistLocally(updatedItems);

    // Sync to database if logged in
    if (localStorage.getItem("auth-token")) {
      const endpoint = isCurrentlyFav ? 'removefromwishlist' : 'addtowishlist';
      fetch(`${BACKEND_URL}/${endpoint}`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "auth-token": `${localStorage.getItem("auth-token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ itemId: numericId }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.wishlist) {
            const synced = data.wishlist.map(Number);
            setWishlistItems(synced);
            localStorage.setItem('user-wishlist', JSON.stringify(synced));
          }
        })
        .catch((err) => console.warn(`⚠️ Failed to sync wishlist ${endpoint} to database:`, err));
    }
  };

  const isWishlisted = (id) => {
    return wishlistItems.includes(Number(id));
  };

  const clearWishlist = () => {
    saveWishlistLocally([]);
  };

  const contextValue = {
    wishlistItems,
    toggleWishlist,
    isWishlisted,
    clearWishlist,
    fetchWishlist
  };

  return (
    <WishlistContext.Provider value={contextValue}>
      {props.children}
    </WishlistContext.Provider>
  );
};

export default WishlistContextProvider;
