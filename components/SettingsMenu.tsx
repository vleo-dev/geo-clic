"use client";

import { useState } from "react";
import { THEMES } from "@/lib/theme";
import styles from "./SettingsMenu.module.scss";

type SettingsMenuProps = {
  themeIndex: number;
  onThemeChange: (index: number) => void;
};

export default function SettingsMenu({
  themeIndex,
  onThemeChange,
}: SettingsMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.wrapper}>
      <button
        className={styles.gearButton}
        onClick={() => setOpen((o) => !o)}
        aria-label="Réglages"
        aria-expanded={open}
      >
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>

      {open && (
        <div className={styles.panel}>
          <h3 className={styles.sectionTitle}>Thème</h3>
          <ul className={styles.optionList}>
            {THEMES.map((theme, index) => (
              <li key={theme.name}>
                <button
                  className={`${styles.option} ${
                    index === themeIndex ? styles.optionActive : ""
                  }`}
                  onClick={() => onThemeChange(index)}
                >
                  {theme.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
