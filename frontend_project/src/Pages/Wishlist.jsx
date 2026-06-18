import React, { useContext } from 'react';
import '../Pages/CSS/Wishlist.css';
import { WishlistContext } from '../Context/WishlistContext';
import { ShopContext } from '../Context/ShopContext';
import useCart from '../Hooks/useCart';
import { Heart, ShoppingBag, ArrowRight, Trash2, Truck, ShieldCheck, RotateCcw, Headphones } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';

export const Wishlist = () => {
  const { wishlistItems, toggleWishlist } = useContext(WishlistContext);
  const { all_product } = useContext(ShopContext);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // Filter products in wishlist
  const wishlistedProducts = all_product.filter(prod => 
    wishlistItems.includes(Number(prod.id))
  );

  return (
    <motion.div 
      className="wishlist-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Breadcrumb banner */}
      <div className="wishlist-banner">
        <div className="wishlist-banner-content">
          <h1>Wishlist</h1>
          <div className="wishlist-breadcrumb">
            <Link to="/">Home</Link>
            <span>•</span>
            <span className="current">Wishlist</span>
          </div>
        </div>
      </div>

      <div className="wishlist-container">
        
        {wishlistedProducts.length === 0 ? (
          /* Empty State */
          <motion.div 
            className="wishlist-empty-state"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="empty-icon-circle">
              <Heart size={40} className="fill-current" />
            </div>
            <h2>Your wishlist is empty</h2>
            <p>
              Explore our latest catalog, search hot collections, and tap the heart icon to save products here!
            </p>
            <button
              onClick={() => navigate('/')}
              className="explore-store-btn"
            >
              <ShoppingBag size={15} />
              Explore Store
              <ArrowRight size={14} />
            </button>
          </motion.div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="wishlist-table-wrapper">
              <table className="wishlist-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Stock Status</th>
                    <th>Add to Cart</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {wishlistedProducts.map((item) => {
                    const sizes = item.sizes && item.sizes.length > 0 ? item.sizes : ['M'];
                    const colors = item.colors && item.colors.length > 0 ? item.colors : ['White'];
                    const inStock = item.stockCount !== undefined ? item.stockCount > 0 : (item.id % 11 !== 0);

                    return (
                      <tr key={item.id}>
                        <td>
                          <div className="wishlist-product-cell">
                            <img src={item.image} alt={item.name} className="wishlist-product-img" />
                            <Link to={`/product/${item.id}`} className="wishlist-product-name">
                              {item.name}
                            </Link>
                          </div>
                        </td>
                        <td>
                          <div className="wishlist-price-cell">${item.new_price}</div>
                        </td>
                        <td>
                          <span className={`stock-status-badge ${inStock ? 'in-stock' : 'out-of-stock'}`}>
                            {inStock ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </td>
                        <td>
                          <button 
                            type="button"
                            className="wishlist-add-cart-btn"
                            disabled={!inStock}
                            onClick={() => addToCart(item.id, sizes[0], colors[0], 1)}
                          >
                            Add To Cart
                          </button>
                        </td>
                        <td>
                          <button 
                            type="button"
                            className="wishlist-delete-btn"
                            onClick={() => toggleWishlist(item.id)}
                            title="Remove from wishlist"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile List View */}
            <div className="mobile-wishlist-list">
              {wishlistedProducts.map((item) => {
                const sizes = item.sizes && item.sizes.length > 0 ? item.sizes : ['M'];
                const colors = item.colors && item.colors.length > 0 ? item.colors : ['White'];
                const inStock = item.stockCount !== undefined ? item.stockCount > 0 : (item.id % 11 !== 0);

                return (
                  <div key={item.id} className="mobile-wishlist-item">
                    <img src={item.image} alt={item.name} className="mobile-wishlist-img" />
                    <div className="mobile-wishlist-info">
                      <Link to={`/product/${item.id}`} className="mobile-wishlist-title">
                        {item.name}
                      </Link>
                      <div className="mobile-wishlist-price">${item.new_price}</div>
                      <span className={`mobile-wishlist-stock ${inStock ? 'in-stock' : 'out-of-stock'}`}>
                        {inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                      <div className="mobile-wishlist-btn-row">
                        <button 
                          type="button"
                          className="wishlist-add-cart-btn"
                          disabled={!inStock}
                          onClick={() => addToCart(item.id, sizes[0], colors[0], 1)}
                        >
                          Add To Cart
                        </button>
                      </div>
                    </div>
                    <button 
                      type="button"
                      className="mobile-wishlist-delete"
                      onClick={() => toggleWishlist(item.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Features bar at the bottom */}
        <div className="features-bar-grid">
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Truck size={22} />
            </div>
            <div className="feature-info">
              <h3>Free Shipping</h3>
              <p>For all orders over $99. Safe and rapid transport.</p>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <ShieldCheck size={22} />
            </div>
            <div className="feature-info">
              <h3>Security Payment</h3>
              <p>100% secure payment methods and SSL transaction security.</p>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <RotateCcw size={22} />
            </div>
            <div className="feature-info">
              <h3>14-Day Return</h3>
              <p>Shop with confidence. Easy returns inside 14 days.</p>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Headphones size={22} />
            </div>
            <div className="feature-info">
              <h3>24/7 Support</h3>
              <p>Customer help desk. Friendly support around the clock.</p>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default Wishlist;
