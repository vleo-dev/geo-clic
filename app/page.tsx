"use client";

import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { COLORS } from "@/lib/theme";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export default function Home() {
  return (
    <main
      style={{
        display: "flex",
        justifyContent: "center",
        padding: "2rem",
        backgroundColor: COLORS.ocean,
      }}
    >
      <ComposableMap projectionConfig={{ scale: 147 }}>
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                onClick={() => {
                  console.log(geo.properties.name);
                }}
                style={{
                  default: {
                    fill: COLORS.land,
                    stroke: COLORS.landBorder,
                    strokeWidth: 0.5,
                    outline: "none",
                  },
                  hover: {
                    fill: COLORS.hover,
                    outline: "none",
                    cursor: "pointer",
                  },
                  pressed: {
                    fill: COLORS.pressed,
                    outline: "none",
                  },
                }}
              />
            ))
          }
        </Geographies>
      </ComposableMap>
    </main>
  );
}
