"use client";

import { useEffect, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { geoCentroid } from "d3-geo";
import { feature, neighbors } from "topojson-client";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import { THEMES } from "@/lib/theme";
import { assignMapColors } from "@/lib/mapColoring";
import { haversineDistance, getFeedback, FeedbackLevel } from "@/lib/geo";
import BurgerMenu from "@/components/BurgerMenu";
import styles from "./page.module.scss";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const MAX_LIVES = 10;
const LAND_COLOR_COUNT = 5;

type CountryProperties = { name: string };
type Country = Feature<Geometry, CountryProperties>;
type TopologyObject = { type: string; geometries?: unknown[] };
type Topology = { objects: Record<string, TopologyObject> };

function pickRandom(names: string[]): string {
  return names[Math.floor(Math.random() * names.length)];
}

function pickNextTarget(
  excluding: Set<string>,
  names: string[],
): string | null {
  const remaining = names.filter((n) => !excluding.has(n));
  if (remaining.length === 0) return null;
  return pickRandom(remaining);
}

export default function Home() {
  const [lives, setLives] = useState(MAX_LIVES);
  const [found, setFound] = useState<Set<string>>(new Set());
  const [target, setTarget] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackLevel | null>(null);
  const [allNames, setAllNames] = useState<string[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [centroids, setCentroids] = useState<Record<string, [number, number]>>(
    {},
  );
  const [geoData, setGeoData] = useState<FeatureCollection<
    Geometry,
    CountryProperties
  > | null>(null);
  const [countryColorIndex, setCountryColorIndex] = useState<
    Record<string, number>
  >({});
  const [themeIndex, setThemeIndex] = useState(0);
  const theme = THEMES[themeIndex];

  useEffect(() => {
    fetch(geoUrl)
      .then((res) => res.json())
      .then((topology: Topology) => {
        const objectKey = Object.keys(topology.objects)[0];
        const rawGeometries = topology.objects[objectKey].geometries ?? [];
        const featureCollection = feature(
          topology,
          topology.objects[objectKey],
        ) as FeatureCollection<Geometry, CountryProperties>;

        const map: Record<string, [number, number]> = {};
        const names: string[] = [];

        featureCollection.features.forEach((geo) => {
          const name = geo.properties.name;
          map[name] = geoCentroid(geo) as [number, number];
          names.push(name);
        });

        const adjacency = neighbors(rawGeometries);
        const colorIndices = assignMapColors(adjacency, LAND_COLOR_COUNT);
        const colorMap: Record<string, number> = {};
        names.forEach((name, i) => {
          colorMap[name] = colorIndices[i];
        });

        setGeoData(featureCollection);
        setCentroids(map);
        setAllNames(names);
        setCountryColorIndex(colorMap);
        setTarget(pickRandom(names));
      });
  }, []);

  function pickNewTarget(excluding: Set<string>, names: string[]) {
    const next = pickNextTarget(excluding, names);
    if (next === null) {
      setGameOver(true);
      setTarget(null);
      return;
    }
    setTarget(next);
  }

  function handleCountryClick(geo: Country) {
    if (!target || gameOver) return;

    const clickedName = geo.properties.name;

    if (clickedName === target) {
      const newFound = new Set(found);
      newFound.add(target);
      setFound(newFound);
      setFeedback(null);
      pickNewTarget(newFound, allNames);
      return;
    }

    const distance = haversineDistance(
      geoCentroid(geo) as [number, number],
      centroids[target],
    );
    const level = getFeedback(distance);
    setFeedback(level);

    const newLives = lives - 1;
    setLives(newLives);
    if (newLives <= 0) setGameOver(true);
  }

  return (
    <main
      className={styles.main}
      style={{ backgroundColor: theme.ocean, color: theme.text }}
    >
      <BurgerMenu themeIndex={themeIndex} onThemeChange={setThemeIndex} />

      <div className={styles.header}>
        <div className={styles.lives}>
          {"❤️".repeat(lives)}
          {"🖤".repeat(MAX_LIVES - lives)}
        </div>

        {!gameOver ? (
          <h2 className={styles.target}>
            Trouve : <strong>{target}</strong>
          </h2>
        ) : (
          <h2 className={styles.target}>
            Partie terminée ! Score : {found.size} pays trouvés
          </h2>
        )}

        {feedback && !gameOver && (
          <div className={styles.feedback}>
            <div
              className={styles.feedbackLabel}
              style={{ color: feedback.color }}
            >
              {feedback.emoji} {feedback.label}
            </div>
            <div className={styles.gaugeTrack}>
              <div
                className={styles.gaugeFill}
                style={{
                  width: `${feedback.gaugePercent}%`,
                  backgroundColor: feedback.color,
                }}
              />
            </div>
          </div>
        )}
      </div>

      <div className={styles.mapWrapper}>
        {geoData && (
          <ComposableMap
            width={800}
            height={395}
            projectionConfig={{ scale: 147 }}
            preserveAspectRatio="xMidYMid slice"
          >
            <ZoomableGroup>
              <Geographies geography={geoData}>
                {({ geographies }: { geographies: Array<Country & { rsmKey: string }> }) =>
                  geographies.map((geo) => {
                    const name = geo.properties.name;
                    const isFound = found.has(name);
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        onClick={() => handleCountryClick(geo)}
                        style={{
                          default: {
                            fill: isFound
                              ? theme.found
                              : theme.landPalette[
                                  countryColorIndex[name] ?? 0
                                ],
                            stroke: theme.landBorder,
                            strokeWidth: 0.5,
                            outline: "none",
                          },
                          hover: {
                            fill: isFound ? theme.found : theme.hover,
                            outline: "none",
                            cursor: "pointer",
                          },
                          pressed: {
                            fill: theme.found,
                            outline: "none",
                          },
                        }}
                      />
                    );
                  })
                }
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>
        )}
      </div>
    </main>
  );
}
