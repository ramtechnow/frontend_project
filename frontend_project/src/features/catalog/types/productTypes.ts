export interface ProductVariant {
  color: string;
  stock: number;
  price?: number;
}

export interface Product {
  id: string; // Document ID (e.g. "prod_123" or MongoDB-style string)
  name: string;
  description: string;
  category: string; // "men" | "women" | "kid"
  newPrice: number;
  oldPrice: number;
  sizes: string[];
  colors: string[];
  variants: ProductVariant[];
  stockCount: number;
  image: string; // Storage or static URL
  available: boolean;
  createdAt: any;
}
