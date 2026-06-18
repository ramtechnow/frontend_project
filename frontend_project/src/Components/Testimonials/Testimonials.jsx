import React from 'react';
import './Testimonials.css';
import { Star, Quote } from 'lucide-react';
import { motion } from 'framer-motion';

export const Testimonials = () => {
  const reviews = [
    {
      name: "Shriram Kumar",
      role: "Verified Buyer",
      comment: "I am absolutely thrilled with the fit and quality of the jackets! The simulated secure payment checkout experience was smooth and fast.",
      rating: 5,
      avatar: "S"
    },
    {
      name: "Emily Watson",
      role: "Loyal Customer",
      comment: "The discount coupon code SAVE20 worked perfectly at the cart checkout. Deliveries are prompt and customer service answers queries quickly.",
      rating: 5,
      avatar: "E"
    },
    {
      name: "Ravi Teja",
      role: "Standard Customer",
      comment: "Super comfortable fabrics! The layout fits perfectly on my phone, and it has become my favorite online shopping site.",
      rating: 5,
      avatar: "R"
    }
  ];

  return (
    <div className="testimonials-section">
      <div className="testimonials-container">
        <div className="section-title-wrap">
          <span className="section-subtitle">TESTIMONIALS</span>
          <h2>What People Are Saying</h2>
          <div className="section-title-bar" />
        </div>

        <div className="testimonials-grid">
          {reviews.map((rev, index) => (
            <motion.div 
              key={index}
              className="testimonial-card"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="quote-icon-wrap">
                <Quote size={28} />
              </div>

              <div className="stars-row">
                {[...Array(rev.rating)].map((_, i) => (
                  <Star key={i} size={15} fill="#f59e0b" color="#f59e0b" />
                ))}
              </div>

              <p className="testimonial-comment">"{rev.comment}"</p>

              <div className="testimonial-user-row">
                <div className="testimonial-avatar-circle">
                  {rev.avatar}
                </div>
                <div className="testimonial-user-meta">
                  <h4>{rev.name}</h4>
                  <span>{rev.role}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
