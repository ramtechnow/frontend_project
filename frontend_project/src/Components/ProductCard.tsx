/* ============================================================
   ProductCard.tsx — Myntra-inspired card component
   No backend/data logic modified.
   ============================================================ */
import React from "react";
import { Link } from "react-router-dom";
import { Heart, Star } from "lucide-react";
import { useWishlist } from "../features/catalog/hooks/useWishlist";
import { Product } from "../features/catalog/types/productTypes";
import "../Styles/productGrid.css";

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product.id);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  // Safe fallback properties — data keys unchanged
  const price = product.newPrice !== undefined ? product.newPrice : (product as any).new_price || 0;
  const oldPrice = product.oldPrice !== undefined ? product.oldPrice : (product as any).old_price;
  const ratingVal = (product as any).rating || 4.5;
  const reviewsCount = (product as any).reviewsCount || 88;

  // Calculate discount percentage
  const discountPercent = oldPrice && oldPrice > price
    ? Math.round(((oldPrice - price) / oldPrice) * 100)
    : 0;

  // Brand label — derive from category (Myntra shows brand name bold at top)
  const brandLabel = product.category
    ? product.category.charAt(0).toUpperCase() + product.category.slice(1).toLowerCase()
    : "RamCart";

  return (
    <div className="product-card" style={{ position: "relative" }}>
      {/* Wishlist heart - Rendered OUTSIDE Link to prevent event propagation conflicts */}
      <button
        className={`product-card-wishlist-btn${isWishlisted ? " active" : ""}`}
        onClick={handleWishlistToggle}
        aria-label={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
        style={{ zIndex: 10 }}
      >
        <Heart size={14} fill={isWishlisted ? "currentColor" : "none"} />
      </button>

      <Link to={`/product/${product.id}`} style={{ display: "flex", flexDirection: "column", height: "100%", textDecoration: "none", color: "inherit" }}>
        {/* ── Image area ── */}
        <div className="product-card-image-wrapper">
          {/* Discount badge */}
          {discountPercent > 0 && (
            <div className="product-card-badge">
              {discountPercent}% OFF
            </div>
          )}

          {/* Product image */}
          <img
            src={product.image || "https://placehold.co/300x400?text=Apparel"}
            alt={product.name}
            className="product-card-image"
            loading="lazy"
          />
        </div>

        {/* ── Info panel ── */}
        <div className="product-card-info">
          {/* Brand — bold, near-black (Myntra shows brand prominently) */}
          <span className="product-card-category">{brandLabel}</span>

          {/* Title — regular weight, grey */}
          <h3 className="product-card-title">{product.name}</h3>

          {/* Rating chip — Myntra green style */}
          <div className="product-card-rating">
            <span className="product-card-rating-chip">
              <Star size={9} fill="#fff" stroke="none" />
              {ratingVal.toFixed(1)}
            </span>
            <span className="product-card-rating-count">| {reviewsCount}</span>
          </div>

          {/* Price row */}
          <div className="product-card-price-row">
            <span className="product-card-new-price">₹{price.toFixed(0)}</span>
            {oldPrice && (
              <span className="product-card-old-price">₹{oldPrice.toFixed(0)}</span>
            )}
            {discountPercent > 0 && (
              <span className="product-card-discount-pct">({discountPercent}% OFF)</span>
            )}
          </div>
          {/* Free Delivery tag — Flipkart style */}
          <div className="product-card-free-delivery">🚚 Free Delivery</div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
