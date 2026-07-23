"use client";

import {
  GAME_MODES,
  GAME_MODE_LABELS,
  MODE_SUPPORTS_ZONE,
  GameModeId,
} from "@/lib/gameModes";
import { CONTINENTS, CONTINENT_LABELS, ZoneSelection } from "@/lib/zones";
import {
  SPECIAL_FILTERS,
  SPECIAL_FILTER_LABELS,
  SpecialFilter,
} from "@/lib/specialFilters";
import AccountStatus from "./AccountStatus";
import styles from "./GameSetupModal.module.scss";

type GameSetupModalProps = {
  open: boolean;
  onClose: () => void;
  mode: GameModeId;
  onModeChange: (mode: GameModeId) => void;
  selectedZones: ZoneSelection;
  onZonesChange: (zones: ZoneSelection) => void;
  specialFilter: SpecialFilter;
  onSpecialFilterChange: (filter: SpecialFilter) => void;
  suddenDeath: boolean;
  onSuddenDeathChange: (suddenDeath: boolean) => void;
  anecdotesEnabled: boolean;
  onAnecdotesEnabledChange: (anecdotesEnabled: boolean) => void;
};

export default function GameSetupModal({
  open,
  onClose,
  mode,
  onModeChange,
  selectedZones,
  onZonesChange,
  specialFilter,
  onSpecialFilterChange,
  suddenDeath,
  onSuddenDeathChange,
  anecdotesEnabled,
  onAnecdotesEnabledChange,
}: GameSetupModalProps) {
  if (!open) return null;

  function toggleZone(zone: (typeof CONTINENTS)[number]) {
    if (selectedZones.includes(zone)) {
      onZonesChange(selectedZones.filter((z) => z !== zone));
    } else {
      onZonesChange([...selectedZones, zone]);
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Configuration de la partie</h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        <h3 className={styles.sectionTitle}>Mode</h3>
        <div className={styles.modeGrid}>
          {GAME_MODES.map((m) => (
            <button
              key={m}
              type="button"
              className={`${styles.modeButton} ${
                m === mode ? styles.modeButtonActive : ""
              }`}
              onClick={() => onModeChange(m)}
            >
              {GAME_MODE_LABELS[m]}
            </button>
          ))}
        </div>

        <h3 className={styles.sectionTitle}>Options</h3>

        <div className={styles.settingRow}>
          <input
            id="setup-anecdotes"
            type="checkbox"
            checked={anecdotesEnabled}
            onChange={(e) => onAnecdotesEnabledChange(e.target.checked)}
            className={styles.checkbox}
          />
          <label htmlFor="setup-anecdotes" className={styles.settingLabel}>
            Activer les anecdotes
          </label>
          <button
            type="button"
            className={styles.infoButton}
            data-tooltip="Affiche une anecdote générée par IA sur chaque pays trouvé."
            aria-label="En savoir plus sur les anecdotes"
          >
            i
          </button>
        </div>

        <div className={styles.settingRow}>
          <input
            id="setup-sudden-death"
            type="checkbox"
            checked={suddenDeath}
            onChange={(e) => onSuddenDeathChange(e.target.checked)}
            className={styles.checkbox}
          />
          <label htmlFor="setup-sudden-death" className={styles.settingLabel}>
            💀 Mort subite
          </label>
          <button
            type="button"
            className={styles.infoButton}
            data-tooltip="Une seule erreur termine la partie."
            aria-label="En savoir plus sur la mort subite"
          >
            i
          </button>
        </div>

        {MODE_SUPPORTS_ZONE[mode] && (
          <>
            <h3 className={styles.sectionTitle}>Zone</h3>
            <div className={styles.checkboxGrid}>
              {CONTINENTS.map((zone) => (
                <label key={zone} className={styles.checkboxOption}>
                  <input
                    type="checkbox"
                    checked={selectedZones.includes(zone)}
                    onChange={() => toggleZone(zone)}
                    className={styles.checkbox}
                  />
                  {CONTINENT_LABELS[zone]}
                </label>
              ))}
            </div>
            <p className={styles.hint}>
              Aucune case cochée = monde entier.
            </p>

            <h3 className={styles.sectionTitle}>Filtre spécial</h3>
            <ul className={styles.optionList}>
              {SPECIAL_FILTERS.map((f) => (
                <li key={f}>
                  <button
                    type="button"
                    className={`${styles.option} ${
                      f === specialFilter ? styles.optionActive : ""
                    }`}
                    onClick={() => onSpecialFilterChange(f)}
                  >
                    {SPECIAL_FILTER_LABELS[f]}
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        <h3 className={styles.sectionTitle}>Compte</h3>
        <AccountStatus />

        <button type="button" className={styles.playButton} onClick={onClose}>
          Jouer
        </button>
      </div>
    </div>
  );
}
