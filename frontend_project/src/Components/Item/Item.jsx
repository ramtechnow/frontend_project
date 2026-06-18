import React, { useContext } from 'react';
import './Item.css';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { WishlistContext } from '../../Context/WishlistContext';
import useCart from '../../Hooks/useCart';
import { Heart, Star, Eye, RefreshCw } from 'lucide-react';

export const Item = (props) => {
  const { toggleWishlist, isWishlisted } = useContext(WishlistContext);
  const { addToCart } = useCart();
  const isFav = isWishlisted(props.id);

  // Deterministic ratings
  const rating = ((props.id * 13) % 5 === 0 
    ? '4.0' 
    : (props.id * 13) % 5 === 1 
      ? '5.0' 
      : (props.id * 13) % 5 === 2 
        ? '4.0' 
        : (props.id * 13) % 5 === 3 
          ? '5.0' 
          : '4.0');
  
  const rawReviews = (props.id * 223 + 47) % 150 + 10;

  // Sizes formatting
  const sizes = props.sizes && props.sizes.length > 0 
    ? props.sizes 
    : ['S', 'M', 'L', 'XL'];

  // Colors formatting
  const colors = props.colors && props.colors.length > 0
    ? props.colors
    : ['Black', 'White', 'Pink'];

  const colorMap = {
    Black: '#000000',
    White: '#ffffff',
    Red: '#f23e70',
    Blue: '#1e88e5',
    Green: '#4caf50',
    Pink: '#ec4899',
    Grey: '#888888',
    Orange: '#ff9800',
    Yellow: '#f59e0b',
  };

  // Badging logic
  let badgeText = '';
  let badgeClass = '';

  const discount = props.old_price && props.old_price > props.new_price
    ? Math.round(((props.old_price - props.new_price) / props.old_price) * 100)
    : 0;

  if (discount > 0) {
    if (props.id % 2 === 0) {
      badgeText = `-${discount}%`;
      badgeClass = 'badge-discount';
    } else {
      badgeText = 'Sale';
      badgeClass = 'badge-sale';
    }
  } else if (props.id % 3 === 0) {
    badgeText = 'New';
    badgeClass = 'badge-new';
  }

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(props.id, sizes[0] || 'M', colors[0] || 'White', 1);
  };

  return (
    <motion.div 
      className="orishop-item-card"
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.4 }}
    >
      <div className="item-image-wrapper">
        {/* Badge */}
        {badgeText && (
          <span className={`item-card-badge ${badgeClass}`}>
            {badgeText}
          </span>
        )}

        {/* Product Image Link */}
        <Link to={`/product/${props.id}`} className="item-image-link" onClick={() => window.scrollTo(0, 0)}>
          <img 
            src={props.image} 
            alt={props.name} 
            className="item-product-img"
          />
        </Link>

        {/* Hover Overlay Floating Action Icons */}
        <div className="item-hover-actions">
          <button 
            type="button"
            className={`action-btn-floating ${isFav ? 'wishlisted' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(props.id);
            }}
            title={isFav ? "Remove from Wishlist" : "Add to Wishlist"}
          >
            <Heart size={15} className={isFav ? "fill-[#f23e70] stroke-[#f23e70]" : "text-slate-600"} />
          </button>
          
          <button 
            type="button"
            className="action-btn-floating"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              alert(`"${props.name}" added to comparison!`);
            }}
            title="Compare"
          >
            <RefreshCw size={13} className="text-slate-600" />
          </button>

          <Link 
            to={`/product/${props.id}`}
            className="action-btn-floating"
            onClick={() => window.scrollTo(0, 0)}
            title="Quick View"
          >
            <Eye size={14} className="text-slate-600" />
          </Link>
        </div>

        {/* Hover Slide-up Pink Add to Cart Button */}
        <div className="item-add-cart-slide">
          <button 
            type="button" 
            className="pink-add-cart-btn"
            onClick={handleAddToCart}
          >
            Add To Cart
          </button>
        </div>
      </div>

      {/* Info details under image */}
      <div className="item-details-box">
        {/* Colors and Rating row */}
        <div className="item-meta-info-row">
          <div className="color-dots-list">
            {colors.slice(0, 3).map((c, i) => (
              <span 
                key={i} 
                className="color-dot-swatch" 
                style={{ backgroundColor: colorMap[c] || '#ccc' }}
                title={c}
              />
            ))}
          </div>

          <div className="stars-ratings-box">
            <div className="star-icons">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star 
                  key={s} 
                  size={10} 
                  className={s <= Math.round(Number(rating)) ? "fill-[#ffb300] text-[#ffb300]" : "text-[#e2e8f0]"}
                />
              ))}
            </div>
            <span className="reviews-label">({rawReviews})</span>
          </div>
        </div>

        {/* Product Name */}
        <h4 className="item-product-name">
          <Link to={`/product/${props.id}`} onClick={() => window.scrollTo(0, 0)}>
            {props.name}
          </Link>
        </h4>

        {/* Prices */}
        <div className="item-price-display">
          <span className="current-price-val">${props.new_price}</span>
          {props.old_price && (
            <span className="old-price-val">${props.old_price}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

