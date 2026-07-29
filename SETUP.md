# Setup — running the IDP on any machine (Windows · macOS · Linux)

*Everything is Node + npm + Docker, so the IDP runs on all three OSes. The golden rule: **move the code with git, then `npm install` on the new machine** — never copy `node_modules` between machines (its binaries are OS-specific).*

## Prerequisites

| Tool | Why | Get it |
|---|---|---|
| **Node 20.6+** | runs the tooling + the Next.js app | https://nodejs.org (or `nvm use` — see `.nvmrc`) |
| **Docker Desktop** | runs the local Supabase stack | https://www.docker.com/products/docker-desktop |
| **git** | moves the repo between machines | https://git-scm.com |

On **Windows**, run the commands in **PowerShell** (npm scripts) — the only thing needing a POSIX shell is the optional git pre-commit hook, which works in **Git Bash** (bundled with git).

## First run on a new machine

```bash
# 1. get the code (clone is preferred over copying — no node_modules to drag)
git clone <your-repo-url> website-idp
cd website-idp

# 2. install everything (root tooling + the template app) and self-check
npm run setup          # = npm install + template install + doctor

# 3. start the local database (Docker must be running)
npm run db:start       # first run pulls images, a few minutes

# 4. apply migrations + generate types
npm run migrate:up

# 5. run the app
cd template && npm run dev
```

`npm run doctor` checks Node / npm / git / Docker / the Supabase CLI and tells you exactly what's missing.

## Moving an existing IDP to another PC

1. Make sure it's a git repo (`git init` + commit if not), push it.
2. On the new machine: `git clone …`, then `npm run setup`.
3. **Do not** copy `node_modules`, `.next`, or `supabase/.temp` — they're git-ignored and rebuilt by `npm install` / `db:start`.
4. Secrets don't travel: recreate `template/.env.local` from `template/.env.example` (`npm run env:validate` checks it).

## What's portable vs machine-local

- **Portable (committed):** all source, `package.json` + lockfiles, `supabase/config.toml`, docs, skills.
- **Machine-local (git-ignored, rebuilt):** `node_modules/`, `.next/`, `.env.local`, `supabase/.temp/`, `.claude/settings.local.json`.

There are **no hardcoded machine paths** in the code — the tooling resolves everything relative to the project and reads config from env.
