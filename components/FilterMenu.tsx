"use client";

import { useState } from "react";
import { ZONES, ZONE_LABELS, Zone } from "@/lib/zones";
import {
  SPECIAL_FILTERS,
  SPECIAL_FILTER_LABELS,
  SpecialFilter,
} from "@/lib/specialFilters";
import styles from "./FilterMenu.module.scss";

type FilterMenuProps = {
  zone: Zone;
  onZoneChange: (zone: Zone) => void;
  specialFilter: SpecialFilter;
  onSpecialFilterChange: (filter: SpecialFilter) => void;
};

export default function FilterMenu({
  zone,
  onZoneChange,
  specialFilter,
  onSpecialFilterChange,
}: FilterMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.wrapper}>
      <button
        className={styles.filterButton}
        onClick={() => setOpen((o) => !o)}
        aria-label="Filtres"
        aria-expanded={open}
      >
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="#333"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
      </button>

      {open && (
        <div className={styles.panel}>
          <h3 className={styles.sectionTitle}>Zone</h3>
          <ul className={styles.optionList}>
            {ZONES.map((z) => (
              <li key={z}>
                <button
                  className={`${styles.option} ${
                    z === zone ? styles.optionActive : ""
                  }`}
                  onClick={() => onZoneChange(z)}
                >
                  {ZONE_LABELS[z]}
                </button>
              </li>
            ))}
          </ul>

          <h3 className={styles.sectionTitle}>Filtre spécial</h3>
          <ul className={styles.optionList}>
            {SPECIAL_FILTERS.map((f) => (
              <li key={f}>
                <button
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
        </div>
      )}
    </div>
  );
}
