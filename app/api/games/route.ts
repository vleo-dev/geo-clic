import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non connecté." }, { status: 401 });
  }

  const body = await request.json();
  const { score, difficulty, zone, durationSeconds } = body as {
    score?: number;
    difficulty?: string;
    zone?: string;
    durationSeconds?: number;
  };

  if (
    typeof score !== "number" ||
    typeof difficulty !== "string" ||
    typeof zone !== "string" ||
    typeof durationSeconds !== "number"
  ) {
    return NextResponse.json({ error: "Données invalides." }, { status: 400 });
  }

  const game = await prisma.gameHistory.create({
    data: {
      userId: session.user.id,
      score,
      difficulty,
      zone,
      durationSeconds,
    },
  });

  return NextResponse.json({ ok: true, game });
}
