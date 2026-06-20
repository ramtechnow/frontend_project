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
import { Loader2 } from "lucide-react";
import "../Styles/productGrid.css";

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

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-bg-primary text-text-primary">
        <Loader2 size={36} className="animate-spin text-accent-pink mb-4" />
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Preparing collection catalogs...</span>
      </div>
    );
  }

  return (
    <main className="container" id="main-content" style={{ paddingBottom: "var(--space-12)", color: 'var(--text-primary)' }}>
      {/* 1. Hero Promo Banner */}
      <PromoBanner />

      {/* 2. Top Categories Grid */}
      <section aria-labelledby="cat-heading" style={{ margin: "var(--space-10) 0" }}>
        <div style={{ textAlign: "center", marginBottom: "var(--space-6)" }}>
          <span style={{ color: "var(--accent-pink)", fontSize: "var(--text-xs)", fontWeight: "700", letterSpacing: "1px" }}>
            COLLECTIONS
          </span>
          <h2 id="cat-heading" style={{ fontSize: "var(--text-2xl)", fontWeight: "800", marginTop: "4px" }}>
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
      <section aria-labelledby="new-heading" style={{ margin: "var(--space-10) 0" }}>
        <div style={{ textAlign: "center", marginBottom: "var(--space-6)" }}>
          <span style={{ color: "var(--accent-pink)", fontSize: "var(--text-xs)", fontWeight: "700", letterSpacing: "1px" }}>
            NEW ARRIVALS
          </span>
          <h2 id="new-heading" style={{ fontSize: "var(--text-2xl)", fontWeight: "800", marginTop: "4px" }}>
            Latest Collections
          </h2>
        </div>
        <div className="product-grid">
          {newCollections.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </section>

      {/* 4. Process Value Propositions */}
      <ProcessSteps />

      {/* 5. Popular In Women Grid */}
      <section aria-labelledby="popular-heading" style={{ margin: "var(--space-10) 0" }}>
        <div style={{ textAlign: "center", marginBottom: "var(--space-6)" }}>
          <span style={{ color: "var(--accent-pink)", fontSize: "var(--text-xs)", fontWeight: "700", letterSpacing: "1px" }}>
            TRENDING
          </span>
          <h2 id="popular-heading" style={{ fontSize: "var(--text-2xl)", fontWeight: "800", marginTop: "4px" }}>
            Popular In Women
          </h2>
        </div>
        <div className="product-grid">
          {popularInWomen.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </section>

      {/* 6. Testimonials */}
      <Testimonials />

      {/* 7. Newsletter Signup */}
      <Newsletter />
    </main>
  );
};

export default Home;
