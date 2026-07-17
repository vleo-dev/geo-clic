// lib/modes/departementsFr.ts

import { geoCentroid, geoMercator } from "d3-geo";
import { feature, neighbors } from "topojson-client";
import { topology } from "topojson-server";
import type { FeatureCollection, Geometry } from "geojson";
import { assignMapColors } from "@/lib/mapColoring";
import type { ModeData, RegionProperties } from "./types";

const geoUrl =
  "https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/departements-version-simplifiee.geojson";

const LAND_COLOR_COUNT = 5;
// Aspect proche de celui de la France métropolitaine (cf. geoBounds), pour
// que la projection cadrée en `fitExtent` remplisse la vue sans grandes
// marges vides.
const MAP_WIDTH = 780;
const MAP_HEIGHT = 750;
// Marge (fraction de chaque dimension) laissée par `fitExtent` de chaque
// côté, pour un zoom initial moins serré que `fitSize` (qui cadre pile).
const FIT_PADDING = 0.09;

type DepartementFeature = {
  type: "Feature";
  properties: { code: string; nom: string };
  geometry: unknown;
};
type DepartementCollection = {
  type: "FeatureCollection";
  features: DepartementFeature[];
};

export async function loadDepartementsFrMode(): Promise<ModeData> {
  const res = await fetch(geoUrl);
  const raw: DepartementCollection = await res.json();

  // Renomme "nom" -> "name" pour matcher RegionProperties, avant de
  // construire une topologie partagée (nécessaire pour l'algorithme de
  // coloration de graphe, qui a besoin d'arcs communs entre départements
  // voisins — un GeoJSON brut n'a pas cette notion).
  const renamed: DepartementCollection = {
    type: "FeatureCollection",
    features: raw.features.map((f) => ({
      ...f,
      properties: { code: f.properties.code, nom: f.properties.nom },
    })),
  };

  const topo = topology({ departements: renamed });
  const rawGeometries = topo.objects.departements.geometries as Array<{
    properties?: { nom?: string };
  }>;

  const featureCollection = feature(topo, topo.objects.departements) as
    FeatureCollection<Geometry, { code: string; nom: string }>;

  const geoData: FeatureCollection<Geometry, RegionProperties> = {
    type: "FeatureCollection",
    features: featureCollection.features.map((f) => ({
      ...f,
      properties: { name: f.properties.nom },
    })),
  };

  const centroids: Record<string, [number, number]> = {};
  const names: string[] = [];
  geoData.features.forEach((geo) => {
    const name = geo.properties.name;
    centroids[name] = geoCentroid(geo) as [number, number];
    names.push(name);
  });

  const adjacency = neighbors(rawGeometries);
  const colorIndices = assignMapColors(adjacency, LAND_COLOR_COUNT);
  const colorIndex: Record<string, number> = {};
  geoData.features.forEach((geo, i) => {
    colorIndex[geo.properties.name] = colorIndices[i];
  });

  return {
    geoData,
    colorIndex,
    markers: [],
    polygonsClickable: true,
    markersClickable: true,
    names,
    centroids,
    getLabel: (name) => ({ title: name }),
    mapView: {
      // `fitExtent` (plutôt que `fitSize` + réduction manuelle du scale)
      // recalcule aussi la translation pour centrer le contenu dans la
      // zone cadrée — sans ça, réduire juste le scale après `fitSize`
      // décale le centre visuel (la France se retrouvait tout au nord).
      projection: (width, height) => {
        const padX = width * FIT_PADDING;
        const padY = height * FIT_PADDING;
        return geoMercator().fitExtent(
          [
            [padX, padY],
            [width - padX, height - padY],
          ],
          geoData,
        );
      },
      width: MAP_WIDTH,
      height: MAP_HEIGHT,
    },
  };
}
