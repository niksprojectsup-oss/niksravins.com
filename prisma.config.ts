import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";

// Next.js env prioritāte: .env.local uzvar .env.
// Tas nodrošina, ka prisma CLI arī lokāli izmanto DEV savienojumu,
// ja .env.local satur DEV DATABASE_URL (production netiek skarts).
config();
config({ path: ".env.local", override: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
