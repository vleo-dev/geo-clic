// lib/modes/shared.ts
//
// Chargement du fond de carte "pays du monde", partagé entre le mode
// "pays" (cibles = pays) et le mode "capitales" (cibles = capitales, mais
// le même fond de carte sert de contexte visuel).

import { geoCentroid } from "d3-geo";
import { feature, neighbors } from "topojson-client";
import type { FeatureCollection, Geometry } from "geojson";
import { assignMapColors } from "@/lib/mapColoring";
import { MICRO_STATES } from "@/lib/microStates";
import { COUNTRY_INFO } from "@/lib/countryInfo";
import type { RegionFeatureCollection, RegionProperties } from "./types";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json";
const LAND_COLOR_COUNT = 5;

const MICRO_STATE_NAMES = new Set(MICRO_STATES.map((m) => m.name));
const ACCEPTED_COUNTRY_NAMES = new Set(
  Object.keys(COUNTRY_INFO).filter((name) => !MICRO_STATE_NAMES.has(name)),
);

type TopologyGeometry = { properties?: { name?: string } };
type TopologyObject = { type: string; geometries?: TopologyGeometry[] };
type Topology = { objects: Record<string, TopologyObject> };

export type WorldCountries = {
  geoData: RegionFeatureCollection;
  colorIndex: Record<string, number>;
  countryCentroids: Record<string, [number, number]>;
  countryNames: string[];
};

export async function loadWorldCountries(): Promise<WorldCountries> {
  const res = await fetch(geoUrl);
  const topology: Topology = await res.json();

  const objectKey = Object.keys(topology.objects)[0];
  const rawGeometries = (topology.objects[objectKey].geometries ?? []).filter(
    (g) => g.properties?.name && ACCEPTED_COUNTRY_NAMES.has(g.properties.name),
  );
  const featureCollection = feature(topology, {
    type: "GeometryCollection",
    geometries: rawGeometries,
  }) as FeatureCollection<Geometry, RegionProperties>;

  const countryCentroids: Record<string, [number, number]> = {};
  const countryNames: string[] = [];

  featureCollection.features.forEach((geo) => {
    const name = geo.properties.name;
    countryCentroids[name] = geoCentroid(geo) as [number, number];
    countryNames.push(name);
  });

  const adjacency = neighbors(rawGeometries);
  const colorIndices = assignMapColors(adjacency, LAND_COLOR_COUNT);
  const colorIndex: Record<string, number> = {};
  featureCollection.features.forEach((geo, i) => {
    colorIndex[geo.properties.name] = colorIndices[i];
  });

  return {
    geoData: featureCollection,
    colorIndex,
    countryCentroids,
    countryNames,
  };
}
