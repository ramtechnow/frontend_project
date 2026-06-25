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
    <div className="product-card group relative flex flex-col justify-between h-full overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      <Link to={`/product/${product.id}`} className="flex flex-col h-full">
        {/* Image Container with aspect ratio */}
        <div className="product-card-image-wrapper relative w-full aspect-[3/4] overflow-hidden bg-bg-tertiary">
          {/* Discount Badge */}
          {discountPercent > 0 && (
            <div className="product-card-badge absolute top-2.5 left-2.5 z-10 rounded-md bg-accent-pink px-2 py-1 text-[9px] font-bold text-white uppercase tracking-wider">
              {discountPercent}% OFF
            </div>
          )}

          {/* Floating Wishlist Heart */}
          <button
            className={`product-card-wishlist-btn absolute top-2.5 right-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white text-text-primary shadow-sm transition-all duration-300 hover:bg-accent-pink hover:text-white ${isWishlisted ? "active text-accent-pink" : ""}`}
            onClick={handleWishlistToggle}
            aria-label={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
          >
            <Heart size={15} fill={isWishlisted ? "currentColor" : "none"} />
          </button>

          {/* Product Image */}
          <img
            src={product.image || "https://placehold.co/300x400?text=Apparel"}
            alt={product.name}
            className="product-card-image h-full w-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
            loading="lazy"
          />
        </div>

        {/* Product Details */}
        <div className="product-card-info flex flex-col flex-grow p-3 sm:p-4">
          <span className="product-card-category text-[9px] font-bold tracking-widest text-text-muted uppercase mb-1">
            {product.category}
          </span>
          <h3 className="product-card-title text-xs sm:text-sm font-semibold text-text-primary mb-1.5 line-clamp-2 min-h-[32px] sm:min-h-[40px] leading-snug">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="product-card-rating flex items-center gap-1 mb-2.5">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  size={11}
                  fill={index < roundedRating ? "var(--accent-pink)" : "none"}
                  stroke={index < roundedRating ? "var(--accent-pink)" : "var(--border-color)"}
                />
              ))}
            </div>
            <span className="text-[10px] font-medium text-text-muted">({reviewsCount})</span>
          </div>

          {/* Price Box */}
          <div className="product-card-price-row flex items-baseline gap-1.5 mt-auto">
            <span className="product-card-new-price text-sm sm:text-base font-bold text-text-primary">
              ₹{price.toFixed(2)}
            </span>
            {oldPrice && (
              <span className="product-card-old-price text-[10px] sm:text-xs text-text-muted line-through">
                ₹{oldPrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
