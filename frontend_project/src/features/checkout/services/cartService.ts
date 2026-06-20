import { 
  collection, 
  doc, 
  getDocs, 
  query, 
  where, 
  setDoc, 
  deleteDoc, 
  writeBatch,
  getDoc
} from "firebase/firestore";
import { db } from "../../../config/firebase";
import { CartItem } from "../types/cartTypes";
// Unused Product import removed

// Fetch user's cart from Firestore
export const fetchUserCart = async (userId: string): Promise<CartItem[]> => {
  const cartsRef = collection(db, "carts");
  const q = query(cartsRef, where("userId", "==", userId));
  const snapshot = await getDocs(q);

  const items: CartItem[] = [];
  
  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    
    // Resolve product metadata
    const prodDocRef = doc(db, "products", data.productId);
    const prodDoc = await getDoc(prodDocRef);
    const prodData = prodDoc.exists() ? prodDoc.data() : null;

    items.push({
      id: docSnap.id,
      userId: data.userId,
      productId: data.productId,
      name: prodData?.name || "Product",
      image: prodData?.image || "",
      size: data.size || "M",
      color: data.color || "White",
      quantity: Number(data.quantity || 1),
      price: Number(prodData?.newPrice || prodData?.new_price || 0)
    });
  }

  return items;
};

// Add or update quantity of item in Firestore
export const addOrUpdateCartItem = async (
  userId: string, 
  productId: string, 
  size: string, 
  color: string, 
  qty: number
): Promise<void> => {
  const docId = `${userId}_${productId}_${size}_${color}`;
  const docRef = doc(db, "carts", docId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    await setDoc(docRef, {
      userId,
      productId,
      size,
      color,
      quantity: data.quantity + qty,
      updatedAt: new Date()
    });
  } else {
    await setDoc(docRef, {
      userId,
      productId,
      size,
      color,
      quantity: qty,
      updatedAt: new Date()
    });
  }
};

// Update exact quantity in Firestore
export const updateCartItemQty = async (
  userId: string,
  productId: string,
  size: string,
  color: string,
  qty: number
): Promise<void> => {
  const docId = `${userId}_${productId}_${size}_${color}`;
  const docRef = doc(db, "carts", docId);
  await setDoc(docRef, {
    userId,
    productId,
    size,
    color,
    quantity: qty,
    updatedAt: new Date()
  });
};

// Delete item from Firestore
export const deleteCartItemDoc = async (
  userId: string,
  productId: string,
  size: string,
  color: string
): Promise<void> => {
  const docId = `${userId}_${productId}_${size}_${color}`;
  const docRef = doc(db, "carts", docId);
  await deleteDoc(docRef);
};

// Clear entire cart for a user (batch operation)
export const clearUserCartDocs = async (userId: string): Promise<void> => {
  const cartsRef = collection(db, "carts");
  const q = query(cartsRef, where("userId", "==", userId));
  const snapshot = await getDocs(q);

  const batch = writeBatch(db);
  snapshot.docs.forEach((docSnap) => {
    batch.delete(docSnap.ref);
  });

  await batch.commit();
};

// Merge guest local cart with user database cart on sign in
export const mergeGuestCart = async (userId: string, localItems: CartItem[]): Promise<void> => {
  for (const item of localItems) {
    await addOrUpdateCartItem(userId, item.productId, item.size, item.color, item.quantity);
  }
};
