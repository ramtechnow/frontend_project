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
        <Link to="/" className="nav-logo" aria-label="RamCart Home" style={{ gap: "10px" }}>
          {/* Custom Sleek SVG logo styled like RamCart logo */}
          <svg width="34" height="34" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ overflow: "visible" }}>
            <path d="M10 20 H30 L45 70 H85 L95 35 H35" stroke="var(--accent-pink)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <circle cx="50" cy="85" r="10" fill="var(--text-primary)" />
            <circle cx="78" cy="85" r="10" fill="var(--text-primary)" />
            <path d="M40 30 H75 L60 55 H45 Z" fill="var(--accent-pink)" opacity="0.8" />
            {/* The elegant R character inside */}
            <text x="48" y="52" fill="white" fontSize="22" fontWeight="900" textAnchor="middle" fontFamily="Poppins, sans-serif">R</text>
          </svg>
          <div style={{ display: "flex", flexDirection: "column", lineHeight: "1" }}>
            <span style={{ fontSize: "20px", fontWeight: "900", letterSpacing: "0.5px", color: "var(--text-primary)" }}>
              Ram<span style={{ color: "var(--accent-pink)" }}>Cart</span>
            </span>
            <span style={{ fontSize: "8px", fontWeight: "500", letterSpacing: "1px", color: "var(--text-muted)", textTransform: "uppercase", marginTop: "2px" }}>
              by RamTechnow
            </span>
          </div>
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
