import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useWishlist } from "../features/catalog/hooks/useWishlist";
import { fetchProducts } from "../features/catalog/services/productService";
import { Product } from "../features/catalog/types/productTypes";
import ProductCard from "../Components/ProductCard";
import { HeartCrack, Loader2 } from "lucide-react";
import "../Styles/productGrid.css";

export const Wishlist: React.FC = () => {
  const { wishlist, toggleWishlist } = useWishlist();
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts();
        setProductsList(data);
      } catch (err) {
        console.error("Failed to load wishlist products:", err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  // Filter products in wishlist
  const wishlistedProducts = productsList.filter(prod => 
    wishlist.includes(prod.id)
  );

  const handleClearAll = () => {
    // Toggle off each item from the wishlist
    wishlistedProducts.forEach(prod => {
      toggleWishlist(prod.id);
    });
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-bg-primary text-text-primary">
        <Loader2 size={36} className="animate-spin text-accent-pink mb-4" />
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Loading saved styles...</span>
      </div>
    );
  }

  return (
    <main className="container" style={{ padding: "var(--space-8) var(--space-4) var(--space-12) var(--space-4)", minHeight: "60vh", color: 'var(--text-primary)' }}>
      {/* Title */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "var(--space-6)", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "var(--text-3xl)", fontWeight: "900", letterSpacing: "-0.5px" }}>My Wishlist</h1>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
            Saved styles you are currently eyeing.
          </p>
        </div>
        {wishlistedProducts.length > 0 && (
          <button
            onClick={handleClearAll}
            style={{ color: "#ef4444", fontSize: "13px", fontWeight: "700", border: "none", background: "none", cursor: "pointer", borderBottom: "1.5px solid #fca5a5", padding: "2px 0" }}
          >
            Clear All Saved Items
          </button>
        )}
      </div>

      {/* Grid displays */}
      {wishlistedProducts.length === 0 ? (
        <div 
          style={{ 
            textAlign: "center", 
            padding: "80px 24px", 
            border: "1px dashed var(--border-color)", 
            borderRadius: "16px",
            backgroundColor: "var(--bg-secondary)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px"
          }}
        >
          <HeartCrack size={48} style={{ color: "var(--text-muted)" }} />
          <h3 style={{ margin: 0, fontWeight: "800" }}>Your Wishlist is Empty</h3>
          <p style={{ margin: 0, fontSize: "var(--text-sm)", color: "var(--text-secondary)", maxWidth: "340px", lineHeight: "1.5" }}>
            Add items to your wishlist by clicking the heart button floating on product cards in catalog listings.
          </p>
          <Link to="/catalog">
            <button 
              className="interactive-target"
              style={{
                backgroundColor: "var(--accent-pink)",
                color: "white",
                fontWeight: "700",
                padding: "0 24px",
                borderRadius: "var(--border-radius-full)",
                height: "44px",
                border: "none",
                fontSize: "0.85rem",
                cursor: "pointer"
              }}
            >
              Browse Products
            </button>
          </Link>
        </div>
      ) : (
        <div className="product-grid">
          {wishlistedProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      )}
    </main>
  );
};

export default Wishlist;
