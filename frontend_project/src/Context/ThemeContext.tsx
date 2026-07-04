import React, { createContext, useState, useEffect } from "react";

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  themeColor: string;
  setThemeColor: (color: string) => void;
  fontFamily: string;
  setFontFamily: (font: string) => void;
  borderRadius: string;
  setBorderRadius: (radius: string) => void;
}

export const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [themeColor, setThemeColorState] = useState("rose");
  const [fontFamily, setFontFamilyState] = useState("sans");
  const [borderRadius, setBorderRadiusState] = useState("rounded");

  // Load all settings on mount
  useEffect(() => {
    // 1. Dark Mode
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setIsDarkMode(savedTheme === "dark");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDarkMode(prefersDark);
    }

    // 2. Color Theme
    const savedColor = localStorage.getItem("themeColor");
    if (savedColor) setThemeColorState(savedColor);

    // 3. Font Family
    const savedFont = localStorage.getItem("fontFamily");
    if (savedFont) setFontFamilyState(savedFont);

    // 4. Border Radius
    const savedRadius = localStorage.getItem("borderRadius");
    if (savedRadius) setBorderRadiusState(savedRadius);
  }, []);

  // Sync settings to HTML element classes
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    // A. Dark Mode
    if (isDarkMode) {
      root.classList.add("dark", "dark-theme");
      body.classList.add("dark", "dark-theme");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark", "dark-theme");
      body.classList.remove("dark", "dark-theme");
      localStorage.setItem("theme", "light");
    }

    // B. Color Theme
    const colorThemes = ["theme-rose", "theme-sapphire", "theme-emerald", "theme-gold", "theme-obsidian"];
    colorThemes.forEach((t) => {
      root.classList.remove(t);
      body.classList.remove(t);
    });
    root.classList.add(`theme-${themeColor}`);
    body.classList.add(`theme-${themeColor}`);
    localStorage.setItem("themeColor", themeColor);

    // C. Font Family
    const fontFamilies = ["font-sans", "font-serif", "font-geometric", "font-clean"];
    fontFamilies.forEach((f) => {
      root.classList.remove(f);
      body.classList.remove(f);
    });
    root.classList.add(`font-${fontFamily}`);
    body.classList.add(`font-${fontFamily}`);
    localStorage.setItem("fontFamily", fontFamily);

    // D. Border Radius
    const radii = ["radius-rounded", "radius-sharp", "radius-playful"];
    radii.forEach((r) => {
      root.classList.remove(r);
      body.classList.remove(r);
    });
    root.classList.add(`radius-${borderRadius}`);
    body.classList.add(`radius-${borderRadius}`);
    localStorage.setItem("borderRadius", borderRadius);
  }, [isDarkMode, themeColor, fontFamily, borderRadius]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const setThemeColor = (color: string) => setThemeColorState(color);
  const setFontFamily = (font: string) => setFontFamilyState(font);
  const setBorderRadius = (radius: string) => setBorderRadiusState(radius);

  const value = {
    isDarkMode,
    toggleTheme,
    themeColor,
    setThemeColor,
    fontFamily,
    setFontFamily,
    borderRadius,
    setBorderRadius,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
