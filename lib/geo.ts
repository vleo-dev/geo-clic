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

export function getFeedback(distanceKm: number): FeedbackLevel {
  if (distanceKm < 500)
    return {
      label: "Brûlant",
      emoji: "🔥",
      color: "#ef4444",
      gaugePercent: 90,
    };
  if (distanceKm < 1500)
    return { label: "Chaud", emoji: "🌡️", color: "#f97316", gaugePercent: 65 };
  if (distanceKm < 3000)
    return { label: "Tiède", emoji: "🌤️", color: "#eab308", gaugePercent: 45 };
  if (distanceKm < 6000)
    return { label: "Froid", emoji: "❄️", color: "#38bdf8", gaugePercent: 20 };
  return { label: "Glacé", emoji: "🧊", color: "#2563eb", gaugePercent: 5 };
}
