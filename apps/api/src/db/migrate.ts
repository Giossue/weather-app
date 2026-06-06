import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import postgres from "postgres";
import { env } from "../config/env";

const migrationsDir = new URL("../../drizzle", import.meta.url).pathname;
const sql = postgres(env.DATABASE_URL, { max: 1 });

try {
  await sql`CREATE TABLE IF NOT EXISTS drizzle_migrations (
    id serial PRIMARY KEY,
    name text NOT NULL UNIQUE,
    applied_at timestamptz NOT NULL DEFAULT now()
  )`;

  const files = (await readdir(migrationsDir)).filter((file) => file.endsWith(".sql")).sort();

  for (const file of files) {
    const alreadyApplied = await sql`SELECT 1 FROM drizzle_migrations WHERE name = ${file} LIMIT 1`;
    if (alreadyApplied.length > 0) continue;

    const content = await readFile(join(migrationsDir, file), "utf8");
    await sql.begin(async (tx) => {
      await tx.unsafe(content);
      await tx`INSERT INTO drizzle_migrations (name) VALUES (${file})`;
    });
    console.log(`Migración aplicada: ${file}`);
  }

  console.log("Migraciones al día");
} finally {
  await sql.end();
}
