import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non connecté." }, { status: 401 });
  }

  const body = await request.json();
  const { score, mode, zone, durationSeconds } = body as {
    score?: number;
    mode?: string;
    zone?: string;
    durationSeconds?: number;
  };

  if (
    typeof score !== "number" ||
    typeof mode !== "string" ||
    typeof zone !== "string" ||
    typeof durationSeconds !== "number"
  ) {
    return NextResponse.json({ error: "Données invalides." }, { status: 400 });
  }

  const game = await prisma.gameHistory.create({
    data: {
      userId: session.user.id,
      score,
      mode,
      zone,
      durationSeconds,
    },
  });

  return NextResponse.json({ ok: true, game });
}
