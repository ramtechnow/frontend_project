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
          <div className="mobile-menu-logo" style={{ display: "flex", alignItems: "center" }}>
            <img src="/RamCart_logo_v2.png" alt="RamCart Logo" style={{ height: "36px", objectFit: "contain" }} />
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
