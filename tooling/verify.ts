#!/usr/bin/env tsx
/**
 * verify — non-prod DB test harness (Slice 4)
 *
 * The "verify-then-rollback" rail, as a tool: place real data against a NON-PROD
 * database, assert end-to-end, then leave the DB clean. Exposes the service-role
 * client (bypasses RLS) plus seed / snapshot / teardown, importable from scripts
 * and integration tests.
 *
 *   tsx tooling/verify.ts selftest    # seed → assert → teardown, prove it's clean
 *
 * SAFETY: this TRUNCATEs tables. It refuses any DATABASE_URL that isn't local /
 * obviously non-prod. Never point it at production.
 */

import pg from 'pg';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_LOCAL_DB = 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';

function loadEnv(): void {
  for (const f of ['.env.local', '.env', 'template/.env.local']) {
    try {
      process.loadEnvFile(f);
    } catch {
      /* absent — fine */
    }
  }
}

export function databaseUrl(): string {
  return process.env.DATABASE_URL?.trim() || DEFAULT_LOCAL_DB;
}

/** Refuse anything that isn't clearly a local / non-prod database. */
export function assertNonProd(url: string): void {
  const isLocal = /(localhost|127\.0\.0\.1|::1)/.test(url);
  const looksRemote = /(supabase\.co|amazonaws\.com|neon\.tech|render\.com|\.cloud)/i.test(url);
  if (!isLocal || looksRemote) {
    throw new Error(
      `verify refuses DATABASE_URL "${redact(url)}" — it must be a local/non-prod DB (it TRUNCATEs tables).`
    );
  }
}

export async function connect(): Promise<pg.Client> {
  const url = databaseUrl();
  assertNonProd(url);
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  return client;
}

/** The service-role Supabase client — bypasses RLS. For app-level seeding in tests. */
export function serviceClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key)
    throw new Error('serviceClient() needs NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in env');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

/** Insert rows into a table (parameterized). */
export async function seed(
  client: pg.Client,
  table: string,
  rows: Record<string, unknown>[]
): Promise<void> {
  for (const row of rows) {
    const cols = Object.keys(row);
    if (!cols.length) continue;
    const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');
    await client.query(
      `insert into ${ident(table)} (${cols.map(ident).join(', ')}) values (${placeholders})`,
      Object.values(row)
    );
  }
}

/** Row counts per table — for before/after comparison. */
export async function snapshot(client: pg.Client, tables: string[]): Promise<Record<string, number>> {
  const out: Record<string, number> = {};
  for (const t of tables) {
    const { rows } = await client.query<{ n: number }>(`select count(*)::int as n from ${ident(t)}`);
    out[t] = rows[0].n;
  }
  return out;
}

/** Truncate the given tables, leaving them empty and identity counters reset. */
export async function teardown(client: pg.Client, tables: string[]): Promise<void> {
  if (!tables.length) return;
  await client.query(`truncate ${tables.map(ident).join(', ')} restart identity cascade`);
}

// ---------- util ----------

function ident(name: string): string {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) throw new Error(`unsafe SQL identifier: ${name}`);
  return `"${name}"`;
}

function redact(url: string): string {
  return url.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:***@');
}

const c = {
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
};

function assert(cond: boolean, msg: string): void {
  if (!cond) throw new Error(msg);
}

// ---------- selftest ----------

async function selftest(): Promise<void> {
  loadEnv();
  console.log(c.dim(`harness DB: ${redact(databaseUrl())}`));
  const probe = 'example_widget'; // created by migration 0001
  const client = await connect();
  try {
    const before = await snapshot(client, [probe]);
    await seed(client, probe, [
      { name: 'verify-harness-probe-1' },
      { name: 'verify-harness-probe-2' },
    ]);
    const seeded = await snapshot(client, [probe]);
    assert(seeded[probe] === before[probe] + 2, `seed should add 2 rows (was ${before[probe]}, now ${seeded[probe]})`);

    await teardown(client, [probe]);
    const after = await snapshot(client, [probe]);
    assert(after[probe] === 0, `teardown should leave ${probe} clean (got ${after[probe]})`);

    console.log(
      c.green(`✓ harness ok: snapshot ${before[probe]} → seed +2 = ${seeded[probe]} → teardown → ${after[probe]} (clean)`)
    );
  } finally {
    await client.end();
  }
}

// ---------- entry ----------

const cmd = process.argv[2];
if (cmd === 'selftest') {
  selftest().catch((err) => {
    console.error(c.red(`✗ ${(err as Error).message}`));
    process.exit(1);
  });
} else if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('verify.ts')) {
  console.log(`verify — non-prod DB test harness

usage:
  tsx tooling/verify.ts selftest    seed → assert → teardown against the local DB

exports (import from scripts/tests):
  connect() · serviceClient() · seed() · snapshot() · teardown() · assertNonProd()`);
}
