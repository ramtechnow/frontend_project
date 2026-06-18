import React from 'react';
import './FilterPanel.css';
import { X, Star } from 'lucide-react';
import sidebar_ad_banner from '../Assets/sidebar_ad_banner.png';

const SIZES = ['S', 'M', 'L', 'XL', 'XXL', '3XL', 'X', 'XS'];
const COLORS = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#ffffff', border: true },
  { name: 'Red', hex: '#f23e70' },
  { name: 'Blue', hex: '#1e88e5' },
  { name: 'Green', hex: '#4caf50' },
  { name: 'Pink', hex: '#ec4899' },
  { name: 'Grey', hex: '#888888' },
  { name: 'Orange', hex: '#ff9800' },
  { name: 'Yellow', hex: '#f59e0b' }
];

const BRANDS = ['Nike', 'Zara', 'Denim', 'Madame', 'Armani', 'Max moll', 'Bara', 'Hanger'];

const CATEGORY_MAP = [
  { name: "Tshirt", label: "Women's T-shirt" },
  { name: "Accessories", label: "Women Accessories" },
  { name: "Bag", label: "collage Bag" },
  { name: "Cap", label: "Men Cap" },
  { name: "Dress", label: "Old Man Dress" },
  { name: "Lehenga", label: "Lehenga" },
  { name: "Fashion", label: "Fashion Everyone" },
  { name: "Night Care", label: "Night Care" },
  { name: "Baby", label: "Baby Items" },
  { name: "Eye Care", label: "Eye Care" }
];

