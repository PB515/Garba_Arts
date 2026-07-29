#!/usr/bin/env tsx
/**
 * doctor — checks a machine has what the IDP needs, on any OS (Slice: portability)
 *
 *   npm run doctor
 *
 * Verifies Node version, npm, git, Docker (installed + running), and the local
 * Supabase CLI. Prints a clear pass/fail + the next command to run. Pure checks,
 * no mutations.
 */

import { execSync } from 'node:child_process';

const c = {
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
  bold: (s: string) => `\x1b[1m${s}\x1b[0m`,
};

function tryExec(cmd: string): string | null {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return null;
  }
}

interface Check {
  name: string;
  ok: boolean;
  detail: string;
  fix?: string;
}

const checks: Check[] = [];

// --- Node >= 20.6 (needed for process.loadEnvFile) ---
{
  const [maj, min] = process.versions.node.split('.').map(Number);
  const ok = maj > 20 || (maj === 20 && min >= 6);
  checks.push({
    name: 'Node.js',
    ok,
    detail: `v${process.versions.node}${ok ? '' : ' (need >= 20.6)'}`,
    fix: ok ? undefined : 'install Node 20.6+ (see .nvmrc) — https://nodejs.org',
  });
}

// --- npm ---
{
  const v = tryExec('npm --version');
  checks.push({ name: 'npm', ok: !!v, detail: v ?? 'not found', fix: v ? undefined : 'comes with Node' });
}

// --- git ---
{
  const v = tryExec('git --version');
  checks.push({
    name: 'git',
    ok: !!v,
    detail: v ?? 'not found',
    fix: v ? undefined : 'install git — https://git-scm.com (used to move the repo between machines)',
  });
}

// --- Docker installed + running (needed for local Supabase) ---
{
  const version = tryExec('docker --version');
  if (!version) {
    checks.push({
      name: 'Docker',
      ok: false,
      detail: 'not found',
      fix: 'install Docker Desktop — https://www.docker.com/products/docker-desktop (required for `npm run db:start`)',
    });
  } else {
    const running = tryExec('docker info --format "{{.ServerVersion}}"');
    checks.push({
      name: 'Docker',
      ok: !!running,
      detail: running ? `${version.replace('Docker version ', 'v').split(',')[0]} (daemon up)` : `${version} (installed, daemon NOT running)`,
      fix: running ? undefined : 'start Docker Desktop, then re-run `npm run doctor`',
    });
  }
}

// --- supabase CLI (a dev-dependency; present after npm install) ---
{
  const v = tryExec('npx --no-install supabase --version');
  checks.push({
    name: 'supabase CLI',
    ok: !!v,
    detail: v ? `v${v}` : 'not installed',
    fix: v ? undefined : 'run `npm install` (it is a dev-dependency, no global install needed)',
  });
}

// --- report ---
console.log(c.bold('\nIDP doctor — environment check\n'));
let allOk = true;
for (const ch of checks) {
  const mark = ch.ok ? c.green('✓') : c.red('✗');
  console.log(`  ${mark} ${ch.name.padEnd(14)} ${ch.ok ? c.dim(ch.detail) : c.yellow(ch.detail)}`);
  if (!ch.ok && ch.fix) console.log(c.dim(`      → ${ch.fix}`));
  if (!ch.ok) allOk = false;
}

console.log('');
if (allOk) {
  console.log(c.green('✓ all good. Next: ') + 'npm run db:start  →  npm run migrate:up  →  cd template && npm run dev');
} else {
  console.log(c.yellow('Some prerequisites are missing — fix the ✗ items above, then re-run `npm run doctor`.'));
  process.exit(1);
}
