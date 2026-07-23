"use client";

import { useEffect, useMemo, useRef, useState, type ComponentProps, type ForwardRefExoticComponent, type RefAttributes } from "react";
import { useSession } from "next-auth/react";
import type { Session } from "next-auth";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import type { ProjectionFunction } from "react-simple-maps";
import { geoCentroid } from "d3-geo";
import type { Feature, Geometry } from "geojson";
import {
  Theme,
  THEMES,
  themeCssVars,
  useThemeIndex,
  saveThemeIndex,
} from "@/lib/theme";
import {
  haversineDistance,
  computeFeedbackThresholds,
  getFeedback,
  FeedbackLevel,
} from "@/lib/geo";
import {
  playFoundSound,
  playErrorSound,
  playGameOverSound,
  useSoundEnabled,
  saveSoundEnabled,
} from "@/lib/sound";
import {
  GameModeId,
  MODE_SUPPORTS_ZONE,
  MODE_UNIT_LABEL,
} from "@/lib/gameModes";
import { loadModeData, ModeData, ModeLabel } from "@/lib/modes";
import { ZoneSelection, zoneSelectionToStorage } from "@/lib/zones";
import { SpecialFilter } from "@/lib/specialFilters";
import { LANDLOCKED_COUNTRIES, ISLAND_COUNTRIES } from "@/lib/countryTraits";
import GameSetupModal from "@/components/GameSetupModal";
import CountryCard from "@/components/CountryCard";
import Thermometer from "@/components/Thermometer";
import FoundPuff from "@/components/FoundPuff";
import AnecdoteToast from "@/components/AnecdoteToast";
import SettingsMenu from "@/components/SettingsMenu";
import AccountButton from "@/components/AccountButton";
import styles from "./page.module.scss";

type RegionProperties = { name: string };
type Region = Feature<Geometry, RegionProperties>;

// @types/react-simple-maps déclare ComposableMap comme un simple
// FunctionComponent alors qu'il forwarde bien un ref vers le <svg> racine
// à l'exécution — on corrige le type pour pouvoir s'en servir.
const MapSvg = ComposableMap as unknown as ForwardRefExoticComponent<
  ComponentProps<typeof ComposableMap> & RefAttributes<SVGSVGElement>
>;

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

function filterNames(
  modeData: ModeData,
  mode: GameModeId,
  zones: ZoneSelection,
  specialFilter: SpecialFilter,
): string[] {
  if (!MODE_SUPPORTS_ZONE[mode]) return modeData.names;

  return modeData.names.filter((name) => {
    const continent = modeData.zoneOf?.(name);
    if (zones.length > 0 && (!continent || !zones.includes(continent))) {
      return false;
    }
    if (specialFilter === "landlocked" && !LANDLOCKED_COUNTRIES.has(name)) {
      return false;
    }
    if (specialFilter === "island" && !ISLAND_COUNTRIES.has(name)) {
      return false;
    }
    return true;
  });
}

type GamePlayProps = {
  modeData: ModeData;
  mode: GameModeId;
  names: string[];
  zoneStorage: string;
  suddenDeath: boolean;
  anecdotesEnabled: boolean;
  session: Session | null;
  theme: Theme;
};

