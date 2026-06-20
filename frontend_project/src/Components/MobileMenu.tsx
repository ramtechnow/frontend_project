import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { X, LogIn, LogOut, Heart, ShoppingCart } from "lucide-react";
import { useAuth } from "../features/auth/hooks/useAuth";
import { useCart } from "../features/checkout/hooks/useCart";
import { useWishlist } from "../features/catalog/hooks/useWishlist";
import "../Styles/mobile.css";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const { user, logoutUser } = useAuth();
  const { clearCart, cartCount } = useCart();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogout = async () => {
    await logoutUser();
    await clearCart();
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
          <div className="mobile-menu-logo" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <svg width="28" height="28" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 20 H30 L45 70 H85 L95 35 H35" stroke="var(--accent-pink)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <circle cx="50" cy="85" r="10" fill="var(--text-primary)" />
              <circle cx="78" cy="85" r="10" fill="var(--text-primary)" />
              <path d="M40 30 H75 L60 55 H45 Z" fill="var(--accent-pink)" opacity="0.8" />
              <text x="48" y="52" fill="white" fontSize="22" fontWeight="900" textAnchor="middle" fontFamily="Poppins, sans-serif">R</text>
            </svg>
            <span style={{ fontWeight: "800", fontSize: "1.15rem", color: "var(--text-primary)" }}>
              Ram<span style={{ color: "var(--accent-pink)" }}>Cart</span>
            </span>
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
              <Heart size={18} /> Wishlist {wishlist.length > 0 && <span className="mobile-badge">{wishlist.length}</span>}
            </Link>
          </li>
          <li>
            <Link to="/cart" onClick={handleLinkClick} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <ShoppingCart size={18} /> Cart {cartCount > 0 && <span className="mobile-badge">{cartCount}</span>}
            </Link>
          </li>
          {user && (
            <li>
              <Link to="/orders" onClick={handleLinkClick}>My Orders</Link>
            </li>
          )}
          {user?.role === "admin" && (
            <li>
              <Link to="/admin" onClick={handleLinkClick} style={{ color: "var(--accent-pink)" }}>Admin Panel</Link>
            </li>
          )}
        </ul>

        {/* Action Button Footer */}
        <div className="mobile-menu-footer">
          {user ? (
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
