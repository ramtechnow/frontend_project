import React, { useState, useRef, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/navbar.css";
import { ShoppingCart, Menu, Heart, Package, LogOut, ShieldCheck, ChevronDown, Sun, Moon } from "lucide-react";
import { CartContext } from "../Context/CartContext";
import { AuthContext } from "../Context/AuthContext";
import { ThemeContext } from "../Context/ThemeContext";
import { WishlistContext } from "../Context/WishlistContext";
import MobileMenu from "./MobileMenu";

const Navbar = () => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { getCartItemCount, clearCart } = useContext(CartContext);
  const { currentUser, logout } = useContext(AuthContext);
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const { wishlistItems } = useContext(WishlistContext);

  const dropdownRef = useRef();
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    await logout();
    clearCart();
    navigate("/");
  };

  const getUserInitial = () => {
    if (currentUser?.displayName) return currentUser.displayName.charAt(0).toUpperCase();
    if (currentUser?.email) return currentUser.email.charAt(0).toUpperCase();
    return "U";
  };

  return (
    <>
      <nav className="navbar" aria-label="Main Navigation">
        {/* LOGO */}
        <Link to="/" className="nav-logo" aria-label="SHOPPER Home">
          <img src="https://img.icons8.com/color/96/shopping-bag-full.png" alt="SHOPPER Bag Logo" />
          <p>SHOPPER</p>
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
          {currentUser ? (
            <div className="nav-user-dropdown-wrapper" ref={dropdownRef}>
              <button
                className="nav-avatar-btn"
                onClick={() => setUserDropdownOpen(prev => !prev)}
                aria-label="User account menu"
                aria-expanded={userDropdownOpen}
              >
                <span className="nav-avatar-initial">{getUserInitial()}</span>
                <span className="nav-avatar-name">{currentUser.displayName?.split(" ")[0] || "Account"}</span>
                <ChevronDown size={14} />
              </button>

              {userDropdownOpen && (
                <div className="nav-user-dropdown" role="menu">
                  <div className="dropdown-user-info">
                    <div className="dropdown-avatar-large">{getUserInitial()}</div>
                    <div>
                      <p className="dropdown-user-name">{currentUser.displayName}</p>
                      <p className="dropdown-user-email">{currentUser.email}</p>
                    </div>
                  </div>
                  <div className="dropdown-divider" />
                  <button className="dropdown-item" onClick={() => { setUserDropdownOpen(false); navigate("/orders"); }} role="menuitem">
                    <Package size={16} /> My Orders
                  </button>
                  {currentUser?.isAdmin && (
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
            aria-label={`View Wishlist with ${wishlistItems.length} items`}
          >
            <Heart size={22} />
            {wishlistItems.length > 0 && <div className="nav-cart-count">{wishlistItems.length}</div>}
          </button>

          {/* Cart Link */}
          <button
            className="nav-cart-wrapper"
            onClick={() => navigate("/cart")}
            aria-label={`View Cart with ${getCartItemCount()} items`}
          >
            <ShoppingCart size={22} />
            {getCartItemCount() > 0 && <div className="nav-cart-count">{getCartItemCount()}</div>}
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
