// lib/prisma.ts
//
// Singleton PrismaClient : évite d'ouvrir une nouvelle connexion à chaque
// hot-reload en dev (Next.js recharge les modules mais garde `global`).

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
