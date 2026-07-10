// lib/gameModes.ts

export type GameModeId =
  | "pays"
  | "capitales"
  | "drapeaux"
  | "departements-fr"
  | "etats-us";

export const GAME_MODES: GameModeId[] = [
  "pays",
  "capitales",
  "drapeaux",
  "departements-fr",
  "etats-us",
];

export const GAME_MODE_LABELS: Record<GameModeId, string> = {
  pays: "Pays",
  capitales: "Capitales",
  drapeaux: "Drapeaux",
  "departements-fr": "Départements France",
  "etats-us": "États US",
};

// Zone (continent) et filtre spécial (enclavé/île) n'ont de sens que pour
// les modes à échelle mondiale, où chaque cible est un pays.
export const MODE_SUPPORTS_ZONE: Record<GameModeId, boolean> = {
  pays: true,
  capitales: true,
  drapeaux: true,
  "departements-fr": false,
  "etats-us": false,
};

export const MODE_UNIT_LABEL: Record<GameModeId, string> = {
  pays: "pays trouvés",
  capitales: "capitales trouvées",
  drapeaux: "drapeaux trouvés",
  "departements-fr": "départements trouvés",
  "etats-us": "États trouvés",
};
