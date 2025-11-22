import React, { useContext } from 'react';
import './CartItems.css';
import { ShopContext } from '../../Context/ShopContext';
import remove_icon from '../Assets/cart_cross_icon.png';

export const CartItems = () => {
    const { getTotalCartAmount, all_product, cartItems, removeFromCart } = useContext(ShopContext);

    return (
        <div className='cartitems'>

            {/* TABLE HEADER */}
            <div className="cartitem-format-main">
                <p>Product</p>
                <p>Title</p>
                <p>Size</p>
                <p>Price</p>
                <p>Quantity</p>
                <p>Total</p>
                <p>Remove</p>
            </div>

            <hr />

            {/* CART ITEMS LOOP */}
            {Object.keys(cartItems).map((key) => {
                const item = cartItems[key];   // {id, size, quantity}
                const product = all_product.find(p => p.id === item.id);

                if (!product) return null;

                return (
                    <div key={key}>
                        <div className="cartitems-format cartitem-format-main">

                            {/* Product Image */}
                            <img src={product.image} alt="" className="carticon-product-icon" />

                            {/* Product Name */}
                            <p>{product.name}</p>

                            {/* SIZE */}
                            <p>{item.size}</p>

                            {/* PRICE */}
                            <p>₹{product.new_price}</p>

                            {/* QUANTITY */}
                            <button className="cartitems-quantity">
                                {item.quantity}
                            </button>

                            {/* TOTAL PER ITEM */}
                            <p>₹{product.new_price * item.quantity}</p>

                            {/* REMOVE */}
                            <img
                                className='cartitems-remove-icon'
                                src={remove_icon}
                                alt="remove"
                                onClick={() => removeFromCart(key)}
                            />
                        </div>

                        <hr />
                    </div>
                );
            })}

            {/* CART TOTAL SECTION */}
            <div className="cartitems-down">
                <div className="cartitems-total">
                    <h1>Cart Totals</h1>

                    <div className="cartitems-total-item">
                        <p>Subtotal</p>
                        <p>₹{getTotalCartAmount()}</p>
                    </div>

                    <hr />

                    <div className="cartitems-total-item">
                        <p>Shipping Fee</p>
                        <p>Free</p>
                    </div>

                    <hr />

                    <div className="cartitems-total-item">
                        <h3>Total</h3>
                        <h3>₹{getTotalCartAmount()}</h3>
                    </div>

                    <button>PROCEED TO CHECKOUT</button>
                </div>

                <div className="cartitems-promocode">
                    <p>If you have a promocode, enter it here</p>
                    <div className="cartitems-promobox">
                        <input type="text" placeholder="Promo code" />
                        <button>Submit</button>
                    </div>
                </div>
            </div>

        </div>
    );
};
