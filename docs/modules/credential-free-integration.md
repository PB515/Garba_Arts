# Module — Credential-Free Development & Code-Free Integration

*Build a site (or tool) to be **provably correct without any production credentials**, so going live is a thin, code-free step. Harvested + generalized from a real build (a scanner that had to ship into a **client-owned** Supabase the team never got keys for until final integration). The big brother of [`adapter-boundary.md`](adapter-boundary.md): that module gives you the per-service seam; this is the whole-app discipline around it.*

## When to use
- The production storage / APIs belong to the **client**, and you only get keys at the end.
- You want `npm test` + a full local run to be **green with zero live keys**.
- You want integration to be **"set env vars + run a migration + flip a switch"** — no code changes, no scramble.

## The principle
> Every external dependency sits behind an **interface** with a **dev stand-in**. One `BACKEND`/env flag is the **only** thing that picks dev stand-in vs real service. The engine never knows the difference.

## The shape (generalized from the real build)

**1. The seam — an interface per dependency.**
```ts
export interface Store {
  readonly kind: 'memory' | 'supabase';
  init(): Promise<void>;
  healthCheck(): Promise<boolean>;
  save(/* … */): Promise<void>;
  read(/* … */): Promise<unknown>;
}
```

**2. Two implementations — a dev stand-in + the real one.**
- Dev stand-in: in-memory store, fixtures, in-process queue — no network, deterministic.
- Real: Supabase / the live API (this module is the only file that imports its SDK — see adapter-boundary).

**3. One factory — the single place that decides.**
```ts
import { env, hasSupabaseCreds } from './env';
export function getStore(): Store {
  if (env.backend === 'supabase') {
    if (!hasSupabaseCreds()) throw new Error('BACKEND=supabase but creds are not set.');
    return createSupabaseStore(env.supabaseUrl!, env.supabaseServiceKey!);
  }
  return new MemoryStore(); // credential-free default
}
```
Call sites only ever touch `getStore()` + the `Store` interface. Switching backends is an **env change, not a code change.**

**4. env via getters (read on access, not at import).**
```ts
export const env = {
  get backend() { return (process.env.BACKEND as 'memory' | 'supabase') || 'memory'; },
  get supabaseUrl() { return process.env.SUPABASE_URL; },
  get supabaseServiceKey() { return process.env.SUPABASE_SERVICE_KEY; },
};
```
Getters matter: a CLI that calls `process.loadEnvFile('.env.local')` *after* importing the engine still gets the values. (Same `loadEnvFile` the migration runner uses.)

## The bar — "everything working" with zero keys
- [ ] `npm test` green: every dependency's **fallback path** is tested on fixtures.
- [ ] A full local run writes to the **dev store** and assembles the real output.
- [ ] The dev queue/worker drains exactly as the real one will.
- [ ] The **real SQL migration** is validated separately (local Supabase via `npm run db:start`, or a throwaway non-prod project) — not first-run-in-prod.

## Integration — the ONLY steps that touch prod (code-free)
1. Set env vars in the host(s): all keys.
2. Run the migration (see the namespaced-client-DB section in [`../runbooks/migrations.md`](../runbooks/migrations.md) if it's the client's existing DB).
3. Enable any required DB extensions (admin).
4. **Flip `BACKEND=supabase`**, deploy.
5. Smoke test on the deployed URL.

No code changes in steps 1–5 — that's the whole point.

## Relationship to the rest of the IDP
- `adapter-boundary.md` — the per-service interface + env-driven factory (payments/shipping). This module generalizes that to **every** dependency + adds the dev-stand-in, fixtures, and the code-free integration checklist.
- The 4-client Supabase split (`lib/supabase/`) is already a seam; the service-role client is the "real" impl a dev stand-in mirrors.
- Fixtures + fallback tests pair with the verify harness (`tooling/verify`).
