import { useEffect, useState } from "react";
import { api } from "../lib/api";

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "toolbox-theme";
const LEGACY_KEY = "toolbox:theme";

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function resolveTheme(preference: Theme): ResolvedTheme {
  if (preference === "system") {
    return getSystemTheme();
  }
  return preference;
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return "dark";
    const stored = (localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_KEY)) as Theme | null;
    if (stored === "light" || stored === "dark" || stored === "system") return stored;
    return "dark";
  });

  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => resolveTheme(theme));

  // Sincroniza resolvedTheme e atributo data-theme no DOM
  useEffect(() => {
    const resolved = resolveTheme(theme);
    setResolvedTheme(resolved);
    document.documentElement.setAttribute("data-theme", resolved);
    document.documentElement.dataset.theme = resolved;
    localStorage.setItem(STORAGE_KEY, theme);
    localStorage.setItem(LEGACY_KEY, theme);
    api.setTheme(theme).catch(() => {});
  }, [theme]);

  // Listener para mudanças no tema do sistema operacional quando em modo 'system'
  useEffect(() => {
    if (theme !== "system" || typeof window === "undefined" || !window.matchMedia) return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      const resolved: ResolvedTheme = e.matches ? "dark" : "light";
      setResolvedTheme(resolved);
      document.documentElement.setAttribute("data-theme", resolved);
      document.documentElement.dataset.theme = resolved;
    };
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggle = () => {
    setThemeState((current) => {
      const currentResolved = resolveTheme(current);
      return currentResolved === "dark" ? "light" : "dark";
    });
  };

  return { theme, resolvedTheme, setTheme, toggle };
}
