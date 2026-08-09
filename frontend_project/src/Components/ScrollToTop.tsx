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
      const scrolled = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      setVisible(scrolled > 300);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    // Run initially in case page is already scrolled
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollUp = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={scrollUp}
      aria-label="Scroll to top"
      className="scroll-to-top-btn"
      style={{
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transform: visible ? "translateY(0) scale(1)" : "translateY(12px) scale(0.85)",
      }}
    >
      <ChevronUp size={20} strokeWidth={2.5} />
    </button>
  );
};

export default ScrollToTop;
