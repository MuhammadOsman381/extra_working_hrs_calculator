"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { requestJson } from "@/src/lib/client-api";
import { defaultPalette, isPaletteId, paletteStorageKey, type PaletteId, type ThemeMode } from "@/src/lib/palettes";
import type { AppUser } from "@/src/features/work-days/types";

type Theme = ThemeMode;

type ThemeContextValue = {
  theme: Theme;
  resolvedTheme: "dark" | "light";
  palette: PaletteId;
  setTheme: (theme: Theme) => void;
  setPalette: (palette: PaletteId) => void;
  syncFromUser: (theme: Theme, palette: PaletteId) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function resolveTheme(theme: Theme) {
  if (theme !== "system") return theme;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("dark");
  const [palette, setPaletteState] = useState<PaletteId>(defaultPalette);

  useEffect(() => {
    void Promise.resolve().then(() => {
      const stored = localStorage.getItem("extra-hours-theme") as Theme | null;
      const storedPalette = localStorage.getItem(paletteStorageKey);
      const nextTheme = stored === "light" || stored === "system" || stored === "dark" ? stored : "dark";
      setThemeState(nextTheme);
      setPaletteState(isPaletteId(storedPalette) ? storedPalette : defaultPalette);
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

  useEffect(() => {
    document.documentElement.dataset.palette = palette;
    localStorage.setItem(paletteStorageKey, palette);
  }, [palette]);

  function setTheme(nextTheme: Theme) {
    localStorage.setItem("extra-hours-theme", nextTheme);
    setThemeState(nextTheme);
    void requestJson("/api/settings", {
      method: "PATCH",
      body: JSON.stringify({ theme: nextTheme }),
    }).catch(() => undefined);
  }

  function setPalette(nextPalette: PaletteId) {
    localStorage.setItem(paletteStorageKey, nextPalette);
    setPaletteState(nextPalette);
    void requestJson("/api/settings", {
      method: "PATCH",
      body: JSON.stringify({ palette: nextPalette }),
    }).catch(() => undefined);
  }

  const syncFromUser = useCallback((nextTheme: Theme, nextPalette: PaletteId) => {
    localStorage.setItem("extra-hours-theme", nextTheme);
    localStorage.setItem(paletteStorageKey, nextPalette);
    setThemeState(nextTheme);
    setPaletteState(nextPalette);
  }, []);

  useEffect(() => {
    void requestJson<AppUser>("/api/auth/me")
      .then((user) => syncFromUser(user.theme, user.palette))
      .catch(() => undefined);
  }, [syncFromUser]);

  const value = useMemo(
    () => ({ theme, resolvedTheme, palette, setTheme, setPalette, syncFromUser }),
    [palette, theme, resolvedTheme, syncFromUser],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
