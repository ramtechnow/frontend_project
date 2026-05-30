import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProductDisplay.css';
import star_icon from '../Assets/star_icon.png';
import star_dull_icon from '../Assets/star_dull_icon.png';
import useCart from '../../Hooks/useCart';

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

  const handleAddToCart = () => {
    addToCart(product.id, selectedSize, selectedColor, 1);
    
    // Popup feedback
    setShowPopup(true);
    setTimeout(() => {
      setShowPopup(false);
    }, 2000);
  };

  const handleBuyNow = () => {
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
    <div className='productdisplay'>
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
      <div className="productdisplay-left">
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
          <img className='productdisplay-main-img' src={activeImage} alt={product.name} />
        </div>
      </div>

      {/* RIGHT PRODUCT PANEL */}
      <div className="productdisplay-right">
        <h1>{product.name}</h1>
        
        {/* Rating and review section */}
        <div className="productdisplay-right-star">
          <img src={star_icon} alt="star" />
          <img src={star_icon} alt="star" />
          <img src={star_icon} alt="star" />
          <img src={star_icon} alt="star" />
          <img src={star_dull_icon} alt="star dull" />
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
          <button className="add-to-cart-action-btn" onClick={handleAddToCart}>
            ADD TO CART
          </button>
          <button className="buy-now-action-btn" onClick={handleBuyNow}>
            BUY NOW
          </button>
        </div>

        <div className="product-metadata-tags">
          <p><span>Gender :</span> {product.gender || 'Unisex'}</p>
          <p><span>Category :</span> {product.category} , Modern , Latest</p>
          <p><span>Availability :</span> {product.inStock ? "In Stock" : "Out of Stock"}</p>
        </div>
      </div>
    </div>
  );
};

export default ProductDisplay;