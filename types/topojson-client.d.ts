declare module "topojson-client" {
  import type { FeatureCollection, GeoJsonProperties, Geometry } from "geojson";

  export function feature(
    topology: unknown,
    object: unknown,
  ): FeatureCollection<Geometry, GeoJsonProperties>;

  export function neighbors(objects: unknown[]): number[][];
}
