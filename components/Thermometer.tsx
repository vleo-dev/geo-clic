"use client";

import type { CSSProperties } from "react";
import type { FeedbackLevel } from "@/lib/geo";
import styles from "./Thermometer.module.scss";

type ThermometerProps = {
  feedback: FeedbackLevel | null;
  feedbackKey: number;
};

export default function Thermometer({ feedback, feedbackKey }: ThermometerProps) {
  if (!feedback) return null;

  return (
    <div key={feedbackKey} className={styles.wrapper}>
      <div
        className={styles.label}
        style={{
          color: feedback.color,
          backgroundColor: `${feedback.color}1a`,
        }}
      >
        <span className={styles.emoji}>{feedback.emoji}</span>
        {feedback.label}
      </div>
      <div className={styles.track}>
        {[20, 40, 60, 80].map((tick) => (
          <span
            key={tick}
            className={styles.tick}
            style={{ bottom: `${tick}%` }}
          />
        ))}
        <div
          className={styles.cursor}
          style={
            {
              bottom: `${feedback.gaugePercent}%`,
              backgroundColor: feedback.color,
              "--gauge-glow": `${feedback.color}80`,
            } as CSSProperties
          }
        />
      </div>
    </div>
  );
}
