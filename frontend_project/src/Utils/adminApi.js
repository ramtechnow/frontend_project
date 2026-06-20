import { auth, db } from "../config/firebase";
import { adminService } from "../features/admin/services/adminService";
import { collection, query, where, getDocs } from "firebase/firestore";

export const adminApi = {
  // Auth Verification
  async verifyAdmin() {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("No authenticated session found.");
    }
    const isAdmin = await adminService.verifyAdmin(user.uid);
    return { 
      success: isAdmin, 
      user: { 
        email: user.email, 
        name: user.displayName || user.email?.split("@")[0] || "Admin",
        isAdmin 
      } 
    };
  },

  // Products CRUD
  async fetchProducts() {
    return adminService.fetchProducts();
  },

  async addProduct(productData) {
    // Convert old price fields if necessary
    const formatted = {
      name: productData.name,
      description: productData.description || "",
      category: productData.category,
      newPrice: Number(productData.newPrice || productData.new_price) || 0,
      oldPrice: Number(productData.oldPrice || productData.old_price) || 0,
      sizes: productData.sizes || [],
      colors: productData.colors || [],
      variants: productData.variants || [],
      stockCount: Number(productData.stockCount) || 0,
      image: productData.image || "",
      available: productData.available !== false
    };
    await adminService.addProduct(formatted);
    return { success: true };
  },

  async updateProduct(productData) {
    const id = productData.id;
    if (!id) throw new Error("Product ID is required for update.");
    
    const formatted = {
      ...productData,
      newPrice: productData.newPrice !== undefined ? Number(productData.newPrice) : undefined,
      oldPrice: productData.oldPrice !== undefined ? Number(productData.oldPrice) : undefined,
      stockCount: productData.stockCount !== undefined ? Number(productData.stockCount) : undefined
    };
    await adminService.updateProduct(id, formatted);
    return { success: true };
  },

  async removeProduct(id) {
    await adminService.removeProduct(id);
    return { success: true };
  },

  async updateVariantStock(id, color, change) {
    await adminService.updateVariantStock(id, color, Number(change));
    return { success: true };
  },

  // Users Directory
  async fetchUsers() {
    return adminService.fetchUsers();
  },

  async updateUserRole(email, isAdmin) {
    const q = query(collection(db, "users"), where("email", "==", email));
    const snap = await getDocs(q);
    if (snap.empty) {
      throw new Error(`User with email "${email}" not found.`);
    }
    const userId = snap.docs[0].id;
    await adminService.updateUserRole(userId, isAdmin ? "admin" : "customer");
    return { success: true };
  },

  async deleteUser(email) {
    const q = query(collection(db, "users"), where("email", "==", email));
    const snap = await getDocs(q);
    if (snap.empty) {
      throw new Error(`User with email "${email}" not found.`);
    }
    const userId = snap.docs[0].id;
    await adminService.deleteUser(userId);
    return { success: true };
  },

  // Orders Management
  async fetchOrders() {
    // Map order fields back to the old order schema properties (e.g. _id instead of id, date instead of createdAt)
    const list = await adminService.fetchOrders();
    return list.map((order) => ({
      ...order,
      _id: order.id,
      date: order.createdAt?.toDate ? order.createdAt.toDate().toISOString() : new Date(order.createdAt).toISOString()
    }));
  },

  async updateOrderStatus(orderId, status) {
    await adminService.updateOrderStatus(orderId, status);
    return { success: true };
  },

  // Coupons / Promotions
  async fetchCoupons() {
    const coupons = await adminService.fetchCoupons();
    return { success: true, coupons };
  },

  async createCoupon(couponData) {
    await adminService.createCoupon({
      code: couponData.code,
      discountType: couponData.discountType,
      discountValue: Number(couponData.discountValue),
      minOrderAmount: Number(couponData.minOrderAmount || 0),
      maxUses: Number(couponData.maxUses || 0),
      isActive: true,
      expiresAt: couponData.expiresAt ? new Date(couponData.expiresAt) : null
    });
    return { success: true };
  },

  async toggleCoupon(couponId) {
    await adminService.toggleCoupon(couponId);
    return { success: true };
  },

  async deleteCoupon(couponId) {
    await adminService.deleteCoupon(couponId);
    return { success: true };
  }
};
