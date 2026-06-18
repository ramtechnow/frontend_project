import React, { useState } from 'react';
import './NewsLetter.css';
import exclusive_image from '../Assets/exclusive_image.png';

export const NewsLetter = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      alert(`🎉 Thank you for subscribing! Your 50% discount code has been dispatched to ${email}`);
      setEmail('');
    }
  };

  return (
    <div className='newsletter-section'>
      <div className="newsletter-container">
        <div className="newsletter-card-wrap">
          
          {/* Left Text Column */}
          <div className="newsletter-left-col">
            <span className="newsletter-subtitle">NEWSLETTER</span>
            <h2>
              Subscribe to our newsletter and <br />
              get <span>50% off</span> your first purchase
            </h2>
            <p>
              Stay updated with our latest collections, exclusive offers, and brand announcements straight to your inbox.
            </p>

            <form onSubmit={handleSubmit} className="newsletter-form">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='Enter your email address'
                required
              />
              <button type="submit">Subscribe</button>
            </form>
          </div>

          {/* Right Model Column */}
          <div className="newsletter-right-col">
            <img src={exclusive_image} alt="Newsletter Model Promo" className="newsletter-promo-img" />
            <div className="discount-circle-badge">
              <span>50%<br />OFF</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default NewsLetter;
