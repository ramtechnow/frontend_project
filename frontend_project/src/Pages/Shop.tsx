import React, { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "../Components/ProductCard";
import { fetchProducts } from "../features/catalog/services/productService";
import { Product } from "../features/catalog/types/productTypes";
import { ArrowUpDown, Search, X, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import "../Styles/productGrid.css";

interface ShopProps {
  category?: string;
}

const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const AVAILABLE_COLORS = ['Black', 'White', 'Navy', 'Beige', 'Charcoal', 'Red', 'Blue', 'Green', 'Pink'];
const ITEMS_PER_PAGE = 8;

export const Shop: React.FC<ShopProps> = ({ category = "all" }) => {
  const navigate = useNavigate();
  const suggestionRef = useRef<HTMLDivElement>(null);

  // Database products state
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter and Search States
  const [selectedCategory, setSelectedCategory] = useState(category);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState("default");
  
  // Price range states
  const [priceRange, setPriceRange] = useState(3000);
  const [maxProductPrice, setMaxProductPrice] = useState(5000);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Sync category prop with state
  useEffect(() => {
    setSelectedCategory(category);
    setCurrentPage(1); // reset to page 1 on category change
  }, [category]);

  // Load products from Firestore
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const data = await fetchProducts();
        setProductsList(data);

        // Compute maximum price dynamically from database items
        if (data.length > 0) {
          const prices = data.map(p => p.newPrice);
          const highest = Math.max(...prices, 1000);
          setMaxProductPrice(highest);
          setPriceRange(highest); // default slider to max
        }
      } catch (err) {
        console.error("Failed to fetch shop products:", err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  // Debounce search query to avoid stuttering on filter updates
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Click outside to close suggestion dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle category navigation/clicks
  const handleCategoryChange = (newCat: string) => {
    setSelectedCategory(newCat);
    setCurrentPage(1);
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

  // Toggle size chips
  const handleSizeToggle = (size: string) => {
    setCurrentPage(1);
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  // Toggle color chips
  const handleColorToggle = (color: string) => {
    setCurrentPage(1);
    setSelectedColors(prev => 
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };

  // Autocomplete Suggestions List
  const autocompleteSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return productsList
      .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .map(p => p.name)
      .slice(0, 5); // limit to top 5 suggestions
  }, [searchQuery, productsList]);

  // Reset all filters helper
  const handleResetFilters = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setSelectedCategory("all");
    setSelectedSizes([]);
    setSelectedColors([]);
    setPriceRange(maxProductPrice);
    setSortOption("default");
    setCurrentPage(1);
    navigate("/catalog");
  };

  // Filtered & Sorted items calculation
  const processedProducts = useMemo(() => {
    let result = [...productsList];

    // Filter by Category
    if (selectedCategory !== "all") {
      result = result.filter(p => p.category?.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Filter by Search Query
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.description?.toLowerCase().includes(q)
      );
    }

    // Filter by Sizes
    if (selectedSizes.length > 0) {
      result = result.filter(p => 
        p.sizes && p.sizes.some(size => selectedSizes.includes(size))
      );
    }

    // Filter by Colors
    if (selectedColors.length > 0) {
      result = result.filter(p => 
        p.colors && p.colors.some(color => selectedColors.includes(color))
      );
    }

    // Filter by Price Range
    result = result.filter(p => p.newPrice <= priceRange);

    // Sorting Options
    if (sortOption === "price-low") {
      result.sort((a, b) => a.newPrice - b.newPrice);
    } else if (sortOption === "price-high") {
      result.sort((a, b) => b.newPrice - a.newPrice);
    } else if (sortOption === "rating") {
      result.sort((a, b) => ((b as any).rating || 4) - ((a as any).rating || 4));
    } else if (sortOption === "newest") {
      result.sort((a, b) => {
        const timeA = a.createdAt?.seconds || new Date(a.createdAt).getTime() || 0;
        const timeB = b.createdAt?.seconds || new Date(b.createdAt).getTime() || 0;
        return timeB - timeA;
      });
    }

    return result;
  }, [productsList, selectedCategory, debouncedSearch, selectedSizes, selectedColors, priceRange, sortOption]);

  // Client-Side Pagination calculations
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return processedProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [processedProducts, currentPage]);

  const totalPages = Math.ceil(processedProducts.length / ITEMS_PER_PAGE) || 1;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-bg-primary text-text-primary">
        <Loader2 size={36} className="animate-spin text-accent-pink mb-4" />
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Fetching premium collections...</span>
      </div>
    );
  }

  return (
    <main className="container" style={{ padding: "var(--space-8) var(--space-4) var(--space-12) var(--space-4)", color: 'var(--text-primary)' }}>
      {/* Page Title & Heading */}
      <div style={{ marginBottom: "var(--space-8)" }}>
        <h1 style={{ fontSize: "var(--text-3xl)", fontWeight: "900", letterSpacing: "-0.5px" }}>
          {selectedCategory === "all" ? "Apparel Showcase" : 
           selectedCategory === "men" ? "Men's Collection" : 
           selectedCategory === "women" ? "Women's Collection" : 
           selectedCategory === "kid" ? "Kids Apparel" : "Store Catalog"}
        </h1>
        <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", marginTop: "4px" }}>
          Explore our range of dynamic designs, tailored fits, and organic materials.
        </p>
      </div>

      {/* FILTER PANEL SECTION */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "32px" }}>
        
        {/* Row 1: Search & Autocomplete suggestions, category tabs */}
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
          {/* Autocomplete Search input */}
          <div style={{ position: "relative", flexGrow: 1, minWidth: "280px" }} ref={suggestionRef}>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <Search size={18} style={{ position: "absolute", left: "14px", color: "var(--text-muted)" }} />
              <input 
                type="text" 
                placeholder="Search premium apparel..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                style={{
                  width: "100%",
                  height: "44px",
                  paddingLeft: "42px",
                  paddingRight: searchQuery ? "40px" : "16px",
                  borderRadius: "12px",
                  border: "1px solid var(--border-color)",
                  backgroundColor: "var(--bg-secondary)",
                  color: "var(--text-primary)",
                  outline: "none",
                  fontSize: "0.85rem"
                }}
              />
              {searchQuery && (
                <button 
                  onClick={() => { setSearchQuery(""); setDebouncedSearch(""); }}
                  style={{ position: "absolute", right: "12px", border: "none", background: "none", cursor: "pointer", color: "var(--text-muted)" }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Suggestions drop card */}
            {showSuggestions && autocompleteSuggestions.length > 0 && (
              <div style={{
                position: "absolute",
                top: "48px",
                left: 0,
                right: 0,
                backgroundColor: "var(--bg-secondary)",
                border: "1px solid var(--border-color)",
                borderRadius: "12px",
                boxShadow: "var(--shadow-lg)",
                zIndex: 40,
                overflow: "hidden"
              }}>
                {autocompleteSuggestions.map((sug, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setSearchQuery(sug); setShowSuggestions(false); }}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      textAlign: "left",
                      backgroundColor: "transparent",
                      border: "none",
                      borderBottom: idx !== autocompleteSuggestions.length - 1 ? "1px solid var(--border-color)" : "none",
                      fontSize: "0.8rem",
                      color: "var(--text-primary)",
                      cursor: "pointer"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--bg-primary)"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    {sug}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Category Toggle Tabs */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {["all", "men", "women", "kid"].map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                style={{
                  height: "44px",
                  padding: "0 20px",
                  borderRadius: "12px",
                  border: "1px solid",
                  borderColor: selectedCategory === cat ? "var(--accent-pink)" : "var(--border-color)",
                  backgroundColor: selectedCategory === cat ? "var(--accent-light)" : "var(--bg-secondary)",
                  color: selectedCategory === cat ? "var(--accent-pink)" : "var(--text-primary)",
                  fontWeight: "700",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  textTransform: "capitalize",
                  transition: "all 0.2s"
                }}
              >
                {cat === "all" ? "All Items" : cat === "kid" ? "Kids" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: Faceted options (Sizes, Colors, Price Range, Sorting) */}
        <div style={{
          backgroundColor: "var(--bg-secondary)",
          border: "1px solid var(--border-color)",
          borderRadius: "16px",
          padding: "24px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "24px",
          boxShadow: "var(--shadow-sm)"
        }}>
          {/* Sizes filter chips */}
          <div>
            <span style={{ fontSize: "0.75rem", fontWeight: "800", textTransform: "uppercase", color: "var(--text-muted)", display: "block", marginBottom: "12px" }}>Sizes Available</span>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {AVAILABLE_SIZES.map((sz) => {
                const isActive = selectedSizes.includes(sz);
                return (
                  <button
                    key={sz}
                    onClick={() => handleSizeToggle(sz)}
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "8px",
                      border: "1px solid",
                      borderColor: isActive ? "var(--accent-pink)" : "var(--border-color)",
                      backgroundColor: isActive ? "var(--accent-pink)" : "var(--bg-primary)",
                      color: isActive ? "white" : "var(--text-primary)",
                      fontSize: "0.75rem",
                      fontWeight: "700",
                      cursor: "pointer",
                      transition: "all 0.15s"
                    }}
                  >
                    {sz}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Colors filter circles */}
          <div>
            <span style={{ fontSize: "0.75rem", fontWeight: "800", textTransform: "uppercase", color: "var(--text-muted)", display: "block", marginBottom: "12px" }}>Color Palette</span>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {AVAILABLE_COLORS.map((col) => {
                const isActive = selectedColors.includes(col);
                return (
                  <button
                    key={col}
                    onClick={() => handleColorToggle(col)}
                    title={col}
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      backgroundColor: col.toLowerCase(),
                      border: isActive ? "2.5px solid var(--accent-pink)" : "1.5px solid var(--border-color)",
                      boxShadow: isActive ? "0 0 0 1px var(--accent-pink)" : "none",
                      cursor: "pointer",
                      transition: "transform 0.1s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
                    onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1.0)"}
                  />
                );
              })}
            </div>
          </div>

          {/* Price Range Slider */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", fontWeight: "800", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "12px" }}>
              <span>Max Budget</span>
              <span style={{ color: "var(--accent-pink)" }}>₹{priceRange}</span>
            </div>
            <input 
              type="range" 
              min="0"
              max={maxProductPrice}
              value={priceRange} 
              onChange={(e) => { setPriceRange(Number(e.target.value)); setCurrentPage(1); }}
              style={{
                width: "100%",
                height: "6px",
                borderRadius: "3px",
                accentColor: "var(--accent-pink)",
                background: "var(--bg-primary)",
                cursor: "pointer"
              }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "var(--text-muted)", marginTop: "6px" }}>
              <span>₹0</span>
              <span>₹{maxProductPrice}</span>
            </div>
          </div>

          {/* Sorting controls */}
          <div>
            <span style={{ fontSize: "0.75rem", fontWeight: "800", textTransform: "uppercase", color: "var(--text-muted)", display: "block", marginBottom: "12px" }}>Order By</span>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <ArrowUpDown size={14} style={{ position: "absolute", left: "12px", color: "var(--text-muted)" }} />
              <select
                value={sortOption}
                onChange={(e) => { setSortOption(e.target.value); setCurrentPage(1); }}
                style={{
                  width: "100%",
                  height: "38px",
                  paddingLeft: "34px",
                  borderRadius: "10px",
                  border: "1px solid var(--border-color)",
                  backgroundColor: "var(--bg-primary)",
                  color: "var(--text-primary)",
                  fontSize: "0.8rem",
                  fontWeight: "600",
                  outline: "none",
                  cursor: "pointer"
                }}
              >
                <option value="default">Relevance</option>
                <option value="newest">New Arrivals</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Customer Rated</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* CATALOG DISPLAY */}
      {processedProducts.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0", border: "1px dashed var(--border-color)", borderRadius: "16px", backgroundColor: "var(--bg-secondary)" }}>
          <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", fontWeight: "600" }}>No matching apparel items found in the inventory.</p>
          <button 
            style={{ 
              color: "var(--accent-pink)", 
              fontWeight: "800", 
              marginTop: "12px", 
              background: "none", 
              border: "none", 
              borderBottom: "1.5px solid var(--accent-pink)", 
              cursor: "pointer", 
              fontSize: "0.85rem",
              padding: "2px 0"
            }}
            onClick={handleResetFilters}
          >
            Clear All Active Filters
          </button>
        </div>
      ) : (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "20px" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "700" }}>
              Showing {processedProducts.length} Premium Options
            </span>
            {(selectedSizes.length > 0 || selectedColors.length > 0 || searchQuery.trim() || priceRange < maxProductPrice) && (
              <button 
                onClick={handleResetFilters}
                style={{ background: "none", border: "none", color: "var(--accent-pink)", fontWeight: "700", fontSize: "0.75rem", cursor: "pointer" }}
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* Product cards grid */}
          <div className="product-grid" style={{ marginBottom: "40px" }}>
            {paginatedProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>

          {/* Pagination Buttons UI */}
          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", marginTop: "24px" }}>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                style={{
                  width: "38px", height: "38px",
                  borderRadius: "10px",
                  border: "1px solid var(--border-color)",
                  backgroundColor: "var(--bg-secondary)",
                  color: "var(--text-primary)",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  opacity: currentPage === 1 ? 0.5 : 1,
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                const isActive = currentPage === pageNum;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    style={{
                      width: "38px", height: "38px",
                      borderRadius: "10px",
                      border: "1px solid",
                      borderColor: isActive ? "var(--accent-pink)" : "var(--border-color)",
                      backgroundColor: isActive ? "var(--accent-pink)" : "var(--bg-secondary)",
                      color: isActive ? "white" : "var(--text-primary)",
                      fontWeight: "700",
                      fontSize: "0.8rem",
                      cursor: "pointer"
                    }}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                style={{
                  width: "38px", height: "38px",
                  borderRadius: "10px",
                  border: "1px solid var(--border-color)",
                  backgroundColor: "var(--bg-secondary)",
                  color: "var(--text-primary)",
                  cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                  opacity: currentPage === totalPages ? 0.5 : 1,
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </main>
  );
};

export default Shop;
