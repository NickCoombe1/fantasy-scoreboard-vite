import { useState, useEffect } from "react";

type Theme = "light" | "dark";

function getSavedTheme(): Theme {
  return localStorage.getItem("theme") === "dark" ? "dark" : "light";
}

export function useTheme() {
  // Read localStorage synchronously as the initial state, rather than
  // defaulting to "light" and correcting later via an effect — the DOM starts
  // with a hardcoded "light" class (see index.html), so deriving state from
  // that on mount would report the wrong theme until an async
  // MutationObserver callback corrects it afterwards.
  const [theme, setTheme] = useState<Theme>(getSavedTheme);

  // Apply the resolved theme to the DOM once on mount, and reveal the page
  // (index.html ships with a "hidden" class to avoid a flash of the wrong
  // theme before this runs).
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    root.classList.remove("hidden");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Multiple components call useTheme() independently (each with its own
  // state), so this keeps every instance in sync when another one changes
  // the theme via selectTheme.
  useEffect(() => {
    const root = window.document.documentElement;
    const observer = new MutationObserver(() => {
      const newTheme = root.classList.contains("dark") ? "dark" : "light";
      setTheme(newTheme);
    });

    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const selectTheme = (newTheme: Theme) => {
    if (newTheme === theme) return;
    const root = window.document.documentElement;
    root.classList.remove(theme);
    root.classList.add(newTheme);
    localStorage.setItem("theme", newTheme);
    setTheme(newTheme);
  };

  return { theme, selectTheme };
}
