export interface CartItem {
  id: string; // Firestore Document ID (or constructed key for guest items)
  userId: string;
  productId: string;
  name: string;
  image: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
}

export interface GuestCartItem {
  key: string; // e.g., "prod_123-M-Black"
  productId: string;
  size: string;
  color: string;
  quantity: number;
}
