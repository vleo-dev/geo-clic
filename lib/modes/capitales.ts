// lib/modes/capitales.ts

import { COUNTRY_CONTINENT } from "@/lib/continents";
import { getCountryInfo } from "@/lib/countryInfo";
import { CAPITALS } from "@/lib/capitals";
import { loadWorldCountries } from "./shared";
import type { ModeData, ModeMarker } from "./types";

export async function loadCapitalesMode(): Promise<ModeData> {
  // Même fond de carte que le mode "pays", uniquement pour le contexte
  // visuel — les polygones ne sont pas cliquables dans ce mode.
  const { geoData, colorIndex } = await loadWorldCountries();

  const centroids: Record<string, [number, number]> = {};
  const names: string[] = [];
  const markers: ModeMarker[] = [];

  Object.entries(CAPITALS).forEach(([countryName, info]) => {
    centroids[countryName] = info.coordinates;
    names.push(countryName);
    markers.push({ name: countryName, coordinates: info.coordinates });
  });

  return {
    geoData,
    colorIndex,
    markers,
    polygonsClickable: false,
    names,
    centroids,
    zoneOf: (name) => COUNTRY_CONTINENT[name],
    getLabel: (name) => {
      const info = getCountryInfo(name);
      const { capital } = CAPITALS[name];
      return { title: `${capital} (${info.fr})`, flag: info.flag };
    },
  };
}
