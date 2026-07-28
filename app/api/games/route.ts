import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getClientIp } from "@/lib/clientIp";

export async function POST(request: Request) {
  const session = await auth();

  const body = await request.json();
  const { score, total, errors, mode, zone, durationSeconds } = body as {
    score?: number;
    total?: number;
    errors?: number;
    mode?: string;
    zone?: string;
    durationSeconds?: number;
  };

  if (
    typeof score !== "number" ||
    typeof mode !== "string" ||
    typeof zone !== "string" ||
    typeof durationSeconds !== "number" ||
    (total !== undefined && typeof total !== "number") ||
    (errors !== undefined && typeof errors !== "number")
  ) {
    return NextResponse.json({ error: "Données invalides." }, { status: 400 });
  }

  const game = await prisma.gameHistory.create({
    data: {
      userId: session?.user?.id ?? null,
      // IP tracée uniquement pour les parties anonymes — inutile de tracer
      // l'IP de quelqu'un déjà identifié par son compte.
      ipAddress: session?.user ? null : getClientIp(request),
      score,
      total,
      errors,
      mode,
      zone,
      durationSeconds,
    },
  });

  return NextResponse.json({ ok: true, game });
}
