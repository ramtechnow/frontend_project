import React from "react";
import { Link } from "react-router-dom";
import "../Styles/productGrid.css";

const CategoryCard = ({ category }) => {
  return (
    <Link to={category.link} className="category-card" aria-label={`Shop ${category.name}`}>
      <img
        src={category.image}
        alt={category.name}
        className="category-card-image"
        loading="lazy"
      />
      <div className="category-card-overlay">
        <h3 className="category-card-title">{category.name}</h3>
        <span className="category-card-count">{category.count} Products</span>
      </div>
    </Link>
  );
};

export default CategoryCard;
