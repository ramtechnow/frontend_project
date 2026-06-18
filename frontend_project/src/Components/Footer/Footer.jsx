import React from 'react';
import './Footer.css';
import footer_logo from '../Assets/logo.png';
import { Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="orishop-footer">
      <div className="footer-container">
        
        {/* Brand info column */}
        <div className="footer-col brand-col">
          <div className="footer-brand-logo">
            <img src={footer_logo} alt="Oshop Logo" />
            <span>Oshop</span>
          </div>
          <p className="footer-brand-desc">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Illum, accusamus! Lorem ipsum dolor sit amet.
          </p>
          <div className="footer-contact-info">
            <a href="mailto:Contact@Company.com" className="contact-item">
              <Mail size={16} />
              <span>Contact@Company.com</span>
            </a>
            <a href="tel:+0012333456" className="contact-item">
              <Phone size={16} />
              <span>+001 2333 456</span>
            </a>
          </div>
        </div>

        {/* Customer Services Column */}
        <div className="footer-col">
          <h4 className="footer-heading">Customer Services</h4>
          <ul className="footer-links-list">
            <li><Link to="/about">Company Profile</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Help Center</Link></li>
            <li><Link to="/about">Careers</Link></li>
            <li><Link to="/">Features</Link></li>
          </ul>
        </div>

        {/* Useful Links Column */}
        <div className="footer-col">
          <h4 className="footer-heading">Useful links</h4>
          <ul className="footer-links-list">
            <li><Link to="/">Shop</Link></li>
            <li><Link to="/cart">Cart</Link></li>
            <li><Link to="/contact">FAQ</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/wishlist">Wishlist</Link></li>
          </ul>
        </div>

        {/* Download App Column */}
        <div className="footer-col app-download-col">
          <h4 className="footer-heading">Download App</h4>
          <p className="app-subtitle">Save $3 With App & New User only</p>
          
          <div className="app-badges">
            {/* Google Play Button */}
            <a href="https://play.google.com" target="_blank" rel="noopener noreferrer" className="app-badge-btn">
              <svg className="app-icon" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M5,3H19A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V5A2,2 0 0,1 5,3M17.5,18L9,13.5L17.5,9V18M8.5,8.5L13,13.5L8.5,18.5V8.5Z" />
              </svg>
              <div className="app-btn-text">
                <span className="btn-tiny">GET IT ON</span>
                <span className="btn-bold">Google Play</span>
              </div>
            </a>

            {/* App Store Button */}
            <a href="https://apple.com" target="_blank" rel="noopener noreferrer" className="app-badge-btn">
              <svg className="app-icon" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,22C14.32,22.05 13.89,21.23 12.37,21.23C10.84,21.23 10.37,21.97 9.09,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.1,16.67C20.08,16.74 19.67,18.11 18.71,19.5M15.97,4.17C16.63,3.37 17.07,2.28 16.95,1C16,1.04 14.9,1.6 14.24,2.38C13.68,3.04 13.19,4.14 13.34,5.39C14.39,5.47 15.4,4.88 15.97,4.17Z" />
              </svg>
              <div className="app-btn-text">
                <span className="btn-tiny">Download on the</span>
                <span className="btn-bold">App Store</span>
              </div>
            </a>
          </div>
        </div>

      </div>

      <hr className="footer-divider-line" />

      {/* Footer Bottom Bar */}
      <div className="footer-bottom-bar">
        <div className="footer-bottom-container">
          
          {/* Social Icons left */}
          <div className="footer-social-links">
            <a href="https://facebook.com" aria-label="Facebook">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v-2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 008.44-9.9c0-5.53-4.5-10.02-10-10.02z" />
              </svg>
            </a>
            <a href="https://twitter.com" aria-label="Twitter">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a href="https://linkedin.com" aria-label="LinkedIn">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>
            <a href="https://youtube.com" aria-label="Youtube">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.107C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.388.511a3.003 3.003 0 0 0-2.11 2.107C0 8.046 0 12 0 12s0 3.954.502 5.837a3.003 3.003 0 0 0 2.11 2.107c1.883.511 9.388.511 9.388.511s7.505 0 9.388-.511a3.003 3.003 0 0 0 2.11-2.107c.502-1.883.502-5.837.502-5.837s0-3.954-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
            <a href="https://instagram.com" aria-label="Instagram">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
          </div>

          <p className="footer-copyright-text">
            © {new Date().getFullYear()}. All Rights Reserved by <Link to="/">Shopu</Link>
          </p>

          {/* Payment providers right */}
          <div className="footer-payment-badges">
            <span className="payment-badge paypal">PayPal</span>
            <span className="payment-badge visa">Visa</span>
            <span className="payment-badge mastercard">MasterCard</span>
            <span className="payment-badge discover">Discover</span>
          </div>

        </div>
      </div>
    </footer>
  );
};

