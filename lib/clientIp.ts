// lib/clientIp.ts

// `x-forwarded-for` est l'en-tête standard posé par l'infra Vercel, avec
// éventuellement plusieurs IP séparées par des virgules (proxys en chaîne)
// — la première est celle du client d'origine. Absent en local (retourne
// `null`, acceptable pour du dev).
export function getClientIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || null;
}
