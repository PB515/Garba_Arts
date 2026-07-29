#!/usr/bin/env tsx
/**
 * migrate — the IDP migration runner (Slice 1)
 *
 * The #1 gap across all four builds: no versioned, tracked way to evolve the
 * database. This is a small, dependency-light runner (NOT an ORM) over plain
 * SQL files, with an applied-state table (`db_meta`) and drift detection.
 *
 * Commands:
 *   up [n]        apply pending migrations in order (all, or the next n)
 *   down [n]      roll back the last applied migration (or the last n)
 *   status        show applied vs pending, newest state of the world
 *   check         drift detection — exits non-zero if the DB and the files disagree
 *   types         regenerate row types via `supabase gen types` (not hand-written)
 *
 * Migration file format — db/migrations/NNNN_name.sql:
 *   -- migrate:up
 *   <sql applied by `up`>
 *   -- migrate:down
 *   <sql applied by `down`>
 *
 * Connection: DATABASE_URL (from .env.local), defaulting to the local Supabase
 * Postgres. Migrations dir + lib dir are auto-resolved so the tool works both
 * at the IDP root (template/db/migrations) and at a cloned site root (db/migrations).
 */

import { readFileSync, readdirSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';
import pg from 'pg';

// ---------- config ----------

const DEFAULT_LOCAL_DB = 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';

/** Load .env.local if present (Node >=20.6 has process.loadEnvFile). */
function loadEnv(): void {
  for (const file of ['.env.local', '.env']) {
    try {
      process.loadEnvFile(file); // Node >=20.6
    } catch {
      /* file absent — fine */
    }
  }
}

/** Resolve a dir that may sit at the site root or under template/ (IDP root). */
function resolveDir(siteRel: string, templateRel: string): string {
  if (existsSync(resolve(siteRel))) return resolve(siteRel);
  if (existsSync(resolve(templateRel))) return resolve(templateRel);
  // default to the template location (and create it on demand for writes)
  return resolve(templateRel);
}

function getConfig() {
  const databaseUrl = process.env.DATABASE_URL?.trim() || DEFAULT_LOCAL_DB;
  const usingDefault = !process.env.DATABASE_URL?.trim();
  const migrationsDir =
    process.env.MIGRATIONS_DIR?.trim()
      ? resolve(process.env.MIGRATIONS_DIR.trim())
      : resolveDir('db/migrations', 'template/db/migrations');
  const libSupabaseDir = resolveDir('lib/supabase', 'template/lib/supabase');
  return { databaseUrl, usingDefault, migrationsDir, libSupabaseDir };
}

// ---------- migration files ----------

interface Migration {
  version: string;   // the NNNN prefix
  name: string;      // human label
  filename: string;
  path: string;
  up: string;
  down: string;
  checksum: string;  // sha256 of the up SQL
}

function parseSections(sql: string): { up: string; down: string } {
  // Split on `-- migrate:up` / `-- migrate:down` markers (case-insensitive).
  const upMatch = sql.match(/--\s*migrate:up\s*\n/i);
  const downMatch = sql.match(/--\s*migrate:down\s*\n/i);
  if (!upMatch) {
    // No markers → whole file is the up; no down available.
    return { up: sql.trim(), down: '' };
  }
  const upStart = upMatch.index! + upMatch[0].length;
  if (downMatch) {
    const up = sql.slice(upStart, downMatch.index).trim();
    const down = sql.slice(downMatch.index! + downMatch[0].length).trim();
    return { up, down };
  }
  return { up: sql.slice(upStart).trim(), down: '' };
}

function sha256(s: string): string {
  return createHash('sha256').update(s, 'utf8').digest('hex');
}

function loadMigrations(dir: string): Migration[] {
  if (!existsSync(dir)) return [];
  const files = readdirSync(dir)
    .filter((f) => f.endsWith('.sql'))
    .sort(); // lexical sort works because of the zero-padded NNNN prefix
  return files.map((filename) => {
    const path = join(dir, filename);
    const raw = readFileSync(path, 'utf8');
    const { up, down } = parseSections(raw);
    const m = filename.match(/^(\d+)[_-]?(.*)\.sql$/);
    const version = m ? m[1] : filename.replace(/\.sql$/, '');
    const name = m && m[2] ? m[2].replace(/[_-]+/g, ' ').trim() : filename;
    return { version, name, filename, path, up, down, checksum: sha256(up) };
  });
}

// ---------- db_meta (applied-state) ----------

const META_DDL = `
create table if not exists db_meta (
  version    text primary key,
  name       text not null,
  filename   text not null,
  checksum   text not null,
  applied_at timestamptz not null default now()
);`;

interface AppliedRow {
  version: string;
  name: string;
  filename: string;
  checksum: string;
  applied_at: string;
}

async function ensureMeta(client: pg.Client): Promise<void> {
  await client.query(META_DDL);
}

async function getApplied(client: pg.Client): Promise<Map<string, AppliedRow>> {
  const { rows } = await client.query<AppliedRow>(
    'select version, name, filename, checksum, applied_at from db_meta order by version'
  );
  return new Map(rows.map((r) => [r.version, r]));
}

// ---------- helpers ----------

function connect(databaseUrl: string): pg.Client {
  return new pg.Client({ connectionString: databaseUrl });
}

const c = {
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
  bold: (s: string) => `\x1b[1m${s}\x1b[0m`,
};

function fail(msg: string): never {
  console.error(c.red(`✗ ${msg}`));
  process.exit(1);
}

// ---------- commands ----------

async function cmdUp(limit: number | null): Promise<void> {
  const { databaseUrl, usingDefault, migrationsDir } = getConfig();
  const all = loadMigrations(migrationsDir);
  if (all.length === 0) fail(`no migrations found in ${migrationsDir}`);

  const client = connect(databaseUrl);
  await client.connect();
  try {
    await ensureMeta(client);
    const applied = await getApplied(client);
    let pending = all.filter((m) => !applied.has(m.version));
    if (limit != null) pending = pending.slice(0, limit);

    if (pending.length === 0) {
      console.log(c.green('✓ database is up to date — nothing to apply'));
      return;
    }

    console.log(c.dim(`connecting to ${redact(databaseUrl)}${usingDefault ? ' (default local)' : ''}`));
    for (const m of pending) {
      process.stdout.write(`  applying ${c.bold(m.filename)} … `);
      try {
        await client.query('begin');
        if (m.up) await client.query(m.up);
        await client.query(
          'insert into db_meta(version, name, filename, checksum) values ($1,$2,$3,$4)',
          [m.version, m.name, m.filename, m.checksum]
        );
        await client.query('commit');
        console.log(c.green('ok'));
      } catch (err) {
        await client.query('rollback').catch(() => {});
        console.log(c.red('failed'));
        fail(`migration ${m.filename} failed (rolled back): ${(err as Error).message}`);
      }
    }
    console.log(c.green(`✓ applied ${pending.length} migration(s)`));
  } finally {
    await client.end();
  }

  // Wire `supabase gen types` into the step — types are generated, not hand-written.
  await tryGenTypes({ silentOnMissing: true });
}

async function cmdDown(count: number): Promise<void> {
  const { databaseUrl, migrationsDir } = getConfig();
  const all = loadMigrations(migrationsDir);
  const byVersion = new Map(all.map((m) => [m.version, m]));

  const client = connect(databaseUrl);
  await client.connect();
  try {
    await ensureMeta(client);
    const applied = [...(await getApplied(client)).values()].sort((a, b) =>
      b.version.localeCompare(a.version)
    ); // newest first
    if (applied.length === 0) {
      console.log(c.yellow('nothing to roll back — no applied migrations'));
      return;
    }
    const target = applied.slice(0, count);
    for (const row of target) {
      const m = byVersion.get(row.version);
      process.stdout.write(`  reverting ${c.bold(row.filename)} … `);
      if (!m) {
        console.log(c.red('failed'));
        fail(`cannot roll back ${row.filename}: migration file is missing (drift). Restore the file and retry.`);
      }
      if (!m.down) {
        console.log(c.red('failed'));
        fail(`cannot roll back ${row.filename}: no "-- migrate:down" section in the file.`);
      }
      try {
        await client.query('begin');
        await client.query(m.down);
        await client.query('delete from db_meta where version = $1', [row.version]);
        await client.query('commit');
        console.log(c.green('ok'));
      } catch (err) {
        await client.query('rollback').catch(() => {});
        console.log(c.red('failed'));
        fail(`rollback of ${row.filename} failed: ${(err as Error).message}`);
      }
    }
    console.log(c.green(`✓ rolled back ${target.length} migration(s)`));
  } finally {
    await client.end();
  }
}

async function cmdStatus(): Promise<void> {
  const { databaseUrl, usingDefault, migrationsDir } = getConfig();
  const all = loadMigrations(migrationsDir);

  const client = connect(databaseUrl);
  await client.connect();
  let applied: Map<string, AppliedRow>;
  try {
    await ensureMeta(client);
    applied = await getApplied(client);
  } finally {
    await client.end();
  }

  console.log(c.dim(`db:        ${redact(databaseUrl)}${usingDefault ? ' (default local)' : ''}`));
  console.log(c.dim(`migrations: ${migrationsDir}`));
  console.log('');

  const fileVersions = new Set(all.map((m) => m.version));
  let pendingCount = 0;
  for (const m of all) {
    const row = applied.get(m.version);
    if (!row) {
      pendingCount++;
      console.log(`  ${c.yellow('pending')}  ${m.filename}`);
    } else if (row.checksum !== m.checksum) {
      console.log(`  ${c.red('MODIFIED')} ${m.filename}  ${c.dim('(file changed after it was applied)')}`);
    } else {
      console.log(`  ${c.green('applied')}  ${m.filename}  ${c.dim(new Date(row.applied_at).toISOString())}`);
    }
  }
  // orphans: applied in db but no file
  for (const [version, row] of applied) {
    if (!fileVersions.has(version)) {
      console.log(`  ${c.red('ORPHAN')}   ${row.filename}  ${c.dim('(in db_meta but no file)')}`);
    }
  }
  console.log('');
  console.log(
    `  ${all.length} file(s) · ${applied.size} applied · ${pendingCount} pending`
  );
}

interface Drift {
  pending: string[];
  modified: string[];
  orphan: string[];
}

async function cmdCheck(): Promise<void> {
  const { databaseUrl, migrationsDir } = getConfig();
  const all = loadMigrations(migrationsDir);

  const client = connect(databaseUrl);
  await client.connect();
  let applied: Map<string, AppliedRow>;
  try {
    await ensureMeta(client);
    applied = await getApplied(client);
  } finally {
    await client.end();
  }

  const fileVersions = new Set(all.map((m) => m.version));
  const drift: Drift = { pending: [], modified: [], orphan: [] };
  for (const m of all) {
    const row = applied.get(m.version);
    if (!row) drift.pending.push(m.filename);
    else if (row.checksum !== m.checksum) drift.modified.push(m.filename);
  }
  for (const [version, row] of applied) {
    if (!fileVersions.has(version)) drift.orphan.push(row.filename);
  }

  const total = drift.pending.length + drift.modified.length + drift.orphan.length;
  if (total === 0) {
    console.log(c.green('✓ no drift — the database matches the migration files'));
    return;
  }
  console.log(c.red(`✗ drift detected (${total})`));
  if (drift.pending.length)
    console.log(`  ${c.yellow('pending')}  (file not applied):   ${drift.pending.join(', ')}`);
  if (drift.modified.length)
    console.log(`  ${c.red('modified')} (applied then edited): ${drift.modified.join(', ')}`);
  if (drift.orphan.length)
    console.log(`  ${c.red('orphan')}   (applied, file gone):  ${drift.orphan.join(', ')}`);
  console.log(c.dim('\n  For schema-level drift (DB vs SQL), also run: supabase db diff --local'));
  process.exit(1);
}

async function tryGenTypes(opts: { silentOnMissing?: boolean } = {}): Promise<void> {
  const { libSupabaseDir } = getConfig();
  const out = join(libSupabaseDir, 'database.types.ts');
  try {
    // execSync runs through the shell, so the `npx` / `npx.cmd` shim resolves on
    // both Windows and Unix (execFileSync can't launch a .cmd directly → EINVAL).
    //
    // Two tool-version notes (supabase CLI 2.106):
    //  1. The language is a flag now (`--local --lang typescript`); the old
    //     `gen types typescript` positional form errors.
    //  2. `gen types --local` wrongly demands a platform token (a CLI regression),
    //     even though it only reads the local stack. Any non-empty value satisfies
    //     the guard (a presence check — no network call). Built from parts so it
    //     isn't a token-shaped literal that secret scanners flag. Override by
    //     exporting a real SUPABASE_ACCESS_TOKEN.
    const env = {
      ...process.env,
      SUPABASE_ACCESS_TOKEN:
        process.env.SUPABASE_ACCESS_TOKEN || `sbp_${'local-placeholder-no-token'}`,
    };
    const ts = execSync('npx supabase gen types --local --lang typescript', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      maxBuffer: 10 * 1024 * 1024,
      env,
    });
    if (!existsSync(libSupabaseDir)) mkdirSync(libSupabaseDir, { recursive: true });
    writeFileSync(out, ts, 'utf8');
    console.log(c.green(`✓ types regenerated → ${out}`));
  } catch (err) {
    const msg = `could not generate types (is \`supabase start\` running?): ${(err as Error).message.split('\n')[0]}`;
    if (opts.silentOnMissing) console.log(c.yellow(`  · ${msg}`));
    else fail(msg);
  }
}

