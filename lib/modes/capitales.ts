// lib/modes/capitales.ts

import { COUNTRY_CONTINENT } from "@/lib/continents";
import { getCountryInfo } from "@/lib/countryInfo";
import { CAPITALS } from "@/lib/capitals";
import { loadWorldCountries } from "./shared";
import type { ModeData, ModeMarker } from "./types";

export async function loadCapitalesMode(): Promise<ModeData> {
  // Même fond de carte que le mode "pays" — c'est le clic sur le pays qui
  // fait foi, les pins ne sont qu'un repère visuel montrant la capitale.
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
    polygonsClickable: true,
    markersClickable: false,
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
