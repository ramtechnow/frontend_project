import { 
  collection, 
  doc, 
  runTransaction, 
  serverTimestamp, 
  getDocs, 
  query, 
  where, 
  orderBy,
  getDoc
} from "firebase/firestore";
import { db } from "../../../config/firebase";
import { Order, OrderItem, AddressValues } from "../types/orderTypes";

// Fetch coupon details and validate eligibility
export const validateCoupon = async (code: string, cartTotal: number): Promise<{
  success: boolean;
  discountAmount?: number;
  finalTotal?: number;
  message?: string;
  error?: string;
}> => {
  try {
    const couponRef = doc(db, "coupons", code.toUpperCase());
    const couponSnap = await getDoc(couponRef);

    if (!couponSnap.exists()) {
      return { success: false, error: "Invalid coupon code." };
    }

    const data = couponSnap.data();

    if (!data.isActive) {
      return { success: false, error: "Coupon is no longer active." };
    }

    if (data.usedCount >= data.maxUses) {
      return { success: false, error: "Coupon usage limit has been reached." };
    }

    const expiryDate = data.expiresAt?.toDate ? data.expiresAt.toDate() : new Date(data.expiresAt);
    if (expiryDate < new Date()) {
      return { success: false, error: "Coupon has expired." };
    }

    if (cartTotal < data.minOrderAmount) {
      return { success: false, error: `Minimum order amount of ₹${data.minOrderAmount} required.` };
    }

    let discountAmount = 0;
    if (data.discountType === "percentage") {
      discountAmount = (cartTotal * data.discountValue) / 100;
    } else {
      discountAmount = data.discountValue;
    }

    // Cap discount at the cart total
    discountAmount = Math.min(discountAmount, cartTotal);
    const finalTotal = cartTotal - discountAmount;

    return {
      success: true,
      discountAmount,
      finalTotal,
      message: `Coupon applied successfully! Saving ₹${discountAmount.toFixed(2)}`
    };
  } catch (err: any) {
    console.error("Coupon validation error:", err);
    return { success: false, error: err.message || "Failed to validate coupon." };
  }
};

// Place Order inside a secure Firestore Transaction
export const placeOrderTransaction = async (
  userId: string,
  items: OrderItem[],
  address: AddressValues,
  couponCode: string | null,
  totalAmount: number
): Promise<{ success: boolean; orderId?: string; error?: string }> => {
  try {
    const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const orderRef = doc(db, "orders", orderId);

    await runTransaction(db, async (transaction) => {
      // 1. Validate Coupon (if provided) and increment usage count
      if (couponCode) {
        const couponRef = doc(db, "coupons", couponCode.toUpperCase());
        const couponSnap = await transaction.get(couponRef);

        if (!couponSnap.exists()) {
          throw new Error("Applied coupon does not exist.");
        }

        const couponData = couponSnap.data();

        if (!couponData.isActive) {
          throw new Error("Coupon is no longer active.");
        }

        if (couponData.usedCount >= couponData.maxUses) {
          throw new Error("Coupon usage limit has been reached.");
        }

        const expiryDate = couponData.expiresAt?.toDate ? couponData.expiresAt.toDate() : new Date(couponData.expiresAt);
        if (expiryDate < new Date()) {
          throw new Error("Coupon has expired.");
        }

        // Increment coupon usage
        transaction.update(couponRef, {
          usedCount: couponData.usedCount + 1
        });
      }

      // 2. Validate Inventory for all items and prepare stock updates
      for (const item of items) {
        const productRef = doc(db, "products", item.productId);
        const productSnap = await transaction.get(productRef);

        if (!productSnap.exists()) {
          throw new Error(`Product "${item.name}" no longer exists.`);
        }

        const productData = productSnap.data();

        if (productData.stockCount < item.quantity) {
          throw new Error(`Insufficient stock for "${item.name}". Only ${productData.stockCount} left.`);
        }

        // Compute updated inventory quantities
        const updatedStockCount = productData.stockCount - item.quantity;
        const updatePayload: any = {
          stockCount: updatedStockCount,
          available: updatedStockCount > 0
        };

        // Decrement variant specific inventory if variants exist
        if (productData.variants && Array.isArray(productData.variants)) {
          const updatedVariants = productData.variants.map((variant: any) => {
            if (variant.color.toLowerCase() === item.color.toLowerCase()) {
              if (variant.stock < item.quantity) {
                throw new Error(
                  `Insufficient stock for "${item.name}" in color "${item.color}". Only ${variant.stock} left.`
                );
              }
              return { ...variant, stock: variant.stock - item.quantity };
            }
            return variant;
          });
          updatePayload.variants = updatedVariants;
        }

        transaction.update(productRef, updatePayload);
      }

      // 3. Write Order document
      const orderPayload: Order = {
        userId,
        items,
        amount: totalAmount,
        address,
        couponCode,
        status: "Pending",
        payment: true, // Mark simulated card payment as successful
        createdAt: serverTimestamp()
      };

      transaction.set(orderRef, orderPayload);
    });

    return { success: true, orderId };
  } catch (err: any) {
    console.error("Order transaction failed:", err);
    return { success: false, error: err.message || "Checkout transaction failed." };
  }
};

// Retrieve order history for a user
export const fetchUserOrders = async (userId: string): Promise<Order[]> => {
  try {
    const ordersRef = collection(db, "orders");
    const q = query(
      ordersRef,
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    const orders: Order[] = [];
    
    querySnapshot.forEach((docSnap) => {
      orders.push({
        id: docSnap.id,
        ...docSnap.data()
      } as Order);
    });

    return orders;
  } catch (err: any) {
    console.error("Failed to fetch user orders:", err);
    throw new Error(err.message || "Failed to retrieve purchase history.");
  }
};
