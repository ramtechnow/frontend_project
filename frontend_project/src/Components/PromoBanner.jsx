import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldAlert, ChevronLeft, ChevronRight } from "lucide-react";
import { BACKEND_URL } from "../config";
import "../Styles/theme.css";
import "../Styles/promobanner.css";

const PromoBanner = ({ page = "home" }) => {
  const [banners, setBanners]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [current, setCurrent]     = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    const fetchActiveBanners = async () => {
      try {
        const res  = await fetch(`${BACKEND_URL}/banners/active?page=${page}`);
        if (res.ok) {
          const data = await res.json();
          setBanners(data);
        }
      } catch (err) {
        console.warn("Failed to fetch active promotional banners:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchActiveBanners();
  }, [page]);

  const goTo = useCallback((idx) => {
    if (transitioning) return;
    setTransitioning(true);
    setTimeout(() => {
      setCurrent(idx);
      setTransitioning(false);
    }, 400);
  }, [transitioning]);

  const next = useCallback(() => {
    goTo((current + 1) % banners.length);
  }, [current, banners.length, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + banners.length) % banners.length);
  }, [current, banners.length, goTo]);

  // Auto-advance every 5 s
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [banners.length, next]);

  if (loading) return null;

  /* ── STATIC FALLBACK ─────────────────────────────────────────── */
  if (banners.length === 0) {
    if (page !== "home") return null;
    return (
      <div className="promo-wrapper">
        <DemoBar />
        <div
          className="hero-slide"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(15,17,21,0.85) 30%, rgba(15,17,21,0.2) 80%), url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1400&auto=format&fit=crop')"
          }}
        >
          <div className="hero-content">
            <span className="hero-tag">NEW SEASON ARRIVALS</span>
            <h1 className="hero-title">Elevate Your Style,<br />Experience Comfort.</h1>
            <p className="hero-subtitle">
              Premium curated shirts, jackets, linen blouses and warm outerwear. Made with organic fabrics.
            </p>
            <div className="hero-cta-row">
              <Link to="/womens">
                <button className="hero-btn hero-btn-primary">Shop Women <ArrowRight size={15} /></button>
              </Link>
              <Link to="/mens">
                <button className="hero-btn hero-btn-ghost">Shop Men <ArrowRight size={15} /></button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── DB BANNER CAROUSEL ──────────────────────────────────────── */
  return (
    <div className="promo-wrapper">
      <DemoBar />

      <div className="hero-carousel">
        {banners.map((ban, idx) => (
          <div
            key={ban._id ?? idx}
            className={`hero-slide carousel-slide ${idx === current ? "active" : ""} ${transitioning && idx === current ? "transitioning" : ""}`}
            style={{
              backgroundImage: `linear-gradient(to right, rgba(15,17,21,0.88) 28%, rgba(15,17,21,0.22) 72%), url('${ban.image}')`
            }}
          >
            <div className="hero-content">
              {ban.discountType && (
                <span className="hero-promo-tag">
                  {ban.discountType === "percentage"
                    ? `${ban.discountValue}% OFF PROMOTIONAL OFFER`
                    : `₹${ban.discountValue} OFF PROMOTIONAL OFFER`}
                </span>
              )}
              <h1 className="hero-title">{ban.description}</h1>
              <div className="hero-cta-row">
                <Link to={ban.targetLink || "/"}>
                  <button className="hero-btn hero-btn-primary">Claim Offer Now <ArrowRight size={15} /></button>
                </Link>
              </div>
            </div>
          </div>
        ))}

        {/* Arrows */}
        {banners.length > 1 && (
          <>
            <button className="carousel-arrow carousel-arrow-left" onClick={prev} aria-label="Previous banner">
              <ChevronLeft size={20} />
            </button>
            <button className="carousel-arrow carousel-arrow-right" onClick={next} aria-label="Next banner">
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Dot indicators */}
        {banners.length > 1 && (
          <div className="carousel-dots">
            {banners.map((_, i) => (
              <button
                key={i}
                className={`carousel-dot ${i === current ? "active" : ""}`}
                onClick={() => goTo(i)}
                aria-label={`Go to banner ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const DemoBar = () => (
  <div className="demo-bar">
    <ShieldAlert size={14} />
    <span>RamCart Portfolio Project: This is a demo site. No real transactions are processed or shipped.</span>
  </div>
);

export default PromoBanner;
