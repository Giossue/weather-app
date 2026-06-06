import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const defaultDatabaseUrl = "postgresql://weather_app:weather_app@localhost:5432/weather_app";

const readApiEnvDatabaseUrl = () => {
  const envPath = join(process.cwd(), "apps/api/.env");
  if (!existsSync(envPath)) return defaultDatabaseUrl;

  const content = readFileSync(envPath, "utf8");
  const line = content
    .split(/\r?\n/)
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith("DATABASE_URL="));

  if (!line) return defaultDatabaseUrl;
  const value = line.slice("DATABASE_URL=".length).trim().replace(/^['"]|['"]$/g, "");
  return value || defaultDatabaseUrl;
};

const run = async (cmd: string[]) => {
  const proc = Bun.spawn(cmd, {
    stdout: "pipe",
    stderr: "pipe",
    env: Bun.env
  });
  const [stdout, stderr, code] = await Promise.all([new Response(proc.stdout).text(), new Response(proc.stderr).text(), proc.exited]);
  return { stdout, stderr, code };
};

const databaseUrl = readApiEnvDatabaseUrl();
const parsed = new URL(databaseUrl);
const host = parsed.hostname || "localhost";
const port = parsed.port || "5432";
const user = decodeURIComponent(parsed.username || "weather_app");
const password = decodeURIComponent(parsed.password || "weather_app");
const database = decodeURIComponent(parsed.pathname.replace(/^\//, "") || "weather_app");

const printSetupHelp = () => {
  console.log(`\nPostgreSQL local está instalado, pero falta preparar el rol/base para esta app.\n\nConfiguración esperada:\n  host: ${host}\n  port: ${port}\n  database: ${database}\n  user: ${user}\n\nEjecuta estos comandos con pkexec:\n\n  pkexec --user postgres psql -d postgres -c "CREATE ROLE ${user} WITH LOGIN PASSWORD '${password}';"\n  pkexec --user postgres createdb -O ${user} ${database}\n\nSi alguno dice que ya existe, continúa con el siguiente. Después ejecuta:\n\n  bun run db:migrate\n`);
};

const ready = await run(["pg_isready", "-h", host, "-p", port]);
if (ready.code !== 0) {
  console.error(`PostgreSQL no está aceptando conexiones en ${host}:${port}.`);
  console.error(ready.stdout || ready.stderr);
  process.exit(1);
}

const check = await Bun.spawn(["psql", "-h", host, "-p", port, "-U", user, "-d", database, "-c", "select 1;"], {
  stdout: "pipe",
  stderr: "pipe",
  env: { ...Bun.env, PGPASSWORD: password }
});
const [stdout, stderr, code] = await Promise.all([new Response(check.stdout).text(), new Response(check.stderr).text(), check.exited]);

if (code === 0) {
  console.log(`PostgreSQL local listo: ${databaseUrl.replace(/:\/\/([^:]+):([^@]+)@/, "://$1:***@")}`);
  console.log(stdout.trim());
  process.exit(0);
}

console.error(stderr.trim());
printSetupHelp();
process.exit(1);
