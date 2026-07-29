# Conventions — the frozen rules

*The non-negotiable rules every site built from this IDP follows. Extracted from the Playbook's **Safety Rails (PART 4)** and the charter's **proven core (§4)** — the rules that were validated across all four builds (Bugadi, Purven, Patel CA, Inspire Academy) and are not up for re-litigation per project. A per-site `CLAUDE.md` points its "Conventions" and "Decisions made — do not revisit" sections here.*

*This is a derived document: the Playbook is the source of truth. If a rule here ever drifts from the Playbook, the Playbook wins — fix this file.*

---

## The eight safety rails (non-negotiable, all proven)

1. **Git, per phase, no exceptions.** Commit after every QA checkpoint; one branch per phase, merge when green. This is your rollback when the AI confidently breaks something.
2. **Never let the AI hold secrets.** API keys, DB passwords, email keys live in a gitignored `.env.local` *you* fill in a text editor — never pasted into a prompt or chat, never hardcoded. The agent refers to them by name only. A secret shown even in a screenshot is exposed → rotate it immediately.
3. **Run the dev server in its own terminal.** A dedicated terminal runs the dev server while the agent works in another, or they fight over the port.
4. **Verify current tool facts; don't trust the AI's memory.** Key formats, install commands, framework versions, region names change. Check official docs for anything version-sensitive before relying on it.
5. **One dependency rule.** The agent may not **add** *or* **upgrade** packages without explicit permission — no `npm update`, no editing `package.json` version numbers. Dependency management is human-controlled.
6. **Prefer small, modular components** *(guidance, not a hard line-count)*. If a component does two distinct jobs, split it. No rigid line limit — it's a judgement, not a tripwire.
7. **Changing a frozen doc is a deliberate, logged action.** When reality forces a spec change, update the doc *first*, commit it *separately* with a clear message, *then* build. Never change spec and code in the same breath.
8. **Features with a runtime dependency need a planned fallback.** For anything that fetches live (DB query, API, feed, auth check), decide its off-happy-path behaviour *when you spec it*: a **loading** state with a timeout (never an endless spinner), an **empty** state, and a **failed** state showing cached/last-known data or a calm short message. The accuracy-critical part must render even if a secondary part fails or JS is blocked.

Plus the two craft rails:

- **The domain expert reviews domain logic.** If the site advises or computes anything consequential (health, legal, financial, safety), the expert reviews that logic before launch, kept in one editable config file and framed as indicative, not definitive.
- **The skills library is copied into each build, never shared globally.** Maintain only the master in this IDP; every new project copies the *current* master into its `.claude/skills/`; never patch a project's copy in place. Each delivered site stays pinned to the skills it shipped with.

---

## Convention defaults (the per-site `CLAUDE.md` Conventions line)

- **Tokens only — no hardcoded hex.** All colour/type/spacing comes from `globals.css` tokens. The defaults ship *required-to-customise*; keeping them is how you get the AI-made look. Set the tokens **before** building any UI (see [`modules/anti-ai-look.md`](modules/anti-ai-look.md)).
- **The CTA/accent needs its own AA-passing shade.** Ship `--accent` + `--accent-foreground` as a pair and verify ≥ 4.5:1 contrast before launch — a brand colour that works as a background can fail as a button (v5 #6, Purven).
- **Secrets in `.env.local` only**, never in code, never in chat (rail 2).
- **No new dependencies without asking** (rail 5).
- **Naming & folders** follow the `template/` structure; brand/contact constants live in `lib/site.ts`, edited once per site.
- **Polish bar (Phase 5), made explicit because the AI skips it:** responsive to 360px, real empty/error states, SEO (title/meta/OG/schema), accessibility (alt text, focus, contrast, keyboard), performance (image sizes, bundle), analytics + privacy page.
- **Log token/cost per phase.** Run `/cost` (or your client's equivalent) at the end of each working session and add a row to the IDP's `docs/metrics/token-usage.md` — no tool can recover this after the fact, and it's the only way to eventually know whether the IDP actually saves tokens per site, versus assuming it does.

---

## The proven inner loop & build order (charter §4)

- **Security-first ordering** (for authenticated apps): auth → enable RLS / access rules → **prove logged-out / cross-user denial** → *then* features. Deny by default, allow on purpose. The cross-user denial test is a non-negotiable gate before any feature that shows user data.
- **Phase → green build → commit → push → deploy** is the inner loop; one branch per phase; always shippable. Run `npm run build` (production build) locally before every push — not just `npm run dev`.
- **Adapter boundaries** for every external service (payments / shipping / social) — the integration lives behind a stub interface so pivots stay trivial.
- **Verify-then-rollback** — place real data, verify end-to-end, script a clean teardown.
- **Bucket → slice decomposition** is the default unit of work.

---

## The context anchor (the highest-value artifact in every retro)

Every site carries a `CLAUDE.md` in its repo root with: **Current Status** · **Decisions made — do not revisit** · the **Build Log**. It survived mid-build context compactions with near-zero loss in every build. The shape ships as `template/CLAUDE.md.template`.