// Une partie = un montage de GamePlay. Changer de mode, de zone, de filtre
// spécial ou de mort subite change la `key` côté parent, ce qui démonte/
// remonte ce composant et réinitialise tout son état d'un coup — plus
// simple et plus sûr qu'un effet qui resynchronise manuellement chaque
// morceau d'état.
function GamePlay({
  modeData,
  mode,
  names,
  zoneStorage,
  suddenDeath,
  anecdotesEnabled,
  session,
  theme,
}: GamePlayProps) {
  const [found, setFound] = useState<Set<string>>(new Set());
  const [skipped, setSkipped] = useState<Set<string>>(new Set());
  const [wrongClicks, setWrongClicks] = useState<Set<string>>(new Set());
  const [puff, setPuff] = useState<{
    coordinates: [number, number];
    key: number;
  } | null>(null);
  const puffKeyRef = useRef(0);
  const [anecdote, setAnecdote] = useState<{
    text: string;
    label: ModeLabel;
  } | null>(null);
  const anecdoteRequestRef = useRef(0);
  const [errors, setErrors] = useState(0);
  const [target, setTarget] = useState<string | null>(() =>
    names.length > 0 ? pickRandom(names) : null,
  );
  const [feedback, setFeedback] = useState<FeedbackLevel | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [feedbackKey, setFeedbackKey] = useState(0);
  const [gameStartedAt] = useState(() => Date.now());
  const gameRecordedRef = useRef(false);
  const score = found.size - skipped.size;

  // react-simple-maps attend, quand `projection` est une fonction, une
  // instance de projection d3-geo déjà construite (elle est elle-même
  // `typeof === "function"`) — pas une factory à appeler avec width/height.
  const mapWidth = modeData.mapView?.width ?? 800;
  const mapHeight = modeData.mapView?.height ?? 395;
  const projection = useMemo(
    () => modeData.mapView?.projection(mapWidth, mapHeight),
    [modeData, mapWidth, mapHeight],
  );

  // Seuils chaud/froid calibrés sur l'ensemble complet du mode (tous les
  // pays du monde, tous les départements...), pas sur la zone/le filtre
  // actif : des seuils fixes (calibrés sur les distances "monde") rendraient
  // le feedback inutilisable sur une carte resserrée (départements, États
  // américains), mais les recalibrer sur une zone déjà restreinte (ex.
  // "Europe" seule) resserre la distribution au point qu'un pays frontalier
  // (ex. Norvège pour Suède, ~473km) tombe sous "Tiède" au lieu de
  // "Brûlant" — l'échelle doit refléter la carte, pas le sous-ensemble de
  // cibles tirées dessus.
  const feedbackThresholds = useMemo(
    () => computeFeedbackThresholds(modeData.centroids, modeData.names),
    [modeData],
  );

  useEffect(() => {
    if (gameOver) playGameOverSound();
  }, [gameOver]);

  useEffect(() => {
    if (!puff) return;
    const timer = setTimeout(() => setPuff(null), 750);
    return () => clearTimeout(timer);
  }, [puff]);

  useEffect(() => {
    if (!anecdote) return;
    const timer = setTimeout(() => setAnecdote(null), 6000);
    return () => clearTimeout(timer);
  }, [anecdote]);

  useEffect(() => {
    if (!gameOver || !session?.user || gameRecordedRef.current) return;
    gameRecordedRef.current = true;

    const durationSeconds = Math.round((Date.now() - gameStartedAt) / 1000);
    fetch("/api/games", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        score,
        total: names.length,
        errors,
        mode,
        zone: zoneStorage,
        durationSeconds,
      }),
    });
  }, [gameOver, session, score, errors, mode, zoneStorage, gameStartedAt, names]);

  // Marque `revealed` comme traité (colorié, exclu des prochains tirages) et
  // passe à la cible suivante, ou termine la partie s'il n'en reste plus.
  function advance(revealed: string) {
    const newFound = new Set(found);
    newFound.add(revealed);
    setFound(newFound);
    setFeedback(null);
    setWrongClicks(new Set());
    const next = pickNextTarget(newFound, names);
    if (next === null) {
      setGameOver(true);
      setTarget(null);
    } else {
      setTarget(next);
    }
  }

  // Affiche une anecdote sur le pays qu'on vient de trouver, piochée en BDD
  // (jamais d'appel à l'API Anthropic pendant la partie). `requestId` évite
  // qu'une réponse en retard n'écrase l'anecdote d'une cible trouvée plus
  // récemment si le joueur enchaîne vite les bonnes réponses.
  function fetchAnecdote(country: string) {
    setAnecdote(null);
    const requestId = ++anecdoteRequestRef.current;
    const foundLabel = modeData.getLabel(country);
    fetch(`/api/anecdotes?country=${encodeURIComponent(country)}`)
      .then((res) => res.json())
      .then((data: { anecdote?: string | null }) => {
        if (requestId !== anecdoteRequestRef.current || !data.anecdote) return;
        setAnecdote({ text: data.anecdote, label: foundLabel });
      })
      .catch(() => {});
  }

  function handleTargetClick(name: string, coordinates: [number, number]) {
    if (!target || gameOver) return;

    if (name === target) {
      playFoundSound();
      puffKeyRef.current += 1;
      setPuff({ coordinates, key: puffKeyRef.current });
      if (anecdotesEnabled) fetchAnecdote(target);
      advance(target);
      return;
    }

    const distance = haversineDistance(coordinates, modeData.centroids[target]);
    const level = getFeedback(distance, feedbackThresholds);
    setFeedback(level);
    setFeedbackKey((k) => k + 1);
    setErrors((e) => e + 1);
    setWrongClicks((prev) => new Set(prev).add(name));
    playErrorSound();
    if (suddenDeath) setGameOver(true);
  }

  function handlePass() {
    if (!target || gameOver) return;
    setSkipped((prev) => new Set(prev).add(target));
    advance(target);
  }

  // Chrome laisse parfois un bitmap flou du <svg> zoomé tant qu'aucun
  // nouveau repaint n'est déclenché (le souci disparaît dès qu'on
  // repan/rezoom même légèrement). On force ce repaint nous-mêmes à la fin
  // du geste de zoom/pan via un reflow synchrone (lecture de layout après
  // un toggle display), plutôt que de compter sur l'utilisateur pour bouger
  // la carte une deuxième fois.
  const svgRef = useRef<SVGSVGElement>(null);
  function handleMoveEnd() {
    requestAnimationFrame(() => {
      const el = svgRef.current;
      if (!el) return;
      el.style.display = "none";
      void el.getBoundingClientRect();
      el.style.display = "";
    });
  }

  const label = target ? modeData.getLabel(target) : null;

  return (
    <>
      <CountryCard
        target={target}
        label={label}
        gameOver={gameOver}
        score={score}
        unitLabel={MODE_UNIT_LABEL[mode]}
        onPass={handlePass}
      />
      <Thermometer
        feedback={gameOver ? null : feedback}
        feedbackKey={feedbackKey}
      />
      <AnecdoteToast anecdote={anecdote} />

      {modeData.geoData && (
        <MapSvg
          ref={svgRef}
          width={mapWidth}
          height={mapHeight}
          projection={
            // react-simple-maps utilise la valeur telle quelle quand
            // `projection` est une fonction (elle n'est pas appelée) — on
            // lui passe donc directement l'instance de projection d3-geo
            // déjà construite via `fitSize`, malgré le typage de la lib
            // qui suggère (à tort) une factory (width, height) => projection.
            projection
              ? (projection as unknown as ProjectionFunction)
              : "geoEqualEarth"
          }
          projectionConfig={projection ? undefined : { scale: 147 }}
          preserveAspectRatio="xMidYMid slice"
        >
          <ZoomableGroup onMoveEnd={handleMoveEnd}>
            <Geographies geography={modeData.geoData}>
              {({
                geographies,
              }: {
                geographies: Array<Region & { rsmKey: string }>;
              }) =>
                geographies.map((geo) => {
                  const name = geo.properties.name;
                  const isFound = found.has(name);
                  const isWrong = wrongClicks.has(name);
                  const clickable = modeData.polygonsClickable;
                  const baseFill =
                    theme.landPalette[modeData.colorIndex[name] ?? 0];
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onClick={
                        clickable
                          ? () =>
                              handleTargetClick(
                                name,
                                geoCentroid(geo) as [number, number],
                              )
                          : undefined
                      }
                      style={{
                        default: {
                          fill: isFound
                            ? theme.found
                            : isWrong
                              ? theme.wrong
                              : baseFill,
                          fillOpacity: isWrong ? 0.6 : 1,
                          stroke: "none",
                          outline: "none",
                        },
                        hover: {
                          fill: isFound
                            ? theme.found
                            : isWrong
                              ? theme.wrong
                              : clickable
                                ? theme.hover
                                : baseFill,
                          fillOpacity: isWrong ? 0.75 : 1,
                          outline: "none",
                          cursor: clickable ? "pointer" : "default",
                        },
                        pressed: {
                          fill: clickable ? theme.found : baseFill,
                          outline: "none",
                        },
                      }}
                    />
                  );
                })
              }
            </Geographies>

            {modeData.markers.map((marker) => {
              const isFound = found.has(marker.name);

              // Pin décoratif (ex: capitales) : simple repère visuel, pas de
              // cible en soi — c'est le clic sur le pays qui fait foi, donc
              // ni onClick ni curseur pointeur, et un style discret qui ne
              // laisse pas croire qu'il est cliquable.
              if (!modeData.markersClickable) {
                return (
                  <Marker key={marker.name} coordinates={marker.coordinates}>
                    <circle
                      r={0.85}
                      fill={isFound ? theme.found : "rgba(255, 255, 255, 0.55)"}
                      stroke="rgba(0, 0, 0, 0.35)"
                      strokeWidth={0.18}
                      style={{ pointerEvents: "none" }}
                    />
                  </Marker>
                );
              }

              const isWrong = wrongClicks.has(marker.name);
              return (
                <Marker
                  key={marker.name}
                  coordinates={marker.coordinates}
                  onClick={() =>
                    handleTargetClick(marker.name, marker.coordinates)
                  }
                >
                  <circle
                    r={1.6}
                    fill={isFound ? theme.found : isWrong ? theme.wrong : theme.pin}
                    fillOpacity={isWrong ? 0.8 : 0.55}
                    stroke="#ffffff"
                    strokeWidth={0.3}
                    style={{ cursor: "pointer" }}
                  />
                </Marker>
              );
            })}

            {puff && (
              <Marker key={puff.key} coordinates={puff.coordinates}>
                <FoundPuff />
              </Marker>
            )}
          </ZoomableGroup>
        </MapSvg>
      )}
    </>
  );
}

