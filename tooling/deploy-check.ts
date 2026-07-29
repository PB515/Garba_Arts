#!/usr/bin/env tsx
/**
 * deploy-check — validate the deploy-readiness manifest before go-live (Slice 3)
 *
 * Going live was the biggest revealed gap in the retros. This gathers the
 * pre-flight gates into one command driven by a manifest (deploy-readiness.json):
 *  - env: required vars present + no secret-shaped public vars (reuses env-validate)
 *  - placeholders: the per-site constants in site.ts are actually replaced
 *  - then prints the manual live-URL smoke test (a human gate, not automatable)
 *
 * Exits non-zero if any automatable gate fails.
 *   tsx tooling/deploy-check.ts
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { validateEnv, parseEnvFile } from './env-validate.ts';

interface Manifest {
  requiredEnv: string[];
  rejectPlaceholders: Record<string, string[]>; // file (relative) → strings that must be gone
  smokeTest: string[];
}

const c = {
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
  bold: (s: string) => `\x1b[1m${s}\x1b[0m`,
};

/** Resolve a path that may sit at the project root or under template/. */
function dual(rel: string): string | null {
  for (const p of [rel, `template/${rel}`]) {
    if (existsSync(resolve(p))) return resolve(p);
  }
  return null;
}

function loadManifest(): { path: string; manifest: Manifest } {
  const path = dual('deploy-readiness.json');
  if (!path) {
    console.error(c.red('✗ no deploy-readiness.json found (project root or template/).'));
    process.exit(1);
  }
  return { path, manifest: JSON.parse(readFileSync(path, 'utf8')) as Manifest };
}

function main() {
  const { path, manifest } = loadManifest();
  console.log(c.dim(`deploy-readiness: ${path}\n`));
  let errors = 0;

  // --- Gate 1: env ---
  console.log(c.bold('1. Environment'));
  const envFile = dual('.env.local');
  if (!envFile) {
    console.log(`   ${c.yellow('warn')}  no local .env.local found — make sure the host's env is set (vars below).`);
    for (const v of manifest.requiredEnv) console.log(c.dim(`         · ${v}`));
  } else {
    const env = parseEnvFile(readFileSync(envFile, 'utf8'));
    const findings = validateEnv(env);
    const missing = manifest.requiredEnv.filter((v) => !env[v]?.trim());
    for (const v of missing) {
      console.log(`   ${c.red('error')} required var ${v} is missing`);
      errors++;
    }
    for (const f of findings.filter((x) => x.level === 'error')) {
      console.log(`   ${c.red('error')} ${f.varName} ${f.message}`);
      errors++;
    }
    if (!missing.length && !findings.some((f) => f.level === 'error'))
      console.log(`   ${c.green('ok')}    required vars present, no secret-shaped public vars`);
  }

  // --- Gate 2: placeholders replaced ---
  console.log(c.bold('\n2. Placeholders replaced'));
  for (const [rel, strings] of Object.entries(manifest.rejectPlaceholders)) {
    const file = dual(rel);
    if (!file) {
      console.log(`   ${c.yellow('warn')}  ${rel} not found — skipped`);
      continue;
    }
    const text = readFileSync(file, 'utf8');
    const hits = strings.filter((s) => text.includes(s));
    if (hits.length) {
      console.log(`   ${c.red('error')} ${rel} still contains shipped placeholder(s): ${hits.map((h) => `"${h}"`).join(', ')}`);
      errors += hits.length;
    } else {
      console.log(`   ${c.green('ok')}    ${rel}`);
    }
  }

  // --- Gate 3: manual smoke test (reminder, not automatable) ---
  console.log(c.bold('\n3. Live-URL smoke test ') + c.dim('(run by hand on the DEPLOYED url)'));
  for (const item of manifest.smokeTest) console.log(`   ${c.dim('[ ]')} ${item}`);

  // --- summary ---
  console.log('');
  if (errors === 0) {
    console.log(c.green('✓ automatable gates passed — now do the manual smoke test above, then ship.'));
  } else {
    console.log(c.red(`✗ ${errors} blocker(s) — fix before deploying.`));
    process.exit(1);
  }
}

main();
