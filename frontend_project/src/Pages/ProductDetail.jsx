import React, { useContext, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShopContext } from "../Context/ShopContext";
import { CartContext } from "../Context/CartContext";
import { WishlistContext } from "../Context/WishlistContext";
import products from "../data/products";
import ProductCard from "../Components/ProductCard";
import { Star, Heart, ShoppingBag, ShieldCheck, Check } from "lucide-react";
import "../styles/productGrid.css";

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  
  const { all_product } = useContext(ShopContext) || { all_product: [] };
  const { addToCart } = useContext(CartContext);
  const { wishlistItems, addToWishlist, removeFromWishlist } = useContext(WishlistContext);

  const productsList = all_product.length > 0 ? all_product : products;

  // Resolve current product
  const product = useMemo(() => {
    return productsList.find((p) => p.id === Number(productId));
  }, [productsList, productId]);

  // Selected Options
  const [selectedSize, setSelectedSize] = useState("M");
  const [selectedColor, setSelectedColor] = useState("White");
  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);
  const [activeTab, setActiveTab] = useState("description");

  if (!product) {
    return (
      <div className="container" style={{ padding: "var(--space-12) var(--space-4)", textAlign: "center" }}>
        <h2>Product Not Found</h2>
        <button 
          className="interactive-target"
          style={{ backgroundColor: "var(--accent-pink)", color: "white", padding: "0 var(--space-6)", borderRadius: "var(--border-radius-full)", marginTop: "var(--space-4)" }}
          onClick={() => navigate("/")}
        >
          Back to Shop
        </button>
      </div>
    );
  }

  const isWishlisted = wishlistItems.some((item) => item.id === product.id);

  const handleWishlistToggle = () => {
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleAddToCart = () => {
    addToCart(product.id, selectedSize, selectedColor, quantity);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 3000);
  };

  // Curate related items
  const relatedProducts = productsList
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <main className="container" style={{ padding: "var(--space-8) var(--space-4) var(--space-12) var(--space-4)" }}>
      {/* Detail grid */}
      <div 
        style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", 
          gap: "var(--space-8)",
          alignItems: "start",
          marginBottom: "var(--space-10)"
        }}
      >
        {/* Left column: Image wrapper */}
        <div 
          style={{ 
            backgroundColor: "var(--bg-secondary)", 
            border: "1px solid var(--border-color)", 
            borderRadius: "var(--border-radius-lg)",
            overflow: "hidden",
            aspectRatio: "4/5"
          }}
        >
          <img 
            src={product.image} 
            alt={product.name} 
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>

        {/* Right column: Specs panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <span style={{ fontSize: "var(--text-xs)", textTransform: "uppercase", color: "var(--accent-pink)", fontWeight: "700" }}>
            {product.category} Collection
          </span>
          <h1 style={{ fontSize: "clamp(24px, 4vw, 32px)", fontWeight: "800", lineHeight: "1.2" }}>{product.name}</h1>

          {/* Rating */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ display: "flex", gap: "1px" }}>
              {Array.from({ length: 5 }).map((_, idx) => (
                <Star 
                  key={idx} 
                  size={16} 
                  fill={idx < Math.round(product.rating) ? "var(--accent-pink)" : "none"} 
                  stroke={idx < Math.round(product.rating) ? "var(--accent-pink)" : "var(--border-color)"}
                />
              ))}
            </div>
            <span style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
              {product.rating} / 5.0 ({product.reviewsCount || 120} Customer Reviews)
            </span>
          </div>

          {/* Price Box */}
          <div style={{ display: "flex", alignItems: "baseline", gap: "10px", margin: "var(--space-1) 0" }}>
            <span style={{ fontSize: "var(--text-2xl)", fontWeight: "800", color: "var(--text-primary)" }}>
              ₹{product.new_price.toFixed(2)}
            </span>
            {product.old_price && (
              <span style={{ fontSize: "var(--text-md)", textDecoration: "line-through", color: "var(--text-muted)" }}>
                ₹{product.old_price.toFixed(2)}
              </span>
            )}
          </div>

          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", lineHeight: "1.6" }}>
            {product.description}
          </p>

          {/* Color Selection */}
          <div>
            <h4 style={{ fontSize: "var(--text-xs)", fontWeight: "700", textTransform: "uppercase", marginBottom: "8px" }}>
              Select Color: <span style={{ color: "var(--text-secondary)" }}>{selectedColor}</span>
            </h4>
            <div style={{ display: "flex", gap: "10px" }}>
              {["White", "Navy", "Beige", "Charcoal"].map((col) => (
                <button
                  key={col}
                  className="interactive-target"
                  onClick={() => setSelectedColor(col)}
                  style={{
                    height: "36px",
                    padding: "0 14px",
                    borderRadius: "var(--border-radius-full)",
                    border: "1px solid",
                    borderColor: selectedColor === col ? "var(--accent-pink)" : "var(--border-color)",
                    backgroundColor: selectedColor === col ? "var(--accent-light)" : "var(--bg-secondary)",
                    color: selectedColor === col ? "var(--accent-pink)" : "var(--text-primary)",
                    fontSize: "var(--text-xs)",
                    fontWeight: "600",
                    minHeight: "auto"
                  }}
                >
                  {col}
                </button>
              ))}
            </div>
          </div>

          {/* Size Selection */}
          <div>
            <h4 style={{ fontSize: "var(--text-xs)", fontWeight: "700", textTransform: "uppercase", marginBottom: "8px" }}>
              Select Size: <span style={{ color: "var(--text-secondary)" }}>{selectedSize}</span>
            </h4>
            <div style={{ display: "flex", gap: "10px" }}>
              {["XS", "S", "M", "L", "XL"].map((sz) => (
                <button
                  key={sz}
                  className="interactive-target"
                  onClick={() => setSelectedSize(sz)}
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "var(--border-radius-full)",
                    border: "1px solid",
                    borderColor: selectedSize === sz ? "var(--accent-pink)" : "var(--border-color)",
                    backgroundColor: selectedSize === sz ? "var(--accent-pink)" : "var(--bg-secondary)",
                    color: selectedSize === sz ? "white" : "var(--text-primary)",
                    fontSize: "var(--text-xs)",
                    fontWeight: "700",
                    minHeight: "auto"
                  }}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Selector and Action buttons */}
          <div style={{ display: "flex", gap: "12px", alignItems: "center", marginTop: "var(--space-2)", flexWrap: "wrap" }}>
            <div 
              style={{ 
                display: "flex", 
                alignItems: "center", 
                border: "1px solid var(--border-color)", 
                borderRadius: "var(--border-radius-full)",
                height: "44px",
                overflow: "hidden",
                backgroundColor: "var(--bg-secondary)"
              }}
            >
              <button 
                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                style={{ width: "40px", height: "100%", minHeight: "auto", fontWeight: "700" }}
              >
                -
              </button>
              <span style={{ width: "40px", textAlign: "center", fontSize: "14px", fontWeight: "700" }}>{quantity}</span>
              <button 
                onClick={() => setQuantity(prev => prev + 1)}
                style={{ width: "40px", height: "100%", minHeight: "auto", fontWeight: "700" }}
              >
                +
              </button>
            </div>

            <button 
              className="interactive-target"
              onClick={handleAddToCart}
              style={{
                backgroundColor: "var(--accent-pink)",
                color: "white",
                height: "44px",
                padding: "0 28px",
                borderRadius: "var(--border-radius-full)",
                fontWeight: "700",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                flexGrow: 1
              }}
            >
              <ShoppingBag size={16} /> Add to Cart
            </button>

            <button 
              className="interactive-target"
              onClick={handleWishlistToggle}
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                border: "1px solid var(--border-color)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: isWishlisted ? "var(--accent-pink)" : "var(--text-primary)",
                backgroundColor: isWishlisted ? "var(--accent-light)" : "var(--bg-secondary)"
              }}
            >
              <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
            </button>
          </div>

          {/* Added success alert */}
          {addedNotice && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--success-color)", fontSize: "13px", fontWeight: "600" }}>
              <Check size={16} />
              <span>Added to Cart! (Selected Size: {selectedSize}, Color: {selectedColor})</span>
            </div>
          )}

          {/* Trust assurances info */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", borderTop: "1px solid var(--border-color)", paddingTop: "var(--space-4)", color: "var(--text-muted)", fontSize: "var(--text-xs)" }}>
            <ShieldCheck size={14} style={{ color: "var(--success-color)" }} />
            <span>Secure simulated transaction experience (demo only)</span>
          </div>
        </div>
      </div>

      {/* Product Spec Tabs */}
      <section aria-label="Product specifications" style={{ margin: "var(--space-10) 0" }}>
        <div style={{ display: "flex", borderBottom: "1px solid var(--border-color)" }}>
          <button 
            onClick={() => setActiveTab("description")}
            style={{ 
              padding: "12px var(--space-4)", 
              borderBottom: activeTab === "description" ? "2px solid var(--accent-pink)" : "none",
              color: activeTab === "description" ? "var(--accent-pink)" : "var(--text-secondary)",
              fontWeight: "700",
              fontSize: "14px",
              minHeight: "auto"
            }}
          >
            Description
          </button>
          <button 
            onClick={() => setActiveTab("specs")}
            style={{ 
              padding: "12px var(--space-4)", 
              borderBottom: activeTab === "specs" ? "2px solid var(--accent-pink)" : "none",
              color: activeTab === "specs" ? "var(--accent-pink)" : "var(--text-secondary)",
              fontWeight: "700",
              fontSize: "14px",
              minHeight: "auto"
            }}
          >
            Specifications
          </button>
        </div>

        <div style={{ padding: "var(--space-5) 0", fontSize: "14px", lineHeight: "1.6", color: "var(--text-secondary)" }}>
          {activeTab === "description" ? (
            <p>
              Crafted from organic yarns, this {product.name.toLowerCase()} offers standard luxury comfort and style. Every detail has been engineered with double stitch hems and soft wash textures to ensure that the item remains a key asset in your closet for seasons to come.
            </p>
          ) : (
            <ul style={{ listStyle: "inside disc", display: "flex", flexDirection: "column", gap: "6px" }}>
              <li><strong>Material:</strong> 100% Organic combed cotton / Premium Linen fibers</li>
              <li><strong>Care Instructions:</strong> Machine wash cold, tumble dry low</li>
              <li><strong>Sustainability:</strong> GOTS certified dye and ethical sourcing</li>
              <li><strong>Fit:</strong> Standard regular / comfort fit</li>
            </ul>
          )}
        </div>
      </section>

      {/* Related Products list */}
      {relatedProducts.length > 0 && (
        <section aria-labelledby="related-heading" style={{ margin: "var(--space-10) 0" }}>
          <h2 id="related-heading" style={{ fontSize: "var(--text-xl)", fontWeight: "800", marginBottom: "var(--space-6)" }}>
            Related Products
          </h2>
          <div className="product-grid">
            {relatedProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
};

export default ProductDetail;