export default function Home() {
  const [mode, setMode] = useState<GameModeId>("pays");
  const [selectedZones, setSelectedZones] = useState<ZoneSelection>([]);
  const [specialFilter, setSpecialFilter] = useState<SpecialFilter>("none");
  const [suddenDeath, setSuddenDeath] = useState(false);
  const [anecdotesEnabled, setAnecdotesEnabled] = useState(true);
  const [setupOpen, setSetupOpen] = useState(true);
  const themeIndex = useThemeIndex();
  const theme = THEMES[themeIndex];
  const soundEnabled = useSoundEnabled();

  const [modeDataEntry, setModeDataEntry] = useState<{
    mode: GameModeId;
    data: ModeData;
  } | null>(null);

  const { data: session } = useSession();

  // Ignore les données encore en cache pendant le chargement d'un nouveau
  // mode, pour ne pas afficher un fond de carte incohérent avec `mode`.
  const modeData = modeDataEntry?.mode === mode ? modeDataEntry.data : null;

  useEffect(() => {
    let cancelled = false;
    loadModeData(mode).then((data) => {
      if (!cancelled) setModeDataEntry({ mode, data });
    });
    return () => {
      cancelled = true;
    };
  }, [mode]);

  const activeNames = useMemo(
    () =>
      modeData ? filterNames(modeData, mode, selectedZones, specialFilter) : [],
    [modeData, mode, selectedZones, specialFilter],
  );

  const zoneStorage = zoneSelectionToStorage(selectedZones);
  const gameKey = `${mode}|${selectedZones.join(",")}|${specialFilter}|${suddenDeath}`;

  return (
    <main
      className={styles.main}
      style={{
        ...themeCssVars(theme),
        backgroundImage: `linear-gradient(160deg, ${theme.ocean}, ${theme.oceanDeep})`,
        color: theme.text,
      }}
    >
      <button
        type="button"
        className={styles.setupButton}
        onClick={() => setSetupOpen(true)}
        aria-label="Configuration de la partie"
      >
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
      </button>

      <GameSetupModal
        open={setupOpen}
        onClose={() => setSetupOpen(false)}
        mode={mode}
        onModeChange={setMode}
        selectedZones={selectedZones}
        onZonesChange={setSelectedZones}
        specialFilter={specialFilter}
        onSpecialFilterChange={setSpecialFilter}
        suddenDeath={suddenDeath}
        onSuddenDeathChange={setSuddenDeath}
        anecdotesEnabled={anecdotesEnabled}
        onAnecdotesEnabledChange={setAnecdotesEnabled}
      />

      <SettingsMenu
        themeIndex={themeIndex}
        onThemeChange={saveThemeIndex}
        soundEnabled={soundEnabled}
        onSoundEnabledChange={saveSoundEnabled}
      />
      <AccountButton />

      <div className={styles.mapWrapper}>
        {modeData && (
          <GamePlay
            key={gameKey}
            modeData={modeData}
            mode={mode}
            names={activeNames}
            zoneStorage={zoneStorage}
            suddenDeath={suddenDeath}
            anecdotesEnabled={anecdotesEnabled}
            session={session}
            theme={theme}
          />
        )}
      </div>
    </main>
  );
}
