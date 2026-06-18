import React from 'react';
import './HowItWorks.css';
import { Search, CreditCard, Truck, RefreshCcw } from 'lucide-react';
import { motion } from 'framer-motion';

export const HowItWorks = () => {
  const steps = [
    {
      title: "Search Products",
      desc: "Find your perfect outfits from our curated collection.",
      icon: <Search size={24} />
    },
    {
      title: "Choose Payment",
      desc: "Simulate a secure transaction via our PCI-DSS gateway.",
      icon: <CreditCard size={24} />
    },
    {
      title: "Fast Delivery",
      desc: "Quick, reliable shipping dispatched straight to your door.",
      icon: <Truck size={24} />
    },
    {
      title: "Easy Returns",
      desc: "Hassle-free size exchanges and 30-day return policy.",
      icon: <RefreshCcw size={24} />
    }
  ];

  return (
    <div className="how-it-works-section">
      <div className="how-it-works-container">
        <div className="section-title-wrap">
          <span className="section-subtitle">OUR PROCESS</span>
          <h2>How It Works Processing</h2>
          <div className="section-title-bar" />
        </div>

        <div className="steps-grid">
          {steps.map((step, index) => (
            <motion.div 
              key={index}
              className="step-card"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="step-badge-number">{index + 1}</div>
              <div className="step-icon-wrapper">
                {step.icon}
              </div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
