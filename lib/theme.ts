// lib/theme.ts

import type { CSSProperties } from "react";

export type Theme = {
  name: string;
  label: string;
  // Carte
  ocean: string;
  oceanDeep: string;
  text: string;
  landPalette: [string, string, string, string, string];
  landBorder: string;
  hover: string;
  found: string;
  wrong: string;
  pin: string;
  // Interface (menus, modale, cartes flottantes)
  surface: string;
  surfaceText: string;
  surfaceMuted: string;
  surfaceBorder: string;
  accent: string;
  accentText: string;
  accentSoft: string;
};

export const THEMES: Theme[] = [
  {
    name: "foret",
    label: "Forêt",
    ocean: "#4a7a4f",
    oceanDeep: "#2b1d12",
    text: "#f3ecd9",
    // Sous-bois : vert dominant, mais avec de la mousse olive, de l'écorce
    // brune et des feuilles dorées — pas un dégradé de vert uniforme.
    landPalette: ["#a9c88c", "#748c5b", "#c9a66b", "#8a6d3b", "#d9c46a"],
    landBorder: "#2e1f12",
    hover: "#ffd166",
    found: "#a3e635",
    wrong: "#e63946",
    pin: "#c2410c",
    surface: "#f6f1e4",
    surfaceText: "#2b2115",
    surfaceMuted: "#6b5d47",
    surfaceBorder: "#e2d6bd",
    accent: "#3f6b4a",
    accentText: "#ffffff",
    accentSoft: "#dfe8d0",
  },
  {
    name: "classique",
    label: "Classique",
    ocean: "#3f7ea6",
    oceanDeep: "#1e4d6b",
    text: "#1f2937",
    landPalette: ["#f1e3c6", "#d9bb84", "#c99a5b", "#a97c50", "#8c6239"],
    landBorder: "#5c4326",
    hover: "#ffd166",
    found: "#2f9e44",
    wrong: "#e63946",
    pin: "#7c3aed",
    surface: "#ffffff",
    surfaceText: "#1f2937",
    surfaceMuted: "#6b7280",
    surfaceBorder: "#e5e7eb",
    accent: "#6366f1",
    accentText: "#ffffff",
    accentSoft: "#e0e7ff",
  },
  {
    name: "sombre",
    label: "Sombre",
    ocean: "#0b1220",
    oceanDeep: "#02040a",
    text: "#e2e8f0",
    landPalette: ["#3a4a5c", "#4b5b6e", "#2d3b4a", "#55606e", "#263140"],
    landBorder: "#05080d",
    hover: "#7dd3fc",
    found: "#34d399",
    wrong: "#f87171",
    pin: "#fbbf24",
    surface: "#111827",
    surfaceText: "#e2e8f0",
    surfaceMuted: "#94a3b8",
    surfaceBorder: "#1f2937",
    accent: "#7dd3fc",
    accentText: "#0b1220",
    accentSoft: "#1e3a4f",
  },
  {
    name: "pastel",
    label: "Pastel",
    ocean: "#a9d6e5",
    oceanDeep: "#7fb8cf",
    text: "#1f2937",
    landPalette: ["#ffd6e0", "#d0f0c0", "#fff3b0", "#d7c0f0", "#ffe0b3"],
    landBorder: "#b8b8b8",
    hover: "#ff8fa3",
    found: "#6bcf7f",
    wrong: "#ff6b6b",
    pin: "#5b5fc7",
    surface: "#fff8fb",
    surfaceText: "#1f2937",
    surfaceMuted: "#8a7f99",
    surfaceBorder: "#f0d9e4",
    accent: "#5b5fc7",
    accentText: "#ffffff",
    accentSoft: "#e6e6fa",
  },
];

// Variables CSS pour propager le thème aux composants d'interface (menus,
// modale, cartes flottantes) qui vivent sous ce noeud, via `var(--nom)`
// dans leurs styles SCSS.
export function themeCssVars(theme: Theme): CSSProperties {
  return {
    "--theme-surface": theme.surface,
    "--theme-surface-text": theme.surfaceText,
    "--theme-surface-muted": theme.surfaceMuted,
    "--theme-surface-border": theme.surfaceBorder,
    "--theme-accent": theme.accent,
    "--theme-accent-text": theme.accentText,
    "--theme-accent-soft": theme.accentSoft,
  } as CSSProperties;
}
