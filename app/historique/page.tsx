import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import HistoriqueView from "./HistoriqueView";

export default async function HistoriquePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const games = await prisma.gameHistory.findMany({
    where: { userId: session.user.id },
    orderBy: { playedAt: "desc" },
  });

  return <HistoriqueView games={games} />;
}
