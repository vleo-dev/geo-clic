// lib/geo.ts

export function haversineDistance(
  [lng1, lat1]: [number, number],
  [lng2, lat2]: [number, number],
): number {
  const R = 6371; // rayon de la Terre en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export type FeedbackLevel = {
  label: string;
  emoji: string;
  color: string;
  gaugePercent: number;
};

const FEEDBACK_TIERS: FeedbackLevel[] = [
  { label: "Brûlant", emoji: "🔥", color: "#ef4444", gaugePercent: 90 },
  { label: "Chaud", emoji: "🌡️", color: "#f97316", gaugePercent: 65 },
  { label: "Tiède", emoji: "🌤️", color: "#eab308", gaugePercent: 45 },
  { label: "Froid", emoji: "❄️", color: "#38bdf8", gaugePercent: 20 },
  { label: "Glacé", emoji: "🧊", color: "#2563eb", gaugePercent: 5 },
];

// Rang (percentile) de la distribution des distances entre cibles actives
// marquant la frontière de chaque niveau, sous "Glacé" qui couvre le reste.
// Calibrés pour reproduire les anciens seuils fixes (500/1500/3000/6000 km)
// sur le mode Monde (~241 pays).
const TIER_RANKS = [0.01, 0.05, 0.14, 0.34];

export type FeedbackThresholds = number[];

// Seuils de distance (km) marquant chaque niveau chaud/froid, dérivés de la
// distribution réelle des distances entre les cibles actives plutôt que de
// seuils absolus — des seuils fixes calibrés pour l'échelle "monde" (des
// milliers de km entre pays) rendent le feedback inutilisable sur une zone
// resserrée (départements français, États américains) où tout tomberait
// dans "Brûlant".
export function computeFeedbackThresholds(
  centroids: Record<string, [number, number]>,
  names: string[],
): FeedbackThresholds {
  const points = names
    .map((n) => centroids[n])
    .filter((p): p is [number, number] => Boolean(p));

  if (points.length < 2) return TIER_RANKS.map(() => Infinity);

  const distances: number[] = [];
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      distances.push(haversineDistance(points[i], points[j]));
    }
  }
  distances.sort((a, b) => a - b);

  return TIER_RANKS.map(
    (rank) => distances[Math.min(distances.length - 1, Math.floor(distances.length * rank))],
  );
}

export function getFeedback(
  distanceKm: number,
  thresholds: FeedbackThresholds,
): FeedbackLevel {
  const index = thresholds.findIndex((t) => distanceKm < t);
  return FEEDBACK_TIERS[index === -1 ? FEEDBACK_TIERS.length - 1 : index];
}
