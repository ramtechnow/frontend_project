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
  const [activeImage, setActiveImage] = useState("");
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
          setActiveImage(prod.image || "");
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
        <Loader2 size={30} className="animate-spin text-accent-pink mb-4" />
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600' }}>Fetching specifications...</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: "48px var(--space-4)", textAlign: "center", color: 'var(--text-primary)' }}>
        <h2 style={{ fontSize: "20px", fontWeight: "800" }}>Product Not Found</h2>
        <button 
          style={{ 
            backgroundColor: "var(--accent-pink)", 
            color: "white", 
            padding: "10px 24px", 
            borderRadius: "4px", 
            marginTop: "16px",
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

  const handleBuyNow = () => {
    navigate(`/checkout?buyNow=true&productId=${product.id}&size=${selectedSize}&color=${selectedColor}&qty=${quantity}`);
  };

  // Safe fallbacks
  const ratingVal = (product as any).rating || 4.5;
  const reviewsCount = (product as any).reviewsCount || 108;

  // Use dynamic images from list if available
  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : [product.image || "https://placehold.co/400x500?text=Apparel"];

  // Brand Name
  const brandName = product.category 
    ? product.category.charAt(0).toUpperCase() + product.category.slice(1).toLowerCase() 
    : "RamCart";

  return (
    <main className="container" style={{ padding: "32px var(--space-4) 80px", color: 'var(--text-primary)' }}>
      {/* Detail grid */}
      <div 
        style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", 
          gap: "40px",
          alignItems: "start",
          marginBottom: "48px"
        }}
      >
        {/* Left column: Image wrapper */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '500px', width: '100%', margin: '0 auto' }}>
          <div 
            style={{ 
              backgroundColor: "var(--bg-secondary)", 
              border: "1px solid var(--border-color)", 
              borderRadius: "4px",
              overflow: "hidden",
              aspectRatio: "4/5"
            }}
          >
            <img 
              src={activeImage || productImages[0]} 
              alt={product.name} 
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
            />
          </div>

          {/* Sub-images carousel/grid */}
          {productImages.length > 1 && (
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
              {productImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveImage(img);
                  }}
                  style={{
                    width: '60px',
                    height: '75px',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    border: (activeImage || productImages[0]) === img ? '2px solid var(--accent-pink)' : '1px solid var(--border-color)',
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
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: "800", color: "var(--text-primary)", margin: "0 0 4px" }}>
              {brandName}
            </h1>
            <p style={{ fontSize: "16px", color: "var(--text-secondary)", margin: 0, fontWeight: "400" }}>
              {product.name}
            </p>
          </div>

          {/* Rating Badge - Myntra Green */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              background: "var(--rating-green)",
              color: "white",
              padding: "4px 8px",
              borderRadius: "4px",
              fontSize: "12px",
              fontWeight: "700"
            }}>
              {ratingVal.toFixed(1)} <Star size={12} fill="#fff" stroke="none" />
            </div>
            <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: "500" }}>
              {reviewsCount} Customer Ratings
            </span>
          </div>

          {/* Price Box */}
          <div style={{ display: "flex", alignItems: "baseline", gap: "12px", borderBottom: "1px solid var(--border-color)", paddingBottom: "16px" }}>
            <span style={{ fontSize: "24px", fontWeight: "800", color: "var(--text-primary)" }}>
              ₹{product.newPrice.toFixed(0)}
            </span>
            {product.oldPrice && (
              <>
                <span style={{ fontSize: "16px", textDecoration: "line-through", color: "var(--text-muted)" }}>
                  ₹{product.oldPrice.toFixed(0)}
                </span>
                <span style={{ fontSize: "16px", fontWeight: "800", color: "var(--accent-pink)" }}>
                  ({Math.round(((product.oldPrice - product.newPrice) / product.oldPrice) * 100)}% OFF)
                </span>
              </>
            )}
          </div>

          <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.6", margin: 0 }}>
            {product.description || "Premium apparel tailored for maximum comfort and style using sustainable organic fabric blend."}
          </p>

          {/* Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <div>
              <h4 style={{ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", color: "var(--text-primary)", margin: "0 0 8px" }}>
                Select Color: <span style={{ color: "var(--text-secondary)" }}>{selectedColor}</span>
              </h4>
              <div style={{ display: "flex", gap: "10px" }}>
                {product.colors.map((col) => (
                  <button
                    key={col}
                    onClick={() => setSelectedColor(col)}
                    style={{
                      height: "36px",
                      padding: "0 16px",
                      borderRadius: "20px",
                      border: "1px solid",
                      borderColor: selectedColor === col ? "var(--accent-pink)" : "var(--border-color)",
                      backgroundColor: selectedColor === col ? "var(--accent-light)" : "var(--bg-secondary)",
                      color: selectedColor === col ? "var(--accent-pink)" : "var(--text-primary)",
                      fontSize: "12px",
                      fontWeight: "700",
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
              <h4 style={{ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", color: "var(--text-primary)", margin: "0 0 8px" }}>
                Select Size: <span style={{ color: "var(--text-secondary)" }}>{selectedSize}</span>
              </h4>
              <div style={{ display: "flex", gap: "10px" }}>
                {product.sizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    style={{
                      width: "38px",
                      height: "38px",
                      borderRadius: "50%",
                      border: "1px solid",
                      borderColor: selectedSize === sz ? "var(--accent-pink)" : "var(--border-color)",
                      backgroundColor: selectedSize === sz ? "var(--accent-pink)" : "var(--bg-secondary)",
                      color: selectedSize === sz ? "white" : "var(--text-primary)",
                      fontSize: "12px",
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

          {/* Action buttons */}
          <div style={{ display: "flex", gap: "12px", alignItems: "center", marginTop: "12px", flexWrap: "wrap" }}>
            {/* Qty controller */}
            <div 
              style={{ 
                display: "flex", 
                alignItems: "center", 
                border: "1px solid var(--border-color)", 
                borderRadius: "4px",
                height: "44px",
                overflow: "hidden",
                backgroundColor: "var(--bg-secondary)"
              }}
            >
              <button 
                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                style={{ width: "36px", height: "100%", fontWeight: "700", border: "none", background: "none", cursor: "pointer", color: "var(--text-primary)" }}
              >
                -
              </button>
              <span style={{ width: "36px", textAlign: "center", fontSize: "13px", fontWeight: "700" }}>{quantity}</span>
              <button 
                onClick={() => setQuantity(prev => prev + 1)}
                style={{ width: "36px", height: "100%", fontWeight: "700", border: "none", background: "none", cursor: "pointer", color: "var(--text-primary)" }}
              >
                +
              </button>
            </div>

            <button 
              onClick={handleAddToCart}
              style={{
                backgroundColor: "var(--accent-pink)",
                color: "white",
                height: "44px",
                padding: "0 28px",
                borderRadius: "4px",
                fontWeight: "700",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                flexGrow: 1,
                border: "none",
                cursor: "pointer"
              }}
            >
              <ShoppingBag size={15} /> Add to Bag
            </button>

            <button 
              onClick={handleBuyNow}
              style={{
                backgroundColor: "var(--text-primary)",
                color: "var(--bg-secondary)",
                height: "44px",
                padding: "0 28px",
                borderRadius: "4px",
                fontWeight: "700",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                flexGrow: 1,
                border: "none",
                cursor: "pointer"
              }}
            >
              Buy Now
            </button>

            <button 
              onClick={handleWishlistToggle}
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "4px",
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

          {/* Success notice */}
          {addedNotice && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--rating-green)", fontSize: "13px", fontWeight: "700", marginTop: "8px" }}>
              <Check size={16} />
              <span>Added to Bag successfully!</span>
            </div>
          )}

          {/* Trust badge */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", borderTop: "1px solid var(--border-color)", paddingTop: "16px", color: "var(--text-muted)", fontSize: "11px", marginTop: "12px" }}>
            <ShieldCheck size={14} style={{ color: "var(--rating-green)" }} />
            <span>Secure simulated transaction experience (demo only)</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <section aria-label="Product specifications" style={{ margin: "48px 0" }}>
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
              fontSize: "13px",
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
              fontSize: "13px",
              cursor: "pointer"
            }}
          >
            Specifications
          </button>
        </div>

        <div style={{ padding: "16px 0", fontSize: "13px", lineHeight: "1.6", color: "var(--text-secondary)" }}>
          {activeTab === "description" ? (
            <p style={{ margin: 0 }}>
              Crafted from premium fabrics, this {product.name.toLowerCase()} offers high comfort and style. Every detail has been engineered with double stitch hems and soft wash textures to ensure that the item remains a key asset in your closet for seasons to come.
            </p>
          ) : (
            <ul style={{ listStyle: "inside disc", display: "flex", flexDirection: "column", gap: "6px", margin: 0, padding: 0 }}>
              <li><strong>Material:</strong> 100% Organic combed cotton / Premium Linen fibers</li>
              <li><strong>Care Instructions:</strong> Machine wash cold, tumble dry low</li>
              <li><strong>Fit:</strong> Standard regular / comfort fit</li>
            </ul>
          )}
        </div>
      </section>

      {/* Related Products list */}
      {relatedProducts.length > 0 && (
        <section aria-labelledby="related-heading" style={{ margin: "48px 0" }}>
          <h2 id="related-heading" style={{ fontSize: "16px", fontWeight: "800", margin: "0 0 16px 0", textTransform: "uppercase", letterSpacing: "0.5px" }}>
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
