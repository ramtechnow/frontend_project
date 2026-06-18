import React, { useState, useRef, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";
import logo from "../Assets/logo.png";
import useCart from "../../Hooks/useCart";
import useAuth from "../../Hooks/useAuth";
import useTheme from "../../Hooks/useTheme";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Menu, Heart, Package, LogOut, ShieldCheck, ChevronDown, X } from "lucide-react";
import { WishlistContext } from "../../Context/WishlistContext";

const Navbar = () => {
  const [menu, setMenu] = useState("shop");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { getCartItemCount, clearCart } = useCart();
  const { currentUser, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const { wishlistItems } = useContext(WishlistContext);

  const mobileMenuRef = useRef();
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

  const toggleMobileMenu = (e) => {
    const next = !mobileMenuOpen;
    setMobileMenuOpen(next);
    if (next) {
      mobileMenuRef.current?.classList.add("nav-menu-visible");
      e.currentTarget.classList.add("open");
    } else {
      mobileMenuRef.current?.classList.remove("nav-menu-visible");
      e.currentTarget.classList.remove("open");
    }
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    mobileMenuRef.current?.classList.remove("nav-menu-visible");
  };

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    await logout();
    clearCart();
    navigate("/");
  };

  const handleNavToOrders = () => {
    setUserDropdownOpen(false);
    navigate("/orders");
  };

  const handleNavToAdmin = () => {
    setUserDropdownOpen(false);
    navigate("/admin");
  };

  const getUserInitial = () => {
    if (currentUser?.displayName) return currentUser.displayName.charAt(0).toUpperCase();
    if (currentUser?.email) return currentUser.email.charAt(0).toUpperCase();
    return "U";
  };

  return (
    <motion.div
      className="navbar"
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* LOGO */}
      <Link to="/" style={{ textDecoration: "none" }} onClick={() => { setMenu("shop"); closeMobileMenu(); }}>
        <motion.div className="nav-logo" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
          <img src={logo} alt="Shop Logo" />
          <p>SHOPPER</p>
        </motion.div>
      </Link>

      {/* HAMBURGER for mobile */}
      <button className="nav-hamburger" onClick={toggleMobileMenu} aria-label="Toggle menu">
        <AnimatePresence mode="wait" initial={false}>
          {mobileMenuOpen
            ? <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}><X size={26} /></motion.span>
            : <motion.span key="m" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}><Menu size={26} /></motion.span>
          }
        </AnimatePresence>
      </button>

      {/* NAV LINKS */}
      <ul ref={mobileMenuRef} className="nav-menu">
        {[
          { id: "shop", label: "Shop", to: "/" },
          { id: "mens", label: "Men", to: "/mens" },
          { id: "womens", label: "Women", to: "/womens" },
          { id: "kids", label: "Kids", to: "/kids" },
        ].map(({ id, label, to }) => (
          <li key={id} onClick={() => { setMenu(id); closeMobileMenu(); }}>
            <Link style={{ textDecoration: "none" }} to={to}>{label}</Link>
            {menu === id && (
              <motion.hr layoutId="activeUnderline" transition={{ type: "spring", stiffness: 380, damping: 30 }} />
            )}
          </li>
        ))}
      </ul>

      {/* RIGHT SIDE CONTROLS */}
      <div className="nav-login-cart">

        {/* Theme Toggle */}
        <motion.button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isDarkMode ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="theme-svg">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V21M4.95 4.95l1.59 1.59m10.91 10.91l1.59 1.59M3 12h2.25m13.5 0H21M6.54 17.46l-1.59 1.59M17.46 6.54l1.59-1.59M12 8.25a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="theme-svg">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
            </svg>
          )}
        </motion.button>

        {/* USER PROFILE DROPDOWN (when logged in) or LOGIN BUTTON */}
        {currentUser ? (
          <div className="nav-user-dropdown-wrapper" ref={dropdownRef}>
            <motion.button
              className="nav-avatar-btn"
              onClick={() => setUserDropdownOpen(prev => !prev)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="User menu"
            >
              <span className="nav-avatar-initial">{getUserInitial()}</span>
              <span className="nav-avatar-name">{currentUser.displayName?.split(" ")[0] || "Account"}</span>
              <motion.span
                animate={{ rotate: userDropdownOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown size={14} />
              </motion.span>
            </motion.button>

            <AnimatePresence>
              {userDropdownOpen && (
                <motion.div
                  className="nav-user-dropdown"
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.18 }}
                >
                  <div className="dropdown-user-info">
                    <div className="dropdown-avatar-large">{getUserInitial()}</div>
                    <div>
                      <p className="dropdown-user-name">{currentUser.displayName}</p>
                      <p className="dropdown-user-email">{currentUser.email}</p>
                    </div>
                  </div>
                  <div className="dropdown-divider" />
                  <button className="dropdown-item" onClick={handleNavToOrders}>
                    <Package size={16} /> My Orders
                  </button>
                  {currentUser?.isAdmin && (
                    <button className="dropdown-item admin" onClick={handleNavToAdmin}>
                      <ShieldCheck size={16} /> Admin Panel
                    </button>
                  )}
                  <div className="dropdown-divider" />
                  <button className="dropdown-item logout" onClick={handleLogout}>
                    <LogOut size={16} /> Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <Link to="/login">
            <motion.button
              className="nav-login-btn"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Login
            </motion.button>
          </Link>
        )}

        {/* WISHLIST ICON */}
        <motion.div
          className="nav-wishlist-wrapper"
          onClick={() => navigate("/wishlist")}
          style={{ cursor: "pointer" }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Heart size={26} className="nav-wishlist-icon" />
          <AnimatePresence mode="wait">
            {wishlistItems.length > 0 && (
              <motion.div
                className="nav-cart-count"
                key={wishlistItems.length}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
              >
                {wishlistItems.length}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* CART ICON */}
        <motion.div
          className="nav-cart-wrapper"
          onClick={() => navigate("/cart")}
          style={{ cursor: "pointer" }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ShoppingCart size={26} className="nav-cart-icon" />
          <AnimatePresence mode="wait">
            <motion.div
              className="nav-cart-count"
              key={getCartItemCount()}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 15 }}
            >
              {getCartItemCount()}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Navbar;