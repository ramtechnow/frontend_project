import React, { useContext, useState, useEffect } from 'react'
import './ProductDisplay.css'
import star_icon from '../Assets/star_icon.png'
import star_dall_icon from '../Assets/star_dull_icon.png'
import { ShopContext } from '../../Context/ShopContext'

export const ProductDisplay = (props) => {
    const { product } = props;
    const { addToCart } = useContext(ShopContext);
    const [showPopup, setShowPopup] = useState(false);
    const [selectedSize, setSelectedSize] = useState('M');

    const handleAddToCart = () => {
        // Add product with selected size to cart
        addToCart(product.id, selectedSize);
        
        // Show the popup
        setShowPopup(true);
        
        // Hide the popup after 2 seconds
        setTimeout(() => {
            setShowPopup(false);
        }, 2000);
    };

    const handleSizeSelect = (size) => {
        setSelectedSize(size);
    };

    return (
        <div className='productdisplay'>
            {/* Popup Notification */}
            {showPopup && (
                <div className="add-to-cart-popup">
                    <div className="popup-content">
                        <img src={product.image} alt={product.name} className="popup-image" />
                        <div className="popup-details">
                            <p>Added to Cart!</p>
                            <h4>{product.name}</h4>
                            <p>Size: {selectedSize}</p>
                        </div>
                        <button 
                            className="popup-close"
                            onClick={() => setShowPopup(false)}
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}
            
            <div className="productdisplay-left">
                <div className="productdisplay-img-list">
                    <img src={product.image} alt="" />
                    <img src={product.image} alt="" />
                    <img src={product.image} alt="" />
                    <img src={product.image} alt="" />
                </div>
                <div className="productdisplay-img">
                    <img className='productdisplay-main-img' src={product.image} alt="" />
                </div>
            </div>
            <div className="productdisplay-right">
                <h1>{product.name}</h1>
                <div className="productdisplay-right-star">
                    <img src={star_icon} alt="" />
                    <img src={star_icon} alt="" />
                    <img src={star_icon} alt="" />
                    <img src={star_icon} alt="" />
                    <img src={star_dall_icon} alt="" />
                    <p>(122)</p>
                </div>
                <div className="productdisplay-right-prices">
                    <div className="productdisplay-right-price-old">₹{product.old_price}</div>
                    <div className="productdisplay-right-price-new">₹{product.new_price}</div>
                </div>
                <div className="productdisplay-right-discription">
                    {product.description || "Lorem ipsum dolor sit amet consectetur adipisicing elit. Enim magni commodi cum officiis natus ut numquam in eveniet quidem. Repellendus quo repudiandae."}
                </div>
                <div className="productdisplay-right-size">
                    <h1>Select Size</h1>
                    <div className="productdisplay-right-sizes">
                        {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                            <div 
                                key={size}
                                className={selectedSize === size ? 'selected-size' : ''}
                                onClick={() => handleSizeSelect(size)}
                            >
                                {size}
                            </div>
                        ))}
                    </div>
                    <button onClick={handleAddToCart}>ADD TO CART</button>
                </div>
                <p className='productdisplay-right-categroy'> <span>Category :</span>Women , T-shirt, Crop Top</p>
                <p className='productdisplay-right-categroy'> <span>Tags :</span> Modern , Latest</p>
            </div>
        </div>
    )
}