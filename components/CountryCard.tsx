"use client";

import { getCountryInfo } from "@/lib/countryInfo";
import { FeedbackLevel } from "@/lib/geo";
import styles from "./CountryCard.module.scss";

type CountryCardProps = {
  lives: number;
  maxLives: number;
  target: string | null;
  gameOver: boolean;
  foundCount: number;
  feedback: FeedbackLevel | null;
  feedbackKey: number;
};

export default function CountryCard({
  lives,
  maxLives,
  target,
  gameOver,
  foundCount,
  feedback,
  feedbackKey,
}: CountryCardProps) {
  const targetInfo = target ? getCountryInfo(target) : null;

  return (
    <div className={styles.card}>
      <div className={styles.lives}>
        <span className={styles.heartIcon}>♥</span>
        <div className={styles.livesTrack}>
          <div
            className={styles.livesFill}
            style={{ width: `${(lives / maxLives) * 100}%` }}
          />
        </div>
        <span className={styles.livesCount}>
          {lives}/{maxLives}
        </span>
      </div>

      {!gameOver && targetInfo ? (
        <div key={target} className={styles.target}>
          <span className={styles.flag}>{targetInfo.flag}</span>
          <strong>{targetInfo.fr}</strong>
        </div>
      ) : (
        <div className={styles.target}>
          Partie terminée ! Score : {foundCount} pays trouvés
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
