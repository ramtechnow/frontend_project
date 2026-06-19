import React from "react";
import { Quote, Star } from "lucide-react";

const Testimonials = () => {
  const reviews = [
    {
      name: "Sophia Martinez",
      role: "Verified Purchaser",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop",
      rating: 5,
      comment: "The linen blouse is incredibly breathable! Excellent craftsmanship and customer support when checking size details."
    },
    {
      name: "Marcus Chen",
      role: "Verified Purchaser",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=150&auto=format&fit=crop",
      rating: 5,
      comment: "I've purchased the denim jacket and chinos. Both fit perfectly and hold up nicely after multiple washes. Highly recommend!"
    },
    {
      name: "Emily Watson",
      role: "Verified Purchaser",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop",
      rating: 4,
      comment: "Super cute styles for kids! The yellow raincoat is durable and keeps water out perfectly. Delivery was fast too."
    }
  ];

  return (
    <div style={{ margin: "var(--space-12) 0" }}>
      <div style={{ textAlign: "center", marginBottom: "var(--space-8)" }}>
        <span style={{ color: "var(--accent-pink)", fontSize: "var(--text-xs)", fontWeight: "700", letterSpacing: "1px" }}>
          CUSTOMER LOVE
        </span>
        <h2 style={{ fontSize: "var(--text-2xl)", fontWeight: "800", marginTop: "4px" }}>
          What Our Community Says
        </h2>
      </div>

      <div 
        style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
          gap: "var(--space-6)" 
        }}
      >
        {reviews.map((rev, idx) => (
          <div 
            key={idx}
            style={{ 
              backgroundColor: "var(--bg-secondary)", 
              border: "1px solid var(--border-color)", 
              borderRadius: "var(--border-radius-md)", 
              padding: "var(--space-6)",
              position: "relative",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-4)"
            }}
          >
            <Quote 
              size={36} 
              style={{ 
                color: "var(--accent-pink)", 
                opacity: 0.1, 
                position: "absolute", 
                top: "16px", 
                right: "16px" 
              }} 
            />

            <div style={{ display: "flex", gap: "2px" }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star 
                  key={i} 
                  size={14} 
                  fill={i < rev.rating ? "var(--accent-pink)" : "none"} 
                  stroke={i < rev.rating ? "var(--accent-pink)" : "var(--border-color)"}
                />
              ))}
            </div>

            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", fontStyle: "italic", flexGrow: 1 }}>
              "{rev.comment}"
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
              <img 
                src={rev.image} 
                alt={rev.name} 
                style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }} 
              />
              <div>
                <h4 style={{ fontSize: "var(--text-sm)", fontWeight: "700" }}>{rev.name}</h4>
                <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{rev.role}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Testimonials;
