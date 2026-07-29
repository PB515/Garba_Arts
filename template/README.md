# template/ — the cloned-per-site 80%

*This is the pre-built generic scaffold. Cloning the IDP copies this folder; per site you fill the ~20% (tokens, `site.ts`, products, logic). Currently a skeleton — filled across Slices 1–5.*

| Path | What it becomes | Slice |
|---|---|---|
| `app/` | Next.js App Router scaffold (via `create-next-app`, then adapted) | 2 / 5 |
| `app/globals.css` | The **token mechanism** — ships *required-to-customise*, never a default | 5 |
| `lib/` | `site.ts` · `icons.ts` · `security.ts` · Supabase 4-client split · `patterns/` · `integrations/` | 2 |
| `db/migrations/` | Versioned SQL + applied-state, driven by `tooling/migrate` | 1 |
| `tests/` | Unit tests for risky pure logic (tax · ledger · idempotency) | 4 |
| `.env.example` | Required-vars template (added with `lib/`) | 2 |
| `.gitattributes` | `* text=auto eol=lf` (CRLF safety) | 2 |
| `CLAUDE.md.template` | The per-site context-anchor shape ✅ present | 0 |

The Next.js scaffold is intentionally **not** run in Slice 0 — Slice 0 is skeleton + docs only.
