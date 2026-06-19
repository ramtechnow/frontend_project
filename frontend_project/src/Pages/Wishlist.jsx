import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { WishlistContext } from "../Context/WishlistContext";
import { ShopContext } from "../Context/ShopContext";
import products from "../data/products";
import ProductCard from "../components/ProductCard";
import { HeartCrack } from "lucide-react";
import "../styles/productGrid.css";

const Wishlist = () => {
  const { wishlistItems, clearWishlist } = useContext(WishlistContext);
  const { all_product } = useContext(ShopContext) || { all_product: [] };
  const productsList = all_product.length > 0 ? all_product : products;

  // Filter products in wishlist
  const wishlistedProducts = productsList.filter(prod => 
    wishlistItems.includes(Number(prod.id))
  );

  return (
    <main className="container" style={{ padding: "var(--space-6) var(--space-4) var(--space-12) var(--space-4)", minHeight: "60vh" }}>
      {/* Title */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "var(--space-6)", flexWrap: "wrap", gap: "var(--space-3)" }}>
        <div>
          <h1 style={{ fontSize: "var(--text-3xl)", fontWeight: "800" }}>My Wishlist</h1>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
            Saved styles you are currently eyeing.
          </p>
        </div>
        {wishlistedProducts.length > 0 && (
          <button
            onClick={clearWishlist}
            style={{ color: "#ef4444", fontSize: "13px", fontWeight: "600", borderBottom: "1px solid #fca5a5", minHeight: "auto" }}
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
            padding: "var(--space-12) var(--space-6)", 
            border: "1px dashed var(--border-color)", 
            borderRadius: "var(--border-radius-md)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "var(--space-3)"
          }}
        >
          <HeartCrack size={48} style={{ color: "var(--text-muted)" }} />
          <h3>Your Wishlist is Empty</h3>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", maxWidth: "340px" }}>
            Add items to your wishlist by clicking the heart button floating on product cards in catalog listings.
          </p>
          <Link to="/">
            <button 
              className="interactive-target"
              style={{
                backgroundColor: "var(--accent-pink)",
                color: "white",
                fontWeight: "700",
                padding: "0 var(--space-6)",
                borderRadius: "var(--border-radius-full)",
                height: "44px"
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
