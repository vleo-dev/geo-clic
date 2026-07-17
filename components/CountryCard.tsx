"use client";

import type { ModeLabel } from "@/lib/modes";
import styles from "./CountryCard.module.scss";

type CountryCardProps = {
  target: string | null;
  label: ModeLabel | null;
  gameOver: boolean;
  score: number;
  unitLabel: string;
  onPass: () => void;
};

export default function CountryCard({
  target,
  label,
  gameOver,
  score,
  unitLabel,
  onPass,
}: CountryCardProps) {
  return (
    <div className={styles.card}>
      {!gameOver && label ? (
        <div key={target} className={styles.target}>
          {label.title ? (
            <>
              {label.flag && <span className={styles.flag}>{label.flag}</span>}
              <strong>{label.title}</strong>
            </>
          ) : (
            label.flag && <span className={styles.flagOnly}>{label.flag}</span>
          )}
        </div>
      ) : (
        <div className={styles.target}>
          Partie terminée ! Score : {score} {unitLabel}
        </div>
      )}

      {!gameOver && target && (
        <button
          type="button"
          className={styles.passButton}
          onClick={onPass}
          aria-label="Passer ce pays"
        >
          <svg
            viewBox="0 0 24 24"
            width="13"
            height="13"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="5 4 15 12 5 20 5 4" />
            <line x1="19" y1="5" x2="19" y2="19" />
          </svg>
          Passer
        </button>
      )}
    </div>
  );
}
