# Runbooks

*Operational guides for the costliest detours the four builds hit. Built in Slice 3.*

| Runbook | Covers |
|---|---|
| [`deploy.md`](deploy.md) | The deploy + smoke-test phase end to end: pre-flight (`env:validate` · `deploy:check` · `build` · `db:check`), deploy mechanics, content/compliance, the live-URL smoke test, soft vs full launch. |
| [`secrets.md`](secrets.md) | Never paste in chat; rotate on exposure; `NEXT_PUBLIC_` = browser; service-role is server-only crown jewels; the naming convention; what to do on a leak. |
| [`migrations.md`](migrations.md) | Using `tooling/migrate`; the file format; never edit an applied migration; `db:check` as a CI gate; drift recovery. |
| [`platform-constraints.md`](platform-constraints.md) | Vercel 4.5 MB body limit → browser→Storage upload; production alias vs deployment-hash URLs; stale dev CSS; `.next` build-vs-dev corruption; email domain verification; Supabase key rename. |
| [`free-tier-uptime.md`](free-tier-uptime.md) | Free Supabase pauses after 7 days idle → outage. The shipped keep-alive (migration + `/api/health` + daily GitHub cron) + the better options (Neon auto-resume / Pro / VPS). |

Tooling that backs these: `tooling/env-validate` and `tooling/deploy-check` (Slice 3), `tooling/migrate` (Slice 1).
