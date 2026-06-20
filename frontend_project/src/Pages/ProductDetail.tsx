import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../features/checkout/hooks/useCart";
import { useWishlist } from "../features/catalog/hooks/useWishlist";
import { fetchProductById, fetchRelatedProducts } from "../features/catalog/services/productService";
import { Product } from "../features/catalog/types/productTypes";
import ProductCard from "../Components/ProductCard";
import { Star, Heart, ShoppingBag, ShieldCheck, Check, Loader2 } from "lucide-react";
import "../Styles/productGrid.css";

export const ProductDetail: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  // State
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedSize, setSelectedSize] = useState("M");
  const [selectedColor, setSelectedColor] = useState("White");
  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);
  const [activeTab, setActiveTab] = useState("description");

  // Load product from Firestore
  useEffect(() => {
    const loadDetails = async () => {
      if (!productId) return;
      setLoading(true);
      try {
        const prod = await fetchProductById(productId);
        if (prod) {
          setProduct(prod);
          // Set defaults if colors/sizes are present
          if (prod.sizes && prod.sizes.length > 0) setSelectedSize(prod.sizes[0]);
          if (prod.colors && prod.colors.length > 0) setSelectedColor(prod.colors[0]);
          
          // Load related products
          const related = await fetchRelatedProducts(prod.category, prod.id);
          setRelatedProducts(related);
        } else {
          setProduct(null);
        }
      } catch (err) {
        console.error("Failed to load product details:", err);
      } finally {
        setLoading(false);
      }
    };
    loadDetails();
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-bg-primary text-text-primary">
        <Loader2 size={36} className="animate-spin text-accent-pink mb-4" />
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Fetching product specifications...</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: "var(--space-12) var(--space-4)", textAlign: "center", color: 'var(--text-primary)' }}>
        <h2>Product Not Found</h2>
        <button 
          className="interactive-target"
          style={{ 
            backgroundColor: "var(--accent-pink)", 
            color: "white", 
            padding: "10px 24px", 
            borderRadius: "var(--border-radius-full)", 
            marginTop: "var(--space-4)",
            border: "none",
            fontWeight: "700",
            cursor: "pointer"
          }}
          onClick={() => navigate("/catalog")}
        >
          Back to Shop
        </button>
      </div>
    );
  }

  const isWishlisted = isInWishlist(product.id);

  const handleWishlistToggle = () => {
    toggleWishlist(product.id);
  };

  const handleAddToCart = () => {
    addToCart(product.id, selectedSize, selectedColor, quantity);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 3000);
  };

  // Safe fallbacks
  const ratingVal = (product as any).rating || 4.5;
  const reviewsCount = (product as any).reviewsCount || 108;

  // Use dynamic images from list if available
  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : [product.image || "https://placehold.co/400x500?text=Apparel"];

  return (
    <main className="container" style={{ padding: "var(--space-8) var(--space-4) var(--space-12) var(--space-4)", color: 'var(--text-primary)' }}>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '500px', width: '100%', margin: '0 auto' }}>
          <div 
            style={{ 
              backgroundColor: "var(--bg-secondary)", 
              border: "1px solid var(--border-color)", 
              borderRadius: "16px",
              overflow: "hidden",
              aspectRatio: "4/5"
            }}
          >
            <img 
              src={productImages[0]} 
              alt={product.name} 
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          {/* Sub-images carousel/grid */}
          {productImages.length > 1 && (
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
              {productImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    // Update main image display
                    setProduct({ ...product, image: img });
                  }}
                  style={{
                    width: '60px',
                    height: '75px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: product.image === img ? '2px solid var(--accent-pink)' : '1px solid var(--border-color)',
                    background: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    flexShrink: 0
                  }}
                >
                  <img src={img} alt={`${product.name} view ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right column: Specs panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <span style={{ fontSize: "var(--text-xs)", textTransform: "uppercase", color: "var(--accent-pink)", fontWeight: "700" }}>
            {product.category} Collection
          </span>
          <h1 style={{ fontSize: "clamp(24px, 4vw, 32px)", fontWeight: "800", lineHeight: "1.2", margin: 0 }}>{product.name}</h1>

          {/* Rating */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ display: "flex", gap: "1px" }}>
              {Array.from({ length: 5 }).map((_, idx) => (
                <Star 
                  key={idx} 
                  size={16} 
                  fill={idx < Math.round(ratingVal) ? "var(--accent-pink)" : "none"} 
                  stroke={idx < Math.round(ratingVal) ? "var(--accent-pink)" : "var(--border-color)"}
                />
              ))}
            </div>
            <span style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
              {ratingVal} / 5.0 ({reviewsCount} Reviews)
            </span>
          </div>

          {/* Price Box */}
          <div style={{ display: "flex", alignItems: "baseline", gap: "10px", margin: "var(--space-1) 0" }}>
            <span style={{ fontSize: "var(--text-2xl)", fontWeight: "800", color: "var(--text-primary)" }}>
              ₹{product.newPrice.toFixed(2)}
            </span>
            {product.oldPrice && (
              <span style={{ fontSize: "var(--text-md)", textDecoration: "line-through", color: "var(--text-muted)" }}>
                ₹{product.oldPrice.toFixed(2)}
              </span>
            )}
          </div>

          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", lineHeight: "1.6", margin: 0 }}>
            {product.description || "Premium apparel tailored for maximum comfort and style using sustainable organic fabric blend."}
          </p>

          {/* Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <div>
              <h4 style={{ fontSize: "var(--text-xs)", fontWeight: "700", textTransform: "uppercase", marginBottom: "8px", margin: 0 }}>
                Select Color: <span style={{ color: "var(--text-secondary)" }}>{selectedColor}</span>
              </h4>
              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                {product.colors.map((col) => (
                  <button
                    key={col}
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
                      cursor: "pointer"
                    }}
                  >
                    {col}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div>
              <h4 style={{ fontSize: "var(--text-xs)", fontWeight: "700", textTransform: "uppercase", marginBottom: "8px", margin: 0 }}>
                Select Size: <span style={{ color: "var(--text-secondary)" }}>{selectedSize}</span>
              </h4>
              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                {product.sizes.map((sz) => (
                  <button
                    key={sz}
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
                      cursor: "pointer"
                    }}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector and Action buttons */}
          <div style={{ display: "flex", gap: "12px", alignItems: "center", marginTop: "12px", flexWrap: "wrap" }}>
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
                style={{ width: "40px", height: "100%", fontWeight: "700", border: "none", background: "none", cursor: "pointer", color: "var(--text-primary)" }}
              >
                -
              </button>
              <span style={{ width: "40px", textAlign: "center", fontSize: "14px", fontWeight: "700" }}>{quantity}</span>
              <button 
                onClick={() => setQuantity(prev => prev + 1)}
                style={{ width: "40px", height: "100%", fontWeight: "700", border: "none", background: "none", cursor: "pointer", color: "var(--text-primary)" }}
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
                flexGrow: 1,
                border: "none",
                cursor: "pointer"
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
                backgroundColor: isWishlisted ? "var(--accent-light)" : "var(--bg-secondary)",
                cursor: "pointer"
              }}
            >
              <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
            </button>
          </div>

          {/* Added success alert */}
          {addedNotice && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--success-color)", fontSize: "13px", fontWeight: "600", marginTop: "8px" }}>
              <Check size={16} />
              <span>Added to Cart! (Selected Size: {selectedSize}, Color: {selectedColor})</span>
            </div>
          )}

          {/* Trust assurances info */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", borderTop: "1px solid var(--border-color)", paddingTop: "var(--space-4)", color: "var(--text-muted)", fontSize: "var(--text-xs)", marginTop: "12px" }}>
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
              border: "none",
              borderBottom: activeTab === "description" ? "2px solid var(--accent-pink)" : "none",
              color: activeTab === "description" ? "var(--accent-pink)" : "var(--text-secondary)",
              backgroundColor: "transparent",
              fontWeight: "700",
              fontSize: "14px",
              cursor: "pointer"
            }}
          >
            Description
          </button>
          <button 
            onClick={() => setActiveTab("specs")}
            style={{ 
              padding: "12px var(--space-4)", 
              border: "none",
              borderBottom: activeTab === "specs" ? "2px solid var(--accent-pink)" : "none",
              color: activeTab === "specs" ? "var(--accent-pink)" : "var(--text-secondary)",
              backgroundColor: "transparent",
              fontWeight: "700",
              fontSize: "14px",
              cursor: "pointer"
            }}
          >
            Specifications
          </button>
        </div>

        <div style={{ padding: "var(--space-5) 0", fontSize: "14px", lineHeight: "1.6", color: "var(--text-secondary)" }}>
          {activeTab === "description" ? (
            <p style={{ margin: 0 }}>
              Crafted from premium fabrics, this {product.name.toLowerCase()} offers high comfort and style. Every detail has been engineered with double stitch hems and soft wash textures to ensure that the item remains a key asset in your closet for seasons to come.
            </p>
          ) : (
            <ul style={{ listStyle: "inside disc", display: "flex", flexDirection: "column", gap: "6px", margin: 0, padding: 0 }}>
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
          <h2 id="related-heading" style={{ fontSize: "var(--text-xl)", fontWeight: "800", marginBottom: "var(--space-6)", margin: "0 0 16px 0" }}>
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
