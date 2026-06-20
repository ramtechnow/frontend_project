import { 
  collection, 
  doc, 
  getDocs, 
  query, 
  where, 
  setDoc, 
  deleteDoc
} from "firebase/firestore";
import { db } from "../../../config/firebase";

// Fetch user's wishlist from Firestore
export const fetchUserWishlist = async (userId: string): Promise<string[]> => {
  const wishlistRef = collection(db, "wishlists");
  const q = query(wishlistRef, where("userId", "==", userId));
  const snapshot = await getDocs(q);

  const productIds: string[] = [];
  snapshot.forEach((docSnap) => {
    productIds.push(docSnap.data().productId);
  });

  return productIds;
};

// Add item to wishlist in Firestore
export const addWishlistItem = async (userId: string, productId: string): Promise<void> => {
  const docId = `${userId}_${productId}`;
  const docRef = doc(db, "wishlists", docId);
  await setDoc(docRef, {
    userId,
    productId,
    addedAt: new Date()
  });
};

// Remove item from wishlist in Firestore
export const deleteWishlistItem = async (userId: string, productId: string): Promise<void> => {
  const docId = `${userId}_${productId}`;
  const docRef = doc(db, "wishlists", docId);
  await deleteDoc(docRef);
};
