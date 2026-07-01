// lib/theme.ts

export type Theme = {
  name: string;
  label: string;
  ocean: string;
  text: string;
  landPalette: [string, string, string, string, string];
  landBorder: string;
  hover: string;
  found: string;
  wrong: string;
};

export const THEMES: Theme[] = [
  {
    name: "classique",
    label: "Classique",
    ocean: "#7ec8e3",
    text: "#1f2937",
    landPalette: ["#e8d5a3", "#d9c189", "#f0e2b8", "#ddb892", "#c9b686"],
    landBorder: "#8a7856",
    hover: "#93c5fd",
    found: "#22c55e",
    wrong: "#ef4444",
  },
  {
    name: "sombre",
    label: "Sombre",
    ocean: "#0f172a",
    text: "#e2e8f0",
    landPalette: ["#334155", "#1e293b", "#3f3f46", "#27272a", "#44403c"],
    landBorder: "#0b1220",
    hover: "#60a5fa",
    found: "#22c55e",
    wrong: "#ef4444",
  },
  {
    name: "pastel",
    label: "Pastel",
    ocean: "#cfe8f3",
    text: "#1f2937",
    landPalette: ["#fde2e4", "#e2ece9", "#fff1c1", "#e0d7f7", "#d7f0d2"],
    landBorder: "#c9c9c9",
    hover: "#ffd6a5",
    found: "#8fd694",
    wrong: "#f28b82",
  },
];
