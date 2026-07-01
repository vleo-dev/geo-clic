"use client";

import { useState } from "react";
import { THEMES } from "@/lib/theme";
import styles from "./BurgerMenu.module.scss";

type BurgerMenuProps = {
  themeIndex: number;
  onThemeChange: (index: number) => void;
};

export default function BurgerMenu({
  themeIndex,
  onThemeChange,
}: BurgerMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.wrapper}>
      <button
        className={styles.burgerButton}
        onClick={() => setOpen((o) => !o)}
        aria-label="Menu"
        aria-expanded={open}
      >
        <span />
        <span />
        <span />
      </button>

      {open && (
        <div className={styles.panel}>
          <h3 className={styles.sectionTitle}>Thème</h3>
          <ul className={styles.themeList}>
            {THEMES.map((theme, index) => (
              <li key={theme.name}>
                <button
                  className={`${styles.themeOption} ${
                    index === themeIndex ? styles.themeOptionActive : ""
                  }`}
                  onClick={() => {
                    onThemeChange(index);
                    setOpen(false);
                  }}
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
