// lib/zones.ts

import { ContinentCode } from "./continents";

export type Zone = ContinentCode | "ALL";

export const ZONES: Zone[] = ["ALL", "EU", "AS", "AF", "NA", "SA", "OC", "AN"];

export const ZONE_LABELS: Record<Zone, string> = {
  ALL: "Monde entier",
  EU: "Europe",
  AS: "Asie",
  AF: "Afrique",
  NA: "Amérique du Nord",
  SA: "Amérique du Sud",
  OC: "Océanie",
  AN: "Antarctique",
};
