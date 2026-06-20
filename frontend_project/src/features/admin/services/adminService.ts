import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  serverTimestamp,
  getDoc
} from "firebase/firestore";
import { db } from "../../../config/firebase";
import { Product } from "../../catalog/types/productTypes";
import { Order } from "../../checkout/types/orderTypes";

export interface AdminCoupon {
  code: string;
  discountType: "percentage" | "flat";
  discountValue: number;
  minOrderAmount: number;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  expiresAt: any;
}

export interface AdminUser {
  uid: string;
  name: string;
  email: string;
  role: "admin" | "customer";
  createdAt: any;
}

export const adminService = {
  // ── Verify Admin status locally ──────────────────────────────────────────
  async verifyAdmin(uid: string): Promise<boolean> {
    try {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        return data.role === "admin";
      }
      return false;
    } catch (err) {
      console.error("Error verifying admin status:", err);
      return false;
    }
  },

  // ── Products Management ──────────────────────────────────────────────────
  async fetchProducts(): Promise<Product[]> {
    const productsRef = collection(db, "products");
    const q = query(productsRef, orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    const list: Product[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      list.push({
        id: docSnap.id,
        name: data.name || "",
        description: data.description || "",
        category: data.category || "men",
        newPrice: Number(data.newPrice) || 0,
        oldPrice: Number(data.oldPrice) || 0,
        sizes: data.sizes || [],
        colors: data.colors || [],
        variants: data.variants || [],
        stockCount: Number(data.stockCount) || 0,
        image: data.image || "",
        available: data.available !== false,
        createdAt: data.createdAt
      });
    });
    return list;
  },

  async addProduct(productData: Omit<Product, "id" | "createdAt">): Promise<void> {
    const newDocId = `prod_${Math.floor(100000 + Math.random() * 900000)}`;
    const docRef = doc(db, "products", newDocId);
    
    await setDoc(docRef, {
      ...productData,
      newPrice: Number(productData.newPrice),
      oldPrice: Number(productData.oldPrice),
      stockCount: Number(productData.stockCount),
      createdAt: serverTimestamp()
    });
  },

  async updateProduct(id: string, productData: Partial<Product>): Promise<void> {
    const docRef = doc(db, "products", id);
    const cleanedData = { ...productData };
    delete cleanedData.id;
    delete cleanedData.createdAt;

    if (cleanedData.newPrice !== undefined) cleanedData.newPrice = Number(cleanedData.newPrice);
    if (cleanedData.oldPrice !== undefined) cleanedData.oldPrice = Number(cleanedData.oldPrice);
    if (cleanedData.stockCount !== undefined) cleanedData.stockCount = Number(cleanedData.stockCount);

    await updateDoc(docRef, cleanedData);
  },

  async removeProduct(id: string): Promise<void> {
    const docRef = doc(db, "products", id);
    await deleteDoc(docRef);
  },

  async updateVariantStock(id: string, color: string, change: number): Promise<void> {
    const docRef = doc(db, "products", id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) throw new Error("Product not found");

    const data = snap.data();
    let variants = data.variants || [];
    let overallStock = Number(data.stockCount) || 0;

    variants = variants.map((v: any) => {
      if (v.color.toLowerCase() === color.toLowerCase()) {
        const newStock = Math.max(0, v.stock + change);
        overallStock += (newStock - v.stock);
        return { ...v, stock: newStock };
      }
      return v;
    });

    await updateDoc(docRef, {
      variants,
      stockCount: overallStock,
      available: overallStock > 0
    });
  },

  // ── Users Management ─────────────────────────────────────────────────────
  async fetchUsers(): Promise<any[]> {
    const usersRef = collection(db, "users");
    const q = query(usersRef, orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    
    const cartsRef = collection(db, "carts");
    const cartsSnap = await getDocs(cartsRef);
    const cartItemsMap: Record<string, any[]> = {};
    
    cartsSnap.forEach((docSnap) => {
      const c = docSnap.data();
      const userId = c.userId;
      if (userId) {
        if (!cartItemsMap[userId]) {
          cartItemsMap[userId] = [];
        }
        cartItemsMap[userId].push(c);
      }
    });

    const list: any[] = [];
    snap.forEach((docSnap) => {
      const uid = docSnap.id;
      const data = docSnap.data();
      
      const cartData: Record<string, any> = {};
      const userCarts = cartItemsMap[uid] || [];
      userCarts.forEach((c) => {
        const key = `${c.productId}-${c.size}-${c.color}`;
        cartData[key] = {
          quantity: c.quantity,
          size: c.size,
          color: c.color,
          id: c.productId
        };
      });

      list.push({
        uid,
        name: data.name || "Customer",
        email: data.email || "",
        role: data.role || "customer",
        isAdmin: data.role === "admin",
        createdAt: data.createdAt,
        cartData
      });
    });
    return list;
  },

  async updateUserRole(uid: string, role: "admin" | "customer"): Promise<void> {
    const docRef = doc(db, "users", uid);
    await updateDoc(docRef, { role });
  },

  async deleteUser(uid: string): Promise<void> {
    const docRef = doc(db, "users", uid);
    await deleteDoc(docRef);
  },

  // ── Orders Management ────────────────────────────────────────────────────
  async fetchOrders(): Promise<Order[]> {
    const ordersRef = collection(db, "orders");
    const q = query(ordersRef, orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    const list: Order[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      list.push({
        id: docSnap.id,
        ...data
      } as Order);
    });
    return list;
  },

  async updateOrderStatus(orderId: string, status: Order["status"]): Promise<void> {
    const docRef = doc(db, "orders", orderId);
    await updateDoc(docRef, { status });
  },

  // ── Coupons Management ───────────────────────────────────────────────────
  async fetchCoupons(): Promise<AdminCoupon[]> {
    const couponsRef = collection(db, "coupons");
    const snap = await getDocs(couponsRef);
    const list: AdminCoupon[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      list.push({
        code: docSnap.id,
        discountType: data.discountType || "flat",
        discountValue: Number(data.discountValue) || 0,
        minOrderAmount: Number(data.minOrderAmount) || 0,
        maxUses: Number(data.maxUses) || 0,
        usedCount: Number(data.usedCount) || 0,
        isActive: data.isActive !== false,
        expiresAt: data.expiresAt
      });
    });
    return list;
  },

  async createCoupon(couponData: Omit<AdminCoupon, "usedCount">): Promise<void> {
    const code = couponData.code.toUpperCase().trim();
    const docRef = doc(db, "coupons", code);
    await setDoc(docRef, {
      ...couponData,
      code,
      discountValue: Number(couponData.discountValue),
      minOrderAmount: Number(couponData.minOrderAmount),
      maxUses: Number(couponData.maxUses),
      usedCount: 0,
      isActive: true
    });
  },

  async toggleCoupon(code: string): Promise<void> {
    const docRef = doc(db, "coupons", code.toUpperCase());
    const snap = await getDoc(docRef);
    if (!snap.exists()) throw new Error("Coupon not found");
    const currentStatus = snap.data().isActive;
    await updateDoc(docRef, { isActive: !currentStatus });
  },

  async deleteCoupon(code: string): Promise<void> {
    const docRef = doc(db, "coupons", code.toUpperCase());
    await deleteDoc(docRef);
  }
};
