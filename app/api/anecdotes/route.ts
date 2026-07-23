import { NextResponse } from "next/server";
import { getRandomAnecdote } from "@/lib/anecdotes";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get("country");

  if (!country) {
    return NextResponse.json(
      { error: "Paramètre 'country' manquant." },
      { status: 400 },
    );
  }

  const anecdote = await getRandomAnecdote(country);
  return NextResponse.json({ anecdote });
}
