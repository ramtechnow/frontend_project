import { Product } from "../types/productTypes";
import { BACKEND_URL } from "../../../config";

// Fetch all available products with optional filters
export const fetchProducts = async (category?: string): Promise<Product[]> => {
  const res = await fetch(`${BACKEND_URL}/allproducts`);
  if (!res.ok) {
    throw new Error("Failed to fetch products from backend");
  }
  const data = await res.json();
  const list: Product[] = data.map((p: any) => ({
    id: String(p.id),
    name: p.name,
    description: p.description || `Premium quality ${p.name} from RamCart.`,
    category: p.category,
    newPrice: Number(p.new_price || 0),
    oldPrice: Number(p.old_price || 0),
    sizes: p.sizes || ['S', 'M', 'L', 'XL'],
    colors: p.colors || ['Black', 'White'],
    variants: p.variants || [],
    stockCount: Number(p.stockCount || 0),
    image: p.image || "",
    available: p.available !== false,
    createdAt: p.date
  }));

  if (category) {
    return list.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  }

  return list;
};

// Fetch single product by ID
export const fetchProductById = async (id: string): Promise<Product | null> => {
  const list = await fetchProducts();
  return list.find((p) => p.id === id) || null;
};

// Fetch related products (same category, excluding current product ID)
export const fetchRelatedProducts = async (category: string, excludeId: string): Promise<Product[]> => {
  const list = await fetchProducts(category);
  return list.filter((p) => p.id !== excludeId).slice(0, 4);
};

