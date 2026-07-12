import React, { useContext } from "react";
import { ThemeContext } from "../Context/ThemeContext";
import "../Styles/pattern.css";

export const Pattern: React.FC = () => {
  const themeContext = useContext(ThemeContext);
  const isDarkMode = themeContext?.isDarkMode || false;

  if (isDarkMode) {
    return (
      <div className="stars-container">
        <div id="stars" />
        <div id="stars2" />
        <div id="stars3" />
      </div>
    );
  }

  return (
    <div className="grid-wrapper">
      <div className="grid-background" />
    </div>
  );
};

export default Pattern;
