import React, { useContext, useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import products from "../data/products";
import { ShopContext } from "../Context/ShopContext";
import { SlidersHorizontal, ArrowUpDown } from "lucide-react";
import "../styles/productGrid.css";

const Shop = ({ category = "all" }) => {
  const { all_product } = useContext(ShopContext) || { all_product: [] };
  const productsList = all_product.length > 0 ? all_product : products;
  const navigate = useNavigate();

  // States
  const [selectedCategory, setSelectedCategory] = useState(category);
  const [sortOption, setSortOption] = useState("default");
  const [priceRange, setPriceRange] = useState(200); // Max price slider limit

  // Sync selectedCategory state with category prop changes
  useEffect(() => {
    setSelectedCategory(category);
  }, [category]);

  // Handle dropdown change by navigating to category route
  const handleCategoryChange = (newCat) => {
    setSelectedCategory(newCat);
    if (newCat === "all") {
      navigate("/catalog");
    } else if (newCat === "men") {
      navigate("/mens");
    } else if (newCat === "women") {
      navigate("/womens");
    } else if (newCat === "kid") {
      navigate("/kids");
    }
  };

  // Filtered & Sorted items calculation
  const processedProducts = useMemo(() => {
    let result = [...productsList];

    // Filter by Category
    if (selectedCategory !== "all") {
      result = result.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Filter by Price
    result = result.filter(p => p.new_price <= priceRange);

    // Sorting
    if (sortOption === "price-low") {
      result.sort((a, b) => a.new_price - b.new_price);
    } else if (sortOption === "price-high") {
      result.sort((a, b) => b.new_price - a.new_price);
    } else if (sortOption === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [productsList, selectedCategory, sortOption, priceRange]);

  return (
    <main className="container" style={{ padding: "var(--space-6) var(--space-4) var(--space-12) var(--space-4)" }}>
      {/* Page Title */}
      <div style={{ marginBottom: "var(--space-6)" }}>
        <h1 style={{ fontSize: "var(--text-3xl)", fontWeight: "800" }}>
          {selectedCategory === "all" ? "All Apparel Catalog" : 
           selectedCategory === "men" ? "Men's Apparel" : 
           selectedCategory === "women" ? "Women's Apparel" : 
           selectedCategory === "kid" ? "Kids Collection" : "Apparel Catalog"}
        </h1>
        <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
          Browse our organic cotton and premium linen collections with custom filters.
        </p>
      </div>

      {/* Filter Options Row */}
      <div 
        style={{ 
          display: "flex", 
          flexWrap: "wrap", 
          gap: "var(--space-4)", 
          backgroundColor: "var(--bg-secondary)", 
          border: "1px solid var(--border-color)", 
          borderRadius: "var(--border-radius-md)", 
          padding: "var(--space-4)",
          alignItems: "center",
          marginBottom: "var(--space-6)"
        }}
      >
        {/* Category select */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <SlidersHorizontal size={16} style={{ color: "var(--accent-pink)" }} />
          <span style={{ fontSize: "var(--text-xs)", fontWeight: "700" }}>Category:</span>
          <select 
            value={selectedCategory} 
            onChange={(e) => handleCategoryChange(e.target.value)}
            style={{ height: "36px", padding: "0 8px", outline: "none", cursor: "pointer" }}
          >
            <option value="all">All Items</option>
            <option value="men">Men</option>
            <option value="women">Women</option>
            <option value="kid">Kids</option>
          </select>
        </div>

        {/* Sort select */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <ArrowUpDown size={16} style={{ color: "var(--accent-pink)" }} />
          <span style={{ fontSize: "var(--text-xs)", fontWeight: "700" }}>Sort:</span>
          <select 
            value={sortOption} 
            onChange={(e) => setSortOption(e.target.value)}
            style={{ height: "36px", padding: "0 8px", outline: "none", cursor: "pointer" }}
          >
            <option value="default">Best Match</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>

        {/* Price slider */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexGrow: 1, minWidth: "200px" }}>
          <span style={{ fontSize: "var(--text-xs)", fontWeight: "700" }}>Max Price: ${priceRange}</span>
          <input 
            type="range" 
            min="10" 
            max="200" 
            value={priceRange} 
            onChange={(e) => setPriceRange(Number(e.target.value))}
            style={{ 
              flexGrow: 1, 
              cursor: "pointer", 
              accentColor: "var(--accent-pink)",
              height: "6px",
              borderRadius: "3px",
              background: "var(--border-color)"
            }}
          />
        </div>
      </div>

      {/* Catalog Display */}
      {processedProducts.length === 0 ? (
        <div style={{ textAlign: "center", padding: "var(--space-12) 0", border: "1px dashed var(--border-color)", borderRadius: "var(--border-radius-md)" }}>
          <p style={{ fontSize: "var(--text-md)", color: "var(--text-secondary)" }}>No items match your selected filters.</p>
          <button 
            style={{ color: "var(--accent-pink)", fontWeight: "700", marginTop: "8px", borderBottom: "1px solid var(--accent-pink)", minHeight: "auto" }}
            onClick={() => { setSelectedCategory("all"); setSortOption("default"); setPriceRange(200); }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div>
          <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", fontWeight: "600" }}>
            Showing {processedProducts.length} Products
          </span>
          <div className="product-grid">
            {processedProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </div>
      )}
    </main>
  );
};

export default Shop;
