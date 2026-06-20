import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../config/firebase";
import { Product } from "../types/productTypes";

// Fetch all available products with optional filters
export const fetchProducts = async (category?: string): Promise<Product[]> => {
  const productsRef = collection(db, "products");
  let firestoreQuery = query(productsRef, where("available", "==", true));

  if (category) {
    firestoreQuery = query(productsRef, where("available", "==", true), where("category", "==", category));
  }

  const querySnapshot = await getDocs(firestoreQuery);
  const productsList: Product[] = [];

  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    productsList.push({
      id: docSnap.id,
      name: data.name,
      description: data.description || "",
      category: data.category,
      newPrice: Number(data.newPrice || data.new_price || 0),
      oldPrice: Number(data.oldPrice || data.old_price || 0),
      sizes: data.sizes || [],
      colors: data.colors || [],
      variants: data.variants || [],
      stockCount: Number(data.stockCount || data.stock_count || 0),
      image: data.image,
      available: data.available !== false,
      createdAt: data.createdAt
    });
  });

  return productsList;
};

// Fetch single product by Document ID
export const fetchProductById = async (id: string): Promise<Product | null> => {
  const docRef = doc(db, "products", id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;

  const data = docSnap.data();
  return {
    id: docSnap.id,
    name: data.name,
    description: data.description || "",
    category: data.category,
    newPrice: Number(data.newPrice || data.new_price || 0),
    oldPrice: Number(data.oldPrice || data.old_price || 0),
    sizes: data.sizes || [],
    colors: data.colors || [],
    variants: data.variants || [],
    stockCount: Number(data.stockCount || data.stock_count || 0),
    image: data.image,
    available: data.available !== false,
    createdAt: data.createdAt
  };
};

// Fetch related products (same category, excluding current product ID)
export const fetchRelatedProducts = async (category: string, excludeId: string): Promise<Product[]> => {
  const productsRef = collection(db, "products");
  const q = query(
    productsRef,
    where("available", "==", true),
    where("category", "==", category)
  );

  const querySnapshot = await getDocs(q);
  const list: Product[] = [];

  querySnapshot.forEach((docSnap) => {
    if (docSnap.id === excludeId) return;
    const data = docSnap.data();
    list.push({
      id: docSnap.id,
      name: data.name,
      description: data.description || "",
      category: data.category,
      newPrice: Number(data.newPrice || data.new_price || 0),
      oldPrice: Number(data.oldPrice || data.old_price || 0),
      sizes: data.sizes || [],
      colors: data.colors || [],
      variants: data.variants || [],
      stockCount: Number(data.stockCount || data.stock_count || 0),
      image: data.image,
      available: data.available !== false,
      createdAt: data.createdAt
    });
  });

  return list.slice(0, 4); // Limit to 4 related products
};
