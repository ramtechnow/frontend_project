import { Product } from "../types/productTypes";
import { BACKEND_URL } from "../../../config";
// @ts-ignore
import fallbackProductsData from "../../../data/products.js";

const getFallbackProducts = (): Product[] => {
  if (!Array.isArray(fallbackProductsData)) return [];
  return fallbackProductsData.map((p: any) => ({
    id: String(p.id),
    name: p.name,
    description: p.description || `Premium quality ${p.name} from RamCart.`,
    category: p.category === "kid" ? "kids" : p.category,
    newPrice: Number(p.new_price || 0),
    oldPrice: Number(p.old_price || 0),
    sizes: p.sizes || ['S', 'M', 'L', 'XL'],
    colors: p.colors || ['Black', 'White'],
    variants: p.variants || [],
    stockCount: Number(p.stockCount || 10),
    image: p.image || "",
    images: p.images || [],
    available: true,
    createdAt: new Date().toISOString()
  }));
};

// Fetch all available products with instant fallback guarantee
export const fetchProducts = async (category?: string): Promise<Product[]> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s quick timeout

  try {
    const res = await fetch(`${BACKEND_URL}/allproducts`, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error("Failed to fetch products from backend");
    }
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("Empty backend products response");
    }

    const list: Product[] = data.map((p: any) => ({
      id: String(p.id),
      name: p.name,
      description: p.description || `Premium quality ${p.name} from RamCart.`,
      category: p.category === "kid" ? "kids" : p.category,
      newPrice: Number(p.new_price || 0),
      oldPrice: Number(p.old_price || 0),
      sizes: p.sizes || ['S', 'M', 'L', 'XL'],
      colors: p.colors || ['Black', 'White'],
      variants: p.variants || [],
      stockCount: Number(p.stockCount || 0),
      image: p.image || "",
      images: p.images || [],
      available: p.available !== false,
      createdAt: p.date
    }));

    if (category) {
      const filtered = list.filter((p) => p.category.toLowerCase() === category.toLowerCase());
      return filtered.length > 0 ? filtered : getFallbackProducts().filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }

    return list;
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn("fetchProducts API failed or cold-starting, returning fallback catalog:", err);
    const fallbacks = getFallbackProducts();
    if (category) {
      return fallbacks.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }
    return fallbacks;
  }
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
