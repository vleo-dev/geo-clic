// lib/modes/index.ts

import type { GameModeId } from "@/lib/gameModes";
import { loadPaysMode } from "./pays";
import { loadCapitalesMode } from "./capitales";
import { loadDrapeauMode } from "./drapeau";
import { loadDepartementsFrMode } from "./departementsFr";
import { loadEtatsUsMode } from "./etatsUs";
import type { ModeData } from "./types";

export type { ModeData, ModeMarker, ModeLabel } from "./types";

export function loadModeData(mode: GameModeId): Promise<ModeData> {
  switch (mode) {
    case "pays":
      return loadPaysMode();
    case "capitales":
      return loadCapitalesMode();
    case "drapeaux":
      return loadDrapeauMode();
    case "departements-fr":
      return loadDepartementsFrMode();
    case "etats-us":
      return loadEtatsUsMode();
  }
}
