import React, { useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { X, LogIn, LogOut, Heart, ShoppingCart, Sun, Moon } from "lucide-react";
import { useAuth } from "../features/auth/hooks/useAuth";
import { useCart } from "../features/checkout/hooks/useCart";
import { useWishlist } from "../features/catalog/hooks/useWishlist";
import { ThemeContext } from "../Context/ThemeContext";
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
  const location = useLocation();
  const themeContext = useContext(ThemeContext);

  if (!isOpen) return null;

  const isDarkMode = themeContext?.isDarkMode || false;
  const toggleTheme = themeContext?.toggleTheme || (() => {});

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
          <div className="mobile-menu-brand">
            RamCart
          </div>
          <div className="mobile-menu-header-actions">
            <button className="mobile-menu-theme-btn" onClick={toggleTheme} aria-label="Toggle theme">
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className="mobile-menu-close-square-btn" onClick={onClose} aria-label="Close menu">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Links */}
        <ul className="mobile-menu-links">
          <li className={location.pathname === "/catalog" ? "active" : ""}>
            <Link to="/catalog" onClick={handleLinkClick}>Shop All</Link>
          </li>
          <li className={location.pathname === "/mens" ? "active" : ""}>
            <Link to="/mens" onClick={handleLinkClick}>Men</Link>
          </li>
          <li className={location.pathname === "/womens" ? "active" : ""}>
            <Link to="/womens" onClick={handleLinkClick}>Women</Link>
          </li>
          <li className={location.pathname === "/kids" ? "active" : ""}>
            <Link to="/kids" onClick={handleLinkClick}>Kids</Link>
          </li>
          <li className={location.pathname === "/wishlist" ? "active" : ""}>
            <Link to="/wishlist" onClick={handleLinkClick} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Heart size={18} /> Wishlist {wishlist.length > 0 && <span className="mobile-badge">{wishlist.length}</span>}
            </Link>
          </li>
          <li className={location.pathname === "/cart" ? "active" : ""}>
            <Link to="/cart" onClick={handleLinkClick} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <ShoppingCart size={18} /> Cart {cartCount > 0 && <span className="mobile-badge">{cartCount}</span>}
            </Link>
          </li>
          {user && (
            <li className={location.pathname === "/orders" ? "active" : ""}>
              <Link to="/orders" onClick={handleLinkClick}>My Orders</Link>
            </li>
          )}
          {user?.role === "admin" && (
            <li className={location.pathname === "/admin" ? "active" : ""}>
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
