import React from 'react';
import './Hero.css';
import hand_icon from '../Assets/hand_icon.png';
import arrow_icon from '../Assets/arrow.png';
import hero_image from '../Assets/hero_image_1.svg';
import { motion } from 'framer-motion';

export const Hero = () => {
  return (
    <div className='hero'>
        <motion.div 
          className="hero-left"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            NEW ARRIVALS ONLY
          </motion.h2>
          
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
              <div className="hero-hand-icon">
                  <p>new</p>
                  <motion.img 
                    src={hand_icon} 
                    alt="wave hand" 
                    animate={{ rotate: [0, 15, -10, 15, 0] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut", repeatDelay: 1 }}
                  />
              </div>
              <p>Collection</p>
              <p>for everyone</p>
          </motion.div>
          
          <motion.div 
            className="hero-latest-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{ cursor: 'pointer' }}
          >
              <div>Latest Collection</div>
              <img src={arrow_icon} alt="arrow" />
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="hero-right"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1, type: "spring", stiffness: 80 }}
        >
          <img src={hero_image} alt="Hero illustration" style={{ width: '100%', maxWidth: '560px', height: 'auto' }} />
        </motion.div>
    </div>
  );
};

export default Hero;
