import React from 'react';
import { Link } from 'react-router-dom';
import './Breadcrumb.css';
import arrow_icon from '../Assets/breadcrum_arrow.png';

export const Breadcrumb = (props) => {
  const { product } = props;

  if (!product) {
    return (
      <div className="breadcrumb">
        <Link to="/">HOME</Link> <img src={arrow_icon} alt="" /> SHOP
      </div>
    );
  }

  // Map category to path segment correctly (e.g. men -> mens, women -> womens, kid -> kids)
  const categoryLink = `/${product.category === 'kid' ? 'kids' : product.category + 's'}`;
  const categoryLabel = product.category ? product.category.toUpperCase() : '';

  return (
    <div className='breadcrum'>
      <Link to="/" className="breadcrumb-nav-link">HOME</Link>
      <img src={arrow_icon} alt="arrow" />
      <Link to="/" className="breadcrumb-nav-link">SHOP</Link>
      <img src={arrow_icon} alt="arrow" />
      <Link to={categoryLink} className="breadcrumb-nav-link category-link">
        {categoryLabel}
      </Link>
      <img src={arrow_icon} alt="arrow" />
      <span className="breadcrumb-current-item">{product.name}</span>
    </div>
  );
};

export default Breadcrumb;
