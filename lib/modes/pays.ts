// lib/modes/pays.ts

import { MICRO_STATES } from "@/lib/microStates";
import { COUNTRY_CONTINENT } from "@/lib/continents";
import { getCountryInfo } from "@/lib/countryInfo";
import { loadWorldCountries } from "./shared";
import type { ModeData } from "./types";

export async function loadPaysMode(): Promise<ModeData> {
  const { geoData, colorIndex, countryCentroids, countryNames } =
    await loadWorldCountries();

  const centroids: Record<string, [number, number]> = { ...countryCentroids };
  const names: string[] = [...countryNames];

  MICRO_STATES.forEach((micro) => {
    centroids[micro.name] = micro.coordinates;
    names.push(micro.name);
  });

  return {
    geoData,
    colorIndex,
    markers: MICRO_STATES,
    polygonsClickable: true,
    markersClickable: true,
    names,
    centroids,
    zoneOf: (name) => COUNTRY_CONTINENT[name],
    getLabel: (name) => {
      const info = getCountryInfo(name);
      return { title: info.fr, flag: info.flag };
    },
  };
}
