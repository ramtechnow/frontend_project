import React, { useContext, useState, useEffect } from "react";
import '../Pages/CSS/ShopCategory.css';
import { ShopContext } from "../Context/ShopContext";
import dropdown_icon from '../Components/Assets/dropdown_icon.png';
import { Item } from "../Components/Item/Item";
import FilterPanel from "../Components/Filters/FilterPanel";
import { enrichProductsList } from "../Utils/helpers";
import { motion } from "framer-motion";

const ShopCategory = (props) => {
  const { all_product } = useContext(ShopContext);

  // Define initial state for filters
  const [filters, setFilters] = useState({
    genders: [],
    categories: [],
    sizes: [],
    colors: [],
    inStockOnly: false
  });

  const [sortOption, setSortOption] = useState("default");

  // Reset filters when changing main navigation category (e.g., Men to Women)
  useEffect(() => {
    setFilters({
      genders: [],
      categories: [],
      sizes: [],
      colors: [],
      inStockOnly: false
    });
    setSortOption("default");
  }, [props.category]);

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      genders: [],
      categories: [],
      sizes: [],
      colors: [],
      inStockOnly: false
    });
  };

  // 1. Enrich original raw products list with filterable details
  const enrichedProducts = enrichProductsList(all_product);

  // 2. Filter products based on Route Category (men, women, kid)
  const categoryProducts = enrichedProducts.filter(
    (item) => props.category === item.category
  );

  // 3. Apply secondary real-time sub-filters
  const filteredProducts = categoryProducts.filter((item) => {
    // Gender Filter
    if (filters.genders.length > 0 && !filters.genders.includes(item.gender)) {
      return false;
    }

    // Subcategory Filter (match title containing e.g. "Blouse", "Jacket", "Sweatshirt")
    if (filters.categories.length > 0) {
      const matchesSubcategory = filters.categories.some(cat => 
        item.name.toLowerCase().includes(cat.toLowerCase())
      );
      if (!matchesSubcategory) return false;
    }

    // Sizes Filter (check intersection of arrays)
    if (filters.sizes.length > 0) {
      const hasSize = item.sizes.some(size => filters.sizes.includes(size));
      if (!hasSize) return false;
    }

    // Colors Filter (check intersection of arrays)
    if (filters.colors.length > 0) {
      const hasColor = item.colors.some(color => filters.colors.includes(color));
      if (!hasColor) return false;
    }

    // In Stock Only Filter
    if (filters.inStockOnly && !item.inStock) {
      return false;
    }

    return true;
  });

  // Apply sorting utility
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOption === "low-to-high") {
      return a.new_price - b.new_price;
    } else if (sortOption === "high-to-low") {
      return b.new_price - a.new_price;
    }
    return 0;
  });

  return (
    <motion.div 
      className="shop-category"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.img 
        className='shopcategory-banner' 
        src={props.banner} 
        alt={`${props.category} banner`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      />
      
      <div className="shopcategory-layout">
        {/* LEFT COLUMN: FILTERS PANEL */}
        <FilterPanel 
          filters={filters} 
          onFilterChange={handleFilterChange} 
          onClearFilters={handleClearFilters}
          filteredCount={filteredProducts.length}
        />

        {/* RIGHT COLUMN: PRODUCTS CONTAINER */}
        <div className="shopcategory-right-content">
          <div className="shopcategory-indexSort flex items-center justify-between">
            <p>
              Showing <span>1-{Math.min(12, filteredProducts.length)} </span>out of {filteredProducts.length} products
            </p>
            <div className="shopcategory-sort flex items-center gap-2 border border-slate-200 dark:border-slate-800 rounded-full px-4 py-1.5 bg-white dark:bg-slate-900 shadow-sm transition-all hover:border-amber-500/30">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Sort by:</span>
              <select 
                value={sortOption} 
                onChange={(e) => setSortOption(e.target.value)}
                className="border-none bg-transparent text-slate-700 dark:text-slate-200 font-extrabold text-xs outline-none cursor-pointer focus:ring-0"
              >
                <option value="default">Featured</option>
                <option value="low-to-high">Price: Low to High</option>
                <option value="high-to-low">Price: High to Low</option>
              </select>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <motion.div 
              className="no-products-found"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <h3>No Products Match Your Filters</h3>
              <p>Try loosening your search filters or click "Clear All Filters" to start over.</p>
              <button className="clear-filter-reset-btn" onClick={handleClearFilters}>
                Reset All Filters
              </button>
            </motion.div>
          ) : (
            <div className="shopcategory-products">
              {sortedProducts.map((item, i) => (
                <Item 
                  key={i} 
                  {...item} 
                />
              ))}
            </div>
          )}

          {filteredProducts.length > 12 && (
            <div className="shopcategory-loadmore">
              Explore More
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ShopCategory;