"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type Theme = "dark" | "light" | "system";

type ThemeContextValue = {
  theme: Theme;
  resolvedTheme: "dark" | "light";
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function resolveTheme(theme: Theme) {
  if (theme !== "system") return theme;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    void Promise.resolve().then(() => {
      const stored = localStorage.getItem("extra-hours-theme") as Theme | null;
      const nextTheme = stored === "light" || stored === "system" || stored === "dark" ? stored : "dark";
      setThemeState(nextTheme);
    });
  }, []);

  useEffect(() => {
    function apply() {
      const resolved = resolveTheme(theme);
      document.documentElement.dataset.theme = resolved;
      void Promise.resolve().then(() => setResolvedTheme(resolved));
    }

    apply();
    if (theme !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: light)");
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme]);

  function setTheme(nextTheme: Theme) {
    localStorage.setItem("extra-hours-theme", nextTheme);
    setThemeState(nextTheme);
  }

  const value = useMemo(() => ({ theme, resolvedTheme, setTheme }), [theme, resolvedTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
