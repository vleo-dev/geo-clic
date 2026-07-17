"use client";

import styles from "./FoundPuff.module.scss";

export default function FoundPuff() {
  return (
    <g className={styles.puff}>
      <circle className={styles.dot} r={1.3} cx={0} cy={0} />
      <circle className={styles.dot} r={0.85} cx={-1.15} cy={0.5} />
      <circle className={styles.dot} r={0.85} cx={1.1} cy={0.45} />
      <circle className={styles.dot} r={0.7} cx={0.15} cy={-0.95} />
    </g>
  );
}
