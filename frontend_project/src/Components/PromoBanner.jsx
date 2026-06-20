import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldAlert } from "lucide-react";
import "../styles/theme.css";

const PromoBanner = () => {
  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
      {/* Demo Warning Notice Bar */}
      <div 
        style={{
          backgroundColor: "var(--accent-light)",
          color: "var(--accent-pink)",
          fontSize: "12px",
          fontWeight: "600",
          textAlign: "center",
          padding: "10px 15px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          borderBottom: "1px solid var(--border-color)",
          width: "100%",
          boxSizing: "border-box"
        }}
      >
        <ShieldAlert size={14} />
        <span>RamCart Portfolio Project: This is a demo site. No real transactions are processed or shipped.</span>
      </div>

      {/* Hero Banner Container */}
      <div 
        style={{
          position: "relative",
          width: "100%",
          height: "480px",
          backgroundImage: "linear-gradient(to right, rgba(15,17,21,0.85) 30%, rgba(15,17,21,0.2) 80%), url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
          padding: "0 var(--space-8)",
          boxSizing: "border-box",
          borderRadius: "var(--border-radius-md)",
          overflow: "hidden",
          margin: "var(--space-4) 0",
          color: "white"
        }}
      >
        <div style={{ maxWidth: "550px", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          <span 
            style={{ 
              color: "var(--accent-pink)", 
              fontWeight: "700", 
              textTransform: "uppercase", 
              letterSpacing: "2px",
              fontSize: "13px"
            }}
          >
            NEW SEASON ARRIVALS
          </span>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: "800", color: "white", lineHeight: "1.1" }}>
            Elevate Your Style, Experience Comfort.
          </h1>
          <p style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: "15px", margin: "10px 0" }}>
            Discover our premium curated collection of shirts, jackets, linen blouses, and warm active outerwear. Made with organic fabrics.
          </p>
          <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
            <Link to="/womens">
              <button 
                className="interactive-target"
                style={{ 
                  backgroundColor: "var(--accent-pink)", 
                  color: "white", 
                  fontWeight: "700", 
                  padding: "0 24px", 
                  borderRadius: "var(--border-radius-full)", 
                  fontSize: "13px",
                  height: "44px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                Shop Women <ArrowRight size={16} />
              </button>
            </Link>
            <Link to="/mens">
              <button 
                className="interactive-target"
                style={{ 
                  backgroundColor: "rgba(255, 255, 255, 0.15)", 
                  color: "white", 
                  border: "1px solid rgba(255,255,255,0.4)",
                  fontWeight: "700", 
                  padding: "0 24px", 
                  borderRadius: "var(--border-radius-full)", 
                  fontSize: "13px",
                  height: "44px",
                  backdropFilter: "blur(4px)"
                }}
              >
                Shop Men
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromoBanner;
