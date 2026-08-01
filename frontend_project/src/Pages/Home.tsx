import React, { useEffect, useState } from "react";
import PromoBanner from "../Components/PromoBanner";
import CategoryCard from "../Components/CategoryCard";
import ProductCard from "../Components/ProductCard";
import ProcessSteps from "../Components/ProcessSteps";
import Testimonials from "../Components/Testimonials";
import Newsletter from "../Components/Newsletter";
import categories from "../data/categories";
import { fetchProducts } from "../features/catalog/services/productService";
import { Product } from "../features/catalog/types/productTypes";
import "../Styles/productGrid.css";

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="product-card-skeleton" style={{ background: "rgba(255, 255, 255, 0.4)", backdropFilter: "blur(8px)", borderRadius: "17px", border: "1px solid var(--border-color)", overflow: "hidden" }}>
      <div className="shimmer-line" style={{ width: "100%", aspectRatio: "4/5", background: "rgba(120, 120, 120, 0.12)" }} />
      <div style={{ padding: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
        <div className="shimmer-line tag-shimmer" style={{ width: "40%", height: "9px", background: "rgba(120, 120, 120, 0.1)" }} />
        <div className="shimmer-line title-shimmer-1" style={{ width: "85%", height: "11px", background: "rgba(120, 120, 120, 0.08)" }} />
        <div className="shimmer-line title-shimmer-2" style={{ width: "55%", height: "11px", background: "rgba(120, 120, 120, 0.08)" }} />
      </div>
    </div>
  );
};

export const Home: React.FC = () => {
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts();
        setProductsList(data);
      } catch (err) {
        console.error("Failed to load products for home page:", err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  // Curate special selections
  const newCollections = productsList.slice(0, 4);
  const popularInWomen = productsList.filter(p => p.category === "women").slice(0, 4);

  return (
    <>
      {/* 1. Hero Promo Banner */}
      <PromoBanner />

      <main className="container home-main-container" id="main-content" style={{ marginTop: "24px" }}>
        {/* 2. Top Categories Grid */}
        <section aria-labelledby="cat-heading" className="home-section" style={{ marginTop: 0 }}>
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <span style={{ color: "var(--accent-pink)", fontSize: "11px", fontWeight: "800", letterSpacing: "2px", textTransform: "uppercase" }}>
              Collections
            </span>
            <h2 id="cat-heading" style={{ fontSize: "20px", fontWeight: "800", marginTop: "6px", letterSpacing: "-0.3px", color: "var(--text-primary)" }}>
              Shop By Category
            </h2>
          </div>
          <div className="category-grid">
            {categories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        </section>

        {/* 3. New Collections Grid */}
        <section aria-labelledby="new-heading" className="home-section">
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <span style={{ color: "var(--accent-pink)", fontSize: "11px", fontWeight: "800", letterSpacing: "2px", textTransform: "uppercase" }}>
              New Arrivals
            </span>
            <h2 id="new-heading" style={{ fontSize: "20px", fontWeight: "800", marginTop: "6px", letterSpacing: "-0.3px", color: "var(--text-primary)" }}>
              Latest Collections
            </h2>
          </div>
          <div className="product-grid">
            {loading
              ? [1, 2, 3, 4].map((id) => <ProductCardSkeleton key={id} />)
              : newCollections.map((prod) => (
                  <ProductCard key={prod.id} product={prod} />
                ))}
          </div>
        </section>

        {/* 4. Process Value Propositions */}
        <ProcessSteps />

        {/* 5. Popular In Women Grid */}
        <section aria-labelledby="popular-heading" className="home-section">
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <span style={{ color: "var(--accent-pink)", fontSize: "11px", fontWeight: "800", letterSpacing: "2px", textTransform: "uppercase" }}>
              Trending
            </span>
            <h2 id="popular-heading" style={{ fontSize: "20px", fontWeight: "800", marginTop: "6px", letterSpacing: "-0.3px", color: "var(--text-primary)" }}>
              Popular In Women
            </h2>
          </div>
          <div className="product-grid">
            {loading
              ? [1, 2, 3, 4].map((id) => <ProductCardSkeleton key={id} />)
              : popularInWomen.map((prod) => (
                  <ProductCard key={prod.id} product={prod} />
                ))}
          </div>
        </section>

        {/* 6. Testimonials */}
        <Testimonials />

        {/* 7. Newsletter Signup */}
        <Newsletter />
      </main>
    </>
  );
};

export default Home;
