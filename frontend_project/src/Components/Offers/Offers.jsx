import React from 'react';
import './Offers.css';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

export const Offers = () => {
  const navigate = useNavigate();

  const promotions = [
    {
      title: "New Season Fashion",
      offer: "Save 30% Off",
      desc: "Fresh arrivals for spring & summer collection.",
      btnText: "Explore Now",
      path: "/womens",
      class: "promo-card-blue"
    },
    {
      title: "Men's Jackets & Outerwear",
      offer: "Save 20% Off",
      desc: "Premium casual jackets & zipper hoodies.",
      btnText: "Shop Jackets",
      path: "/mens",
      class: "promo-card-red"
    },
    {
      title: "Kids Cozy Sweatshirts",
      offer: "Save 40% Off",
      desc: "Super soft block hooded shirts for winter.",
      btnText: "Browse Kids",
      path: "/kids",
      class: "promo-card-gold"
    }
  ];

  return (
    <div className="offers-section">
      <div className="offers-container">
        {promotions.map((promo, index) => (
          <motion.div 
            key={index}
            className={`promo-card-item ${promo.class}`}
            whileHover={{ y: -6 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <div className="promo-card-content">
              <span className="promo-badge-offer">{promo.offer}</span>
              <h3>{promo.title}</h3>
              <p>{promo.desc}</p>
              <button 
                type="button" 
                onClick={() => navigate(promo.path)} 
                className="promo-shop-btn"
              >
                {promo.btnText} <ArrowUpRight size={14} />
              </button>
            </div>
            {/* Visual background accents */}
            <div className="promo-bg-circle-1" />
            <div className="promo-bg-circle-2" />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Offers;
