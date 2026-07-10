declare module "topojson-server" {
  export function topology(
    objects: Record<string, unknown>,
    quantization?: number,
  ): {
    type: "Topology";
    objects: Record<string, { type: string; geometries: unknown[] }>;
    arcs: unknown[];
  };
}
