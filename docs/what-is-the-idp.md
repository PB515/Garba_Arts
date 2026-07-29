# What is the IDP?

*The explainer — pick the register for who you're talking to.*

---

## The positioning (say this first)
> **We don't build showpieces. We build sites that *work* — backend-connected, tracked, reliable, customized — that actually generate leads.**

AI commoditized the **frontend**: anyone can prompt a pretty page now. What stayed hard is the **backend that makes it convert** — database connections, auth + security, forms → leads → email, event tracking, the reliability that separates a *machine that generates leads* from a *showpiece that just looks good*. That backend is what clients can't build themselves, and it's exactly what the IDP is built around. **The frontend isn't the product. The backend that makes it convert is the product.**

The goal isn't "a website, fast" — that's a commodity anyone can do. The goal is **production-grade, reliable, and customized to the client — *and* fast.** That combination is the hard part, and it's the whole point.

## One-liner
> A factory for building **production-grade, lead-generating, one-of-a-kind** websites fast: the reliable backend ~80% is pre-built and battle-tested, so effort goes into the craft and the client's story — the part that makes each site unique.

## The 30-second version (the model)
Every website is really three layers: **~80% backend plumbing · ~15% design craft · ~5% the client's actual story.** That 80% is nearly identical on every project (database, auth, payments, deploy, testing), so it's built once, proven on real sites, and **cloned per client**. That frees all the time for the 15% craft and the 5% that's genuinely about *them*. It's not a theme or a template — it standardizes the *plumbing*, never the *look*.

## What it actually does
- Turns "a client wants a website" into a **deployable, production-hardened, visually distinct** site quickly.
- **Pre-solves what's identical every time:** versioned DB migrations, login + per-user security, payments, deploy + secret checks, automated tests.
- Ships a **craft library** (cinematic scroll, 3D, motion — proven components) for the parts that should feel premium.
- Has a **front door** (the discovery skill) that turns a vague client idea into a clear, buildable plan — *what* to build and *how much polish each part earns*.

## How it's different (the three that land)
1. **vs a template / theme** — templates make every site look the same. The IDP does the opposite: it forces a *unique* skin per site. The default styling ships deliberately broken, so you can't accidentally ship a generic "AI-made" look.
2. **vs a framework** — it isn't speculative. Every piece is **distilled from real shipped sites and their post-mortems**. If it didn't fix a real, repeated problem, it isn't in here.
3. **vs "just use AI"** — AI gives you a *one-off* site. The IDP gives you a **repeatable, production-hardened system** that scales across many sites, improves with every build, and survives the real world: migrations, security, uptime, performance — the things a raw AI build quietly gets wrong.

## The analogy (sticky)
> It's the **kitchen, not the meal.** The kitchen — knives, recipes, the proven process — is reused for every meal. Each website is a meal. One clean kitchen, a different dish each time.

## Why it matters now
AI made a basic website a **commodity** — anyone can generate one. So a *working* site is worth almost nothing now. The value moved to two things: doing it **reliably and fast at scale**, and **craft that doesn't look AI-generated**. The IDP is built for exactly that gap — a factory for the commodity 80%, and a craft system for the 20% that makes you stand out.

## Say it differently per listener
- **To a client (lead with benefit):** "You get a custom, professional, fast site quicker and more reliably, because the engineering foundation is already built and proven — so we spend our time on your brand and what makes you different."
- **To a developer (lead with the stack):** "Clone-per-site Next + Supabase starter: a migration runner with drift detection, the 4-client RLS split, deploy/secret guardrails, a verify harness, an anti-AI-look token system, and a registry of proven motion/3D components — each delivered site pinned to what it shipped with."

---

## Under the hood (if they ask "what's actually in it")
- **Tooling:** `migrate` (versioned SQL + drift detection + generated types) · `verify` (seed/snapshot/teardown harness) · `env-validate` + `deploy-check` (no leaked secrets, go-live gate) · `ai-tell-lint` (catches AI-tell copy) · `doctor` (cross-platform setup check).
- **Template (the cloned 80%):** Next.js + the 4-client Supabase split, security helpers, reusable patterns, tested risk-logic (tax/stock/idempotency/invoice), the `globals.css` token mechanism (required-to-customise).
- **Craft (the 15%):** the `elements/` registry of proven motion/3D/scroll components + the Essential/Signature/Flagship tier rubric.
- **Method & docs:** the playbook/SOP/conventions, golden-path recipes per site type, runbooks (deploy, secrets, migrations, free-tier uptime), and the build charter.
- **Portable + owned:** runs on Windows/macOS/Linux, git-distributed, no lock-in (the DB sits behind an interface).

See [`README.md`](../README.md) for the map and [`idp-usage-guide.md`](idp-usage-guide.md) for the build-a-site workflow.
