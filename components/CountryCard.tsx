"use client";

import { FeedbackLevel } from "@/lib/geo";
import type { ModeLabel } from "@/lib/modes";
import styles from "./CountryCard.module.scss";

type CountryCardProps = {
  target: string | null;
  label: ModeLabel | null;
  gameOver: boolean;
  foundCount: number;
  unitLabel: string;
  feedback: FeedbackLevel | null;
  feedbackKey: number;
};

export default function CountryCard({
  target,
  label,
  gameOver,
  foundCount,
  unitLabel,
  feedback,
  feedbackKey,
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
          Partie terminée ! Score : {foundCount} {unitLabel}
        </div>
      )}

      {feedback && !gameOver && (
        <div key={feedbackKey} className={styles.feedback}>
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
  );
}
