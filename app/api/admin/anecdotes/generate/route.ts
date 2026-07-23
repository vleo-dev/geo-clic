import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { COUNTRY_INFO } from "@/lib/countryInfo";
import {
  ANECDOTES_PER_COUNTRY,
  generateAnecdotesForCountry,
} from "@/lib/anecdotes";

// Complète le pool d'anecdotes en BDD, par lots (pour rester sous les
// limites de durée des fonctions serverless en prod). Déclenchée
// uniquement à la main (`curl -X POST`), jamais automatiquement — pas de
// Cron ici, pour garder la main sur le moment et le rythme des appels
// payants à l'API Anthropic. Protégée par un secret partagé plutôt qu'une
// session : ce script n'est jamais appelé par le navigateur d'un joueur.
export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const batch = Math.max(1, Number(searchParams.get("batch")) || 5);

  const counts = await prisma.anecdote.groupBy({
    by: ["country"],
    _count: { _all: true },
  });
  const countByCountry = new Map(counts.map((c) => [c.country, c._count._all]));

  const pending = Object.keys(COUNTRY_INFO).filter(
    (country) => (countByCountry.get(country) ?? 0) < ANECDOTES_PER_COUNTRY,
  );
  const targets = pending.slice(0, batch);

  const processed: { country: string; inserted: number }[] = [];
  const failed: { country: string; error: string }[] = [];

  // Traité un pays à la fois, en loggant au fur et à mesure : avec un gros
  // `batch`, la réponse HTTP n'arrive qu'à la toute fin — ces logs (visibles
  // dans le terminal `npm run dev`) donnent une progression en direct
  // pendant que la requête est encore en cours. Chaque pays est isolé dans
  // son propre try/catch : sans ça, l'échec d'un seul pays (erreur réseau
  // passagère, rate limit...) faisait planter toute la boucle et laissait
  // tous les pays suivants du lot non traités, même ceux qui auraient
  // réussi.
  for (const [index, country] of targets.entries()) {
    const already = countByCountry.get(country) ?? 0;
    const missing = ANECDOTES_PER_COUNTRY - already;
    console.log(
      `[anecdotes] (${index + 1}/${targets.length}) ${country} — génération de ${missing} anecdote(s)...`,
    );

    try {
      const anecdotes = await generateAnecdotesForCountry(
        COUNTRY_INFO[country].fr,
        missing,
      );

      if (anecdotes.length > 0) {
        await prisma.anecdote.createMany({
          data: anecdotes.map((text) => ({ country, text })),
        });
      }

      console.log(
        `[anecdotes] (${index + 1}/${targets.length}) ${country} — ${anecdotes.length} anecdote(s) insérée(s).`,
      );
      processed.push({ country, inserted: anecdotes.length });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(
        `[anecdotes] (${index + 1}/${targets.length}) ${country} — échec : ${message}`,
      );
      failed.push({ country, error: message });
    }
  }

  console.log(
    `[anecdotes] Terminé : ${processed.length} pays traités, ${failed.length} échec(s), ${pending.length - targets.length} restants.`,
  );

  return NextResponse.json({
    processed,
    failed,
    remaining: pending.length - targets.length,
  });
}
