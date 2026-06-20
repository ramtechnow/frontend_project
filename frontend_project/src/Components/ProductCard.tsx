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

  // Safe fallback properties
  const price = product.newPrice !== undefined ? product.newPrice : (product as any).new_price || 0;
  const oldPrice = product.oldPrice !== undefined ? product.oldPrice : (product as any).old_price;
  const ratingVal = (product as any).rating || 4.5;
  const roundedRating = Math.round(ratingVal);
  const reviewsCount = (product as any).reviewsCount || 88;

  // Calculate discount percentage
  const discountPercent = oldPrice && oldPrice > price 
    ? Math.round(((oldPrice - price) / oldPrice) * 100) 
    : 0;

  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`}>
        <div className="product-card-image-wrapper">
          {/* Discount Badge */}
          {discountPercent > 0 && (
            <div className="product-card-badge">-{discountPercent}%</div>
          )}

          {/* Floating Wishlist Heart */}
          <button
            className={`product-card-wishlist-btn ${isWishlisted ? "active" : ""}`}
            onClick={handleWishlistToggle}
            aria-label={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
          >
            <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
          </button>

          {/* Product Image */}
          <img
            src={product.image || "https://placehold.co/300x400?text=Apparel"}
            alt={product.name}
            className="product-card-image"
            loading="lazy"
          />
        </div>

        <div className="product-card-info">
          <div className="product-card-category" style={{ textTransform: "uppercase", fontSize: "10px", fontWeight: "700" }}>{product.category}</div>
          <h3 className="product-card-title">{product.name}</h3>

          {/* Rating */}
          <div className="product-card-rating">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                size={12}
                fill={index < roundedRating ? "var(--accent-pink)" : "none"}
                stroke={index < roundedRating ? "var(--accent-pink)" : "var(--border-color)"}
              />
            ))}
            <span>({reviewsCount})</span>
          </div>

          {/* Price Box */}
          <div className="product-card-price-row">
            <span className="product-card-new-price">₹{price.toFixed(2)}</span>
            {oldPrice && (
              <span className="product-card-old-price">₹{oldPrice.toFixed(2)}</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
