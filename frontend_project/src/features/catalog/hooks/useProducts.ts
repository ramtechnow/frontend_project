import { useQuery } from "@tanstack/react-query";
import { fetchProducts, fetchProductById, fetchRelatedProducts } from "../services/productService";

// Hook to query list of products
export const useProducts = (category?: string) => {
  return useQuery({
    queryKey: ["products", category || "all"],
    queryFn: () => fetchProducts(category),
    staleTime: 1000 * 60 * 5, // 5 minutes cache stale time
    gcTime: 1000 * 60 * 10 // Keep in cache for 10 minutes
  });
};

// Hook to query a single product detail
export const useProductDetail = (id: string) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchProductById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5
  });
};

// Hook to query related products
export const useRelatedProducts = (category: string, excludeId: string) => {
  return useQuery({
    queryKey: ["products", "related", category, excludeId],
    queryFn: () => fetchRelatedProducts(category, excludeId),
    enabled: !!category && !!excludeId,
    staleTime: 1000 * 60 * 5
  });
};
