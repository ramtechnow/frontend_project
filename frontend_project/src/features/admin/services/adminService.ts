import { BACKEND_URL } from "../../../config";
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
  async verifyAdmin(): Promise<boolean> {
    try {
      const token = localStorage.getItem("auth-token");
      if (!token) return false;
      const res = await fetch(`${BACKEND_URL}/admin/verify`, {
        headers: { "auth-token": token }
      });
      return res.ok;
    } catch (err) {
      console.error("Error verifying admin status:", err);
      return false;
    }
  },

  // ── Products Management ──────────────────────────────────────────────────
  async fetchProducts(): Promise<Product[]> {
    const res = await fetch(`${BACKEND_URL}/allproducts`);
    if (!res.ok) throw new Error("Failed to fetch products");
    const data = await res.json();
    return data.map((p: any) => ({
      id: String(p.id),
      name: p.name || "",
      description: p.description || `Premium quality ${p.name} from RamCart.`,
      category: p.category || "men",
      newPrice: Number(p.new_price || 0),
      oldPrice: Number(p.old_price || 0),
      sizes: p.sizes || [],
      colors: p.colors || [],
      variants: p.variants || [],
      stockCount: Number(p.stockCount || 0),
      image: p.image || "",
      available: p.available !== false,
      createdAt: p.date
    }));
  },

  async addProduct(productData: Omit<Product, "id" | "createdAt">): Promise<void> {
    const token = localStorage.getItem("auth-token");
    const res = await fetch(`${BACKEND_URL}/addproduct`, {
      method: "POST",
      headers: {
        "auth-token": token || "",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: productData.name,
        description: productData.description || "",
        category: productData.category,
        new_price: Number(productData.newPrice),
        old_price: Number(productData.oldPrice),
        sizes: productData.sizes || [],
        colors: productData.colors || [],
        variants: productData.variants || [],
        image: productData.image || ""
      })
    });
    if (!res.ok) throw new Error("Failed to add product");
  },

  async updateProduct(id: string, productData: Partial<Product>): Promise<void> {
    const token = localStorage.getItem("auth-token");
    const res = await fetch(`${BACKEND_URL}/updateproduct`, {
      method: "POST",
      headers: {
        "auth-token": token || "",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id: Number(id.replace("prod_", "")) || Number(id),
        name: productData.name,
        new_price: productData.newPrice !== undefined ? Number(productData.newPrice) : undefined,
        old_price: productData.oldPrice !== undefined ? Number(productData.oldPrice) : undefined,
        variants: productData.variants,
        image: productData.image
      })
    });
    if (!res.ok) throw new Error("Failed to update product");
  },

  async removeProduct(id: string): Promise<void> {
    const token = localStorage.getItem("auth-token");
    const res = await fetch(`${BACKEND_URL}/removeproduct`, {
      method: "POST",
      headers: {
        "auth-token": token || "",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ id: Number(id.replace("prod_", "")) || Number(id) })
    });
    if (!res.ok) throw new Error("Failed to remove product");
  },

  async updateVariantStock(id: string, color: string, change: number): Promise<void> {
    const token = localStorage.getItem("auth-token");
    const res = await fetch(`${BACKEND_URL}/admin/updatevariantstock`, {
      method: "POST",
      headers: {
        "auth-token": token || "",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id: Number(id.replace("prod_", "")) || Number(id),
        color,
        change
      })
    });
    if (!res.ok) throw new Error("Failed to update variant stock");
  },

  // ── Users Management ─────────────────────────────────────────────────────
  async fetchUsers(): Promise<any[]> {
    const token = localStorage.getItem("auth-token");
    const res = await fetch(`${BACKEND_URL}/admin/users`, {
      headers: { "auth-token": token || "" }
    });
    if (!res.ok) throw new Error("Failed to fetch users");
    const data = await res.json();
    return data.map((u: any) => ({
      uid: u._id || String(u.id),
      name: u.name || "Customer",
      email: u.email || "",
      role: u.role || (u.isAdmin ? "admin" : "customer"),
      isAdmin: u.isAdmin || u.role === "admin",
      createdAt: u.date ? new Date(u.date).toISOString() : new Date().toISOString(),
      cartData: u.cartData || {}
    }));
  },

  async updateUserRole(email: string, isAdmin: boolean): Promise<void> {
    const token = localStorage.getItem("auth-token");
    const res = await fetch(`${BACKEND_URL}/admin/updateuserrole`, {
      method: "POST",
      headers: {
        "auth-token": token || "",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, isAdmin })
    });
    if (!res.ok) throw new Error("Failed to update user role");
  },

  async deleteUser(email: string): Promise<void> {
    const token = localStorage.getItem("auth-token");
    const res = await fetch(`${BACKEND_URL}/admin/deleteuser`, {
      method: "POST",
      headers: {
        "auth-token": token || "",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email })
    });
    if (!res.ok) throw new Error("Failed to delete user");
  },

  // ── Orders Management ────────────────────────────────────────────────────
  async fetchOrders(): Promise<Order[]> {
    const token = localStorage.getItem("auth-token");
    const res = await fetch(`${BACKEND_URL}/admin/orders`, {
      headers: { "auth-token": token || "" }
    });
    if (!res.ok) throw new Error("Failed to fetch orders");
    const data = await res.json();
    return data.map((order: any) => ({
      id: order._id || order.id,
      userId: order.userId,
      items: order.items || [],
      amount: Number(order.amount),
      address: order.address,
      couponCode: order.couponCode,
      status: order.status || "Pending",
      payment: order.payment !== false,
      createdAt: order.date ? new Date(order.date).toISOString() : new Date().toISOString()
    })) as Order[];
  },

  async updateOrderStatus(orderId: string, status: Order["status"]): Promise<void> {
    const token = localStorage.getItem("auth-token");
    const res = await fetch(`${BACKEND_URL}/admin/orders/status`, {
      method: "POST",
      headers: {
        "auth-token": token || "",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ orderId, status })
    });
    if (!res.ok) throw new Error("Failed to update order status");
  },

  // ── Coupons Management ───────────────────────────────────────────────────
  async fetchCoupons(): Promise<AdminCoupon[]> {
    const token = localStorage.getItem("auth-token");
    const res = await fetch(`${BACKEND_URL}/admin/coupons`, {
      headers: { "auth-token": token || "" }
    });
    if (!res.ok) throw new Error("Failed to fetch coupons");
    const data = await res.json();
    const list = data.coupons || data;
    return list.map((c: any) => ({
      code: c.code,
      discountType: c.discountType || "flat",
      discountValue: Number(c.discountValue) || 0,
      minOrderAmount: Number(c.minOrderAmount) || 0,
      maxUses: Number(c.maxUses) || 0,
      usedCount: Number(c.usedCount) || 0,
      isActive: c.isActive !== false,
      expiresAt: c.expiresAt ? new Date(c.expiresAt).toISOString() : null
    }));
  },

  async createCoupon(couponData: Omit<AdminCoupon, "usedCount">): Promise<void> {
    const token = localStorage.getItem("auth-token");
    const res = await fetch(`${BACKEND_URL}/admin/coupons/create`, {
      method: "POST",
      headers: {
        "auth-token": token || "",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        code: couponData.code,
        discountType: couponData.discountType,
        discountValue: Number(couponData.discountValue),
        minOrderAmount: Number(couponData.minOrderAmount || 0),
        maxUses: Number(couponData.maxUses || 0),
        expiresAt: couponData.expiresAt ? new Date(couponData.expiresAt).toISOString() : null
      })
    });
    if (!res.ok) throw new Error("Failed to create coupon");
  },

  async toggleCoupon(code: string): Promise<void> {
    const token = localStorage.getItem("auth-token");
    const res = await fetch(`${BACKEND_URL}/admin/coupons/toggle`, {
      method: "POST",
      headers: {
        "auth-token": token || "",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ code: code.toUpperCase() })
    });
    if (!res.ok) throw new Error("Failed to toggle coupon");
  },

  async deleteCoupon(code: string): Promise<void> {
    const token = localStorage.getItem("auth-token");
    const res = await fetch(`${BACKEND_URL}/admin/coupons/delete`, {
      method: "POST",
      headers: {
        "auth-token": token || "",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ code: code.toUpperCase() })
    });
    if (!res.ok) throw new Error("Failed to delete coupon");
  }
};
