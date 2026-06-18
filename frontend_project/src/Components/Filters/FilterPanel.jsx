import React from 'react';
import './FilterPanel.css';
import { X } from 'lucide-react';

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const COLORS = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#ffffff', border: true },
  { name: 'Red', hex: '#ef4444' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Green', hex: '#10b981' },
  { name: 'Pink', hex: '#ec4899' },
  { name: 'Grey', hex: '#6b7280' },
  { name: 'Orange', hex: '#f97316' },
  { name: 'Yellow', hex: '#eab308' }
];
const GENDERS = ['Men', 'Women', 'Kids'];
const CATEGORIES = ['Blouse', 'Jacket', 'Sweatshirt'];

export const FilterPanel = ({ 
  filters, 
  onFilterChange, 
  onClearFilters, 
  filteredCount,
  isOpen,
  onClose
}) => {

  const handleGenderToggle = (gender) => {
    const updated = filters.genders.includes(gender)
      ? filters.genders.filter(g => g !== gender)
      : [...filters.genders, gender];
    onFilterChange('genders', updated);
  };

  const handleCategoryToggle = (category) => {
    const updated = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    onFilterChange('categories', updated);
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

  const handleInStockToggle = () => {
    onFilterChange('inStockOnly', !filters.inStockOnly);
  };

  return (
    <div className={`filter-panel ${isOpen ? 'mobile-open' : ''}`}>
      <div className="filter-header">
        <h3>Filters</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="product-count-badge">{filteredCount} Products</span>
          <button type="button" className="filter-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
      </div>

      <hr className="filter-divider" />

      {/* GENDER FILTER */}
      <div className="filter-section">
        <h4>Gender</h4>
        <div className="checkbox-group">
          {GENDERS.map((gender) => (
            <label key={gender} className="checkbox-label">
              <input 
                type="checkbox"
                checked={filters.genders.includes(gender)}
                onChange={() => handleGenderToggle(gender)}
              />
              <span className="custom-checkbox"></span>
              {gender}
            </label>
          ))}
        </div>
      </div>

      <hr className="filter-divider" />

      {/* CATEGORIES FILTER */}
      <div className="filter-section">
        <h4>Category</h4>
        <div className="checkbox-group">
          {CATEGORIES.map((category) => (
            <label key={category} className="checkbox-label">
              <input 
                type="checkbox"
                checked={filters.categories.includes(category)}
                onChange={() => handleCategoryToggle(category)}
              />
              <span className="custom-checkbox"></span>
              {category}
            </label>
          ))}
        </div>
      </div>

      <hr className="filter-divider" />

      {/* SIZE FILTER */}
      <div className="filter-section">
        <h4>Size</h4>
        <div className="size-selector-grid">
          {SIZES.map((size) => (
            <button
              key={size}
              type="button"
              className={`filter-size-btn ${filters.sizes.includes(size) ? 'active' : ''}`}
              onClick={() => handleSizeToggle(size)}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <hr className="filter-divider" />

      {/* COLOR FILTER */}
      <div className="filter-section">
        <h4>Colors</h4>
        <div className="color-palette-grid">
          {COLORS.map((color) => (
            <button
              key={color.name}
              type="button"
              className={`filter-color-btn ${filters.colors.includes(color.name) ? 'active' : ''}`}
              onClick={() => handleColorToggle(color.name)}
              title={color.name}
              style={{ backgroundColor: color.hex }}
            >
              {filters.colors.includes(color.name) && (
                <span className="color-check-icon" style={{ color: color.name === 'White' ? '#000' : '#fff' }}>✓</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <hr className="filter-divider" />

      {/* AVAILABILITY FILTER */}
      <div className="filter-section">
        <h4>Availability</h4>
        <label className="checkbox-label">
          <input 
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={handleInStockToggle}
          />
          <span className="custom-checkbox"></span>
          In Stock Only
        </label>
      </div>

      <button 
        type="button" 
        className="clear-filters-btn"
        onClick={onClearFilters}
      >
        Clear All Filters
      </button>
    </div>
  );
};

export default FilterPanel;
