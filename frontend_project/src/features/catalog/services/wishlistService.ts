import { BACKEND_URL } from "../../../config";

// Fetch user's wishlist from Express backend
export const fetchUserWishlist = async (_userId: string): Promise<string[]> => {
  const token = localStorage.getItem("auth-token");
  if (!token) return [];
  
  const res = await fetch(`${BACKEND_URL}/getwishlist`, {
    method: "GET",
    headers: {
      "auth-token": token,
      "Content-Type": "application/json"
    }
  });
  
  if (!res.ok) throw new Error("Failed to fetch wishlist");
  const data = await res.json();
  // Map values to string since database might return numbers or strings
  return data.map((id: any) => String(id));
};

// Add item to wishlist in backend
export const addWishlistItem = async (_userId: string, productId: string): Promise<void> => {
  const token = localStorage.getItem("auth-token");
  if (!token) return;
  
  const res = await fetch(`${BACKEND_URL}/addtowishlist`, {
    method: "POST",
    headers: {
      "auth-token": token,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ itemId: Number(productId) || productId })
  });
  
  if (!res.ok) throw new Error("Failed to add to wishlist");
};

// Remove item from wishlist in backend
export const deleteWishlistItem = async (_userId: string, productId: string): Promise<void> => {
  const token = localStorage.getItem("auth-token");
  if (!token) return;
  
  const res = await fetch(`${BACKEND_URL}/removefromwishlist`, {
    method: "POST",
    headers: {
      "auth-token": token,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ itemId: Number(productId) || productId })
  });
  
  if (!res.ok) throw new Error("Failed to remove from wishlist");
};

