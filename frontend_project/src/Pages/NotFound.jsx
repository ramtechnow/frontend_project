import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ShoppingBag } from 'lucide-react';

const NotFound = () => {
  return (
    <main className="container" style={{ 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      justifyContent: "center", 
      minHeight: "70vh", 
      textAlign: "center",
      padding: "var(--space-12) var(--space-4)"
    }}>
      <div style={{ position: "relative", marginBottom: "var(--space-6)" }}>
        {/* Sleek Gradient 404 Text */}
        <h1 style={{ 
          fontSize: "120px", 
          fontWeight: "900", 
          lineHeight: "1", 
          margin: "0",
          background: "linear-gradient(135deg, var(--accent-pink), #8b5cf6)", 
          WebkitBackgroundClip: "text", 
          WebkitTextFillColor: "transparent" 
        }}>
          404
        </h1>
      </div>
      
      <h2 style={{ 
        fontSize: "var(--text-2xl)", 
        fontWeight: "800", 
        marginBottom: "var(--space-3)",
        color: "var(--text-primary)"
      }}>
        Page Not Found
      </h2>
      
      <p style={{ 
        fontSize: "var(--text-sm)", 
        color: "var(--text-secondary)", 
        maxWidth: "480px", 
        lineHeight: "1.6",
        marginBottom: "var(--space-8)"
      }}>
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable. Let's get you back on track!
      </p>
      
      <div style={{ display: "flex", gap: "var(--space-4)", flexWrap: "wrap", justifyContent: "center" }}>
        <Link 
          to="/" 
          style={{ 
            display: "inline-flex", 
            alignItems: "center", 
            gap: "var(--space-2)", 
            backgroundColor: "var(--accent-pink)", 
            color: "var(--text-light)", 
            padding: "12px 24px", 
            borderRadius: "var(--border-radius-full)", 
            fontWeight: "600", 
            fontSize: "var(--text-sm)",
            textDecoration: "none",
            boxShadow: "var(--shadow-sm)",
            transition: "var(--transition-smooth)"
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = "var(--accent-hover)"}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = "var(--accent-pink)"}
        >
          <Home size={18} />
          Go Home
        </Link>
        <Link 
          to="/catalog" 
          style={{ 
            display: "inline-flex", 
            alignItems: "center", 
            gap: "var(--space-2)", 
            backgroundColor: "var(--bg-tertiary)", 
            color: "var(--text-primary)", 
            padding: "12px 24px", 
            borderRadius: "var(--border-radius-full)", 
            fontWeight: "600", 
            fontSize: "var(--text-sm)",
            textDecoration: "none",
            border: "1px solid var(--border-color)",
            transition: "var(--transition-smooth)"
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = "var(--border-color)"}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = "var(--bg-tertiary)"}
        >
          <ShoppingBag size={18} />
          Shop Catalog
        </Link>
      </div>
    </main>
  );
};

export default NotFound;
