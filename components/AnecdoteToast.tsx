"use client";

import type { ModeLabel } from "@/lib/modes";
import styles from "./AnecdoteToast.module.scss";

type AnecdoteToastProps = {
  anecdote: { text: string; label: ModeLabel } | null;
};

export default function AnecdoteToast({ anecdote }: AnecdoteToastProps) {
  if (!anecdote) return null;

  return (
    <div className={styles.toast}>
      <div className={styles.header}>
        <span className={styles.icon} aria-hidden="true">
          💡
        </span>
        <span className={styles.title}>Le saviez-vous ?</span>
        {anecdote.label.flag && (
          <span className={styles.flag}>{anecdote.label.flag}</span>
        )}
      </div>
      <p className={styles.text}>{anecdote.text}</p>
    </div>
  );
}
