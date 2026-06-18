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
    <nav className='breadcrumb-nav'>
      <div className='breadcrumb-container'>
        <Link to="/" className="breadcrumb-link">HOME</Link>
        <span className="breadcrumb-separator"><img src={arrow_icon} alt="arrow" /></span>
        <Link to="/" className="breadcrumb-link">SHOP</Link>
        <span className="breadcrumb-separator"><img src={arrow_icon} alt="arrow" /></span>
        <Link to={categoryLink} className="breadcrumb-link category-link">
          {categoryLabel}
        </Link>
        <span className="breadcrumb-separator"><img src={arrow_icon} alt="arrow" /></span>
        <span className="breadcrumb-current truncate" title={product.name}>{product.name}</span>
      </div>
    </nav>
  );
};

export default Breadcrumb;
