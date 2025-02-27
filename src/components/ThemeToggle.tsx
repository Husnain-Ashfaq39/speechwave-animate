
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check if user prefers dark mode
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDark(
      localStorage.getItem("theme") === "dark" || 
      (!localStorage.getItem("theme") && prefersDark)
    );
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <button
      onClick={toggleTheme}
      className="relative h-10 w-10 rounded-full bg-secondary p-2 transition-colors hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <Sun className={`absolute inset-0 h-full w-full p-2 transition-opacity ${isDark ? "opacity-0" : "opacity-100"}`} />
      <Moon className={`absolute inset-0 h-full w-full p-2 transition-opacity ${isDark ? "opacity-100" : "opacity-0"}`} />
    </button>
  );
};
