/**
 * Applies db/schema.sql against the database pointed to by the Postgres
 * env vars (POSTGRES_URL, etc. — set automatically when you provision
 * Vercel Postgres / Neon and pull env vars with `vercel env pull`).
 *
 * Usage:
 *   npm run db:migrate
 */
import "dotenv/config"; // loads .env.local when run outside `next dev`/`next start`
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { sql } from "@vercel/postgres";

async function migrate() {
  const schemaPath = join(process.cwd(), "db", "schema.sql");
  const schema = readFileSync(schemaPath, "utf-8");

  // Split on blank-line-separated statements so we can run each with
  // the tagged-template client, which expects one statement at a time.
  const statements = schema
    .split(/;\s*(?:\n|$)/)
    .map((s) => s.trim())
    .filter(Boolean);

  console.log(`Applying ${statements.length} statement(s) from db/schema.sql...`);

  for (const statement of statements) {
    await sql.query(statement);
  }

  console.log("Migration complete: subscribers + comments tables are ready.");
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
