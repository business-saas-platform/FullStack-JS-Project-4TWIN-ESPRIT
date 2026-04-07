import React from "react";
import { useTheme } from "@/shared/contexts/ThemeContext";

export const ThemeToggle: React.FC = () => {
  const { theme, toggle } = useTheme();

  return (
    <button
      aria-label="Toggle theme"
      onClick={toggle}
      className="fixed z-50 top-4 right-4 p-2 rounded-md bg-card text-card-foreground shadow-md"
    >
      {theme === "dark" ? (
        <span style={{ fontSize: 18 }}>☀︎</span>
      ) : (
        <span style={{ fontSize: 18 }}>☾</span>
      )}
    </button>
  );
};

export default ThemeToggle;
