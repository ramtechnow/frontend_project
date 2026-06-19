import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { X, LogIn, LogOut, Heart, ShoppingCart } from "lucide-react";
import { AuthContext } from "../Context/AuthContext";
import { CartContext } from "../Context/CartContext";
import "../styles/mobile.css";

const MobileMenu = ({ isOpen, onClose }) => {
  const { currentUser, logout } = useContext(AuthContext);
  const { clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogout = async () => {
    await logout();
    clearCart();
    onClose();
    navigate("/");
  };

  const handleLinkClick = () => {
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div className="mobile-menu-backdrop" onClick={onClose} aria-hidden="true" />

      {/* Drawer */}
      <div className="mobile-menu-drawer" role="dialog" aria-modal="true" aria-label="Mobile Navigation Menu">
        <div className="mobile-menu-header">
          <div className="mobile-menu-logo">
            <img src="https://img.icons8.com/color/96/shopping-bag-full.png" alt="SHOPPER Bag Logo" />
            <span>SHOPPER</span>
          </div>
          <button className="mobile-menu-close-btn" onClick={onClose} aria-label="Close menu">
            <X size={24} />
          </button>
        </div>

        {/* Links */}
        <ul className="mobile-menu-links">
          <li>
            <Link to="/" onClick={handleLinkClick}>Shop</Link>
          </li>
          <li>
            <Link to="/mens" onClick={handleLinkClick}>Men</Link>
          </li>
          <li>
            <Link to="/womens" onClick={handleLinkClick}>Women</Link>
          </li>
          <li>
            <Link to="/kids" onClick={handleLinkClick}>Kids</Link>
          </li>
          <li>
            <Link to="/wishlist" onClick={handleLinkClick} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Heart size={18} /> Wishlist
            </Link>
          </li>
          <li>
            <Link to="/cart" onClick={handleLinkClick} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <ShoppingCart size={18} /> Cart
            </Link>
          </li>
          {currentUser && (
            <li>
              <Link to="/orders" onClick={handleLinkClick}>My Orders</Link>
            </li>
          )}
          {currentUser?.isAdmin && (
            <li>
              <Link to="/admin" onClick={handleLinkClick} style={{ color: "var(--accent-pink)" }}>Admin Panel</Link>
            </li>
          )}
        </ul>

        {/* Action Button Footer */}
        <div className="mobile-menu-footer">
          {currentUser ? (
            <button className="mobile-menu-action-btn mobile-menu-logout-btn" onClick={handleLogout}>
              <LogOut size={16} /> Logout
            </button>
          ) : (
            <Link to="/login" onClick={handleLinkClick}>
              <button className="mobile-menu-action-btn mobile-menu-login-btn">
                <LogIn size={16} /> Login / Signup
              </button>
            </Link>
          )}
        </div>
      </div>
    </>
  );
};

export default MobileMenu;
