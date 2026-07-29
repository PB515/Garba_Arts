# Runbook — Secrets

*Real secret-exposure incidents happened on three builds. This is non-negotiable (Safety Rail 2).*

## The rules

1. **Secrets live in a gitignored `.env.local` you fill in a text editor.** Never paste a key into a prompt, chat, or commit. The agent reads them from disk and refers to them by name only.
2. **A secret shown even in a screenshot is exposed → rotate it immediately.** Don't reason about whether it leaked; rotate.
3. **The service-role key is the crown jewels.** It bypasses every RLS policy. It is server-only — it goes in `lib/supabase/service-role.ts` (which `import 'server-only'` so it can't be bundled to the browser), never in client code, never in a `NEXT_PUBLIC_` var.
4. **`NEXT_PUBLIC_` = shipped to the browser.** Anything with that prefix is public. Only the URL and the anon/publishable key belong there. If you're unsure, it's not public.

## Naming convention

| Var | Public? | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | yes | safe |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | anon/publishable — RLS still applies |
| `SUPABASE_SERVICE_ROLE_KEY` | **NO** | bypasses RLS — server only |
| `DATABASE_URL` | **NO** | migrations only |

## Enforce it

`npm run env:validate` fails the build if a secret-shaped value sits in a `NEXT_PUBLIC_` var, if a key is truncated/malformed, or if a required var is missing. Run it before every deploy and in CI.

## On the host

Add secrets in the host's env settings (marked secret), never in code or the repo. Names must match exactly. After adding/changing, **redeploy** — env changes don't apply to an existing deployment.

## If a key leaks

1. Rotate it at the provider **now** (Supabase → API settings → roll the key; Stripe → roll; etc.).
2. Update `.env.local` and the host env with the new value.
3. Redeploy.
4. Check the provider's logs for use during the exposure window.
