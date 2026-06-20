import React, { useState, useRef, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../Styles/navbar.css";
import { ShoppingCart, Menu, Heart, Package, LogOut, ShieldCheck, ChevronDown, Sun, Moon } from "lucide-react";
import { useCart } from "../features/checkout/hooks/useCart";
import { useAuth } from "../features/auth/hooks/useAuth";
import { ThemeContext } from "../Context/ThemeContext";
import { useWishlist } from "../features/catalog/hooks/useWishlist";
import MobileMenu from "./MobileMenu";

export const Navbar: React.FC = () => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const { cartCount, clearCart } = useCart();
  const { user, logoutUser } = useAuth();
  const themeContext = useContext(ThemeContext);
  const { wishlist } = useWishlist();

  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const isDarkMode = themeContext?.isDarkMode || false;
  const toggleTheme = themeContext?.toggleTheme || (() => {});

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    await logoutUser();
    await clearCart();
    navigate("/");
  };

  const getUserInitial = () => {
    if (user?.name) return user.name.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return "U";
  };

  return (
    <>
      <nav className="navbar" aria-label="Main Navigation">
        {/* LOGO - RamCart Rebranded */}
        <Link to="/" className="nav-logo" aria-label="RamCart Home" style={{ display: "flex", alignItems: "center" }}>
          <img src="/RamCart_logo_v2.png" alt="RamCart Logo" style={{ height: "42px", objectFit: "contain" }} />
        </Link>

        {/* DESKTOP NAV LINKS */}
        <ul className="nav-menu">
          <li>
            <Link to="/">Shop</Link>
          </li>
          <li>
            <Link to="/mens">Men</Link>
          </li>
          <li>
            <Link to="/womens">Women</Link>
          </li>
          <li>
            <Link to="/kids">Kids</Link>
          </li>
        </ul>

        {/* RIGHT ACTIONS */}
        <div className="nav-login-cart">
          {/* Theme Toggle */}
          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? <Sun size={20} className="theme-svg" /> : <Moon size={20} className="theme-svg" />}
          </button>

          {/* User Section */}
          {user ? (
            <div className="nav-user-dropdown-wrapper" ref={dropdownRef}>
              <button
                className="nav-avatar-btn"
                onClick={() => setUserDropdownOpen(prev => !prev)}
                aria-label="User account menu"
                aria-expanded={userDropdownOpen}
              >
                <span className="nav-avatar-initial">{getUserInitial()}</span>
                <span className="nav-avatar-name">{user.name?.split(" ")[0] || "Account"}</span>
                <ChevronDown size={14} />
              </button>

              {userDropdownOpen && (
                <div className="nav-user-dropdown" role="menu">
                  <div className="dropdown-user-info">
                    <div className="dropdown-avatar-large">{getUserInitial()}</div>
                    <div>
                      <p className="dropdown-user-name">{user.name || "Customer"}</p>
                      <p className="dropdown-user-email">{user.email || ""}</p>
                    </div>
                  </div>
                  <div className="dropdown-divider" />
                  <button className="dropdown-item" onClick={() => { setUserDropdownOpen(false); navigate("/orders"); }} role="menuitem">
                    <Package size={16} /> My Orders
                  </button>
                  {user?.role === "admin" && (
                    <button className="dropdown-item admin" onClick={() => { setUserDropdownOpen(false); navigate("/admin"); }} role="menuitem">
                      <ShieldCheck size={16} /> Admin Panel
                    </button>
                  )}
                  <div className="dropdown-divider" />
                  <button className="dropdown-item logout" onClick={handleLogout} role="menuitem">
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login">
              <button className="nav-login-btn">Login</button>
            </Link>
          )}

          {/* Wishlist Link */}
          <button
            className="nav-wishlist-wrapper"
            onClick={() => navigate("/wishlist")}
            aria-label={`View Wishlist with ${wishlist.length} items`}
          >
            <Heart size={22} />
            {wishlist.length > 0 && <div className="nav-cart-count">{wishlist.length}</div>}
          </button>

          {/* Cart Link */}
          <button
            className="nav-cart-wrapper"
            onClick={() => navigate("/cart")}
            aria-label={`View Cart with ${cartCount} items`}
          >
            <ShoppingCart size={22} />
            {cartCount > 0 && <div className="nav-cart-count">{cartCount}</div>}
          </button>

          {/* Hamburger (Mobile) */}
          <button
            className="nav-hamburger"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Navigation Menu */}
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
};

export default Navbar;
