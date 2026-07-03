"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import { geoCentroid } from "d3-geo";
import { feature, neighbors } from "topojson-client";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import { THEMES } from "@/lib/theme";
import { assignMapColors } from "@/lib/mapColoring";
import { haversineDistance, getFeedback, FeedbackLevel } from "@/lib/geo";
import { MICRO_STATES } from "@/lib/microStates";
import { COUNTRY_CONTINENT } from "@/lib/continents";
import { Difficulty, DIFFICULTY_LIVES } from "@/lib/difficulty";
import { Zone } from "@/lib/zones";
import BurgerMenu from "@/components/BurgerMenu";
import CountryCard from "@/components/CountryCard";
import SettingsMenu from "@/components/SettingsMenu";
import styles from "./page.module.scss";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

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
  const [difficulty, setDifficulty] = useState<Difficulty>("moyen");
  const [zone, setZone] = useState<Zone>("ALL");
  const maxLives = DIFFICULTY_LIVES[difficulty];

  const [lives, setLives] = useState(maxLives);
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
  const [feedbackKey, setFeedbackKey] = useState(0);
  const theme = THEMES[themeIndex];

  const activeNames = useMemo(
    () =>
      zone === "ALL"
        ? allNames
        : allNames.filter((name) => COUNTRY_CONTINENT[name] === zone),
    [allNames, zone],
  );

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

        MICRO_STATES.forEach((micro) => {
          map[micro.name] = micro.coordinates;
          names.push(micro.name);
        });

        const adjacency = neighbors(rawGeometries);
        const colorIndices = assignMapColors(adjacency, LAND_COLOR_COUNT);
        const colorMap: Record<string, number> = {};
        featureCollection.features.forEach((geo, i) => {
          colorMap[geo.properties.name] = colorIndices[i];
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

  function startNewGame(names: string[], newMaxLives: number) {
    setFound(new Set());
    setFeedback(null);
    setGameOver(false);
    setLives(newMaxLives);
    setTarget(names.length > 0 ? pickRandom(names) : null);
  }

  function handleDifficultyChange(next: Difficulty) {
    setDifficulty(next);
    startNewGame(activeNames, DIFFICULTY_LIVES[next]);
  }

  function handleZoneChange(next: Zone) {
    setZone(next);
    const nextNames =
      next === "ALL"
        ? allNames
        : allNames.filter((name) => COUNTRY_CONTINENT[name] === next);
    startNewGame(nextNames, maxLives);
  }

  function handleCountryClick(
    name: string,
    coordinates: [number, number],
  ) {
    if (!target || gameOver) return;

    if (name === target) {
      const newFound = new Set(found);
      newFound.add(target);
      setFound(newFound);
      setFeedback(null);
      pickNewTarget(newFound, activeNames);
      return;
    }

    const distance = haversineDistance(coordinates, centroids[target]);
    const level = getFeedback(distance);
    setFeedback(level);
    setFeedbackKey((k) => k + 1);

    const newLives = lives - 1;
    setLives(newLives);
    if (newLives <= 0) setGameOver(true);
  }

  return (
    <main
      className={styles.main}
      style={{
        backgroundImage: `linear-gradient(160deg, ${theme.ocean}, ${theme.oceanDeep})`,
        color: theme.text,
      }}
    >
      <BurgerMenu themeIndex={themeIndex} onThemeChange={setThemeIndex} />
      <SettingsMenu
        difficulty={difficulty}
        onDifficultyChange={handleDifficultyChange}
        zone={zone}
        onZoneChange={handleZoneChange}
      />

      <CountryCard
        lives={lives}
        maxLives={maxLives}
        target={target}
        gameOver={gameOver}
        foundCount={found.size}
        feedback={feedback}
        feedbackKey={feedbackKey}
      />

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
                        onClick={() =>
                          handleCountryClick(
                            name,
                            geoCentroid(geo) as [number, number],
                          )
                        }
                        style={{
                          default: {
                            fill: isFound
                              ? theme.found
                              : theme.landPalette[
                                  countryColorIndex[name] ?? 0
                                ],
                            stroke: theme.landBorder,
                            strokeWidth: 0.25,
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

              {MICRO_STATES.map((micro) => {
                const isFound = found.has(micro.name);
                return (
                  <Marker
                    key={micro.name}
                    coordinates={micro.coordinates}
                    onClick={() =>
                      handleCountryClick(micro.name, micro.coordinates)
                    }
                  >
                    <circle
                      r={1.6}
                      fill={isFound ? theme.found : theme.pin}
                      fillOpacity={0.55}
                      stroke="#ffffff"
                      strokeWidth={0.3}
                      style={{ cursor: "pointer" }}
                    />
                  </Marker>
                );
              })}
            </ZoomableGroup>
          </ComposableMap>
        )}
      </div>
    </main>
  );
}
