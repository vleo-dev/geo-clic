"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import styles from "./AccountStatus.module.scss";

type AccountStatusProps = {
  // Appelé après un clic sur un lien/bouton (ex: pour fermer le menu qui
  // englobe ce composant).
  onAction?: () => void;
};

export default function AccountStatus({ onAction }: AccountStatusProps) {
  const { data: session, status } = useSession();

  if (status === "loading") return null;

  if (!session?.user) {
    return (
      <div className={styles.wrapper}>
        <Link href="/login" className={styles.option} onClick={onAction}>
          Se connecter
        </Link>
        <Link href="/register" className={styles.option} onClick={onAction}>
          Créer un compte
        </Link>
      </div>
    );
  }

  const { name, email, image } = session.user;

  return (
    <div className={styles.wrapper}>
      <div className={styles.identity}>
        {image ? (
          <Image
            src={image}
            alt=""
            width={32}
            height={32}
            className={styles.avatarImg}
          />
        ) : (
          <SilhouetteIcon />
        )}
        <div>
          <strong>{name ?? "Joueur"}</strong>
          {email && <span className={styles.email}>{email}</span>}
        </div>
      </div>
      <Link href="/historique" className={styles.option} onClick={onAction}>
        Historique des parties
      </Link>
      <button
        type="button"
        className={styles.option}
        onClick={() => {
          onAction?.();
          signOut({ callbackUrl: "/" });
        }}
      >
        Se déconnecter
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
