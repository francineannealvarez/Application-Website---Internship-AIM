import { defineConfig } from "prisma/config";
import path from "node:path";
 
// Prisma 7 config file. The actual database connection (via adapter)
// now lives in src/lib/db.ts using @prisma/adapter-pg — this file just
// tells the Prisma CLI (for `prisma generate`, `prisma migrate`, etc.)
// where the schema and migrations folder are.
export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    path: path.join("prisma", "migrations"),
  },
});
 