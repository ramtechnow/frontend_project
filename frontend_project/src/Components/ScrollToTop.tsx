/* ============================================================
   ScrollToTop.tsx — Global floating "Back to Top" button
   Appears after scrolling 300px. Smooth scroll on click.
   Works on mobile and desktop.
   ============================================================ */
import React, { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";

const ScrollToTop: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 300);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollUp = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={scrollUp}
      aria-label="Scroll to top"
      style={{
        position: "fixed",
        bottom: "80px",        /* above MobileBottomNav on mobile */
        right: "16px",
        zIndex: 999,
        width: "42px",
        height: "42px",
        borderRadius: "50%",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--accent-pink)",
        color: "#fff",
        boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transform: visible ? "translateY(0) scale(1)" : "translateY(12px) scale(0.85)",
        transition: "opacity 0.25s ease, transform 0.25s ease",
      }}
    >
      <ChevronUp size={20} strokeWidth={2.5} />
    </button>
  );
};

export default ScrollToTop;
