import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { Heart, Star } from "lucide-react";
import { WishlistContext } from "../Context/WishlistContext";
import "../styles/productGrid.css";

const ProductCard = ({ product }) => {
  const { wishlistItems, addToWishlist, removeFromWishlist } = useContext(WishlistContext);

  const isWishlisted = wishlistItems.some((item) => item.id === product.id);

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const roundedRating = Math.round(product.rating || 4.5);

  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`}>
        <div className="product-card-image-wrapper">
          {/* Discount Badge */}
          {product.discount > 0 && (
            <div className="product-card-badge">-{product.discount}%</div>
          )}

          {/* Floating Wishlist Heart */}
          <button
            className={`product-card-wishlist-btn ${isWishlisted ? "active" : ""}`}
            onClick={handleWishlistToggle}
            aria-label={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
          >
            <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
          </button>

          {/* Lazy Loaded Image */}
          <img
            src={product.image}
            alt={product.name}
            className="product-card-image"
            loading="lazy"
          />
        </div>

        <div className="product-card-info">
          <div className="product-card-category">{product.category}</div>
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
            <span>({product.reviewsCount || 120})</span>
          </div>

          {/* Price Box */}
          <div className="product-card-price-row">
            <span className="product-card-new-price">₹{product.new_price.toFixed(2)}</span>
            {product.old_price && (
              <span className="product-card-old-price">₹{product.old_price.toFixed(2)}</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
