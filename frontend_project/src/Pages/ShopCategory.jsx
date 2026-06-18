import React, { useContext, useState, useEffect } from "react";
import '../Pages/CSS/ShopCategory.css';
import { ShopContext } from "../Context/ShopContext";
import { Item } from "../Components/Item/Item";
import FilterPanel from "../Components/Filters/FilterPanel";
import { enrichProductsList } from "../Utils/helpers";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal } from "lucide-react";
import { Link } from "react-router-dom";

const ShopCategory = (props) => {
  const { all_product } = useContext(ShopContext);

  // Define initial state for filters
  const [filters, setFilters] = useState({
    categories: [],
    brands: [],
    sizes: [],
    colors: [],
    maxPrice: 1500,
    inStockOnly: false
  });

  const [sortOption, setSortOption] = useState("default");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Reset filters when changing category route
  useEffect(() => {
    setFilters({
      categories: [],
      brands: [],
      sizes: [],
      colors: [],
      maxPrice: 1500,
      inStockOnly: false
    });
    setSortOption("default");
    setShowMobileFilters(false);
    setCurrentPage(1);
  }, [props.category]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortOption]);

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      categories: [],
      brands: [],
      sizes: [],
      colors: [],
      maxPrice: 1500,
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
    // Subcategory Filter
    if (filters.categories.length > 0) {
      const matchesSubcategory = filters.categories.some(cat => {
        const name = item.name.toLowerCase();
        if (cat === "Tshirt") return name.includes("t-shirt") || name.includes("top") || name.includes("shirt");
        if (cat === "Accessories") return name.includes("accessories") || name.includes("bag");
        if (cat === "Bag") return name.includes("bag") || name.includes("pack");
        if (cat === "Cap") return name.includes("cap") || name.includes("hat");
        if (cat === "Dress") return name.includes("dress") || name.includes("jacket") || name.includes("coat");
        if (cat === "Lehenga") return name.includes("lehenga") || name.includes("ethnic");
        if (cat === "Fashion") return true;
        if (cat === "Night Care") return name.includes("night") || name.includes("sleep");
        if (cat === "Baby") return name.includes("kid") || name.includes("boy") || name.includes("girl") || name.includes("baby");
        if (cat === "Eye Care") return name.includes("glass") || name.includes("sunglasses") || name.includes("eye");
        return name.includes(cat.toLowerCase());
      });
      if (!matchesSubcategory) return false;
    }

    // Brands Filter
    if (filters.brands && filters.brands.length > 0) {
      const BRANDS = ['Nike', 'Zara', 'Denim', 'Madame', 'Armani', 'Max moll', 'Bara', 'Hanger'];
      const assignedBrand = BRANDS[item.id % BRANDS.length];
      if (!filters.brands.includes(assignedBrand)) return false;
    }

    // Sizes Filter
    if (filters.sizes.length > 0) {
      const hasSize = item.sizes.some(size => filters.sizes.includes(size));
      if (!hasSize) return false;
    }

    // Colors Filter
    if (filters.colors.length > 0) {
      const hasColor = item.colors.some(color => filters.colors.includes(color));
      if (!hasColor) return false;
    }

    // Price Filter
    if (filters.maxPrice && item.new_price > filters.maxPrice) {
      return false;
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

  // Pagination slicing
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

  const categoryLabel = props.category === 'kid' ? 'Kids' : props.category === 'men' ? 'Men' : 'Women';

  return (
    <motion.div 
      className="shop-category"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Category Banner Container with Overlay */}
      <div className="shopcategory-banner-container">
        <img 
          className='shopcategory-banner-bg' 
          src={props.banner} 
          alt={`${props.category} banner`}
        />
        <div className="shopcategory-banner-overlay">
          <h1>{categoryLabel}</h1>
          <div className="shopcategory-banner-breadcrumb">
            <Link to="/">Home</Link>
            <span className="dot-sep">•</span>
            <span className="current-cat">{categoryLabel}</span>
          </div>
        </div>
      </div>
      
      {showMobileFilters && (
        <div 
          className="mobile-filter-backdrop" 
          onClick={() => setShowMobileFilters(false)}
        />
      )}

      <div className="shopcategory-layout">
        {/* LEFT COLUMN: FILTERS PANEL */}
        <FilterPanel 
          filters={filters} 
          onFilterChange={handleFilterChange} 
          onClearFilters={handleClearFilters}
          filteredCount={filteredProducts.length}
          isOpen={showMobileFilters}
          onClose={() => setShowMobileFilters(false)}
          allCategoryProducts={categoryProducts}
        />

        {/* RIGHT COLUMN: PRODUCTS CONTAINER */}
        <div className="shopcategory-right-content">
          <div className="shopcategory-indexSort">
            <p className="shopcategory-indexText">
              Showing <span>{Math.min((currentPage - 1) * itemsPerPage + 1, filteredProducts.length)}-{Math.min(currentPage * itemsPerPage, filteredProducts.length)} </span>out of {filteredProducts.length} results
            </p>
            <div className="shopcategory-controls-row">
              <button 
                type="button"
                className="shopcategory-filter-toggle-btn"
                onClick={() => setShowMobileFilters(true)}
              >
                <SlidersHorizontal size={14} />
                <span>Filters</span>
              </button>
              <div className="shopcategory-sort">
                <span>Sort by:</span>
                <select 
                  value={sortOption} 
                  onChange={(e) => setSortOption(e.target.value)}
                >
                  <option value="default">Default sorting</option>
                  <option value="low-to-high">Price: Low to High</option>
                  <option value="high-to-low">Price: High to Low</option>
                </select>
              </div>
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
            <>
              <div className="shopcategory-products-grid">
                <AnimatePresence mode="popLayout">
                  {paginatedProducts.map((item) => (
                    <motion.div 
                      key={item.id} 
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="products-grid-item"
                    >
                      <Item {...item} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Pagination bar */}
              {totalPages > 1 && (
                <div className="shopcategory-pagination-container">
                  <button 
                    className="pag-nav-btn" 
                    disabled={currentPage === 1}
                    onClick={() => { setCurrentPage(prev => Math.max(1, prev - 1)); window.scrollTo({ top: 350, behavior: 'smooth' }); }}
                  >
                    &lt;
                  </button>
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNum = index + 1;
                    return (
                      <button 
                        key={pageNum}
                        className={`pag-num-btn ${currentPage === pageNum ? 'active' : ''}`}
                        onClick={() => { setCurrentPage(pageNum); window.scrollTo({ top: 350, behavior: 'smooth' }); }}
                      >
                        {pageNum < 10 ? `0${pageNum}` : pageNum}
                      </button>
                    );
                  })}
                  <button 
                    className="pag-nav-btn" 
                    disabled={currentPage === totalPages}
                    onClick={() => { setCurrentPage(prev => Math.min(totalPages, prev + 1)); window.scrollTo({ top: 350, behavior: 'smooth' }); }}
                  >
                    &gt;
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ShopCategory;