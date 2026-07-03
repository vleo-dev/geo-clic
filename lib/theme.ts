// lib/theme.ts

export type Theme = {
  name: string;
  label: string;
  ocean: string;
  oceanDeep: string;
  text: string;
  landPalette: [string, string, string, string, string];
  landBorder: string;
  hover: string;
  found: string;
  wrong: string;
  pin: string;
};

export const THEMES: Theme[] = [
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
  },
];
