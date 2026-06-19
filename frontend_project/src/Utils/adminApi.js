import { BACKEND_URL } from '../config';

const getHeaders = () => {
  const token = localStorage.getItem('auth-token');
  return {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...(token ? { 'auth-token': token } : {})
  };
};

export const adminApi = {
  // Auth Verification
  async verifyAdmin() {
    const res = await fetch(`${BACKEND_URL}/admin/verify`, {
      method: 'GET',
      headers: getHeaders(),
    });
    if (!res.ok) {
      throw new Error(`Auth failed with status ${res.status}`);
    }
    return res.json();
  },

  // Products CRUD
  async fetchProducts() {
    const res = await fetch(`${BACKEND_URL}/allproducts`);
    if (!res.ok) {
      throw new Error('Failed to fetch product catalog');
    }
    return res.json();
  },

  async addProduct(productData) {
    const res = await fetch(`${BACKEND_URL}/addproduct`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(productData),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.errors || 'Failed to add product');
    }
    return data;
  },

  async updateProduct(productData) {
    const res = await fetch(`${BACKEND_URL}/updateproduct`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(productData),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to update product');
    }
    return data;
  },

  async removeProduct(id) {
    const res = await fetch(`${BACKEND_URL}/removeproduct`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.errors || 'Failed to delete product');
    }
    return data;
  },

  async updateVariantStock(id, color, change) {
    const res = await fetch(`${BACKEND_URL}/admin/updatevariantstock`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ id, color, change: Number(change) }),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to update variant stock');
    }
    return data;
  },

  // Users Directory
  async fetchUsers() {
    const res = await fetch(`${BACKEND_URL}/admin/users`, {
      method: 'GET',
      headers: getHeaders(),
    });
    if (!res.ok) {
      throw new Error('Failed to fetch accounts directory');
    }
    return res.json();
  },

  async updateUserRole(email, isAdmin) {
    const res = await fetch(`${BACKEND_URL}/admin/updateuserrole`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, isAdmin: Boolean(isAdmin) }),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to update user role');
    }
    return data;
  },

  async deleteUser(email) {
    const res = await fetch(`${BACKEND_URL}/admin/deleteuser`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to delete user account');
    }
    return data;
  },

  // Orders Management
  async fetchOrders() {
    const res = await fetch(`${BACKEND_URL}/admin/orders`, {
      method: 'GET',
      headers: getHeaders(),
    });
    if (!res.ok) {
      throw new Error('Failed to fetch order history');
    }
    return res.json();
  },

  async updateOrderStatus(orderId, status) {
    const res = await fetch(`${BACKEND_URL}/admin/orders/status`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ orderId, status }),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to update order status');
    }
    return data;
  },

  // Coupons / Promotions
  async fetchCoupons() {
    const res = await fetch(`${BACKEND_URL}/admin/coupons`, {
      method: 'GET',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch coupons');
    }
    return data.coupons;
  },

  async createCoupon(couponData) {
    const res = await fetch(`${BACKEND_URL}/admin/coupons/create`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        code: couponData.code,
        discountType: couponData.discountType,
        discountValue: Number(couponData.discountValue),
        minOrderAmount: couponData.minOrderAmount ? Number(couponData.minOrderAmount) : 0,
        maxUses: couponData.maxUses ? Number(couponData.maxUses) : 0,
        expiresAt: couponData.expiresAt || null,
      }),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to create coupon');
    }
    return data;
  },

  async toggleCoupon(couponId) {
    const res = await fetch(`${BACKEND_URL}/admin/coupons/toggle`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ couponId }),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to toggle coupon status');
    }
    return data;
  },

  async deleteCoupon(couponId) {
    const res = await fetch(`${BACKEND_URL}/admin/coupons/delete`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ couponId }),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to delete coupon');
    }
    return data;
  }
};