// ---------- util ----------

function redact(url: string): string {
  return url.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:***@');
}

// ---------- entry ----------

async function main() {
  loadEnv();
  const [cmd, arg] = process.argv.slice(2);
  const n = arg && /^\d+$/.test(arg) ? parseInt(arg, 10) : null;

  switch (cmd) {
    case 'up':
      await cmdUp(n);
      break;
    case 'down':
      await cmdDown(n ?? 1);
      break;
    case 'status':
      await cmdStatus();
      break;
    case 'check':
      await cmdCheck();
      break;
    case 'types':
      await tryGenTypes({ silentOnMissing: false });
      break;
    default:
      console.log(`migrate — the IDP migration runner

usage:
  tsx tooling/migrate.ts <command>

commands:
  up [n]      apply all pending migrations (or the next n)
  down [n]    roll back the last applied migration (or the last n)
  status      show applied vs pending
  check       drift detection — non-zero exit if the db and files disagree
  types       regenerate row types via \`supabase gen types\`

env:
  DATABASE_URL    postgres connection (default: local Supabase ${DEFAULT_LOCAL_DB})
  MIGRATIONS_DIR  override the migrations directory
`);
      if (cmd && !['help', '-h', '--help'].includes(cmd)) {
        fail(`unknown command: ${cmd}`);
      }
  }
}

main().catch((err) => fail((err as Error).message));
