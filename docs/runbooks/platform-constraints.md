# Runbook — Platform Constraints

*The platform quirks that cost real time across the builds. Know them before they bite.*

## Vercel request body limit (4.5 MB)

Serverless functions cap the request body at **4.5 MB**. A file upload routed through your API will fail above that.

- **Fix:** upload **browser → Supabase Storage directly** (signed URL / client upload), then send only the resulting file path/URL to your API. Never stream large files through a Route Handler.

## Production alias vs deployment-hash URLs

Every deploy gets a unique hash URL (`my-site-abc123.vercel.app`). These are **per-deploy and change every push**.

- **Share the production alias** (your stable domain or the project's production URL), never a deployment-hash URL — a hash URL goes stale the next deploy and breaks links you sent out.
- `lib/site.ts` `url` must be the production alias; canonical/sitemap/OG depend on it.

## Stale dev CSS

Tailwind/Next dev sometimes serves **stale CSS** after a token or config change — the change is in the file but not on screen.

- **Fix:** stop and restart the dev server. If it persists, delete `.next/` and restart.

## `.next` build-vs-dev corruption

Running `next build` (production) and `next dev` against the same `.next/` directory can leave it in a **corrupt mixed state** — strange runtime errors that don't match your code. *(Hit on the Bugadi build.)*

- **Fix:** `rm -rf .next` (PowerShell: `Remove-Item -Recurse -Force .next`) and restart. Prefer not to interleave `build` and `dev` in the same session; if you must, clean `.next` between them.

## Email deliverability

A fresh email provider only delivers to **your own address** until you **verify a sending domain**. Test "the form sends mail" on the *deployed* site to a *different* address before launch.

## Supabase key rename

Providers rename things. Supabase has both legacy JWT keys (`eyJ…` anon / service_role) and newer `sb_publishable_` / `sb_secret_` keys. `env-validate` accepts both prefixes — but verify which your project uses; don't trust memory (Safety Rail 4).
