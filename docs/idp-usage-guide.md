# How to Use the IDP — Building a New Website

*A one-page reference for the day-to-day workflow. The IDP is the factory; each website is a clone you customise. You build the IDP once; you run this process once per site.*

---

## The mental model: two repos, never one

| | What it is | You touch it… |
|---|---|---|
| **The IDP** (`IDP_Web/`) | The master starter — the factory. Holds the toolkit, prompts, skills, template, tooling. | …only to **improve the factory** (e.g. fold in a retro learning). Never shipped. |
| **A site repo** (`acme-bakery/`) | A **copy** of the IDP, customised into one real website. | …for **every new site**. This is what gets deployed. |

**The one rule that scales to 1000 sites:** edit only the master IDP. Every new site is a frozen copy, pinned to the patterns/skills it shipped with. Improving the IDP later never disturbs a site already handed off.

---

## What ships inside every copy (the generic ~80%)

When you copy `IDP_Web/`, all of this comes along, pre-built:

- `docs/` — the toolkit brain: playbook · sop · conventions · **the prompts** (business-brief, deep-research, doc-gen-master)
- `.claude/skills/` — frontend-design · taste-skill · motion (the agent auto-uses them)
- `template/` — Next.js scaffold · `lib/` (Supabase split, patterns, `site.ts`) · `globals.css` token mechanism
- `tooling/` — migrate · verify · env-validate · deploy-check · ai-tell-lint
- `CLAUDE.md` — the context anchor the agent reads first

**So the prompts and toolkit live *inside* every copy — never somewhere separate you fetch.**

---

## The process — step by step

Legend: 📁 = where the artifact lives · ▶ = the prompt that drives it

| # | Step | Action | Artifact |
|---|------|--------|----------|
| **0** | **Clone & connect** | Copy `IDP_Web/` → `acme-bakery/`. Open in Claude Code — it reads `CLAUDE.md` and knows the method. | — |
| **1** | **Business Brief** | ▶ `docs/prompts/business-brief.md` — answer who the client is, what they sell, tone, goals. | 📁 `acme-bakery/docs/business-brief.md` |
| **2** | **Deep Research** | ▶ `deep-research-business.md` (competitor-driven) **or** `deep-research-personal-brand.md` (identity-driven). | 📁 `acme-bakery/docs/deep-research-report.md` |
| **3** | **Generate the spec** | ▶ `docs/prompts/doc-gen-master.md` — takes Playbook + Brief + Research, writes docs 01–11 (PRD, data model, site map, design system, content, analytics…). | 📁 `acme-bakery/docs/01-…11-…` |
| **4** | **Visual identity** *(required)* | Fill `globals.css` tokens (real colors/fonts/spacing) + `lib/site.ts` (brand, contact). Defaults ship **broken on purpose** — you can't skip this. | 📁 `template/app/globals.css`, `lib/site.ts` |
| **5** | **Build in slices** | Loop per phase: **Phase → green build → commit → push → deploy.** DB → `migrate up`. Auth → security-first (auth → RLS → **prove denial** → features). Pre-deploy → `env-validate` + `deploy-check`. On commit → `ai-tell-lint`. Risky logic → `verify` tests. | 📁 site repo |
| **6** | **Deploy + smoke test** | Push to Vercel, run smoke test, share the **production alias** (not the deployment-hash URL). | live site |
| **7** | **Retro feeds back** | New gap discovered? Log it in the **master IDP's `BACKLOG.md`** (the v5 backlog) so the next clone is better. | 📁 `IDP_Web/BACKLOG.md` |

---

## In one line

> **Copy the IDP → fill Brief + Research → `doc-gen-master` writes the spec → set your tokens → build the slices with the tooling → deploy.**
> The prompts and toolkit ride along inside every copy; only the Brief, research, docs, tokens, and logic are yours to fill per site.

---

## Why each site comes out unique (not a copy)

- **Tokens ship broken on purpose** → you *must* set your own brand identity (Step 4). Keeping defaults = the AI-made look, which the IDP makes impossible to ship.
- **Brief + Research are per-site** → different positioning, content, and structure every time.
- **`ai-tell-lint`** strips the mechanical tells (em-dashes, AI-phrases) on every commit.
- Same plumbing, completely different skin + content + logic.
