import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";
import logo from "../Assets/logo.png";
import cart_icon from "../Assets/cart_icon.png";
import nav_dropdown from "../Assets/dropdown_icon.png";
import useCart from "../../Hooks/useCart";
import useAuth from "../../Hooks/useAuth";
import useTheme from "../../Hooks/useTheme";

const Navbar = () => {
  const [menu, setMenu] = useState("shop");
  const { getCartItemCount, clearCart } = useCart();
  const { currentUser, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  
  const menuRef = useRef();
  const navigate = useNavigate();

  const dropdown_toggle = (e) => {
    menuRef.current.classList.toggle("nav-menu-visible");
    e.target.classList.toggle("open");
  };

  const handleLogout = async () => {
    await logout();
    clearCart();
    navigate("/");
  };

  return (
    <div className="navbar">
      <Link to="/" style={{ textDecoration: "none" }} onClick={() => setMenu("shop")}>
        <div className="nav-logo">
          <img src={logo} alt="Shop Logo" />
          <p>SHOPPER</p>
        </div>
      </Link>

      <img 
        className="nav-dropdown" 
        onClick={dropdown_toggle} 
        src={nav_dropdown} 
        alt="Dropdown Menu" 
      />

      <ul ref={menuRef} className="nav-menu">
        <li onClick={() => setMenu("shop")}>
          <Link style={{ textDecoration: "none" }} to="/">Shop</Link>
          {menu === "shop" ? <hr /> : <></>}
        </li>
        <li onClick={() => setMenu("mens")}>
          <Link style={{ textDecoration: "none" }} to="/mens">Men</Link>
          {menu === "mens" ? <hr /> : <></>}
        </li>
        <li onClick={() => setMenu("womens")}>
          <Link style={{ textDecoration: "none" }} to="/womens">Women</Link>
          {menu === "womens" ? <hr /> : <></>}
        </li>
        <li onClick={() => setMenu("kids")}>
          <Link style={{ textDecoration: "none" }} to="/kids">Kids</Link>
          {menu === "kids" ? <hr /> : <></>}
        </li>
      </ul>

      <div className="nav-login-cart">
        {/* Dynamic Theme Toggler */}
        <button 
          className="theme-toggle-btn" 
          onClick={toggleTheme} 
          aria-label="Toggle Theme"
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkMode ? (
            // Sun Icon for Dark Mode (click to switch to light)
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="theme-svg">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V21M4.95 4.95l1.59 1.59m10.91 10.91l1.59 1.59M3 12h2.25m13.5 0H21M6.54 17.46l-1.59 1.59M17.46 6.54l1.59-1.59M12 8.25a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5z" />
            </svg>
          ) : (
            // Moon Icon for Light Mode (click to switch to dark)
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="theme-svg">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
            </svg>
          )}
        </button>

        {/* User Identity / Authentication */}
        {currentUser ? (
          <div className="nav-user-profile">
            <span className="nav-username">Hi, {currentUser.displayName}</span>
            <button className="nav-logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        ) : (
          <Link to="/login">
            <button className="nav-login-btn">Login</button>
          </Link>
        )}

        {currentUser?.isAdmin && (
          <Link to="/admin">
            <button className="nav-admin-btn">Admin</button>
          </Link>
        )}

        <div className="nav-cart-wrapper" onClick={() => navigate("/cart")} style={{ cursor: "pointer" }}>
          <img src={cart_icon} alt="Cart" />
          <div className="nav-cart-count">
            {getCartItemCount()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;