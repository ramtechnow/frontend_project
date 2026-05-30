import React from 'react';
import './CartItems.css';
import useCart from '../../Hooks/useCart';
import { ShopContext } from '../../Context/ShopContext';
import remove_icon from '../Assets/cart_cross_icon.png';

export const CartItems = () => {
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
        <h1>Your Shopping Basket</h1>

        {Object.keys(cartItems).length === 0 ? (
          <div className="empty-cart-message">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="empty-cart-svg">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            <h3>Your basket is empty</h3>
            <p>Looks like you haven't added anything to your cart yet.</p>
          </div>
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
            <div className="cart-items-list">
              {Object.keys(cartItems).map((key) => {
                const item = cartItems[key]; // {id, size, color, quantity}
                const product = all_product.find(p => p.id === item.id);

                if (!product) return null;

                return (
                  <div key={key} className="cart-item-wrapper">
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
                      <p className="cart-item-price">₹{product.new_price}</p>

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
                      <p className="cart-item-total">₹{product.new_price * item.quantity}</p>

                      {/* REMOVE ACTION */}
                      <div className="cart-item-remove">
                        <img
                          className='cartitems-remove-icon'
                          src={remove_icon}
                          alt="Remove item"
                          onClick={() => updateQuantity(key, 0)} // Sets qty to 0 to delete fully
                        />
                      </div>
                    </div>
                    <hr className="cart-item-divider" />
                  </div>
                );
              })}
            </div>

            {/* CART TOTAL SECTION */}
            <div className="cartitems-down">
              <div className="cartitems-total">
                <h2>Cart Totals</h2>
                <div className="cart-totals-summary">
                  <div className="cartitems-total-item">
                    <p>Subtotal</p>
                    <p>₹{getTotalCartAmount()}</p>
                  </div>
                  <hr />
                  <div className="cartitems-total-item">
                    <p>Shipping Fee</p>
                    <p className="shipping-free">Free</p>
                  </div>
                  <hr />
                  <div className="cartitems-total-item grand-total">
                    <h3>Total</h3>
                    <h3>₹{getTotalCartAmount()}</h3>
                  </div>
                </div>
                <button className="checkout-btn">PROCEED TO CHECKOUT</button>
              </div>

              <div className="cartitems-promocode">
                <p>Have a promo code? Enter it below</p>
                <div className="cartitems-promobox">
                  <input type="text" placeholder="Promo code" />
                  <button>Apply</button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartItems;
