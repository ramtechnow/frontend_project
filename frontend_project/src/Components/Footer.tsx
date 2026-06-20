import React from "react";
import { Link } from "react-router-dom";
import { Mail, ShieldAlert, CreditCard, Award } from "lucide-react";
import "../Styles/footer.css";

export const Footer: React.FC = () => {
  return (
    <footer className="footer-container" aria-label="Footer Navigation">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Info */}
          <div className="footer-brand-column">
            <div className="footer-logo-row" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <svg width="28" height="28" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 20 H30 L45 70 H85 L95 35 H35" stroke="var(--accent-pink)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <circle cx="50" cy="85" r="10" fill="var(--text-primary)" />
                <circle cx="78" cy="85" r="10" fill="var(--text-primary)" />
                <path d="M40 30 H75 L60 55 H45 Z" fill="var(--accent-pink)" opacity="0.8" />
                <text x="48" y="52" fill="white" fontSize="22" fontWeight="900" textAnchor="middle" fontFamily="Poppins, sans-serif">R</text>
              </svg>
              <span style={{ fontWeight: "800", fontSize: "1.2rem", color: "var(--text-primary)" }}>
                Ram<span style={{ color: "var(--accent-pink)" }}>Cart</span>
              </span>
            </div>
            <p className="footer-brand-description">
              RamCart is an enterprise-grade portfolio eCommerce platform designed by RamTechnow Technologies, featuring premium design details, real-time data flow, and advanced administrative capabilities.
            </p>
            <div className="footer-social-list">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="footer-social-btn" aria-label="GitHub Repository">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="footer-social-btn" aria-label="LinkedIn Profile">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect width="4" height="12" x="2" y="9"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              </a>
              <a href="mailto:support@ramtechnow.com" className="footer-social-btn" aria-label="Email Customer Support">
                <Mail size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-links-column">
            <h4 className="footer-column-title">Categories</h4>
            <ul className="footer-links-list">
              <li><Link to="/">Shop Home</Link></li>
              <li><Link to="/mens">Men's Apparel</Link></li>
              <li><Link to="/womens">Women's Apparel</Link></li>
              <li><Link to="/kids">Kids Collection</Link></li>
            </ul>
          </div>

          {/* Customer Area */}
          <div className="footer-links-column">
            <h4 className="footer-column-title">Account</h4>
            <ul className="footer-links-list">
              <li><Link to="/login">Sign In / Sign Up</Link></li>
              <li><Link to="/cart">My Cart</Link></li>
              <li><Link to="/wishlist">My Wishlist</Link></li>
              <li><Link to="/orders">Order History</Link></li>
            </ul>
          </div>

          {/* Trust Area */}
          <div className="footer-contact-column">
            <h4 className="footer-column-title">Demo Notice</h4>
            <div className="footer-contact-item">
              <ShieldAlert size={18} />
              <span>
                <strong>Demonstration Mode:</strong> No real currency is accepted, nor are items dispatched.
              </span>
            </div>
            <div className="footer-contact-item">
              <Award size={18} />
              <span>
                Built with React, Redux Toolkit, TanStack Query, and CSS Custom Properties.
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom-bar">
          <span className="footer-copyright">
            &copy; {new Date().getFullYear()} RamCart by RamTechnow Technologies. All rights reserved.
          </span>
          <div className="footer-payment-logos" aria-label="Accepted simulated payment options">
            <CreditCard size={20} />
            <span style={{ fontSize: "11px", fontWeight: "600" }}>SECURE SIMULATED CHECKOUT</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
