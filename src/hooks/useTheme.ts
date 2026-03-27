import { useState, useEffect } from "react";

export function useTheme() {
  const [theme, setTheme] = useState<string>("light");

  useEffect(() => {
    const root = window.document.documentElement;
    const currentTheme = root.classList.contains("dark") ? "dark" : "light";
    setTheme(currentTheme);

    const observer = new MutationObserver(() => {
      const newTheme = root.classList.contains("dark") ? "dark" : "light";
      setTheme(newTheme);
    });

    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      root.classList.remove("light", "dark");
      root.classList.add(savedTheme);
    }
    root.classList.remove("hidden");
  }, []);

  const toggleTheme = () => {
    const root = window.document.documentElement;
    const newTheme = theme === "light" ? "dark" : "light";
    root.classList.remove(theme);
    root.classList.add(newTheme);
    localStorage.setItem("theme", newTheme);
    setTheme(newTheme);
  };

  return { theme, toggleTheme };
}
