// lib/modes/etatsUs.ts

import { geoCentroid, geoAlbersUsa } from "d3-geo";
import { feature, neighbors } from "topojson-client";
import type { FeatureCollection, Geometry } from "geojson";
import { assignMapColors } from "@/lib/mapColoring";
import { US_STATE_NAMES_FR } from "@/lib/usStates";
import type { ModeData, RegionProperties } from "./types";

const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";
const LAND_COLOR_COUNT = 5;
// geoAlbersUsa (avec Alaska/Hawaï recadrés) a un aspect proche de 1.7:1.
const MAP_WIDTH = 800;
const MAP_HEIGHT = 470;
// Marge (fraction de chaque dimension) laissée par `fitExtent` de chaque
// côté, pour un zoom initial moins serré que `fitSize` (qui cadre pile).
const FIT_PADDING = 0.09;

type TopologyGeometry = { properties?: { name?: string } };
type TopologyObject = { type: string; geometries?: TopologyGeometry[] };
type Topology = { objects: Record<string, TopologyObject> };

export async function loadEtatsUsMode(): Promise<ModeData> {
  const res = await fetch(geoUrl);
  const topo: Topology = await res.json();

  const objectKey = Object.keys(topo.objects)[0];
  const rawGeometries = (topo.objects[objectKey].geometries ?? []).filter(
    (g) => g.properties?.name && US_STATE_NAMES_FR[g.properties.name],
  );

  const featureCollection = feature(topo, {
    type: "GeometryCollection",
    geometries: rawGeometries,
  }) as FeatureCollection<Geometry, RegionProperties>;

  // Les noms français remplacent les noms anglais dès l'extraction, pour
  // que le reste du pipeline (centroïdes, coloration, cibles) travaille
  // directement avec les clés françaises affichées au joueur.
  const geoData: FeatureCollection<Geometry, RegionProperties> = {
    type: "FeatureCollection",
    features: featureCollection.features.map((f) => ({
      ...f,
      properties: { name: US_STATE_NAMES_FR[f.properties.name] },
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
      // décale le centre visuel.
      projection: (width, height) => {
        const padX = width * FIT_PADDING;
        const padY = height * FIT_PADDING;
        return geoAlbersUsa().fitExtent(
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
