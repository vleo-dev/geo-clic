// lib/anecdotes.ts
//
// Pool d'anecdotes par pays, pré-générées (voir
// app/api/admin/anecdotes/generate) et piochées au hasard pendant une
// partie — aucun appel à l'API Anthropic n'a lieu pendant le jeu.

import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";

export const ANECDOTES_PER_COUNTRY = 20;

export async function getRandomAnecdote(country: string): Promise<string | null> {
  const anecdotes = await prisma.anecdote.findMany({
    where: { country },
    select: { text: true },
  });
  if (anecdotes.length === 0) return null;
  const index = Math.floor(Math.random() * anecdotes.length);
  return anecdotes[index].text;
}

const anthropic = new Anthropic();

// Demande `count` anecdotes courtes en français à Claude, sous forme
// structurée (tool forcé) pour éviter un parsing fragile de texte libre.
export async function generateAnecdotesForCountry(
  countryFr: string,
  count: number,
): Promise<string[]> {
  if (count <= 0) return [];

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    tools: [
      {
        name: "save_anecdotes",
        description: "Enregistre la liste d'anecdotes générées.",
        input_schema: {
          type: "object",
          properties: {
            anecdotes: {
              type: "array",
              items: { type: "string" },
              description: "Anecdotes courtes (1 à 2 phrases) en français.",
            },
          },
          required: ["anecdotes"],
        },
      },
    ],
    tool_choice: { type: "tool", name: "save_anecdotes" },
    messages: [
      {
        role: "user",
        content:
          `Donne ${count} anecdotes courtes, variées (géographie, culture, ` +
          `histoire, nature, gastronomie...), factuelles et adaptées à un ` +
          `jeu tout public, sur le pays "${countryFr}". Chaque anecdote ` +
          `fait 1 à 2 phrases, en français, sans introduction ni numérotation.`,
      },
    ],
  });

  const toolUse = response.content.find((block) => block.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") return [];

  const input = toolUse.input as { anecdotes?: unknown };
  return Array.isArray(input.anecdotes)
    ? input.anecdotes.filter((a): a is string => typeof a === "string")
    : [];
}
