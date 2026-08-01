import React, { useState, useRef, useContext, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../Styles/navbar.css";
import {
  ShoppingCart, Heart, LogOut, ChevronDown,
  Sun, Moon, X, Home, LayoutGrid, User, LogIn,
  Package, ShieldCheck, Menu
} from "lucide-react";
import { useCart } from "../features/checkout/hooks/useCart";
import { useAuth } from "../features/auth/hooks/useAuth";
import { ThemeContext } from "../Context/ThemeContext";
import { useWishlist } from "../features/catalog/hooks/useWishlist";
import { useAppDispatch } from "../store/hooks";
import { addToast } from "../store/slices/toastSlice";
import { fetchUnseenOrders, markOrderAsSeen } from "../features/checkout/services/orderService";
import ThemeCustomizer from "./ui/ThemeCustomizer";

export const Navbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { cartCount, clearCart } = useCart();
  const { user, logoutUser } = useAuth();
  const themeContext = useContext(ThemeContext);
  const { wishlist } = useWishlist();

  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isDarkMode = themeContext?.isDarkMode || false;
  const toggleTheme = themeContext?.toggleTheme || (() => {});

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

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

  // Listen to mobile menu toggle event (from MobileBottomNav)
  useEffect(() => {
    const handleToggle = () => setMobileMenuOpen(prev => !prev);
    window.addEventListener("toggle-mobile-menu", handleToggle);
    return () => window.removeEventListener("toggle-mobile-menu", handleToggle);
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  // Close drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Unseen orders check
  useEffect(() => {
    if (user) {
      const checkUnseenOrders = async () => {
        try {
          const unseen = await fetchUnseenOrders();
          for (const order of unseen) {
            if (order && order.id) {
              dispatch(addToast({
                message: `Your order #RC-${order.id.substring(0, 8).toUpperCase()} status has updated to: ${order.status}!`,
                type: "info"
              }));
              await markOrderAsSeen(order.id);
            }
          }
        } catch (e) {
          console.warn("Unseen order status check failed:", e);
        }
      };
      checkUnseenOrders();
    }
  }, [user, dispatch]);

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    await logoutUser();
    await clearCart();
    navigate("/");
  };

  const getUserInitial = () => {
    if (user?.name) return user.name.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return "U";
  };

  const navLinks = [
    { to: "/catalog", label: "Shop All", icon: <LayoutGrid size={17} /> },
    { to: "/mens",    label: "Men",      icon: <User size={17} /> },
    { to: "/womens",  label: "Women",    icon: <User size={17} /> },
    { to: "/kids",    label: "Kids",     icon: <Home size={17} /> },
  ];

  return (
    <>
      {/* ─── MAIN NAVBAR ─────────────────────────────────── */}
      <nav className="navbar" aria-label="Main Navigation">

        {/* Stylistic brand text logo */}
        <Link to="/" className="nav-logo-text" aria-label="RamCart Home" style={{ textDecoration: "none" }}>
          <span className="logo-ram">RAM</span>
          <span className="logo-cart">CART</span>
        </Link>

        {/* Desktop nav links */}
        <ul className="nav-menu">
          {navLinks.map(({ to, label }) => (
            <li key={to}>
              <Link to={to} className={isActive(to) ? "active" : ""}>{label}</Link>
            </li>
          ))}
        </ul>

        {/* Right action group */}
        <div className="nav-login-cart">
          {/* Theme toggle */}
          <button className="theme-toggle-btn" onClick={toggleTheme}
            aria-label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            title={isDarkMode ? "Light Mode" : "Dark Mode"}>
            {isDarkMode ? <Sun size={19} className="theme-svg" /> : <Moon size={19} className="theme-svg" />}
          </button>

          {/* User section */}
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
                      <p className="dropdown-user-name">{user.name || "User"}</p>
                      <p className="dropdown-user-email">{user.email}</p>
                    </div>
                  </div>
                  <div className="dropdown-divider" />
                  <Link to="/profile" onClick={() => setUserDropdownOpen(false)}>
                    <button className="dropdown-item" role="menuitem">
                      <User size={15} /> My Profile
                    </button>
                  </Link>
                  <Link to="/orders" onClick={() => setUserDropdownOpen(false)}>
                    <button className="dropdown-item" role="menuitem">
                      <Package size={15} /> My Orders
                    </button>
                  </Link>
                  {user.role === "admin" && (
                    <>
                      <div className="dropdown-divider" />
                      <Link to="/admin" onClick={() => setUserDropdownOpen(false)}>
                        <button className="dropdown-item admin" role="menuitem">
                          <ShieldCheck size={15} /> Admin Panel
                        </button>
                      </Link>
                    </>
                  )}
                  <div className="dropdown-divider" />
                  <button className="dropdown-item logout" onClick={handleLogout} role="menuitem">
                    <LogOut size={15} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" style={{ display: "flex", alignItems: "center" }}>
              <button className="nav-login-btn">Login</button>
              <button className="nav-mobile-login-icon-btn" aria-label="Login" style={{ padding: 0 }}>
                <User size={18} />
              </button>
            </Link>
          )}

          {/* Wishlist (desktop) */}
          <button className="nav-wishlist-wrapper" onClick={() => navigate("/wishlist")}
            aria-label={`Wishlist (${wishlist.length} items)`}>
            <Heart size={21} />
            {wishlist.length > 0 && <div className="nav-cart-count">{wishlist.length}</div>}
          </button>
          {/* Cart (desktop) */}
          <button className="nav-cart-wrapper" onClick={() => navigate("/cart")}
            aria-label={`Cart (${cartCount} items)`}>
            <ShoppingCart size={21} />
            {cartCount > 0 && <div className="nav-cart-count">{cartCount}</div>}
          </button>

          {/* Mobile Menu Toggle (Hamburger) */}
          <button 
            className="nav-mobile-menu-btn" 
            onClick={() => setMobileMenuOpen(prev => !prev)}
            aria-label="Toggle Navigation Menu"
            title="Menu"
            style={{ padding: 0 }}
          >
            <Menu size={18} />
          </button>
        </div>
      </nav>

      {/* ─── MOBILE SLIDE-IN DRAWER ──────────────────────── */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="mob-drawer-backdrop"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <aside className="mob-drawer" aria-label="Mobile Navigation" role="dialog" aria-modal="true">
            {/* Header */}
            <div className="mob-drawer-header">
              <span className="mob-drawer-brand">RamCart</span>
              <div className="mob-drawer-header-right">
                <button className="mob-drawer-theme-btn" onClick={toggleTheme} aria-label="Toggle theme">
                  {isDarkMode ? <Sun size={17} /> : <Moon size={17} />}
                </button>
                <button className="mob-drawer-close-btn" onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Scrollable drawer body */}
            <div className="mob-drawer-body-scroll" style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
              {/* User greeting */}
              {user && (
                <div className="mob-drawer-user-info">
                  <div className="mob-drawer-user-avatar">{getUserInitial()}</div>
                  <div>
                    <div className="mob-drawer-user-name">{user.name?.split(" ")[0] || "User"}</div>
                    <div className="mob-drawer-user-email">{user.email}</div>
                  </div>
                </div>
              )}

              {/* Nav links */}
              <nav className="mob-drawer-nav" style={{ flex: "none", overflow: "visible" }}>
                <p className="mob-drawer-section-label">Browse</p>
                {navLinks.map(({ to, label, icon }) => (
                  <Link
                    key={to}
                    to={to}
                    className={`mob-drawer-link ${isActive(to) ? "mob-drawer-link--active" : ""}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="mob-drawer-link-icon">{icon}</span>
                    {label}
                  </Link>
                ))}

                {user && (
                  <>
                    <p className="mob-drawer-section-label" style={{ marginTop: "16px" }}>Account</p>
                    <Link to="/wishlist" className={`mob-drawer-link ${isActive("/wishlist") ? "mob-drawer-link--active" : ""}`} onClick={() => setMobileMenuOpen(false)}>
                      <span className="mob-drawer-link-icon"><Heart size={17} /></span>
                      Wishlist
                      {wishlist.length > 0 && <span className="mob-drawer-badge">{wishlist.length}</span>}
                    </Link>
                    <Link to="/cart" className={`mob-drawer-link ${isActive("/cart") ? "mob-drawer-link--active" : ""}`} onClick={() => setMobileMenuOpen(false)}>
                      <span className="mob-drawer-link-icon"><ShoppingCart size={17} /></span>
                      My Cart
                      {cartCount > 0 && <span className="mob-drawer-badge">{cartCount}</span>}
                    </Link>
                    <Link to="/orders" className={`mob-drawer-link ${isActive("/orders") ? "mob-drawer-link--active" : ""}`} onClick={() => setMobileMenuOpen(false)}>
                      <span className="mob-drawer-link-icon"><Package size={17} /></span>
                      Orders
                    </Link>
                    {user.role === "admin" && (
                      <Link to="/admin" className="mob-drawer-link mob-drawer-link--admin" onClick={() => setMobileMenuOpen(false)}>
                        <span className="mob-drawer-link-icon"><ShieldCheck size={17} /></span>
                        Admin Panel
                      </Link>
                    )}
                  </>
                )}
              </nav>

              {/* Theme Customizer Panel */}
              <div style={{ padding: "0 10px 10px 10px" }}>
                <ThemeCustomizer />
              </div>

              {/* Footer actions */}
              <div className="mob-drawer-footer" style={{ paddingBottom: "100px" }}>
                {user ? (
                  <button className="mob-drawer-logout-btn" onClick={handleLogout}>
                    <LogOut size={16} /> Logout
                  </button>
                ) : (
                  <Link to="/login" className="mob-drawer-login-btn" onClick={() => setMobileMenuOpen(false)}>
                    <LogIn size={16} /> Login / Sign Up
                  </Link>
                )}

                <div className="mob-drawer-support">
                  <a href="mailto:ramtechnow@gmail.com">📧 ramtechnow@gmail.com</a>
                  <a href="https://wa.me/919080339752" target="_blank" rel="noopener noreferrer">
                    💬 WhatsApp Support
                  </a>
                </div>
              </div>
            </div>
          </aside>
        </>
      )}
    </>
  );
};

export default Navbar;
