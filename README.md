# Website IDP

*A base starter repo for producing deployable websites via vibe coding. You **clone it per site**: the generic ~80% (scaffold, patterns, tooling, conventions) is already here; you edit only the per-site ~20% (Brief, brand, tokens, products, business logic).*

This IDP is the distillation of four real, shipped builds — **Bugadi.co** (e-commerce + OMS), the **Purven** portfolio (personal brand + CMS), the **Patel CA** site (marketing + client portal), and **Inspire Academy** (marketing + ops + parent portal) — and their retrospectives. Every component traces to a concrete, repeated pain across those builds.

It is built using its own method, so it carries its own `CLAUDE.md` and build log like any project it produces.

---

## Where to start

- **New here / need to explain what this is?** → [`docs/what-is-the-idp.md`](docs/what-is-the-idp.md) — the plain-language explainer + pitch.
- **Using the IDP to build a site?** → [`docs/idp-usage-guide.md`](docs/idp-usage-guide.md) — the end-to-end workflow, one page.
- **Building/extending the IDP itself?** → [`CLAUDE.md`](CLAUDE.md) (context anchor) + [`docs/idp-build-charter.md`](docs/idp-build-charter.md) (the build spec & slice order).
- **What's planned / deferred?** → [`BACKLOG.md`](BACKLOG.md) (the v5 ledger).

---

## Structure

```
website-idp/
├── docs/                  the brain: method, conventions, prompts, golden paths, runbooks
│   ├── playbook.md · sop.md · comprehensive-guide.md · conventions.md
│   ├── doc-gen-master.md  generates per-site docs 01–11 from Brief + research
│   ├── prompts/           business-brief · deep-research (business / personal-brand) · image-gen
│   ├── modules/           reusable capabilities (billing-gst; pwa & anti-ai-look pending)
│   ├── golden-paths/      per-type recipes (ecommerce · portal · portfolio · marketing) — Tier 2
│   ├── runbooks/          deploy · secrets · migrations · platform-constraints — Slice 3
│   └── retros/            the four build retrospectives (evidence; 2 of 4 present)
├── .claude/skills/        frontend-design · taste-skill · motion · INDEX.md
├── template/              the pre-built generic 80% — cloned & customised per site
│   ├── app/               Next.js App Router scaffold            (Slice 2/5)
│   ├── lib/               site.ts · supabase split · patterns · integrations   (Slice 2)
│   ├── db/migrations/     versioned SQL + applied-state          (Slice 1)
│   ├── tests/             unit tests for risky pure logic         (Slice 4)
│   └── CLAUDE.md.template the per-site context-anchor shape
├── tooling/               migrate · verify · env-validate · deploy-check · ai-tell-lint
├── README.md · CHANGELOG.md · BACKLOG.md
└── CLAUDE.md              the IDP project's own context anchor
```

**IDP-level vs per-site.** Everything in `docs/`, `.claude/skills/`, `tooling/`, and the `template/` *shapes* is IDP-level (shared, ships in the starter). The *filled* per-site artifacts — the 01–11 docs, the build log, the live `CLAUDE.md`, the tokens, `lib/site.ts` values — are generated/edited when you clone for a build and live in that site's repo.

---

## Build status

Built in slices, each verified before the next (see the charter §5). Current state lives in [`CLAUDE.md`](CLAUDE.md).

- **Slice 0 — Skeleton** ✅ structure scaffolded, toolkit docs in place, anchor + backlog written.
- Slices 1–5 — pending (migration runner → patterns/lib → deploy/ops → verify harness → visual layer).

---

## Principles (held the whole build)

1. **Build less.** A lean IDP beats a bloated one. When unsure, don't.
2. **Demand-driven only.** Every component traces to a concrete, repeated pain. No speculative tooling.
3. **Visual identity is required per site, never a default.** `globals.css` ships required-to-customise — the anti-sameness rule.
4. **Brief + research stay the per-site core.** The IDP makes everything *around* them faster.
5. **Documents are the thinking; tooling executes.**