export const FilterPanel = ({ 
  filters, 
  onFilterChange, 
  onClearFilters, 
  filteredCount,
  isOpen,
  onClose,
  allCategoryProducts = []
}) => {

  const handleCategoryToggle = (categoryName) => {
    const updated = filters.categories.includes(categoryName)
      ? filters.categories.filter(c => c !== categoryName)
      : [...filters.categories, categoryName];
    onFilterChange('categories', updated);
  };

  const handleBrandToggle = (brandName) => {
    const updated = filters.brands ? (
      filters.brands.includes(brandName)
        ? filters.brands.filter(b => b !== brandName)
        : [...filters.brands, brandName]
    ) : [brandName];
    onFilterChange('brands', updated);
  };

  const handleSizeToggle = (size) => {
    const updated = filters.sizes.includes(size)
      ? filters.sizes.filter(s => s !== size)
      : [...filters.sizes, size];
    onFilterChange('sizes', updated);
  };

  const handleColorToggle = (colorName) => {
    const updated = filters.colors.includes(colorName)
      ? filters.colors.filter(c => c !== colorName)
      : [...filters.colors, colorName];
    onFilterChange('colors', updated);
  };

  // Dynamic counting helpers for UI tags
  const getCategoryCount = (catName) => {
    if (!allCategoryProducts.length) return 0;
    return allCategoryProducts.filter(item => {
      const name = item.name.toLowerCase();
      if (catName === "Tshirt") return name.includes("t-shirt") || name.includes("top") || name.includes("shirt");
      if (catName === "Accessories") return name.includes("accessories") || name.includes("bag");
      if (catName === "Bag") return name.includes("bag") || name.includes("pack");
      if (catName === "Cap") return name.includes("cap") || name.includes("hat");
      if (catName === "Dress") return name.includes("dress") || name.includes("jacket") || name.includes("coat");
      if (catName === "Lehenga") return name.includes("lehenga") || name.includes("ethnic");
      if (catName === "Fashion") return true;
      if (catName === "Night Care") return name.includes("night") || name.includes("sleep");
      if (catName === "Baby") return name.includes("kid") || name.includes("boy") || name.includes("girl") || name.includes("baby");
      if (catName === "Eye Care") return name.includes("glass") || name.includes("sunglasses") || name.includes("eye");
      return name.includes(catName.toLowerCase());
    }).length;
  };

  const getBrandCount = (brandName) => {
    if (!allCategoryProducts.length) return 0;
    return allCategoryProducts.filter(item => {
      const assignedBrand = BRANDS[item.id % BRANDS.length];
      return assignedBrand === brandName;
    }).length;
  };

  return (
    <div className={`orishop-filter-panel ${isOpen ? 'mobile-open' : ''}`}>
      <div className="filter-header-title">
        <h3>Categories</h3>
        <button type="button" className="filter-close-btn" onClick={onClose}>
          <X size={18} />
        </button>
      </div>

      {/* CATEGORIES CHECKLIST WITH COUNTS */}
      <div className="filter-checklist-section">
        <div className="checklist-group">
          {CATEGORY_MAP.map((cat) => {
            const count = getCategoryCount(cat.name);
            return (
              <label key={cat.name} className="checklist-label-row">
                <input 
                  type="checkbox"
                  checked={filters.categories.includes(cat.name)}
                  onChange={() => handleCategoryToggle(cat.name)}
                />
                <span className="custom-checkmark-box"></span>
                <span className="label-text">{cat.label}</span>
                <span className="label-count-pill">{count}</span>
              </label>
            );
          })}
        </div>
      </div>

      <hr className="sidebar-divider" />

      {/* PRICE RANGE FILTER */}
      <div className="filter-checklist-section">
        <h4 className="sidebar-section-title">Price Filter</h4>
        <div className="price-slider-block">
          <input 
            type="range" 
            min="10" 
            max="1500" 
            value={filters.maxPrice || 1500} 
            onChange={(e) => onFilterChange('maxPrice', Number(e.target.value))}
            className="premium-range-slider"
          />
          <div className="price-range-text">
            Price: <span>$10 — ${filters.maxPrice || 1500}</span>
          </div>
        </div>
      </div>

      <hr className="sidebar-divider" />

      {/* BRANDS CHECKLIST */}
      <div className="filter-checklist-section">
        <h4 className="sidebar-section-title">Brands</h4>
        <div className="checklist-group">
          {BRANDS.map((brand) => {
            const count = getBrandCount(brand);
            const isChecked = filters.brands ? filters.brands.includes(brand) : false;
            return (
              <label key={brand} className="checklist-label-row">
                <input 
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleBrandToggle(brand)}
                />
                <span className="custom-checkmark-box"></span>
                <span className="label-text">{brand}</span>
                <span className="label-count-pill">{count}</span>
              </label>
            );
          })}
        </div>
      </div>

      <hr className="sidebar-divider" />

      {/* COLOURS FILTER */}
      <div className="filter-checklist-section">
        <h4 className="sidebar-section-title">Colours</h4>
        <div className="colors-swatch-grid">
          {COLORS.map((color) => (
            <button
              key={color.name}
              type="button"
              className={`color-bubble-swatch ${filters.colors.includes(color.name) ? 'active' : ''}`}
              onClick={() => handleColorToggle(color.name)}
              title={color.name}
              style={{ backgroundColor: color.hex }}
            >
              {filters.colors.includes(color.name) && (
                <span className="swatch-check" style={{ color: color.name === 'White' ? '#000' : '#fff' }}>✓</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <hr className="sidebar-divider" />

      {/* SIZES GRID */}
      <div className="filter-checklist-section">
        <h4 className="sidebar-section-title">Size</h4>
        <div className="sizes-buttons-grid">
          {SIZES.map((size) => (
            <button
              key={size}
              type="button"
              className={`size-btn-pill ${filters.sizes.includes(size) ? 'active' : ''}`}
              onClick={() => handleSizeToggle(size)}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Campaign Ad Banner */}
      <div className="filter-sidebar-ad-card">
        <img src={sidebar_ad_banner} alt="Special Promo Banner" />
        <div className="sidebar-ad-overlay">
          <span className="ad-pill">20% OFF</span>
          <h3 className="ad-title">Big Sale</h3>
          <button 
            type="button" 
            className="ad-btn-shop"
            onClick={() => alert('Special promo applied to checkout!')}
          >
            Shop Now
          </button>
        </div>
      </div>

      <button 
        type="button" 
        className="sidebar-reset-btn"
        onClick={onClearFilters}
      >
        Clear All Filters
      </button>
    </div>
  );
};

export default FilterPanel;

