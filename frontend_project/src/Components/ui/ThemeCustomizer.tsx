import React, { useState, useContext } from "react";
import { ThemeContext } from "../../Context/ThemeContext";
import { Settings, X, Sun, Moon, Check, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const ThemeCustomizer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const themeCtx = useContext(ThemeContext);

  if (!themeCtx) return null;

  const {
    isDarkMode,
    toggleTheme,
    themeColor,
    setThemeColor,
    fontFamily,
    setFontFamily,
    borderRadius,
    setBorderRadius,
  } = themeCtx;

  const colors = [
    { name: "rose", label: "Rose Gold", value: "rose", bgClass: "bg-[#f23e70]" },
    { name: "sapphire", label: "Sapphire Blue", value: "sapphire", bgClass: "bg-[#2563eb]" },
    { name: "emerald", label: "Emerald Mint", value: "emerald", bgClass: "bg-[#059669]" },
    { name: "gold", label: "Luxury Gold", value: "gold", bgClass: "bg-[#d97706]" },
    { name: "obsidian", label: "Obsidian Slate", value: "obsidian", bgClass: "bg-[#475569]" },
  ];

  const fonts = [
    { name: "geometric", label: "Modern Geometric", fontClass: "font-sans" },
    { name: "clean", label: "Clean Minimalist", fontClass: "font-sans" },
    { name: "serif", label: "Editorial Serif", fontClass: "font-serif" },
  ];

  const corners = [
    { name: "sharp", label: "Sharp Edge" },
    { name: "rounded", label: "Modern Rounded" },
    { name: "playful", label: "Extra Playful" },
  ];

  return (
    <>
      {/* Floating Gear Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 30 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[99] flex h-12 w-12 items-center justify-center rounded-full bg-accent-pink text-white shadow-xl hover:shadow-2xl cursor-pointer"
        aria-label="Customize theme"
      >
        <Settings size={20} className="animate-spin-slow" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[1000] bg-black/40 backdrop-blur-sm"
            />

            {/* Side sheet drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 z-[1001] h-full w-[340px] max-w-[90%] bg-bg-secondary border-l border-border p-6 shadow-2xl flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Sparkles size={18} className="text-accent-pink" />
                    <h3 className="font-extrabold text-sm sm:text-base text-text-primary uppercase tracking-wider">
                      Shopper Customizer
                    </h3>
                  </div>
                  <motion.button
                    whileHover={{ rotate: 90, scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-bg-primary border border-border text-text-primary cursor-pointer"
                  >
                    <X size={16} />
                  </motion.button>
                </div>

                {/* Theme Mode Option */}
                <div className="py-5 border-b border-border">
                  <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2">
                    Appearance Mode
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => !isDarkMode && toggleTheme()}
                      className={`flex h-10 items-center justify-center gap-2 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                        isDarkMode
                          ? "border-accent-pink bg-accent-light text-accent-pink"
                          : "border-border bg-bg-primary text-text-primary"
                      }`}
                    >
                      <Moon size={14} /> Dark Mode
                    </button>
                    <button
                      onClick={() => isDarkMode && toggleTheme()}
                      className={`flex h-10 items-center justify-center gap-2 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                        !isDarkMode
                          ? "border-accent-pink bg-accent-light text-accent-pink"
                          : "border-border bg-bg-primary text-text-primary"
                      }`}
                    >
                      <Sun size={14} /> Light Mode
                    </button>
                  </div>
                </div>

                {/* Color Palettes Option */}
                <div className="py-5 border-b border-border">
                  <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2.5">
                    Accent Color Theme
                  </label>
                  <div className="flex flex-col gap-2.5">
                    {colors.map((c) => {
                      const isActive = themeColor === c.name;
                      return (
                        <button
                          key={c.name}
                          onClick={() => setThemeColor(c.name)}
                          className={`flex items-center justify-between h-10 w-full px-3.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                            isActive
                              ? "border-accent-pink bg-accent-light text-text-primary"
                              : "border-border bg-bg-primary text-text-secondary hover:text-text-primary"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className={`h-4.5 w-4.5 rounded-full ${c.bgClass} border border-black/10`} />
                            <span>{c.label}</span>
                          </div>
                          {isActive && <Check size={14} className="text-accent-pink" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Typography Font option */}
                <div className="py-5 border-b border-border">
                  <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2.5">
                    Brand Typography
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {fonts.map((f) => {
                      const isActive = fontFamily === f.name;
                      return (
                        <button
                          key={f.name}
                          onClick={() => setFontFamily(f.name)}
                          className={`flex items-center justify-between h-9 px-3 rounded-lg border text-xs font-medium cursor-pointer transition-all ${
                            isActive
                              ? "border-accent-pink bg-accent-light text-text-primary"
                              : "border-border bg-bg-primary text-text-secondary"
                          }`}
                        >
                          <span className={f.fontClass}>{f.label}</span>
                          {isActive && <Check size={12} className="text-accent-pink" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Border Radius Option */}
                <div className="py-5">
                  <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2.5">
                    Container Corner Style
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {corners.map((co) => {
                      const isActive = borderRadius === co.name;
                      return (
                        <button
                          key={co.name}
                          onClick={() => setBorderRadius(co.name)}
                          className={`flex flex-col items-center justify-center h-12 rounded-lg border text-[10px] font-bold cursor-pointer transition-all ${
                            isActive
                              ? "border-accent-pink bg-accent-light text-accent-pink"
                              : "border-border bg-bg-primary text-text-secondary"
                          }`}
                        >
                          {co.label.split(" ")[1]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Reset defaults */}
              <div className="pt-4 border-t border-border flex flex-col gap-2">
                <button
                  onClick={() => {
                    setThemeColor("rose");
                    setFontFamily("sans");
                    setBorderRadius("rounded");
                    if (isDarkMode) toggleTheme();
                  }}
                  className="w-full h-9 rounded-lg border border-border text-[10px] font-bold text-text-secondary hover:text-text-primary bg-bg-primary uppercase tracking-wider cursor-pointer"
                >
                  Reset Defaults
                </button>
                <p className="text-[9px] text-text-muted text-center leading-relaxed">
                  Design settings are saved automatically to local storage for persistent shopper sessions.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default ThemeCustomizer;
