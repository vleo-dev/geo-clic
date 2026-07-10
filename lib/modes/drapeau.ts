// lib/modes/drapeau.ts
//
// Même carte et mêmes cibles que le mode "pays" (clic sur le pays sur la
// carte), mais la carte flottante n'affiche que le drapeau, sans le nom.

import { getCountryInfo } from "@/lib/countryInfo";
import { loadPaysMode } from "./pays";
import type { ModeData } from "./types";

export async function loadDrapeauMode(): Promise<ModeData> {
  const data = await loadPaysMode();

  return {
    ...data,
    getLabel: (name) => ({ title: "", flag: getCountryInfo(name).flag }),
  };
}
