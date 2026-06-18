import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CartItems.css';
import useCart from '../../Hooks/useCart';
import { ShopContext } from '../../Context/ShopContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2 } from 'lucide-react';

export const CartItems = () => {
  const navigate = useNavigate();
  const { 
    cartItems, 
    removeFromCart, 
    addToCart, 
    updateQuantity, 
    getTotalCartAmount 
  } = useCart();

  // We still need all_product from ShopContext to display title/images
  const shopContext = React.useContext(ShopContext);
  const all_product = shopContext ? shopContext.all_product : [];

  return (
    <div className='cartitems'>
      <div className="cartitems-container">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          Your Shopping Basket
        </motion.h1>

        {Object.keys(cartItems).length === 0 ? (
          <motion.div 
            className="empty-cart-message"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="empty-cart-svg">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            <h3>Your basket is empty</h3>
            <p>Looks like you haven't added anything to your cart yet.</p>
          </motion.div>
        ) : (
          <>
            {/* TABLE HEADER */}
            <div className="cartitem-format-main header-row">
              <p>Product</p>
              <p>Title</p>
              <p>Details</p>
              <p>Price</p>
              <p>Quantity</p>
              <p>Total</p>
              <p>Remove</p>
            </div>

            <hr className="cart-item-divider" />

            {/* CART ITEMS LOOP */}
            <div className="cart-items-list" style={{ overflow: 'hidden' }}>
              <AnimatePresence initial={false}>
                {Object.keys(cartItems).map((key) => {
                  const item = cartItems[key]; // {id, size, color, quantity}
                  const product = all_product.find(p => p.id === item.id);

                  if (!product) return null;

                  return (
                    <motion.div 
                      key={key} 
                      className="cart-item-wrapper-outer"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.35, ease: "easeInOut" }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div className="cartitems-format cartitem-format-main">
                        {/* Product Image */}
                        <div className="cart-item-img-container">
                          <img src={product.image} alt={product.name} className="carticon-product-icon" />
                        </div>

                        {/* Product Name */}
                        <p className="cart-product-title">{product.name}</p>

                        {/* Specs */}
                        <div className="cart-item-specs">
                          <span className="spec-badge size-badge">Size: {item.size}</span>
                          <span className="spec-badge color-badge">Color: {item.color}</span>
                        </div>

                        {/* PRICE */}
                        <p className="cart-item-price">${product.new_price}</p>

                        {/* QUANTITY CONTROL */}
                        <div className="cart-item-quantity-control">
                          <button 
                            className="qty-btn dec-btn" 
                            onClick={() => removeFromCart(key)}
                          >
                            -
                          </button>
                          <span className="qty-val">{item.quantity}</span>
                          <button 
                            className="qty-btn inc-btn" 
                            onClick={() => addToCart(item.id, item.size, item.color, 1)}
                          >
                            +
                          </button>
                        </div>

                        {/* TOTAL PER ITEM */}
                        <p className="cart-item-total">${product.new_price * item.quantity}</p>

                        {/* REMOVE ACTION */}
                        <div className="cart-item-remove">
                          <motion.button
                            className="cartitems-remove-btn"
                            onClick={() => updateQuantity(key, 0)}
                            whileHover={{ scale: 1.2, rotate: 8 }}
                            whileTap={{ scale: 0.9 }}
                            title="Remove item"
                          >
                            <Trash2 size={18} />
                          </motion.button>
                        </div>
                      </div>
                      <hr className="cart-item-divider" />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* CART TOTAL SECTION */}
            <motion.div 
              className="cartitems-down"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="cartitems-total">
                <h2>Cart Totals</h2>
                <div className="cart-totals-summary">
                  <div className="cartitems-total-item">
                    <p>Subtotal</p>
                    <p>${getTotalCartAmount()}</p>
                  </div>
                  <hr />
                  <div className="cartitems-total-item">
                    <p>Shipping Fee</p>
                    <p className="shipping-free">Free</p>
                  </div>
                  <hr />
                  <div className="cartitems-total-item grand-total">
                    <h3>Total</h3>
                    <h3>${getTotalCartAmount()}</h3>
                  </div>
                </div>
                <motion.button 
                  className="checkout-btn"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/checkout')}
                >
                  PROCEED TO CHECKOUT
                </motion.button>
              </div>

              <div className="cartitems-promocode">
                <p>Have a promo code? Enter it below</p>
                <div className="cartitems-promobox">
                  <input type="text" placeholder="Promo code" />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Apply
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartItems;
