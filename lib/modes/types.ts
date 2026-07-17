// lib/modes/types.ts

import type { FeatureCollection, Geometry } from "geojson";
import type { GeoProjection } from "d3-geo";
import type { ContinentCode } from "@/lib/continents";

export type RegionProperties = { name: string };
export type RegionFeatureCollection = FeatureCollection<
  Geometry,
  RegionProperties
>;

export type ModeMarker = { name: string; coordinates: [number, number] };

export type ModeLabel = { title: string; flag?: string };

// Vue cartographique dédiée à un mode régional (France, USA...) : une
// projection déjà cadrée sur la zone (via fitSize) plutôt que la
// projection "monde" par défaut, sans quoi la zone apparaît minuscule et
// mal centrée (cadrée pour la Terre entière, pas pour un seul pays).
export type MapView = {
  projection: (width: number, height: number) => GeoProjection;
  width: number;
  height: number;
};

export type ModeData = {
  // Fond de carte (polygones). Null si le mode n'affiche pas de fond
  // (aucun cas actuellement, gardé pour extensibilité).
  geoData: RegionFeatureCollection | null;
  // Couleur (index dans la palette du thème) par nom de polygone.
  colorIndex: Record<string, number>;
  // Pins affichés en plus des polygones (micro-États en mode "pays",
  // capitales en mode "capitales"). Tableau vide si le mode n'utilise que
  // les polygones.
  markers: ModeMarker[];
  // Cliquer un polygone compte-t-il comme une tentative ?
  polygonsClickable: boolean;
  // Cliquer un pin compte-t-il comme une tentative ? Vrai pour les
  // micro-États (mode "pays", trop petits pour être cliqués via leur
  // polygone), faux pour les pins capitales (mode "capitales") qui ne sont
  // qu'un repère visuel discret — c'est le pays qui fait foi.
  markersClickable: boolean;
  // Pool complet des cibles (clés dans centroids).
  names: string[];
  // Coordonnées utilisées pour la distance chaud/froid et la position des
  // pins — pas nécessairement le centroïde géométrique du polygone (ex:
  // en mode "capitales", ce sont les coordonnées de la capitale).
  centroids: Record<string, [number, number]>;
  // Continent d'une cible, pour le filtre Zone. Undefined si le mode ne
  // supporte pas la zone (cf. MODE_SUPPORTS_ZONE).
  zoneOf?: (name: string) => ContinentCode | undefined;
  getLabel: (name: string) => ModeLabel;
  // Absent pour les modes "monde" (pays/capitales), qui utilisent la
  // projection par défaut de ComposableMap (geoEqualEarth, vue globale).
  mapView?: MapView;
};
