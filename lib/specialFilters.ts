// lib/specialFilters.ts

export type SpecialFilter = "none" | "landlocked" | "island";

export const SPECIAL_FILTERS: SpecialFilter[] = ["none", "landlocked", "island"];

export const SPECIAL_FILTER_LABELS: Record<SpecialFilter, string> = {
  none: "Aucun filtre",
  landlocked: "Pays enclavés",
  island: "Îles",
};
