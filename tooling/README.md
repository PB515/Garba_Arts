# tooling/ — the automation

*Node/TypeScript CLIs that automate the mechanics the docs describe. The four retros' #1 ask. **Built across Slices 1–5.** Empty for now.*

| Tool | Does | Slice |
|---|---|---|
| `migrate` | `up` / `status` / `down` + `db:check` drift detection; wires `supabase gen types` | 1 |
| `verify` | service-role client + `seed()` / `snapshot()` / `teardown()` against a non-prod DB | 4 |
| `env-validate` | boot check: no secret-shaped `NEXT_PUBLIC_`, key prefix/length, fail-loud on missing required vars | 3 |
| `deploy-check` | validates the deploy-readiness manifest before go-live | 3 |
| `ai-tell-lint` | em-dash + AI-phrase linter (pre-commit) | 5 |

Run via `node`/`tsx`; no global installs. Supabase is a dev-dependency, called with `npx supabase`.
