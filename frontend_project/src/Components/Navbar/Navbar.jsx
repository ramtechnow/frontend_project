import React, { useState, useRef, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";
import logo from "../Assets/logo.png";
import useCart from "../../Hooks/useCart";
import useAuth from "../../Hooks/useAuth";
import useTheme from "../../Hooks/useTheme";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Menu, Heart } from "lucide-react";
import { WishlistContext } from "../../Context/WishlistContext";

const MotionMenu = motion(Menu);
const MotionShoppingCart = motion(ShoppingCart);
const MotionHeart = motion(Heart);

const Navbar = () => {
  const [menu, setMenu] = useState("shop");
  const { getCartItemCount, clearCart } = useCart();
  const { currentUser, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const { wishlistItems } = useContext(WishlistContext);
  
  const menuRef = useRef();
  const navigate = useNavigate();

  const dropdown_toggle = (e) => {
    menuRef.current.classList.toggle("nav-menu-visible");
    e.currentTarget.classList.toggle("open");
  };

  const handleLogout = async () => {
    await logout();
    clearCart();
    navigate("/");
  };

  return (
    <motion.div 
      className="navbar"
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <Link to="/" style={{ textDecoration: "none" }} onClick={() => setMenu("shop")}>
        <motion.div 
          className="nav-logo"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          <img src={logo} alt="Shop Logo" />
          <p>SHOPPER</p>
        </motion.div>
      </Link>

      <MotionMenu 
        className="nav-dropdown" 
        onClick={dropdown_toggle} 
        size={28}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
      />

      <ul ref={menuRef} className="nav-menu">
        <li onClick={() => setMenu("shop")}>
          <Link style={{ textDecoration: "none" }} to="/">Shop</Link>
          {menu === "shop" ? (
            <motion.hr layoutId="activeUnderline" transition={{ type: "spring", stiffness: 380, damping: 30 }} />
          ) : null}
        </li>
        <li onClick={() => setMenu("mens")}>
          <Link style={{ textDecoration: "none" }} to="/mens">Men</Link>
          {menu === "mens" ? (
            <motion.hr layoutId="activeUnderline" transition={{ type: "spring", stiffness: 380, damping: 30 }} />
          ) : null}
        </li>
        <li onClick={() => setMenu("womens")}>
          <Link style={{ textDecoration: "none" }} to="/womens">Women</Link>
          {menu === "womens" ? (
            <motion.hr layoutId="activeUnderline" transition={{ type: "spring", stiffness: 380, damping: 30 }} />
          ) : null}
        </li>
        <li onClick={() => setMenu("kids")}>
          <Link style={{ textDecoration: "none" }} to="/kids">Kids</Link>
          {menu === "kids" ? (
            <motion.hr layoutId="activeUnderline" transition={{ type: "spring", stiffness: 380, damping: 30 }} />
          ) : null}
        </li>
      </ul>

      <div className="nav-login-cart">
        {/* Dynamic Theme Toggler */}
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

        {/* User Identity / Authentication */}
        {currentUser ? (
          <div className="nav-user-profile">
            <span className="nav-username">Hi, {currentUser.displayName}</span>
            <motion.button 
              className="nav-logout-btn" 
              onClick={handleLogout}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Logout
            </motion.button>
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

        {currentUser?.isAdmin && (
          <Link to="/admin">
            <motion.button 
              className="nav-admin-btn"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Admin
            </motion.button>
          </Link>
        )}

        <motion.div 
          className="nav-wishlist-wrapper" 
          onClick={() => navigate("/wishlist")} 
          style={{ cursor: "pointer" }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <MotionHeart 
            size={30} 
            className="nav-wishlist-icon"
            whileHover={{ scale: 1.15 }}
            transition={{ duration: 0.3 }}
          />
          {wishlistItems.length > 0 && (
            <AnimatePresence mode="wait">
              <motion.div 
                className="nav-cart-count"
                key={wishlistItems.length}
                initial={{ scale: 0.7, opacity: 0.2 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0.2 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
              >
                {wishlistItems.length}
              </motion.div>
            </AnimatePresence>
          )}
        </motion.div>

        <motion.div 
          className="nav-cart-wrapper" 
          onClick={() => navigate("/cart")} 
          style={{ cursor: "pointer" }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <MotionShoppingCart 
            size={30} 
            className="nav-cart-icon"
            whileHover={{ rotate: [-5, 5, -5, 5, 0] }}
            transition={{ duration: 0.4 }}
          />
          <AnimatePresence mode="wait">
            <motion.div 
              className="nav-cart-count"
              key={getCartItemCount()}
              initial={{ scale: 0.7, opacity: 0.2 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0.2 }}
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