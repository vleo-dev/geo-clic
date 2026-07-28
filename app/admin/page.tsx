import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import AdminView from "./AdminView";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  if (session.user.email !== process.env.ADMIN_EMAIL) {
    notFound();
  }

  const games = await prisma.gameHistory.findMany({
    include: { user: { select: { name: true, email: true } } },
    orderBy: { playedAt: "desc" },
  });

  return <AdminView games={games} />;
}
