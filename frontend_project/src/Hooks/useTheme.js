import { useContext } from "react";
import { ThemeContext } from "../Context/ThemeContext";

/**
 * Custom hook to safely consume Theme Context
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined || context === null) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export default useTheme;
