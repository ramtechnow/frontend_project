import React, { useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { X, LogIn, LogOut, Heart, ShoppingCart, Sun, Moon, Mail } from "lucide-react";
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

          {/* Support contact info in Mobile Menu footer */}
          <div className="mobile-menu-support-info" style={{ display: "flex", flexDirection: "column", gap: "10px", borderTop: "1px solid var(--border-color)", marginTop: "16px", paddingTop: "14px", fontSize: "12px", width: "100%", boxSizing: "border-box" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-secondary)" }}>
              <Mail size={14} style={{ color: "var(--accent-pink)", flexShrink: 0 }} />
              <span>Email: <a href="mailto:ramtechnow@gmail.com" style={{ color: "var(--accent-pink)", fontWeight: "700" }}>ramtechnow@gmail.com</a></span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-secondary)" }}>
              {/* WhatsApp Icon */}
              <svg style={{ height: "14px", width: "14px", fill: "#25D366", flexShrink: 0 }} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.835-4.86c1.62.962 3.41 1.47 5.267 1.472 5.518 0 10.006-4.487 10.01-10.007.002-2.673-1.036-5.186-2.924-7.078-1.889-1.891-4.407-2.934-7.086-2.936-5.524 0-10.012 4.488-10.017 10.008-.002 1.897.501 3.75 1.458 5.389L1.936 21.052l5.127-1.348-.17-.164zm10.155-7.798c-.29-.145-1.72-.848-1.986-.944-.265-.096-.459-.144-.652.146-.193.29-.748.944-.917 1.137-.168.193-.338.217-.628.072-.29-.145-1.226-.452-2.335-1.442-.863-.77-1.446-1.72-1.615-2.01-.17-.29-.018-.448.127-.592.13-.13.29-.338.434-.507.145-.168.193-.29.29-.483.096-.193.048-.361-.024-.507-.072-.145-.652-1.57-.893-2.149-.235-.567-.476-.49-.652-.499-.17-.008-.361-.01-.554-.01-.193 0-.507.072-.772.361-.265.29-1.013.99-1.013 2.415 0 1.423 1.037 2.799 1.18 2.992.145.193 2.04 3.114 4.939 4.363.69.298 1.229.476 1.648.609.692.22 1.323.19 1.82.115.553-.083 1.72-.703 1.961-1.382.242-.678.242-1.26.17-1.382-.072-.12-.265-.193-.555-.338z"/>
              </svg>
              <span>WhatsApp: <a href="https://wa.me/919080339752" target="_blank" rel="noopener noreferrer" style={{ color: "#25D366", fontWeight: "800", textDecoration: "underline" }}>Chat Support</a></span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileMenu;
