import React from 'react';
import './TopCategories.css';
import { useNavigate } from 'react-router-dom';
import { Shirt, Footprints, Sparkles, LayoutGrid } from 'lucide-react';
import { motion } from 'framer-motion';

export const TopCategories = () => {
  const navigate = useNavigate();

  const categories = [
    { name: "Men Collection", icon: <Shirt size={22} />, path: "/mens", items: "12 Items" },
    { name: "Women Collection", icon: <Sparkles size={22} />, path: "/womens", items: "12 Items" },
    { name: "Kids Collection", icon: <Footprints size={22} />, path: "/kids", items: "12 Items" },
    { name: "Browse All", icon: <LayoutGrid size={22} />, path: "/", items: "36 Items" },
  ];

  return (
    <div className="top-categories-section">
      <div className="top-categories-container">
        <div className="section-title-wrap">
          <span className="section-subtitle">HOT CATEGORIES</span>
          <h2>Choose By Top Category</h2>
          <div className="section-title-bar" />
        </div>

        <div className="categories-grid">
          {categories.map((cat, index) => (
            <motion.div
              key={index}
              className="category-card-item"
              onClick={() => navigate(cat.path)}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="category-icon-circle">
                {cat.icon}
              </div>
              <div className="category-meta-info">
                <h3>{cat.name}</h3>
                <span>{cat.items}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopCategories;
