import React, { createContext, useState, useEffect } from 'react';

export const WishlistContext = createContext(null);

export const WishlistContextProvider = (props) => {
  const [wishlistItems, setWishlistItems] = useState([]);

  // Load wishlist from local storage on component mount
  useEffect(() => {
    try {
      const savedWishlist = localStorage.getItem('user-wishlist');
      if (savedWishlist) {
        setWishlistItems(JSON.parse(savedWishlist));
      }
    } catch (e) {
      console.warn("⚠️ Failed to parse wishlist from local storage:", e);
    }
  }, []);

  // Save wishlist to local storage whenever it changes
  const saveWishlist = (items) => {
    setWishlistItems(items);
    localStorage.setItem('user-wishlist', JSON.stringify(items));
  };

  const toggleWishlist = (id) => {
    const numericId = Number(id);
    if (wishlistItems.includes(numericId)) {
      // Remove from wishlist
      saveWishlist(wishlistItems.filter(item => item !== numericId));
    } else {
      // Add to wishlist
      saveWishlist([...wishlistItems, numericId]);
    }
  };

  const isWishlisted = (id) => {
    return wishlistItems.includes(Number(id));
  };

  const clearWishlist = () => {
    saveWishlist([]);
  };

  const contextValue = {
    wishlistItems,
    toggleWishlist,
    isWishlisted,
    clearWishlist
  };

  return (
    <WishlistContext.Provider value={contextValue}>
      {props.children}
    </WishlistContext.Provider>
  );
};

export default WishlistContextProvider;
