// lib/difficulty.ts

export type Difficulty = "facile" | "moyen" | "difficile";

export const DIFFICULTIES: Difficulty[] = ["facile", "moyen", "difficile"];

export const DIFFICULTY_LIVES: Record<Difficulty, number> = {
  facile: 20,
  moyen: 10,
  difficile: 5,
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  facile: "Facile — 20 vies",
  moyen: "Moyen — 10 vies",
  difficile: "Difficile — 5 vies",
};
