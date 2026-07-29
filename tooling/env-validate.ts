#!/usr/bin/env tsx
/**
 * env-validate — boot/pre-deploy env check (Slice 3)
 *
 * Catches the costliest deploy detours from the retros:
 *  - a SECRET shipped in a NEXT_PUBLIC_ var (it would be bundled to the browser)
 *  - a truncated / malformed key (wrong prefix or too short)
 *  - a required var missing
 *
 * Run it before `next build` and in CI. Reads a .env file (default `.env.local`,
 * resolved at the project root or under template/). Exits non-zero on any error.
 *
 *   tsx tooling/env-validate.ts [path-to-env-file]
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

// ---------- schema: the known vars + their rules ----------

export interface EnvVarSpec {
  name: string;
  required?: boolean;
  secret?: boolean;        // must NEVER be NEXT_PUBLIC_
  prefixes?: string[];     // value must start with one of these
  minLength?: number;      // shorter → almost certainly truncated
  note?: string;
}

/** Default schema — matches template/.env.example. Sites extend as needed. */
export const DEFAULT_SCHEMA: EnvVarSpec[] = [
  {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    required: true,
    prefixes: ['http://', 'https://'],
    minLength: 10,
    note: 'public project URL',
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    required: true,
    prefixes: ['eyJ', 'sb_publishable_'],
    minLength: 40,
    note: 'public anon/publishable key',
  },
  {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    required: true,
    secret: true,
    prefixes: ['eyJ', 'sb_secret_'],
    minLength: 40,
    note: 'server-only — bypasses RLS',
  },
  {
    name: 'DATABASE_URL',
    required: false,
    secret: true,
    prefixes: ['postgres://', 'postgresql://'],
    note: 'migrations only',
  },
];

// ---------- findings ----------

export interface Finding {
  level: 'error' | 'warn';
  varName: string;
  message: string;
}

// ---------- secret-shape detection ----------

/** Decode a JWT payload's `role` claim, if the value is a JWT. */
function jwtRole(value: string): string | null {
  const parts = value.split('.');
  if (parts.length !== 3) return null;
  try {
    const json = Buffer.from(parts[1], 'base64url').toString('utf8');
    const payload = JSON.parse(json) as { role?: string };
    return payload.role ?? null;
  } catch {
    return null;
  }
}

const SECRET_NAME_HINTS = /(SERVICE_ROLE|SECRET|PRIVATE|PASSWORD|_SK$|API_KEY)/i;

/** Does this value look like a secret that must not be public? */
export function looksSecret(value: string): string | null {
  if (!value) return null;
  if (jwtRole(value) === 'service_role') return 'a service_role JWT';
  if (value.startsWith('sb_secret_')) return 'a Supabase secret key';
  if (/^sk[-_]/.test(value)) return 'a secret API key (sk_…)';
  if (value.includes('BEGIN') && value.includes('PRIVATE KEY')) return 'a private key';
  return null;
}

// ---------- core validation ----------

export function validateEnv(
  env: Record<string, string>,
  schema: EnvVarSpec[] = DEFAULT_SCHEMA
): Finding[] {
  const findings: Finding[] = [];
  const specByName = new Map(schema.map((s) => [s.name, s]));

  // 1. universal heuristic — scan EVERY public var for a secret-shaped value.
  for (const [name, value] of Object.entries(env)) {
    if (!name.startsWith('NEXT_PUBLIC_')) continue;
    const why = looksSecret(value);
    if (why) {
      findings.push({
        level: 'error',
        varName: name,
        message: `is NEXT_PUBLIC_ but the value is ${why} — it would be shipped to the browser. Move it to a non-public var and rotate it.`,
      });
    }
    if (SECRET_NAME_HINTS.test(name.replace(/^NEXT_PUBLIC_/, ''))) {
      findings.push({
        level: 'error',
        varName: name,
        message: `is named like a secret but marked public (NEXT_PUBLIC_). Public vars are bundled to the browser.`,
      });
    }
  }

  // 2. per-spec checks.
  for (const spec of schema) {
    const raw = env[spec.name];
    const value = raw?.trim() ?? '';

    if (!value) {
      if (spec.required)
        findings.push({ level: 'error', varName: spec.name, message: `is required but missing or empty.` });
      continue;
    }

    if (spec.secret && spec.name.startsWith('NEXT_PUBLIC_')) {
      findings.push({
        level: 'error',
        varName: spec.name,
        message: `is a secret but declared NEXT_PUBLIC_ — never expose it to the browser.`,
      });
    }

    if (spec.prefixes && !spec.prefixes.some((p) => value.startsWith(p))) {
      findings.push({
        level: 'error',
        varName: spec.name,
        message: `has an unexpected format (expected to start with ${spec.prefixes.map((p) => `"${p}"`).join(' or ')}). Wrong key pasted?`,
      });
    }

    if (spec.minLength != null && value.length < spec.minLength) {
      findings.push({
        level: 'error',
        varName: spec.name,
        message: `looks truncated (${value.length} chars, expected ≥ ${spec.minLength}). Re-copy the full key.`,
      });
    }
  }

  return findings;
}

// ---------- env file parsing ----------

export function parseEnvFile(text: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of text.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq === -1) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
      val = val.slice(1, -1);
    out[key] = val;
  }
  return out;
}

function resolveEnvFile(arg?: string): string | null {
  if (arg) return resolve(arg);
  for (const p of ['.env.local', 'template/.env.local', '.env', 'template/.env']) {
    if (existsSync(resolve(p))) return resolve(p);
  }
  return null;
}

// ---------- colours ----------

const c = {
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
};

// ---------- CLI ----------

function main() {
  const arg = process.argv[2];
  const file = resolveEnvFile(arg);
  if (!file) {
    console.error(c.red('✗ no env file found (looked for .env.local). Pass a path, or copy template/.env.example → .env.local.'));
    process.exit(1);
  }
  if (!existsSync(file)) {
    console.error(c.red(`✗ env file not found: ${file}`));
    process.exit(1);
  }

  const env = parseEnvFile(readFileSync(file, 'utf8'));
  console.log(c.dim(`validating ${file}  (${Object.keys(env).length} vars)`));
  const findings = validateEnv(env);

  const errors = findings.filter((f) => f.level === 'error');
  const warns = findings.filter((f) => f.level === 'warn');

  for (const f of findings) {
    const tag = f.level === 'error' ? c.red('error') : c.yellow('warn ');
    console.log(`  ${tag}  ${f.varName} ${f.message}`);
  }

  if (errors.length === 0 && warns.length === 0) {
    console.log(c.green('✓ env looks good — no secret-shaped public vars, all required keys present and well-formed'));
    return;
  }
  console.log('');
  console.log(
    `${errors.length ? c.red(`✗ ${errors.length} error(s)`) : c.green('✓ 0 errors')}` +
      (warns.length ? c.yellow(` · ${warns.length} warning(s)`) : '')
  );
  if (errors.length) process.exit(1);
}

// run only as a CLI (so deploy-check can import validateEnv without side effects)
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('env-validate.ts')) {
  main();
}
