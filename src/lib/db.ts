/**
 * src/lib/db.ts
 * ─────────────────────────────────────────────────────────────
 * Centralized Prisma Client instance.
 * Prisma 7 requires an explicit driver adapter for PostgreSQL —
 * the schema.prisma file no longer holds the connection url directly.
 *
 * Import `db` from this file everywhere instead of creating new
 * PrismaClient() instances (e.g. in auth.ts) to avoid exhausting
 * database connections during development hot-reloads.
 * ─────────────────────────────────────────────────────────────
 */
 
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
 
// Prevents creating a new PrismaClient on every hot-reload in dev mode,
// which would otherwise exhaust the database's connection pool.
const globalForPrisma = global as unknown as { prisma: PrismaClient };
 
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
 
export const db =
  globalForPrisma.prisma ||
  new PrismaClient({ adapter });
 
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}