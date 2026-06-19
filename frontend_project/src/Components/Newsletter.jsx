import React, { useState } from "react";
import { Mail, CheckCircle } from "lucide-react";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    setError("");
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(trimmed)) {
      setError("Email address format is invalid.");
      return;
    }
    setSubscribed(true);
    setEmail("");
  };

  return (
    <div 
      style={{ 
        backgroundColor: "var(--accent-light)", 
        borderRadius: "var(--border-radius-lg)", 
        padding: "var(--space-8) var(--space-6)",
        textAlign: "center",
        margin: "var(--space-10) 0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "var(--space-3)",
        border: "1px dashed var(--accent-pink)"
      }}
    >
      <div 
        style={{ 
          width: "48px", 
          height: "48px", 
          borderRadius: "50%", 
          backgroundColor: "var(--bg-secondary)", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          color: "var(--accent-pink)",
          boxShadow: "var(--shadow-sm)"
        }}
      >
        <Mail size={24} />
      </div>

      <h2 style={{ fontSize: "var(--text-xl)", fontWeight: "800", color: "var(--text-primary)" }}>
        Subscribe to SHOPPER Newsletter
      </h2>
      <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", maxWidth: "450px" }}>
        Stay updated on special season offers, styling tutorials, and portfolio code enhancements. Direct updates to your inbox.
      </p>

      {subscribed ? (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--success-color)", fontWeight: "600", marginTop: "var(--space-2)" }}>
          <CheckCircle size={18} />
          <span>Thank you for subscribing! (Demo confirmation)</span>
        </div>
      ) : (
        <form 
          onSubmit={handleSubscribe} 
          style={{ 
            display: "flex", 
            width: "100%", 
            maxWidth: "460px", 
            gap: "var(--space-2)", 
            marginTop: "var(--space-3)",
            flexWrap: "wrap" 
          }}
        >
          <input 
            type="email" 
            placeholder="Enter your email address" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ 
              flexGrow: 1, 
              height: "44px", 
              padding: "0 var(--space-4)", 
              border: "1px solid var(--border-color)", 
              borderRadius: "var(--border-radius-full)",
              minWidth: "240px",
              outline: "none"
            }}
          />
          <button 
            type="submit"
            className="interactive-target"
            style={{ 
              backgroundColor: "var(--accent-pink)", 
              color: "white", 
              fontWeight: "700", 
              borderRadius: "var(--border-radius-full)",
              padding: "0 var(--space-6)",
              height: "44px",
              minWidth: "120px"
            }}
          >
            Subscribe
          </button>
        </form>
      )}
      {error && <span style={{ color: "#ef4444", fontSize: "var(--text-xs)", marginTop: "4px" }}>{error}</span>}
    </div>
  );
};

export default Newsletter;
