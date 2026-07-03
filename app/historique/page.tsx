import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DIFFICULTY_LABELS, Difficulty } from "@/lib/difficulty";
import { ZONE_LABELS, Zone } from "@/lib/zones";
import styles from "./historique.module.scss";

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m} min ${s}s` : `${s}s`;
}

export default async function HistoriquePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const games = await prisma.gameHistory.findMany({
    where: { userId: session.user.id },
    orderBy: { playedAt: "desc" },
  });

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1>Historique des parties</h1>
          <Link href="/" className={styles.backLink}>
            ← Retour au jeu
          </Link>
        </div>

        {games.length === 0 ? (
          <p className={styles.empty}>Aucune partie jouée pour l&apos;instant.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Score</th>
                <th>Difficulté</th>
                <th>Zone</th>
                <th>Durée</th>
              </tr>
            </thead>
            <tbody>
              {games.map((game) => (
                <tr key={game.id}>
                  <td>
                    {new Intl.DateTimeFormat("fr-FR", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(game.playedAt)}
                  </td>
                  <td>{game.score}</td>
                  <td>
                    {DIFFICULTY_LABELS[game.difficulty as Difficulty] ??
                      game.difficulty}
                  </td>
                  <td>{ZONE_LABELS[game.zone as Zone] ?? game.zone}</td>
                  <td>{formatDuration(game.durationSeconds)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
