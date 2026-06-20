import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { setWishlist, addLocalWish, removeLocalWish } from "../../../store/slices/wishlistSlice";
import { addToast } from "../../../store/slices/toastSlice";
import { fetchUserWishlist, addWishlistItem, deleteWishlistItem } from "../services/wishlistService";

export const useWishlist = () => {
  const dispatch = useAppDispatch();
  const productIds = useAppSelector((state) => state.wishlist.productIds);
  const { user } = useAppSelector((state) => state.auth);

  // Sync wishlist from Firestore when user changes
  const syncWishlist = useCallback(async () => {
    if (!user) {
      // Clear wishlist for guests
      dispatch(setWishlist([]));
      return;
    }

    try {
      const dbWishlist = await fetchUserWishlist(user.uid);
      dispatch(setWishlist(dbWishlist));
    } catch (err) {
      console.error("Wishlist sync failed:", err);
    }
  }, [user, dispatch]);

  useEffect(() => {
    syncWishlist();
  }, [syncWishlist]);

  const toggleWishlist = async (productId: string) => {
    if (!user) {
      dispatch(addToast({ message: "Please sign in to manage your wishlist.", type: "warning" }));
      return;
    }

    const isFav = productIds.includes(productId);

    if (isFav) {
      // 1. Update Redux optimistically
      dispatch(removeLocalWish(productId));
      dispatch(addToast({ message: "Product removed from wishlist.", type: "info" }));
      
      // 2. Sync Firestore
      try {
        await deleteWishlistItem(user.uid, productId);
      } catch (err) {
        console.warn("Failed to sync wishlist item deletion with server:", err);
      }
    } else {
      // 1. Update Redux optimistically
      dispatch(addLocalWish(productId));
      dispatch(addToast({ message: "Product added to wishlist!", type: "success" }));

      // 2. Sync Firestore
      try {
        await addWishlistItem(user.uid, productId);
      } catch (err) {
        console.warn("Failed to sync wishlist item addition with server:", err);
      }
    }
  };

  const isInWishlist = (productId: string) => productIds.includes(productId);

  return {
    wishlist: productIds,
    toggleWishlist,
    isInWishlist,
    syncWishlist
  };
};
