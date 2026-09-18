import { PrismaClient } from "@prisma/client";

// Singleton do Prisma Client, necessário no Next.js em dev para evitar
// esgotar conexões durante hot-reload (cada reload recarrega o módulo).
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
