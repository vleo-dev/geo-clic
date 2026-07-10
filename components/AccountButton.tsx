"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import AccountStatus from "./AccountStatus";
import styles from "./AccountButton.module.scss";

export default function AccountButton() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);

  if (status === "loading") return null;

  if (!session?.user) {
    return (
      <div className={styles.wrapper}>
        <Link href="/login" className={styles.avatarButton} aria-label="Se connecter">
          <SilhouetteIcon />
        </Link>
      </div>
    );
  }

  const { image } = session.user;

  return (
    <div className={styles.wrapper}>
      {open && (
        <div className={styles.panel}>
          <AccountStatus onAction={() => setOpen(false)} />
        </div>
      )}

      <button
        type="button"
        className={styles.avatarButton}
        onClick={() => setOpen((o) => !o)}
        aria-label="Compte"
        aria-expanded={open}
      >
        {image ? (
          <Image src={image} alt="" width={32} height={32} className={styles.avatarImg} />
        ) : (
          <SilhouetteIcon />
        )}
      </button>
    </div>
  );
}

function SilhouetteIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" />
    </svg>
  );
}
