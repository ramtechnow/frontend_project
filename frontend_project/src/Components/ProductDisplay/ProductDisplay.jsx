import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProductDisplay.css';
import useCart from '../../Hooks/useCart';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

export const ProductDisplay = ({ product }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  
  // Dynamic attribute selection
  const availableSizes = product.sizes || ['S', 'M', 'L', 'XL', 'XXL'];
  const availableColors = product.colors || ['Black', 'White', 'Red', 'Blue'];
  
  const [selectedSize, setSelectedSize] = useState(availableSizes[0] || 'M');
  const [selectedColor, setSelectedColor] = useState(availableColors[0] || 'Black');
  const [activeImage, setActiveImage] = useState(product.image);

  // Fallback rating counts
  const reviewCount = product.reviewCount || 122;

  // Dynamic Availability Stock Resolver
  const selectedVariant = product.variants ? product.variants.find(v => v.color.toLowerCase() === selectedColor.toLowerCase()) : null;
  const activeStock = selectedVariant ? selectedVariant.stock : (product.stockCount !== undefined ? product.stockCount : 100);
  const isOutOfStock = activeStock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product.id, selectedSize, selectedColor, 1);
    
    // Popup feedback
    setShowPopup(true);
    setTimeout(() => {
      setShowPopup(false);
    }, 2000);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(product.id, selectedSize, selectedColor, 1);
    navigate('/cart');
  };

  // Pre-mapped colors for display
  const colorHexes = {
    Black: '#000000',
    White: '#ffffff',
    Red: '#ef4444',
    Blue: '#3b82f6',
    Green: '#10b981',
    Pink: '#ec4899',
    Grey: '#6b7280',
    Orange: '#f97316',
    Yellow: '#eab308'
  };

  return (
    <motion.div 
      className='productdisplay'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {/* Toast Notification Popup */}
      {showPopup && (
        <div className="add-to-cart-popup">
          <div className="popup-content">
            <img src={product.image} alt={product.name} className="popup-image" />
            <div className="popup-details">
              <p className="popup-status">Success</p>
              <h4>Added to Cart!</h4>
              <p className="popup-specs">Size: {selectedSize} | Color: {selectedColor}</p>
            </div>
            <button className="popup-close" onClick={() => setShowPopup(false)}>×</button>
          </div>
        </div>
      )}
      
      {/* LEFT GALLERY VIEW */}
      <motion.div 
        className="productdisplay-left"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
      >
        <div className="productdisplay-img-list">
          {[1, 2, 3, 4].map((index) => (
            <img 
              key={index} 
              src={product.image} 
              alt={`thumbnail-${index}`} 
              className={activeImage === product.image ? 'active-thumbnail' : ''}
              onClick={() => setActiveImage(product.image)}
            />
          ))}
        </div>
        <div className="productdisplay-img">
          <motion.img 
            className='productdisplay-main-img' 
            src={activeImage} 
            alt={product.name}
            key={activeImage}
            initial={{ opacity: 0.5, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </motion.div>

      {/* RIGHT PRODUCT PANEL */}
      <motion.div 
        className="productdisplay-right"
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
      >
        <h1>{product.name}</h1>
        
        {/* Rating and review section */}
        <div className="productdisplay-right-star">
          {[1, 2, 3, 4, 5].map((starIndex) => (
            <motion.div
              key={starIndex}
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 20,
                delay: starIndex * 0.06 
              }}
              whileHover={{ scale: 1.25, rotate: 15 }}
              style={{ display: "inline-flex" }}
            >
              <Star 
                size={18} 
                fill={starIndex <= 4 ? "#ffc600" : "none"} 
                color={starIndex <= 4 ? "#ffc600" : "var(--text-tertiary)"} 
                style={{ cursor: 'pointer' }}
              />
            </motion.div>
          ))}
          <p>({reviewCount} reviews)</p>
        </div>

        {/* Pricing */}
        <div className="productdisplay-right-prices">
          {product.old_price && (
            <div className="productdisplay-right-price-old">₹{product.old_price}</div>
          )}
          <div className="productdisplay-right-price-new">₹{product.new_price}</div>
        </div>

        <div className="productdisplay-right-description">
          {product.description || "A lightweight, premium-fit knitted pullover jacket featuring a solid zip front, ribbed stand-up collar, long sleeves, and double hand-warmer pockets. Highly versatile and extremely comfortable."}
        </div>

        <hr className="product-panel-divider" />

        {/* COLOR SELECTOR */}
        <div className="product-option-section">
          <h3>Select Color</h3>
          <div className="color-options-row">
            {availableColors.map((color) => (
              <button
                key={color}
                type="button"
                className={`color-selector-dot ${selectedColor === color ? 'active' : ''}`}
                style={{ backgroundColor: colorHexes[color] || '#ccc' }}
                onClick={() => setSelectedColor(color)}
                title={color}
              >
                {selectedColor === color && (
                  <span className="dot-check" style={{ color: color === 'White' ? '#000' : '#fff' }}>✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* SIZE SELECTOR */}
        <div className="product-option-section">
          <h3>Select Size</h3>
          <div className="size-options-row">
            {availableSizes.map((size) => (
              <button 
                key={size}
                type="button"
                className={`size-selector-box ${selectedSize === size ? 'active' : ''}`}
                onClick={() => setSelectedSize(size)}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* ACTIONS */}
        <div className="product-actions-row">
          <button 
            className={`add-to-cart-action-btn ${isOutOfStock ? 'disabled' : ''}`} 
            onClick={handleAddToCart}
            disabled={isOutOfStock}
          >
            {isOutOfStock ? 'OUT OF STOCK' : 'ADD TO CART'}
          </button>
          <button 
            className={`buy-now-action-btn ${isOutOfStock ? 'disabled' : ''}`} 
            onClick={handleBuyNow}
            disabled={isOutOfStock}
          >
            BUY NOW
          </button>
        </div>

        <div className="product-metadata-tags">
          <p><span>Gender :</span> {product.gender || 'Unisex'}</p>
          <p><span>Category :</span> {product.category} , Modern , Latest</p>
          <p>
            <span>Availability :</span>{' '}
            <strong className={`availability-status-label ${isOutOfStock ? 'out-of-stock' : 'in-stock'}`}>
              {isOutOfStock ? 'Out of Stock' : `In Stock (${activeStock} remaining)`}
            </strong>
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProductDisplay;