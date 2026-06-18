import React from 'react';
import './Hero.css';
import exclusive_image from '../Assets/exclusive_image.png';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Hero = () => {
  const navigate = useNavigate();

  return (
    <div className='hero'>
      <div className="hero-content">
        <motion.div 
          className="hero-left"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.span 
            className="hero-badge"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            🔥 TRENDING COLLECTION
          </motion.span>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Exclusive Collection <br /> 
            <span>For Man & Woman</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Discover handpicked fashion garments, curated for ultimate elegance and modern trends. Enjoy up to 50% off this season!
          </motion.p>
          
          <motion.button 
            className="hero-cta-btn"
            onClick={() => navigate('/mens')}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <ShoppingBag size={18} /> Shop Now <ArrowRight size={16} />
          </motion.button>
        </motion.div>

        <motion.div 
          className="hero-right"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <div className="hexagon-collage">
            {/* Main Hexagon */}
            <div className="hexagon-wrapper main-hex">
              <div className="hexagon-inner">
                <img src={exclusive_image} alt="Exclusive Fashion Model" />
              </div>
            </div>

            {/* Accent Hexagon 1 */}
            <div className="hexagon-wrapper accent-hex-1">
              <div className="hexagon-inner">
                <div className="accent-color-fill" />
              </div>
            </div>

            {/* Accent Hexagon 2 */}
            <div className="hexagon-wrapper accent-hex-2">
              <div className="hexagon-inner">
                <div className="pattern-fill" />
              </div>
            </div>

            {/* Floating Badges */}
            <motion.div 
              className="floating-info-badge badge-1"
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            >
              <span>⭐ 4.9 Rating</span>
            </motion.div>

            <motion.div 
              className="floating-info-badge badge-2"
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
            >
              <span>🏷️ 50% OFF</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;
