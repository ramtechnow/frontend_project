import React, { useContext } from "react";
import { ThemeContext } from "../../Context/ThemeContext";
import { Sun, Moon, Check, Sparkles } from "lucide-react";
import { Accordion } from "react-bootstrap";

export const ThemeCustomizer: React.FC = () => {
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
    { name: "rose", label: "Rose Gold", value: "rose" },
    { name: "sapphire", label: "Sapphire Blue", value: "sapphire" },
    { name: "emerald", label: "Emerald Mint", value: "emerald" },
    { name: "gold", label: "Luxury Gold", value: "gold" },
    { name: "obsidian", label: "Obsidian Slate", value: "obsidian" },
  ];

  const fonts = [
    { name: "geometric", label: "Geometric" },
    { name: "clean", label: "Minimalist" },
    { name: "serif", label: "Serif" },
  ];

  const corners = [
    { name: "sharp", label: "Sharp" },
    { name: "rounded", label: "Rounded" },
    { name: "playful", label: "Playful" },
  ];

  return (
    <div className="theme-customizer-accordion-wrapper" style={{ marginTop: "10px" }}>
      <Accordion flush style={{ background: "transparent" }}>
        <Accordion.Item eventKey="0" style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: "12px", overflow: "hidden" }}>
          <Accordion.Header className="custom-accordion-header">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Sparkles size={13} style={{ color: "var(--accent-pink)" }} />
              <span style={{ fontSize: "10.5px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1px", color: "var(--text-primary)" }}>
                Theme Customizer
              </span>
            </div>
          </Accordion.Header>
          <Accordion.Body style={{ background: "var(--bg-tertiary)", padding: "12px 12px 14px" }}>
            
            {/* Mode */}
            <div style={{ marginBottom: "12px" }}>
              <span style={{ fontSize: "9px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-muted)", display: "block", marginBottom: "5px" }}>Mode</span>
              <div style={{ display: "flex", gap: "6px" }}>
                <button
                  onClick={() => !isDarkMode && toggleTheme()}
                  style={{
                    flex: 1, height: "30px", borderRadius: "6px", border: isDarkMode ? "1.5px solid var(--accent-pink)" : "1px solid var(--border-color)",
                    background: isDarkMode ? "var(--accent-light)" : "var(--bg-primary)",
                    color: isDarkMode ? "var(--accent-pink)" : "var(--text-primary)",
                    fontSize: "10px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", cursor: "pointer"
                  }}
                >
                  <Moon size={11} /> Dark
                </button>
                <button
                  onClick={() => isDarkMode && toggleTheme()}
                  style={{
                    flex: 1, height: "30px", borderRadius: "6px", border: !isDarkMode ? "1.5px solid var(--accent-pink)" : "1px solid var(--border-color)",
                    background: !isDarkMode ? "var(--accent-light)" : "var(--bg-primary)",
                    color: !isDarkMode ? "var(--accent-pink)" : "var(--text-primary)",
                    fontSize: "10px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", cursor: "pointer"
                  }}
                >
                  <Sun size={11} /> Light
                </button>
              </div>
            </div>

            {/* Color */}
            <div style={{ marginBottom: "12px" }}>
              <span style={{ fontSize: "9px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-muted)", display: "block", marginBottom: "5px" }}>Colors</span>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {colors.map((c) => {
                  const active = themeColor === c.name;
                  const bubbleColor = c.name === "rose" ? "#f23e70" : c.name === "sapphire" ? "#2563eb" : c.name === "emerald" ? "#059669" : c.name === "gold" ? "#d97706" : "#475569";
                  return (
                    <button
                      key={c.name}
                      onClick={() => setThemeColor(c.name)}
                      style={{
                        width: "24px", height: "24px", borderRadius: "50%", background: bubbleColor, border: active ? "2px solid var(--text-primary)" : "1px solid rgba(0,0,0,0.15)",
                        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0
                      }}
                      title={c.label}
                    >
                      {active && <Check size={10} style={{ color: "#fff" }} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fonts */}
            <div style={{ marginBottom: "12px" }}>
              <span style={{ fontSize: "9px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-muted)", display: "block", marginBottom: "5px" }}>Font</span>
              <div style={{ display: "flex", gap: "6px" }}>
                {fonts.map((f) => {
                  const active = fontFamily === f.name;
                  return (
                    <button
                      key={f.name}
                      onClick={() => setFontFamily(f.name)}
                      style={{
                        flex: 1, height: "26px", borderRadius: "6px", border: active ? "1.5px solid var(--accent-pink)" : "1px solid var(--border-color)",
                        background: active ? "var(--accent-light)" : "var(--bg-primary)",
                        color: active ? "var(--accent-pink)" : "var(--text-secondary)",
                        fontSize: "9px", fontWeight: "600", cursor: "pointer"
                      }}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Corners */}
            <div style={{ marginBottom: "12px" }}>
              <span style={{ fontSize: "9px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-muted)", display: "block", marginBottom: "5px" }}>Corners</span>
              <div style={{ display: "flex", gap: "6px" }}>
                {corners.map((co) => {
                  const active = borderRadius === co.name;
                  return (
                    <button
                      key={co.name}
                      onClick={() => setBorderRadius(co.name)}
                      style={{
                        flex: 1, height: "26px", borderRadius: "6px", border: active ? "1.5px solid var(--accent-pink)" : "1px solid var(--border-color)",
                        background: active ? "var(--accent-light)" : "var(--bg-primary)",
                        color: active ? "var(--accent-pink)" : "var(--text-secondary)",
                        fontSize: "9px", fontWeight: "600", cursor: "pointer"
                      }}
                    >
                      {co.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reset */}
            <button
              onClick={() => {
                setThemeColor("rose");
                setFontFamily("sans");
                setBorderRadius("rounded");
                if (isDarkMode) toggleTheme();
              }}
              style={{
                width: "100%", height: "28px", borderRadius: "6px", border: "1px solid var(--border-color)",
                background: "var(--bg-primary)", color: "var(--text-secondary)", fontSize: "9px", fontWeight: "700",
                textTransform: "uppercase", letterSpacing: "0.5px", cursor: "pointer"
              }}
            >
              Reset Defaults
            </button>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </div>
  );
};

export default ThemeCustomizer;
