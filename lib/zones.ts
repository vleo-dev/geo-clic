// lib/zones.ts

import { ContinentCode } from "./continents";

export const CONTINENTS: ContinentCode[] = [
  "EU",
  "AS",
  "AF",
  "NA",
  "SA",
  "OC",
  "AN",
];

export const CONTINENT_LABELS: Record<ContinentCode, string> = {
  EU: "Europe",
  AS: "Asie",
  AF: "Afrique",
  NA: "Amérique du Nord",
  SA: "Amérique du Sud",
  OC: "Océanie",
  AN: "Antarctique",
};

// Une sélection vide = aucune restriction (monde entier).
export type ZoneSelection = ContinentCode[];

export function formatZoneSelection(zones: ZoneSelection): string {
  if (zones.length === 0) return "Monde entier";
  return zones.map((z) => CONTINENT_LABELS[z]).join(", ");
}

export function zoneSelectionToStorage(zones: ZoneSelection): string {
  return zones.length === 0 ? "ALL" : zones.join(",");
}

export function zoneSelectionFromStorage(value: string): ZoneSelection {
  if (value === "ALL" || value === "") return [];
  return value
    .split(",")
    .filter((v): v is ContinentCode => CONTINENTS.includes(v as ContinentCode));
}
